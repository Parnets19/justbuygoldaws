// const transactionModel = require("../../Modal/User/phonepayModel");
const axios = require("axios");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
require("dotenv").config();
// const MERCHANT_ID = "M22IJ7E10A8LQ";
// const SECRET_KEY = "323bd89f-a6c5-402f-a659-043df2b7b3c9";  
// const PHONEPE_API_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"; 
// const CALLBACK_URL = "https://valueproservice.com";  
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Uses amitparnets@gmail.com
    pass: process.env.EMAIL_PASS  // Uses your app password
  },
});

// const sendReceipt = async (username, email, amount, transactionId) => {
//   try {
//     const doc = new PDFDocument({ margin: 40, size: "A4" });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     const primaryColor = "#1E3A8A";     // Indigo
//     const secondaryColor = "#F3F4F6";   // Gray background
//     const textColor = "#111827";        // Dark text
//     const highlightColor = "#2563EB";   // Accent blue
//     const lightGray = "#9CA3AF";

//     // HEADER SECTION
//     try {
//       doc.image("logo.png", 40, 40, { width: 60 });
//     } catch {
//       console.warn("Logo not found. Skipping image.");
//     }

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(24)
//       .fillColor(primaryColor)
//       .text("ParikshaShikshak", 110, 45);

//     doc
//       .fontSize(12)
//       .fillColor(lightGray)
//       .text("Online Education Platform", 110, 72);

//     doc
//       .fontSize(10)
//       .fillColor(highlightColor)
//       .text("https://parikshashikshak.com", 40, 100);

//     // Receipt Box
//     doc
//       .moveTo(40, 130)
//       .lineTo(555, 130)
//       .strokeColor(secondaryColor)
//       .stroke();

//     doc
//       .fontSize(18)
//       .fillColor(primaryColor)
//       .text("Payment Receipt", 40, 145);

//     doc
//       .fontSize(10)
//       .fillColor(textColor)
//       .text(`Receipt Date: ${new Date().toLocaleString()}`, 40, 165);

//     // USER DETAILS SECTION
//     doc
//       .rect(40, 190, 515, 80)
//       .fill(secondaryColor);

//     doc
//       .fillColor(textColor)
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .text("Student Information", 50, 200);

//     doc
//       .font("Helvetica")
//       .fontSize(11)
//       .fillColor("#374151")
//       .text(`Name: ${username}`, 50, 220)
//       .text(`Email: ${email}`, 50, 240);

//     // TRANSACTION DETAILS SECTION
//     doc
//       .fillColor(primaryColor)
//       .font("Helvetica-Bold")
//       .fontSize(13)
//       .text("Transaction Summary", 40, 290);

//     doc
//       .font("Helvetica")
//       .fontSize(11)
//       .fillColor(textColor)
//       .text(`Transaction ID: ${transactionId}`, 50, 315)
//       .text(`Status: Successful`, 50, 335)
//       .text(`Mode: UPI / Card / Netbanking`, 50, 355);

//     // AMOUNT BOX
//     doc
//       .roundedRect(360, 310, 180, 60, 8)
//       .fill(highlightColor);

//     doc
//       .fillColor("#FFFFFF")
//       .font("Helvetica-Bold")
//       .fontSize(14)
//       .text("Amount Paid", 370, 320);

//     doc
//       .fontSize(18)
//       .text(`₹${amount}`, 370, 340);

//     // FOOTER
//     doc
//       .moveTo(40, 430)
//       .lineTo(555, 430)
//       .strokeColor(secondaryColor)
//       .stroke();

//     doc
//       .font("Helvetica-Oblique")
//       .fontSize(10)
//       .fillColor("#6B7280")
//       .text("Thank you for your payment!", 50, 450)
//       .text("For support, contact support@parikshashikshak.com", 50, 465);

