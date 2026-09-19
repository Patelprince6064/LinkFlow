import env from "../config/env.js";

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  const response = {
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  };

  if (env.NODE_ENV === "development") {
    console.error(`[${req.method}] ${req.originalUrl} - ${err.message}`);
    if (!err.isOperational) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
