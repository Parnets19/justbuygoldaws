const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const redemptionSchema = new mongoose.Schema(
  {
    UserId: {
      type: ObjectId,
      ref: "Auth",
      required: true,
    },
    redemptionType: {
      type: String,
      enum: ["Gold", "Cash"],
      required: true,
    },
    // For Gold redemption
    metalType: {
      type: String,
      enum: ["24k", "22k-916", "Silver"],
    },
    purity: {
      type: String,
    },
    goldGrams: {
      type: Number,
    },
    fullAddress: {
      type: String,
    },
    // For Cash redemption
    amount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "PhonePe"],
    },
    // For UPI
    upiId: {
      type: String,
    },
    // For PhonePe
    phonePeName: {
      type: String,
    },
    phonePeNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    adminNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

const redemptionModel = mongoose.model("redemption", redemptionSchema);
module.exports = redemptionModel;

