import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rule schema for user registration
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Validation rule schema for user login
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rule schema for profile updates
const updateProfileValidationRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('oldPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required to change password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// 1. Route: Register new user
router.post('/register', validate(registerValidationRules), register);

// 2. Route: Login user
router.post('/login', validate(loginValidationRules), login);

// 3. Route: Get user profile details (using /me path)
router.get('/me', protect, getProfile);

// 4. Route: Get user profile details (using /profile path)
router.get('/profile', protect, getProfile);

// 5. Route: Update profile details (using /profile path)
router.put('/profile', protect, validate(updateProfileValidationRules), updateProfile);

export default router;
