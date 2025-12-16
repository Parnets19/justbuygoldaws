const express = require("express");
const mongoose = require("mongoose");

const goldRate = new mongoose.Schema(
  {
    name: {
      type: String, // e.g., "24", "22", "Silver"
    },
    metalType: {
      type: String, // e.g., "24k", "22k-916", "Silver"
      default: "24k"
    },
    purity: {
      type: String, // e.g., "999", "916", "995"
      default: "999"
    },
    rate: {
      type: String,
    },
    percentage: {
      type: Number,
    },
  },
  { timestamps: true }
);

const GoldModel = mongoose.model("goldRate", goldRate);
module.exports = GoldModel;
