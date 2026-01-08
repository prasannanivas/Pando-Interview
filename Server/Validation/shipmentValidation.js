const Joi = require('joi');
const { TENANT_ID } = require('../constants');

class ShipmentValidation {
  createSchema() {
    return Joi.object({
      tenantID: Joi.string().default(TENANT_ID.toString()),
      source: Joi.string().required().trim().min(2).max(100),
      destination: Joi.string().required().trim().min(2).max(100),
      transporterID: Joi.string().required().trim(),
      vehicleTypeID: Joi.string().required().trim(),
      totalWeight: Joi.number().required().positive(),
      material: Joi.string().required().trim(),
      volume: Joi.number().required().positive(),
      quantity: Joi.number().required().integer().positive(),
      type: Joi.string().required().valid('Single', 'Multi'),
      groupID: Joi.string().trim().when('type', {
        is: 'Multi',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    });
  }

  updateSchema() {
    return Joi.object({
      tenantID: Joi.string(),
      source: Joi.string().trim().min(2).max(100),
      destination: Joi.string().trim().min(2).max(100),
      transporterID: Joi.string().trim(),
      vehicleTypeID: Joi.string().trim(),
      totalWeight: Joi.number().positive(),
      volume: Joi.number().positive(),
      material: Joi.string().trim(),
      quantity: Joi.number().integer().positive(),
      type: Joi.string().valid('Single', 'Multi'),
      groupID: Joi.string().trim().allow('')
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

module.exports = new ShipmentValidation();
