const admin = require('firebase-admin');
const FcmToken = require('../Model/FcmToken');
const NotificationLog = require('../Model/NotificationLog');

// Constants
const MAX_TOKENS_PER_BATCH = 500;
const BATCH_DELAY_MS = 100; // Delay between batches to avoid rate limiting

/**
 * Send bulk push notifications with comprehensive error handling and logging
 */
const sendBulkNotification = async (req, res) => {
  try {
    console.log('📢 BULK NOTIFICATION: Starting bulk notification process');
    console.log('📦 BULK NOTIFICATION: Request body:', JSON.stringify(req.body, null, 2));

    const { title, body, imageUrl, target, tokens, deviceIds, adminId } = req.body;

    // Validate required fields
    if (!title || !body || !target) {
      console.log('❌ BULK NOTIFICATION: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, body, and target are required'
      });
    }

    // Validate target type
    if (!['all', 'tokens', 'deviceIds'].includes(target)) {
      console.log('❌ BULK NOTIFICATION: Invalid target type:', target);
      return res.status(400).json({
        success: false,
        error: 'Invalid target. Must be one of: all, tokens, deviceIds'
      });
    }

    // Validate tokens/deviceIds based on target
    if (target === 'tokens' && (!tokens || !Array.isArray(tokens) || tokens.length === 0)) {
      console.log('❌ BULK NOTIFICATION: No tokens provided for tokens target');
      return res.status(400).json({
        success: false,
        error: 'Tokens array is required when target is "tokens"'
      });
    }

    if (target === 'deviceIds' && (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0)) {
      console.log('❌ BULK NOTIFICATION: No deviceIds provided for deviceIds target');
      return res.status(400).json({
        success: false,
        error: 'DeviceIds array is required when target is "deviceIds"'
      });
    }

    // Create notification log entry
    const notificationLog = new NotificationLog({
      title: title.trim(),
      body: body.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : null,
      target,
      tokens: tokens || [],
      deviceIds: deviceIds || [],
      adminId: adminId || null,
      status: 'processing'
    });

    await notificationLog.save();
    console.log('📝 BULK NOTIFICATION: Created notification log with ID:', notificationLog._id);

    // Fetch FCM tokens based on target
    let fcmTokens = [];
    let totalTargeted = 0;

    try {
      switch (target) {
        case 'all':
          console.log('🎯 BULK NOTIFICATION: Fetching all FCM tokens');
          const allTokens = await FcmToken.find({}, 'fcmToken').lean();
          fcmTokens = allTokens.map(token => token.fcmToken).filter(Boolean);
          totalTargeted = fcmTokens.length;
          console.log(`📊 BULK NOTIFICATION: Found ${totalTargeted} total tokens`);
          break;

        case 'tokens':
          console.log('🎯 BULK NOTIFICATION: Using provided tokens');
          fcmTokens = tokens.filter(token => token && token.trim());
          totalTargeted = fcmTokens.length;
          console.log(`📊 BULK NOTIFICATION: Using ${totalTargeted} provided tokens`);
          break;

        case 'deviceIds':
          console.log('🎯 BULK NOTIFICATION: Fetching tokens by deviceIds');
          const deviceTokens = await FcmToken.find(
            { deviceId: { $in: deviceIds } },
            'fcmToken deviceId'
          ).lean();
          fcmTokens = deviceTokens.map(token => token.fcmToken).filter(Boolean);
          totalTargeted = fcmTokens.length;
          console.log(`📊 BULK NOTIFICATION: Found ${totalTargeted} tokens for ${deviceIds.length} deviceIds`);
          break;
      }

      // Update notification log with total targeted
      notificationLog.totalTargeted = totalTargeted;
      await notificationLog.save();

      if (fcmTokens.length === 0) {
        console.log('⚠️ BULK NOTIFICATION: No valid FCM tokens found');
        notificationLog.status = 'completed';
        notificationLog.errorMessage = 'No valid FCM tokens found';
        await notificationLog.save();

        return res.status(200).json({
          success: true,
          message: 'No valid FCM tokens found',
          data: {
            notificationLogId: notificationLog._id,
            totalTargeted: 0,
            successCount: 0,
            failureCount: 0,
            invalidTokens: []
          }
        });
      }

      // Prepare notification message
      const message = {
        notification: {
          title: title.trim(),
          body: body.trim()
          // Remove imageUrl from notification object as blob URLs are not valid for FCM
        },
        data: {
          title: title.trim(),
          body: body.trim(),
          timestamp: new Date().toISOString(),
          type: 'bulk_notification'
          // Remove imageUrl from data as blob URLs are not valid for FCM
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'justbuygold-channel',
            priority: 'high'
            // Remove imageUrl from android notification as blob URLs are not valid for FCM
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
              // Remove mutable-content as we're not using images
            }
          }
        }
      };

      // Only add image if it's a valid HTTP/HTTPS URL (not blob)
      if (imageUrl && imageUrl.trim() && !imageUrl.startsWith('blob:')) {
        message.notification.imageUrl = imageUrl.trim();
        message.data.imageUrl = imageUrl.trim();
        message.android.notification.imageUrl = imageUrl.trim();
        message.apns.payload.aps['mutable-content'] = 1;
      }

      console.log('📦 BULK NOTIFICATION: Prepared message:', JSON.stringify(message, null, 2));

      // Send notifications in batches
      const results = await sendNotificationsInBatches(fcmTokens, message, notificationLog._id);
      
      // Update notification log with final results
      notificationLog.successCount = results.successCount;
      notificationLog.failureCount = results.failureCount;
      notificationLog.invalidTokens = results.invalidTokens;
      notificationLog.status = 'completed';
      await notificationLog.save();

      console.log('✅ BULK NOTIFICATION: Process completed successfully');
      console.log(`📊 BULK NOTIFICATION: Success: ${results.successCount}, Failures: ${results.failureCount}`);

      res.status(200).json({
        success: true,
        message: 'Bulk notification sent successfully',
        data: {
          notificationLogId: notificationLog._id,
          totalTargeted: totalTargeted,
          successCount: results.successCount,
          failureCount: results.failureCount,
          invalidTokens: results.invalidTokens,
          batches: results.batches
        }
      });

    } catch (fetchError) {
      console.error('❌ BULK NOTIFICATION: Error fetching tokens:', fetchError);
      notificationLog.status = 'failed';
      notificationLog.errorMessage = fetchError.message;
      await notificationLog.save();

      res.status(500).json({
        success: false,
        error: 'Failed to fetch FCM tokens',
        details: fetchError.message
      });
    }

  } catch (error) {
    console.error('💥 BULK NOTIFICATION: Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Send notifications in batches to respect FCM limits
 */
const sendNotificationsInBatches = async (tokens, message, logId) => {
  console.log(`📦 BATCH SENDING: Starting batch sending for ${tokens.length} tokens`);
  
  const batches = [];
  const results = {
    successCount: 0,
    failureCount: 0,
    invalidTokens: [],
    batches: []
  };

  // Split tokens into batches
  for (let i = 0; i < tokens.length; i += MAX_TOKENS_PER_BATCH) {
    const batch = tokens.slice(i, i + MAX_TOKENS_PER_BATCH);
    batches.push(batch);
  }

  console.log(`📦 BATCH SENDING: Created ${batches.length} batches`);

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 BATCH ${i + 1}/${batches.length}: Processing ${batch.length} tokens`);

    try {
      // Add delay between batches to avoid rate limiting
      if (i > 0) {
        console.log(`⏳ BATCH SENDING: Waiting ${BATCH_DELAY_MS}ms before next batch`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }

      // Send to each token individually since sendMulticast might not be available
      const responses = [];
      const batchResults = {
        successCount: 0,
        failureCount: 0,
        invalidTokens: []
      };

      for (const token of batch) {
        try {
          const singleMessage = {
            ...message,
            token: token
          };

          const response = await admin.messaging().send(singleMessage);
          responses.push({ success: true, token, response });
          batchResults.successCount++;
        } catch (error) {
          console.log(`❌ BATCH ${i + 1}: Token failed:`, {
            token: token.substring(0, 20) + '...',
            error: error.code || error.message
          });
          
          responses.push({ success: false, token, error });
          batchResults.failureCount++;
          
          // Check if token is invalid
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            batchResults.invalidTokens.push(token);
          }
        }
      }

      const response = {
        successCount: batchResults.successCount,
        failureCount: batchResults.failureCount,
        responses: responses
      };
      
      console.log(`📦 BATCH ${i + 1}: FCM Response:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses.length
      });

      // Update results with batch results
      results.successCount += batchResults.successCount;
      results.failureCount += batchResults.failureCount;
      results.invalidTokens.push(...batchResults.invalidTokens);

      const batchResult = {
        batchNumber: i + 1,
        tokenCount: batch.length,
        successCount: batchResults.successCount,
        failureCount: batchResults.failureCount,
        invalidTokens: batchResults.invalidTokens
      };

      results.batches.push(batchResult);
      console.log(`✅ BATCH ${i + 1}: Completed - Success: ${batchResults.successCount}, Failures: ${batchResults.failureCount}`);

    } catch (batchError) {
      console.error(`💥 BATCH ${i + 1}: Error processing batch:`, batchError);
      results.failureCount += batch.length;
      
      results.batches.push({
        batchNumber: i + 1,
        tokenCount: batch.length,
        successCount: 0,
        failureCount: batch.length,
        error: batchError.message
      });
    }
  }

  console.log(`📊 BATCH SENDING: Final results - Success: ${results.successCount}, Failures: ${results.failureCount}`);
  return results;
};

