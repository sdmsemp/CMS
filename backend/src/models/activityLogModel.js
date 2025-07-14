const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const ActivityLog = sequelize.define('ActivityLog', {
  log_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  emp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'emp_id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['emp_id']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = ActivityLog; 