import express from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate, schemas } from "../middleware/validation.middleware.js";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.route('/').get(getAllProducts);
router.route('/:id').get(getProductById);

// Secured routes (Admin & Seller)
router.use(verifyJWT);
router.use(authorizeRoles("Admin", "Seller"));

router.route('/').post(validate(schemas.product.create), createProduct);
router.route('/:id').put(validate(schemas.product.update), updateProduct);
router.route('/:id').delete(deleteProduct);

export default router;