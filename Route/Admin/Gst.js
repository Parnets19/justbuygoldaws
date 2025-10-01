const express = require("express");
const router = express.Router();

const GstController = require("../../Controller/Admin/Gst");

router.post("/addGst", GstController.addgst);
router.get("/getGst", GstController.getGst);

router.put("/editGst/:id", GstController.editGst);
router.delete("/deleteGst/:id", GstController.deleteGst);

module.exports = router;
