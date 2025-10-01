const express = require("express");
const AdminAuthModel = require("../../Model/Admin/AdminAuth");

class AdminAuth {
  // Register user==================================

  async signup(req, res) {
    try {
      let { email, password } = req.body;
      if (!email || !password) {
        return res.status(500).json({ msg: "Please fill all the fields..." });
      }

      const persentemail = await AdminAuthModel.findOne({ email: email });
      if (persentemail) {
        return res.status(403).json({ msg: "Email is already Registered" });
      }

      const NewUser = await new AdminAuthModel({
        email,
        password,
      });
      NewUser.save().then((data) => {
        console.log(data);
        return res
          .status(200)
          .json({ success: "true", message: "Signup Success, Please login" });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: "false", msg: "somthing went worng" });
    }
  }

  //   Login with Email==========================

  async login(req, res) {
    try {
      console.log("🔐 ADMIN LOGIN: Starting admin login process");
      console.log("📦 ADMIN LOGIN: Request body:", req.body);
      
      const { email, password } = req.body;
      
      if (!email) {
        console.log("❌ ADMIN LOGIN: Email is required");
        return res.status(400).json({ error: "Email id is required!" });
      }
      
      if (!password) {
        console.log("❌ ADMIN LOGIN: Password is required");
        return res.status(400).json({ error: "Password is required!" });
      }
      
      console.log("🔍 ADMIN LOGIN: Looking up admin with email:", email);
      let check = await AdminAuthModel.findOne({ email: email });

      if (!check) {
        console.log("❌ ADMIN LOGIN: Admin not found with email:", email);
        return res.status(400).json({ error: "Please enter valid Id" });
      }

      console.log("🔑 ADMIN LOGIN: Admin found, checking password");
      if (password != check?.password) {
        console.log("❌ ADMIN LOGIN: Incorrect password for email:", email);
        return res.status(400).json({ error: "Incorrect password" });
      }

      console.log("✅ ADMIN LOGIN: Login successful for email:", email);
      return res
        .status(200)
        .json({ msg: "Successfully login", success: check });
    } catch (err) {
      console.error("💥 ADMIN LOGIN: Unexpected error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

const AdminAuthcontroller = new AdminAuth();
module.exports = AdminAuthcontroller;
