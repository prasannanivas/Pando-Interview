const TransporterLib = require('../Lib/transporterLib');
const TransporterValidation = require('../Validation/transporterValidation');
const TransporterPresenter = require('../Presenter/transporterPresenter');

class TransporterController {
  // Create transporter
  async create(req, res) {
    try {
      const validatedData = TransporterValidation.validate(req.body, TransporterValidation.createSchema());
      const transporter = await TransporterLib.create(validatedData);
      return TransporterPresenter.created(res, transporter);
    } catch (error) {
      return TransporterPresenter.badRequest(res, error.message);
    }
  }

  // Get all transporters
  async getAll(req, res) {
    try {
      const { page, limit, sortBy } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: sortBy ? { [sortBy]: -1 } : { createdAt: -1 }
      };

      const result = await TransporterLib.getAll({}, options);
      return TransporterPresenter.successWithPagination(res, result);
    } catch (error) {
      return TransporterPresenter.error(res, error.message);
    }
  }

  // Get transporter by ID
  async getById(req, res) {
    try {
      const transporter = await TransporterLib.getById(req.params.id);
      return TransporterPresenter.success(res, transporter);
    } catch (error) {
      return TransporterPresenter.notFound(res, error.message);
    }
  }

  // Update transporter
  async update(req, res) {
    try {
      const validatedData = TransporterValidation.validate(req.body, TransporterValidation.updateSchema());
      const transporter = await TransporterLib.update(req.params.id, validatedData);
      return TransporterPresenter.success(res, transporter, 'Transporter updated successfully');
    } catch (error) {
      return TransporterPresenter.badRequest(res, error.message);
    }
  }

  // Delete transporter
  async delete(req, res) {
    try {
      const result = await TransporterLib.delete(req.params.id);
      return TransporterPresenter.deleted(res, result);
    } catch (error) {
      return TransporterPresenter.notFound(res, error.message);
    }
  }

  // Search transporters
  async search(req, res) {
    try {
      const { query } = req.query;
      const transporters = await TransporterLib.search(query);
      return TransporterPresenter.success(res, transporters);
    } catch (error) {
      return TransporterPresenter.error(res, error.message);
    }
  }

  // Get by GSTN
  async getByGstn(req, res) {
    try {
      const transporter = await TransporterLib.getByGstn(req.params.gstn);
      return TransporterPresenter.success(res, transporter);
    } catch (error) {
      return TransporterPresenter.notFound(res, error.message);
    }
  }
}

module.exports = new TransporterController();
