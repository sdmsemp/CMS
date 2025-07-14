const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV !== 'test',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection only in non-test environment
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
}

// Sync tables in correct order
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // First, sync independent tables
    await Promise.all([
      sequelize.models.Role?.sync(options),
      sequelize.models.Department?.sync(options)
    ]);

    // Then sync User table which depends on Role and Department
    await sequelize.models.User?.sync(options);

    // Then sync Complaint table which depends on User and Department
    await sequelize.models.Complaint?.sync(options);

    // Finally sync tables that depend on both User and Complaint
    await Promise.all([
      sequelize.models.SubadminTask?.sync(options),
      sequelize.models.ActivityLog?.sync(options),
      sequelize.models.Notification?.sync(options)
    ]);

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('Database synced successfully');
    }
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

module.exports = { sequelize, syncDatabase }; 