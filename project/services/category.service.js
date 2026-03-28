import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";

class CategoryService {
    static async createCategory(data) {
        const existing = await Category.findOne({ name: data.name });
        if (existing) throw new ApiError(400, "Category already exists");

        return await Category.create(data);
    }

    static async getAllCategories() {
        return await Category.find().sort("name");
    }

    static async getCategoryBySlug(slug) {
        const category = await Category.findOne({ slug });
        if (!category) throw new ApiError(404, "Category not found");
        return category;
    }

    static async updateCategory(id, data) {
        const category = await Category.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!category) throw new ApiError(404, "Category not found");
        return category;
    }

    static async deleteCategory(id) {
        const category = await Category.findByIdAndDelete(id);
        if (!category) throw new ApiError(404, "Category not found");
        return category;
    }
}

export { CategoryService };
