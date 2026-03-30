import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserService } from "../services/user.service.js";

/**
 * @description User Profile and Wishlist Controller
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req.user._id);
    return res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
    const addresses = await UserService.updateAddress(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, addresses, "Address updated successfully"));
});

const toggleWishlist = asyncHandler(async (req, res) => {
    const wishlist = await UserService.toggleWishlist(req.user._id, req.params.productId);
    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist updated"));
});

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await UserService.getWishlist(req.user._id);
    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist fetched"));
});

export {
    getProfile,
    updateProfile,
    updateAddress,
    toggleWishlist,
    getWishlist
};
