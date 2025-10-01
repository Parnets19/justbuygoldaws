const express = require("express");
const router = express.Router();
const VideoController = require("../../Controller/Admin/PromoVideo");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, "Public/Video");
  },
  filename: function (req, file, cd) {
    cd(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/addvideo", upload.any(), VideoController.addvideo);
router.put("/updatevideo", upload.any(), VideoController.updateVideo);
router.delete("/deletevideo/:id", VideoController.removeVideo);
router.get("/allvideo", VideoController.getVideo);

module.exports = router;
