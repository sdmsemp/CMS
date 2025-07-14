const Joi = require('joi');

// Validation schema for creating/updating complaints
const complaintSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Title must be a string',
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required'
  }),
  dept_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive',
    'any.required': 'Department ID is required'
  }),
  severity: Joi.string().valid('low', 'medium', 'high').required().messages({
    'string.base': 'Severity must be a string',
    'string.empty': 'Severity is required',
    'any.only': 'Severity must be one of: low, medium, high',
    'any.required': 'Severity is required'
  }),
  status: Joi.string().valid('new', 'inProgress', 'completed').messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be one of: new, inProgress, completed'
  })
});

// Middleware to validate complaint data
const validateComplaint = (req, res, next) => {
  // Skip validation for non-POST/PUT requests
  if (!['POST', 'PUT'].includes(req.method)) {
    return next();
  }

  const { error } = complaintSchema.validate(req.body, {
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
  validateComplaint
}; 