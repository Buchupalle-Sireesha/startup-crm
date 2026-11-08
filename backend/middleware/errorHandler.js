import mongoose from 'mongoose';

/**
 * Global Express error handling middleware.
 * Catches all unhandled middleware/route errors and normalizes them.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Details:', err);
  }

  // Check if database is offline or unreachable
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    (mongoose.connection.readyState !== 1 && err.name?.includes('Mongo'))
  ) {
    statusCode = 500;
    message = 'Database connection failure. Database is offline or unreachable.';
  }

  // 1. Mongoose Validation Error (Status 400)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 2. Mongoose Cast Error for invalid ObjectIds (Status 404)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 3. MongoDB Duplicate Key Error - code 11000 (Status 409)
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : '';
    if (duplicateField === 'email') {
      message = 'Email already exists';
    } else {
      message = duplicateField
        ? `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`
        : 'Duplicate value already exists';
    }
  }

  // 4. JSON Web Token Signature Error (Status 401)
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // 5. JSON Web Token Expiration Error (Status 401)
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Prepare response payload details
  const payloadMessage = (statusCode === 500 && !message.includes('Database connection failure'))
    ? (process.env.NODE_ENV === 'production' ? 'Internal Server Error. Please try again later.' : err.message)
    : message;

  return res.status(statusCode).json({
    success: false,
    message: payloadMessage,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
