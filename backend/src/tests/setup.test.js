const request = require('supertest');
const app = require('../server');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Test data
const testUsers = {
  superadmin: { 
    email: 'superadmin@test.com', 
    password: 'Test@123', 
    name: 'Test Superadmin',
    role_id: 1,
    dept_id: 1
  },
  subadmin: { 
    email: 'subadmin@test.com', 
    password: 'Test@123', 
    name: 'Test Subadmin',
    role_id: 2,
    dept_id: 1
  },
  user: { 
    email: 'user@test.com', 
    password: 'Test@123', 
    name: 'Test User',
    role_id: 3,
    dept_id: 1
  }
};

const testRoles = [
  { id: 1, name: 'superadmin', description: 'Super Administrator' },
  { id: 2, name: 'subadmin', description: 'Sub Administrator' },
  { id: 3, name: 'user', description: 'Regular User' }
];

const testDepartments = [
  { id: 1, name: 'IT', description: 'Information Technology' },
  { id: 2, name: 'HR', description: 'Human Resources' }
];

// Helper function to generate tokens
const generateTestTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Setup function to create test data
const setupTestData = async () => {
  try {
    // Create roles
    const roles = await Promise.all(
      testRoles.map(role => db.Role.create(role))
    );

    // Create departments
    const departments = await Promise.all(
      testDepartments.map(dept => db.Department.create(dept))
    );

    // Create users with hashed passwords
    const users = {};
    for (const [role, userData] of Object.entries(testUsers)) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await db.User.create({
        ...userData,
        password: hashedPassword
      });
      const tokens = generateTestTokens(user);
      users[role] = { ...user.toJSON(), tokens };
    }

    return { roles, departments, users };
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
};

// Helper function for making authenticated requests
const authenticatedRequest = (token) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};

module.exports = {
  testUsers,
  testRoles,
  testDepartments,
  setupTestData,
  authenticatedRequest,
  app
}; 