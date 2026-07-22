import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper function to generate a signed JWT for a given user ID.
 * Not a route handler.
 * 
 * @param {string} userId - The user object ID.
 * @returns {string} Signed JWT.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Registers a new user.
 * 
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create new User document (password is hashed in pre-save middleware)
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate JWT token (expires in 7 days for register as per requirement)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Explicitly delete password from returned user object (backed up by model's toJSON override)
    const userResponse = user.toJSON();

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates credentials, verifies active status, and issues session tokens.
 * 
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  /*
   * PRODUCTION SECURITY NOTE:
   * To prevent brute-force attacks and DDoS on authentication endpoints, 
   * 'express-rate-limit' should be mounted as a middleware on this route.
   * Example configuration:
   * 
   * import rateLimit from 'express-rate-limit';
   * const loginLimiter = rateLimit({
   *   windowMs: 15 * 60 * 1000, // 15 minutes
   *   max: 5, // Limit each IP to 5 requests per window
   *   message: 'Too many login attempts from this IP, please try again after 15 minutes'
   * });
   * router.post('/login', loginLimiter, ...);
   */
  try {
    const { email, password } = req.body;

    // Find user by email, selecting password explicitly for validation checks
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      // Security practice: return identical generic message for email or password mismatches
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Security practice: return identical generic message
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If user.isActive is false, return 403 deactivated account message
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate JWT using our helper function
    const token = generateToken(user._id);

    const userResponse = user.toJSON();

    return res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns current authenticated user profile details.
 * 
 * @route GET /api/auth/me (or /api/auth/profile)
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user was already attached and selected without password by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Allows the user to update their name and change their password safely.
 * 
 * @route PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, oldPassword, newPassword } = req.body;

    // Retrieve user profile with password to allow old password checking
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // If name is specified, update it (ignoring email changes as they require separate flows)
    if (name) {
      user.name = name;
    }

    // If new password is provided, validate current old password first
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password'
        });
      }

      // Check current password
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid current password'
        });
      }

      // Assign new password (hashed by mongoose User pre-save hook)
      user.password = newPassword;
    }

    await user.save();

    const updatedUserResponse = user.toJSON();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserResponse
    });
  } catch (error) {
    next(error);
  }
};
