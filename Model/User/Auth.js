const express = require("express");
const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", CounterSchema);

const Auth = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true, // Ensure uniqueness for user IDs
      // required: true,
    },
    name: {
      type: String,
      required: "true",
    },
    email: {
      type: String,
      required: "true",
    },
    phoneno: {
      type: String,
      required: "true",
    },
    password: {
      type: String,
      required: "true",
    },
    profileimage: {
      type: String,
    },
    totalEarnedMoney:{
        type: Number,
        default: 0
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

Auth.pre("save", async function (next) {
  try {
    if (!this.userId) {
      // Find the corresponding counter document and increment the sequence
      const counter = await Counter.findByIdAndUpdate(
        { _id: "userId" }, // Use "userId" as the counter's _id
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // Create the unique userId based on "USER" and the incremented sequence
      this.userId = `JBG1${counter.seq.toString().padStart(3, "0")}`;
    }
    console.log("userId before next():", this.userId); //
    // Ensure that the userId field is set before saving
    if (!this.userId) {
      throw new Error("Failed to generate a unique userId.");
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Authmodel = mongoose.model("Auth", Auth);
module.exports = Authmodel;
