const mongoose = require("mongoose");

const PaymentSettingsSchema = new mongoose.Schema(
  {
    redirectUrl: {
      type: String,
      default: "https://justbuygold.online",
      required: true,
    },
    successUrl: {
      type: String,
      default: "https://justbuygold.online/paymentsuccess",
      required: true,
    },
    cancelUrl: {
      type: String,
      default: "https://justbuygold.online/paymentcancel",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: String, // Admin ID or name
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PaymentSettingsModel = mongoose.model("PaymentSettings", PaymentSettingsSchema);
module.exports = PaymentSettingsModel;

