const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  featuredImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
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
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  readingTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Indexes for better query performance
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' }); // Text search

// Generate slug from title before saving
postSchema.pre('save', async function(next) {
  // Generate slug if title is modified and no slug exists, or if it's a new document
  if ((this.isModified('title') && !this.slug) || (this.isNew && !this.slug)) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Ensure slug is unique by appending a number if needed
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingPost = await this.constructor.findOne({ slug });
      if (!existingPost || existingPost._id.toString() === this._id.toString()) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Static method to get published posts
postSchema.statics.getPublished = function() {
  return this.find({ status: 'published' })
    .populate('author', 'username firstName lastName')
    .sort({ publishedAt: -1 });
};

// Static method to search posts
postSchema.statics.search = function(query, limit = 10) {
  return this.find(
    { $text: { $search: query }, status: 'published' },
    { score: { $meta: 'textScore' } }
  )
  .populate('author', 'username firstName lastName')
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Post', postSchema);
