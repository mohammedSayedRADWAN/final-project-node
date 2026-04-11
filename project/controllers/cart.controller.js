import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CartService } from "../services/cart.service.js";

/**
 * @description Helper to get either User ID or Guest ID from request
 */
const getCartIdentifier = (req) => {
    return {
        userId: req.user?._id,
        guestId: req.header("X-Guest-Id")
    };
};

const getCart = asyncHandler(async (req, res) => {
    const ids = getCartIdentifier(req);
    const cart = await CartService.getCart(ids);
    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const ids = getCartIdentifier(req);
    const cart = await CartService.addItem(ids, productId, quantity);
    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const ids = getCartIdentifier(req);
    const cart = await CartService.setItemQuantity(ids, productId, quantity);
    return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const ids = getCartIdentifier(req);
    const cart = await CartService.removeItem(ids, productId);
    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    const ids = getCartIdentifier(req);
    const cart = await CartService.clearCart(ids);
    return res.status(200).json(new ApiResponse(200, cart, "Cart cleared"));
});

export { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart };
