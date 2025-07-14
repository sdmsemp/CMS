const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Department name cannot exceed 100 characters',
      'any.required': 'Department name is required'
    })
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Department name cannot exceed 100 characters',
      'any.required': 'Department name is required'
    })
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema
}; 