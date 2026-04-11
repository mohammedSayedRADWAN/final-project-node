import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import { CartService } from "../services/cart.service.js";

/**
 * @description Authentication Controller
 */
const registerUser = asyncHandler(async (req, res) => {
    const user = await AuthService.registerUser(req.body);
    return res.status(201).json(
        new ApiResponse(201, user, "User registered successfully. Please verify your email.")
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    await AuthService.verifyEmail(token);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.loginUser(req.body);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    // Merge Guest Cart if guestId is provided in headers
    const guestId = req.header("X-Guest-Id");
    if (guestId) {
        await CartService.mergeCart(user._id, guestId);
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await AuthService.logoutUser(req.user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { accessToken, refreshToken } = await AuthService.refreshAccessToken(incomingRefreshToken);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        );
});

export {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    refreshAccessToken
};
