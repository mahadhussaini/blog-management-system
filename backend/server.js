const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy headers (important for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-side requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin (server-side or same-origin)');
      return callback(null, true);
    }

    // Allow all localhost origins in development
    if (process.env.NODE_ENV !== 'production' && (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === 'http://localhost' ||
      origin === 'http://127.0.0.1'
    )) {
      console.log('CORS: Allowing localhost origin in development:', origin);
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',  // Sometimes React dev server uses 3001
      'http://127.0.0.1:3001',
      'http://localhost:5000',  // Direct backend access
      'http://127.0.0.1:5000',
      'https://localhost:3000', // HTTPS versions
      'https://127.0.0.1:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing whitelisted origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Custom-Header'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting - Different limits for development vs production
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create different limiters for different types of requests
const createLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 min in prod
  max: isDevelopment ? 3000 : 200, // Higher limit for create operations
  message: {
    success: false,
    error: isDevelopment
      ? 'Too many create requests. Please wait a moment before trying again.'
      : 'Too many requests from this IP, please try again later.',
    retryAfter: isDevelopment ? 60 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 min in prod
  max: isDevelopment ? 5000 : 500, // Higher limit for read operations
  message: {
    success: false,
    error: isDevelopment
      ? 'Too many read requests. Please wait a moment before trying again.'
      : 'Too many requests from this IP, please try again later.',
    retryAfter: isDevelopment ? 60 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for health checks and auth checks in development
    return isDevelopment && (
      req.url === '/api/health' ||
      req.url.startsWith('/api/auth/me')
    );
  }
});

const updateLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 min in prod
  max: isDevelopment ? 2000 : 150, // Medium limit for update operations
  message: {
    success: false,
    error: isDevelopment
      ? 'Too many update requests. Please wait a moment before trying again.'
      : 'Too many requests from this IP, please try again later.',
    retryAfter: isDevelopment ? 60 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to choose the appropriate limiter based on HTTP method
const smartLimiter = (req, res, next) => {
  if (req.method === 'GET') {
    return readLimiter(req, res, next);
  } else if (req.method === 'POST') {
    return createLimiter(req, res, next);
  } else if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return updateLimiter(req, res, next);
  } else {
    return readLimiter(req, res, next);
  }
};

app.use(smartLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
      origin: req.get('origin'),
      userAgent: req.get('user-agent'),
      contentType: req.get('content-type'),
      authorization: req.get('authorization') ? 'Bearer ***' : 'None'
    });
    next();
  });
}

// Database connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mahadarshad214_db_user:b3nUkcrXjFIYuQ2I@cluster0.p2jqpnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Please make sure MongoDB is running and the connection string is correct.');
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Blog Management API is running',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin',
    host: req.headers.host,
    cors: 'enabled'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    requestDetails: {
      origin: req.headers.origin || 'No origin header',
      host: req.headers.host,
      userAgent: req.headers['user-agent']?.substring(0, 100) + '...',
      method: req.method,
      path: req.path
    },
    corsConfig: {
      allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('URL:', req.url);
  console.error('Method:', req.method);

  // Handle CORS errors specifically
  if (err.message.includes('CORS') || err.message.includes('Not allowed by CORS')) {
    console.log('CORS Error Details:');
    console.log('- Error:', err.message);
    console.log('- Request Origin:', req.headers.origin || 'No origin header');
    console.log('- Request Host:', req.headers.host);
    console.log('- User Agent:', req.headers['user-agent']);

    return res.status(403).json({
      error: 'CORS policy violation',
      details: err.message,
      requestOrigin: req.headers.origin || 'No origin header',
      allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'https://localhost:3000',
        'https://127.0.0.1:3000'
      ]
    });
  }

  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path,
    method: req.method
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
