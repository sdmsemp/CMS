const { User, Department, Complaint, sequelize } = require('../models');
const { Op } = require('sequelize');

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { role_id } = req.query;
    const where = {};
    
    if (role_id) {
      where.role_id = role_id;
    }

    const users = await User.findAll({
      where,
      attributes: ['emp_id', 'name', 'email', 'role_id', 'dept_id'],
      include: [{
        model: Department,
        attributes: ['name']
      }]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create Subadmin
exports.createSubadmin = async (req, res) => {
  try {
    // Check if department already has a subadmin
    const existingSubadmin = await User.findOne({
      where: {
        dept_id: req.body.dept_id,
        role_id: 2
      }
    });

    if (existingSubadmin) {
      return res.status(400).json({
        success: false,
        error: 'Department already has a subadmin'
      });
    }

    const subadmin = await User.create({
      ...req.body,
      role_id: 2
    });

    res.status(201).json({
      success: true,
      data: subadmin
    });
  } catch (error) {
    console.error('Create subadmin error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Department Management
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email'],
        where: { role_id: 2 },
        required: false
      }]
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check for dependent records
    const [users, complaints] = await Promise.all([
      User.count({ where: { dept_id: id }, transaction: t }),
      Complaint.count({ where: { dept_id: id }, transaction: t })
    ]);

    if (users > 0 || complaints > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with dependent records'
      });
    }

    await Department.destroy({
      where: { dept_id: id },
      transaction: t
    });

    await t.commit();
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Activity Logs
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Most Active Users
exports.getMostActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.findAll({
      attributes: [
        'emp_id',
        'name',
        'email',
        [sequelize.fn('COUNT', sequelize.col('Complaints.complaint_id')), 'complaint_count']
      ],
      include: [{
        model: Complaint,
        attributes: []
      }],
      group: ['User.emp_id'],
      order: [[sequelize.literal('complaint_count'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: activeUsers
    });
  } catch (error) {
    console.error('Get most active users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 