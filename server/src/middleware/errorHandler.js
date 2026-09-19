import logger from "../utils/logger.js";
import env from "../config/env.js";

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : "Internal Server Error";
  let errors = err.errors || [];

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
    errors = [];
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `A resource with this ${field} already exists`
      : "A resource with this value already exists";
    errors = [];
  }

  if (err.name === "MulterError") {
    statusCode = 400;
    message = "File upload error: " + err.message;
    errors = [];
  }

  const logMeta = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    error: err.message,
  };

  if (statusCode >= 500) {
    logger.error("server error", logMeta);
    if (env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
  } else if (statusCode >= 400) {
    logger.warn("client error", logMeta);
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
