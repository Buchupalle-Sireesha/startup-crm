import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Load environment variables from .env
dotenv.config();

/**
 * Validates that all critical environment variables are set before startup.
 * Logs missing variables and shuts down the server with status code 1.
 */
const checkRequiredEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = [];

  required.forEach((variable) => {
    if (!process.env[variable] || process.env[variable].trim() === '') {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.error(`\n[CRITICAL ERROR] Missing required environment variables on startup: ${missing.join(', ')}`);
    console.error('Please configure these in your .env or platform environment variables to run the server.\n');
    process.exit(1);
  }
};

const app = express();

// Set HTTP security headers
app.use(helmet());

// Log HTTP requests - 'combined' for production, clean 'dev' for development
const loggingFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(loggingFormat));

// Parse JSON request payloads with a size limit of 10kb to prevent denial of service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

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

// Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'https://startup-crm-beta.vercel.app',
  'https://startup-crm-lite.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177'
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  envOrigins.forEach(origin => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 1. General Rate Limiter: 200 requests per 15 minutes per IP on all api routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Auth-Specific Rate Limiter: Protects auth endpoints against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 500,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Mount Rate Limiters
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Root API status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Startup CRM Lite Backend API is running successfully',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.status(200).json({
    status: dbStatus === 'CONNECTED' ? 'OK' : 'DEGRADED',
    database: dbStatus,
    timestamp: new Date()
  });
});

// Register global error handler middleware (MUST be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

let server;

/**
 * Initializes database connection first, then starts HTTP server.
 * Guarantees that the database connection completes before accepting API requests.
 */
export const startServer = async () => {
  checkRequiredEnvVars();
  await connectDB();

  if (!process.env.VERCEL) {
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${MODE} mode`);
    });
  }
  return server;
};

// Start server automatically only when executed directly via node server.js
const isMain = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server')
);

if (isMain && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[CRITICAL] Server startup failed:', err.message);
    process.exit(1);
  });
}

/**
 * Handles graceful server shutdown.
 * Closes HTTP server and disconnects from MongoDB cleanly.
 * 
 * @param {string} signal - The signal trigger (SIGINT, SIGTERM, etc.).
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  const closeMongoose = async () => {
    try {
      await disconnectDB();
      console.log('[SHUTDOWN] MongoDB connection closed cleanly.');
      console.log('Server shutting down gracefully');
      process.exit(0);
    } catch (err) {
      console.error('[SHUTDOWN] Error closing MongoDB connection:', err.message);
      process.exit(1);
    }
  };

  if (server) {
    server.close(async () => {
      console.log('[SHUTDOWN] Express HTTP server closed.');
      await closeMongoose();
    });
  } else {
    await closeMongoose();
  }

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

export default app;
