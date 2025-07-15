const fs = require('fs');
const path = require('path');
const ActivityLog = require('../models/activityLogModel');

/**
 * Create an activity log entry and write to log.txt file
 * @param {Object} logData - Log data object
 * @param {string} logData.user_id - User ID who performed the action
 * @param {string} logData.activity_type - Type of activity (LOGIN, CREATE, UPDATE, DELETE, etc.)
 * @param {string} logData.description - Description of the activity
 * @param {string} logData.module - Module where activity occurred (Auth, Complaint, Admin, etc.)
 * @param {Object} logData.details - Additional details (optional)
 */
const createActivityLog = async (logData) => {
  try {
    // Create database log entry
    const activityLog = await ActivityLog.create({
      emp_id: logData.user_id,
      action: logData.description,
      module: logData.module,
      timestamp: new Date()
    });

    // Write to log.txt file
    const logEntry = formatLogEntry(logData);
    writeToLogFile(logEntry);

    return activityLog;
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Still try to write to file even if database fails
    const logEntry = formatLogEntry(logData);
    writeToLogFile(logEntry);
  }
};

/**
 * Format log entry for file writing
 * @param {Object} logData - Log data object
 * @returns {string} Formatted log entry
 */
const formatLogEntry = (logData) => {
  const timestamp = new Date().toISOString();
  const logLevel = getLogLevel(logData.activity_type);
  
  let entry = `[${timestamp}] [${logLevel}] [${logData.module}] `;
  entry += `${logData.activity_type}: ${logData.description}`;
  
  if (logData.user_id) {
    entry += ` | User ID: ${logData.user_id}`;
  }
  
  if (logData.details) {
    entry += ` | Details: ${JSON.stringify(logData.details)}`;
  }
  
  return entry;
};

/**
 * Get log level based on activity type
 * @param {string} activityType - Type of activity
 * @returns {string} Log level (INFO, WARNING, ERROR)
 */
const getLogLevel = (activityType) => {
  switch (activityType.toUpperCase()) {
    case 'LOGIN':
    case 'CREATE':
    case 'UPDATE':
    case 'READ':
      return 'INFO';
    case 'DELETE':
    case 'REJECT':
      return 'WARNING';
    case 'ERROR':
    case 'FAILED':
      return 'ERROR';
    default:
      return 'INFO';
  }
};

/**
 * Write log entry to log.txt file
 * @param {string} logEntry - Formatted log entry
 */
const writeToLogFile = (logEntry) => {
  try {
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, 'activity.log');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append log entry to file
    fs.appendFileSync(logFile, logEntry + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

/**
 * Read log file content
 * @param {number} lines - Number of lines to read (default: 100)
 * @returns {Array} Array of log entries
 */
const readLogFile = (lines = 100) => {
  try {
    const logFile = path.join(__dirname, '../logs/activity.log');
    
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const logEntries = content.trim().split('\n').filter(line => line.trim());
    
    // Return last N lines
    return logEntries.slice(-lines);
  } catch (error) {
    console.error('Error reading log file:', error);
    return [];
  }
};

/**
 * Clear log file
 */
const clearLogFile = () => {
  try {
    const logFile = path.join(__dirname, '../logs/activity.log');
    if (fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
    }
  } catch (error) {
    console.error('Error clearing log file:', error);
  }
};

/**
 * Get log file statistics
 * @returns {Object} Log file statistics
 */
const getLogStats = () => {
  try {
    const logFile = path.join(__dirname, '../logs/activity.log');
    
    if (!fs.existsSync(logFile)) {
      return {
        totalLines: 0,
        fileSize: 0,
        lastModified: null
      };
    }
    
    const stats = fs.statSync(logFile);
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim()).length;
    
    return {
      totalLines: lines,
      fileSize: stats.size,
      lastModified: stats.mtime
    };
  } catch (error) {
    console.error('Error getting log stats:', error);
    return {
      totalLines: 0,
      fileSize: 0,
      lastModified: null
    };
  }
};

module.exports = {
  createActivityLog,
  readLogFile,
  clearLogFile,
  getLogStats
}; 