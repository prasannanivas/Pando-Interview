const mongoose = require('mongoose');
const { TENANT_ID } = require('../constants');

const shipmentSchema = new mongoose.Schema({

  shipmentID: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  tenantID: {
    type: String,
    required: true,
    default: TENANT_ID.toString()
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  transporterID: {
    type: String,
    required: true,
    ref: 'Transporter'
  },
  vehicleTypeID: {
    type: String,
    required: true,
    ref: 'VehicleType'
  },
  material: {
    type: String,
    required: true,
  },
  totalWeight: {
    type: Number,
    required: true
  },

  volume: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Multi'],
    default: 'Single'
  },
  groupID: {
    type: String,
    required: function() {
      return this.type === 'Multi';
    }
  }
}, {
  timestamps: true
});

class Shipment {
  constructor() {
    this.model = mongoose.model('Shipment', shipmentSchema);
  }

  getModel() {
    return this.model;
  }
}

module.exports = new Shipment().getModel();
