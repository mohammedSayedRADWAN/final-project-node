import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";
import {
    getCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCart).delete(clearCart);
router.route("/items").post(validate(schemas.cart.addItem), addToCart);
router
    .route("/items/:productId")
    .patch(validate(schemas.cart.updateItem), updateCartItemQuantity)
    .delete(removeFromCart);

export default router;
