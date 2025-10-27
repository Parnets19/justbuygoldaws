const express = require("express");
const Authmodel = require("../../Model/User/Auth");
const otpModel = require("../../Model/User/Otp");
const { default: axios } = require("axios");
const { sendMail } = require("../../Mailsend/send");

class Auth {
  // Register user==================================

  async signup(req, res) {
    console.log("📝 SIGNUP ATTEMPT STARTED");
    console.log("📝 Request Body:", { 
      name: req.body.name, 
      email: req.body.email, 
      phoneno: req.body.phoneno, 
      password: req.body.password ? "***" : "MISSING",
      profileimage: req.body.profileimage 
    });
    
    try {
      let { name, email, phoneno, password, profileimage } = req.body;
      
      // Validate required fields
      if (!name || !email || !phoneno || !password) {
        console.log("❌ VALIDATION FAILED: Missing required fields");
        console.log("📝 Name provided:", !!name);
        console.log("📧 Email provided:", !!email);
        console.log("📱 Phone provided:", !!phoneno);
        console.log("🔑 Password provided:", !!password);
        return res.status(400).json({ msg: "Please fill all the fields..." });
      }
      
      console.log("✅ Input validation passed");
      console.log("🔍 Checking if email already exists:", email);
      
      // Check if email already exists
      const persentemail = await Authmodel.findOne({ email: email });
      if (persentemail) {
        console.log("❌ EMAIL EXISTS: Email is already registered");
        return res.status(403).json({ msg: "Email is already Registered" });
      }
  
      console.log("✅ Email is available");
      console.log("🔍 Checking if phone already exists:", phoneno);
      
      // Check if phone already exists
      const persentphone = await Authmodel.findOne({ phoneno: phoneno });
      if (persentphone) {
        console.log("❌ PHONE EXISTS: Phone number is already registered");
        return res.status(403).json({ msg: "Phone No is already Registered" });
      }
      
      console.log("✅ Phone number is available");
      console.log("👤 Creating new user...");

      const NewUser = await new Authmodel({
        name,
        email,
        phoneno,
        password,
        profileimage,
      });
      
      NewUser.save().then((data) => {
        console.log("✅ USER CREATED SUCCESSFULLY");
        console.log("👤 User ID:", data.userId);
        console.log("👤 User Name:", data.name);
        console.log("📧 User Email:", data.email);
        console.log("📱 User Phone:", data.phoneno);
        console.log("🎉 SIGNUP SUCCESSFUL");
        
        return res
          .status(200)
          .json({ 
            success: "true", 
            message: "Signup Success, Please login",
            user: {
              userId: data.userId,
              name: data.name,
              email: data.email,
              phoneno: data.phoneno
            }
          });
      }).catch((saveError) => {
        console.log("💥 USER SAVE ERROR:");
        console.log("❌ Error message:", saveError.message);
        console.log("❌ Error stack:", saveError.stack);
        
        return res
          .status(500)
          .json({ 
            success: "false", 
            msg: "Failed to save user to database" 
          });
      });
      
    } catch (error) {
      console.log("💥 SIGNUP ERROR:");
      console.log("❌ Error message:", error.message);
      console.log("❌ Error stack:", error.stack);
      console.log("❌ Full error object:", error);
      
      return res
        .status(500)
        .json({ 
          success: "false", 
          msg: "Something went wrong during signup" 
        });
    }
  }
  // Login with Email+++++++++++++++++
  async userlog(req, res) {
    console.log("🔐 LOGIN ATTEMPT STARTED");
    console.log("📧 Request Body:", { email: req.body.email, password: req.body.password ? "***" : "MISSING" });
    
    let { email, password } = req.body;
    
    try {
      // Validate input fields
      if (!email || !password) {
        console.log("❌ VALIDATION FAILED: Missing email or password");
        console.log("📧 Email provided:", !!email);
        console.log("🔑 Password provided:", !!password);
        return res.status(400).json({ error: "Please fill all the fields..." });
      }
      
      console.log("✅ Input validation passed");
      console.log("🔍 Searching for user with email:", email);
      
      // Find user by email
      const isUserPresent = await Authmodel.findOne({ email: email });
      console.log("👤 User found:", !!isUserPresent);

      if (!isUserPresent) {
        console.log("❌ USER NOT FOUND: Email does not exist in database");
        return res.status(400).json({ error: "Email is wrong" });
      }
      
      console.log("✅ User found in database");
      console.log("👤 User ID:", isUserPresent.userId);
      console.log("👤 User Name:", isUserPresent.name);
      console.log("🔒 User Block Status:", isUserPresent.isBlock);
      
      // Check if THIS specific user is blocked
      if (isUserPresent.isBlock === true) {
        console.log("🚫 USER BLOCKED: Account is blocked by admin");
        return res.status(403).json({ error: "Account is blocked by Admin !!!" });
      }
      
      console.log("✅ User account is not blocked");
      console.log("🔑 Checking password...");
      console.log("🔑 Stored password:", isUserPresent.password);
      console.log("🔑 Provided password:", password);
      
      // Password comparison (currently plain text - should be hashed)
      if (isUserPresent.password !== password) {
        console.log("❌ PASSWORD MISMATCH: Wrong password provided");
        return res
          .status(400)
          .json({ error: "Wrong Password!" });
      }
      
      console.log("✅ Password verification successful");
      console.log("🎉 LOGIN SUCCESSFUL for user:", isUserPresent.email);
      
      return res
        .status(200)
        .json({ 
          success: "login Success", 
          details: isUserPresent,
          message: "Login successful"
        });
        
    } catch (error) {
      console.log("💥 LOGIN ERROR:");
      console.log("❌ Error message:", error.message);
      console.log("❌ Error stack:", error.stack);
      console.log("❌ Full error object:", error);
      
      return res.status(500).json({ 
        error: "Internal server error during login",
        message: "Something went wrong. Please try again."
      });
    }
  }

async loginWithOtp(req, res) {
  const { phoneno } = req.body;
  
  try {
    // Validate input
    if (!phoneno) {
      return res.status(400).json({ error: "Please provide phone number" });
    }
    
    // Generate OTP immediately (no waiting for DB first)
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    
    // Check user and check block status in parallel with OTP save
    const [isPhonePresent] = await Promise.all([
      Authmodel.findOne({ phoneno }).lean(),
      otpModel.findOneAndUpdate(
        { phoneno },
        { $set: { otp, expire_at: expirationTime } },
        { upsert: true, new: true }
      )
    ]);
    
    if (!isPhonePresent) {
      return res.status(400).json({ error: "Phone no is not registered..." });
    }
    
    // Check if user is blocked
    if (isPhonePresent.isBlock === true) {
      return res.status(403).json({ error: "Account is blocked by Admin !!!" });
    }

    return res.status(200).json({
      success: "OTP generated successfully",
      dummy_otp: otp,
      details: isPhonePresent,
      message: "OTP sent successfully"
    });
    
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to generate OTP. Please try again."
    });
  }
}

  // OTP Varification==========================

  async otpVarification(req, res) {
    console.log("📱 OTP VERIFICATION STARTED");
    console.log("📱 Request Body:", { phoneno: req.body.phoneno, otp: req.body.otp ? "***" : "MISSING" });
    
    const { phoneno, otp } = req.body;
    
    try {
      // Validate input
      if (!phoneno || !otp) {
        console.log("❌ VALIDATION FAILED: Missing phone number or OTP");
        return res.status(400).json({ error: "Please provide phone number and OTP" });
      }
      
      console.log("✅ Input validation passed");
      console.log("🔍 Searching for OTP record with phone:", phoneno);
      
      const varify = await otpModel.findOne({ phoneno: phoneno });
      console.log("📱 OTP record found:", !!varify);

      if (!varify) {
        console.log("❌ OTP NOT FOUND: No OTP record found for this phone number");
        return res.status(400).json({ error: "OTP expired or not found. Please request a new OTP." });
      }
      
      // Check if OTP has expired
      const now = new Date();
      const otpExpiry = new Date(varify.expire_at);
      console.log("🕐 Current time:", now);
      console.log("🕐 OTP expires at:", otpExpiry);
      
      if (now > otpExpiry) {
        console.log("⏰ OTP EXPIRED: OTP has expired");
        // Delete expired OTP
        await otpModel.deleteOne({ phoneno: phoneno });
        return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
      }
      
      console.log("✅ OTP record found");
      console.log("🔑 Stored OTP:", varify.otp);
      console.log("🔑 Provided OTP:", otp);
      
      // Check OTP match (handle both string and number types)
      const storedOtp = varify.otp.toString();
      const providedOtp = otp.toString();
      
      if (storedOtp !== providedOtp) {
        console.log("❌ OTP MISMATCH: Provided OTP does not match stored OTP");
        console.log("🔑 Stored OTP (string):", storedOtp);
        console.log("🔑 Provided OTP (string):", providedOtp);
        return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
      }
      
      console.log("✅ OTP verification successful");
      console.log("🔍 Searching for user with phone:", phoneno);
      
      const isPhonePresent = await Authmodel.findOne({ phoneno: phoneno });
      console.log("👤 User found:", !!isPhonePresent);
      
      if (!isPhonePresent) {
        console.log("❌ USER NOT FOUND: Phone number not registered");
        return res.status(400).json({ error: "Phone number not registered. Please sign up first." });
      }
      
      console.log("✅ User found in database");
      console.log("👤 User ID:", isPhonePresent.userId);
      console.log("👤 User Name:", isPhonePresent.name);
      console.log("🔒 User Block Status:", isPhonePresent.isBlock);
      
      if (isPhonePresent.isBlock === true) {
        console.log("🚫 USER BLOCKED: Account is blocked by admin");
        return res.status(400).json({ error: "User Account is Blocked" });
      }
      
      console.log("✅ User account is not blocked");
      console.log("🎉 OTP VERIFICATION SUCCESSFUL for user:", isPhonePresent.email);

      return res
        .status(200)
        .json({ 
          success: "OTP verified successfully", 
          details: isPhonePresent,
          message: "OTP verification successful"
        });
        
    } catch (error) {
      console.log("💥 OTP VERIFICATION ERROR:");
      console.log("❌ Error message:", error.message);
      console.log("❌ Error stack:", error.stack);
      console.log("❌ Full error object:", error);
      
      return res.status(500).json({ 
        error: "Internal server error during OTP verification",
        message: "Something went wrong. Please try again."
      });
    }
  }

  async getlluser(req, res) {
    try {
      const Alluser = await Authmodel.find({});
      return res.status(200).json({ msg: "All get user", success: Alluser });
      console.log(Alluser);
    } catch (error) {
      return res.status(500).json({ msg: "Somthing went wrong" });
      console.log(error);
    }
  }



  async updateUser(req, res) {
    try {
      console.log("🔄 UPDATE USER ENDPOINT HIT");
      console.log("📦 Headers:", req.headers);
      console.log("📦 Body:", req.body);
      console.log("📦 Files:", req.files);
      console.log("📦 Query:", req.query);
      console.log("📦 Method:", req.method);
      console.log("📦 URL:", req.url);
      
      // Check if request is reaching the server
      console.log("✅ Request received successfully");
  
      let { userId, name, email, phoneno, password } = req.body;
      
      console.log("👤 User ID from request:", userId);
      console.log("📝 Name from request:", name);
      console.log("📧 Email from request:", email);
      console.log("📱 Phone from request:", phoneno);
      console.log("🔑 Password provided:", password ? "***" : "NOT PROVIDED");
  
      if (!userId) {
        console.log("❌ Missing userId");
        return res.status(400).json({ 
          success: false, 
          msg: "User ID is required" 
        });
      }
  
      console.log("🔍 Searching for user in database...");
      
      // Check if user exists
      const existingUser = await Authmodel.findById(userId);
      if (!existingUser) {
        console.log("❌ User not found with ID:", userId);
        return res.status(404).json({ 
          success: false, 
          msg: "User not found" 
        });
      }
  
      console.log("✅ User found:", existingUser.name);
      
      let updateObj = {};
  
      // Build update object only for provided fields
      if (name && name.trim() !== "") {
        updateObj["name"] = name.trim();
        console.log("📝 Updating name to:", name.trim());
      }
      
      if (email && email.trim() !== "") {
        // Check if email already exists for another user
        const emailExists = await Authmodel.findOne({ 
          email: email.trim(), 
          _id: { $ne: userId } 
        });
        
        if (emailExists) {
          console.log("❌ Email already exists for another user");
          return res.status(400).json({ 
            success: false, 
            msg: "Email is already registered with another account" 
          });
        }
        updateObj["email"] = email.trim();
        console.log("📧 Updating email to:", email.trim());
      }
      
      if (phoneno && phoneno.trim() !== "") {
        // Check if phone already exists for another user
        const phoneExists = await Authmodel.findOne({ 
          phoneno: phoneno.trim(), 
          _id: { $ne: userId } 
        });
        
        if (phoneExists) {
          console.log("❌ Phone number already exists for another user");
          return res.status(400).json({ 
            success: false, 
            msg: "Phone number is already registered with another account" 
          });
        }
        updateObj["phoneno"] = phoneno.trim();
        console.log("📱 Updating phone to:", phoneno.trim());
      }
      
      if (password && password.trim() !== "") {
        updateObj["password"] = password.trim();
        console.log("🔑 Updating password");
      }
  
      // Handle file uploads
      if (req.file) {
        console.log("🖼️ Processing uploaded file:", req.file.filename);
        console.log("📄 File details:", {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          filename: req.file.filename,
          mimetype: req.file.mimetype
        });
        
        updateObj["profileimage"] = req.file.filename;
        console.log("🖼️ Profile image updated to:", req.file.filename);
      } else {
        console.log("📁 No file uploaded");
      }
  
      console.log("📊 Final update object:", updateObj);
  
      // Check if there are any fields to update
      if (Object.keys(updateObj).length === 0) {
        console.log("ℹ️ No changes to update");
        return res.status(200).json({ 
          success: true, 
          msg: "No changes made", 
          user: existingUser 
        });
      }
  
      console.log("💾 Saving updates to database...");
      
      // Update user in database
      const updatedUser = await Authmodel.findByIdAndUpdate(
        userId,
        { $set: updateObj },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        console.log("❌ Failed to update user");
        return res.status(500).json({ 
          success: false, 
          msg: "Failed to update user" 
        });
      }
  
      console.log("✅ User updated successfully:", updatedUser.name);
      console.log("📊 Updated user data:", {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phoneno,
        profileImage: updatedUser.profileimage
      });
  
      return res.status(200).json({
        success: true,
        msg: "Profile updated successfully",
        user: updatedUser
      });
  
    } catch (error) {
      console.error("💥 UPDATE USER ERROR:");
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      
      // Handle specific MongoDB errors
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          success: false, 
          msg: "Invalid user ID format" 
        });
      }
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false, 
          msg: "Validation failed",
          errors: error.errors 
        });
      }
  
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          msg: "Duplicate field value entered" 
        });
      }
  
      return res.status(500).json({ 
        success: false,
        msg: "Server error during profile update",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
  async BlockUnblockUser(req, res) {
    const userId = req.params.userId;
    try {
      const user = await Authmodel.findById({ _id: userId });

      if (user.isBlock === false) {
        await Authmodel.findByIdAndUpdate(
          { _id: user._id },
          { $set: { isBlock: true } },
          { new: true }
        );
        return res.status(200).json({ success: "User Blocked..." });
      } else {
        await Authmodel.findByIdAndUpdate(
          { _id: user._id },
          { $set: { isBlock: false } },
          { new: true }
        );
        return res.status(200).json({ success: "User Unblocked..." });
      }
    } catch (error) {
      console.log(error);
    }
  }



  async sendemailOtpRegister(req, res) {
    try {
      let { email } = req.body;
      if (!email) return res.status(400).json({ error: "Invalid email id" });
      let check = await Authmodel.findOne({ email: email });
      if (!check) {
        return res.status(400).json({ error: "Please Enter register email" });
      }
      email = email.toLowerCase();
      let otp = (Math.floor(Math.random() * 1000000) + 1000000)
        .toString()
        .substring(1);
      let presentMobile = await otpModel.findOneAndUpdate(
        { email: email },
        { $set: { otp: otp } },
        { new: true }
      );
      if (!presentMobile) {
        presentMobile = await otpModel.create({ email, otp: otp });
      }
      sendMail(
        check.name,
        email,
        `This is ${presentMobile.otp} otp for forgot password please do not share your otp <h3>Thank you <br/>Team JustBuyGold</h3>`
      );
      return res
        .status(200)
        .json({ success: "Successfully send otp your email" });
    } catch (error) {
      console.log(error);
    }
  }
  async verfiyEmail(req, res) {
    try {
      let { email, otp } = req.body;
      // console.log(email,otp,"iwogwur")
      let data = await otpModel.findOne({ email: email, otp: otp });
      if (!data)
        return res.status(400).json({ error: "Otp verification faild" });
      let check = await Authmodel.findOne({ email: email });

      if (check) return res.status(200).json({ success: check });
      return res.status(400).json({ error: "Somthings went wrong" });
    } catch (error) {
      console.log(error);
    }
  }
  async forgotPasword(req, res) {
    try {
      let { id, password } = req.body;
      if (!id) return res.status(400).json({ error: "Invalid email id" });

      let check = await Authmodel.findOneAndUpdate(
        { _id: id },
        { $set: { password: password } }
      );
      if (!check)
        return res
          .status(400)
          .json({ error: "Please enter register email id" });

      return res
        .status(200)
        .json({ success: check, msg: "Password succesfully reset !" });
    } catch (error) {
      console.log(error);
    }
  }
  
//getBuyId
async getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await Authmodel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: "false", msg: "User not found" });
    }

    return res.status(200).json({ success: "true", user });
  } catch (error) {
    return res.status(500).json({ success: "false", msg: "Something went wrong" });
  }
}
}

const Authcontroller = new Auth();
module.exports = Authcontroller;