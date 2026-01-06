const mongoose = require('mongoose');
const { TENANT_ID } = require('../constants');

const materialSchema = new mongoose.Schema({
  materialID: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    required: true,
    comment: 'Weight in KG'
  },
  volume: {
    type: Number,
    required: true,
    comment: 'Volume in CFT'
  },
  tenantID: {
    type: String,
    required: true,
    default: TENANT_ID.toString()
  }
}, {
  timestamps: true
});

materialSchema.index({ name: 1 });

class Material {
  constructor() {
    this.model = mongoose.model('Material', materialSchema);
  }

  getModel() {
    return this.model;
  }
}

module.exports = new Material().getModel();
