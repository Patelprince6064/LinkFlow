import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info("Server running", { mode: env.NODE_ENV, port: env.PORT });
  });
};

startServer();
