const { Department, User } = require('../models');
const { logger } = require('../utils/logger');

/**
 * Create a new department
 * @route POST /api/departments
 * @access Private (Superadmin only)
 */
exports.createDepartment = async (req, res) => {
  try {
    // Check if department with same name exists
    const existingDepartment = await Department.findOne({
      where: { name: req.body.name }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name already exists'
      });
    }

    // Create department
    const department = await Department.create({
      name: req.body.name
    });

    // Send response first
    res.status(201).json({
      success: true,
      data: department
    });

    // Log after sending response
    try {
      logger.info(`Department created: ${department.name}`, {
        dept_id: department.dept_id,
        created_by: req.user?.emp_id || 'unknown'
      });
    } catch (logError) {
      console.error('Logging error:', logError);
    }

  } catch (error) {
    logger.error('Create department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Update a department
 * @route PUT /api/departments/:id
 * @access Private (Superadmin only)
 */
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if new name conflicts with existing department
    if (req.body.name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: { name: req.body.name }
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          error: 'Department with this name already exists'
        });
      }
    }

    // Update department
    await department.update({
      name: req.body.name
    });

    // Log after sending response to avoid blocking the response
    try {
      logger.info(`Department updated: ${department.name}`, {
        dept_id: department.dept_id,
        updated_by: req.user?.emp_id || 'unknown'
      });
    } catch (logError) {
      console.error('Logging error:', logError);
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    logger.error('Update department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get all departments
 * @route GET /api/departments
 * @access Private
 */
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{
        model: User,
        attributes: ['emp_id', 'name', 'email', 'role_id'],
        where: { role_id: 2 }, // Include subadmin info
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    logger.error('Get all departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get department by ID
 * @route GET /api/departments/:id
 * @access Private
 */
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['emp_id', 'name', 'email', 'role_id'],
        where: { role_id: 2 }, // Include subadmin info
        required: false
      }]
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    logger.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Delete a department
 * @route DELETE /api/departments/:id
 * @access Private (Superadmin only)
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if department has any users
    const usersCount = await User.count({
      where: { dept_id: req.params.id }
    });

    if (usersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with assigned users'
      });
    }

    // Delete department
    await department.destroy();

    // Log after sending response to avoid blocking the response
    try {
      logger.info(`Department deleted: ${department.name}`, {
        dept_id: department.dept_id,
        deleted_by: req.user?.emp_id || 'unknown'
      });
    } catch (logError) {
      console.error('Logging error:', logError);
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    logger.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 