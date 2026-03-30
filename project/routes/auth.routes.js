import { Router } from "express";
import {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    refreshAccessToken
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";
import { authRateLimiter } from "../middleware/security.middleware.js";

const router = Router();

router.route("/register").post(validate(schemas.auth.register), registerUser);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/login").post(validate(schemas.auth.login), loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
