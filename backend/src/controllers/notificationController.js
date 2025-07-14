const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserNotifications = async (req, res) => {
  try {
    const emp_id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findAndCountAll({
      where: {
        emp_id,
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.rows,
        total: notifications.count,
        totalPages: Math.ceil(notifications.count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsRead = async (req, res) => {
  try {
    const { notification_ids } = req.body;
    const emp_id = req.user.id;

    if (!Array.isArray(notification_ids)) {
      return res.status(400).json({
        success: false,
        error: 'notification_ids must be an array'
      });
    }

    await Notification.update(
      { is_read: true },
      {
        where: {
          notification_id: notification_ids,
          emp_id
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
};

/**
 * Get unread notification count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadCount = async (req, res) => {
  try {
    const emp_id = req.user.id;

    const count = await Notification.count({
      where: {
        emp_id,
        is_read: false
      }
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

/**
 * Create complaint notification for subadmin
 * @param {Object} complaintData - Complaint data
 * @param {number} subadminId - Subadmin's employee ID
 */
const createComplaintNotification = async (complaintData, subadminId) => {
  try {
    await createNotification({
      emp_id: subadminId,
      title: 'New Complaint Assigned',
      message: `A new complaint has been assigned to your department. Complaint ID: ${complaintData.complaint_id}`,
      type: 'complaint',
      reference_id: complaintData.complaint_id
    });
  } catch (error) {
    console.error('Error creating complaint notification:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};

/**
 * Delete old notifications
 * Utility function to clean up notifications older than 30 days
 */
const deleteOldNotifications = async () => {
  try {
    await Notification.destroy({
      where: {
        created_at: {
          [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Older than 30 days
        }
      }
    });
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  createComplaintNotification,
  deleteOldNotifications
}; 