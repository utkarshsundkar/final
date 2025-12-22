import mongoose from "mongoose";

const premiumSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    planType: {
      type: String,
      enum: ["starter", "fifteen", "monthly", "yearly"],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    lastPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    // Transaction details
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", premiumSchema);
