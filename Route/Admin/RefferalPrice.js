const express = require("express");
const {
  createReferralPrice,
  getReferralPrices,
  updateReferralPrice,
  deleteReferralPrice,
} = require("../../Controller/Admin/RefferalPrice");

const router = express.Router();

router.post("/referralprice", createReferralPrice);
router.get("/referralprices", getReferralPrices);
router.put("/referralprice/:id", updateReferralPrice);
router.delete("/referralprice/:id", deleteReferralPrice);


module.exports = router;
