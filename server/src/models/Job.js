const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship'], default: 'Full-time' },
  internshipDuration: { type: String }, // e.g. "3 months" — only relevant if jobType is Internship
  requiredSkills: [{ type: String }],
  budgetMin: { type: Number },
  budgetMax: { type: Number },
  salaryType: { type: String, enum: ['Monthly', 'Annual', 'Fixed (Project)'], default: 'Monthly' },
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
