const express = require("express");
const router = express.Router();

const AdminAuthcontroller = require("../../Controller/Admin/AdminAuth");

router.post("/register", AdminAuthcontroller.signup);
router.post("/login", AdminAuthcontroller.login);

module.exports = router;
