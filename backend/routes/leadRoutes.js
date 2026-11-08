import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads
} from '../controllers/leadController.js';

const router = express.Router();

// Apply protect middleware to ALL routes in this file
router.use(protect);

// Define enum values matching schema specifications
const validStatuses = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const validSources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

// Validation schema for creating a new lead
const createLeadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Value must be a numeric amount'),
  body('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('source')
    .optional()
    .isIn(validSources)
    .withMessage(`Source must be one of: ${validSources.join(', ')}`)
];

// Validation schema for updating a lead
const updateLeadValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Value must be a numeric amount'),
  body('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('source')
    .optional()
    .isIn(validSources)
    .withMessage(`Source must be one of: ${validSources.join(', ')}`)
];

// Validation schema for patch updating status
const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`)
];

// Static paths registered before parameterized paths (:id)
router.get('/search', searchLeads);
router.get('/stats', getLeadStats);
router.get('/monthly-stats', getMonthlyStats);

router.route('/')
  .get(getLeads)
  .post(validate(createLeadValidation), createLead);

router.route('/:id')
  .get(getLeadById)
  .put(validate(updateLeadValidation), updateLead)
  .delete(deleteLead);

router.patch('/:id/status', validate(updateStatusValidation), updateLeadStatus);

export default router;
