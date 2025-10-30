const mongoose = require('mongoose');
const { Schema } = mongoose;

const PromoSchema = new Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage','flat'], required: true },
  value: { type: Number, required: true }, // percentage (e.g. 10) or flat amount (e.g. 100)
  active: { type: Boolean, default: true },
  minSpend: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null }
});

module.exports = mongoose.model('Promo', PromoSchema);
