import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: [true, "Product description is required"]
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            default: 0
        },
        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            default: 0
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"]
        },
        images: [
            {
                type: String // URL
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

productSchema.plugin(mongoosePaginate);

// Index for search
productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);

