const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const Referral = new mongoose.Schema(
  {
    UserId: {
      type: ObjectId,
      ref: "Auth",
    },
    referral: {
      type: String,
    },
    receiverId: {
      type: String,
    },
    userreferralrupees: {
      type: Number,
      default: 0, // Default to 0, can be updated when status is "Inactive"
    },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive"],
    },
  },
  { timestamps: true }
);

const Referralmodel = mongoose.model("Referral", Referral);
module.exports = Referralmodel;
