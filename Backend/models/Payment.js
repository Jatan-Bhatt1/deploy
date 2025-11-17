// Backend/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["payment", "skill_exchange"],
      default: "payment",
    },
    status: {
      type: String,
      enum: ["completed", "failed", "pending"],
      default: "completed",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
paymentSchema.index({ sender: 1, createdAt: -1 });
paymentSchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);

