const Joi = require('joi');

const createRoleSchema = Joi.object({
  role_id: Joi.number()
    .integer()
    .valid(1, 2, 3)
    .required()
    .messages({
      'number.base': 'Role ID must be a number',
      'any.only': 'Role ID must be 1 (superadmin), 2 (subadmin), or 3 (user)',
      'any.required': 'Role ID is required'
    }),
  role: Joi.string()
    .valid('superadmin', 'subadmin', 'user')
    .required()
    .messages({
      'any.only': 'Role must be superadmin, subadmin, or user',
      'any.required': 'Role is required'
    })
});

const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid('superadmin', 'subadmin', 'user')
    .required()
    .messages({
      'any.only': 'Role must be superadmin, subadmin, or user',
      'any.required': 'Role is required'
    })
});

module.exports = {
  createRoleSchema,
  updateRoleSchema
}; 