const express = require("express");
const transactionModel = require("../../Model/Admin/Transaction");
const crypto = require("crypto");
const axios = require("axios");

class transaction {
  async transactions(req, res) {
    try {
      let { UserId, amount, gold, PaymentId, status, totalCoin, goldRate, gst, goldValue, metalType, purity } = req.body;
      
      console.log("🔄 TRANSACTION: Creating new transaction");
      console.log("📦 TRANSACTION: Request body:", req.body);
      console.log("👤 TRANSACTION: UserId:", UserId);
      console.log("💰 TRANSACTION: Amount:", amount);
      console.log("🥇 TRANSACTION: Gold:", gold);
      console.log("💳 TRANSACTION: PaymentId:", PaymentId);
      console.log("🔖 TRANSACTION: MetalType:", metalType);
      console.log("🔖 TRANSACTION: Purity:", purity);
      
      // Validate required fields
      if (!UserId) {
        console.log("❌ TRANSACTION: UserId is missing");
        return res.status(400).json({ error: "UserId is required" });
      }
      
      if (!amount || !gold) {
        console.log("❌ TRANSACTION: Amount or gold is missing");
        return res.status(400).json({ error: "Amount and gold are required" });
      }
      
      // Set defaults for metalType and purity if not provided
      if (!metalType) {
        metalType = "24k";
        purity = purity || "999";
      }
      
      // Check if transaction with same PaymentId already exists (prevent duplicates)
      if (PaymentId && PaymentId.trim() !== '') {
        const existingTransaction = await transactionModel.findOne({ PaymentId: PaymentId });
        if (existingTransaction) {
          console.log("⚠️ TRANSACTION: Transaction with PaymentId already exists:", PaymentId);
          console.log("✅ TRANSACTION: Returning existing transaction");
          return res.status(200).json({ 
            success: existingTransaction, 
            msg: "Transaction already exists",
            transactionId: existingTransaction._id,
            isDuplicate: true
          });
        }
      }
      
      // Also check for duplicate transactions by UserId + amount + gold within last 5 minutes
      // This prevents duplicates even if PaymentId is empty or different
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const duplicateCheck = await transactionModel.findOne({
        UserId: UserId,
        amount: amount,
        gold: gold,
        metalType: metalType,
        purity: purity,
        createdAt: { $gte: fiveMinutesAgo }
      });
      
      if (duplicateCheck) {
        console.log("⚠️ TRANSACTION: Duplicate transaction detected (same user, amount, gold, metalType within 5 minutes)");
        console.log("✅ TRANSACTION: Returning existing transaction");
        return res.status(200).json({ 
          success: duplicateCheck, 
          msg: "Transaction already exists",
          transactionId: duplicateCheck._id,
          isDuplicate: true
        });
      }
      
      const newPayment = new transactionModel({
        UserId,
        amount,
        gold,
        metalType,
        purity,
        PaymentId,
        totalCoin,
        status: status || "Paid", // Default status
        goldRate,
        gst,
        goldValue
      });
      
      console.log("💾 TRANSACTION: Saving transaction to database...");
      
      const savedTransaction = await newPayment.save();
      
      console.log("✅ TRANSACTION: Transaction saved successfully");
      console.log("🆔 TRANSACTION: Saved transaction ID:", savedTransaction._id);
      console.log("👤 TRANSACTION: Saved UserId:", savedTransaction.UserId);
      
      return res.status(200).json({ 
        success: savedTransaction, 
        msg: "Payment Successfully",
        transactionId: savedTransaction._id
      });
      
    } catch (error) {
      console.log("❌ TRANSACTION: Error creating transaction:", error);
      console.log("❌ TRANSACTION: Error details:", error.message);
      return res.status(400).json({ 
        error: error.message,
        details: "Failed to create transaction"
      });
    }
  }

