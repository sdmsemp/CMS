const Joi = require('joi');

const createActivityLogSchema = Joi.object({
  emp_id: Joi.number()
    .integer()
    .min(100)
    .max(999)
    .required()
    .messages({
      'number.base': 'Employee ID must be a number',
      'number.min': 'Employee ID must be at least 100',
      'number.max': 'Employee ID cannot exceed 999',
      'any.required': 'Employee ID is required'
    }),
  action: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Action description cannot exceed 100 characters',
      'any.required': 'Action description is required'
    })
});

module.exports = {
  createActivityLogSchema
}; 