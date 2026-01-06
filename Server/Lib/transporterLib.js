const Transporter = require('../Model/transporterModel');

class TransporterLib {
  constructor() {
    this.model = Transporter;
  }

  // Create a new transporter
  async create(data) {
    try {
      const transporter = new this.model(data);
      return await transporter.save();
    } catch (error) {
      throw new Error(`Error creating transporter: ${error.message}`);
    }
  }

  // Get all transporters
  async getAll(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const transporters = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(filter);

      return {
        data: transporters,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching transporters: ${error.message}`);
    }
  }

  // Get transporter by ID
  async getById(id) {
    try {
      const transporter = await this.model.findOne({ transporterID: id });
      if (!transporter) {
        throw new Error('Transporter not found');
      }
      return transporter;
    } catch (error) {
      throw new Error(`Error fetching transporter: ${error.message}`);
    }
  }

  // Update transporter
  async update(id, data) {
    try {
      const transporter = await this.model.findOneAndUpdate(
        { transporterID: id },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!transporter) {
        throw new Error('Transporter not found');
      }

      return transporter;
    } catch (error) {
      throw new Error(`Error updating transporter: ${error.message}`);
    }
  }

  // Delete transporter
  async delete(id) {
    try {
      const transporter = await this.model.findOneAndDelete({ transporterID: id });
      
      if (!transporter) {
        throw new Error('Transporter not found');
      }

      return { message: 'Transporter deleted successfully', data: transporter };
    } catch (error) {
      throw new Error(`Error deleting transporter: ${error.message}`);
    }
  }

  // Search by name or GSTN
  async search(query) {
    try {
      return await this.model.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { gstn: { $regex: query, $options: 'i' } }
        ]
      });
    } catch (error) {
      throw new Error(`Error searching transporters: ${error.message}`);
    }
  }

  // Get by GSTN
  async getByGstn(gstn) {
    try {
      return await this.model.findOne({ gstn });
    } catch (error) {
      throw new Error(`Error fetching transporter by GSTN: ${error.message}`);
    }
  }
}

module.exports = new TransporterLib();
