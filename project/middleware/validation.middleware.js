import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

/**
 * @description Validation schemas and middleware
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ApiError(400, message);
    }
    next();
};

const schemas = {
    auth: {
        register: Joi.object({
            fullName: Joi.string().required().min(3).max(50),
            email: Joi.string().required().email(),
            username: Joi.string().required().alphanum().min(3).max(30),
            password: Joi.string().required().min(8),
            phoneNumber: Joi.string().optional(),
            role: Joi.string().valid("Customer", "Seller", "Admin").optional()
        }),
        login: Joi.object({
            email: Joi.string().email().optional(),
            username: Joi.string().optional(),
            phoneNumber: Joi.string().optional(),
            password: Joi.string().required()
        }).or("email", "username", "phoneNumber")
    },
    user: {
        updateProfile: Joi.object({
            fullName: Joi.string().optional().min(3).max(50),
            phoneNumber: Joi.string().optional()
        }),
        address: Joi.object({
            addressLine1: Joi.string().required(),
            addressLine2: Joi.string().optional().allow(""),
            city: Joi.string().required(),
            state: Joi.string().required(),
            postalCode: Joi.string().required(),
            country: Joi.string().required(),
            isDefault: Joi.boolean().optional(),
            _id: Joi.string().optional() // for updates
        })
    },
    review: {
        add: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            comment: Joi.string().required().min(5)
        }),
        update: Joi.object({
            rating: Joi.number().optional().min(1).max(5),
            comment: Joi.string().optional().min(5)
        }).min(1) // at least one field must be provided for update
    },
    order: {
        place: Joi.object({
            items: Joi.array().items(
                Joi.object({
                    productId: Joi.string().required(),
                    quantity: Joi.number().required().min(1)
                })
            ).required().min(1),
            shippingAddress: Joi.object().required()
        }),
        updateStatus: Joi.object({
            status: Joi.string().required().valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled")
        })
    },
    product: {
        create: Joi.object({
            name: Joi.string().required().trim().min(3).max(100),
            description: Joi.string().required().min(10).max(2000),
            price: Joi.number().required().min(0),
            stock: Joi.number().required().min(0),
            category: Joi.string().required(),
            images: Joi.array().items(Joi.string().uri()).optional()
        }),
        update: Joi.object({
            name: Joi.string().optional().trim().min(3).max(100),
            description: Joi.string().optional().min(10).max(2000),
            price: Joi.number().optional().min(0),
            stock: Joi.number().optional().min(0),
            category: Joi.string().optional(),
            images: Joi.array().items(Joi.string().uri()).optional()
        })
    }
};

export { validate, schemas };
