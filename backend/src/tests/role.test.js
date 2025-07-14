const request = require('supertest');
const { app, testUsers, setupTestData, authenticatedRequest } = require('./setup.test');
const db = require('../models');

describe('Role Management Routes', () => {
  let testData;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    testData = await setupTestData();
    adminToken = testData.users.superadmin.tokens.accessToken;
    userToken = testData.users.user.tokens.accessToken;
  });

  describe('GET /api/roles', () => {
    it('should get all roles as admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .get('/api/roles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.data.roles.length).toBeGreaterThan(0);
      expect(response.body.data.roles[0]).toHaveProperty('name');
      expect(response.body.data.roles[0]).toHaveProperty('description');
    });

    it('should fail to get roles without admin access', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/roles');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/roles', () => {
    const newRole = {
      name: 'test_role',
      description: 'Test Role Description'
    };

    it('should create new role as admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .post('/api/roles')
        .send(newRole);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe(newRole.name);
      expect(response.body.data.role.description).toBe(newRole.description);
    });

    it('should fail to create role with duplicate name', async () => {
      // Try to create role with same name
      const response = await authenticatedRequest(adminToken)
        .post('/api/roles')
        .send(newRole);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create role without admin access', async () => {
      const response = await authenticatedRequest(userToken)
        .post('/api/roles')
        .send({
          name: 'unauthorized_role',
          description: 'This should fail'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create role with invalid data', async () => {
      const response = await authenticatedRequest(adminToken)
        .post('/api/roles')
        .send({
          name: '', // Empty name
          description: 'Invalid Role'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/roles/:id', () => {
    let roleId;

    beforeAll(async () => {
      const role = await db.Role.create({
        name: 'update_test_role',
        description: 'Role to be updated'
      });
      roleId = role.id;
    });

    const updateData = {
      name: 'updated_role',
      description: 'Updated Role Description'
    };

    it('should update role as admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .put(`/api/roles/${roleId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe(updateData.name);
      expect(response.body.data.role.description).toBe(updateData.description);
    });

    it('should fail to update role without admin access', async () => {
      const response = await authenticatedRequest(userToken)
        .put(`/api/roles/${roleId}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to update non-existent role', async () => {
      const response = await authenticatedRequest(adminToken)
        .put('/api/roles/999999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/roles/:id', () => {
    let roleId;

    beforeAll(async () => {
      const role = await db.Role.create({
        name: 'delete_test_role',
        description: 'Role to be deleted'
      });
      roleId = role.id;
    });

    it('should fail to delete role without admin access', async () => {
      const response = await authenticatedRequest(userToken)
        .delete(`/api/roles/${roleId}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to delete non-existent role', async () => {
      const response = await authenticatedRequest(adminToken)
        .delete('/api/roles/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should delete role as admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .delete(`/api/roles/${roleId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify role is deleted
      const deletedRole = await db.Role.findByPk(roleId);
      expect(deletedRole).toBeNull();
    });

    it('should fail to delete role if users are assigned to it', async () => {
      // Create a new role and assign a user to it
      const role = await db.Role.create({
        name: 'role_with_users',
        description: 'Role that has users assigned'
      });

      await db.User.create({
        email: 'roleuser@test.com',
        password: 'Test@123',
        name: 'Role Test User',
        role_id: role.id,
        dept_id: 1
      });

      const response = await authenticatedRequest(adminToken)
        .delete(`/api/roles/${role.id}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 