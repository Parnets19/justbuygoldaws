const express = require("express");
const router = express.Router(); 
const fcm = require ("../Controller/FcmController");


router.post("/fcmToken", fcm.sendNotificationToEmployee);
router.post("/update-token" , fcm.updateFCMToken );
router.post("/register-device", fcm.registerDevice);
router.post("/test-notification", fcm.sendTestNotification);

module.exports = router;