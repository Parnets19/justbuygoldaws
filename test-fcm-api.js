const axios = require('axios');

const BASE_URL = 'http://localhost:3034/api/user';

// Test data
const testData = {
  userId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId
  deviceId: 'test-device-12345',
  fcmToken: 'test-fcm-token-abcdef123456'
};

async function testRegisterDevice() {
  try {
    console.log('Testing register-device endpoint...');
    const response = await axios.post(`${BASE_URL}/register-device`, testData);
    console.log('✅ Register Device Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Register Device Error:', error.response?.data || error.message);
    return false;
  }
}

async function testSendNotification() {
  try {
    console.log('Testing test-notification endpoint...');
    const response = await axios.post(`${BASE_URL}/test-notification`, {
      userId: testData.userId,
      deviceId: testData.deviceId
    });
    console.log('✅ Test Notification Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Test Notification Error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting FCM API Tests...\n');
  
  const registerSuccess = await testRegisterDevice();
  console.log('');
  
  if (registerSuccess) {
    await testSendNotification();
  }
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRegisterDevice, testSendNotification };

