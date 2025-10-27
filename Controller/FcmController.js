const FCMtoken = require("../Model/FcmToken")
const User = require("../Model/User/Auth")
const admin = require("firebase-admin");
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK with error handling
let db = null;
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
    }); 
  }
  // Initialize Firestore
  db = admin.firestore();
  console.log("✅ FCM BACKEND: Firebase Admin SDK initialized successfully");
} catch (firebaseError) {
  console.log("⚠️ FCM BACKEND: Firebase initialization failed:", firebaseError.message);
  console.log("⚠️ FCM BACKEND: Continuing without Firebase features");
}

// New endpoint for device registration
exports.registerDevice = async (req, res) => {
  try {
    console.log("🔥 FCM BACKEND: Device registration request received");
    console.log("📦 FCM BACKEND: Request body:", req.body);
    
    const { userId, deviceId, fcmToken, platform } = req.body;

    if (!userId || !deviceId || !fcmToken) {
      console.log("❌ FCM BACKEND: Missing required fields");
      console.log("🆔 User ID:", !!userId);
      console.log("📱 Device ID:", !!deviceId);
      console.log("🔑 FCM Token:", !!fcmToken);
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, deviceId, fcmToken"
      });
    }

    console.log("✅ FCM BACKEND: All required fields present");
    console.log("🔍 FCM BACKEND: Looking up user:", userId);

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ FCM BACKEND: User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ FCM BACKEND: User found:", user.name);

    // Store in Firestore userDevices collection
    const deviceData = {
      userId,
      deviceId,
      fcmToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      platform: platform || 'android' // Default to android
    };

    console.log("💾 FCM BACKEND: Storing device data in Firestore:", deviceData);

    // Use deviceId as document ID to ensure uniqueness
    try {
      if (db) {
        await db.collection('userDevices').doc(deviceId).set(deviceData);
        console.log("✅ FCM BACKEND: Device data stored in Firestore");
      } else {
        console.log("⚠️ FCM BACKEND: Firestore not initialized, skipping Firestore storage");
      }
    } catch (firestoreError) {
      console.log("⚠️ FCM BACKEND: Firestore not available, using MongoDB only:", firestoreError.message);
      // Continue with MongoDB only if Firestore fails
    }

    // Also update MongoDB for backward compatibility
    console.log("💾 FCM BACKEND: Updating MongoDB FCM token record");
    const fcmTokenRecord = await FCMtoken.findOneAndUpdate(
      { employeeId: userId },
      {
        fcmToken,
        deviceId,
        platform: deviceData.platform,
        isActive: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log("✅ FCM BACKEND: MongoDB FCM token record updated");

    console.log("🎉 FCM BACKEND: Device registration successful");
    
    // Send welcome notification only for new registrations
    try {
      const userName = user.name || user.email || 'User';
      console.log("👤 FCM BACKEND: User name for notification:", userName);
      
      // Check if this is a new registration or update
      // For new user accounts, always send welcome notification
      // For existing users, only send if it's been more than 1 hour since last update
      const isNewUserRegistration = !fcmTokenRecord.employeeId || fcmTokenRecord.employeeId !== userId;
      const isLongTimeSinceUpdate = !fcmTokenRecord.lastUpdated || 
        (new Date() - new Date(fcmTokenRecord.lastUpdated)) > 3600000; // 1 hour threshold
      
      if (isNewUserRegistration || isLongTimeSinceUpdate) {
        console.log("🎉 FCM BACKEND: New user registration or long-time update detected, sending welcome notification");
        console.log("🔍 FCM BACKEND: isNewUserRegistration:", isNewUserRegistration);
        console.log("🔍 FCM BACKEND: isLongTimeSinceUpdate:", isLongTimeSinceUpdate);
        await sendWelcomeNotification(fcmToken, userName);
        console.log("✅ FCM BACKEND: Welcome notification sent");
      } else {
        console.log("🔄 FCM BACKEND: Recent token update detected, skipping welcome notification");
      }
    } catch (notificationError) {
      console.log("⚠️ FCM BACKEND: Welcome notification failed (non-critical):", notificationError.message);
    }
    
    res.json({
      success: true,
      message: "Device registered successfully",
      data: {
        deviceId,
        tokenId: fcmTokenRecord._id
      }
    });
  } catch (error) {
    console.log("💥 FCM BACKEND: Device registration error");
    console.error("❌ FCM BACKEND: Error details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during device registration",
      error: error.message
    });
  }
};
exports.updateFCMToken = async (req, res) => {
  try {
    console.log("🔄 FCM BACKEND: Token update request received");
    console.log("📦 FCM BACKEND: Request body:", req.body);
    
    const { userId, fcmToken, deviceId, platform } = req.body;

    if (!userId || !fcmToken || !deviceId) {
      console.log("❌ FCM BACKEND: Missing required fields for token update");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, fcmToken, deviceId"
      });
    }

    console.log("✅ FCM BACKEND: All required fields present for token update");

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ FCM BACKEND: User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ FCM BACKEND: User found:", user.name);

    const fcmTokenRecord = await FCMtoken.findOneAndUpdate(
      { employeeId: userId }, 
      {
        fcmToken: fcmToken,
        deviceId,
        platform: platform || 'android',
        isActive: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "FCM token updated successfully",
      data: { tokenId: fcmTokenRecord._id }
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 
exports.sendNotificationToEmployee = async(req,res) => {
     const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing token, title, or body' });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      type: 'employee_notification',
    },
  };
  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('FCM Error:', error);
    res.status(500).json({ success: false, error });
  }
}


