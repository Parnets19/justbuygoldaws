// controllers/walletHistoryController.js
const WalletHistorymodel = require("../../Model/User/WalletHistory");

// Get wallet history by UserId
const getWalletHistoryByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const walletHistory = await WalletHistorymodel.find({ UserId: userId }).populate("UserId");
    res.status(200).json(walletHistory);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving wallet history", error });
  }
};

module.exports = {getWalletHistoryByUserId };