const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const {sequelize} = require('../config/dbConfig');

const User = sequelize.define('User', {
  emp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    validate: {
      min: 100,
      max: 999,
      isInt: true
    },
    comment: '3-digits employee ID'
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [2, 20]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      custom(value) {
        if (!value.endsWith('@starkdigital.in')) {
          throw new Error('Email must be from @starkdigital.in domain');
        }
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 15],
      is: /^(?=.*[!@#$%^&*])(?=.*\d.*\d)/
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
  role_id: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 3,
    validate: {
      isIn: [[1, 2, 3]]
    },
    comment: '1=superadmin, 2=subadmin, 3=user'
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User; 