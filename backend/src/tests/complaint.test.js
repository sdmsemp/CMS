const request = require('supertest');
const { app, testUsers, setupTestData, authenticatedRequest } = require('./setup.test');
const db = require('../models');

describe('Complaint Routes', () => {
  let testData;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    testData = await setupTestData();
    userToken = testData.users.user.tokens.accessToken;
    adminToken = testData.users.superadmin.tokens.accessToken;
  });

  const testComplaint = {
    title: 'Test Complaint',
    description: 'This is a test complaint',
    priority: 'high',
    status: 'pending',
    dept_id: 1
  };

  describe('POST /api/complaints', () => {
    it('should create a new complaint successfully', async () => {
      const response = await authenticatedRequest(userToken)
        .post('/api/complaints')
        .send(testComplaint);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('complaint');
      expect(response.body.data.complaint.title).toBe(testComplaint.title);
      expect(response.body.data.complaint.description).toBe(testComplaint.description);
      expect(response.body.data.complaint.priority).toBe(testComplaint.priority);
      expect(response.body.data.complaint.status).toBe(testComplaint.status);
    });

    it('should fail to create complaint without authentication', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .send(testComplaint);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create complaint with invalid data', async () => {
      const invalidComplaint = {
        title: '', // Empty title
        description: 'Test',
        priority: 'invalid', // Invalid priority
        status: 'pending',
        dept_id: 1
      };

      const response = await authenticatedRequest(userToken)
        .post('/api/complaints')
        .send(invalidComplaint);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/complaints', () => {
    beforeAll(async () => {
      // Create some test complaints
      await db.Complaint.bulkCreate([
        { ...testComplaint, emp_id: testData.users.user.id },
        { ...testComplaint, title: 'Second Complaint', emp_id: testData.users.user.id },
        { ...testComplaint, title: 'Third Complaint', emp_id: testData.users.subadmin.id }
      ]);
    });

    it('should get all complaints for admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .get('/api/complaints');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.complaints)).toBe(true);
      expect(response.body.data.complaints.length).toBeGreaterThanOrEqual(3);
    });

    it('should get only user\'s complaints for regular user', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/complaints');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.complaints)).toBe(true);
      expect(response.body.data.complaints.length).toBe(2);
      expect(response.body.data.complaints.every(c => c.emp_id === testData.users.user.id)).toBe(true);
    });

    it('should fail to get complaints without authentication', async () => {
      const response = await request(app)
        .get('/api/complaints');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/complaints/:id', () => {
    let complaintId;

    beforeAll(async () => {
      const complaint = await db.Complaint.create({
        ...testComplaint,
        emp_id: testData.users.user.id
      });
      complaintId = complaint.id;
    });

    it('should get complaint by id for owner', async () => {
      const response = await authenticatedRequest(userToken)
        .get(`/api/complaints/${complaintId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('complaint');
      expect(response.body.data.complaint.id).toBe(complaintId);
    });

    it('should get complaint by id for admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .get(`/api/complaints/${complaintId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('complaint');
      expect(response.body.data.complaint.id).toBe(complaintId);
    });

    it('should fail to get non-existent complaint', async () => {
      const response = await authenticatedRequest(userToken)
        .get('/api/complaints/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/complaints/:id', () => {
    let complaintId;

    beforeAll(async () => {
      const complaint = await db.Complaint.create({
        ...testComplaint,
        emp_id: testData.users.user.id
      });
      complaintId = complaint.id;
    });

    const updateData = {
      title: 'Updated Complaint',
      description: 'Updated description',
      priority: 'low',
      status: 'in_progress'
    };

    it('should update complaint successfully for owner', async () => {
      const response = await authenticatedRequest(userToken)
        .put(`/api/complaints/${complaintId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('complaint');
      expect(response.body.data.complaint.title).toBe(updateData.title);
      expect(response.body.data.complaint.description).toBe(updateData.description);
      expect(response.body.data.complaint.priority).toBe(updateData.priority);
      expect(response.body.data.complaint.status).toBe(updateData.status);
    });

    it('should update complaint successfully for admin', async () => {
      const response = await authenticatedRequest(adminToken)
        .put(`/api/complaints/${complaintId}`)
        .send({ status: 'resolved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.status).toBe('resolved');
    });

    it('should fail to update non-existent complaint', async () => {
      const response = await authenticatedRequest(userToken)
        .put('/api/complaints/999999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to update with invalid data', async () => {
      const response = await authenticatedRequest(userToken)
        .put(`/api/complaints/${complaintId}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 