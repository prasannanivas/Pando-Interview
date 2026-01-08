// Testing validation rules
// Reference: Joi documentation

const ShipmentValidation = require('../../Validation/shipmentValidation');

describe('ShipmentValidation Tests', () => {
  
  // Test createSchema
  describe('createSchema()', () => {
    it('should validate correct shipment data', () => {
      const validData = {
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

      const schema = ShipmentValidation.createSchema();
      const result = ShipmentValidation.validate(validData, schema);

      expect(result).to.exist;
      expect(result.source).to.equal('Mumbai');
    });

    it('should require groupID for Multi type', () => {
      const invalidData = {
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: 1000,
        material: 'Steel',
        volume: 50,
        quantity: 10,
        type: 'Multi'
        // missing groupID
      };

      const schema = ShipmentValidation.createSchema();
      
      try {
        ShipmentValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('groupID');
      }
    });

    it('should reject negative weight', () => {
      const invalidData = {
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: -100,  // negative
        material: 'Steel',
        volume: 50,
        quantity: 10,
        type: 'Single'
      };

      const schema = ShipmentValidation.createSchema();
      
      try {
        ShipmentValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('positive');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        source: 'Mumbai'
        // missing other required fields
      };

      const schema = ShipmentValidation.createSchema();
      
      try {
        ShipmentValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('required');
      }
    });

    it('should trim string values', () => {
      const dataWithSpaces = {
        source: '  Mumbai  ',
        destination: '  Delhi  ',
        transporterID: '  trans123  ',
        vehicleTypeID: 'vehicle123',
        totalWeight: 1000,
        material: 'Steel',
        volume: 50,
        quantity: 10,
        type: 'Single'
      };

      const schema = ShipmentValidation.createSchema();
      const result = ShipmentValidation.validate(dataWithSpaces, schema);

      expect(result.source).to.equal('Mumbai');
      expect(result.destination).to.equal('Delhi');
    });

    it('should only accept Single or Multi for type', () => {
      const invalidData = {
        source: 'Mumbai',
        destination: 'Delhi',
        transporterID: 'trans123',
        vehicleTypeID: 'vehicle123',
        totalWeight: 1000,
        material: 'Steel',
        volume: 50,
        quantity: 10,
        type: 'Invalid'  // invalid type
      };

      const schema = ShipmentValidation.createSchema();
      
      try {
        ShipmentValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('Single');
      }
    });
  });

  // Test updateSchema
  describe('updateSchema()', () => {
    it('should validate partial update data', () => {
      const updateData = {
        source: 'Pune'
      };

      const schema = ShipmentValidation.updateSchema();
      const result = ShipmentValidation.validate(updateData, schema);

      expect(result).to.exist;
      expect(result.source).to.equal('Pune');
    });

    it('should accept empty groupID in update', () => {
      const updateData = {
        source: 'Chennai',
        groupID: ''  // empty string to clear groupID
      };

      const schema = ShipmentValidation.updateSchema();
      const result = ShipmentValidation.validate(updateData, schema);

      expect(result).to.exist;
    });

    it('should require at least one field', () => {
      const emptyData = {};

      const schema = ShipmentValidation.updateSchema();
      
      try {
        ShipmentValidation.validate(emptyData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('at least');
      }
    });
  });
});
