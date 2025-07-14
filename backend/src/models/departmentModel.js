const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Department = sequelize.define('Department', {
  dept_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'departments',
  timestamps: false
});

module.exports = Department; 