const express = require("express");
const mongoose = require("mongoose");

const Gst = new mongoose.Schema(
  {
    Sgst: {
      type: Number,
      default: 0,
    },
    Cgst: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const GstModel = mongoose.model("Gst", Gst);
module.exports = GstModel;
