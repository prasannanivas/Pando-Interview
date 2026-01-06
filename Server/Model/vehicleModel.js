const mongoose = require('mongoose');
const { TENANT_ID } = require('../constants');

const vehicleTypeSchema = new mongoose.Schema({
  vehicleTypeID: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true,
    index: true
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

vehicleTypeSchema.index({ name: 1 });

class VehicleType {
  constructor() {
    this.model = mongoose.model('VehicleType', vehicleTypeSchema);
  }

  getModel() {
    return this.model;
  }
}

module.exports = new VehicleType().getModel();
