import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { CartService } from "./cart.service.js";
import { SHIPPING_FEE } from "../config/shipping.js";

/**
 * @description Order Management Logic
 */
class OrderService {
    static async placeOrder({ userId, guestId }, { items, shippingAddress, fromCart, guestEmail, guestName }) {
        let lineItems = items;

        if (fromCart === true) {
            lineItems = await CartService.getRawItems({ userId, guestId });
            if (!lineItems.length) {
                throw new ApiError(400, "Cart is empty");
            }
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of lineItems) {
            const product = await Product.findById(item.productId);
            if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);
            if (product.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name}`);
            }

            // Snapshot data
            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            subtotal += product.price * item.quantity;

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const shippingFee = SHIPPING_FEE;
        const totalAmount = subtotal + shippingFee;

        const orderData = {
            items: orderItems,
            subtotal,
            shipping: shippingFee,
            totalAmount,
            shippingAddress,
            status: "Pending"
        };

        if (userId) {
            orderData.customer = userId;
        } else {
            orderData.isGuest = true;
            orderData.guestEmail = guestEmail;
            orderData.guestName = guestName;
        }

        const order = await Order.create(orderData);

        if (fromCart === true) {
            await CartService.clearCart({ userId, guestId });
        }

        return order;
    }

    static async getOrderHistory(userId) {
        if (!userId) return []; // Guests don't have history in this simple implementation
        return await Order.find({ customer: userId }).sort("-createdAt").lean();
    }

    static async getOrderDetails(userId, orderId, role) {
        const query = { _id: orderId };
        
        // Admin sees all. Users see their own. Guests see theirs if we had a secret token, but for now we skip restricted guest access.
        if (role !== "Admin") {
            if (userId) {
                query.customer = userId;
            } else {
                 // For now, guests can only see order details right after placement via session
                 // In a real app, we'd use a unique order token
                 throw new ApiError(403, "Authentication required to view order details");
            }
        }

        const order = await Order.findOne(query).populate("customer", "fullName email");
        if (!order) throw new ApiError(404, "Order not found or unauthorized");
        return order;
    }

    static async updateOrderStatus(orderId, status) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!order) throw new ApiError(404, "Order not found");
        return order;
    }

    static async cancelOrder(userId, orderId) {
        const query = { _id: orderId };
        if (userId) {
            query.customer = userId;
        } else {
            throw new ApiError(403, "Login required to cancel orders");
        }

        const order = await Order.findOne(query);

        if (!order) throw new ApiError(404, "Order not found or unauthorized");
        if (order.status !== "Pending") {
            throw new ApiError(400, `Cannot cancel order in ${order.status} status`);
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        order.status = "Cancelled";
        await order.save();

        return order;
    }
}

export { OrderService };
