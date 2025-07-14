const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validation/departmentValidation');
const departmentController = require('../controllers/departmentController');

// Middleware for superadmin-only routes
const superadminOnly = authorize([1]); // role_id 1 = superadmin
const adminAuth = [authenticateJWT, superadminOnly];

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management endpoints (Superadmin only)
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department (Superadmin only)
 *     tags: [Departments]
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
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Department created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { error } = createDepartmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await departmentController.createDepartment(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department (Superadmin only)
 *     tags: [Departments]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { error } = updateDepartmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await departmentController.updateDepartment(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments (Superadmin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all departments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/', adminAuth, departmentController.getAllDepartments);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID (Superadmin only)
 *     tags: [Departments]
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
 *         description: Department details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 *       404:
 *         description: Department not found
 */
router.get('/:id', adminAuth, departmentController.getDepartmentById);

module.exports = router; 