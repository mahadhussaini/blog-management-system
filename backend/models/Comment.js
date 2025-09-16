const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true // Auto-approve comments for simplicity
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Indexes for better query performance
commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });

// Middleware to handle replies
commentSchema.pre('save', async function(next) {
  if (this.isModified('edited') && this.edited) {
    this.editedAt = new Date();
  }

  // If this is a reply, add it to parent's replies array
  if (this.parentComment && this.isNew) {
    try {
      await mongoose.model('Comment').findByIdAndUpdate(
        this.parentComment,
        { $push: { replies: this._id } }
      );
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Static method to get comments for a post
commentSchema.statics.getByPost = function(postId) {
  return this.find({
    post: postId,
    parentComment: null, // Only top-level comments
    isApproved: true
  })
  .populate('author', 'username firstName lastName avatar')
  .populate({
    path: 'replies',
    populate: {
      path: 'author',
      select: 'username firstName lastName avatar'
    }
  })
  .sort({ createdAt: -1 });
};

// Static method to get recent comments
commentSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isApproved: true })
    .populate('author', 'username firstName lastName')
    .populate('post', 'title slug')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Comment', commentSchema);
