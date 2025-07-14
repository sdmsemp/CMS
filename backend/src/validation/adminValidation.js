const Joi = require('joi');

const createSubadminSchema = Joi.object({
  emp_id: Joi.number()
    .integer()
    .min(100)
    .max(999)
    .required()
    .messages({
      'number.base': 'Employee ID must be a number',
      'number.integer': 'Employee ID must be an integer',
      'number.min': 'Employee ID must be at least 100',
      'number.max': 'Employee ID must not exceed 999',
      'any.required': 'Employee ID is required'
    }),

  name: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 20 characters',
      'any.required': 'Name is required'
    }),

  email: Joi.string()
    .email()
    .pattern(/@starkdigital\.in$/)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Email must be from @starkdigital.in domain',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?=.*[!@#$%^&*])(?=.*\d{2,})/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 15 characters',
      'string.pattern.base': 'Password must contain at least one special character and two digits',
      'any.required': 'Password is required'
    }),

  dept_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Department ID must be a number',
      'number.integer': 'Department ID must be an integer',
      'any.required': 'Department ID is required'
    })
});

const createDepartmentSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters',
      'any.required': 'Department name is required'
    })
});

// Middleware to validate admin requests
const validateSubadmin = (req, res, next) => {
  const { error } = createSubadminSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map(detail => detail.message)
    });
  }

  next();
};

const validateDepartment = (req, res, next) => {
  const { error } = createDepartmentSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map(detail => detail.message)
    });
  }

  next();
};

module.exports = {
  validateSubadmin,
  validateDepartment,
  createSubadminSchema,
  createDepartmentSchema
}; 