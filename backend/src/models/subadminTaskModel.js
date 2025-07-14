const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const SubadminTask = sequelize.define('SubadminTask', {
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  emp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'emp_id'
    },
    comment: 'References subadmin user'
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'complaints',
      key: 'complaint_id'
    }
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [10, 100]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subadmin_tasks',
  timestamps: false,
  indexes: [
    {
      fields: ['emp_id']
    },
    {
      fields: ['complaint_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = SubadminTask; 