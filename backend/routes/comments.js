const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');
const {
  validateCommentCreation,
  validateCommentUpdate,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
router.get('/post/:postId', validateObjectId, async (req, res) => {
  try {
    const comments = await Comment.getByPost(req.params.postId);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
router.post('/', protect, validateCommentCreation, async (req, res) => {
  try {
    const { content, post, parentComment } = req.body;

    // Check if post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // If replying to a comment, check if parent comment exists
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post,
      parentComment
    });

    // Populate author info
    await comment.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Owner only)
router.put('/:id', protect, validateObjectId, validateCommentUpdate, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        edited: true,
        editedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'username firstName lastName avatar');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check ownership or admin role
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    // If comment has replies, delete them too
    await Comment.deleteMany({ parentComment: req.params.id });

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Like/Unlike comment
// @route   PUT /api/comments/:id/like
// @access  Private
router.put('/:id/like', protect, validateObjectId, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const likeIndex = comment.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        likesCount: comment.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get recent comments (for admin dashboard)
// @route   GET /api/comments/recent
// @access  Private (Admin only)
router.get('/recent', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const comments = await Comment.getRecent(limit);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Get recent comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get comment by ID
// @route   GET /api/comments/:id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('post', 'title slug')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
