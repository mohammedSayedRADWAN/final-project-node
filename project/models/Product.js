import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        category: {
            type: String,
            required: true
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

export const Product = mongoose.model("Product", productSchema);
