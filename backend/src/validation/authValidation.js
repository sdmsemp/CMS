const Joi = require('joi');

const registerSchema = Joi.object({
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
      'any.required': 'Department ID is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema
}; 