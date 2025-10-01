const express = require("express");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

//middleware+++++++++++++++++++++++++++++++++++++++++++++++++++
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("Public"));

// Router++++++++++++++++++++++++++++++++++++++++

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



// const dbUri = "mongodb://localhost:27017/justbuygoldb_justbuygoldb";
const dbUri = "mongodb+srv://parnetstech13_db_user:ApLEMJoHhxuIjuYv@cluster0.pi17mzu.mongodb.net/";
mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB is Connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));


app.get("/", (req, res) => {
  res.send("Hello Just Buy Gold");
});

const PORT = 3034;

app.listen(PORT, () => {
  console.log(`Server is runing http://localhost:${PORT}`);
});
