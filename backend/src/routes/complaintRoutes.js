const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const complaintController = require('../controllers/complaintController');
const { validateComplaint } = require('../validation/complaintValidation');

// Middleware for different role access
const userAuth = [authenticateJWT];
const adminAuth = [authenticateJWT, authorize([1, 2])]; // Superadmin and Subadmin

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management endpoints
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, dept_id, severity]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dept_id:
 *                 type: integer
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', userAuth, validateComplaint, complaintController.createComplaint);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', userAuth, complaintController.getComplaintById);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints (filtered by role and department)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, inProgress, completed]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: List of complaints
 *       401:
 *         description: Unauthorized
 */
router.get('/', userAuth, complaintController.getComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update complaint status (Admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, inProgress, completed]
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Complaint not found
 */
router.put('/:id', adminAuth, complaintController.updateComplaint);

module.exports = router; 