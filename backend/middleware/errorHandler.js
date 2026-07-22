import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express error handling middleware.
 * Catches all unhandled middleware/route errors and normalizes them.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  console.error('Error Details:', err);

  // 1. Mongoose Validation Error (Status 400)
  if (err.name === 'ValidationError') {
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
    // Extract duplicate field if possible, default to email check
    const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : '';
    if (duplicateField === 'email') {
      message = 'Email already exists';
    } else {
      message = duplicateField ? `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists` : 'Email already exists';
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
  const payloadMessage = statusCode === 500 ? 'Server error' : message;

  // Formulate consistent response using our apiResponse helper
  return res.status(statusCode).json({
    success: false,
    message: payloadMessage,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
