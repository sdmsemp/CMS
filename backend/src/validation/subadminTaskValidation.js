const Joi = require('joi');

const createSubadminTaskSchema = Joi.object({
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
  complaint_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Complaint ID must be a number',
      'any.required': 'Complaint ID is required'
    }),
  description: Joi.string()
    .min(10)
    .max(100)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 100 characters',
      'any.required': 'Description is required'
    })
});

const updateSubadminTaskSchema = Joi.object({
  description: Joi.string()
    .min(10)
    .max(100)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 100 characters',
      'any.required': 'Description is required'
    })
});

module.exports = {
  createSubadminTaskSchema,
  updateSubadminTaskSchema
}; 