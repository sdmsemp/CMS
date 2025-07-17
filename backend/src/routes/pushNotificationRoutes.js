const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription
} = require('../utils/pushNotificationService');

// Middleware for authenticated routes
const authMiddleware = [authenticateJWT];

/**
 * @swagger
 * tags:
 *   name: PushNotifications
 *   description: Web push notification management endpoints
 */

/**
 * @swagger
 * /api/push/vapid-public-key:
 *   get:
 *     summary: Get VAPID public key for frontend
 *     tags: [PushNotifications]
 *     responses:
 *       200:
 *         description: VAPID public key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicKey:
 *                       type: string
 *                       description: VAPID public key
 */
router.get('/vapid-public-key', (req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    res.status(200).json({
      success: true,
      data: {
        publicKey
      }
    });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get VAPID public key'
    });
  }
});

/**
 * @swagger
 * /api/push/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subscription]
 *             properties:
 *               subscription:
 *                 type: object
 *                 properties:
 *                   endpoint:
 *                     type: string
 *                   keys:
 *                     type: object
 *                     properties:
 *                       p256dh:
 *                         type: string
 *                       auth:
 *                         type: string
 *     responses:
 *       200:
 *         description: Subscription saved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;
    const empId = req.user.emp_id;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription data'
      });
    }

    const savedSubscription = await saveSubscription(empId, subscription);

    res.status(200).json({
      success: true,
      message: 'Push notification subscription saved successfully',
      data: {
        subscription_id: savedSubscription.subscription_id
      }
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save push subscription'
    });
  }
});

/**
 * @swagger
 * /api/push/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [endpoint]
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: Subscription endpoint to remove
 *     responses:
 *       200:
 *         description: Subscription removed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const empId = req.user.emp_id;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint is required'
      });
    }

    const removed = await removeSubscription(empId, endpoint);

    if (removed) {
      res.status(200).json({
        success: true,
        message: 'Push notification subscription removed successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove push subscription'
    });
  }
});

/**
 * @swagger
 * /api/push/test:
 *   post:
 *     summary: Send a test push notification
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const empId = req.user.emp_id;
    
    const result = await sendNotificationToUser(empId, {
      title: 'Test Notification',
      body: 'This is a test push notification from the CMS system!',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      },
      tag: 'test-notification',
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No active push subscriptions found'
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification'
    });
  }
});

module.exports = router; 