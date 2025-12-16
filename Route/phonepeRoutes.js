const transactionController=require("../Controller/phonepecontroller");
const express=require('express');
const router=express.Router();

router.post("/addpaymentphonepay",transactionController.addPaymentPhone);
router.post("/addpaymentmobile",transactionController.addPaymentMobile);
router.post("/makepayment",transactionController.makepayment);
router.put("/updateStatuspayment/:id",transactionController.updateStatuspayment);
router.get("/getallpayment",transactionController.getallpayment);
router.post("/payment-callback",transactionController.paymentcallback);
router.get("/checkPayment/:id/:userId",transactionController.checkPayment);
router.get("/getRedirectUrl/:transactionId",transactionController.getRedirectUrl);
module.exports=router;