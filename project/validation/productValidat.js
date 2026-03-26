import Joi from 'joi';

export const productSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Product name is required',
            'string.min': 'Product name must be at least 2 characters',
            'string.max': 'Product name must be at most 100 characters'
        }),
    
    description: Joi.string()
        .allow('')
        .max(1000)
        .messages({
            'string.max': 'Description can be at most 1000 characters'
        }),

    category: Joi.string()
        .required()
        .messages({
            'string.empty': 'Category is required'
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Stock must be a number',
            'number.integer': 'Stock must be an integer',
            'number.min': 'Stock cannot be negative',
            'any.required': 'Stock is required'
        }),

    images: Joi.array()
        .items(Joi.string().uri().messages({ 'string.uri': 'Each image must be a valid URL' }))
        .optional(),

    ratings: Joi.number()
        .min(0)
        .max(5)
        .optional(),

    reviews: Joi.array()
        .items(
            Joi.object({
                user: Joi.string().required(),
                comment: Joi.string().max(500).allow(''),
                rating: Joi.number().min(0).max(5)
            })
        )
        .optional()
});