const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Role = sequelize.define('Role', {
  role_id: {
    type: DataTypes.TINYINT,
    primaryKey: true,
    validate: {
      isIn: [[1, 2, 3]]
    },
    comment: '1=superadmin, 2=subadmin, 3=user'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['superadmin', 'subadmin', 'user']]
    }
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Role; 