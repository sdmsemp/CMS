const winston = require('winston');
const ActivityLog = require('../models/activityLogModel');

// Custom transport for activity logging
class ActivityLogTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.name = 'ActivityLogTransport';
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (info.level === 'info' && info.metadata) {
      try {
        await ActivityLog.create({
          user_id: info.metadata.user_id,
          activity_type: info.metadata.activity_type,
          description: info.metadata.description,
          module: info.metadata.module,
          ip_address: info.metadata.ip_address,
          user_agent: info.metadata.user_agent
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }

    callback();
  }
}

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new ActivityLogTransport()
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger; 