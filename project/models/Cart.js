import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { _id: false }
);

const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            unique: true,
            sparse: true,
            index: true
        },
        guestId: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            index: true
        },
        items: [cartItemSchema]
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
