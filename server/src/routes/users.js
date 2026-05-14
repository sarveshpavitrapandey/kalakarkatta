const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/uploadMiddleware');

// create user
router.post('/', async (req, res) => {
  try {
    const u = new User(req.body);
    await u.save();
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// complete onboarding
router.put('/onboarding', requireAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { username, bio, skills, availabilityStatus } = req.body;
    
    // Check if username is taken
    const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another one.' });
    }

    const updateData = {
      username,
      bio,
      availabilityStatus,
      onboardingComplete: true
    };

    if (skills) {
      // skills comes as a comma-separated string from FormData
      updateData.skills = skills.split(',').map(s => s.trim());
    }

    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get users (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ],
        onboardingComplete: true  // only return registered users who completed profile
      };
    }
    const users = await User.find(query).select('name username profilePicture skills availabilityStatus').sort({ createdAt: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get single user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Also fetch their posts
    const Post = require('../models/Post');
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
    
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// follow / unfollow a user
router.put('/:id/follow', requireAuth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUser._id, { $pull: { following: userToFollow._id } });
      await User.findByIdAndUpdate(userToFollow._id, { $pull: { followers: currentUser._id } });
      res.json({ message: 'Unfollowed successfully' });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUser._id, { $push: { following: userToFollow._id } });
      await User.findByIdAndUpdate(userToFollow._id, { $push: { followers: currentUser._id } });
      
      // Emit Notification (Assuming Notification.js exists and io is in app settings)
      const Notification = require('../models/Notification');
      const notification = new Notification({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: 'Follow',
        message: `${currentUser.name} started following you.`,
        link: `/profile/${currentUser._id}`
      });
      await notification.save();

      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      if (io && connectedUsers) {
        const recipientSocket = connectedUsers.get(userToFollow._id.toString());
        if (recipientSocket) {
          io.to(recipientSocket).emit('new_notification', notification);
        }
      }

      res.json({ message: 'Followed successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
