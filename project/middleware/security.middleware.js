import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";



// Rate limiting for auth routes
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: "Rate limit exceeded, please wait a minute",
    standardHeaders: true,
    legacyHeaders: false,
});

// Sanitize MongoDB queries
const sanitizeMiddleware = mongoSanitize();

export {
    authRateLimiter,
    apiRateLimiter,
    sanitizeMiddleware
};
