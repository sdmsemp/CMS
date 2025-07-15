const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const ActivityLog = require('../models/activityLogModel');
const { readLogFile, clearLogFile, getLogStats, createActivityLog } = require('../utils/activityLogger');
const { Op } = require('sequelize');
const User = require('../models/userModel');
const { validateSubadmin, validateDepartment } = require('../validation/adminValidation');

// Middleware for superadmin-only routes
const superadminOnly = authorize([1]); // role_id 1 = superadmin
const adminAuth = [authenticateJWT, superadminOnly];

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints (Superadmin only)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not a superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users', adminAuth, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/subadmin:
 *   post:
 *     summary: Create a new subadmin (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, dept_id]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: /@starkdigital\.in$/
 *                 example: john@starkdigital.in
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 15
 *                 example: Password@123
 *               dept_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Subadmin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data or department already has a subadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not a superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/subadmin', adminAuth, validateSubadmin, adminController.createSubadmin);

/**
 * @swagger
 * /api/admin/department:
 *   post:
 *     summary: Create a new department (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 example: IT Department
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not a superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/department', adminAuth, validateDepartment, adminController.createDepartment);

/**
 * @swagger
 * /api/admin/test-logs:
 *   get:
 *     summary: Test activity logs endpoint (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/test-logs', adminAuth, async (req, res) => {
  try {
    // Test basic ActivityLog query
    const count = await ActivityLog.count();
    
    // Test User association
    const testLog = await ActivityLog.findOne({
      include: [{
        model: User,
        as: 'user',
        foreignKey: 'emp_id',
        attributes: ['name', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      data: {
        totalLogs: count,
        testLog: testLog,
        message: 'Activity logs test successful'
      }
    });
  } catch (error) {
    console.error('Test logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get activity logs (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activity logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const module = req.query.module;

    const whereClause = module ? { module } : {};

    const logs = await ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        foreignKey: 'emp_id',
        attributes: ['name', 'email']
      }],
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        logs: logs.rows,
        total: logs.count,
        totalPages: Math.ceil(logs.count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity logs'
    });
  }
});

/**
 * @swagger
 * /api/admin/most-active:
 *   get:
 *     summary: Get most active users (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of most active users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/most-active', adminAuth, async (req, res) => {
  try {
    const mostActiveUsers = await ActivityLog.findAll({
      attributes: [
        'emp_id',
        [sequelize.fn('COUNT', sequelize.col('log_id')), 'activity_count']
      ],
      include: [{
        model: User,
        as: 'user',
        foreignKey: 'emp_id',
        attributes: ['name', 'email']
      }],
      group: ['emp_id', 'user.emp_id', 'user.name', 'user.email'],
      order: [[sequelize.fn('COUNT', sequelize.col('log_id')), 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: mostActiveUsers
    });
  } catch (error) {
    console.error('Error fetching most active users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch most active users'
    });
  }
});

/**
 * @swagger
 * /api/admin/log-file:
 *   get:
 *     summary: Get activity log file content (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lines
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of lines to read from the end of the file
 *     responses:
 *       200:
 *         description: Log file content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/log-file', adminAuth, async (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 100;
    const logEntries = readLogFile(lines);
    const stats = getLogStats();

    res.status(200).json({
      success: true,
      data: {
        entries: logEntries,
        stats: stats
      }
    });
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read log file'
    });
  }
});

/**
 * @swagger
 * /api/admin/log-file/clear:
 *   post:
 *     summary: Clear activity log file (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Log file cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.post('/log-file/clear', adminAuth, async (req, res) => {
  try {
    clearLogFile();
    
    // Log the clearing action
    await createActivityLog({
      user_id: req.user.emp_id,
      activity_type: 'DELETE',
      description: 'Activity log file cleared by admin',
      module: 'Admin',
      details: { action: 'clear_log_file' }
    });

    res.status(200).json({
      success: true,
      message: 'Log file cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing log file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear log file'
    });
  }
});

/**
 * @swagger
 * /api/admin/log-file/stats:
 *   get:
 *     summary: Get activity log file statistics (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Log file statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/log-file/stats', adminAuth, async (req, res) => {
  try {
    const stats = getLogStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get log statistics'
    });
  }
});

module.exports = router; 