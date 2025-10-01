const express = require("express");
const router = express.Router();
const GoldController = require("../../Controller/Admin/GoldRate");

router.post("/addrate", GoldController.addrate);
router.put("/updaterate", GoldController.updaterate);
router.delete("/delete/:id", GoldController.deletrate);
router.get("/allrate", GoldController.getrate);

module.exports = router;
