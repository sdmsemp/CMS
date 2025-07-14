const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Complaint Management System API',
      version: '1.0.0',
      description: 'API documentation for the Complaint Management System',
      contact: {
        name: 'API Support',
        email: 'support@starkdigital.in'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            emp_id: {
              type: 'integer',
              example: 101
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john@starkdigital.in'
            },
            role_id: {
              type: 'integer',
              example: 3
            },
            dept_id: {
              type: 'integer',
              example: 1
            }
          }
        },
        Complaint: {
          type: 'object',
          properties: {
            complaint_id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: 'Network Issue'
            },
            description: {
              type: 'string',
              example: 'Unable to connect to the network'
            },
            severity: {
              type: 'string',
              enum: ['High', 'Medium', 'Low'],
              example: 'High'
            },
            status: {
              type: 'string',
              enum: ['Pending', 'InProgress', 'Complete', 'Rejected'],
              example: 'Pending'
            },
            user_id: {
              type: 'integer',
              example: 101
            },
            dept_id: {
              type: 'integer',
              example: 1
            }
          }
        },
        Department: {
          type: 'object',
          properties: {
            dept_id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'IT'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@starkdigital.in'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password@123'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'dept_id'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@starkdigital.in'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password@123'
            },
            dept_id: {
              type: 'integer',
              example: 1
            }
          }
        },
        PushSubscription: {
          type: 'object',
          required: ['endpoint', 'keys'],
          properties: {
            endpoint: {
              type: 'string',
              example: 'https://fcm.googleapis.com/fcm/send/...'
            },
            keys: {
              type: 'object',
              properties: {
                p256dh: {
                  type: 'string',
                  example: 'BNcRdreALRFXTkOOUHK6...'
                },
                auth: {
                  type: 'string',
                  example: '8eDyX_uCN0XRhSbY...'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs; 