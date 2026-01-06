const VehicleTypeLib = require('../Lib/vehicleTypeLib');
const VehicleTypeValidation = require('../Validation/vehicleTypeValidation');
const VehicleTypePresenter = require('../Presenter/vehicleTypePresenter');

class VehicleTypeController {
  // Create vehicle type
  async create(req, res) {
    try {
      const validatedData = VehicleTypeValidation.validate(req.body, VehicleTypeValidation.createSchema());
      const vehicleType = await VehicleTypeLib.create(validatedData);
      return VehicleTypePresenter.created(res, vehicleType);
    } catch (error) {
      return VehicleTypePresenter.badRequest(res, error.message);
    }
  }

  // Get all vehicle types
  async getAll(req, res) {
    try {
      const { page, limit, sortBy } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: sortBy ? { [sortBy]: -1 } : { createdAt: -1 }
      };

      const result = await VehicleTypeLib.getAll({}, options);
      return VehicleTypePresenter.successWithPagination(res, result);
    } catch (error) {
      return VehicleTypePresenter.error(res, error.message);
    }
  }

  // Get vehicle type by ID
  async getById(req, res) {
    try {
      const vehicleType = await VehicleTypeLib.getById(req.params.id);
      return VehicleTypePresenter.success(res, vehicleType);
    } catch (error) {
      return VehicleTypePresenter.notFound(res, error.message);
    }
  }

  // Update vehicle type
  async update(req, res) {
    try {
      const validatedData = VehicleTypeValidation.validate(req.body, VehicleTypeValidation.updateSchema());
      const vehicleType = await VehicleTypeLib.update(req.params.id, validatedData);
      return VehicleTypePresenter.success(res, vehicleType, 'Vehicle type updated successfully');
    } catch (error) {
      return VehicleTypePresenter.badRequest(res, error.message);
    }
  }

  // Delete vehicle type
  async delete(req, res) {
    try {
      const result = await VehicleTypeLib.delete(req.params.id);
      return VehicleTypePresenter.deleted(res, result);
    } catch (error) {
      return VehicleTypePresenter.notFound(res, error.message);
    }
  }

  // Search vehicle types by name
  async search(req, res) {
    try {
      const { name } = req.query;
      const vehicleTypes = await VehicleTypeLib.searchByName(name);
      return VehicleTypePresenter.success(res, vehicleTypes);
    } catch (error) {
      return VehicleTypePresenter.error(res, error.message);
    }
  }
}

module.exports = new VehicleTypeController();
