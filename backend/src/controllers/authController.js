require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User, Department } = require('../models');
const { registerSchema, loginSchema } = require('../validation/authValidation');
const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { createActivityLog } = require('../utils/activityLogger');


// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    emp_id: user.emp_id,
    email: user.email,
    role_id: user.role_id,
    dept_id: user.dept_id
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if department exists
    const department = await Department.findByPk(req.body.dept_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        error: 'Invalid department ID'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email }
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Pass raw password as password_hash, let model hook hash it
    const userData = {
      emp_id: req.body.emp_id,
      name: req.body.name,
      email: req.body.email,
      password_hash: req.body.password, // pass raw password
      dept_id: req.body.dept_id,
      role_id: req.body.role_id || 3 // default to user
    };

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const tokens = generateTokens(user);

    // Update user's refresh token
    await user.update({ refresh_token: tokens.refreshToken });

    res.status(201).json({
      success: true,
      data: {
        user: {
          emp_id: user.emp_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          dept_id: user.dept_id
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Registration error:', error, error.stack); // Add stack trace
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) {
      // Log failed login attempt
      await createActivityLog({
        user_id: 'unknown',
        activity_type: 'LOGIN_FAILED',
        description: `Failed login attempt for email: ${req.body.email}`,
        module: 'Auth',
        details: { email: req.body.email, reason: 'User not found' }
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(req.body.password);
    if (!isValidPassword) {
      // Log failed login attempt
      await createActivityLog({
        user_id: user.emp_id,
        activity_type: 'LOGIN_FAILED',
        description: `Failed login attempt for user: ${user.name}`,
        module: 'Auth',
        details: { email: req.body.email, reason: 'Invalid password' }
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Update user's refresh token
    await user.update({ refresh_token: tokens.refreshToken });

    // Log successful login
    await createActivityLog({
      user_id: user.emp_id,
      activity_type: 'LOGIN',
      description: `User logged in successfully: ${user.name} (${user.email})`,
      module: 'Auth',
      details: { 
        email: req.body.email, 
        role: user.role?.name || 'Unknown',
        department: user.department?.name || 'Unknown'
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          emp_id: user.emp_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          dept_id: user.dept_id
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error, error.stack); // Add stack trace
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Refresh token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findOne({
      where: {
        emp_id: decoded.id,
        refresh_token: refreshToken
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update user's refresh token
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      success: true,
      data: { tokens }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get VAPID public key
exports.getVapidPublicKey = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        publicKey: process.env.VAPID_PUBLIC_KEY
      }
    });
  } catch (error) {
    logger.error('Get VAPID public key error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Subscribe to push notifications
exports.subscribeToPushNotifications = async (req, res) => {
  try {
    const subscription = req.body;
    
    // Validate subscription object
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription data'
      });
    }

    // Update user's push subscription
    await User.update(
      { push_subscription: JSON.stringify(subscription) },
      { where: { emp_id: req.user.id } }
    );

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications'
    });
  } catch (error) {
    logger.error('Push notification subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Unsubscribe from push notifications
exports.unsubscribeFromPushNotifications = async (req, res) => {
  try {
    // Remove user's push subscription
    await User.update(
      { push_subscription: null },
      { where: { emp_id: req.user.id } }
    );

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    logger.error('Push notification unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 

// Logout user
exports.logout = async (req, res) => {
  try {
    // Get user from request (set by authenticateJWT middleware)
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Clear refresh token and push subscription
    await user.update({
      refresh_token: null,
      push_subscription: null
    });

    logger.info('User logged out successfully', { userId });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user);
    
    const user = await User.findOne({
      where: { emp_id: req.user.emp_id },
      attributes: ['emp_id', 'name', 'email', 'role_id', 'dept_id', ['created_at', 'createdAt']],
      include: [{
        model: Department,
        attributes: ['dept_id', 'name']
      }]
    });

    console.log('Found user:', user);

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 