  async makepayment(req, res) {
    let {
      amount,
      merchantTransactionId,
      merchantUserId,
      redirectUrl,
      callbackUrl,
      mobileNumber,
    } = req.body;
    // console.log("ghghgrht", req.body);

    console.log(
      amount,
      merchantTransactionId,
      merchantUserId,
      redirectUrl,
      callbackUrl,
      mobileNumber,
      "klklkl"
    );
    function generateSignature(payload, saltKey, saltIndex) {
      const encodedPayload = Buffer.from(payload).toString("base64");
      const concatenatedString = encodedPayload + "/pg/v1/pay" + saltKey;
      const hashedValue = crypto
        .createHash("sha256")
        .update(concatenatedString)
        .digest("hex");

      const signature = hashedValue + "###" + saltIndex;
      return signature;
    }
    // MERCHANTUAT
    //Production Credentials
    //  merchantId: "M1UDQN3RZ4OX",
    // const saltKey = "793e0747-4ca0-42e3-939d-f566b3991ade";
    //  "https://api.phonepe.com/apis/hermes/pg/v1/pay",
    const paymentDetails = {
      merchantId: "MERCHANTUAT",
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      mobileNumber: mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(paymentDetails);
    let objJsonB64 = Buffer.from(payload).toString("base64");
    const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"; //test key
    // const saltKey = "793e0747-4ca0-42e3-939d-f566b3991ade";  // live key for naala
    const saltIndex = 1;
    const signature = generateSignature(payload, saltKey, saltIndex);
    console.log("Generated Signature:", signature);
    try {
      const response = await axios.post(
        //"https://api.phonepe.com/apis/hermes/pg/v1/pay",

        "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
        {
          request: objJsonB64,
        },
        {
          headers: {
            "X-VERIFY": signature,
          },
        }
      );

      console.log(
        "Payment Response:",
        response.data,
        response.data?.data.instrumentResponse?.redirectInfo?.url
      );
      return res.status(200).json({
        url: response.data?.data.instrumentResponse?.redirectInfo,
      });
    } catch (error) {
      console.error("Payment Error:", error);
    }
  }

  async getTransaction(req, res) {
    try {
      const history = await transactionModel
        .find({})
        .populate("UserId")
        .sort({ amount: -1 });

      res.status(200).json({ success: history, msg: "Get All Transaction" });
    } catch (error) {
      res.status(400).json({ success: error, msg: "Somthing Wrong" });
      console.log(error);
    }
  }

  async byIdTransaction(req, res) {
    try {
      let id = req.params.id;
      
      console.log("🔍 TRANSACTION HISTORY: Fetching transactions for user:", id);
      
      if (!id) {
        console.log("❌ TRANSACTION HISTORY: User ID is missing");
        return res.status(400).json({ success: false, error: "User ID is required" });
      }

      const gettransaction = await transactionModel
        .find({
          UserId: id,
        })
        .populate("UserId")
        .sort({ createdAt: -1 }); // Sort by newest first
      
      console.log("📊 TRANSACTION HISTORY: Found", gettransaction.length, "transactions for user:", id);
      
      if (gettransaction.length > 0) {
        console.log("✅ TRANSACTION HISTORY: First transaction ID:", gettransaction[0]._id);
        console.log("✅ TRANSACTION HISTORY: First transaction UserId:", gettransaction[0].UserId);
        console.log("✅ TRANSACTION HISTORY: First transaction amount:", gettransaction[0].amount);
      } else {
        console.log("⚠️ TRANSACTION HISTORY: No transactions found for user:", id);
      }
      
      res.status(200).json({ 
        success: gettransaction,
        count: gettransaction.length,
        userId: id
      });
      
    } catch (error) {
      console.log("❌ TRANSACTION HISTORY: Error fetching transactions:", error);
      console.log("❌ TRANSACTION HISTORY: Error details:", error.message);
      res.status(400).json({ 
        success: false, 
        error: error.message,
        details: "Failed to fetch transaction history"
      });
    }
  }
}

const transactionController = new transaction();
module.exports = transactionController;
