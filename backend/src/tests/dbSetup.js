const { sequelize, syncDatabase } = require('../config/dbConfig');
const db = require('../models');

const setupTestDatabase = async () => {
  try {
    // First disable foreign key checks and sync database with force: true
    await syncDatabase({ force: true });
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
};

const clearTestDatabase = async () => {
  try {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear all tables
    await Promise.all([
      db.Notification.destroy({ truncate: true }),
      db.ActivityLog.destroy({ truncate: true }),
      db.SubadminTask.destroy({ truncate: true }),
      db.Complaint.destroy({ truncate: true }),
      db.User.destroy({ truncate: true }),
      db.Role.destroy({ truncate: true }),
      db.Department.destroy({ truncate: true })
    ]);

    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Test database cleared');
  } catch (error) {
    console.error('Database cleanup failed:', error);
    throw error;
  }
};

const closeTestDatabase = async () => {
  try {
    await db.sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database connection:', error);
    throw error;
  }
};

module.exports = {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase
}; 