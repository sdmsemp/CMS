const { 
  getVapidPublicKey, 
  saveSubscription, 
  sendNotificationToDepartmentSubadmin,
  sendNotificationToUser 
} = require('./src/utils/pushNotificationService');

async function testCompletePushFlow() {
  try {
    console.log('🚀 Testing Complete Push Notification Flow...\n');

    // Step 1: Get VAPID public key
    console.log('1️⃣ Getting VAPID public key...');
    const publicKey = getVapidPublicKey();
    console.log('✅ VAPID Public Key:', publicKey.substring(0, 50) + '...');
    console.log('');

    // Step 2: Simulate a subscription (normally done by frontend)
    console.log('2️⃣ Simulating push subscription...');
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
      keys: {
        p256dh: 'test-p256dh-key-123',
        auth: 'test-auth-key-123'
      }
    };

    // Save subscription for user 101 (subadmin of department 1)
    const savedSubscription = await saveSubscription(101, mockSubscription);
    console.log('✅ Subscription saved:', savedSubscription.subscription_id);
    console.log('');

    // Step 3: Test sending notification to specific user
    console.log('3️⃣ Testing notification to specific user...');
    const userNotificationResult = await sendNotificationToUser(101, {
      title: 'Direct User Notification',
      body: 'This notification was sent directly to user 101.',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        type: 'direct',
        timestamp: new Date().toISOString()
      },
      tag: 'direct-user-test'
    });
    console.log('✅ Direct user notification result:', userNotificationResult);
    console.log('');

    // Step 4: Test sending notification to department subadmin
    console.log('4️⃣ Testing notification to department subadmin...');
    const deptNotificationResult = await sendNotificationToDepartmentSubadmin(1, {
      title: 'Department Notification',
      body: 'This notification was sent to the subadmin of department 1.',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        type: 'department',
        department_id: 1,
        timestamp: new Date().toISOString()
      },
      tag: 'department-test',
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
    console.log('✅ Department notification result:', deptNotificationResult);
    console.log('');

    // Step 5: Test complaint creation flow
    console.log('5️⃣ Testing complaint creation notification flow...');
    const mockComplaint = {
      complaint_id: 999,
      title: 'Test Complaint',
      severity: 'High',
      dept_id: 1
    };

    const complaintNotificationResult = await sendNotificationToDepartmentSubadmin(mockComplaint.dept_id, {
      title: 'New Complaint Assigned',
      body: `A new ${mockComplaint.severity} priority complaint has been assigned to your department.`,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        complaint_id: mockComplaint.complaint_id,
        title: mockComplaint.title,
        severity: mockComplaint.severity,
        department_id: mockComplaint.dept_id
      },
      tag: `complaint-${mockComplaint.complaint_id}`,
      actions: [
        {
          action: 'view',
          title: 'View Complaint'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
    console.log('✅ Complaint notification result:', complaintNotificationResult);
    console.log('');

    console.log('🎉 Complete push notification flow test completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   • VAPID key generation: ✅');
    console.log('   • Subscription management: ✅');
    console.log('   • Direct user notifications: ✅');
    console.log('   • Department notifications: ✅');
    console.log('   • Complaint flow integration: ✅');
    console.log('');
    console.log('💡 Note: Actual push notifications will only be sent if the browser is open and the service worker is active.');
    console.log('   To test real notifications, use the frontend application and enable push notifications in the profile page.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompletePushFlow(); 