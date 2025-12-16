const express = require("express");
const router = express.Router();
const redemptionController = require("../../Controller/Admin/Redemption");

// Create redemption request
router.post("/create", redemptionController.createRedemption);

// Get all redemptions (admin)
router.get("/all", redemptionController.getAllRedemptions);

// Get user's redemptions
router.get("/user/:userId", redemptionController.getUserRedemptions);

// Update redemption status (admin)
router.put("/update/:redemptionId", redemptionController.updateRedemptionStatus);

module.exports = router;

