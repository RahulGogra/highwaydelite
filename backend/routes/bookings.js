const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Experience = require('../models/Experience');
const Booking = require('../models/Booking');
const Promo = require('../models/Promo');

/*
Booking flow and concurrency safety:

1) Validate incoming request.
2) Start a Mongo session & transaction (if available).
3) Atomically decrement `availableSeats` for the matching Experience slot for a specific date
   (we're using slot.availableSeats as "per-day capacity" simplification).
   If you need per-day varying availability, extend model to track seat counts per day.
4) Create the booking record.
5) Commit transaction.

Fallback: If your Mongo deployment doesn't support transactions (single-node non-replicaset),
the findOneAndUpdate + check modifiedCount provides an atomic update on the Experience document
so it is still safe for concurrent reservations for the same slot.
*/

router.post('/', [
  body('experienceId').isMongoId(),
  body('slotId').isMongoId(),
  body('date').isISO8601().withMessage('date must be YYYY-MM-DD'),
  body('customerName').isString().trim().notEmpty(),
  body('customerEmail').isEmail()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { experienceId, slotId, date, customerName, customerEmail, promoCode } = req.body;

  const session = await mongoose.startSession();
  try {
    let useTransactions = true;
    const transactionOptions = {};

    // NOTE: We pass the session into this function when using transactions
    const transactionFn = async (currentSession) => {
      // 0) Fetch Experience to get the base price
      const experience = await Experience.findById(experienceId).session(currentSession).lean();
      if (!experience) {
        throw { status: 404, message: 'Experience not found' };
      }
      const basePrice = parseFloat(experience.price);
      if (isNaN(basePrice)) {
          throw { status: 500, message: 'Experience price is invalid' };
      }

      // 1) Find and atomically decrement availableSeats for this slot if availableSeats > 0
      const filter = {
        _id: experienceId,
        // Match the experience document
  };

      // **UPDATED:** Use $[] with arrayFilters to target the specific slot by ID
      const update = {
        $inc: { 'slots.$[slotItem].availableSeats': -1 }
      };

      // **NEW:** Define the filter for the array update
      const options = {
          new: true,
          session: currentSession,
          arrayFilters: [
              {
                  'slotItem._id': slotId, // Target the specific slot
                  'slotItem.availableSeats': { $gt: 0 } // Check capacity before decrement
              }
          ]
      };

      const updateRes = await Experience.findOneAndUpdate(filter, update, options);

  if (!updateRes) {
throw { status: 409, message: 'Slot is fully booked or not found' };
}

 // 2) Validate promo and calc price
 let discount = 0;
 if (promoCode) {
 const promo = await Promo.findOne({ code: promoCode.toUpperCase(), active: true }).session(currentSession);
if (!promo) throw { status: 400, message: 'Invalid promo code' };
 if (promo.expiresAt && promo.expiresAt < new Date()) throw { status: 400, message: 'Promo expired' };
 if (promo.type === 'percentage') discount = basePrice * (promo.value / 100);
 else discount = promo.value;
 }
 const pricePaid = Math.max(0, basePrice - discount);

 // 3) Create booking
 const booking = new Booking({
 experience: experienceId,
 slotId,
 date,
 customerName,
 customerEmail,
 promoApplied: promoCode ? promoCode.toUpperCase() : null,
 pricePaid: pricePaid.toFixed(2)
 });

 await booking.save({ session: currentSession });

 return booking;
 };

 // ... (Transaction block using session.withTransaction)
    let booking;
    try {
      await session.withTransaction(async (s) => {
        booking = await transactionFn(s);
      }, transactionOptions);
    } catch (txErr) {
      if (txErr && String(txErr).includes('transactions are not supported')) {
        useTransactions = false;
      } else {
        throw txErr;
      }
    }

 if (!useTransactions && !booking) {
      // === FALLBACK LOGIC (No Transactions) ===

      // 1. Fetch Experience and price *before* decrementing seats
      const experience = await Experience.findById(experienceId).lean();
      if (!experience) return res.status(404).json({ error: 'Experience not found' });
      const basePrice = parseFloat(experience.price);
      if (isNaN(basePrice)) return res.status(500).json({ error: 'Experience price is invalid' });

      // 2. Atomic Seat Decrement (using $[] and arrayFilters for non-transactional safety)
      const filter = { _id: experienceId };
      const update = { $inc: { 'slots.$[slotItem].availableSeats': -1 } };
      
      const options = {
          new: true,
          arrayFilters: [
              {
                  'slotItem._id': slotId, 
                  'slotItem.availableSeats': { $gt: 0 } 
              }
          ]
      };

      const updateRes = await Experience.findOneAndUpdate(filter, update, options);
 if (!updateRes) return res.status(409).json({ error: 'Slot is fully booked or not found' });

 // 3. Compute Price & Promo (with rollback on failure)
 let discount = 0;
 let promoRollbackNeeded = false;
 if (promoCode) {
 const promo = await Promo.findOne({ code: promoCode.toUpperCase(), active: true });
 
 if (!promo) promoRollbackNeeded = true;
else if (promo.expiresAt && promo.expiresAt < new Date()) promoRollbackNeeded = true;

 if (promoRollbackNeeded) {
 // Roll back the seat decrement because promo validation failed
          // Rollback must also use $[] and arrayFilters to target the correct slot
 await Experience.findOneAndUpdate(
              filter,
              { $inc: { 'slots.$[slotItem].availableSeats': +1 } },
              { arrayFilters: [{ 'slotItem._id': slotId }] }
);
return res.status(400).json({ error: 'Invalid or expired promo code' });
}
 if (promo.type === 'percentage') discount = basePrice * (promo.value / 100);
 else discount = promo.value;
 }
 const pricePaid = Math.max(0, basePrice - discount);

 // 4. Create Booking
 const bookingDoc = new Booking({
 experience: experienceId,
 slotId,
 date,
 customerName,
 customerEmail,
 promoApplied: promoCode ? promoCode.toUpperCase() : null,
 pricePaid: pricePaid.toFixed(2)
 });
 await bookingDoc.save();
 booking = bookingDoc;
 }

 res.status(201).json({ data: booking });
} catch (err) {
    if (err && err.status) {
        return res.status(err.status).json({ error: err.message });
    }
    console.error('Unexpected booking error:', err);
 next(err);
 } finally {
 session.endSession();
 }
});

// optional: GET /bookings (list) - quick debug route
router.get('/', async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('experience').lean();
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
