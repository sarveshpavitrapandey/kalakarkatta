const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  city: String,
  joinedAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: String,
  date: String,
  location: String,
  description: String,
  price: { type: Number, default: 0 },
  totalSlots: { type: Number, default: 100 },
  availableSlots: { type: Number, default: 100 },
  attendees: [attendeeSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
