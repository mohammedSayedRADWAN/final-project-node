import { Router } from "express";
import { 
    getProfile, 
    updateProfile, 
    updateAddress, 
    toggleWishlist, 
    getWishlist 
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all user routes

router.route("/profile").get(getProfile);
router.route("/update-profile").patch(validate(schemas.user.updateProfile), updateProfile);
router.route("/address").post(validate(schemas.user.address), updateAddress);
router.route("/wishlist").get(getWishlist);
router.route("/wishlist/:productId").post(toggleWishlist);

export default router;
