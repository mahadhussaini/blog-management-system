// Cache utility for storing and retrieving data

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map();

/**
 * Set cache item with expiry
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiry - Expiry time in milliseconds (optional)
 */
export const setCache = (key, value, expiry = CACHE_EXPIRY) => {
  if (typeof key === 'object' && value === undefined) {
    // If key is an object and value is undefined, set entire cache
    const newCache = key;
    cache.clear();
    Object.entries(newCache).forEach(([cacheKey, cacheItem]) => {
      if (cacheItem && typeof cacheItem === 'object') {
        cache.set(cacheKey, {
          value: cacheItem.data || cacheItem.value || cacheItem,
          expiry: cacheItem.timestamp ? cacheItem.timestamp + CACHE_EXPIRY : Date.now() + CACHE_EXPIRY,
        });
      }
    });
    // cache set (bulk)
    return;
  }

  const item = {
    value,
    expiry: Date.now() + expiry,
  };
  cache.set(key, item);
  // cache set
};

/**
 * Get cache item if not expired
 * @param {string} key - Cache key (optional - if not provided, returns entire cache)
 * @returns {any|null} - Cached value or entire cache object if no key provided
 */
export const getCache = (key) => {
  if (!key) {
    // Return entire cache as object
    const cacheObject = {};
    for (const [cacheKey, item] of cache.entries()) {
      if (Date.now() <= item.expiry) {
        cacheObject[cacheKey] = {
          data: item.value,
          timestamp: item.expiry - CACHE_EXPIRY,
        };
      } else {
        cache.delete(cacheKey);
      }
    }
    return cacheObject;
  }

  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expiry) {
    cache.delete(key);
    // cache expired and removed
    return null;
  }

  // cache hit
  return item.value;
};

/**
 * Remove cache item
 * @param {string} key - Cache key
 */
export const removeCache = (key) => {
  cache.delete(key);
  // cache removed
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCacheEntry = (key) => {
  cache.delete(key);
  // cache entry cleared
};

/**
 * Check if cache item is valid (not expired)
 * @param {object} cached - Cached item object with timestamp
 * @returns {boolean} - True if valid
 */
export const isCacheValid = (cached) => {
  if (!cached || !cached.timestamp) {
    return false;
  }

  const isValid = Date.now() - cached.timestamp < CACHE_EXPIRY;
  // no console log for expiry
  return isValid;
};

/**
 * Clear all cache items
 */
export const clearCache = () => {
  cache.clear();
  // cache cleared
};

/**
 * Get cache size
 * @returns {number} - Number of cached items
 */
export const getCacheSize = () => {
  return cache.size;
};

/**
 * Get all cache keys
 * @returns {Array} - Array of cache keys
 */
export const getCacheKeys = () => {
  return Array.from(cache.keys());
};

/**
 * Clean expired cache items
 */
export const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
};

// Clean expired items every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);

/**
 * Cache with localStorage fallback
 */
export const persistentCache = {
  /**
   * Set persistent cache item
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} expiry - Expiry time in milliseconds (optional)
   */
  set: (key, value, expiry = CACHE_EXPIRY) => {
    try {
      const item = {
        value,
        expiry: Date.now() + expiry,
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Failed to set persistent cache:', error);
      }
    }
  },

  /**
   * Get persistent cache item
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null
   */
  get: (key) => {
    try {
      const item = JSON.parse(localStorage.getItem(`cache_${key}`));

      if (!item) {
        return null;
      }

      if (Date.now() > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.value;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Failed to get persistent cache:', error);
      }
      return null;
    }
  },

  /**
   * Remove persistent cache item
   * @param {string} key - Cache key
   */
  remove: (key) => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Failed to remove persistent cache:', error);
      }
    }
  },

  /**
   * Clear all persistent cache items
   */
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Failed to clear persistent cache:', error);
      }
    }
  },
};