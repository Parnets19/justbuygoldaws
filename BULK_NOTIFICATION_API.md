# Bulk Notification API Documentation

## Overview
This API provides comprehensive bulk push notification functionality for the JustBuyGold admin panel using Firebase Cloud Messaging (FCM).

## Base URL
```
http://192.168.1.49:3034/api/admin/notifications
```

## Endpoints

### 1. Send Bulk Notification
**POST** `/send-notification`

Sends bulk push notifications to multiple devices with support for images and different targeting options.

#### Request Body
```json
{
  "title": "string (required)",
  "body": "string (required)", 
  "imageUrl": "string (optional)",
  "target": "all | tokens | deviceIds (required)",
  "tokens": ["token1", "token2"] (required if target = "tokens"),
  "deviceIds": ["device1", "device2"] (required if target = "deviceIds"),
  "adminId": "string (optional)"
}
```

#### Target Options
- **`all`**: Send to all registered FCM tokens in the database
- **`tokens`**: Send to specific FCM tokens provided in the request
- **`deviceIds`**: Send to devices with specific device IDs

#### Example Requests

**Send to all users:**
```json
{
  "title": "🎉 Special Gold Offer!",
  "body": "Get 10% off on all gold coins this weekend!",
  "imageUrl": "https://example.com/gold-offer.jpg",
  "target": "all",
  "adminId": "admin123"
}
```

**Send to specific tokens:**
```json
{
  "title": "Welcome Back!",
  "body": "We missed you! Check out our latest gold collection.",
  "target": "tokens",
  "tokens": [
    "fcm_token_1_here",
    "fcm_token_2_here"
  ]
}
```

**Send to specific devices:**
```json
{
  "title": "Device-specific notification",
  "body": "This is a targeted message for specific devices.",
  "target": "deviceIds",
  "deviceIds": [
    "device_id_1",
    "device_id_2"
  ]
}
```

#### Response
```json
{
  "success": true,
  "message": "Bulk notification sent successfully",
  "data": {
    "notificationLogId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "totalTargeted": 1500,
    "successCount": 1450,
    "failureCount": 50,
    "invalidTokens": ["invalid_token_1", "invalid_token_2"],
    "batches": [
      {
        "batchNumber": 1,
        "tokenCount": 500,
        "successCount": 480,
        "failureCount": 20,
        "invalidTokens": ["invalid_token_1"]
      },
      {
        "batchNumber": 2,
        "tokenCount": 500,
        "successCount": 490,
        "failureCount": 10,
        "invalidTokens": ["invalid_token_2"]
      }
    ]
  }
}
```

### 2. Get Notification Logs
**GET** `/logs`

Retrieves paginated notification logs with detailed information.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Example Request
```
GET /logs?page=1&limit=20
```

#### Response
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "🎉 Special Gold Offer!",
        "body": "Get 10% off on all gold coins this weekend!",
        "imageUrl": "https://example.com/gold-offer.jpg",
        "target": "all",
        "tokens": [],
        "deviceIds": [],
        "sentAt": "2023-09-06T10:30:00.000Z",
        "successCount": 1450,
        "failureCount": 50,
        "invalidTokens": ["invalid_token_1"],
        "totalTargeted": 1500,
        "status": "completed",
        "errorMessage": null,
        "adminId": "admin123",
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:05.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalLogs": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Notification Statistics
**GET** `/stats`

Retrieves comprehensive notification statistics.

#### Response
```json
{
  "success": true,
  "data": {
    "totalNotifications": 150,
    "totalSent": 125000,
    "totalFailed": 5000,
    "last7Days": {
      "count": 25,
      "successCount": 20000,
      "failureCount": 800
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: title, body, and target are required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Detailed error message"
}
```

## Features

### ✅ Implemented Features
1. **Firebase Admin SDK Integration**: Uses Firebase Admin SDK for reliable message delivery
2. **MongoDB Token Management**: Fetches FCM tokens from MongoDB with user/device associations
3. **Multiple Targeting Options**: Support for all users, specific tokens, or device IDs
4. **Image Support**: Rich notifications with image support via imageUrl
5. **Batch Processing**: Automatically batches tokens (max 500 per request) to respect FCM limits
6. **Comprehensive Logging**: All notifications are logged in MongoDB with detailed metrics
7. **Error Handling**: Robust error handling with detailed error responses
8. **Rate Limiting Protection**: Built-in delays between batches to prevent rate limiting
9. **Invalid Token Management**: Automatically identifies and reports invalid tokens
10. **Statistics & Analytics**: Comprehensive statistics and paginated log viewing

### 🔧 Technical Details
- **Max Tokens Per Batch**: 500 (FCM limit)
- **Batch Delay**: 100ms between batches
- **Notification Channel**: "justbuygold-channel"
- **Priority**: High priority for immediate delivery
- **Sound**: Default notification sound
- **Vibration**: Enabled for Android devices

### 📱 Notification Format
- **Foreground**: Shows as system notification with image support
- **Background**: Delivered via FCM background handler
- **Data Payload**: Includes timestamp and type information
- **Cross-Platform**: Works on both Android and iOS

## Usage Examples

### cURL Examples

**Send to all users:**
```bash
curl -X POST http://192.168.1.49:3034/api/admin/notifications/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Special Offer!",
    "body": "Get 10% off on all gold coins this weekend!",
    "imageUrl": "https://example.com/offer.jpg",
    "target": "all",
    "adminId": "admin123"
  }'
```

**Send to specific tokens:**
```bash
curl -X POST http://192.168.1.49:3034/api/admin/notifications/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Back!",
    "body": "Check out our latest collection.",
    "target": "tokens",
    "tokens": ["token1", "token2"]
  }'
```

**Get notification logs:**
```bash
curl -X GET "http://192.168.1.49:3034/api/admin/notifications/logs?page=1&limit=10"
```

**Get statistics:**
```bash
curl -X GET http://192.168.1.49:3034/api/admin/notifications/stats
```

## Database Schema

### NotificationLog Collection
```javascript
{
  title: String (required),
  body: String (required),
  imageUrl: String (optional),
  target: String (required, enum: ['all', 'tokens', 'deviceIds']),
  tokens: [String],
  deviceIds: [String],
  sentAt: Date (default: now),
  successCount: Number (default: 0),
  failureCount: Number (default: 0),
  invalidTokens: [String],
  totalTargeted: Number (default: 0),
  status: String (enum: ['pending', 'processing', 'completed', 'failed']),
  errorMessage: String (optional),
  adminId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations
- All endpoints should be protected with admin authentication
- Input validation prevents malicious payloads
- Rate limiting prevents abuse
- Comprehensive logging for audit trails
- Error messages don't expose sensitive information

## Performance Notes
- Batch processing ensures efficient delivery to large user bases
- MongoDB indexes optimize query performance
- Asynchronous processing prevents blocking
- Memory-efficient token handling for large datasets
