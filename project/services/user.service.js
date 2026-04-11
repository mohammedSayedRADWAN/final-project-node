import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

class UserService {
    static async getProfile(userId) {
        const user = await User.findById(userId).select("-password -refreshToken").lean();
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async updateProfile(userId, updateData) {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullName: updateData.fullName,
                    phoneNumber: updateData.phoneNumber
                }
            },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        return user;
    }

    static async updateAddress(userId, addressData) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        if (addressData._id) {
            const index = user.addresses.findIndex(addr => addr._id.toString() === addressData._id);
            if (index === -1) throw new ApiError(404, "Address not found");
            user.addresses[index] = { ...user.addresses[index].toObject(), ...addressData };
        } else {
            if (addressData.isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
            }
            user.addresses.push(addressData);
        }

        await user.save();
        return user.addresses;
    }

    static async toggleWishlist(userId, productId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const user = await User.findById(userId);
        const isWishlisted = user.wishlist.includes(productId);

        if (isWishlisted) {
            user.wishlist.pull(productId);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        return user.wishlist;
    }

    static async getWishlist(userId) {
        const user = await User.findById(userId).populate("wishlist").select("wishlist");
        return user.wishlist;
    }

    /**
     * @description Get all users for admin dashboard
     */
    static async getAllUsersAdmin() {
        // We use .find() without select("-isDeleted") by explicitly selecting it if needed
        // Or just let the default 'select: false' work for regular users, but here we want to see them.
        return await User.find({}).select("+isDeleted").sort("-createdAt").lean();
    }

    /**
     * @description Update user status (Soft Delete, Restrict, Unrestrict)
     */
    static async updateUserStatusAdmin(userId, { isDeleted, isRestricted, restrictionReason }) {
        const user = await User.findById(userId).select("+isDeleted");
        if (!user) throw new ApiError(404, "User not found");

        if (isDeleted !== undefined) user.isDeleted = isDeleted;
        if (isRestricted !== undefined) user.isRestricted = isRestricted;
        if (restrictionReason !== undefined) user.restrictionReason = restrictionReason;

        await user.save();
        return user;
    }
}

export { UserService };
