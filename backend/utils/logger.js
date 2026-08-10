// import winston from "winston";

// const logger = winston.createLogger({
//   level: process.env.NODE_ENV === "production" ? "info" : "debug",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(
//       ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
//     )
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "logs/error.log", level: "error" }),
//     new winston.transports.File({ filename: "logs/combined.log" }),
//   ],
// });

// export default logger;

// Simple logger utility
const logger = {
  info: (message, ...args) => {
    console.log(`[${new Date().toISOString()}] INFO:`, message, ...args);
  },
  error: (message, ...args) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, message, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${new Date().toISOString()}] DEBUG:`, message, ...args);
    }
  },
  warn: (message, ...args) => {
    console.warn(`[${new Date().toISOString()}] WARN:`, message, ...args);
  }
};

export default logger;