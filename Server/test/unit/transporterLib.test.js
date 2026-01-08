// Testing transporterLib functions
// Learned from: https://mochajs.org/

const TransporterLib = require('../../Lib/transporterLib');
const Transporter = require('../../Model/transporterModel');

describe('TransporterLib Tests', () => {
  
  afterEach(() => {
    sinon.restore();
  });

  // Test create
  describe('create()', () => {
    it('should create a new transporter', async () => {
      const testData = {
        name: 'ABC Transport',
        contactNumber: '1234567890',
        email: 'abc@transport.com'
      };

      const fakeResult = { _id: 'trans123', ...testData };
      
      sinon.stub(Transporter.prototype, 'save').returns(Promise.resolve(fakeResult));

      const result = await TransporterLib.create(testData);

      expect(result).to.deep.equal(fakeResult);
    });

    it('should throw error when save fails', async () => {
      const error = new Error('Database error');
      
      sinon.stub(Transporter.prototype, 'save').returns(Promise.reject(error));

      try {
        await TransporterLib.create({});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('creating transporter');
      }
    });
  });

  // Test getById
  describe('getById()', () => {
    it('should get transporter by ID', async () => {
      const fakeTransporter = { transporterID: '123', name: 'ABC Transport' };
      
      sinon.stub(Transporter, 'findOne').returns(Promise.resolve(fakeTransporter));

      const result = await TransporterLib.getById('123');

      expect(result).to.deep.equal(fakeTransporter);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Transporter, 'findOne').returns(Promise.resolve(null));

      try {
        await TransporterLib.getById('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Transporter not found');
      }
    });
  });

  // Test update
  describe('update()', () => {
    it('should update transporter', async () => {
      const updated = { transporterID: '123', name: 'XYZ Transport' };
      
      sinon.stub(Transporter, 'findOneAndUpdate').returns(Promise.resolve(updated));

      const result = await TransporterLib.update('123', { name: 'XYZ Transport' });

      expect(result).to.deep.equal(updated);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Transporter, 'findOneAndUpdate').returns(Promise.resolve(null));

      try {
        await TransporterLib.update('nonexistent', {});
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Transporter not found');
      }
    });
  });

  // Test delete
  describe('delete()', () => {
    it('should delete transporter', async () => {
      const deleted = { transporterID: '123', name: 'ABC Transport' };
      
      sinon.stub(Transporter, 'findOneAndDelete').returns(Promise.resolve(deleted));

      const result = await TransporterLib.delete('123');

      expect(result.data).to.deep.equal(deleted);
    });

    it('should throw error if not found', async () => {
      sinon.stub(Transporter, 'findOneAndDelete').returns(Promise.resolve(null));

      try {
        await TransporterLib.delete('nonexistent');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Transporter not found');
      }
    });
  });
});
