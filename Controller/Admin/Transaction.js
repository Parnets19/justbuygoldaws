const express = require("express");
const transactionModel = require("../../Model/Admin/Transaction");
const crypto = require("crypto");
const axios = require("axios");

class transaction {
  async transactions(req, res) {
    try {
      let { UserId, amount, gold, PaymentId, status,totalCoin , goldRate , gst , goldValue } = req.body;
      console.log("data", UserId, amount, gold, PaymentId, status);
      const newPayment = new transactionModel({
        UserId,
        amount,
        gold,
        PaymentId,
        totalCoin,
        status,
        goldRate , gst , goldValue
      });
      newPayment.save().then((data) => {
        return res
          .status(200)
          .json({ success: newPayment, msg: "Payment Successfully" });
      });
    } catch (error) {
      return res.status(400).json({ error: error });
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

      const gettransaction = await transactionModel
        .find({
          UserId: id,
        })
        .populate("UserId");
      // console.log("all details", gettransaction);
      // console.log("user", gettransaction);
      res.status(200).json({ success: gettransaction });
    } catch (error) {
      res.status(400).json({ success: false });
      console.log(error);
    }
  }
}

const transactionController = new transaction();
module.exports = transactionController;
