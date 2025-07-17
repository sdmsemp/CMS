const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const PushSubscription = sequelize.define('PushSubscription', {
  subscription_id: {
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
    comment: 'User who owns this subscription'
  },
  endpoint: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Push service endpoint URL'
  },
  p256dh: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'P-256 DH public key'
  },
  auth: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Authentication secret'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether subscription is active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'push_subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['emp_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['endpoint'],
      unique: true,
      length: 255
    }
  ]
});

module.exports = PushSubscription; 