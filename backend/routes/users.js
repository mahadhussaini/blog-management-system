const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validateUserUpdate } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await User.countDocuments();

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's posts count
    const postsCount = await Post.countDocuments({ author: req.params.id });

    const userData = {
      ...user.toObject(),
      postsCount
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), validateObjectId, validateUserUpdate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
      role: req.body.role,
      isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    // Check if username or email is already taken by another user
    if (fieldsToUpdate.username || fieldsToUpdate.email) {
      const existingUser = await User.findOne({
        $or: [
          fieldsToUpdate.username ? { username: fieldsToUpdate.username } : {},
          fieldsToUpdate.email ? { email: fieldsToUpdate.email } : {}
        ].filter(condition => Object.keys(condition).length > 0),
        _id: { $ne: req.params.id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: existingUser.username === fieldsToUpdate.username
            ? 'Username already taken'
            : 'Email already registered'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Delete user's posts and comments
    await Post.deleteMany({ author: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const authorUsers = await User.countDocuments({ role: 'author' });
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });

    const recentUsers = await User.find()
      .select('username firstName lastName createdAt role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        authorUsers,
        totalPosts,
        publishedPosts,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get authors list (for assigning posts)
// @route   GET /api/users/authors/list
// @access  Private (Admin only)
router.get('/authors/list', protect, authorize('admin'), async (req, res) => {
  try {
    const authors = await User.find({
      role: { $in: ['author', 'admin'] },
      isActive: true
    })
      .select('username firstName lastName _id')
      .sort({ username: 1 });

    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors
    });
  } catch (error) {
    console.error('Get authors list error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
