const Joi = require('joi');

const createAttachmentSchema = Joi.object({
  complaint_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Complaint ID must be a number',
      'any.required': 'Complaint ID is required'
    }),
  file_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'File name cannot exceed 255 characters',
      'any.required': 'File name is required'
    }),
  file_path: Joi.string()
    .max(512)
    .required()
    .messages({
      'string.max': 'File path cannot exceed 512 characters',
      'any.required': 'File path is required'
    }),
  file_type: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'File type cannot exceed 100 characters',
      'any.required': 'File type is required'
    }),
  file_size: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'File size must be a number',
      'number.min': 'File size must be greater than 0',
      'any.required': 'File size is required'
    }),
  uploaded_by: Joi.number()
    .integer()
    .min(100)
    .max(999)
    .required()
    .messages({
      'number.base': 'Uploader ID must be a number',
      'number.min': 'Uploader ID must be at least 100',
      'number.max': 'Uploader ID cannot exceed 999',
      'any.required': 'Uploader ID is required'
    })
});

module.exports = {
  createAttachmentSchema
}; 