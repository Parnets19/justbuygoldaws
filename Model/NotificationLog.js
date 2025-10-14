const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  target: {
    type: String,
    required: true,
    enum: ['all', 'tokens', 'deviceIds']
  },
  tokens: [{
    type: String,
    trim: true
  }],
  deviceIds: [{
    type: String,
    trim: true
  }],
  sentAt: {
    type: Date,
    default: Date.now
  },
  successCount: {
    type: Number,
    default: 0,
    min: 0
  },
  failureCount: {
    type: Number,
    default: 0,
    min: 0
  },
  invalidTokens: [{
    type: String,
    trim: true
  }],
  totalTargeted: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  adminId: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationLogSchema.index({ sentAt: -1 });
notificationLogSchema.index({ status: 1 });
notificationLogSchema.index({ target: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);









