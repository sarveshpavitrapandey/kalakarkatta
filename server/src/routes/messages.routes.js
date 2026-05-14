const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/uploadMiddleware');
const logger = require('../utils/logger');

// GET /api/messages/unread-count - Get total unread messages for user
router.get('/unread-count', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Find all conversations where user is a participant
    const conversations = await Conversation.find({ participants: userId });
    const convIds = conversations.map(c => c._id);
    
    // Count messages in those conversations where sender != user and isRead == false
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: convIds },
      sender: { $ne: userId },
      isRead: false
    });
    
    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages - Get all conversations for a user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'name username profilePicture');
    
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/:otherUserId - Get chat history
router.get('/:otherUserId', requireAuth, async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    // Find conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (!conversation) {
      return res.json([]); // No messages yet
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// PUT /api/messages/read/:otherUserId - Mark messages as read
router.put('/read/:otherUserId', requireAuth, async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (conversation) {
      await Message.updateMany(
        { conversationId: conversation._id, sender: otherUserId, isRead: false },
        { $set: { isRead: true } }
      );
    }
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages - Send a message
router.post('/', requireAuth, upload.single('media'), async (req, res, next) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId && !text && !req.file) {
      return res.status(400).json({ error: 'Recipient and content (text or media) are required.' });
    }

    let mediaUrl = '';
    let mediaType = '';

    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary URL
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId]
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: text || '',
      mediaUrl,
      mediaType,
      isRead: false
    });

    await message.save();
    
    // We populate sender to return clean data to frontend
    await message.populate('sender', 'name username profilePicture');

    logger.info(`Message sent from ${senderId} to ${recipientId}`);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
