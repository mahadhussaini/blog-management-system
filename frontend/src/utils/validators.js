// Validation utility functions

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateUsername = (username) => {
  const errors = [];

  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 20) {
    errors.push('Username cannot exceed 20 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate post title
 * @param {string} title - Title to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateTitle = (title) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (title && title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate post content
 * @param {string} content - Content to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateContent = (content) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate excerpt length
 * @param {string} excerpt - Excerpt to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateExcerpt = (excerpt) => {
  const errors = [];

  if (excerpt && excerpt.length > 300) {
    errors.push('Excerpt cannot exceed 300 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate category
 * @param {string} category - Category to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateCategory = (category) => {
  const errors = [];

  if (category && category.length > 50) {
    errors.push('Category cannot exceed 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate tag
 * @param {string} tag - Tag to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateTag = (tag) => {
  const errors = [];

  if (tag && tag.length > 30) {
    errors.push('Tag cannot exceed 30 characters');
  }

  if (tag && !/^[a-zA-Z0-9\s]+$/.test(tag)) {
    errors.push('Tag can only contain letters, numbers, and spaces');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize HTML content (basic implementation)
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

/**
 * Calculate reading time for text content
 * @param {string} text - Text content
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {number} - Reading time in minutes
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  if (!text) return 0;

  // Remove HTML tags and count words
  const plainText = text.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
    .format(new Date(date));
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};