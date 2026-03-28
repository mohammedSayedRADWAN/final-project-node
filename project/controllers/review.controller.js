import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ReviewService } from "../services/review.service.js";

/**
 * @description Review Controller
 */
const addReview = asyncHandler(async (req, res) => {
    const review = await ReviewService.addReview(req.user._id, req.params.productId, req.body);
    return res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.getProductReviews(req.params.productId, req.query);
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});

const deleteReview = asyncHandler(async (req, res) => {
    await ReviewService.deleteReview(req.user._id, req.params.reviewId);
    return res.status(200).json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export {
    addReview,
    getProductReviews,
    deleteReview
};