exports.sendBulkNotification = async (req, res) => {
  const { employeeIds, title, body } = req.body;

  if (!employeeIds || !Array.isArray(employeeIds) || !title || !body) {
    return res.status(400).json({ error: 'employeeIds (array), title, and body are required' });
  }

  try {
    // Fetch active tokens from DB
    const fcmRecords = await FCMtoken.find({
      employeeId: { $in: employeeIds },
      isActive: true
    });

    const tokens = fcmRecords.map(record => record.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid FCM tokens found' });
    }

    const message = {
      notification: { title, body },
      data: { type: 'bulk_notification' },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    const { successCount, failureCount, responses } = response;

    res.status(200).json({
      success: true,
      message: 'Bulk notification sent',
      successCount,
      failureCount,
      responses
    });
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Test notification function
exports.sendTestNotification = async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId && !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Either userId or deviceId is required"
      });
    }

    let fcmToken = null;

    if (deviceId) {
      // Get token from Firestore using deviceId
      const deviceDoc = await db.collection('userDevices').doc(deviceId).get();
      if (deviceDoc.exists) {
        fcmToken = deviceDoc.data().fcmToken;
      }
    } else if (userId) {
      // Get token from MongoDB using userId
      const fcmRecord = await FCMtoken.findOne({
        employeeId: userId,
        isActive: true
      });
      if (fcmRecord) {
        fcmToken = fcmRecord.fcmToken;
      }
    }

    if (!fcmToken) {
      return res.status(404).json({
        success: false,
        message: "FCM token not found for the specified user/device"
      });
    }

    const message = {
      token: fcmToken,
      notification: {
        title: "Registration Successful",
        body: "Welcome! Notifications are enabled."
      },
      data: {
        type: 'test_notification',
        timestamp: new Date().toISOString()
      }
    };

    const response = await admin.messaging().send(message); 
    
    res.status(200).json({
      success: true,
      message: "Test notification sent successfully",
      data: {
        messageId: response,
        fcmToken: fcmToken.substring(0, 20) + '...' // Show partial token for verification
      }
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Helper function to send welcome notification
const sendWelcomeNotification = async (fcmToken, userName) => {
  try {
    console.log("📱 FCM BACKEND: Sending welcome notification to:", fcmToken);
    console.log("👤 FCM BACKEND: User name:", userName);
    
    // Ensure userName is not undefined
    const displayName = userName && userName !== 'undefined' ? userName : 'User';
    
    const message = {
      token: fcmToken,
      notification: {
        title: "🎉 Welcome to JustBuyGold!",
        body: `Hi ${displayName}! Welcome to JustBuyGold. Start your gold investment journey today!`
      },
      data: {
        type: 'welcome',
        userId: 'system',
        timestamp: new Date().toISOString(),
        action: 'open_app'
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'justbuygold-channel',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    console.log("📦 FCM BACKEND: Notification message:", JSON.stringify(message, null, 2));

    const response = await admin.messaging().send(message);
    console.log("✅ FCM BACKEND: Welcome notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ FCM BACKEND: Failed to send welcome notification:", error);
    throw error;
  }
};