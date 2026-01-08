// Testing materialLib functions
// Learned from: https://mochajs.org/

const MaterialLib = require('../../Lib/materialLib');
const Material = require('../../Model/materialModel');

describe('MaterialLib Tests', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  // Test create
  describe('create()', () => {
    it('should create a new material', async () => {
      const testData = {
        materialName: 'Steel',
        unit: 'kg',
        pricePerUnit: 100
      };

      const fakeResult = { _id: 'mat123', ...testData };
      
      sinon.stub(Material.prototype, 'save').returns(Promise.resolve(fakeResult));

      const result = await MaterialLib.create(testData);

      expect(result).to.deep.equal(fakeResult);
    });

    it('should throw error when save fails', async () => {
      const error = new Error('Database error');
      
      sinon.stub(Material.prototype, 'save').returns(Promise.reject(error));

      try {
        await MaterialLib.create({});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('creating material');
      }
    });
  });

  // Test getById
  describe('getById()', () => {
    it('should get material by ID', async () => {
      const fakeMaterial = { materialID: '123', materialName: 'Steel' };
      
      sinon.stub(Material, 'findOne').returns(Promise.resolve(fakeMaterial));

      const result = await MaterialLib.getById('123');

      expect(result).to.deep.equal(fakeMaterial);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Material, 'findOne').returns(Promise.resolve(null));

      try {
        await MaterialLib.getById('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Material not found');
      }
    });
  });

  // Test update
  describe('update()', () => {
    it('should update material', async () => {
      const updated = { materialID: '123', materialName: 'Aluminum' };
      
      sinon.stub(Material, 'findOneAndUpdate').returns(Promise.resolve(updated));

      const result = await MaterialLib.update('123', { materialName: 'Aluminum' });

      expect(result).to.deep.equal(updated);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Material, 'findOneAndUpdate').returns(Promise.resolve(null));

      try {
        await MaterialLib.update('nonexistent', {});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Material not found');
      }
    });
  });

  // Test delete
  describe('delete()', () => {
    it('should delete material', async () => {
      const deleted = { materialID: '123', materialName: 'Steel' };
      
      sinon.stub(Material, 'findOneAndDelete').returns(Promise.resolve(deleted));

      const result = await MaterialLib.delete('123');

      expect(result.data).to.deep.equal(deleted);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Material, 'findOneAndDelete').returns(Promise.resolve(null));

      try {
        await MaterialLib.delete('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Material not found');
      }
    });
  });
});
