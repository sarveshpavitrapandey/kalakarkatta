const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true }, // Cloudinary secure_url
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  description: { type: String },
  taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Optional attached event
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
