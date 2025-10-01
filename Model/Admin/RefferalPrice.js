const express = require("express");
const mongoose = require("mongoose");

const Referralprice = new mongoose.Schema(
  {
    referralprice: {
      type: String,
    },
  },
  { timestamps: true }
);

const Referralpricemodel = mongoose.model("Referralprice", Referralprice);
module.exports = Referralpricemodel;
