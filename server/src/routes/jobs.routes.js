const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/uploadMiddleware');
const logger = require('../utils/logger');

// POST /api/jobs - Create a new job
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const job = new Job({
      ...req.body,
      creator: req.user._id
    });
    await job.save();
    logger.info(`Job created by user ${req.user._id}: ${job._id}`);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/jobs/:id - Delete a job (creator only)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can delete this job.' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs - List open jobs (with optional search/filter)
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'Open' };

    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('creator', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/apply - Apply for a job
router.post('/:id/apply', requireAuth, upload.single('resume'), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'Open') return res.status(400).json({ error: 'Job is no longer open' });

    // Check if user is "Open to Work"
    if (req.user.availabilityStatus !== 'Open to Work') {
      return res.status(403).json({ error: 'You must be marked as "Open to Work" to apply for jobs.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required.' });
    }

    const application = new Application({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeUrl: req.file.path
    });

    await application.save();

    // Create notification for job creator
    try {
      const Notification = require('../models/Notification');
      const notification = new Notification({
        recipient: job.creator,
        sender: req.user._id,
        type: 'JobApp',
        message: `${req.user.name} applied for your job: ${job.title}`,
        link: `/my-jobs` // Or a page to view applications
      });
      await notification.save();

      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      if (io && connectedUsers) {
        const recipientSocket = connectedUsers.get(job.creator.toString());
        if (recipientSocket) {
          io.to(recipientSocket).emit('new_notification', notification);
        }
      }
    } catch (notifErr) {
      logger.error('Failed to create application notification:', notifErr);
    }
    
    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }
    next(error);
  }
});

// GET /api/jobs/:id/applications - Get applications for a job (only creator can see)
router.get('/:id/applications', requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the job creator can view applications.' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'name username profilePicture skills bio portfolio')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
