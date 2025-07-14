const { ActivityLog } = require('../models');
const { logger, securityLogger } = require('../utils/logger');

const activityLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
      res.locals.responseBody = data;
      originalSend.apply(res, arguments);
    };

    res.on('finish', async () => {
      try {
        const userId = req.user ? req.user.id : null;
        const success = res.statusCode >= 200 && res.statusCode < 300;
        
        // Create activity log entry
        await ActivityLog.create({
          user_id: userId,
          action,
          status: success ? 'success' : 'failure',
          details: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            requestBody: req.body,
            responseBody: res.locals.responseBody
          }
        });

        // Log to appropriate logger
        const logData = {
          userId,
          action,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        };

        if (action.startsWith('auth.')) {
          securityLogger.info(action, logData);
        } else {
          logger.info(action, logData);
        }
      } catch (error) {
        logger.error('Activity logging error:', error);
      }
    });

    next();
  };
};

module.exports = activityLogger; 