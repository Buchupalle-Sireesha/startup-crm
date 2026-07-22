import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes by verifying JSON Web Tokens (JWT).
 * Extracts token from 'Bearer <token>' in the Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract JWT from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided, access denied'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database, excluding the hashed password
    const user = await User.findById(decoded.id).select('-password');

    // If the user belonging to the token no longer exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    // If token has expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again'
      });
    }
    
    // For any other token validation/signature issues
    return res.status(401).json({
      success: false,
      message: 'Token is invalid'
    });
  }
};
