const Joi = require('joi');
const { TENANT_ID } = require('../constants');

class MaterialValidation {
  createSchema() {
    return Joi.object({
      name: Joi.string().required().trim().min(2).max(100),
      description: Joi.string().allow('').max(500).default(''),
      weight: Joi.number().required().positive(),
      volume: Joi.number().required().positive(),
      tenantID: Joi.string().default(TENANT_ID.toString())
    });
  }

  updateSchema() {
    return Joi.object({
      materialID: Joi.string().trim(),
      name: Joi.string().trim().min(2).max(100),
      description: Joi.string().allow('').max(500),
      weight: Joi.number().positive(),
      volume: Joi.number().positive(),
      tenantID: Joi.string()
    }).min(1);
  }

  validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }
}

module.exports = new MaterialValidation();
