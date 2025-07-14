const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const subadminTaskController = require('../controllers/subadminTaskController');
const { validateTask } = require('../validation/taskValidation');

// Middleware for subadmin-only routes
const subadminOnly = authorize([2]); // role_id 2 = subadmin
const subadminAuth = [authenticateJWT, subadminOnly];

/**
 * @swagger
 * tags:
 *   name: SubadminTasks
 *   description: Subadmin task management endpoints
 */

/**
 * @swagger
 * /api/subadmin/complaints:
 *   get:
 *     summary: Get all complaints for subadmin's department
 *     tags: [SubadminTasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints ordered by severity
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a subadmin
 */
router.get('/complaints', subadminAuth, subadminTaskController.getSubadminComplaints);

/**
 * @swagger
 * /api/subadmin/tasks:
 *   post:
 *     summary: Add a new task for a complaint
 *     tags: [SubadminTasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [complaint_id, description]
 *             properties:
 *               complaint_id:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input or task already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a subadmin
 */
router.post('/tasks', subadminAuth, validateTask, subadminTaskController.addTask);

/**
 * @swagger
 * /api/subadmin/tasks/{task_id}:
 *   put:
 *     summary: Update task description
 *     tags: [SubadminTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a subadmin
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:task_id', subadminAuth, validateTask, subadminTaskController.updateTask);

/**
 * @swagger
 * /api/subadmin/tasks/{task_id}/complete:
 *   put:
 *     summary: Mark task as completed
 *     tags: [SubadminTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task marked as completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a subadmin
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:task_id/complete', subadminAuth, subadminTaskController.completeTask);

/**
 * @swagger
 * /api/subadmin/tasks/{task_id}:
 *   get:
 *     summary: Get task details by ID
 *     tags: [SubadminTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a subadmin
 *       404:
 *         description: Task not found
 */
router.get('/tasks/:task_id', subadminAuth, subadminTaskController.getTaskById);

module.exports = router; 