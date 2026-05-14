const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  fileUrl: String,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Work', workSchema);