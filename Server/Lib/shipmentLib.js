const Shipment = require('../Model/shipmentModel');

class ShipmentLib {
  constructor() {
    this.model = Shipment;
  }

  // Create a new shipment
  async create(data) {
    try {
      const shipment = new this.model(data);
      return await shipment.save();
    } catch (error) {
      throw new Error(`Error creating shipment: ${error.message}`);
    }
  }

  // Get all shipments
  async getAll(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const shipments = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(filter);

      return {
        data: shipments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching shipments: ${error.message}`);
    }
  }

  // Get shipment by ID
  async getById(id) {
    try {
      const shipment = await this.model.findById(id);
      if (!shipment) {
        throw new Error('Shipment not found');
      }
      return shipment;
    } catch (error) {
      throw new Error(`Error fetching shipment: ${error.message}`);
    }
  }

  // Update shipment
  async update(id, data) {
    try {
      const shipment = await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      return shipment;
    } catch (error) {
      throw new Error(`Error updating shipment: ${error.message}`);
    }
  }

  // Delete shipment
  async delete(id) {
    try {
      const shipment = await this.model.findByIdAndDelete(id);
      
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      return { message: 'Shipment deleted successfully', data: shipment };
    } catch (error) {
      throw new Error(`Error deleting shipment: ${error.message}`);
    }
  }

  // Get shipments by transporter
  async getByTransporter(transporterID) {
    try {
      return await this.model.find({ transporterID });
    } catch (error) {
      throw new Error(`Error fetching shipments by transporter: ${error.message}`);
    }
  }

  // Get shipments by vehicle type
  async getByVehicleType(vehicleTypeID) {
    try {
      return await this.model.find({ vehicleTypeID });
    } catch (error) {
      throw new Error(`Error fetching shipments by vehicle type: ${error.message}`);
    }
  }

  // Get shipments by group (for multi-shipments)
  async getByGroup(groupID) {
    try {
      return await this.model.find({ groupID, type: 'Multi' });
    } catch (error) {
      throw new Error(`Error fetching shipments by group: ${error.message}`);
    }
  }

  // Get shipments by source and destination
  async getByRoute(source, destination) {
    try {
      return await this.model.find({ source, destination });
    } catch (error) {
      throw new Error(`Error fetching shipments by route: ${error.message}`);
    }
  }
}

module.exports = new ShipmentLib();
