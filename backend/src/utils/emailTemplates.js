const getStatusUpdateTemplate = (user, complaint) => ({
  subject: `Complaint Status Update - ${complaint.title}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .details { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Complaint Status Update</h2>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>Your complaint has been updated with the following status:</p>
          <div class="details">
            <p><strong>Complaint Title:</strong> ${complaint.title}</p>
            <p><strong>New Status:</strong> ${complaint.status}</p>
            <p><strong>Complaint ID:</strong> ${complaint.complaint_id}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Severity:</strong> ${complaint.severity}</p>
          </div>
          <p>You can view the full details of your complaint by logging into your account.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Complaint Management System</p>
        </div>
      </div>
    </body>
    </html>
  `
});

const getNewComplaintTemplate = (admin, complaint, user) => ({
  subject: `New Complaint Received - ${complaint.title}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .details { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .priority-high { color: #dc3545; }
        .priority-medium { color: #ffc107; }
        .priority-low { color: #28a745; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Complaint Received</h2>
        </div>
        <div class="content">
          <p>Hello ${admin.name},</p>
          <p>A new complaint has been submitted to your department:</p>
          <div class="details">
            <p><strong>Complaint Title:</strong> ${complaint.title}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Severity:</strong> <span class="priority-${complaint.severity.toLowerCase()}">${complaint.severity}</span></p>
            <p><strong>Status:</strong> ${complaint.status}</p>
            <p><strong>Submitted By:</strong> ${user.name} (${user.email})</p>
            <p><strong>Complaint ID:</strong> ${complaint.complaint_id}</p>
          </div>
          <p>Please review and take necessary action on this complaint.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Complaint Management System</p>
        </div>
      </div>
    </body>
    </html>
  `
});

module.exports = {
  getStatusUpdateTemplate,
  getNewComplaintTemplate
}; 