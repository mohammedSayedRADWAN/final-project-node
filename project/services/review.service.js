import { Review } from "../models/Review.js";
import { ApiError } from "../utils/ApiError.js";

class ReviewService {
    static async addReview(userId, productId, reviewData) {
        try {
            const review = await Review.create({
                user: userId,
                product: productId,
                ...reviewData
            });
            return review;
        } catch (error) {
            if (error.code === 11000) {
                throw new ApiError(400, "You have already reviewed this product");
            }
            throw error;
        }
    }

    static async getProductReviews(productId, { page = 1, limit = 10 }) {
        const reviews = await Review.find({ product: productId })
            .populate("user", "fullName")
            .sort("-createdAt")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return reviews;
    }

    static async updateReview(userId, reviewId, updateData) {
        const review = await Review.findOneAndUpdate(
            { _id: reviewId, user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("user", "fullName");

        if (!review) throw new ApiError(404, "Review not found or unauthorized");
        return review;
    }

    static async deleteReview(userId, reviewId) {
        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
        if (!review) throw new ApiError(404, "Review not found or unauthorized");
        return review;
    }
}

export { ReviewService };
