// Testing shipmentLib functions
// Learned from: https://mochajs.org/ and https://sinonjs.org/

const ShipmentLib = require('../../Lib/shipmentLib');
const Shipment = require('../../Model/shipmentModel');

describe('ShipmentLib Tests', () => {
  
  // This runs after each test to clean up
  afterEach(() => {
    sinon.restore();
  });

  // Testing create function
  describe('create()', () => {
    it('should create a new shipment', async () => {
      // Arrange - setup test data
      const testData = {
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: 1000,
        material: 'Steel',
        volume: 50,
        quantity: 10,
        type: 'Single'
      };

      const fakeResult = { _id: 'ship123', ...testData };
      
      // Stub the save function (learned from Sinon docs)
      const saveStub = sinon.stub(Shipment.prototype, 'save');
      saveStub.returns(Promise.resolve(fakeResult));

      // Act - call the function
      const result = await ShipmentLib.create(testData);

      // Assert - check results
      expect(result).to.deep.equal(fakeResult);
      expect(saveStub.calledOnce).to.be.true;
    });

    it('should throw error when save fails', async () => {
      const testData = { source: 'Mumbai' };
      const error = new Error('Database error');
      
      sinon.stub(Shipment.prototype, 'save').returns(Promise.reject(error));

      try {
        await ShipmentLib.create(testData);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('creating shipment');
      }
    });
  });

  // Testing getById function
  describe('getById()', () => {
    it('should get shipment by ID', async () => {
      const fakeShipment = { _id: '123', source: 'Mumbai' };
      
      sinon.stub(Shipment, 'findById').returns(Promise.resolve(fakeShipment));

      const result = await ShipmentLib.getById('123');

      expect(result).to.deep.equal(fakeShipment);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Shipment, 'findById').returns(Promise.resolve(null));

      try {
        await ShipmentLib.getById('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Shipment not found');
      }
    });
  });

  // Testing update function
  describe('update()', () => {
    it('should update shipment', async () => {
      const changes = { source: 'Pune' };
      const updated = { _id: '123', source: 'Pune' };
      
      sinon.stub(Shipment, 'findByIdAndUpdate').returns(Promise.resolve(updated));

      const result = await ShipmentLib.update('123', changes);

      expect(result).to.deep.equal(updated);
    });

    it('should throw error if shipment not found', async () => {
      sinon.stub(Shipment, 'findByIdAndUpdate').returns(Promise.resolve(null));

      try {
        await ShipmentLib.update('nonexistent', { source: 'Pune' });
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Shipment not found');
      }
    });
  });

  // Testing delete function
  describe('delete()', () => {
    it('should delete shipment', async () => {
      const deleted = { _id: '123', source: 'Mumbai' };
      
      sinon.stub(Shipment, 'findByIdAndDelete').returns(Promise.resolve(deleted));

      const result = await ShipmentLib.delete('123');

      expect(result.data).to.deep.equal(deleted);
      expect(result.message).to.exist;
    });

    it('should throw error if not found', async () => {
      sinon.stub(Shipment, 'findByIdAndDelete').returns(Promise.resolve(null));

      try {
        await ShipmentLib.delete('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Shipment not found');
      }
    });
  });

  // Testing getAllGroupIDs function
  describe('getAllGroupIDs()', () => {
    it('should get all unique group IDs', async () => {
      const fakeIDs = ['GRP001', 'GRP002', 'GRP003'];
      
      sinon.stub(Shipment, 'distinct').returns(Promise.resolve(fakeIDs));

      const result = await ShipmentLib.getAllGroupIDs();

      expect(result).to.deep.equal(fakeIDs);
    });
  });

  // Testing convertToMulti function
  describe('convertToMulti()', () => {
    it('should convert Single to Multi', async () => {
      const oldShipment = { _id: '123', type: 'Single' };
      const newShipment = { _id: '123', type: 'Multi', groupID: 'GRP001' };
      
      sinon.stub(Shipment, 'findById').returns(Promise.resolve(oldShipment));
      sinon.stub(Shipment, 'findByIdAndUpdate').returns(Promise.resolve(newShipment));

      const result = await ShipmentLib.convertToMulti('123', 'GRP001');

      expect(result.type).to.equal('Multi');
      expect(result.groupID).to.equal('GRP001');
    });
  });

  // Testing addToGroup function
  describe('addToGroup()', () => {
    it('should add shipment to existing group', async () => {
      const existingGroup = { _id: '1', groupID: 'GRP001' };
      const newData = {
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: 500,
        material: 'Steel',
        volume: 25,
        quantity: 5
      };
      const savedShipment = { _id: '999', ...newData, groupID: 'GRP001' };
      
      sinon.stub(Shipment, 'findOne').returns(Promise.resolve(existingGroup));
      sinon.stub(Shipment.prototype, 'save').returns(Promise.resolve(savedShipment));

      const result = await ShipmentLib.addToGroup(newData, 'GRP001');

      expect(result.groupID).to.equal('GRP001');
    });

    it('should throw error if group not found', async () => {
      sinon.stub(Shipment, 'findOne').returns(Promise.resolve(null));

      try {
        await ShipmentLib.addToGroup({}, 'NONEXISTENT');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Group ID not found');
      }
    });
  });
});
