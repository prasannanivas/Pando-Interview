const ShipmentLib = require('../Lib/shipmentLib');
const ShipmentValidation = require('../Validation/shipmentValidation');
const ShipmentPresenter = require('../Presenter/shipmentPresenter');

class ShipmentController {
  // Create shipment
  async create(req, res) {
    try {
      const validatedData = ShipmentValidation.validate(req.body, ShipmentValidation.createSchema());
      const shipment = await ShipmentLib.create(validatedData);
      return ShipmentPresenter.created(res, shipment, 'Shipment created successfully');
    } catch (error) {
      return ShipmentPresenter.badRequest(res, error.message);
    }
  }

  // Get all shipments
  async getAll(req, res) {
    try {
      const { page, limit, sortBy } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: sortBy ? { [sortBy]: -1 } : { createdAt: -1 }
      };

      const result = await ShipmentLib.getAll({}, options);
      return ShipmentPresenter.successWithPagination(res, result);
    } catch (error) {
      return ShipmentPresenter.error(res, error.message);
    }
  }

  // Get shipment by ID
  async getById(req, res) {
    try {
      const shipment = await ShipmentLib.getById(req.params.id);
      return ShipmentPresenter.success(res, shipment);
    } catch (error) {
      return ShipmentPresenter.notFound(res, error.message);
    }
  }

  // Update shipment
  async update(req, res) {
    try {
      const validatedData = ShipmentValidation.validate(req.body, ShipmentValidation.updateSchema());
      const shipment = await ShipmentLib.update(req.params.id, validatedData);
      return ShipmentPresenter.success(res, shipment, 'Shipment updated successfully');
    } catch (error) {
      return ShipmentPresenter.badRequest(res, error.message);
    }
  }

  // Delete shipment
  async delete(req, res) {
    try {
      const result = await ShipmentLib.delete(req.params.id);
      return ShipmentPresenter.deleted(res, result);
    } catch (error) {
      return ShipmentPresenter.notFound(res, error.message);
    }
  }

  // Get shipments by transporter
  async getByTransporter(req, res) {
    try {
      const shipments = await ShipmentLib.getByTransporter(req.params.transporterId);
      return ShipmentPresenter.success(res, shipments);
    } catch (error) {
      return ShipmentPresenter.error(res, error.message);
    }
  }

  // Get shipments by vehicle type
  async getByVehicleType(req, res) {
    try {
      const shipments = await ShipmentLib.getByVehicleType(req.params.vehicleTypeId);
      return ShipmentPresenter.success(res, shipments);
    } catch (error) {
      return ShipmentPresenter.error(res, error.message);
    }
  }

  // Get shipments by group
  async getByGroup(req, res) {
    try {
      const shipments = await ShipmentLib.getByGroup(req.params.groupId);
      return ShipmentPresenter.success(res, shipments);
    } catch (error) {
      return ShipmentPresenter.error(res, error.message);
    }
  }

  // Get shipments by route
  async getByRoute(req, res) {
    try {
      const { source, destination } = req.query;
      const shipments = await ShipmentLib.getByRoute(source, destination);
      return ShipmentPresenter.success(res, shipments);
    } catch (error) {
      return ShipmentPresenter.error(res, error.message);
    }
  }
}

module.exports = new ShipmentController();
