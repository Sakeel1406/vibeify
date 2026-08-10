const rateLimit = require("express-rate-limit");

//  Global API Rate Limiter (Increased max limit for development/testing)
const globalLimiter = rateLimit({
  windowMs: 15 * 90 * 10000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 to prevent mounting spam blocks
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

//  Stream Limiter (Strictly 5 free plays per 15 mins for guests)
const streamLimiter = rateLimit({
  windowMs: 15 * 90 * 10000, // 15 minutes
  max: 5, // Limit guests to 5 song plays
  standardHeaders: true,
  legacyHeaders: false,
  // Skip logic: If user has a valid JWT token (logged-in), bypass the limit entirely!
  skip: (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    return !!(authHeader && authHeader.startsWith("Bearer "));
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      limitReached: true,
      message: "Streaming limit reached! Please log in to stream unlimited songs.",
    });
  },
});

module.exports = {
  globalLimiter,
  streamLimiter,
};