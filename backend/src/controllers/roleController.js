const Role = require('../models/roleModel');
const { createActivityLog } = require('../utils/activityLogger');

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  try {
    const { role_id, role } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({
      where: { role_id: role_id }
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role with this ID already exists'
      });
    }

    // Create new role
    const newRole = await Role.create({
      role_id,
      role
    });

    // Log activity
    await createActivityLog({
      user_id: req.user.id,
      activity_type: 'CREATE',
      description: `Created new role: ${role}`,
      module: 'Role',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('Error in createRole:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
};

/**
 * Update an existing role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Find role by ID
    const existingRole = await Role.findByPk(id);

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent updating superadmin role
    if (existingRole.role_id === 1) {
      return res.status(403).json({
        success: false,
        error: 'Superadmin role cannot be modified'
      });
    }

    // Update role
    await existingRole.update({ role });

    // Log activity
    await createActivityLog({
      user_id: req.user.id,
      activity_type: 'UPDATE',
      description: `Updated role ID ${id} to: ${role}`,
      module: 'Role',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: existingRole
    });
  } catch (error) {
    console.error('Error in updateRole:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
};

/**
 * Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['role_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error in getAllRoles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error in getRoleById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role'
    });
  }
};

module.exports = {
  createRole,
  updateRole,
  getAllRoles,
  getRoleById
}; 