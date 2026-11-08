import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema representing system users (admins or normal users).
 * Defines constraints, validations, JSDocs, hooks, and helper methods.
 */
export const userSchema = new mongoose.Schema(
  {
    /**
     * The full name of the user.
     * Must be between 2 and 50 characters long.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must be at most 50 characters long']
    },

    /**
     * Unique email address of the user.
     * Validated using a regular expression for correct formatting.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
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
     * Hashed password of the user.
     * Stored as a bcrypt hash, never plain text. Must be at least 6 characters in plain text.
     * select: false prevents the password hash from being leaked in queries by default.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },

    /**
     * Role of the user, defining authorization levels.
     * Can be 'admin' or 'user'. Defaults to 'user'.
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not a valid role. Role must be admin or user.'
      },
      default: 'user'
    },

    /**
     * Status flag indicating if the user account is active.
     * Defaults to true.
     */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware to hash password using bcryptjs.
 * Salts and hashes the password if it has been modified.
 */
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to compare candidate plain text password with the hashed password.
 * @param {string} candidatePassword - The plain text password to compare.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Overrides the toJSON method of the document to ensure sensitive
 * information like password is removed from the JSON output.
 * @returns {Object} The user object without the password field.
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Define standard Mongoose User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
