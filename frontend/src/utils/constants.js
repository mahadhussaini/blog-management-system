// Application constants

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AUTHOR: 'author',
};

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Categories
export const CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Business',
  'Health',
  'Education',
  'Entertainment',
  'Sports',
  'Science',
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Date Published' },
  { value: 'title', label: 'Title' },
  { value: 'views', label: 'Views' },
  { value: 'readingTime', label: 'Reading Time' },
  { value: 'createdAt', label: 'Date Created' },
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 9,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 200,
  MAX_EXCERPT_LENGTH: 300,
  MAX_CATEGORY_LENGTH: 50,
  MAX_TAG_LENGTH: 30,
  MAX_TAGS_COUNT: 10,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,
};

// File Upload (for future use)
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5,
};

// Toast Notifications
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CREATE_POST: '/create-post',
  EDIT_POST: '/edit-post',
  PROFILE: '/profile',
  ADMIN_USERS: '/admin/users',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
};

// Loading Messages
export const LOADING_MESSAGES = {
  SAVING: 'Saving...',
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  UPLOADING: 'Uploading...',
};

// Theme Configuration
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
};

// Time Formats
export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  MEDIUM: 'HH:mm:ss',
  LONG: 'HH:mm:ss a',
};
