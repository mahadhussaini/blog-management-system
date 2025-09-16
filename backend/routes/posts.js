const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, authorize, ownerOrAdmin, optionalAuth } = require('../middleware/auth');
const {
  validatePostCreation,
  validatePostUpdate,
  validateObjectId,
  validatePostQuery
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get all posts (public - only published posts)
// @route   GET /api/posts
// @access  Public
router.get('/', validatePostQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'published' };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.author) {
      query.author = req.query.author;
    }

    if (req.query.search) {
      query = {
        ...query,
        $text: { $search: req.query.search }
      };
    }

    // Build sort object
    let sortOptions = {};
    if (req.query.search) {
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      sortOptions[sortField] = sortOrder;
    } else {
      sortOptions = { publishedAt: -1 };
    }

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Post.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get posts by current user
// @route   GET /api/posts/user/my-posts
// @access  Private
router.get('/user/my-posts', protect, validatePostQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { author: req.user._id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    console.log('User posts found:', {
      userId: req.user._id,
      postsCount: posts.length,
      posts: posts.map(p => ({
        id: p._id,
        title: p.title,
        author: p.author,
        status: p.status
      }))
    });

    const total = await Post.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Authors and Admins)
router.post('/', protect, authorize('author', 'admin'), validatePostCreation, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user._id
    };

    const post = await Post.create(postData);

    // Populate author info
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const posts = await Post.getPublished()
      .find({ category: req.params.category })
      .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single post by slug (explicit)
// @route   GET /api/posts/slug/:slug
// @access  Public for published posts, Private for drafts
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug })
      .populate('author', 'username firstName lastName avatar bio')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username firstName lastName avatar' }
      });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.status !== 'published') {
      if (!req.user || (req.user._id.toString() !== post.author._id.toString() && req.user.role !== 'admin')) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
    }

    if (post.status === 'published') {
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      post.views += 1;
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Get post by slug error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Owner or Admin)
router.put('/:id', protect, validatePostUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Check if the parameter is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ObjectId first
      post = await Post.findById(id);
    }

    // If not found by ObjectId or if it's not a valid ObjectId, try to find by slug
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    post = await Post.findByIdAndUpdate(post._id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'username firstName lastName avatar');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public for published posts, Private for drafts
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Check if the parameter is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ObjectId first
      post = await Post.findById(id);
    }

    // If not found by ObjectId or if it's not a valid ObjectId, try to find by slug
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    // If still not found, return 404
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Populate author and comments (handle missing references gracefully)
    try {
      await post.populate('author', 'username firstName lastName avatar bio');
    } catch (populateError) {
      console.log('Warning: Could not populate author for post:', post._id);
      // Set a default author object if populate fails
      post.author = {
        username: 'Unknown Author',
        firstName: '',
        lastName: '',
        avatar: null,
        bio: ''
      };
    }

    try {
      await post.populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      });
    } catch (populateError) {
      console.log('Warning: Could not populate comment authors for post:', post._id);
      // Comments will be empty if populate fails
      post.comments = [];
    }


    // Check if post is published or user is author/admin
    if (post.status !== 'published') {
      // For draft posts, we need to check if user is authenticated and is the author or admin
      if (!req.user) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      
      if (req.user._id.toString() !== post.author._id.toString() && req.user.role !== 'admin') {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
    }

    // Increment view count for published posts
    if (post.status === 'published') {
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      post.views += 1;
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Check if the parameter is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ObjectId first
      post = await Post.findById(id);
    }

    // If not found by ObjectId or if it's not a valid ObjectId, try to find by slug
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Check if the parameter is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ObjectId first
      post = await Post.findById(id);
    }

    // If not found by ObjectId or if it's not a valid ObjectId, try to find by slug
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        likesCount: post.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
