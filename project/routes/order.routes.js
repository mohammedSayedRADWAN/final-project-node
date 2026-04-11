import { Router } from "express";
import { 
    placeOrder, 
    getOrderHistory,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder
} from "../controllers/order.controller.js";
import { verifyJWT, optionalAuth, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router();

// Base routes with optional auth
router.route("/").post(optionalAuth, validate(schemas.order.place), placeOrder);
router.route("/history").get(verifyJWT, getOrderHistory);
router.route("/:id").get(optionalAuth, getOrderDetails);
router.route("/:id/cancel").patch(verifyJWT, cancelOrder);

// Admin Routes
router.route("/:id/status").patch(verifyJWT, authorizeRoles("Admin"), validate(schemas.order.updateStatus), updateOrderStatus);

export default router;
