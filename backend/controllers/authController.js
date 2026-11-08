import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper function to generate a signed JWT for a given user ID.
 * Uses JWT_SECRET and JWT_EXPIRES_IN from environment variables.
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
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create new User document (password is hashed by pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // Generate JWT token with configured expiration
    const token = generateToken(user._id);

    // Explicitly delete password from returned user object
    const userResponse = user.toJSON();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email, selecting password explicitly since select: false is on schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // If user.isActive is false, return 403 deactivated account message
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate JWT using helper function
    const token = generateToken(user._id);
    const userResponse = user.toJSON();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
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
 * @route GET /api/auth/profile or GET /api/auth/me
 */
export const getProfile = async (req, res, next) => {
  try {
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

    // If name is specified, update it
    if (name) {
      user.name = name.trim();
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
