// Testing validation rules
// Reference: Joi documentation

const TransporterValidation = require('../../Validation/transporterValidation');

describe('TransporterValidation Tests', () => {
  
  describe('createSchema()', () => {
    it('should validate correct transporter data', () => {
      const validData = {
        name: 'ABC Transport',
        gstn: 'GST123456',
        address: '123 Main Street, Mumbai',
        emailId: 'abc@transport.com'
      };

      const schema = TransporterValidation.createSchema();
      const result = TransporterValidation.validate(validData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('ABC Transport');
    });

    it('should require email field', () => {
      const invalidData = {
        name: 'ABC Transport',
        gstn: 'GST123456',
        address: '123 Main Street, Mumbai'
      };

      const schema = TransporterValidation.createSchema();
      
      try {
        TransporterValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('required');
      }
    });

    it('should validate email format', () => {
      const invalidData = {
        name: 'ABC Transport',
        gstn: 'GST123456',
        address: '123 Main Street, Mumbai',
        emailId: 'invalid-email'
      };

      const schema = TransporterValidation.createSchema();
      
      try {
        TransporterValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('email');
      }
    });

    it('should require minimum address length', () => {
      const invalidData = {
        name: 'ABC Transport',
        gstn: 'GST123456',
        address: 'Short',
        emailId: 'abc@transport.com'
      };

      const schema = TransporterValidation.createSchema();
      
      try {
        TransporterValidation.validate(invalidData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('length');
      }
    });
  });

  describe('updateSchema()', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'XYZ Transport'
      };

      const schema = TransporterValidation.updateSchema();
      const result = TransporterValidation.validate(updateData, schema);

      expect(result).to.exist;
      expect(result.name).to.equal('XYZ Transport');
    });

    it('should require at least one field', () => {
      const emptyData = {};

      const schema = TransporterValidation.updateSchema();
      
      try {
        TransporterValidation.validate(emptyData, schema);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.include('at least');
      }
    });
  });
});
