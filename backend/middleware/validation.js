const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  handleValidationErrors
];

// Post validation rules
const validatePostCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  handleValidationErrors
];

const validatePostUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  handleValidationErrors
];

// Comment validation rules
const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content is required and cannot exceed 1000 characters'),
  body('post')
    .isMongoId()
    .withMessage('Valid post ID is required'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Valid parent comment ID is required'),
  handleValidationErrors
];

const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content is required and cannot exceed 1000 characters'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('ID parameter is required')
    .custom((value) => {
      // Check if it's a valid MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(value)) {
        throw new Error('Invalid ID format. Expected a 24-character hexadecimal string.');
      }
      return true;
    }),
  handleValidationErrors
];

// Query validation for posts
const validatePostQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  query('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  query('author')
    .optional()
    .isMongoId()
    .withMessage('Valid author ID is required'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('sort')
    .optional()
    .isIn(['title', 'publishedAt', 'views', 'readingTime', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePostCreation,
  validatePostUpdate,
  validateCommentCreation,
  validateCommentUpdate,
  validateObjectId,
  validatePostQuery
};
