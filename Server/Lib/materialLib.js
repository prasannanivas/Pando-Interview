const Material = require('../Model/materialModel');

class MaterialLib { 

  constructor() {
    this.model = Material;
  } 

  // Create a new material
  async create(data) {
    try {
      const material = new this.model(data);
      return await material.save();
    } catch (error) {
      throw new Error(`Error creating material: ${error.message}`);
    }
  }

  // Get all materials
  async getAll(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const materials = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(filter);

      return {
        data: materials,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching materials: ${error.message}`);
    }
  }

  // Get material by ID
  async getById(id) {
    try {
      const material = await this.model.findOne({ materialID: id });
      if (!material) {
        throw new Error('Material not found');
      }
      return material;
    } catch (error) {
      throw new Error(`Error fetching material: ${error.message}`);
    }
  }

  // Update material
  async update(id, data) {
    try {
      const material = await this.model.findOneAndUpdate(
        { materialID: id },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!material) {
        throw new Error('Material not found');
      }

      return material;
    } catch (error) {
      throw new Error(`Error updating material: ${error.message}`);
    }
  }

  // Delete material
  async delete(id) {
    try {
      const material = await this.model.findOneAndDelete({ materialID: id });
      
      if (!material) {
        throw new Error('Material not found');
      }

      return { message: 'Material deleted successfully', data: material };
    } catch (error) {
      throw new Error(`Error deleting material: ${error.message}`);
    }
  }

  // Search by name
  async searchByName(name) {
    try {
      return await this.model.find({ 
        name: { $regex: name, $options: 'i' } 
      });
    } catch (error) {
      throw new Error(`Error searching materials: ${error.message}`);
    }
  }
}

module.exports = new MaterialLib();