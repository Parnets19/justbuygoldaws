const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const ObjectId = mongoose.Schema.Types.ObjectId;

const Otp = new Schema(
  {
    phoneno: {
      type: String,
    },
    otp: {
      type: Number,
    },
    email: {
      type: String,
    },
    expire_at: {
      type: Date,
      expires: 300,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    },
  },
  { timestamps: true }
);

const otpModel = mongoose.model("Otp", Otp);
module.exports = otpModel;
