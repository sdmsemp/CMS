const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Attachment = sequelize.define('Attachment', {
  attachment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'complaints',
      key: 'complaint_id'
    }
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'emp_id'
    }
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  indexes: [
    {
      fields: ['complaint_id']
    },
    {
      fields: ['uploaded_by']
    }
  ]
});

module.exports = Attachment; 