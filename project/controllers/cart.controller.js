import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CartService } from "../services/cart.service.js";

const getCart = asyncHandler(async (req, res) => {
    const cart = await CartService.getCart(req.user._id);
    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await CartService.addItem(req.user._id, productId, quantity);
    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await CartService.setItemQuantity(req.user._id, productId, quantity);
    return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const cart = await CartService.removeItem(req.user._id, productId);
    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await CartService.clearCart(req.user._id);
    return res.status(200).json(new ApiResponse(200, cart, "Cart cleared"));
});

export { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart };
