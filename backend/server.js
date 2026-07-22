import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Load environment variables from .env
dotenv.config();

/**
 * Validates that all required environment variables are set before startup.
 * Logs missing variables and shuts down the server with status code 1.
 */
const checkRequiredEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missing = [];

  required.forEach((variable) => {
    if (!process.env[variable] || process.env[variable].trim() === '') {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.error(`\n[CRITICAL ERROR] Missing required environment variables on startup: ${missing.join(', ')}`);
    console.error('Please configure these in your .env file to run the server.\n');
    process.exit(1);
  }
};

// Validate env config first
checkRequiredEnvVars();

// Establish Mongoose connection to MongoDB Atlas
connectDB();

const app = express();

// Set HTTP security headers
app.use(helmet());

// Log HTTP requests - detailed 'combined' for production, clean 'dev' for development
const loggingFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(loggingFormat));

// Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

// Push production domain to allowed list
allowedOrigins.push('https://your-app.vercel.app');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true
  })
);

// 1. General Rate Limiter: 100 requests per 15 minutes per IP on all api routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in standard header fields
  legacyHeaders: false // Disable the X-RateLimit-* headers
});

// 2. Auth-Specific Rate Limiter: Stricter limit of 10 requests per 15 minutes on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Mount Rate Limiters (stricter limit applied on auth sub-endpoints)
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

/**
 * Recursively sanitizes objects to protect against MongoDB NoSQL injection.
 * Removes keys starting with '$' or containing '.' in-place to support Express 5 query object constraints.
 * 
 * @param {Object} obj - The request data object to sanitize.
 */
const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitizeObject(obj[key]);
        }
      }
    }
  }
};

// Express 5 compatible in-place NoSQL Query Injection Protection middleware
app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
});

// Parse JSON request payloads with a size limit of 10kb to prevent denial of service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date()
  });
});

// Register global error handler middleware (MUST be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

// Start listening for incoming connections
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${MODE} mode`);
});

/**
 * Handles graceful server shutdown.
 * Closes HTTP servers and disconnects from MongoDB cleanly.
 * 
 * @param {string} signal - The signal trigger (SIGINT, SIGTERM, etc.).
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('[SHUTDOWN] Express HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('[SHUTDOWN] MongoDB connection closed cleanly.');
      console.log('Server shutting down gracefully');
      process.exit(0);
    } catch (err) {
      console.error('[SHUTDOWN] Error closing MongoDB connection:', err.message);
      process.exit(1);
    }
  });

  // Force shutdown backup timer after 10s if sockets hang
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced shutdown due to hanging database connections.');
    process.exit(1);
  }, 10000);
};

// Handle process termination and interrupt signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Graceful shutdown on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  gracefulShutdown('unhandledRejection');
});

// Graceful shutdown on uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  gracefulShutdown('uncaughtException');
});
