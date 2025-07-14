const SubadminTask = require('../models/subadminTaskModel');
const Complaint = require('../models/complaintModel');
const User = require('../models/userModel');
const { createActivityLog } = require('../utils/activityLogger');
const { Op } = require('sequelize');

/**
 * Get all complaints for subadmin's department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubadminComplaints = async (req, res) => {
  try {
    const subadminId = req.user.id;
    const deptId = req.user.dept_id;

    // Verify user is a subadmin
    if (req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only subadmins can view department complaints.'
      });
    }

    // Get complaints for subadmin's department, ordered by severity
    const complaints = await Complaint.findAll({
      where: {
        dept_id: deptId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['emp_id', 'name', 'email']
        },
        {
          model: SubadminTask,
          where: { emp_id: subadminId },
          required: false // LEFT JOIN to show complaints even without tasks
        }
      ],
      order: [
        ['severity', 'DESC'], // High severity first
        ['created_at', 'DESC'] // Newer complaints first
      ]
    });

    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Error in getSubadminComplaints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaints'
    });
  }
};

/**
 * Add task for a complaint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addTask = async (req, res) => {
  try {
    const { complaint_id, description } = req.body;
    const subadminId = req.user.id;

    // Verify user is a subadmin
    if (req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only subadmins can add tasks.'
      });
    }

    // Check if complaint exists and belongs to subadmin's department
    const complaint = await Complaint.findOne({
      where: {
        complaint_id,
        dept_id: req.user.dept_id
      }
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found or not in your department'
      });
    }

    // Check if task already exists for this complaint
    const existingTask = await SubadminTask.findOne({
      where: {
        complaint_id,
        emp_id: subadminId
      }
    });

    if (existingTask) {
      return res.status(400).json({
        success: false,
        error: 'Task already exists for this complaint'
      });
    }

    // Create new task
    const task = await SubadminTask.create({
      complaint_id,
      emp_id: subadminId,
      description,
      status: 'pending'
    });

    // Update complaint status to inProgress
    await complaint.update({ status: 'inProgress' });

    // Log activity
    await createActivityLog({
      user_id: subadminId,
      activity_type: 'CREATE',
      description: `Added task for complaint ${complaint_id}`,
      module: 'SubadminTask'
    });

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      data: task
    });
  } catch (error) {
    console.error('Error in addTask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add task'
    });
  }
};

/**
 * Update task description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { description } = req.body;
    const subadminId = req.user.id;

    // Verify user is a subadmin
    if (req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only subadmins can update tasks.'
      });
    }

    // Find task and verify ownership
    const task = await SubadminTask.findOne({
      where: {
        task_id,
        emp_id: subadminId
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or not authorized'
      });
    }

    // Update task
    await task.update({ description });

    // Log activity
    await createActivityLog({
      user_id: subadminId,
      activity_type: 'UPDATE',
      description: `Updated task ${task_id} description`,
      module: 'SubadminTask'
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
};

/**
 * Complete a task and update complaint status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const subadminId = req.user.id;

    // Verify user is a subadmin
    if (req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only subadmins can complete tasks.'
      });
    }

    // Find task and verify ownership
    const task = await SubadminTask.findOne({
      where: {
        task_id,
        emp_id: subadminId
      },
      include: [{
        model: Complaint,
        required: true
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or not authorized'
      });
    }

    // Update task and complaint status
    await task.update({ status: 'completed' });
    await task.Complaint.update({ status: 'completed' });

    // Log activity
    await createActivityLog({
      user_id: subadminId,
      activity_type: 'UPDATE',
      description: `Completed task ${task_id} and complaint ${task.complaint_id}`,
      module: 'SubadminTask'
    });

    res.status(200).json({
      success: true,
      message: 'Task and complaint marked as completed',
      data: task
    });
  } catch (error) {
    console.error('Error in completeTask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task'
    });
  }
};

/**
 * Get task details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTaskById = async (req, res) => {
  try {
    const { task_id } = req.params;
    const subadminId = req.user.id;

    // Verify user is a subadmin
    if (req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only subadmins can view tasks.'
      });
    }

    // Find task with related complaint info
    const task = await SubadminTask.findOne({
      where: {
        task_id,
        emp_id: subadminId
      },
      include: [{
        model: Complaint,
        include: [{
          model: User,
          as: 'user',
          attributes: ['emp_id', 'name', 'email']
        }]
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    });
  }
};

module.exports = {
  getSubadminComplaints,
  addTask,
  updateTask,
  completeTask,
  getTaskById
}; 