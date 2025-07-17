const { sendNotificationToDepartmentSubadmin } = require('./src/utils/pushNotificationService');

async function testPushNotification() {
  try {
    console.log('Testing push notification to department subadmin...');
    
    // Test sending notification to department 1 (assuming it has a subadmin)
    const result = await sendNotificationToDepartmentSubadmin(1, {
      title: 'Test Notification',
      body: 'This is a test push notification from the CMS system.',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      },
      tag: 'test-notification'
    });
    
    console.log('Push notification test result:', result);
    
    if (result) {
      console.log('✅ Push notification sent successfully!');
    } else {
      console.log('⚠️  No active subscriptions found for department subadmin');
    }
  } catch (error) {
    console.error('❌ Push notification test failed:', error);
  }
}

testPushNotification(); 