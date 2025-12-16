const express = require("express");
const redemptionModel = require("../../Model/Admin/Redemption");
const userModel = require("../../Model/User/Auth");
const coinsModel = require("../../Model/Admin/Coins");
const transactionModel = require("../../Model/Admin/Transaction");

class Redemption {
  // Create new redemption request
  async createRedemption(req, res) {
    try {
      const {
        UserId,
        redemptionType,
        metalType,
        purity,
        goldGrams,
        fullAddress,
        amount,
        paymentMethod,
        upiId,
        phonePeName,
        phonePeNumber,
      } = req.body;

      console.log("🔄 REDEMPTION: Creating new redemption request");
      console.log("📦 REDEMPTION: Request body:", req.body);

      // Validate required fields
      if (!UserId) {
        return res.status(400).json({ error: "UserId is required" });
      }

      if (!redemptionType || !["Gold", "Cash"].includes(redemptionType)) {
        return res.status(400).json({ error: "Valid redemptionType (Gold or Cash) is required" });
      }

      // Get user first for validation
      const user = await userModel.findById(UserId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate based on redemption type
      if (redemptionType === "Gold") {
        if (!metalType || !["24k", "22k-916", "Silver"].includes(metalType)) {
          return res.status(400).json({ error: "Valid metalType (24k, 22k-916, or Silver) is required for Gold redemption" });
        }
        
        if (!goldGrams || goldGrams <= 0) {
          return res.status(400).json({ error: "Valid goldGrams amount is required for Gold redemption" });
        }
        
        if (!fullAddress || fullAddress.trim() === "") {
          return res.status(400).json({ error: "Full address is required for Gold redemption" });
        }

        // Check user's available gold balance for the selected metal type
        const userTransactions = await transactionModel.find({ UserId });
        const userCoins = await coinsModel.find({ UserId });
        
        // Filter transactions by metal type
        let metalTransactions = [];
        if (metalType === "24k") {
          metalTransactions = userTransactions.filter(t => 
            t.metalType === "24k" || (!t.metalType && (t.purity === "999" || !t.purity))
          );
        } else if (metalType === "22k-916") {
          metalTransactions = userTransactions.filter(t => 
            t.metalType === "22k-916" || t.metalType === "22k" || (t.purity === "916" && t.metalType !== "Silver")
          );
        } else if (metalType === "Silver") {
          metalTransactions = userTransactions.filter(t => 
            t.metalType === "Silver" || t.name === "Silver"
          );
        }
        
        // Calculate available balance: total gold from transactions - coins redeemed
        // Note: Since coins model doesn't track metalType, we deduct all coins from all metal types
        // This is a limitation - ideally coins should track metalType
        const totalGold = metalTransactions.reduce((a, i) => a + Number(i?.gold || 0), 0);
        const redeemedCoins = userCoins.reduce((a, i) => a + Number(i?.coins || 0), 0);
        // For now, we'll use a proportional deduction or assume coins are from this metal type
        // Since we can't track metalType in coins, we'll check if total gold is sufficient
        const availableGold = totalGold - redeemedCoins;
        
        if (goldGrams > availableGold) {
          return res.status(400).json({ 
            error: `Insufficient balance. Available ${metalType === "Silver" ? "Silver" : "Gold"} ${metalType}: ${availableGold.toFixed(4)} gms` 
          });
        }
      } else if (redemptionType === "Cash") {
        if (!amount || amount <= 0) {
          return res.status(400).json({ error: "Valid amount is required for Cash redemption" });
        }

        const availableCash = user.totalEarnedMoney || 0;
        if (amount > availableCash) {
          return res.status(400).json({ 
            error: `Insufficient balance. Available cash: ₹${availableCash}` 
          });
        }

        // Validate payment method
        if (!paymentMethod || !["UPI", "PhonePe"].includes(paymentMethod)) {
          return res.status(400).json({ error: "Valid paymentMethod (UPI or PhonePe) is required" });
        }

        if (paymentMethod === "UPI") {
          if (!upiId || upiId.trim() === "") {
            return res.status(400).json({ error: "UPI ID is required" });
          }
        } else if (paymentMethod === "PhonePe") {
          if (!phonePeName || phonePeName.trim() === "") {
            return res.status(400).json({ error: "PhonePe name is required" });
          }
          if (!phonePeNumber || phonePeNumber.trim() === "") {
            return res.status(400).json({ error: "PhonePe number is required" });
          }
        }
      }

      const newRedemption = new redemptionModel({
        UserId,
        redemptionType,
        metalType: redemptionType === "Gold" ? metalType : undefined,
        purity: redemptionType === "Gold" ? purity : undefined,
        goldGrams: redemptionType === "Gold" ? goldGrams : undefined,
        fullAddress: redemptionType === "Gold" ? fullAddress : undefined,
        amount: redemptionType === "Cash" ? amount : undefined,
        paymentMethod: redemptionType === "Cash" ? paymentMethod : undefined,
        upiId: redemptionType === "Cash" && paymentMethod === "UPI" ? upiId : undefined,
        phonePeName: redemptionType === "Cash" && paymentMethod === "PhonePe" ? phonePeName : undefined,
        phonePeNumber: redemptionType === "Cash" && paymentMethod === "PhonePe" ? phonePeNumber : undefined,
        status: "Pending",
      });

      const savedRedemption = await newRedemption.save();

      // Balance will be deducted when admin approves the request
      // Not deducting here - only when status changes to "Approved"

      console.log("✅ REDEMPTION: Redemption request created successfully");
      console.log("🆔 REDEMPTION: Redemption ID:", savedRedemption._id);

      return res.status(200).json({
        success: savedRedemption,
        msg: "Redemption request submitted successfully",
      });
    } catch (error) {
      console.log("❌ REDEMPTION: Error creating redemption:", error);
      return res.status(400).json({
        error: error.message,
        details: "Failed to create redemption request",
      });
    }
  }
  async getAllRedemptions(req, res) {
    try {
      const redemptions = await redemptionModel
        .find({})
        .populate("UserId", "name username email phoneno")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: redemptions,
      });
    } catch (error) {
      console.log("❌ REDEMPTION: Error fetching redemptions:", error);
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  // Get user's redemptions
  async getUserRedemptions(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "UserId is required" });
      }

      const redemptions = await redemptionModel
        .find({ UserId: userId })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: redemptions,
      });
    } catch (error) {
      console.log("❌ REDEMPTION: Error fetching user redemptions:", error);
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  // Update redemption status (for admin)
  async updateRedemptionStatus(req, res) {
    try {
      const { redemptionId } = req.params;
      const { status, adminNotes } = req.body;

      if (!redemptionId) {
        return res.status(400).json({ error: "Redemption ID is required" });
      }

      if (!status || !["Pending", "Approved", "Rejected", "Completed"].includes(status)) {
        return res.status(400).json({ error: "Valid status is required" });
      }

      const redemption = await redemptionModel.findById(redemptionId);
      if (!redemption) {
        return res.status(404).json({ error: "Redemption not found" });
      }

      const oldStatus = redemption.status;
      const newStatus = status;

      // Deduct balance only when status changes to "Approved"
      if (newStatus === "Approved" && oldStatus !== "Approved") {
        const user = await userModel.findById(redemption.UserId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (redemption.redemptionType === "Gold") {
          // Create a coins entry to deduct from gold balance
          const newCoin = new coinsModel({
            UserId: redemption.UserId,
            username: user.username || user.name,
            email: user.email,
            phone: user.phoneno,
            coins: redemption.goldGrams?.toString() || "0",
            status: "Approved", // Already approved by admin
          });
          await newCoin.save();
          console.log("✅ REDEMPTION: Gold coins entry created and approved:", redemption.goldGrams, "gms");
        } else if (redemption.redemptionType === "Cash") {
          // Deduct cash from user's totalEarnedMoney
          const currentBalance = user.totalEarnedMoney || 0;
          if (currentBalance >= redemption.amount) {
            user.totalEarnedMoney = currentBalance - redemption.amount;
            await user.save();
            console.log("✅ REDEMPTION: Cash deducted:", redemption.amount, "from user balance");
          } else {
            console.log("⚠️ REDEMPTION: Insufficient cash balance for deduction");
            return res.status(400).json({ 
              error: `Insufficient balance. User has ₹${currentBalance} but needs ₹${redemption.amount}` 
            });
          }
        }
      }

      // Restore balance if status changes from "Approved" to "Rejected" or "Pending"
      if ((oldStatus === "Approved") && (newStatus === "Rejected" || newStatus === "Pending")) {
        const user = await userModel.findById(redemption.UserId);
        if (user) {
          if (redemption.redemptionType === "Gold") {
            // Find and remove the coins entry for this redemption
            // Note: We'll need to track which coin entry belongs to which redemption
            // For now, we'll find the most recent coin entry with matching amount
            const coinEntries = await coinsModel.find({ 
              UserId: redemption.UserId,
              coins: redemption.goldGrams?.toString()
            }).sort({ createdAt: -1 });
            
            if (coinEntries.length > 0) {
              // Remove the most recent matching coin entry
              await coinsModel.findByIdAndDelete(coinEntries[0]._id);
              console.log("✅ REDEMPTION: Gold coins entry removed:", redemption.goldGrams, "gms");
            }
          } else if (redemption.redemptionType === "Cash") {
            // Restore cash to user's totalEarnedMoney
            user.totalEarnedMoney = (user.totalEarnedMoney || 0) + redemption.amount;
            await user.save();
            console.log("✅ REDEMPTION: Cash restored:", redemption.amount, "to user balance");
          }
        }
      }

      redemption.status = status;
      if (adminNotes) {
        redemption.adminNotes = adminNotes;
      }

      await redemption.save();

      return res.status(200).json({
        success: redemption,
        msg: "Redemption status updated successfully",
      });
    } catch (error) {
      console.log("❌ REDEMPTION: Error updating redemption status:", error);
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}
const redemptionController = new Redemption();
module.exports = redemptionController;

