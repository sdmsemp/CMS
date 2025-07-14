const Joi = require('joi');

const createNotificationSchema = Joi.object({
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
  type: Joi.string()
    .valid('EMAIL', 'PUSH', 'IN_APP')
    .required()
    .messages({
      'any.only': 'Type must be EMAIL, PUSH, or IN_APP',
      'any.required': 'Type is required'
    }),
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  message: Joi.string()
    .required()
    .messages({
      'any.required': 'Message is required'
    }),
  status: Joi.string()
    .valid('PENDING', 'SENT', 'FAILED')
    .default('PENDING')
    .messages({
      'any.only': 'Status must be PENDING, SENT, or FAILED'
    }),
  reference_id: Joi.number()
    .integer()
    .allow(null)
    .messages({
      'number.base': 'Reference ID must be a number'
    }),
  reference_type: Joi.string()
    .max(50)
    .allow(null)
    .messages({
      'string.max': 'Reference type cannot exceed 50 characters'
    }),
  error_message: Joi.string()
    .allow(null)
});

const updateNotificationSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'SENT', 'FAILED')
    .required()
    .messages({
      'any.only': 'Status must be PENDING, SENT, or FAILED',
      'any.required': 'Status is required'
    }),
  error_message: Joi.string()
    .allow(null)
});

module.exports = {
  createNotificationSchema,
  updateNotificationSchema
}; 