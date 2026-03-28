import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OrderService } from "../services/order.service.js";

/**
 * @description Order Controller
 */
const placeOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.placeOrder(req.user._id, req.body);
    return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

const getOrderHistory = asyncHandler(async (req, res) => {
    const orders = await OrderService.getOrderHistory(req.user._id);
    return res.status(200).json(new ApiResponse(200, orders, "Order history fetched"));
});

const getOrderDetails = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderDetails(req.user._id, req.params.id, req.user.role);
    return res.status(200).json(new ApiResponse(200, order, "Order details fetched"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await OrderService.updateOrderStatus(req.params.id, req.body.status);
    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.cancelOrder(req.user._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export {
    placeOrder,
    getOrderHistory,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder
};
