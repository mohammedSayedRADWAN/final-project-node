import express from "express";
import { 
    createPayment, 
    getAllPayments, 
    getPaymentById, 
    updatePaymentStatus,
    createCheckoutSession,
    handleStripeWebhook
} from "../controllers/paymentController.js";
import { verifyJWT, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", optionalAuth, createCheckoutSession);
router.post("/webhook", handleStripeWebhook);

router.post("/create", createPayment);
router.get("/all", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/:id/status", updatePaymentStatus);


export default router;