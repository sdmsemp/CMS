const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, 'test.env')
});

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue()
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock Redis client
jest.mock('redis', () => {
  const mockRedisClient = {
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn().mockResolvedValue(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1)
  };

  return {
    createClient: jest.fn().mockReturnValue(mockRedisClient)
  };
});

// Global test timeout
jest.setTimeout(30000);

// Import database setup functions
const { setupTestDatabase, clearTestDatabase, closeTestDatabase } = require('./dbSetup');

// Setup before all tests
beforeAll(async () => {
  try {
    await setupTestDatabase();
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Clear database before each test
beforeEach(async () => {
  try {
    await clearTestDatabase();
  } catch (error) {
    console.error('Failed to clear test database:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await closeTestDatabase();
  } catch (error) {
    console.error('Failed to close test database:', error);
    throw error;
  }
});

// Mock database models
jest.mock('../models', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();

  const UserMock = dbMock.define('User', {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedPassword',
    role_id: 3
  });

  const RoleMock = dbMock.define('Role', {
    id: 1,
    role: 'user'
  });

  const DepartmentMock = dbMock.define('Department', {
    id: 1,
    name: 'Test Department'
  });

  const ComplaintMock = dbMock.define('Complaint', {
    id: 1,
    title: 'Test Complaint',
    description: 'Test Description',
    status: 'new',
    severity: 'medium'
  });

  return {
    sequelize: dbMock,
    Sequelize: SequelizeMock,
    User: UserMock,
    Role: RoleMock,
    Department: DepartmentMock,
    Complaint: ComplaintMock
  };
}); 