//     doc.end();

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       await transporter.sendMail({
//         from: `"ParikshaShikshak" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: "Your ParikshaShikshak Payment Receipt",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
//             <h2 style="color: #1E3A8A; text-align: center;">ParikshaShikshak</h2>
//             <p>Hello <strong>${username}</strong>,</p>
//             <p>Thank you for your payment of ₹${amount}.</p>
//             <p><strong>Transaction ID:</strong> ${transactionId}</p>
//             <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
//             <p>Your receipt is attached as a PDF. For any issues, reach out to our support.</p>
//             <p style="text-align: center; color: #6B7280;">support@parikshashikshak.com</p>
//           </div>
//         `,
//         attachments: [
//           {
//             filename: `Receipt-${transactionId}.pdf`,
//             content: pdfBuffer,
//           },
//         ],
//       });
//     });
//   } catch (error) {
//     console.error("Error generating receipt:", error);
//   }
// };  
  


// const sendReceipt = async (username, email, amount, transactionId) => {
//   try {
//     const doc = new PDFDocument({ margin: 40, size: "A4" });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     // COLORS
//     const primaryColor = "#1E3A8A";
//     const textColor = "#111827";
//     const lightGray = "#6B7280";
//     const highlightColor = "#16a34a";

//     // HEADER
//     try {
//       doc.image("logo.png", 40, 30, { width: 60 });
//     } catch {
//       console.warn("Logo not found");
//     }

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(18)
//       .fillColor(primaryColor)
//       .text("PAID INVOICE", 400, 40, { align: "right" });

//     doc
//       .fontSize(10)
//       .fillColor(textColor)
//       .text(`Invoice#: ${transactionId}`, 400, 60, { align: "right" })
//       .text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 400, 75, {
//         align: "right",
//       });

//     // INVOICE TO BOX
//     doc.rect(40, 110, 515, 90).fill("#F3F4F6");

//     // Left Section: User Info
//     doc
//       .fillColor(textColor)
//       .font("Helvetica-Bold")
//       .fontSize(11)
//       .text("Invoice To:", 50, 120);

//     doc
//       .font("Helvetica")
//       .fontSize(10)
//       .text(username, 50, 135)
//       .text(email, 50, 150);

//     // Right Section: Static Address
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .text("ARIVUBODHI", 320, 120, { align: "left" })
//       .text("SHIKSHAK TALENTS LLP.", 320, 133)
//       .font("Helvetica")
//       .text("138,1st Floor, 20th Main Road,", 320, 146)
//       .text("53rd Cross, 8th Block, Rajajinagar,", 320, 159)
//       .text("Bengaluru, 560010", 320, 172)
//       .text("info@shikshakworld.com", 320, 185);

//     doc
//       .font("Helvetica-Bold")
//       .text("GSTIN : 29ACGFA8346M1ZS", 40, 205);

//     // TABLE HEADERS
//     const tableTop = 230;
//     const columnWidths = [100, 200, 60, 60, 80];
//     const headers = ["Item Type", "Remark", "Price", "Quantity", "Amount"];
//     let x = 40;
//     doc.font("Helvetica-Bold").fontSize(10).fillColor(textColor);
//     headers.forEach((text, i) => {
//       doc.text(text, x, tableTop, { width: columnWidths[i] });
//       x += columnWidths[i];
//     });
//     doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

//     // TABLE ROW
//     const rowY = tableTop + 25;
//     const row = ["Test Subscription", "Annual Plan", `₹${amount}`, "1", `₹${amount}`];
//     x = 40;
//     doc.font("Helvetica").fontSize(10).fillColor("#374151");
//     row.forEach((text, i) => {
//       doc.text(text, x, rowY, { width: columnWidths[i] });
//       x += columnWidths[i];
//     });

//     // AMOUNT SECTION
//     const amountY = rowY + 50;
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .fillColor(textColor)
//       .text("Sub Total", 400, amountY)
//       .text(`₹${amount}`, 500, amountY, { align: "right" });

//     doc
//       .text("Grand Total", 400, amountY + 40)
//       .text(`₹${amount}`, 500, amountY + 40, { align: "right" });

//     // TRANSACTION SUMMARY TABLE
//     const boxY = amountY + 90;
//     doc
//       .moveTo(40, boxY)
//       .lineTo(555, boxY)
//       .stroke();

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .fillColor(textColor)
//       .text("Transaction Date", 45, boxY + 10)
//       .text("Transaction ID", 160, boxY + 10)
//       .text("Gateway", 300, boxY + 10)
//       .text("Total Paid", 420, boxY + 10);

//     doc
//       .font("Helvetica")
//       .fillColor("#374151")
//       .text(new Date().toLocaleDateString("en-GB"), 45, boxY + 30)
//       .text(transactionId, 160, boxY + 30)
//       .text("PhonePe / Razorpay", 300, boxY + 30)
//       .text(`₹${amount}`, 420, boxY + 30);

//     doc
//       .moveTo(40, boxY + 50)
//       .lineTo(555, boxY + 50)
//       .stroke();

//     // FOOTER
//     doc
//       .moveTo(40, 750)
//       .lineTo(555, 750)
//       .strokeColor("#e5e7eb")
//       .stroke();

//     doc
//       .font("Helvetica-Oblique")
//       .fontSize(10)
//       .fillColor("#6B7280")
//       .text("Thank you for your payment!", 50, 760)
//       .text("For support, contact support@parikshashikshak.com", 50, 775);

//     doc.end();

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       await transporter.sendMail({
//         from: `"Pariksha Shikshak" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: "Your ParikshaShikshak Payment Receipt",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
//             <h2 style="color: #1E3A8A; text-align: center;">ParikshaShikshak</h2>
//             <p>Hello <strong>${username}</strong>,</p>
//             <p>Thank you for your payment of ₹${amount}.</p>
//             <p><strong>Transaction ID:</strong> ${transactionId}</p>
//             <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
//             <p>Your receipt is attached as a PDF. For any issues, reach out to our support.</p>
//             <p style="text-align: center; color: #6B7280;">support@parikshashikshak.com</p>
//           </div>
//         `,
//         attachments: [
//           {
//             filename: `Receipt-${transactionId}.pdf`,
//             content: pdfBuffer,
//           },
//         ],
//       });
//     });
//   } catch (err) {
//     console.error("Receipt error:", err);
//   }
// };



const sendReceipt = async (username, email, amount, transactionId) => {
  try {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    // COLORS
    const primaryColor = "#1E3A8A";
    const textColor = "#111827";
    const lightGray = "#6B7280";
    const highlightColor = "#16a34a";

    // AMOUNT CALCULATION
    const grandTotal = parseFloat(amount);
    const subTotal = parseFloat((grandTotal / 1.204).toFixed(2));
    const igst = parseFloat((subTotal * 0.18).toFixed(2));
    const txnCharge = parseFloat((subTotal * 0.024).toFixed(2));

    // HEADER
    try {
      doc.image("logo.png", 40, 30, { width: 60 });
    } catch {
      console.warn("Logo not found");
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(primaryColor)
      .text("PAID INVOICE", 400, 40, { align: "right" });

    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(`Invoice#: ${transactionId}`, 400, 60, { align: "right" })
      .text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 400, 75, {
        align: "right",
      });

    // INVOICE TO BOX
    doc.rect(40, 110, 515, 90).fill("#F3F4F6");

    // Left Section: User Info
    doc
      .fillColor(textColor)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Invoice To:", 50, 120);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(username, 50, 135)
      .text(email, 50, 150);

    // Right Section: Static Address
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("ARIVUBODHI", 320, 120)
      .text("SHIKSHAK TALENTS LLP.", 320, 133)
      .font("Helvetica")
      .text("138,1st Floor, 20th Main Road,", 320, 146)
      .text("53rd Cross, 8th Block, Rajajinagar,", 320, 159)
      .text("Bengaluru, 560010", 320, 172)
      .text("parikshashikshak@gmail.com", 320, 185);

    doc
      .font("Helvetica-Bold")
      .text("GSTIN : 29ACGFA8346M1ZS", 320, 205);

    // TABLE HEADERS
    const tableTop = 230;
    const columnWidths = [100, 200, 60, 60, 80];
    const headers = ["Item Type",  "Price", "Quantity", "Amount"];
    let x = 40;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(textColor);
    headers.forEach((text, i) => {
      doc.text(text, x, tableTop, { width: columnWidths[i] });
      x += columnWidths[i];
    });
    doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

    // TABLE ROW
    const rowY = tableTop + 25;
    const row = ["DTP Service Charge",  `₹${subTotal}`, "1", `₹${subTotal}`];
    x = 40;
    doc.font("Helvetica").fontSize(10).fillColor("#374151");
    row.forEach((text, i) => {
      doc.text(text, x, rowY, { width: columnWidths[i] });
      x += columnWidths[i];
    });

    // AMOUNT SECTION
    const amountY = rowY + 50;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(textColor)
      .text("Sub Total", 400, amountY)
      .text(`₹${subTotal}`, 500, amountY, { align: "right" });

    doc
      .text("IGST (18%)", 400, amountY + 15)
      .text(`₹${igst}`, 500, amountY + 15, { align: "right" });

    doc
      .text("Transaction Charge (2.4%)", 400, amountY + 30)
      .text(`₹${txnCharge}`, 500, amountY + 30, { align: "right" });

    doc
      .font("Helvetica-Bold")
      .text("Grand Total", 400, amountY + 50)
      .text(`₹${grandTotal}`, 500, amountY + 50, { align: "right" });

    // TRANSACTION SUMMARY
    const boxY = amountY + 100;
    doc.moveTo(40, boxY).lineTo(555, boxY).stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(textColor)
      .text("Transaction Date", 45, boxY + 10)
      .text("Transaction ID", 160, boxY + 10)
      .text("Gateway", 300, boxY + 10)
      .text("Total Paid", 420, boxY + 10);

    doc
      .font("Helvetica")
      .fillColor("#374151")
      .text(new Date().toLocaleDateString("en-GB"), 45, boxY + 30)
      .text(transactionId, 160, boxY + 30)
      .text("PhonePe / Razorpay", 300, boxY + 30)
      .text(`₹${grandTotal}`, 420, boxY + 30);

    doc.moveTo(40, boxY + 50).lineTo(555, boxY + 50).stroke();

    // FOOTER
    doc
      .moveTo(40, 750)
      .lineTo(555, 750)
      .strokeColor("#e5e7eb")
      .stroke();

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#6B7280")
      .text("Thank you for your payment!", 50, 760)
      .text("For support, contact support@parikshashikshak.com", 50, 775);

    doc.end();

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Pariksha Shikshak" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your ParikshaShikshak Payment Receipt",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #1E3A8A; text-align: center;">ParikshaShikshak</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thank you for your payment of ₹${grandTotal}.</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p>Your receipt is attached as a PDF. For any issues, reach out to our support.</p>
            <p style="text-align: center; color: #6B7280;">support@parikshashikshak.com</p>
          </div>
        `,
        attachments: [
          {
            filename: `Receipt-${transactionId}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    });
  } catch (err) {
    console.error("Receipt error:", err);
  }
};

const transactionModel = require("../Model/PhonepeModal");
const PaymentSettingsModel = require("../Model/Admin/PaymentSettings");

const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
  MetaInfo,
  CreateSdkOrderRequest
} = require("pg-sdk-node");

// const clientId = "M22IJ7E10A8LQ";
const clientId = "SU2511251530265015481772";
const clientSecret = "af26a340-9daf-47b6-b58d-978a1c79e8a3";
const clientVersion = 1;
const env = Env.PRODUCTION;
// const env = Env.SANDBOX;
// const CALLBACK_URL = "https://valueproservice.com/update/paymentstatus/:id";

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

class Transaction {

  async addPaymentPhone(req, res) {

    try {
      const { userId, username, Mobile, orderId, amount, config,successUrl,failedUrl,email } = req.body;

      // Save transaction details in DB
      const data = await transactionModel.create({
        userId,
        username, 
         email,
        Mobile,
        orderId,
        amount,
        config,
        successUrl,failedUrl
      });

      if (!data)
        return res.status(400).json({ error: "Something went wrong" });

      const merchantOrderId = data._id.toString(); // Use DB _id as unique order ID

      // Get verified redirect URLs from admin settings
      let paymentSettings = await PaymentSettingsModel.findOne();
      
      // If no settings exist, create default with justbuygold.online
      if (!paymentSettings) {
        paymentSettings = await PaymentSettingsModel.create({
          redirectUrl: "https://justbuygold.online",
          successUrl: "https://justbuygold.online/paymentsuccess",
          cancelUrl: "https://justbuygold.online/paymentcancel",
          isVerified: false,
        });
      }
      // Use verified success URL from admin settings (for successful payments)
      const baseSuccessUrl = paymentSettings.successUrl || `${paymentSettings.redirectUrl || "https://justbuygold.online"}/paymentsuccess`;
      const successRedirectUrl = `${baseSuccessUrl}?transactionId=${data._id}&userID=${userId}&status=SUCCESS`;
      
      // Use verified cancel URL from admin settings (for cancelled payments)
      const baseCancelUrl = paymentSettings.cancelUrl || `${paymentSettings.redirectUrl || "https://justbuygold.online"}/paymentcancel`;
      const cancelRedirectUrl = `${baseCancelUrl}?transactionId=${data._id}&userID=${userId}&status=CANCELLED`;
      
      // PhonePe uses single redirectUrl, but we'll use success URL as primary
      // The callback will handle status and redirect accordingly
      const redirectUrl = successRedirectUrl;
      
      console.log("🔗 Using Success Redirect URL:", successRedirectUrl);
      console.log("🚫 Using Cancel Redirect URL:", cancelRedirectUrl);
      console.log("✅ URL Verified:", paymentSettings.isVerified);
      
      // Store cancel URL in transaction for callback handling
      await transactionModel.findByIdAndUpdate(data._id, {
        $set: { cancelRedirectUrl: cancelRedirectUrl }
      });

      // Build the payment request
      const paymentRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100) // Convert to paise
        .redirectUrl(redirectUrl)
        .build();

      // Send payment request to PhonePe
      const response = await client.pay(paymentRequest);
      console.log("response", response)
      const checkoutUrl = response.redirectUrl;


      if (!checkoutUrl) {
        console.error("Invalid PhonePe response:", response);
        return res.status(500).json({ error: "PhonePe did not return a URL" });
      }

      return res.status(200).json({
        orderId: response.orderId,
        merchantID: merchantOrderId,
        url: checkoutUrl,
      });
    } catch (error) {
      console.error("Payment Error:", error);
      return res.status(500).json({ error: "Payment processing failed" });
    }
  }

  async addPaymentMobile(req, res) {
    let transaction; // Declare transaction here to fix the ReferenceError

    try {
      // Validate input
      const { userId, username, Mobile, orderId, amount } = req.body;
      if (!userId || !username || !Mobile || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create transaction record
      transaction = await transactionModel.create({
        userId,
        username,
        Mobile,
        orderId: orderId || `ORD_${Date.now()}`,
        amount,
        status: 'INITIATED'
      })

      // Prepare payment payload
      const paymentPayload = {
        merchantId: "M22IJ7E10A8LQ",
        merchantTransactionId: transaction._id.toString(),
        merchantUserId: userId,
        amount: amount * 100, // Convert to paise
        redirectUrl: `https://parikshashikshak.com/paymentsuccess?transactionId=${transaction._id}&userID=${userId}`,


        callbackUrl: "https://coorgtour.in/api/Teacher/checkPayment/" + transaction._id + "/" + userId,

        mobileNumber: Mobile,
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      }; 
      
      // Generate signature
      const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      const stringToHash = base64Payload + '/pg/v1/pay' + clientSecret;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex')+'###' + 1;
      const signature = sha256Hash + '###' + clientSecret;

      res.status(200).json({
        success: true,
        data: {
          transactionBody: base64Payload,
          checksum: sha256Hash,
          transactionId: transaction._id,
        },
      });

    } catch (error) {
      console.error("Payment Error:", error.message);

      // Update transaction status if it was created
      if (transaction) {
        await transactionModel.findByIdAndUpdate(transaction._id, {
          status: 'FAILED',
          error: error.response?.data?.message || error.message
        });
      }

      return res.status(500).json({
        error: "Payment processing error",
        details: error.response?.data || error.message
      });
    }
  }

  async updateStatuspayment(req, res) {
    try {
      let id = req.params.id;
      let data = await transactionModel.findById(id);
      if (!data) return res.status(400).json({ error: "Data not found" });
      data.status = "Completed";
      data.save();
      return res.status(200).json({ success: "Successfully Completed" });
    } catch (error) {
      console.log(error);
    }
  }

  async checkPayment(req, res) {
    try {

      let id = req.params.id;
      let userId = req.params.userId
      let data = await transactionModel.findById(id);
      if (!data) return res.status(400).json({ error: "Payment Id not found!" })
      client.getOrderStatus(id).then(async (response) => {
        const state = response.state;
        if (state == "COMPLETED") {
          sendReceipt(data.username,data.email,data.amount,data._id)
          if (data.config) {
            await axios(JSON.parse(data.config))
            data.config = null
          }
        }
        data.status = state;
        data = await data.save()
        return res.status(200).json({ success: data })
      }).catch((error) => {
        return res.status(400).json({ error: error })
      });

    } catch (error) {
      console.log(error)
      return res.status(400).json({ error: error.message })
    }
  }

  async paymentcallback(req, res) {
    const { response } = req.body;

    const decodedStr = Buffer.from(response, 'base64').toString('utf-8');

    // Parse JSON
    const responseJson = JSON.parse(decodedStr);
    console.log(responseJson?.data);
    const { merchantTransactionId, state } = responseJson?.data;

    // Log the callback data for debugging
    console.log(`📞 Callback received: Transaction ${merchantTransactionId}, Status: ${state}`);
    let data = await transactionModel.findById(merchantTransactionId);
    
    if (data) {
      data.status = state;
      
      if (state === 'COMPLETED') {
        // Payment successful
        console.log(`✅ Transaction ${merchantTransactionId} was successful.`);
        sendReceipt(data.username, data.email, data.amount, data._id);
        if (data.config) {
          try {
            await axios(JSON.parse(data.config));
            data.config = null;
          } catch (error) {
            console.error("Error executing config:", error);
          }
        }
      } else if (state === 'FAILED' || state === 'CANCELLED' || state === 'PENDING') {
        // Payment failed, cancelled, or pending
        console.log(`❌ Transaction ${merchantTransactionId} status: ${state}`);
        
        // Don't execute config for failed/cancelled payments
        if (state === 'FAILED' || state === 'CANCELLED') {
          console.log(`🚫 Payment ${state} - Config not executed`);
        }
      }
      
      await data.save();
    }

    // Send a response back to the payment gateway
    res.status(200).send('Callback processed');
  }

  async getallpayment(req, res) {
    try {
      let data = await transactionModel.find({}).sort({ _id: -1 });
      return res.status(200).json({ success: data });
    } catch (error) {
      console.log(error)
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

    const MERCHANT_ID = "SU2504081902438340731784";
    const SECRET_KEY = "61e1f611-8ad3-49d9-b449-4ec645bc5fc6";
    const CALLBACK_URL = "https://parikshashikshak.com";

    const paymentDetails = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      amount: amount,
      redirectUrl: CALLBACK_URL,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      mobileNumber: mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(paymentDetails);
    let objJsonB64 = Buffer.from(payload).toString("base64");
    const saltKey = SECRET_KEY; //test key
    const saltIndex = 1;
    const signature = generateSignature(payload, saltKey, saltIndex);

    try {
      const response = await axios.post(
        "https://api.phonepe.com/apis/hermes/pg/v1/pay",

        // "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
        {
          request: objJsonB64,
        },
        {
          headers: {
            "X-VERIFY": signature,
          },
        }
      );

      //   console.log(
      //     "Payment Response:",
      //     response.data,
      //     response.data?.data.instrumentResponse?.redirectInfo?.url
      //   );
      return res.status(200).json({
        url: response.data?.data.instrumentResponse?.redirectInfo,
      });
    } catch (error) {
      console.error("Payment Error:", error);
    }
  }

  // Get redirect URL based on transaction status
  async getRedirectUrl(req, res) {
    try {
      const { transactionId } = req.params;
      
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }

      const transaction = await transactionModel.findById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Get payment settings
      let paymentSettings = await PaymentSettingsModel.findOne();
      if (!paymentSettings) {
        paymentSettings = await PaymentSettingsModel.create({
          redirectUrl: "https://justbuygold.online",
          successUrl: "https://justbuygold.online/paymentsuccess",
          cancelUrl: "https://justbuygold.online/paymentcancel",
          isVerified: false,
        });
      }

      // Determine redirect URL based on transaction status
      let redirectUrl;
      const status = transaction.status?.toUpperCase();

      if (status === 'COMPLETED' || status === 'SUCCESS') {
        // Payment successful - use success URL
        const baseSuccessUrl = paymentSettings.successUrl || `${paymentSettings.redirectUrl || "https://justbuygold.online"}/paymentsuccess`;
        redirectUrl = `${baseSuccessUrl}?transactionId=${transactionId}&userID=${transaction.userId}&status=SUCCESS`;
      } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'CANCELLED') {
        // Payment failed or cancelled - use cancel URL
        const baseCancelUrl = transaction.cancelRedirectUrl || paymentSettings.cancelUrl || `${paymentSettings.redirectUrl || "https://justbuygold.online"}/paymentcancel`;
        redirectUrl = `${baseCancelUrl}?transactionId=${transactionId}&userID=${transaction.userId}&status=${status}`;
      } else {
        // Pending or other status - use cancel URL as fallback
        const baseCancelUrl = transaction.cancelRedirectUrl || paymentSettings.cancelUrl || `${paymentSettings.redirectUrl || "https://justbuygold.online"}/paymentcancel`;
        redirectUrl = `${baseCancelUrl}?transactionId=${transactionId}&userID=${transaction.userId}&status=${status || 'PENDING'}`;
      }

      return res.status(200).json({
        success: true,
        redirectUrl: redirectUrl,
        status: transaction.status,
        transactionId: transactionId
      });
    } catch (error) {
      console.error("Error getting redirect URL:", error);
      return res.status(500).json({ error: "Failed to get redirect URL" });
    }
  }

}

module.exports = new Transaction();


