const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { description, eventId, taggedUsernames } = req.body;
    let mediaUrl = '';
    let mediaType = 'image';

    // File uploaded via Multer and Cloudinary
    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary secure_url
      // Cloudinary resource_type can be found in req.file.mimetype or req.file
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else {
      return res.status(400).json({ error: 'Media file is required' });
    }

    let taggedUsers = [];
    if (taggedUsernames) {
      const User = require('../models/User');
      const usernames = taggedUsernames.split(',').map(u => u.trim().replace('@', ''));
      const users = await User.find({ username: { $in: usernames } });
      taggedUsers = users.map(u => u._id);
    }

    const post = await Post.create({
      author: req.user._id,
      mediaUrl,
      mediaType,
      description,
      eventId,
      taggedUsers
    });

    await post.populate('author', 'name email avatar portfolio availabilityStatus');
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all posts (prioritize followers)
const getPosts = async (req, res) => {
  try {
    const User = require('../models/User');
    const currentUser = await User.findById(req.user._id);
    const following = currentUser.following || [];

    let posts = await Post.find()
      .populate('author', 'name username profilePicture avatar portfolio availabilityStatus')
      .populate('eventId')
      .populate('comments.user', 'name username profilePicture')
      .sort({ createdAt: -1 });
      
    // Sort in memory: followers first, then by date
    posts.sort((a, b) => {
      const aIsFollowed = following.includes(a.author._id.toString());
      const bIsFollowed = following.includes(b.author._id.toString());
      
      if (aIsFollowed && !bIsFollowed) return -1;
      if (!aIsFollowed && bIsFollowed) return 1;
      return 0; // if both are followed or neither, keep original date sorting
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a post (caption + tags)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to edit this post' });
    }

    const { description, taggedUsernames } = req.body;

    let taggedUsers = post.taggedUsers;
    if (taggedUsernames !== undefined) {
      const User = require('../models/User');
      if (taggedUsernames === '' || taggedUsernames === null) {
        taggedUsers = [];
      } else {
        const usernames = taggedUsernames.split(',').map(u => u.trim().replace('@', '')).filter(u => u);
        const users = await User.find({ username: { $in: usernames } });
        taggedUsers = users.map(u => u._id);
      }
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { description, taggedUsers },
      { new: true }
    ).populate('taggedUsers', 'username name');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Make sure only the author can delete it
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const comment = {
      user: req.user._id,
      text: req.body.text
    };
    
    post.comments.push(comment);
    await post.save();
    
    // Populate user info for the newly added comment before returning
    await post.populate('comments.user', 'name username profilePicture');
    
    // Emit Notification
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (post.author.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      const notification = new Notification({
        recipient: post.author,
        sender: req.user._id,
        type: 'Comment',
        message: `${req.user.name || 'Someone'} commented on your post.`,
        link: `/feed` // or deep link to post
      });
      await notification.save();
      
      if (io && connectedUsers) {
        const recipientSocket = connectedUsers.get(post.author.toString());
        if (recipientSocket) {
          io.to(recipientSocket).emit('new_notification', notification);
        }
      }
    }
    
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createPost, getPosts, updatePost, deletePost, addComment };
