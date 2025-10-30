const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookingSchema = new Schema({
  experience: { type: Schema.Types.ObjectId, ref: 'Experience', required: true },
  slotId: { type: Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // ISO date string 'YYYY-MM-DD' for the booking day
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  promoApplied: { type: String, default: null },
  pricePaid: { type: Number, default: 0 }
});

// Prevent exact duplicates for same experience-slot-date for the same customer (optional)
BookingSchema.index({ experience: 1, slotId: 1, date: 1, customerEmail: 1 }, { unique: false });

module.exports = mongoose.model('Booking', BookingSchema);
