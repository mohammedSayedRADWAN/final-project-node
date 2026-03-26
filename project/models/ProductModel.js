import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description : String,
    category: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    stock: { type: Number, required: true },
    ratings: { type: Number, default: 0 },
    reviews: [{ user: String, comment: String, rating: Number }],
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);