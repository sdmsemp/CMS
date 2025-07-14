const request = require('supertest');
const { app, testUsers, setupTestData, authenticatedRequest } = require('./setup.test');
const db = require('../models');

describe('Admin Routes', () => {
  let testData;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    testData = await setupTestData();
    adminToken = testData.users.superadmin.tokens.accessToken;
    userToken = testData.users.user.tokens.accessToken;
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      it('should get all users as admin', async () => {
        const response = await authenticatedRequest(adminToken)
          .get('/api/admin/users');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.users)).toBe(true);
        expect(response.body.data.users.length).toBeGreaterThan(0);
      });

      it('should fail to get users without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .get('/api/admin/users');

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('PUT /api/admin/users/:id', () => {
      let userId;

      beforeAll(async () => {
        const user = await db.User.create({
          email: 'updatetest@test.com',
          password: 'Test@123',
          name: 'Update Test',
          role_id: 3,
          dept_id: 1
        });
        userId = user.id;
      });

      it('should update user as admin', async () => {
        const updateData = {
          name: 'Updated Name',
          role_id: 2,
          dept_id: 2
        };

        const response = await authenticatedRequest(adminToken)
          .put(`/api/admin/users/${userId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.name).toBe(updateData.name);
        expect(response.body.data.user.role_id).toBe(updateData.role_id);
        expect(response.body.data.user.dept_id).toBe(updateData.dept_id);
      });

      it('should fail to update user without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .put(`/api/admin/users/${userId}`)
          .send({ name: 'Unauthorized Update' });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('DELETE /api/admin/users/:id', () => {
      let userId;

      beforeAll(async () => {
        const user = await db.User.create({
          email: 'deletetest@test.com',
          password: 'Test@123',
          name: 'Delete Test',
          role_id: 3,
          dept_id: 1
        });
        userId = user.id;
      });

      it('should delete user as admin', async () => {
        const response = await authenticatedRequest(adminToken)
          .delete(`/api/admin/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify user is deleted
        const deletedUser = await db.User.findByPk(userId);
        expect(deletedUser).toBeNull();
      });

      it('should fail to delete user without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .delete(`/api/admin/users/${userId}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Department Management', () => {
    describe('POST /api/admin/departments', () => {
      const newDepartment = {
        name: 'New Department',
        description: 'Test Department'
      };

      it('should create department as admin', async () => {
        const response = await authenticatedRequest(adminToken)
          .post('/api/admin/departments')
          .send(newDepartment);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.department.name).toBe(newDepartment.name);
        expect(response.body.data.department.description).toBe(newDepartment.description);
      });

      it('should fail to create department without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .post('/api/admin/departments')
          .send(newDepartment);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('PUT /api/admin/departments/:id', () => {
      let departmentId;

      beforeAll(async () => {
        const department = await db.Department.create({
          name: 'Update Department',
          description: 'Test Department'
        });
        departmentId = department.id;
      });

      it('should update department as admin', async () => {
        const updateData = {
          name: 'Updated Department',
          description: 'Updated Description'
        };

        const response = await authenticatedRequest(adminToken)
          .put(`/api/admin/departments/${departmentId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.department.name).toBe(updateData.name);
        expect(response.body.data.department.description).toBe(updateData.description);
      });

      it('should fail to update department without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .put(`/api/admin/departments/${departmentId}`)
          .send({ name: 'Unauthorized Update' });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Activity Logs', () => {
    beforeAll(async () => {
      // Create some test activity logs
      await db.ActivityLog.bulkCreate([
        {
          action: 'user_login',
          details: 'User logged in',
          emp_id: testData.users.user.id
        },
        {
          action: 'complaint_created',
          details: 'New complaint created',
          emp_id: testData.users.user.id
        },
        {
          action: 'department_updated',
          details: 'Department information updated',
          emp_id: testData.users.superadmin.id
        }
      ]);
    });

    describe('GET /api/admin/logs', () => {
      it('should get all activity logs as admin', async () => {
        const response = await authenticatedRequest(adminToken)
          .get('/api/admin/logs');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.logs)).toBe(true);
        expect(response.body.data.logs.length).toBeGreaterThanOrEqual(3);
      });

      it('should fail to get activity logs without admin access', async () => {
        const response = await authenticatedRequest(userToken)
          .get('/api/admin/logs');

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });

      it('should filter logs by action type', async () => {
        const response = await authenticatedRequest(adminToken)
          .get('/api/admin/logs')
          .query({ action: 'user_login' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.logs)).toBe(true);
        expect(response.body.data.logs.length).toBeGreaterThan(0);
        expect(response.body.data.logs.every(log => log.action === 'user_login')).toBe(true);
      });

      it('should filter logs by user', async () => {
        const response = await authenticatedRequest(adminToken)
          .get('/api/admin/logs')
          .query({ emp_id: testData.users.user.id });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.logs)).toBe(true);
        expect(response.body.data.logs.length).toBeGreaterThan(0);
        expect(response.body.data.logs.every(log => log.emp_id === testData.users.user.id)).toBe(true);
      });
    });
  });
}); 