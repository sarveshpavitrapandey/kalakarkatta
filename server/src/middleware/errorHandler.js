export const notFoundHandler = (req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || "Something went wrong",
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  console.error(error);

  res.status(statusCode).json(payload);
};


