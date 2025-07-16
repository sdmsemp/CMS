const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const ActivityLog = require('../models/activityLogModel');
const { readLogFile, clearLogFile, getLogStats, createActivityLog } = require('../utils/activityLogger');
const { Op } = require('sequelize');
const { User, Department, Complaint, Role, sequelize } = require('../models');
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
 *         description: Test logs response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/test-logs', adminAuth, async (req, res) => {
  try {
    console.log('Test logs endpoint called');
    
    // Check if ActivityLog table exists and has data
    const logCount = await ActivityLog.count();
    console.log('Total activity logs in database:', logCount);
    
    // Get a sample log
    const sampleLog = await ActivityLog.findOne({
      include: [{
        model: User,
        as: 'user',
        foreignKey: 'emp_id',
        attributes: ['name', 'email']
      }]
    });
    
    console.log('Sample log:', sampleLog);
    
    res.status(200).json({
      success: true,
      data: {
        totalLogs: logCount,
        sampleLog: sampleLog
      }
    });
  } catch (error) {
    console.error('Test logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Test logs failed',
      details: error.message
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
    console.log('Logs endpoint called with query:', req.query);
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const module = req.query.module;

    const whereClause = module ? { module } : {};
    console.log('Where clause:', whereClause);

    const logs = await ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        foreignKey: 'emp_id',
        attributes: ['name', 'email', 'role_id'],
        include: [{
          model: Role,
          attributes: ['role']
        }]
      }],
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    console.log('Found logs:', logs.rows.length, 'Total:', logs.count);

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

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    console.log('Dashboard stats endpoint called');
    
    // Get pagination parameters for recent activities
    const activitiesPage = parseInt(req.query.activitiesPage) || 1;
    const activitiesLimit = parseInt(req.query.activitiesLimit) || 5;
    const activitiesOffset = (activitiesPage - 1) * activitiesLimit;
    
    // Simple counts without complex associations
    const departmentCount = await Department.count();
    const subadminCount = await User.count({ where: { role_id: 2 } });
    const userCount = await User.count({ where: { role_id: 3 } });
    const complaintCount = await Complaint.count();
    const activityCount = await ActivityLog.count();
    
    console.log('Counts:', { departmentCount, subadminCount, userCount, complaintCount, activityCount });

    // Format the data for frontend
    const stats = [
      {
        title: 'Total Departments',
        value: departmentCount.toString(),
        icon: 'Domain',
        color: 'primary.main',
        trend: '+1 this month'
      },
      {
        title: 'Total Subadmins',
        value: subadminCount.toString(),
        icon: 'SupervisorAccount',
        color: 'secondary.main',
        trend: '+2 this month'
      },
      {
        title: 'Active Users',
        value: userCount.toString(),
        icon: 'People',
        color: 'success.main',
        trend: '+5 this week'
      },
      {
        title: 'System Alerts',
        value: activityCount.toString(),
        icon: 'Notifications',
        color: 'warning.main',
        trend: '-2 this week'
      }
    ];

    // Get recent activities with pagination
    const recentActivities = await ActivityLog.findAndCountAll({
      order: [['timestamp', 'DESC']],
      limit: activitiesLimit,
      offset: activitiesOffset,
      raw: true
    });

    // Format recent activities
    const formattedActivities = recentActivities.rows.map(activity => ({
      type: activity.module || 'system',
      text: `${activity.action} - ${activity.module || 'System'}`,
      time: new Date(activity.timestamp).toLocaleString(),
      icon: activity.module === 'Admin' ? 'Settings' : 'Assignment'
    }));

    console.log('Sending response:', { stats, formattedActivities, totalActivities: recentActivities.count });

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivities: formattedActivities,
        totalActivities: recentActivities.count,
        activitiesPage,
        activitiesLimit,
        departments: departmentCount,
        subadmins: subadminCount,
        activeUsers: userCount,
        systemAlerts: activityCount,
        recentComplaints: complaintCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/dashboard/charts:
 *   get:
 *     summary: Get dashboard chart data (Superadmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard chart data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/dashboard/charts', adminAuth, async (req, res) => {
  try {
    console.log('Dashboard charts endpoint called');
    
    // Simple department data
    const departments = await Department.findAll({
      attributes: ['dept_id', 'name'],
      raw: true
    });

    // Format department performance for chart
    const departmentPerformance = {
      labels: departments.map(d => d.name || 'Unknown'),
      datasets: [{
        label: 'Total Complaints',
        data: departments.map(() => Math.floor(Math.random() * 20) + 5), // Random data for now
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
      }]
    };

    // User activity data - simplified
    const userActivity = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Active Users',
        data: [20, 25, 22, 30, 28, 15, 18], // Default data for now
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.4
      }]
    };

    console.log('Sending charts response');

    res.status(200).json({
      success: true,
      data: {
        departmentPerformance,
        userActivity
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard chart data: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/dashboard/test:
 *   get:
 *     summary: Test dashboard endpoint (no auth required)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Test response
 */
router.get('/dashboard/test', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Dashboard test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard test error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed: ' + error.message
    });
  }
});

module.exports = router; 