import { Router } from "express";
import { 
    placeOrder, 
    getOrderHistory 
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(validate(schemas.order.place), placeOrder);
router.route("/history").get(getOrderHistory);

export default router;
