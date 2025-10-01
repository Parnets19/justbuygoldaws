const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Coins = new mongoose.Schema(
  {
    UserId: {
      type: ObjectId,
      ref: "Auth",
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
     usphone: {
      type: Number,
    },
    phone: {
      type: Number,
    },
    coins: {
      type: String,
    },
    status: {
      type: String,
      default: "Requested",
    },
  },
  { timestamps: true }
);

const coinsModel = mongoose.model("Coins", Coins);
module.exports = coinsModel;
