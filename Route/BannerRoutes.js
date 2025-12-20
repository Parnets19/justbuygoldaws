const express = require('express');
const router = express.Router();
const bannerController = require('../Controller/BannerController');

// Get all banners for admin panel (must come before /:id routes)
router.get('/admin', bannerController.getAllBanners);

// Upload new banner
router.post('/upload', (req, res, next) => {
  bannerController.upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message
      });
    }
    next();
  });
}, bannerController.uploadBanner);

// Update existing banner
router.put('/:id', (req, res, next) => {
  bannerController.upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message
      });
    }
    next();
  });
}, bannerController.updateBanner);

// Delete banner
router.delete('/:id', bannerController.deleteBanner);

// Get banners for mobile app (must come last to avoid conflicts)
router.get('/', bannerController.getBanners);

module.exports = router;