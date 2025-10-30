const mongoose = require('mongoose');
const { Schema } = mongoose;

/*
 Experience model structure:
  - name, description
  - slots: array of { _id, startTime, endTime, capacity, availableSeats }
  - dateRange or availability could be added later
*/

const SlotSchema = new Schema({
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true },   // e.g. "11:30"
  capacity: { type: Number, required: true, default: 1 },
  availableSeats: { type: Number, required: true, default: 1 }
});

const ExperienceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  price: { type: String },
  imageUrl: { type: String },
  slots: [SlotSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experience', ExperienceSchema);
