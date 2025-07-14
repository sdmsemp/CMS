require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');
const { deleteOldNotifications } = require('./controllers/notificationController');
const { initializeData } = require('./seeds/initializeData');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const roleRoutes = require('./routes/roleRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subadminTaskRoutes = require('./routes/subadminTaskRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Use morgan only in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subadmin', subadminTaskRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Only start the server if we're not in test environment
// if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;

  // Sync database and start server
  db.sequelize.sync({ force: false, alter: false })
    .then(async () => {
      console.log('Database connection established successfully.');
      
      // Initialize data (roles, departments, admin)
      try {
        await initializeData();
        console.log('Data initialization completed');
      } catch (error) {
        console.error('Data initialization failed:', error);
        // Continue server startup even if initialization fails
      }
      
      // Start the server
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });

      // Schedule notification cleanup job (runs daily at midnight)
      setInterval(deleteOldNotifications, 24 * 60 * 60 * 1000);
    })
    .catch((err) => {
      console.error('Database sync error:', err);
      process.exit(1);
    });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });
// }

module.exports = app; 