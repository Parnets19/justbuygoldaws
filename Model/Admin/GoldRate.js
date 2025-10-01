const express = require("express");
const mongoose = require("mongoose");

const goldRate = new mongoose.Schema(
  {
    name: {
      type: "string",
    },
    rate: {
      type: "string",
    },
    percentage: {
      type: "number",
    },
  },
  { timestamps: true }
);

const GoldModel = mongoose.model("goldRate", goldRate);
module.exports = GoldModel;
