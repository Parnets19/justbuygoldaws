const express = require("express");
const mongoose = require("mongoose");

const AdminAuth = new mongoose.Schema(
  {
    email: {
      type: String,
      required: "true",
    },
    password: {
      type: String,
      required: "true",
    },
  },
  { timestamps: true }
);

const AdminAuthModel = mongoose.model("AdminAuth", AdminAuth);
module.exports = AdminAuthModel;
