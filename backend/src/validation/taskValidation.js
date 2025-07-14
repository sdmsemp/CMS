const Joi = require('joi');

// Validation schema for creating/updating tasks
const taskSchema = Joi.object({
  complaint_id: Joi.number().integer().positive().messages({
    'number.base': 'Complaint ID must be a number',
    'number.integer': 'Complaint ID must be an integer',
    'number.positive': 'Complaint ID must be positive'
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 500 characters',
    'any.required': 'Description is required'
  })
});

// Middleware to validate task data
const validateTask = (req, res, next) => {
  // Skip validation for non-POST/PUT requests
  if (!['POST', 'PUT'].includes(req.method)) {
    return next();
  }

  const validationData = {};
  
  // For POST requests, validate complaint_id
  if (req.method === 'POST') {
    validationData.complaint_id = req.body.complaint_id;
  }
  
  // For both POST and PUT, validate description
  validationData.description = req.body.description;

  const { error } = taskSchema.validate(validationData, {
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
  validateTask
}; 