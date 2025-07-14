const request = require('supertest');
const { app, testUsers, setupTestData, authenticatedRequest } = require('./setup.test');
const db = require('../models');

describe('Subadmin Task Management Routes', () => {
  let testData;
  let subadminToken;
  let userToken;
  let adminToken;
  let testComplaint;

  beforeAll(async () => {
    testData = await setupTestData();
    subadminToken = testData.users.subadmin.tokens.accessToken;
    userToken = testData.users.user.tokens.accessToken;
    adminToken = testData.users.superadmin.tokens.accessToken;

    // Create a test complaint
    testComplaint = await db.Complaint.create({
      title: 'Test Complaint',
      description: 'Test Description',
      priority: 'high',
      status: 'pending',
      dept_id: testData.users.subadmin.dept_id,
      emp_id: testData.users.user.id
    });
  });

  describe('GET /api/subadmin/complaints', () => {
    it('should get department complaints as subadmin', async () => {
      const response = await authenticatedRequest(subadminToken)
        .get('/api/subadmin/complaints');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.complaints)).toBe(true);
      expect(response.body.data.complaints.length).toBeGreaterThan(0);
      expect(response.body.data.complaints[0].dept_id).toBe(testData.users.subadmin.dept_id);
    });

    it('should fail to get complaints without subadmin access', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/subadmin/complaints');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should filter complaints by status', async () => {
      const response = await authenticatedRequest(subadminToken)
        .get('/api/subadmin/complaints')
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.complaints)).toBe(true);
      expect(response.body.data.complaints.every(c => c.status === 'pending')).toBe(true);
    });
  });

  describe('POST /api/subadmin/tasks', () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Task Description',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'pending'
    };

    it('should create task for complaint as subadmin', async () => {
      const response = await authenticatedRequest(subadminToken)
        .post('/api/subadmin/tasks')
        .send({
          ...newTask,
          complaint_id: testComplaint.id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(newTask.title);
      expect(response.body.data.task.description).toBe(newTask.description);
      expect(response.body.data.task.complaint_id).toBe(testComplaint.id);
    });

    it('should fail to create task without subadmin access', async () => {
      const response = await authenticatedRequest(userToken)
        .post('/api/subadmin/tasks')
        .send({
          ...newTask,
          complaint_id: testComplaint.id
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create task for non-existent complaint', async () => {
      const response = await authenticatedRequest(subadminToken)
        .post('/api/subadmin/tasks')
        .send({
          ...newTask,
          complaint_id: 999999
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/subadmin/tasks', () => {
    beforeAll(async () => {
      // Create some test tasks
      await db.SubadminTask.bulkCreate([
        {
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          status: 'pending',
          complaint_id: testComplaint.id,
          emp_id: testData.users.subadmin.id,
          due_date: new Date(Date.now() + 86400000)
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          priority: 'medium',
          status: 'in_progress',
          complaint_id: testComplaint.id,
          emp_id: testData.users.subadmin.id,
          due_date: new Date(Date.now() + 172800000)
        }
      ]);
    });

    it('should get all tasks as subadmin', async () => {
      const response = await authenticatedRequest(subadminToken)
        .get('/api/subadmin/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter tasks by status', async () => {
      const response = await authenticatedRequest(subadminToken)
        .get('/api/subadmin/tasks')
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await authenticatedRequest(subadminToken)
        .get('/api/subadmin/tasks')
        .query({ priority: 'high' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.every(t => t.priority === 'high')).toBe(true);
    });
  });

  describe('PUT /api/subadmin/tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const task = await db.SubadminTask.create({
        title: 'Update Test Task',
        description: 'Task to be updated',
        priority: 'medium',
        status: 'pending',
        complaint_id: testComplaint.id,
        emp_id: testData.users.subadmin.id,
        due_date: new Date(Date.now() + 86400000)
      });
      taskId = task.id;
    });

    const updateData = {
      title: 'Updated Task',
      description: 'Updated Description',
      priority: 'high',
      status: 'in_progress',
      due_date: new Date(Date.now() + 172800000).toISOString()
    };

    it('should update task as subadmin', async () => {
      const response = await authenticatedRequest(subadminToken)
        .put(`/api/subadmin/tasks/${taskId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.description).toBe(updateData.description);
      expect(response.body.data.task.priority).toBe(updateData.priority);
      expect(response.body.data.task.status).toBe(updateData.status);
    });

    it('should fail to update task without subadmin access', async () => {
      const response = await authenticatedRequest(userToken)
        .put(`/api/subadmin/tasks/${taskId}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to update non-existent task', async () => {
      const response = await authenticatedRequest(subadminToken)
        .put('/api/subadmin/tasks/999999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/subadmin/tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const task = await db.SubadminTask.create({
        title: 'Delete Test Task',
        description: 'Task to be deleted',
        priority: 'low',
        status: 'pending',
        complaint_id: testComplaint.id,
        emp_id: testData.users.subadmin.id,
        due_date: new Date(Date.now() + 86400000)
      });
      taskId = task.id;
    });

    it('should fail to delete task without subadmin access', async () => {
      const response = await authenticatedRequest(userToken)
        .delete(`/api/subadmin/tasks/${taskId}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should delete task as subadmin', async () => {
      const response = await authenticatedRequest(subadminToken)
        .delete(`/api/subadmin/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify task is deleted
      const deletedTask = await db.SubadminTask.findByPk(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should fail to delete non-existent task', async () => {
      const response = await authenticatedRequest(subadminToken)
        .delete('/api/subadmin/tasks/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 