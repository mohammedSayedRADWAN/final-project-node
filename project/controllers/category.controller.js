import { CategoryService } from "../services/category.service.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.createCategory(req.body);
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryService.getAllCategories();
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    return res.status(200).json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
