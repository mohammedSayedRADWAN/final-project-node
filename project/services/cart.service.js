import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

class CartService {
    static async getOrCreateCartDoc(userId) {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        return cart;
    }

    static async getCart(userId) {
        const cart = await this.getOrCreateCartDoc(userId);
        await cart.populate({
            path: "items.productId",
            select: "name price stock images category",
            populate: { path: "category", select: "name slug" }
        });
        return cart;
    }

    /** Lines as { productId, quantity } for checkout (no populate). */
    static async getRawItems(userId) {
        const cart = await Cart.findOne({ user: userId }).lean();
        if (!cart || !cart.items.length) return [];
        return cart.items.map((line) => ({
            productId: line.productId,
            quantity: line.quantity
        }));
    }

    static async addItem(userId, productId, quantity) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const cart = await this.getOrCreateCartDoc(userId);
        const idx = cart.items.findIndex(
            (line) => line.productId.toString() === productId
        );

        if (idx >= 0) {
            cart.items[idx].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        return this.getCart(userId);
    }

    static async setItemQuantity(userId, productId, quantity) {
        if (quantity < 1) {
            return this.removeItem(userId, productId);
        }

        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const cart = await this.getOrCreateCartDoc(userId);
        const idx = cart.items.findIndex(
            (line) => line.productId.toString() === productId
        );

        if (idx === -1) {
            throw new ApiError(404, "Product is not in cart");
        }

        cart.items[idx].quantity = quantity;
        await cart.save();
        return this.getCart(userId);
    }

    static async removeItem(userId, productId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new ApiError(404, "Cart not found");

        const before = cart.items.length;
        cart.items = cart.items.filter(
            (line) => line.productId.toString() !== productId
        );
        if (cart.items.length === before) {
            throw new ApiError(404, "Product is not in cart");
        }

        await cart.save();
        return this.getCart(userId);
    }

    static async clearCart(userId) {
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        return this.getCart(userId);
    }
}

export { CartService };
