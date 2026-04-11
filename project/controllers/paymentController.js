import Payment from "../models/PaymentModel.js";
import { StripeService } from "../services/stripe.service.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// CREATE CHECKOUT SESSION
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const session = await StripeService.createCheckoutSession(orderId, req.user?._id);

  return res.status(200).json(
    new ApiResponse(200, { url: session.url }, "Checkout session created")
  );
});

// STRIPE WEBHOOK
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  // Stripe requires the raw body (req.body is raw here due to app.js config)
  const result = await StripeService.handleWebhook(signature, req.body);

  return res.status(200).json(result);
});

export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const { Order } = await import("../models/Order.js"); // Lazy import to avoid circular dep if any
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }


  const payment = await Payment.create({
    userId: order.customer || null, // Could be guest or user
    orderId,
    amount: order.totalAmount, // Security: pulled directly from order
    paymentMethod: paymentMethod || "card",
    status: "completed"
  });

  res.status(201).json(new ApiResponse(201, payment, "Payment recorded successfully (Securely)"));
});



// ================= GET ALL PAYMENTS =================
export const getAllPayments = async (req, res) => {
  try {

    const payments = await Payment.find()
      .populate("userId")
      .populate("orderId");

    res.status(200).json({
      success: true,
      data: payments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message
    });

  }
};



// ================= GET SINGLE PAYMENT =================
export const getPaymentById = async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    res.status(200).json(payment);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching payment",
      error: error.message
    });

  }
};



// ================= UPDATE PAYMENT STATUS =================
export const updatePaymentStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: "Payment updated",
      data: payment
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating payment",
      error: error.message
    });

  }
};