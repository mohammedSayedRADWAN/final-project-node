import Payment from "../models/PaymentModel.js";


// CREATE PAYMENT 
export const createPayment = async (req, res) => {
  try {

    const { userId, orderId, amount, paymentMethod } = req.body;

    const payment = new Payment({
      userId,
      orderId,
      amount,
      paymentMethod
    });

    const savedPayment = await payment.save();

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: savedPayment
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message
    });

  }
};



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