import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import xss from "xss-clean";
import { apiRateLimiter, sanitizeMiddleware } from "./middleware/security.middleware.js";
import { ApiError } from "./utils/ApiError.js";

// Routes imports
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/ProductRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import reviewRouter from "./routes/review.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";

const app = express();

// Global Middlewares
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev")); // Logging

// Stripe Webhook (MUST be before express.json() to get raw body)
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
    // We forward to the controller but keep the route here to ensure raw body
    next();
});

// Routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews/:productId", reviewRouter); // Nested route pattern
app.use("/api/payment", paymentRoute);

// API rate limiting
app.use("/api/v1", apiRateLimiter);

// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }

    // Default error
    console.error("UNHANDLED ERROR:", err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export { app };