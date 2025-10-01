const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const walletHistorySchema = new mongoose.Schema(
  {
    UserId: {
      type: ObjectId,
      ref: "Auth",
    },
 
    receiverId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
        type: String,
      enum: ["DEBIT", "CREDIT"], 
    },

  },
  { timestamps: true }
);

const WalletHistorymodel = mongoose.model("WalletHistory", walletHistorySchema);
module.exports = WalletHistorymodel;
