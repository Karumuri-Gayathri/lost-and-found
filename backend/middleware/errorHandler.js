
const errorHandler = (err, req, res, next) => {
  // Copy the error object
  let error = { ...err };
  error.message = err.message;
  console.error('Error:', err);

  // ERROR TYPE 1: Invalid MongoDB ID
  // When someone tries to get an item with invalid ID like "abc123"
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // ERROR TYPE 2: Duplicate key error
  // When user tries to register with an email that already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];  // Get the field name (like 'email')
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // ERROR TYPE 3: Validation error
  // When data doesn't meet requirements (too short password, invalid email format)
  if (err.name === 'ValidationError') {
    // Get all error messages and combine them
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // ERROR TYPE 4: Invalid JWT token
  // When user sends a modified or fake token
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  // ERROR TYPE 5: Token expired
  // When user's token is older than 7 days
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Send the error response to user
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    // In development mode, also show the detailed error stack trace for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
module.exports = errorHandler;
