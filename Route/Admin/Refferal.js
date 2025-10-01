const express = require("express");
const router = express.Router();

const ReferralController = require("../../Controller/User/Refferal");

router.post("/referral", ReferralController.addReferral);
router.put('/useReferralCode',ReferralController.useReferralCode);
router.get('/referrals',ReferralController.getAllReferrals);
// router.get('referrals/:id', ReferralController.getReferralById);
router.get('/refCode/:id', ReferralController.getreferalCode);
router.put('/changestatus', ReferralController.cHANGEstatus);
router.get("/user/:userId", ReferralController.getUserReferralStats);
router.post('/updateReferralEarnings/:userId', ReferralController.updateReferralEarnings);

module.exports = router;
