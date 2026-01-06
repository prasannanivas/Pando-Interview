const VehicleType = require('../Model/vehicleTypeModel');

class VehicleTypeLib {
  constructor() {
    this.model = VehicleType;
  }

  // Create a new vehicle type
  async create(data) {
    try {
      const vehicleType = new this.model(data);
      return await vehicleType.save();
    } catch (error) {
      throw new Error(`Error creating vehicle type: ${error.message}`);
    }
  }

  // Get all vehicle types
  async getAll(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const vehicleTypes = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(filter);

      return {
        data: vehicleTypes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching vehicle types: ${error.message}`);
    }
  }

  // Get vehicle type by ID
  async getById(id) {
    try {
      const vehicleType = await this.model.findOne({ vehicleTypeID: id });
      if (!vehicleType) {
        throw new Error('Vehicle type not found');
      }
      return vehicleType;
    } catch (error) {
      throw new Error(`Error fetching vehicle type: ${error.message}`);
    }
  }

  // Update vehicle type
  async update(id, data) {
    try {
      const vehicleType = await this.model.findOneAndUpdate(
        { vehicleTypeID: id },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!vehicleType) {
        throw new Error('Vehicle type not found');
      }

      return vehicleType;
    } catch (error) {
      throw new Error(`Error updating vehicle type: ${error.message}`);
    }
  }

  // Delete vehicle type
  async delete(id) {
    try {
      const vehicleType = await this.model.findOneAndDelete({ vehicleTypeID: id });
      
      if (!vehicleType) {
        throw new Error('Vehicle type not found');
      }

      return { message: 'Vehicle type deleted successfully', data: vehicleType };
    } catch (error) {
      throw new Error(`Error deleting vehicle type: ${error.message}`);
    }
  }

  // Search by name
  async searchByName(name) {
    try {
      return await this.model.find({ 
        name: { $regex: name, $options: 'i' } 
      });
    } catch (error) {
      throw new Error(`Error searching vehicle types: ${error.message}`);
    }
  }
}

module.exports = new VehicleTypeLib();
