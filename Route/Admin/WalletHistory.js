const express = require("express");
const { getWalletHistoryByUserId } = require("../../Controller/User/WalletHistory");

const router = express.Router();

// Define the route
router.get("/wallet-history/:userId", getWalletHistoryByUserId);

module.exports = router;