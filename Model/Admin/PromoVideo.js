const express = require("express");
const mongoose = require("mongoose");

const promoVideo = new mongoose.Schema(
  {
    video: {
      type: "string",
    },
  },
  { timestamps: true }
);

const PromoModel = mongoose.model("PromoVideo", promoVideo);
module.exports = PromoModel;
