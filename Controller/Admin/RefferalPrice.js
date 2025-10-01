const Referralpricemodel = require("../../Model/Admin/RefferalPrice");

// Create a new referral price
const createReferralPrice = async (req, res) => {
  try {
    const { referralprice } = req.body;
    const newReferralPrice = new Referralpricemodel({ referralprice });

    await newReferralPrice.save();
    res.status(200).json({
      message: "Referral price created successfully",
      referralPrice: newReferralPrice,
    });
  } catch (error) {
    console.error("Error creating referral price:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all referral prices
const getReferralPrices = async (req, res) => {
  try {
    const referralPrices = await Referralpricemodel.find({});
    res.status(200).json(referralPrices);
  } catch (error) {
    console.error("Error fetching referral prices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a referral price by ID
const updateReferralPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { referralprice } = req.body;

    const updatedReferralPrice = await Referralpricemodel.findByIdAndUpdate(
      id,
      { referralprice },
      { new: true }
    );

    if (!updatedReferralPrice) {
      return res.status(404).json({ message: "Referral price not found" });
    }

    res.status(200).json({
      message: "Referral price updated successfully",
      referralPrice: updatedReferralPrice,
    });
  } catch (error) {
    console.error("Error updating referral price:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a referral price by ID
const deleteReferralPrice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")
    const deletedReferralPrice = await Referralpricemodel.findByIdAndDelete(id);

    if (!deletedReferralPrice) {
      return res.status(404).json({ message: "Referral price not found" });
    }

    res.status(200).json({
      message: "Referral price deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting referral price:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createReferralPrice,
  getReferralPrices,
  updateReferralPrice,
  deleteReferralPrice,
};
