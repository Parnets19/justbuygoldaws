const express = require("express");
const router = express.Router();
const Authcontroller = require("../Controller/User/Auth");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, "Public/User");
  },
  filename: function (req, file, cd) {
    cd(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/signup", Authcontroller.signup);
router.post("/signin", Authcontroller.userlog);
router.post("/otp", Authcontroller.loginWithOtp);
router.post("/otpVarification", Authcontroller.otpVarification);
router.get("/getalluser", Authcontroller.getlluser);
router.put("/updateuser", Authcontroller.updateUser);
router.put("/userblock/:userId", Authcontroller.BlockUnblockUser);
router.post("/sendmailotp", Authcontroller.sendemailOtpRegister);
router.post("/verifyOtpEmail", Authcontroller.verfiyEmail);
router.post("/forgotPassword", Authcontroller.forgotPasword);
router.get('/user/:id',Authcontroller.getUserById);

module.exports = router;
