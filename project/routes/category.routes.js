import { Router } from "express";
import { 
    createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory 
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validation.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCategories);

// Secured/Admin routes
router.use(verifyJWT, authorizeRoles("Admin"));

router.route("/").post(validate(schemas.category.add), createCategory);
router.route("/:id")
    .patch(validate(schemas.category.update), updateCategory)
    .delete(deleteCategory);

export default router;
