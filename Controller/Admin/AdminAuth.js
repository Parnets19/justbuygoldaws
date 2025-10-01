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
      const { email, password } = req.body;
      if (!email)
        return res.status(400).json({ error: "Email id is required!" });
      if (!password)
        return res.status(400).json({ error: "Password is required!" });
      let check = await AdminAuthModel.findOne({ email: email });

      if (!check)
        return res.status(400).json({ error: "Please enter valid Id" });

      if (password != check?.password) {
        return res.status(400).send({ error: "Incorrect password" });
      }

      return res
        .status(200)
        .json({ msg: "Successfully login", success: check });
    } catch (err) {
      console.log(err);
    }
  }
}

const AdminAuthcontroller = new AdminAuth();
module.exports = AdminAuthcontroller;
