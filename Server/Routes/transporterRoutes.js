const express = require('express');
const router = express.Router();
const TransporterController = require('../Controller/transporterController');

// Create a new transporter
router.post('/', TransporterController.create);

// Get all transporters
router.get('/', TransporterController.getAll);

// Search transporters
router.get('/search', TransporterController.search);

// Get transporter by GSTN
router.get('/gstn/:gstn', TransporterController.getByGstn);

// Get transporter by ID
router.get('/:id', TransporterController.getById);

// Update transporter
router.put('/:id', TransporterController.update);

// Delete transporter
router.delete('/:id', TransporterController.delete);

module.exports = router;
