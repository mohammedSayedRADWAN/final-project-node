import { Router } from "express";
import { 
    addReview, 
    getProductReviews, 
    deleteReview 
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router({ mergeParams: true }); // Access productId from parent route

router.route("/").get(getProductReviews);

// Secured routes
router.use(verifyJWT);
router.route("/").post(validate(schemas.review.add), addReview);
router.route("/:reviewId").delete(deleteReview);

export default router;
