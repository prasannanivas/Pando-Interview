// Testing controller endpoints
// Learned from Mocha docs: https://mochajs.org/

const ShipmentController = require('../../Controller/shipmentController');
const ShipmentLib = require('../../Lib/shipmentLib');

describe('ShipmentController Tests', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  // Helper to create mock request and response objects
  function createMocks() {
    const req = {
      body: {},
      params: {},
      query: {}
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    return { req, res };
  }

  // Test create endpoint
  describe('create()', () => {
    it('should create shipment successfully', async () => {
      const { req, res } = createMocks();
      req.body = {
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
      
      const fakeShipment = { _id: '123', ...req.body };
      
      sinon.stub(ShipmentLib, 'create').returns(Promise.resolve(fakeShipment));

      await ShipmentController.create(req, res);

      expect(ShipmentLib.create.calledOnce).to.be.true;
    });

    it('should handle validation errors', async () => {
      const { req, res } = createMocks();
      req.body = { source: 'M' }; // too short
      
      const createStub = sinon.stub(ShipmentLib, 'create');
      
      await ShipmentController.create(req, res);

      // Validation error should prevent lib from being called
      expect(createStub.called).to.be.false;
    });
  });

  // Test getAll endpoint
  describe('getAll()', () => {
    it('should get all shipments', async () => {
      const { req, res } = createMocks();
      req.query = { page: '1', limit: '10' };
      
      const fakeData = { data: [], pagination: { total: 0 } };
      
      sinon.stub(ShipmentLib, 'getAll').returns(Promise.resolve(fakeData));

      await ShipmentController.getAll(req, res);

      expect(ShipmentLib.getAll.calledOnce).to.be.true;
    });

    it('should get grouped shipments when grouped=true', async () => {
      const { req, res } = createMocks();
      req.query = { grouped: 'true' };
      
      const fakeGroups = [{ groupID: 'GRP001', items: [] }];
      
      sinon.stub(ShipmentLib, 'getAllGrouped').returns(Promise.resolve(fakeGroups));

      await ShipmentController.getAll(req, res);

      expect(ShipmentLib.getAllGrouped.calledOnce).to.be.true;
    });

    it('should handle errors', async () => {
      const { req, res } = createMocks();
      req.query = {};
      
      const error = new Error('Database error');
      
      sinon.stub(ShipmentLib, 'getAll').returns(Promise.reject(error));

      await ShipmentController.getAll(req, res);

      expect(ShipmentLib.getAll.calledOnce).to.be.true;
    });
  });

  // Test getById endpoint
  describe('getById()', () => {
    it('should get shipment by ID', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      
      const fakeShipment = { _id: '123', source: 'Mumbai' };
      
      sinon.stub(ShipmentLib, 'getById').returns(Promise.resolve(fakeShipment));

      await ShipmentController.getById(req, res);

      expect(ShipmentLib.getById.calledWith('123')).to.be.true;
    });

    it('should handle not found error', async () => {
      const { req, res } = createMocks();
      req.params.id = 'nonexistent';
      
      const error = new Error('Shipment not found');
      
      sinon.stub(ShipmentLib, 'getById').returns(Promise.reject(error));

      await ShipmentController.getById(req, res);

      expect(ShipmentLib.getById.calledOnce).to.be.true;
    });
  });

  // Test update endpoint
  describe('update()', () => {
    it('should update shipment', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      req.body = { source: 'Pune' };
      
      const updated = { _id: '123', source: 'Pune' };
      
      sinon.stub(ShipmentLib, 'update').returns(Promise.resolve(updated));

      await ShipmentController.update(req, res);

      expect(ShipmentLib.update.calledOnce).to.be.true;
    });

    it('should handle validation errors', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      req.body = { totalWeight: -100 }; // negative weight
      
      const updateStub = sinon.stub(ShipmentLib, 'update');
      
      await ShipmentController.update(req, res);

      // Should catch validation error
      expect(updateStub.called).to.be.false;
    });
  });

  // Test delete endpoint
  describe('delete()', () => {
    it('should delete shipment', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      
      const deleted = { message: 'Deleted', data: { _id: '123' } };
      
      sinon.stub(ShipmentLib, 'delete').returns(Promise.resolve(deleted));

      await ShipmentController.delete(req, res);

      expect(ShipmentLib.delete.calledWith('123')).to.be.true;
    });

    it('should handle not found error', async () => {
      const { req, res } = createMocks();
      req.params.id = 'nonexistent';
      
      const error = new Error('Shipment not found');
      
      sinon.stub(ShipmentLib, 'delete').returns(Promise.reject(error));

      await ShipmentController.delete(req, res);

      expect(ShipmentLib.delete.calledOnce).to.be.true;
    });
  });

  // Test getAllGroupIDs endpoint
  describe('getAllGroupIDs()', () => {
    it('should get all group IDs', async () => {
      const { req, res } = createMocks();
      
      const fakeIDs = ['GRP001', 'GRP002'];
      
      sinon.stub(ShipmentLib, 'getAllGroupIDs').returns(Promise.resolve(fakeIDs));

      await ShipmentController.getAllGroupIDs(req, res);

      expect(ShipmentLib.getAllGroupIDs.calledOnce).to.be.true;
    });
  });

  // Test convertToMulti endpoint
  describe('convertToMulti()', () => {
    it('should convert shipment to Multi', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      req.body = { groupID: 'GRP001' };
      
      const converted = { _id: '123', type: 'Multi', groupID: 'GRP001' };
      
      sinon.stub(ShipmentLib, 'convertToMulti').returns(Promise.resolve(converted));

      await ShipmentController.convertToMulti(req, res);

      expect(ShipmentLib.convertToMulti.calledWith('123', 'GRP001')).to.be.true;
    });

    it('should handle missing groupID', async () => {
      const { req, res } = createMocks();
      req.params.id = '123';
      req.body = {};
      
      const convertStub = sinon.stub(ShipmentLib, 'convertToMulti');
      
      await ShipmentController.convertToMulti(req, res);

      // Should catch validation error
      expect(convertStub.called).to.be.false;
    });
  });

  // Test addToGroup endpoint
  describe('addToGroup()', () => {
    it('should add shipment to group', async () => {
      const { req, res } = createMocks();
      req.body = {
        groupID: 'GRP001',
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: 500,
        material: 'Steel',
        volume: 25,
        quantity: 5
      };
      
      const newShipment = { _id: '999', ...req.body };
      
      sinon.stub(ShipmentLib, 'addToGroup').returns(Promise.resolve(newShipment));

      await ShipmentController.addToGroup(req, res);

      expect(ShipmentLib.addToGroup.calledOnce).to.be.true;
    });

    it('should handle missing groupID', async () => {
      const { req, res } = createMocks();
      req.body = { source: 'Mumbai' }; // missing groupID
      
      const addStub = sinon.stub(ShipmentLib, 'addToGroup');
      
      await ShipmentController.addToGroup(req, res);

      // Validation should fail
      expect(addStub.called).to.be.false;
    });
  });
});
