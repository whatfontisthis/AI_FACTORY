/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let status = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = err.message || 'Resource not found';
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    status = 409;
    message = 'Duplicate entry - Resource already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference - Related resource not found';
  } else if (err.message) {
    // Use error message if available
    message = err.message;
  }

  // Send error response
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
