const express = require("express");
const Authmodel = require("../../Model/User/Auth");
const otpModel = require("../../Model/User/Otp");
const { default: axios } = require("axios");
const { sendMail } = require("../../Mailsend/send");

class Auth {
  // Register user==================================

  async signup(req, res) {
    try {
      let { name, email, phoneno, password, profileimage } = req.body;
      if (!name || !email || !phoneno || !password) {
        return res.status(500).json({ msg: "Please fill all the fields..." });
      }

      const persentemail = await Authmodel.findOne({ email: email });
      if (persentemail) {
        return res.status(403).json({ msg: "Email is already Registered" });
      }
  
      const persentphone = await Authmodel.findOne({ phoneno: phoneno });
      if (persentphone) {
        return res.status(403).json({ msg: "Phone No is already Registered" });
      }

      const NewUser = await new Authmodel({
        name,
        email,
        phoneno,
        password,
        profileimage,
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
  // Login with Email+++++++++++++++++
  async userlog(req, res) {
    let { email, password } = req.body;
    try {
      if ((!email, !password)) {
        return res.status(400).json({ error: "Please fill all the fields..." });
      }
      const isUserPresent = await Authmodel.findOne({ email: email });

      if (!isUserPresent) {
        return res.status(400).json({ error: "Email is wrong" });
      }
          const persentBlock = await Authmodel.findOne({ isBlock: true });
      if (persentBlock) {
        return res.status(403).json({ error: "Block by Admin !!!" });
      }

      // const isCorrectpassword = await bcrypt.compare(password, isUserPresent.password)
      if (isUserPresent.password !== password) {
        return res
          .status(400)
          .json({ error: "Wrong Password!" });
      }
      return res
        .status(200)
        .json({ success: "login Success", details: isUserPresent });
    } catch (error) {
      console.log(error);
    }
  }

  //   Login with otp==========================
//   async loginWithOtp(req, res) {
//     const { phoneno } = req.body;
//     console.log(phoneno,"phonenumber>>>>>")
//     try {
//       const isPhonePresent = await Authmodel.findOne({ phoneno: phoneno });
//       if (!isPhonePresent) {
//         return res.status(400).json({ error: "Phone no is not registered..." });
//       }
//      const persentBlock = await Authmodel.findOne({ isBlock: true });
//       if (persentBlock) {
//         return res.status(403).json({ error: "Block by Admin !!!" });
//       }

//       let otp = (Math.floor(Math.random() * 1000000) + 1000000)
//         .toString()
//         .substring(1);
        
//         console.log("otp..............",otp)

//       // Checking that the phone is already present in the DB or not.

//     //   const phoneNoPresent = await otpModel.findOne({ phoneno: phoneno });

//     //   const key = "Ae97f7ad9d6c2647071d78b6e94a3c87e";
//     //   const sid = "RDABST";
//     //   const to = phoneno;
//     //   const body = `Hi, Your OTP for mobile verification is ${otp} Regards, Team ReadAbstract`;
//     //   axios
//     //     .get(
//     //       "https://api-alerts.kaleyra.com/v4/?api_key=" +
//     //         key +
//     //         "&method=sms&message=" +
//     //         body +
//     //         "&to=" +
//     //         to +
//     //         "&sender=RDABST"
//     //     )
//     //     .then(async (data) => {
//     //       console.log(`statusCode: ${data.status}`);
//     //       console.log(data);
//     //       if (!phoneNoPresent) {
//     //         let newotp = new otpModel({
//     //           phoneno,
//     //           otp,
//     //         });
//     //         newotp
//     //           .save()
//     //           .then((data) => {
//     //             return res.status(200).json({
//     //               success: `OTP sent: ${data.otp}`,
//     //               details: isPhonePresent,
//     //               dummy_otp:otp
//     //             });
//     //           })
//     //           .catch((error) => {
//     //             return res.status(400).json({ error: error });
//     //           });
//     //       } else {
//     //         await otpModel.findOneAndUpdate(
//     //           { phoneno: phoneno },
//     //           { $set: { otp: otp } },
//     //           { new: true }
//     //         );
//     //         return res.status(200).json({
//     //           success: "OTP sent successfully",
//     //           details: isPhonePresent,
//     //           dummy_otp:otp
//     //         });
//     //       }
//     //     })
//     //     .catch((error) => {
//     //       console.error(error);
//     //       return res.status(500).json({ error: error });
//     //     });
    
//     // if (!phoneNoPresent) {
//     //         let newotp = new otpModel({
//     //           phoneno,
//     //           otp,
//     //         });
//     //         newotp
//     //           .save()
//     //           .then((data) => {
//     //             return res.status(200).json({
//     //               success: `OTP sent: ${data.otp}`,
//     //               details: isPhonePresent,
//     //               dummy_otp:otp
//     //             });
//     //           })
//     //           .catch((error) => {
//     //             return res.status(400).json({ error: error });
//     //           });
//     //       } else {
//     //         await otpModel.findOneAndUpdate(
//     //           { phoneno: phoneno },
//     //           { $set: { otp: otp } },
//     //           { new: true }
//     //         );
//     //         return res.status(200).json({
//     //           success: "OTP sent successfully",
//     //           details: isPhonePresent,
//     //           dummy_otp:otp
//     //         });
//     //       }
//     } catch (error) {
//       console.log(error);
//     }
//   }


async loginWithOtp(req, res) {
  const { phoneno } = req.body;
  try {
    const isPhonePresent = await Authmodel.findOne({ phoneno });
    if (!isPhonePresent) {
      return res.status(400).json({ error: "Phone no is not registered..." });
    }

    // Generate OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();

    await otpModel.findOneAndUpdate(
      { phoneno },
      { $set: { otp } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: "OTP generated successfully",
      dummy_otp: otp,
      details: isPhonePresent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}




  // OTP Varification==========================

  async otpVarification(req, res) {
    const { phoneno, otp } = req.body;
    console.log(phoneno, otp,"+++++++++")
    try {
      const varify = await otpModel.findOne({ phoneno: phoneno });
      console.log(varify, phoneno, otp);

      if (!varify) {
        return res.status(400).json({ error: "OTP is wrong" });
      }
      const isPhonePresent = await Authmodel.findOne({ phoneno: phoneno });
      if (isPhonePresent.isBlock == true)
        return res.status(400).json({ error: "User Account is Block" });

      return res
        .status(200)
        .json({ success: "OTP varified...", details: isPhonePresent });
    } catch (error) {
      console.log(error);
    }
  }

  //   Get All User=========================

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

  //   Update User=====================

  async updateUser(req, res) {
    try {
      let { userId, name, email, phoneno, password } = req.body;
      let Obj = {};

      if (name) {
        Obj["name"] = name;
      }
      if (email) {
        Obj["email"] = email;
      }
      if (phoneno) {
        Obj["phoneno"] = phoneno;
      }
      if (password) {
        Obj["password"] = password;
      }
      if (req.files) {
        let arr = req.files;
        let i;
        for (i = 0; i < arr?.length; i++) {
          if (arr[i].fieldname == "profileimage") {
            Obj["profileimage"] = arr[i].filename;
          }
        }
      }

      let data = await Authmodel.findByIdAndUpdate(
        userId,
        { $set: Obj },
        { new: true }
      );
      console.log(data);
      if (data) {
        return res.status(200).json({ success: data, msg: "Updated user" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Somthing went Wrong" });
    }
  }

  //   User Block & Unblock============================
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

  // Forgot password Reset

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
