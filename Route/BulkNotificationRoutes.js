const express = require('express');
const router = express.Router();
const {
  sendBulkNotification,
  getNotificationLogs,
  getNotificationStats
} = require('../Controller/BulkNotificationController');

// Middleware for request validation
const validateBulkNotificationRequest = (req, res, next) => {
  console.log('🔍 VALIDATION: Validating bulk notification request');
  
  const { title, body, target } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be a non-empty string'
    });
  }
  
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Body is required and must be a non-empty string'
    });
  }
  
  if (!target || !['all', 'tokens', 'deviceIds'].includes(target)) {
    return res.status(400).json({
      success: false,
      error: 'Target is required and must be one of: all, tokens, deviceIds'
    });
  }
  
  // Validate tokens array if target is 'tokens'
  if (target === 'tokens') {
    const { tokens } = req.body;
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tokens array is required when target is "tokens"'
      });
    }
    
    // Validate each token
    const invalidTokens = tokens.filter(token => 
      !token || typeof token !== 'string' || token.trim().length === 0
    );
    
    if (invalidTokens.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'All tokens must be non-empty strings'
      });
    }
  }
  
  // Validate deviceIds array if target is 'deviceIds'
  if (target === 'deviceIds') {
    const { deviceIds } = req.body;
    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'DeviceIds array is required when target is "deviceIds"'
      });
    }
    
    // Validate each deviceId
    const invalidDeviceIds = deviceIds.filter(deviceId => 
      !deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0
    );
    
    if (invalidDeviceIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'All deviceIds must be non-empty strings'
      });
    }
  }
  
  // Validate imageUrl if provided
  if (req.body.imageUrl) {
    const { imageUrl } = req.body;
    if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ImageUrl must be a non-empty string'
      });
    }
    
    // Basic URL validation
    try {
      new URL(imageUrl.trim());
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'ImageUrl must be a valid URL'
      });
    }
  }
  
  console.log('✅ VALIDATION: Request validation passed');
  next();
};

// Routes
router.post('/send-notification', validateBulkNotificationRequest, sendBulkNotification);
router.get('/logs', getNotificationLogs);
router.get('/stats', getNotificationStats);

module.exports = router;
