const Banner = require('../Model/Banner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../Public/Banners');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all banners (for mobile app)
const getBanners = async (req, res) => {
  try {
    console.log("📱 BANNER: Fetching banners for mobile app");
    
    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 banners for performance

    // Convert to full URLs for mobile app
    const bannersWithUrls = banners.map(banner => ({
      _id: banner._id,
      imageUrl: `https://justbuygold.online/Banners/${path.basename(banner.imagePath)}`,
      createdAt: banner.createdAt
    }));

    console.log("✅ BANNER: Found", banners.length, "banners");
    
    res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: bannersWithUrls
    });
  } catch (error) {
    console.error("❌ BANNER: Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message
    });
  }
};

// Get all banners for admin panel
const getAllBanners = async (req, res) => {
  try {
    console.log("🔧 ADMIN: Fetching all banners for admin panel");
    
    const banners = await Banner.find()
      .sort({ createdAt: -1 });

    // Convert to full URLs for admin panel
    const bannersWithUrls = banners.map(banner => ({
      _id: banner._id,
      imageUrl: `https://justbuygold.online/Banners/${path.basename(banner.imagePath)}`,
      createdAt: banner.createdAt
    }));

    console.log("✅ ADMIN: Found", banners.length, "total banners");
    
    res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: bannersWithUrls
    });
  } catch (error) {
    console.error("❌ ADMIN: Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message
    });
  }
};

// Upload new banner (adds to collection)
const uploadBanner = async (req, res) => {
  try {
    console.log("🔧 ADMIN: Uploading new banner");
    
    if (!req.file) {
      console.log("❌ ADMIN: No image file provided");
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    console.log("📁 ADMIN: File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Create new banner
    const banner = new Banner({
      imagePath: req.file.path
    });
    await banner.save();

    console.log("✅ ADMIN: Banner uploaded successfully:", banner._id);

    res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      data: {
        _id: banner._id,
        imageUrl: `https://justbuygold.online/Banners/${path.basename(banner.imagePath)}`,
        createdAt: banner.createdAt
      }
    });
  } catch (error) {
    console.error("❌ ADMIN: Error uploading banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload banner",
      error: error.message
    });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    console.log("🔧 ADMIN: Deleting banner");
    console.log("📦 ADMIN: Banner ID:", req.params.id);
    console.log("📦 ADMIN: Request params:", req.params);
    
    const { id } = req.params;

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      console.log("❌ ADMIN: Invalid banner ID provided");
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID"
      });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      console.log("❌ ADMIN: Banner not found");
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    // Delete the file from filesystem
    try {
      if (fs.existsSync(banner.imagePath)) {
        fs.unlinkSync(banner.imagePath);
        console.log("✅ ADMIN: Image file deleted from filesystem");
      }
    } catch (fileError) {
      console.log("⚠️ ADMIN: Could not delete image file:", fileError.message);
    }

    // Delete from database
    await Banner.findByIdAndDelete(id);

    console.log("✅ ADMIN: Banner deleted successfully:", banner._id);
    
    res.status(200).json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    console.error("❌ ADMIN: Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message
    });
  }
};

module.exports = {
  upload,
  getBanners,
  getAllBanners,
  uploadBanner,
  deleteBanner
};