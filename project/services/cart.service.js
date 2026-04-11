import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

class CartService {
    /**
     * @description Helper to get or create a cart for a User or Guest
     */
    static async getOrCreateCartDoc({ userId, guestId }) {
        if (!userId && !guestId) {
            throw new ApiError(400, "User ID or Guest ID must be provided");
        }

        const query = userId ? { user: userId } : { guestId: guestId };
        let cart = await Cart.findOne(query);

        if (!cart) {
            cart = await Cart.create({ ...query, items: [] });
        }
        return cart;
    }

    static async getCart({ userId, guestId }) {
        const cart = await this.getOrCreateCartDoc({ userId, guestId });
        await cart.populate({
            path: "items.productId",
            select: "name price stock images category",
            populate: { path: "category", select: "name slug" }
        });
        return cart;
    }

    /** Lines as { productId, quantity } for checkout (no populate). */
    static async getRawItems({ userId, guestId }) {
        const query = userId ? { user: userId } : { guestId: guestId };
        const cart = await Cart.findOne(query).lean();
        if (!cart || !cart.items.length) return [];
        return cart.items.map((line) => ({
            productId: line.productId,
            quantity: line.quantity
        }));
    }

    static async addItem({ userId, guestId }, productId, quantity) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const cart = await this.getOrCreateCartDoc({ userId, guestId });
        const idx = cart.items.findIndex(
            (line) => line.productId.toString() === productId
        );

        if (idx >= 0) {
            cart.items[idx].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        return this.getCart({ userId, guestId });
    }

    static async setItemQuantity({ userId, guestId }, productId, quantity) {
        if (quantity < 1) {
            return this.removeItem({ userId, guestId }, productId);
        }

        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const cart = await this.getOrCreateCartDoc({ userId, guestId });
        const idx = cart.items.findIndex(
            (line) => line.productId.toString() === productId
        );

        if (idx === -1) {
            throw new ApiError(404, "Product is not in cart");
        }

        cart.items[idx].quantity = quantity;
        await cart.save();
        return this.getCart({ userId, guestId });
    }

    static async removeItem({ userId, guestId }, productId) {
        const query = userId ? { user: userId } : { guestId: guestId };
        const cart = await Cart.findOne(query);
        if (!cart) throw new ApiError(404, "Cart not found");

        const before = cart.items.length;
        cart.items = cart.items.filter(
            (line) => line.productId.toString() !== productId
        );
        if (cart.items.length === before) {
            throw new ApiError(404, "Product is not in cart");
        }

        await cart.save();
        return this.getCart({ userId, guestId });
    }

    static async clearCart({ userId, guestId }) {
        const query = userId ? { user: userId } : { guestId: guestId };
        await Cart.findOneAndUpdate(query, { $set: { items: [] } });
        return this.getCart({ userId, guestId });
    }

    /**
     * @description Merges a guest cart into a user's cart upon login
     */
    static async mergeCart(userId, guestId) {
        if (!userId || !guestId) return;

        const guestCart = await Cart.findOne({ guestId });
        if (!guestCart || !guestCart.items.length) return;

        const userCart = await this.getOrCreateCartDoc({ userId });

        for (const guestItem of guestCart.items) {
            const userItemIdx = userCart.items.findIndex(
                item => item.productId.toString() === guestItem.productId.toString()
            );

            if (userItemIdx > -1) {
                userCart.items[userItemIdx].quantity += guestItem.quantity;
            } else {
                userCart.items.push(guestItem);
            }
        }

        await userCart.save();
        await Cart.deleteOne({ guestId }); // Clean up guest cart
    }
}

export { CartService };
