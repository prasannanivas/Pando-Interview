// Testing vehicleTypeLib functions
// Learned from: https://mochajs.org/

const VehicleTypeLib = require('../../Lib/vehicleTypeLib');
const VehicleType = require('../../Model/vehicleTypeModel');

describe('VehicleTypeLib Tests', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  // Test create
  describe('create()', () => {
    it('should create a new vehicle type', async () => {
      const testData = {
        typeName: 'Truck',
        capacity: 10000,
        description: '10 ton truck'
      };

      const fakeResult = { _id: 'veh123', ...testData };
      
      sinon.stub(VehicleType.prototype, 'save').returns(Promise.resolve(fakeResult));

      const result = await VehicleTypeLib.create(testData);

      expect(result).to.deep.equal(fakeResult);
    });

    it('should throw error when save fails', async () => {
      const error = new Error('Database error');
      
      sinon.stub(VehicleType.prototype, 'save').returns(Promise.reject(error));

      try {
        await VehicleTypeLib.create({});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('creating vehicle type');
      }
    });
  });

  // Test getById
  describe('getById()', () => {
    it('should get vehicle type by ID', async () => {
      const fakeVehicleType = { vehicleTypeID: '123', typeName: 'Truck' };
      
      sinon.stub(VehicleType, 'findOne').returns(Promise.resolve(fakeVehicleType));

      const result = await VehicleTypeLib.getById('123');

      expect(result).to.deep.equal(fakeVehicleType);
    });

    it('should throw error if not found', async () => {
      sinon.stub(VehicleType, 'findOne').returns(Promise.resolve(null));

      try {
        await VehicleTypeLib.getById('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Vehicle type not found');
      }
    });
  });

  // Test update
  describe('update()', () => {
    it('should update vehicle type', async () => {
      const updated = { vehicleTypeID: '123', typeName: 'Heavy Truck' };
      
      sinon.stub(VehicleType, 'findOneAndUpdate').returns(Promise.resolve(updated));

      const result = await VehicleTypeLib.update('123', { typeName: 'Heavy Truck' });

      expect(result).to.deep.equal(updated);
    });

    it('should throw error if not found', async () => {
      sinon.stub(VehicleType, 'findOneAndUpdate').returns(Promise.resolve(null));

      try {
        await VehicleTypeLib.update('nonexistent', {});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Vehicle type not found');
      }
    });
  });

  // Test delete
  describe('delete()', () => {
    it('should delete vehicle type', async () => {
      const deleted = { vehicleTypeID: '123', typeName: 'Truck' };
      
      sinon.stub(VehicleType, 'findOneAndDelete').returns(Promise.resolve(deleted));

      const result = await VehicleTypeLib.delete('123');

      expect(result.data).to.deep.equal(deleted);
    });

    it('should throw error if not found', async () => {
      sinon.stub(VehicleType, 'findOneAndDelete').returns(Promise.resolve(null));

      try {
        await VehicleTypeLib.delete('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Vehicle type not found');
      }
    });
  });
});
