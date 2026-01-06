const Joi = require('joi');
const { TENANT_ID } = require('../constants');

class TransporterValidation {
  createSchema() {
    return Joi.object({
      name: Joi.string().required().trim().min(2).max(100),
      gstn: Joi.string().required().trim().min(2).max(10),
      address: Joi.string().required().trim().min(10).max(500),
      emailId: Joi.string().required().email().lowercase().trim(),
      tenantID: Joi.string().default(TENANT_ID.toString())
    });
  }

  updateSchema() {
    return Joi.object({
      transporterID: Joi.string().trim(),
      name: Joi.string().trim().min(2).max(100),
      gstn: Joi.string().trim().min(2).max(10),
      address: Joi.string().trim().min(10).max(500),
      emailId: Joi.string().email().lowercase().trim(),
      tenantID: Joi.string()
    }).min(1);
  }

  validate(data, schema) {
    const { error, value } = schema.validate(data, {
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }
}

module.exports = new TransporterValidation();
