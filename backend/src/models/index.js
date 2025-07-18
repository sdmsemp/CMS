const { sequelize } = require('../config/dbConfig');
const User = require('./userModel');
const Role = require('./roleModel');
const Department = require('./departmentModel');
const Complaint = require('./complaintModel');
const SubadminTask = require('./subadminTaskModel');
const ActivityLog = require('./activityLogModel');
const Notification = require('./notificationModel');
const PushSubscription = require('./pushSubscriptionModel');

// User-Role Association
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// User-Department Association
User.belongsTo(Department, { foreignKey: 'dept_id' });
Department.hasMany(User, { foreignKey: 'dept_id' });

// User - Complaint Association
User.hasMany(Complaint, { foreignKey: 'emp_id' });
Complaint.belongsTo(User, { foreignKey: 'emp_id' });

// User - Complaint Status Association (who changed the status)
User.hasMany(Complaint, { foreignKey: 'status_by', as: 'StatusByUser' });
Complaint.belongsTo(User, { foreignKey: 'status_by', as: 'StatusByUser' });

// Department - Complaint Association
Department.hasMany(Complaint, { foreignKey: 'dept_id' });
Complaint.belongsTo(Department, { foreignKey: 'dept_id' });

// User - SubadminTask Association
User.hasMany(SubadminTask, { foreignKey: 'emp_id' });
SubadminTask.belongsTo(User, { foreignKey: 'emp_id' });

// Complaint - SubadminTask Association
Complaint.hasMany(SubadminTask, { foreignKey: 'complaint_id' });
SubadminTask.belongsTo(Complaint, { foreignKey: 'complaint_id' });

// Activity Log Association
ActivityLog.belongsTo(User, { foreignKey: 'emp_id', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'emp_id' });

// User - Notification Association
User.hasMany(Notification, { foreignKey: 'emp_id' });
Notification.belongsTo(User, { foreignKey: 'emp_id' });

// User - PushSubscription Association
User.hasMany(PushSubscription, { foreignKey: 'emp_id' });
PushSubscription.belongsTo(User, { foreignKey: 'emp_id' });

const db = {
  sequelize,
  User,
  Role,
  Department,
  Complaint,
  SubadminTask,
  ActivityLog,
  Notification,
  PushSubscription
};

module.exports = db; 