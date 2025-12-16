const express = require("express");
const router = express.Router();

const PaymentSettingsController = require("../../Controller/Admin/PaymentSettings");

// Get current payment redirect URL settings
router.get("/getPaymentSettings", PaymentSettingsController.getPaymentSettings);

// Update redirect URL (admin only)
router.put("/updateRedirectUrl", PaymentSettingsController.updateRedirectUrl);

// Verify redirect URL (admin action)
router.post("/verifyRedirectUrl", PaymentSettingsController.verifyRedirectUrl);

module.exports = router;

