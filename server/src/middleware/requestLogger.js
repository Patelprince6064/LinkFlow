import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: duration + "ms",
    };

    if (res.statusCode >= 500) {
      logger.error("request completed", meta);
    } else if (res.statusCode >= 400) {
      logger.warn("request completed", meta);
    } else {
      logger.info("request completed", meta);
    }
  });

  next();
};

export default requestLogger;
