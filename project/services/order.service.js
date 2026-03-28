import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @description Order Management Logic
 */
class OrderService {
    static async placeOrder(userId, { items, shippingAddress }) {
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
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

            totalAmount += product.price * item.quantity;

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            customer: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            status: "Pending"
        });

        return order;
    }

    static async getOrderHistory(userId) {
        return await Order.find({ customer: userId }).sort("-createdAt").lean();
    }
}

export { OrderService };
