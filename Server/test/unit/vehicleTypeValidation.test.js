// Testing validation rules
// Reference: Joi documentation

const VehicleTypeValidation = require('../../Validation/vehicleTypeValidation');

describe('VehicleTypeValidation Tests', () => {
  
  describe('createSchema()', () => {
    it('should validate correct vehicle type data', () => {
      const validData = {
        name: 'Truck',
        weight: 10000,
        volume: 500
      };

      const schema = VehicleTypeValidation.createSchema();
      const result = VehicleTypeValidation.validate(validData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('Truck');
    });

    it('should reject negative weight', () => {
      const invalidData = {
        name: 'Truck',
        weight: -100,
        volume: 500
      };

      const schema = VehicleTypeValidation.createSchema();
      
      try {
        VehicleTypeValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('positive');
      }
    });

    it('should require name field', () => {
      const invalidData = {
        weight: 10000,
        volume: 500
      };

      const schema = VehicleTypeValidation.createSchema();
      
      try {
        VehicleTypeValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('required');
      }
    });

    it('should require all fields', () => {
      const invalidData = {
        name: 'Truck'
      };

      const schema = VehicleTypeValidation.createSchema();
      
      try {
        VehicleTypeValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('required');
      }
    });
  });

  describe('updateSchema()', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Heavy Truck'
      };

      const schema = VehicleTypeValidation.updateSchema();
      const result = VehicleTypeValidation.validate(updateData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('Heavy Truck');
    });

    it('should require at least one field', () => {
      const emptyData = {};

      const schema = VehicleTypeValidation.updateSchema();
      
      try {
        VehicleTypeValidation.validate(emptyData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('at least');
      }
    });
  });
});
