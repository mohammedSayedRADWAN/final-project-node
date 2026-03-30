import { Router } from "express";
import { 
    placeOrder, 
    getOrderHistory,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder
} from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(validate(schemas.order.place), placeOrder);
router.route("/history").get(getOrderHistory);

router.route("/:id").get(getOrderDetails);
router.route("/:id/cancel").patch(cancelOrder);

// Admin Routes
router.route("/:id/status").patch(authorizeRoles("Admin"), validate(schemas.order.updateStatus), updateOrderStatus);

export default router;