/**
 * Get notification logs with pagination
 */
const getNotificationLogs = async (req, res) => {
  try {
    console.log('📋 NOTIFICATION LOGS: Fetching notification logs');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await NotificationLog.find()
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await NotificationLog.countDocuments();

    console.log(`📋 NOTIFICATION LOGS: Found ${logs.length} logs (page ${page}/${Math.ceil(total / limit)})`);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalLogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('💥 NOTIFICATION LOGS: Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification logs',
      details: error.message
    });
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    console.log('📊 NOTIFICATION STATS: Fetching statistics');

    const totalNotifications = await NotificationLog.countDocuments();
    const totalSent = await NotificationLog.aggregate([
      { $group: { _id: null, total: { $sum: '$successCount' } } }
    ]);
    const totalFailed = await NotificationLog.aggregate([
      { $group: { _id: null, total: { $sum: '$failureCount' } } }
    ]);

    const recentStats = await NotificationLog.aggregate([
      {
        $match: {
          sentAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          successCount: { $sum: '$successCount' },
          failureCount: { $sum: '$failureCount' }
        }
      }
    ]);

    const stats = {
      totalNotifications,
      totalSent: totalSent[0]?.total || 0,
      totalFailed: totalFailed[0]?.total || 0,
      last7Days: recentStats[0] || { count: 0, successCount: 0, failureCount: 0 }
    };

    console.log('📊 NOTIFICATION STATS: Statistics calculated:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('💥 NOTIFICATION STATS: Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics',
      details: error.message
    });
  }
};

module.exports = {
  sendBulkNotification,
  getNotificationLogs,
  getNotificationStats
};
