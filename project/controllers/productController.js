import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get all products (with search, filter, and pagination)
export const getAllProducts = asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const filter = {};

    // 1. Search by name (partial match)
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    // 2. Filter by Category ID
    if (category) {
        filter.category = category;
    }

    // 3. Filter by Price Range
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 4. Execute pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [{ path: "category", select: "name slug" }, { path: "owner", select: "fullName" }],
        sort: { createdAt: -1 }
    };

    const result = await Product.paginate(filter, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Products fetched successfully")
    );
});

// Get single product
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
        .populate("category", "name slug")
        .populate("owner", "fullName username email");
    
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

    await product.populate("category", "name slug");

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