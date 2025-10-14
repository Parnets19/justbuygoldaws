const express = require("express");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");


app.use(cors());
app.use(morgan("dev"));

// Enhanced request logging middleware


app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static("Public"));
app.use('/Banners', express.static(path.join(__dirname, 'Public/Banners')));



const UserRouter = require("./Route/Auth");
const GoldeRateRouter = require("./Route/Admin/GoldRate");
const VideoRouter = require("./Route/Admin/PromoVideo");
const GstRouter = require("./Route/Admin/Gst");
const Transaction = require("./Route/Admin/Transaction");
const AdminAuthRouter = require("./Route/Admin/AdminAuth");
const CoinRouter = require("./Route/Admin/Coins");
const Referral = require("./Route/Admin/Refferal");
const Referralprice = require("./Route/Admin/RefferalPrice");
const walletHistoryRoutes = require("./Route/Admin/WalletHistory"); 
const fcmRoutes = require("./Route/FcmRoutes");
const bulkNotificationRoutes = require("./Route/BulkNotificationRoutes");
const bannerRoutes = require("./Route/BannerRoutes");

app.use("/api/v1/user/auth", UserRouter);
app.use("/api/v1/rate", GoldeRateRouter);
app.use("/api/v1/video", VideoRouter);
app.use("/api/v1/gst", GstRouter);
app.use("/api/v1/transactions", Transaction);
app.use("/api/v1/admin", AdminAuthRouter);
app.use("/api/v1/coins", CoinRouter);
app.use("/api/v1", Referral);
app.use("/api/v1", Referralprice);
app.use("/api/v1", walletHistoryRoutes); 
app.use("/api/user", fcmRoutes);
app.use("/api/admin/notifications", bulkNotificationRoutes);
app.use("/api/banners", bannerRoutes);



// Database connection with enhanced logging
console.log("🔗 ATTEMPTING DATABASE CONNECTION...");
console.log("📊 Database URI:", "mongodb+srv://parnetstech13_db_user:***@cluster0.pi17mzu.mongodb.net/");

// const dbUri = "mongodb://localhost:27017/justbuygoldb_justbuygoldb";
const dbUri = "mongodb+srv://parnetstech13_db_user:ApLEMJoHhxuIjuYv@cluster0.pi17mzu.mongodb.net/";

mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ DATABASE CONNECTION SUCCESSFUL");
    console.log("📊 Connected to MongoDB Atlas");
    console.log("🔗 Connection state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:");
    console.error("❌ Error message:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Full error:", err);
  });


app.use(express.static(path.join(__dirname, 'build'))); // Change 'build' to your frontend folder if needed

// Redirect all requests to the index.html file

app.get("*", (req, res) => {
  return  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3034;

console.log("🚀 STARTING SERVER...");
console.log("🌐 Port:", PORT);
console.log("📡 Environment:", process.env.NODE_ENV || "development");

app.listen(PORT, () => {
  console.log("✅ SERVER STARTED SUCCESSFULLY");
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log("📋 Available endpoints:");
  console.log("   🔐 Auth: /api/v1/user/auth/signin");
  console.log("   📝 Signup: /api/v1/user/auth/signup");
  console.log("   📱 OTP Login: /api/v1/user/auth/otp");
  console.log("   ✅ OTP Verify: /api/v1/user/auth/otpVarification");
  console.log("   📢 Bulk Notifications: /api/admin/notifications/send-notification");
  console.log("   📋 Notification Logs: /api/admin/notifications/logs");
  console.log("   📊 Notification Stats: /api/admin/notifications/stats");
  console.log("   🖼️ Active Banners: /api/banners/active");
  console.log("   🔧 Banner Management: /api/banners");
  console.log("🔧 Server ready to handle requests");
});
