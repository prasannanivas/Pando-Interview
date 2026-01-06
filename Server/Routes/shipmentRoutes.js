const express = require('express');
const router = express.Router();
const ShipmentController = require('../Controller/shipmentController');

// Create a new shipment
router.post('/', ShipmentController.create);

// Get all shipments
router.get('/', ShipmentController.getAll);

// Get shipments by route
router.get('/route', ShipmentController.getByRoute);

// Get shipments by transporter
router.get('/transporter/:transporterId', ShipmentController.getByTransporter);
// Get shipments by vehicle type
router.get('/vehicle-type/:vehicleTypeId', ShipmentController.getByVehicleType);

// Get shipments by group
router.get('/group/:groupId', ShipmentController.getByGroup);

// Get shipment by ID
router.get('/:id', ShipmentController.getById);

// Update shipment
router.put('/:id', ShipmentController.update);

// Delete shipment
router.delete('/:id', ShipmentController.delete);

module.exports = router;
