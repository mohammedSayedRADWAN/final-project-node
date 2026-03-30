import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate("owner", "fullName username email");
    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});

// Get single product
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("owner", "fullName username email");
    
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

// Create product
export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock, category, images } = req.body;

    const product = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        images,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});