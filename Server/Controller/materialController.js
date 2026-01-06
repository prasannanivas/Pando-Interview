const MaterialLib = require('../Lib/materialLib');
const MaterialValidation = require('../Validation/materialValidation');
const MaterialPresenter = require('../Presenter/materialPresenter');

class MaterialController {
  // Create material
  async create(req, res) {
    try {
      const validatedData = MaterialValidation.validate(req.body, MaterialValidation.createSchema());
      const material = await MaterialLib.create(validatedData);
      return MaterialPresenter.created(res, material);
    } catch (error) {
      return MaterialPresenter.badRequest(res, error.message);
    }
  }

  // Get all materials
  async getAll(req, res) {
    try {
      const { page, limit, sortBy } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: sortBy ? { [sortBy]: -1 } : { createdAt: -1 }
      };

      const result = await MaterialLib.getAll({}, options);
      return MaterialPresenter.successWithPagination(res, result);
    } catch (error) {
      return MaterialPresenter.error(res, error.message);
    }
  }

  // Get material by ID
  async getById(req, res) {
    try {
      const material = await MaterialLib.getById(req.params.id);
      return MaterialPresenter.success(res, material);
    } catch (error) {
      return MaterialPresenter.notFound(res, error.message);
    }
  }

  // Update material
  async update(req, res) {
    try {
      const validatedData = MaterialValidation.validate(req.body, MaterialValidation.updateSchema());
      const material = await MaterialLib.update(req.params.id, validatedData);
      return MaterialPresenter.success(res, material, 'Material updated successfully');
    } catch (error) {
      return MaterialPresenter.badRequest(res, error.message);
    }
  }

  // Delete material
  async delete(req, res) {
    try {
      const result = await MaterialLib.delete(req.params.id);
      return MaterialPresenter.deleted(res, result);
    } catch (error) {
      return MaterialPresenter.notFound(res, error.message);
    }
  }

  // Search materials by name
  async search(req, res) {
    try {
      const { name } = req.query;
      const materials = await MaterialLib.searchByName(name);
      return MaterialPresenter.success(res, materials);
    } catch (error) {
      return MaterialPresenter.error(res, error.message);
    }
  }
}

module.exports = new MaterialController();
