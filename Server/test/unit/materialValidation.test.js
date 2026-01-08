// Testing validation rules
// Reference: Joi documentation

const MaterialValidation = require('../../Validation/materialValidation');

describe('MaterialValidation Tests', () => {
  
  describe('createSchema()', () => {
    it('should validate correct material data', () => {
      const validData = {
        name: 'Steel',
        description: 'High quality steel',
        weight: 1000,
        volume: 50
      };

      const schema = MaterialValidation.createSchema();
      const result = MaterialValidation.validate(validData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('Steel');
    });

    it('should reject negative weight', () => {
      const invalidData = {
        name: 'Steel',
        weight: -100,
        volume: 50
      };

      const schema = MaterialValidation.createSchema();
      
      try {
        MaterialValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('positive');
      }
    });

    it('should require name field', () => {
      const invalidData = {
        weight: 100,
        volume: 50
      };

      const schema = MaterialValidation.createSchema();
      
      try {
        MaterialValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('required');
      }
    });
  });

  describe('updateSchema()', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Aluminum'
      };

      const schema = MaterialValidation.updateSchema();
      const result = MaterialValidation.validate(updateData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('Aluminum');
    });

    it('should require at least one field', () => {
      const emptyData = {};

      const schema = MaterialValidation.updateSchema();
      
      try {
        MaterialValidation.validate(emptyData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('at least');
      }
    });
  });
});
