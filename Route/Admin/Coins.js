const express = require("express");
const router = express.Router();
const coinController = require("../../Controller/Admin/Coins");

router.post("/addCoins", coinController.addCoins);
router.get("/getCoins", coinController.getCoins);
router.put("/approvedhold", coinController.ApprovedHold);
router.get("/singalcoins/:id", coinController.getBuyId);

module.exports = router;
