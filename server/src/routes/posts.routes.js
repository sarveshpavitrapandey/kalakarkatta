const express = require('express');
const { createPost, getPosts, updatePost, deletePost, addComment } = require('../controllers/posts.controller');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get all posts (protected to customize feed)
router.get('/', requireAuth, getPosts);

// Create a new post (protected and handles file upload)
router.post('/', requireAuth, upload.single('media'), createPost);

// Edit a post (caption + tags)
router.put('/:id', requireAuth, updatePost);

// Delete a post
router.delete('/:id', requireAuth, deletePost);
// Add a comment
router.post('/:id/comments', requireAuth, addComment);

module.exports = router;

