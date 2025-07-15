const Complaint = require('../models/complaintModel');
const User = require('../models/userModel');
const { createActivityLog } = require('../utils/activityLogger');
const { createComplaintNotification } = require('./notificationController');
const { Op } = require('sequelize');

/**
 * Create a new complaint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createComplaint = async (req, res) => {
  try {
    const { title, description, dept_id, severity } = req.body;
    const emp_id = req.user.emp_id; // Fixed: using emp_id instead of id

    // Validate title length
    if (!title || title.length < 3 || title.length > 25) {
      return res.status(400).json({
        success: false,
        error: 'Title must be between 3 and 25 characters'
      });
    }

    // Validate description length
    if (!description || description.length < 10 || description.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Description must be between 10 and 100 characters'
      });
    }

    // Validate severity
    // if (!['High', 'Medium', 'Low'].includes(severity)) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Severity must be High, Medium, or Low'
    //   });
    // }

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      dept_id,
      emp_id,
      severity: severity.toLowerCase(),
      status: 'Pending'
    });

    // Find subadmin of the department to notify
    const subadmin = await User.findOne({
      where: {
        dept_id,
        role_id: 2 // role_id 2 = subadmin
      }
    });

    if (subadmin) {
      // Send notification to subadmin
      await createComplaintNotification(complaint, subadmin.emp_id);
    }

    // Log activity
    await createActivityLog({
      user_id: emp_id,
      activity_type: 'CREATE',
      description: `Created complaint: ${title}`,
      module: 'Complaint'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error in createComplaint:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message)
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid department ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create complaint'
    });
  }
};

/**
 * Get complaint by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.emp_id; // Fixed: using emp_id instead of id
    const userRole = req.user.role_id;
    const userDept = req.user.dept_id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid complaint ID'
      });
    }

    const complaint = await Complaint.findOne({
      where: { complaint_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['emp_id', 'name', 'email']
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Check access rights
    if (userRole === 3 && complaint.emp_id !== userId) { // Regular user
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (userRole === 2 && complaint.dept_id !== userDept) { // Subadmin
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error in getComplaintById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint'
    });
  }
};

/**
 * Get complaints based on user role and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getComplaints = async (req, res) => {
  try {
    const userId = req.user.emp_id; // Fixed: using emp_id instead of id
    const userRole = req.user.role_id;
    const userDept = req.user.dept_id;
    const { status, severity } = req.query;

    let whereClause = {};

    // Validate and add filters if provided
    if (status) {
      if (!['Pending', 'InProgress', 'Complete', 'Rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status value'
        });
      }
      whereClause.status = status;
    }

    if (severity) {
      if (!['low', 'medium', 'high'].includes(severity.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid severity value'
        });
      }
      whereClause.severity = severity.toLowerCase();
    }

    // Apply role-based filters
    if (userRole === 3) { // Regular user
      whereClause.emp_id = userId;
    } else if (userRole === 2) { // Subadmin
      whereClause.dept_id = userDept;
    }
    // Superadmin can see all complaints

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['emp_id', 'name', 'email']
        }
      ],
      order: [
        ['severity', 'DESC'], // High severity first
        ['created_at', 'DESC'] // Newer first
      ]
    });

    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Error in getComplaints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaints'
    });
  }
};

/**
 * Update complaint status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userRole = req.user.role_id;
    const userDept = req.user.dept_id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid complaint ID'
      });
    }

    // Validate status if provided
    if (status && !['Pending', 'InProgress', 'Complete', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value. Must be one of: Pending, InProgress, Complete, Rejected'
      });
    }

    const complaint = await Complaint.findByPk(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Only allow subadmin of the same department or superadmin to update
    if (userRole === 2 && complaint.dept_id !== userDept) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // If complaint is already complete, don't allow response updates
    if (complaint.status === 'Complete' && response) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update response for completed complaints'
      });
    }

    // Validate response length if provided
    if (response && (response.length < 10 || response.length > 200)) {
      return res.status(400).json({
        success: false,
        error: 'Response must be between 10 and 200 characters'
      });
    }

    // Update the complaint
    const updateData = {};
    if (status) updateData.status = status;
    if (response !== undefined) updateData.response = response;

    await complaint.update(updateData);

    // Log activity
    await createActivityLog({
      user_id: req.user.emp_id,
      activity_type: 'UPDATE',
      description: `Updated complaint ${id} ${status ? `status to: ${status}` : ''}${response ? ' with response' : ''}`,
      module: 'Complaint'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error in updateComplaint:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update complaint'
    });
  }
};

module.exports = {
  createComplaint,
  getComplaintById,
  getComplaints,
  updateComplaint
}; 