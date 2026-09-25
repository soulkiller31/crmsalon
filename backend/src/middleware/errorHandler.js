export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, _next) => {
  console.error('Unhandled Error:', err.stack || err.message || err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload format',
    });
  }

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';
  const message = err.isOperational
    ? err.message
    : (isDev ? err.message : 'Internal server error') || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && err.stack && { stack: err.stack }),
  });
};
