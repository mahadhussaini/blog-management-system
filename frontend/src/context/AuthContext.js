import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set up axios defaults
const isDevelopment = process.env.NODE_ENV === 'development';
// In production, always use REACT_APP_API_URL. In development, use proxy (empty string) or fallback to localhost
axios.defaults.baseURL = isDevelopment 
  ? (process.env.REACT_APP_API_URL || '') 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// Add a runtime safety net for production in case env wasn't injected
if (!isDevelopment) {
  const vercelHosted = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
  if ((!axios.defaults.baseURL || axios.defaults.baseURL.startsWith('http://localhost')) && vercelHosted) {
    // Fallback to known Render backend URL
    axios.defaults.baseURL = 'https://blog-management-system-7qqg.onrender.com';
  }
}

// Add token to requests if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional request debug (development only)
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('Axios Request Debug:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullUrl: config.baseURL ? `${config.baseURL}${config.url}` : `Relative: ${config.url}`,
        baseURL: config.baseURL || 'None (relative)',
        origin: typeof window !== 'undefined' ? window.location.origin : 'no-window',
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? '[PRESENT]' : '[NOT SET]'
        }
      });
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error('Axios Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Handle token expiration and rate limiting
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limiting error - show user-friendly message
      const retryAfter = error.response.headers['retry-after'];
      const message = error.response.data?.error || 'Too many requests. Please wait a moment.';
      toast.error(`${message}${retryAfter ? ` Try again in ${retryAfter} seconds.` : ''}`);
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  // Configure axios baseURL only for development (to use CRA proxy). Do not override in production.
  useEffect(() => {
    if (isDevelopment) {
      axios.defaults.baseURL = '';
    }
  }, []);

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: res.data.data, token },
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const res = await axios.post('/api/auth/login', { email, password });

      const { token, data: user } = res.data;

      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const res = await axios.post('/api/auth/register', userData);

      const { token, data: user } = res.data;

      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }

    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const res = await axios.put('/api/auth/update', userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: res.data.data,
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (passwords) => {
    try {
      await axios.put('/api/auth/change-password', passwords);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
