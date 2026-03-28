import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["card", "paypal", "cash"],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },

  transactionId: {
    type: String
  }

}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
