const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const requireAuth = require('../middleware/requireAuth');
const logger = require('../utils/logger');

// GET /api/notifications - Get all notifications for logged in user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', requireAuth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/read-all - Delete ALL notifications for the user
router.delete('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id - Delete a single notification when user views it
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
