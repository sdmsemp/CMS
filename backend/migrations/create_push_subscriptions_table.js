const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('push_subscriptions', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('push_subscriptions', ['emp_id'], {
      name: 'push_subscriptions_emp_id_index'
    });

    await queryInterface.addIndex('push_subscriptions', ['is_active'], {
      name: 'push_subscriptions_is_active_index'
    });

    await queryInterface.addIndex('push_subscriptions', ['endpoint'], {
      name: 'push_subscriptions_endpoint_unique',
      unique: true,
      length: 255
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_subscriptions');
  }
}; 