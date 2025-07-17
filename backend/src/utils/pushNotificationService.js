const webpush = require('web-push');
const { PushSubscription, User } = require('../models');

// Generate VAPID keys (you should store these securely in environment variables)
const vapidKeys = webpush.generateVAPIDKeys();

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@starkdigital.in',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * Get VAPID public key for frontend
 * @returns {string} VAPID public key
 */
const getVapidPublicKey = () => {
  return vapidKeys.publicKey;
};

/**
 * Save push subscription for a user
 * @param {number} empId - Employee ID
 * @param {Object} subscription - Push subscription object
 * @returns {Promise<Object>} Saved subscription
 */
const saveSubscription = async (empId, subscription) => {
  try {
    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      where: { endpoint: subscription.endpoint }
    });

    if (existingSubscription) {
      // Update existing subscription
      await existingSubscription.update({
        emp_id: empId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        is_active: true
      });
      return existingSubscription;
    }

    // Create new subscription
    const newSubscription = await PushSubscription.create({
      emp_id: empId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      is_active: true
    });

    return newSubscription;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

/**
 * Remove push subscription
 * @param {number} empId - Employee ID
 * @param {string} endpoint - Subscription endpoint
 * @returns {Promise<boolean>} Success status
 */
const removeSubscription = async (empId, endpoint) => {
  try {
    const subscription = await PushSubscription.findOne({
      where: { emp_id: empId, endpoint: endpoint }
    });

    if (subscription) {
      await subscription.update({ is_active: false });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }
};

/**
 * Send push notification to a specific user
 * @param {number} empId - Employee ID
 * @param {Object} notification - Notification payload
 * @returns {Promise<boolean>} Success status
 */
const sendNotificationToUser = async (empId, notification) => {
  try {
    const subscriptions = await PushSubscription.findAll({
      where: { emp_id: empId, is_active: true }
    });

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${empId}`);
      return false;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/vite.svg',
      badge: notification.badge || '/vite.svg',
      data: notification.data || {},
      actions: notification.actions || [],
      tag: notification.tag || 'default'
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          );
          return { success: true, subscription_id: subscription.subscription_id };
        } catch (error) {
          console.error(`Failed to send notification to subscription ${subscription.subscription_id}:`, error);
          
          // If subscription is invalid, mark it as inactive
          if (error.statusCode === 410) {
            await subscription.update({ is_active: false });
          }
          
          return { success: false, error: error.message };
        }
      })
    );

    const successfulSends = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    );

    console.log(`Sent notifications to ${successfulSends.length}/${subscriptions.length} subscriptions for user ${empId}`);
    return successfulSends.length > 0;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

/**
 * Send notification to subadmin of a specific department
 * @param {number} deptId - Department ID
 * @param {Object} notification - Notification payload
 * @returns {Promise<boolean>} Success status
 */
const sendNotificationToDepartmentSubadmin = async (deptId, notification) => {
  try {
    // Find subadmin of the department
    const subadmin = await User.findOne({
      where: {
        dept_id: deptId,
        role_id: 2 // role_id 2 = subadmin
      }
    });

    if (!subadmin) {
      console.log(`No subadmin found for department ${deptId}`);
      return false;
    }

    return await sendNotificationToUser(subadmin.emp_id, notification);
  } catch (error) {
    console.error('Error sending notification to department subadmin:', error);
    throw error;
  }
};

/**
 * Send notification to multiple users
 * @param {Array<number>} empIds - Array of employee IDs
 * @param {Object} notification - Notification payload
 * @returns {Promise<Object>} Results summary
 */
const sendNotificationToMultipleUsers = async (empIds, notification) => {
  try {
    const results = await Promise.allSettled(
      empIds.map(empId => sendNotificationToUser(empId, notification))
    );

    const successfulSends = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    );

    return {
      total: empIds.length,
      successful: successfulSends.length,
      failed: empIds.length - successfulSends.length
    };
  } catch (error) {
    console.error('Error sending notifications to multiple users:', error);
    throw error;
  }
};

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  sendNotificationToUser,
  sendNotificationToDepartmentSubadmin,
  sendNotificationToMultipleUsers
}; 