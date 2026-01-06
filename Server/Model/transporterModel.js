const mongoose = require('mongoose');
const { TENANT_ID } = require('../constants');

const transporterSchema = new mongoose.Schema({
  transporterID: {
    type: String,
    required: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    },
    unique: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  gstn: {
    type: String,
    required: true,
    index: true
  },
  address: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    lowercase: true
  },
  tenantID: {
    type: String,
    required: true,
    default: TENANT_ID.toString()
  }
}, {
  timestamps: true
});

transporterSchema.index({ name: 1 });
transporterSchema.index({ gstn: 1 });

class Transporter {
  constructor() {
    this.model = mongoose.model('Transporter', transporterSchema);
  }

  getModel() {
    return this.model;
  }
}

module.exports = new Transporter().getModel();

