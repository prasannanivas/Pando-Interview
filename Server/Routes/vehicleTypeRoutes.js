const express = require('express');
const router = express.Router();
const VehicleTypeController = require('../Controller/vehicleTypeController');

// Create a new vehicle type
router.post('/', VehicleTypeController.create);

// Get all vehicle types
router.get('/', VehicleTypeController.getAll);

// Search vehicle types by name
router.get('/search', VehicleTypeController.search);

// Get vehicle type by ID
router.get('/:id', VehicleTypeController.getById);

// Update vehicle type
router.put('/:id', VehicleTypeController.update);

// Delete vehicle type
router.delete('/:id', VehicleTypeController.delete);

module.exports = router;
