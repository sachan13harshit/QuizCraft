import Joi from 'joi';

// Generic validation middleware
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
export const schemas = {
  signup: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      }),
    
    role: Joi.string()
      .valid('creator', 'taker')
      .required()
      .messages({
        'any.only': 'Role must be either "creator" or "taker"',
        'any.required': 'Role is required'
      }),
    
    firstName: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'First name cannot be empty',
        'string.max': 'First name cannot exceed 100 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Last name cannot be empty',
        'string.max': 'Last name cannot exceed 100 characters',
        'any.required': 'Last name is required'
      })
  }),

  login: Joi.object({
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
  }),

  updateProfile: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'First name cannot be empty',
        'string.max': 'First name cannot exceed 100 characters'
      }),
    
    lastName: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Last name cannot be empty',
        'string.max': 'Last name cannot exceed 100 characters'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'any.required': 'New password is required'
      })
  })
}; 