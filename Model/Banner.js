const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);