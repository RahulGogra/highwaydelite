const express = require('express');
const router = express.Router();
const Promo = require('../models/Promo');
const { body, validationResult } = require('express-validator');

// POST /promo/validate
router.post('/validate', [
  body('code').isString().trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { code, cartValue } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), active: true }).lean();

    if (!promo) return res.status(404).json({ valid: false, message: 'Promo not found or inactive' });

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, message: 'Promo expired' });
    }

    if (cartValue && cartValue < (promo.minSpend || 0)) {
      return res.status(400).json({ valid: false, message: `Requires minimum spend of ${promo.minSpend}` });
    }

    // compute discount example
    let discount = 0;
    if (promo.type === 'percentage') discount = (cartValue || 0) * (promo.value / 100);
    else discount = promo.value;

    res.json({ valid: true, code: promo.code, type: promo.type, value: promo.value, discount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
