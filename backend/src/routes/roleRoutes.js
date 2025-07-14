const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorize = require('../middleware/authorize');
const { createRoleSchema, updateRoleSchema } = require('../validation/roleValidation');
const roleController = require('../controllers/roleController');

// Middleware for superadmin-only routes
const superadminOnly = authorize([1]); // role_id 1 = superadmin
const adminAuth = [authenticateJWT, superadminOnly];

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints (Superadmin only)
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role (Superadmin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role_id, role]
 *             properties:
 *               role_id:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *               role:
 *                 type: string
 *                 enum: [superadmin, subadmin, user]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { error } = createRoleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await roleController.createRole(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role (Superadmin only)
 *     tags: [Roles]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [superadmin, subadmin, user]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 *       404:
 *         description: Role not found
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { error } = updateRoleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    await roleController.updateRole(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles (Superadmin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 */
router.get('/', adminAuth, roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID (Superadmin only)
 *     tags: [Roles]
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
 *         description: Role details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a superadmin
 *       404:
 *         description: Role not found
 */
router.get('/:id', adminAuth, roleController.getRoleById);

module.exports = router; 