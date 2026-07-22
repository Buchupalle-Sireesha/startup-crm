import { validationResult } from 'express-validator';

/**
 * Higher-order middleware function to run express-validator checks.
 * Normalizes validation failures to standard { success: false, errors: [{ field, message }] } shape.
 * 
 * @param {Array} validations - Array of express-validator check rules.
 * @returns {Function} Express middleware handler.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation checks
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    
    // If no validation errors exist, proceed
    if (errors.isEmpty()) {
      return next();
    }

    // Map errors into the requested format: [{ field, message }]
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  };
};
