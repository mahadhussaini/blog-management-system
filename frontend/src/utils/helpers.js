// Helper utility functions

import { API_BASE_URL } from './constants';

/**
 * Make API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise} - API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // swallow console; rethrow for caller handling
    throw error;
  }
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert camelCase to Title Case
 * @param {string} str - CamelCase string
 * @returns {string} - Title Case string
 */
export const camelToTitle = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sleep function for testing/debugging
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after ms
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if email is valid (simple check)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} - Promise that resolves when copied
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
      document.body.removeChild(textArea);
    });
  }
};

/**
 * Scroll to element smoothly
 * @param {string} selector - CSS selector
 * @param {object} options - Scroll options
 */
export const scrollToElement = (selector, options = {}) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  }
};

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} - Parameter value or null
 */
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

/**
 * Set query parameter in URL
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
export const setQueryParam = (param, value) => {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.pushState({}, '', url);
};

/**
 * Clear all query parameters
 */
export const clearQueryParams = () => {
  const url = new URL(window.location);
  url.search = '';
  window.history.pushState({}, '', url);
};

/**
 * Get current user agent info
 * @returns {object} - User agent information
 */
export const getUserAgent = () => {
  const ua = navigator.userAgent;
  return {
    isMobile: /Mobile|Android|iP(hone|od|ad)/.test(ua),
    isTablet: /Tablet|iPad/.test(ua),
    isDesktop: !/Mobile|Android|iP(hone|od|ad)|Tablet|iPad/.test(ua),
    browser: ua.includes('Chrome') ? 'Chrome' :
             ua.includes('Firefox') ? 'Firefox' :
             ua.includes('Safari') ? 'Safari' :
             ua.includes('Edge') ? 'Edge' : 'Unknown',
    os: ua.includes('Windows') ? 'Windows' :
        ua.includes('Mac') ? 'MacOS' :
        ua.includes('Linux') ? 'Linux' :
        ua.includes('Android') ? 'Android' :
        ua.includes('iOS') ? 'iOS' : 'Unknown',
  };
};
