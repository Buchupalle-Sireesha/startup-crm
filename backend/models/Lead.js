import mongoose from 'mongoose';

/**
 * Lead Schema representing a potential customer or client.
 * Connects to a User who owns the lead and has structured JSDoc comments,
 * validation, virtual fields, and indexes.
 */
export const leadSchema = new mongoose.Schema(
  {
    /**
     * The full name of the lead contact.
     * Required field, trimmed, must be between 2 and 100 characters.
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters long'],
      maxlength: [100, 'Lead name cannot exceed 100 characters']
    },

    /**
     * The company or organization name the lead is associated with.
     * Required field, trimmed.
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },

    /**
     * Email address of the lead.
     * Required field, trimmed, validated with a regular expression.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // RFC 5322 compliant regex check for valid email format
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Email must be a valid email address'
      }
    },

    /**
     * Phone number of the lead contact.
     * Optional field, trimmed.
     */
    phone: {
      type: String,
      trim: true
    },

    /**
     * Current status of the lead in the sales pipeline.
     * Must be one of the specified enum values. Defaults to 'New'.
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: '{VALUE} is not a valid status'
      },
      default: 'New'
    },

    /**
     * The marketing or outreach source from which the lead originated.
     * Must be one of the specified enum values. Defaults to 'Website'.
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message: '{VALUE} is not a valid lead source'
      },
      default: 'Website'
    },

    /**
     * Additional notes, details, or communications about the lead.
     * Optional field, maximum 1000 characters.
     */
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },

    /**
     * The reference to the User model object ID representing the lead's owner.
     * Required field to ensure all leads are owned by a valid user.
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead owner (User) is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Virtual field to compute the age of the lead in days.
 * Returns the number of days elapsed since the lead's creation date.
 */
leadSchema.virtual('age').get(function() {
  if (!this.createdAt) {
    return 0;
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  const ageInDays = Math.floor((Date.now() - this.createdAt.getTime()) / msPerDay);
  return ageInDays < 0 ? 0 : ageInDays;
});

// Compound index on owner and status for fast filtered queries
leadSchema.index({ owner: 1, status: 1 });

// Index on email for fast lookups
leadSchema.index({ email: 1 });

// Compound index on owner and createdAt for sorting, date range filters, and monthly aggregations
leadSchema.index({ owner: 1, createdAt: -1 });

// Compound index on owner, status, and source for optimized dashboard aggregation
leadSchema.index({ owner: 1, status: 1, source: 1 });

// Compound index on owner and search terms (name, company, email) for search and autocompletes
leadSchema.index({ owner: 1, name: 1, company: 1, email: 1 });

import { MockLead } from '../utils/mockDbEngine.js';

// Define Lead model
const Lead = (process.env.VERCEL || mongoose.connection.readyState !== 1)
  ? MockLead
  : mongoose.model('Lead', leadSchema);

export default Lead;
