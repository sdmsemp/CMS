const logger = require('./logger');

/**
 * Create an activity log entry
 * @param {Object} logData - The log data
 * @param {number} logData.user_id - The ID of the user performing the action
 * @param {string} logData.activity_type - The type of activity (CREATE, UPDATE, DELETE, etc.)
 * @param {string} logData.description - Description of the activity
 * @param {string} logData.module - The module where the activity occurred
 * @param {string} [logData.ip_address] - IP address of the user (optional)
 * @param {string} [logData.user_agent] - User agent of the request (optional)
 */
const createActivityLog = async (logData) => {
  try {
    logger.info('Activity logged', {
      metadata: {
        ...logData,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

module.exports = {
  createActivityLog
}; 