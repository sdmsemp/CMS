const request = require('supertest');
const { app, testUsers, setupTestData, authenticatedRequest } = require('./setup.test');
const db = require('../models');

describe('Notification Routes', () => {
  let testData;
  let userToken;
  let adminToken;
  let testNotifications;

  beforeAll(async () => {
    testData = await setupTestData();
    userToken = testData.users.user.tokens.accessToken;
    adminToken = testData.users.superadmin.tokens.accessToken;

    // Create test notifications
    testNotifications = await db.Notification.bulkCreate([
      {
        title: 'Test Notification 1',
        message: 'This is test notification 1',
        type: 'complaint_update',
        emp_id: testData.users.user.id,
        is_read: false
      },
      {
        title: 'Test Notification 2',
        message: 'This is test notification 2',
        type: 'task_assigned',
        emp_id: testData.users.user.id,
        is_read: false
      },
      {
        title: 'Admin Notification',
        message: 'This is admin notification',
        type: 'system_update',
        emp_id: testData.users.superadmin.id,
        is_read: false
      }
    ]);
  });

  describe('GET /api/notifications', () => {
    it('should get user\'s notifications', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.length).toBe(2);
      expect(response.body.data.notifications.every(n => n.emp_id === testData.users.user.id)).toBe(true);
    });

    it('should get notifications with pagination', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/notifications')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.length).toBe(1);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should filter notifications by type', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/notifications')
        .query({ type: 'complaint_update' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.every(n => n.type === 'complaint_update')).toBe(true);
    });

    it('should filter notifications by read status', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/notifications')
        .query({ is_read: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.every(n => !n.is_read)).toBe(true);
    });

    it('should fail to get notifications without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notification = testNotifications[0];
      const response = await authenticatedRequest(userToken)
        .put(`/api/notifications/${notification.id}/read`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notification.is_read).toBe(true);

      // Verify in database
      const updatedNotification = await db.Notification.findByPk(notification.id);
      expect(updatedNotification.is_read).toBe(true);
    });

    it('should fail to mark other user\'s notification as read', async () => {
      const adminNotification = testNotifications[2];
      const response = await authenticatedRequest(userToken)
        .put(`/api/notifications/${adminNotification.id}/read`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to mark non-existent notification as read', async () => {
      const response = await authenticatedRequest(userToken)
        .put('/api/notifications/999999/read');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all user\'s notifications as read', async () => {
      const response = await authenticatedRequest(userToken)
        .put('/api/notifications/read-all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify in database
      const userNotifications = await db.Notification.findAll({
        where: { emp_id: testData.users.user.id }
      });
      expect(userNotifications.every(n => n.is_read)).toBe(true);
    });

    it('should not affect other users\' notifications', async () => {
      // Mark all notifications as read for user
      await authenticatedRequest(userToken)
        .put('/api/notifications/read-all');

      // Check admin's notifications are still unread
      const adminNotifications = await db.Notification.findAll({
        where: { emp_id: testData.users.superadmin.id }
      });
      expect(adminNotifications.some(n => !n.is_read)).toBe(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification', async () => {
      const notification = testNotifications[1];
      const response = await authenticatedRequest(userToken)
        .delete(`/api/notifications/${notification.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedNotification = await db.Notification.findByPk(notification.id);
      expect(deletedNotification).toBeNull();
    });

    it('should fail to delete other user\'s notification', async () => {
      const adminNotification = testNotifications[2];
      const response = await authenticatedRequest(userToken)
        .delete(`/api/notifications/${adminNotification.id}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to delete non-existent notification', async () => {
      const response = await authenticatedRequest(userToken)
        .delete('/api/notifications/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 