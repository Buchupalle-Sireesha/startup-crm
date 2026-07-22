/**
 * Sends a successful API response.
 * 
 * @param {Object} res - Express response object.
 * @param {Object|Array} data - The payload to send in the response.
 * @param {string} message - Optional success message description.
 * @param {number} [statusCode=200] - HTTP status code (defaults to 200).
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends an error API response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - The error message description.
 * @param {number} [statusCode=500] - HTTP status code (defaults to 500).
 * @param {Object|Array|null} [errors=null] - Detailed error info or field validations.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Sends a paginated success API response.
 * 
 * @param {Object} res - Express response object.
 * @param {Array} data - Paginated subset of data.
 * @param {number} total - Total count of records across all pages.
 * @param {number} page - Current page number.
 * @param {number} limit - Number of records per page limit.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
};
