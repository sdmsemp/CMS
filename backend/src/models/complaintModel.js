const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Complaint = sequelize.define('Complaint', {
  complaint_id: {
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
    }
  },
  dept_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'dept_id'
    }
  },
  title: {
    type: DataTypes.STRING(25),
    allowNull: false,
    validate: {
      len: [3, 25]
    }
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [10, 100]
    }
  },
  response: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'InProgress', 'Complete', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  status_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'emp_id'
    },
    comment: 'Employee ID of who last changed the status'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'complaints',
  timestamps: false,
  indexes: [
    {
      fields: ['emp_id']
    },
    {
      fields: ['dept_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['status_by']
    }
  ]
});

module.exports = Complaint; 