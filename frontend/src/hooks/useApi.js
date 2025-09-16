import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useApi = (initialUrl = '', initialMethod = 'GET', initialData = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const abortControllerRef = useRef(null);

  // Clean up function to cancel ongoing requests
  useEffect(() => {
    const abortController = abortControllerRef.current;

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  const execute = useCallback(async (url = initialUrl, method = initialMethod, requestData = initialData) => {
    // Create a unique key for this request
    const requestKey = `${method}:${url}`;
    
    // Only cancel previous requests for the exact same endpoint and method
    if (abortControllerRef.current && abortControllerRef.current.key === requestKey) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller with key
    const abortController = new AbortController();
    abortController.key = requestKey;
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);

      const config = {
        method,
        url,
        signal: abortController.signal,
      };

      if (requestData && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = requestData;
      }

      const response = await axios(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      // Don't show error for cancelled requests
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }

      let errorMessage = err.response?.data?.error || err.message || 'An error occurred';

      // Handle validation errors more gracefully
      if (err.response?.status === 400 && err.response?.data?.details) {
        const validationErrors = err.response.data.details;
        if (validationErrors.length > 0) {
          errorMessage = validationErrors[0].msg;
        }
      }

      setError(errorMessage);

      // Handle authentication errors
      if (err.response?.status === 401) {
        logout();
      }

      // Handle rate limiting errors (429)
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        const message = err.response.data?.error || 'Too many requests. Please wait before trying again.';
        throw new Error(`${message}${retryAfter ? ` (Retry after ${retryAfter} seconds)` : ''}`);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialUrl, initialMethod, initialData, logout]);

  return { data, loading, error, execute };
};

export const usePosts = () => {
  const { data, loading, error, execute } = useApi();

  const getPosts = useCallback((params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return execute(`/api/posts?${queryString}`);
  }, [execute]);

  const getUserPosts = useCallback((params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return execute(`/api/posts/user/my-posts?${queryString}`);
  }, [execute]);

  const getPost = useCallback((identifier) => {
    // Detect if identifier is a 24-hex Mongo ObjectId
    const isObjectId = typeof identifier === 'string' && /^[0-9a-fA-F]{24}$/.test(identifier);
    if (isObjectId) {
      return execute(`/api/posts/${identifier}`);
    }
    // Otherwise use explicit slug endpoint to avoid any routing ambiguity
    return execute(`/api/posts/slug/${encodeURIComponent(identifier)}`);
  }, [execute]);

  const createPost = useCallback(async (postData) => {
    try {
      const result = await execute('/api/posts', 'POST', postData);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const updatePost = useCallback(async (id, postData) => {
    try {
      const result = await execute(`/api/posts/${id}`, 'PUT', postData);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const deletePost = useCallback(async (id) => {
    try {
      const result = await execute(`/api/posts/${id}`, 'DELETE');
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const likePost = useCallback((id) => {
    return execute(`/api/posts/${id}/like`, 'PUT');
  }, [execute]);

  return {
    posts: data,
    loading,
    error,
    getPosts,
    getUserPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
  };
};

export const useComments = () => {
  const { data, loading, error, execute } = useApi();

  const getComments = useCallback((postId) => {
    return execute(`/api/comments/post/${postId}`);
  }, [execute]);

  const createComment = useCallback(async (commentData) => {
    try {
      const result = await execute('/api/comments', 'POST', commentData);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const updateComment = useCallback(async (id, commentData) => {
    try {
      const result = await execute(`/api/comments/${id}`, 'PUT', commentData);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const deleteComment = useCallback(async (id) => {
    try {
      const result = await execute(`/api/comments/${id}`, 'DELETE');
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const likeComment = useCallback((id) => {
    return execute(`/api/comments/${id}/like`, 'PUT');
  }, [execute]);

  return {
    comments: data,
    loading,
    error,
    getComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
  };
};

export const useUsers = () => {
  const { data, loading, error, execute } = useApi();

  const getUsers = useCallback((params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return execute(`/api/users?${queryString}`);
  }, [execute]);

  const getUser = useCallback((id) => {
    return execute(`/api/users/${id}`);
  }, [execute]);

  const updateUser = useCallback(async (id, userData) => {
    try {
      const result = await execute(`/api/users/${id}`, 'PUT', userData);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const deleteUser = useCallback(async (id) => {
    try {
      const result = await execute(`/api/users/${id}`, 'DELETE');
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const getUserStats = useCallback(() => {
    return execute('/api/users/stats/overview');
  }, [execute]);

  const getAuthors = useCallback(() => {
    return execute('/api/users/authors/list');
  }, [execute]);

  return {
    users: data,
    loading,
    error,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats,
    getAuthors,
  };
};
