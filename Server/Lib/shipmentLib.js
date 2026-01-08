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

  // Get all unique group IDs
  async getAllGroupIDs() {
    try {
      const groupIDs = await this.model.distinct('groupID', { 
        type: 'Multi',
        groupID: { $exists: true, $ne: null, $ne: '' }
      });
      return groupIDs;
    } catch (error) {
      throw new Error(`Error fetching group IDs: ${error.message}`);
    }
  }

  // Get all shipments with basic info for selection
  async getAllShipmentsForSelection() {
    try {
      const shipments = await this.model
        .find({}, 'shipmentID source destination material type groupID totalWeight volume quantity')
        .sort({ createdAt: -1 })
        .limit(100);
      return shipments;
    } catch (error) {
      throw new Error(`Error fetching shipments for selection: ${error.message}`);
    }
  }

  // Convert Single shipment to Multi with new groupID
  async convertToMulti(id, groupID) {
    try {
      const shipment = await this.model.findByIdAndUpdate(
        id,
        { 
          $set: { 
            type: 'Multi',
            groupID: groupID
          }
        },
        { new: true, runValidators: true }
      );

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      return shipment;
    } catch (error) {
      throw new Error(`Error converting shipment to Multi: ${error.message}`);
    }
  }

  // Add shipment to existing group
  async addToGroup(shipmentData, groupID) {
    try {
      // Verify group exists
      const existingGroup = await this.model.findOne({ groupID, type: 'Multi' });
      if (!existingGroup) {
        throw new Error('Group ID not found');
      }

      // Create new shipment with the group ID
      const shipment = new this.model({
        ...shipmentData,
        type: 'Multi',
        groupID: groupID
      });
      
      return await shipment.save();
    } catch (error) {
      throw new Error(`Error adding shipment to group: ${error.message}`);
    }
  }

  // Get all shipments grouped by groupID
  async getAllGrouped(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      // Fetch all shipments (we'll handle pagination after grouping)
      const allShipments = await this.model
        .find(filter)
        .sort(sort);

      // Separate grouped and ungrouped shipments
      const groupedShipmentsMap = new Map();
      const ungroupedShipments = [];

      allShipments.forEach(shipment => {
        const shipmentObj = shipment.toObject();
        
        if (shipmentObj.type === 'Multi' && shipmentObj.groupID) {
          // Add to grouped shipments
          if (!groupedShipmentsMap.has(shipmentObj.groupID)) {
            groupedShipmentsMap.set(shipmentObj.groupID, {
              groupID: shipmentObj.groupID,
              type: 'Multi',
              source: shipmentObj.source,
              destination: shipmentObj.destination,
              transporterID: shipmentObj.transporterID,
              vehicleTypeID: shipmentObj.vehicleTypeID,
              material: shipmentObj.material,
              totalWeight: 0,
              volume: 0,
              quantity: 0,
              itemCount: 0,
              items: [],
              createdAt: shipmentObj.createdAt,
              updatedAt: shipmentObj.updatedAt,
              isGrouped: true
            });
          }
          
          const group = groupedShipmentsMap.get(shipmentObj.groupID);
          group.totalWeight += shipmentObj.totalWeight;
          group.volume += shipmentObj.volume;
          group.quantity += shipmentObj.quantity;
          group.itemCount += 1;
          group.items.push(shipmentObj);
          
          // Update createdAt to earliest and updatedAt to latest
          if (new Date(shipmentObj.createdAt) < new Date(group.createdAt)) {
            group.createdAt = shipmentObj.createdAt;
          }
          if (new Date(shipmentObj.updatedAt) > new Date(group.updatedAt)) {
            group.updatedAt = shipmentObj.updatedAt;
          }
        } else {
          // Single shipment
          ungroupedShipments.push({
            ...shipmentObj,
            isGrouped: false
          });
        }
      });

      // Combine grouped and ungrouped shipments
      const combinedShipments = [
        ...Array.from(groupedShipmentsMap.values()),
        ...ungroupedShipments
      ];

      // Sort combined shipments
      combinedShipments.sort((a, b) => {
        if (sort.createdAt === -1) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
      });

      // Apply pagination
      const total = combinedShipments.length;
      const paginatedShipments = combinedShipments.slice(skip, skip + limit);

      return {
        data: paginatedShipments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching grouped shipments: ${error.message}`);
    }
  }
}

module.exports = new ShipmentLib();
