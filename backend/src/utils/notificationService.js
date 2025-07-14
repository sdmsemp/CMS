const nodemailer = require('nodemailer');
const webpush = require('web-push');
const { logger } = require('./logger');
const { getStatusUpdateTemplate, getNewComplaintTemplate } = require('./emailTemplates');

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify email configuration on startup
emailTransporter.verify()
  .then(() => logger.info('Email service is ready'))
  .catch(error => logger.error('Email service configuration error:', error));

// Configure web push
webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  // Send email notification with retry mechanism
  static async sendEmail(to, template) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM,
          to,
          subject: template.subject,
          html: template.html
        };

        await emailTransporter.sendMail(mailOptions);
        logger.info('Email notification sent', { to, subject: template.subject });
        return;
      } catch (error) {
        lastError = error;
        logger.warn(`Email notification attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    // If all retries failed
    logger.error('Email notification failed after all retries:', lastError);
    throw new Error('Failed to send email notification');
  }

  // Send web push notification with retry mechanism
  static async sendPushNotification(subscription, payload) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        logger.info('Push notification sent', { subscription: subscription.endpoint });
        return;
      } catch (error) {
        lastError = error;
        logger.warn(`Push notification attempt ${attempt} failed:`, error);

        // If subscription is invalid or expired, don't retry
        if (error.statusCode === 404 || error.statusCode === 410) {
          logger.error('Push subscription is invalid or expired:', error);
          throw error;
        }

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    // If all retries failed
    logger.error('Push notification failed after all retries:', lastError);
    throw new Error('Failed to send push notification');
  }

  // Send complaint status update notification
  static async sendComplaintStatusNotification(user, complaint) {
    try {
      // Send email notification
      const emailTemplate = getStatusUpdateTemplate(user, complaint);
      await this.sendEmail(user.email, emailTemplate);

      // If user has push subscription, send push notification
      if (user.push_subscription) {
        const pushPayload = {
          title: 'Complaint Status Update',
          body: `Your complaint "${complaint.title}" status is now ${complaint.status}`,
          data: {
            complaintId: complaint.complaint_id,
            url: `/complaints/${complaint.complaint_id}`
          }
        };

        try {
          const subscription = JSON.parse(user.push_subscription);
          await this.sendPushNotification(subscription, pushPayload);
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Clear invalid subscription
            await user.update({ push_subscription: null });
          }
          logger.error('Push notification error:', error);
        }
      }
    } catch (error) {
      logger.error('Status update notification error:', error);
      throw error;
    }
  }

  // Send new complaint notification to department admin
  static async sendNewComplaintNotification(complaint, departmentAdmin, user) {
    try {
      // Send email notification
      const emailTemplate = getNewComplaintTemplate(departmentAdmin, complaint, user);
      await this.sendEmail(departmentAdmin.email, emailTemplate);

      // If admin has push subscription, send push notification
      if (departmentAdmin.push_subscription) {
        const pushPayload = {
          title: 'New Complaint Received',
          body: `New ${complaint.severity} priority complaint: ${complaint.title}`,
          data: {
            complaintId: complaint.complaint_id,
            url: `/admin/complaints/${complaint.complaint_id}`
          }
        };

        try {
          const subscription = JSON.parse(departmentAdmin.push_subscription);
          await this.sendPushNotification(subscription, pushPayload);
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Clear invalid subscription
            await departmentAdmin.update({ push_subscription: null });
          }
          logger.error('Push notification error:', error);
        }
      }
    } catch (error) {
      logger.error('New complaint notification error:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 