import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
            index: true
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true
        },
        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to generate slug
categorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

export const Category = mongoose.model("Category", categorySchema);
