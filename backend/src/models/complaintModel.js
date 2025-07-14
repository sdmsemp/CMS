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
  severity: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'InProgress', 'Complete', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending'
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
    }
  ]
});

module.exports = Complaint; 