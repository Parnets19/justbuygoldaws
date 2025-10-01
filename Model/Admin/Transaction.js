const mongoose = require("mongoose");
const express = require("express");
const ObjectId = mongoose.Schema.Types.ObjectId;

const transaction = new mongoose.Schema(
  {
    UserId: {
      type: ObjectId,
      ref: "Auth",
    },
    amount: {
      type: Number,
    },
    gold: {
      type: String,
    },
    PaymentId: {
      type: String,
    },
     totalCoin: {
      type: Number,
    },
    goldRate:{
        type:Number
    },
    goldValue:{
        type:Number
    },
    gst:{
        type:Number
    },
    status: {
      type: String,
      default: "Paid",
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("transaction", transaction);
module.exports = transactionModel;
