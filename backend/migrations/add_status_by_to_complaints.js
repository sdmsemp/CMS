const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('complaints', 'status_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'emp_id'
      },
      comment: 'Employee ID of who last changed the status'
    });

    // Add index for better performance
    await queryInterface.addIndex('complaints', ['status_by'], {
      name: 'complaints_status_by_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('complaints', 'complaints_status_by_index');
    
    // Remove column
    await queryInterface.removeColumn('complaints', 'status_by');
  }
}; 