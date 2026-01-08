const express = require('express');
const router = express.Router();
const ShipmentController = require('../Controller/shipmentController');

// Create a new shipment
router.post('/', ShipmentController.create);

// Get all shipments
router.get('/', ShipmentController.getAll);

// Get all unique group IDs
router.get('/group-ids/all', ShipmentController.getAllGroupIDs);

// Get shipments for selection (simplified)
router.get('/selection/all', ShipmentController.getShipmentsForSelection);

// Get shipments by route
router.get('/route', ShipmentController.getByRoute);

// Get shipments by transporter
router.get('/transporter/:transporterId', ShipmentController.getByTransporter);
// Get shipments by vehicle type
router.get('/vehicle-type/:vehicleTypeId', ShipmentController.getByVehicleType);

// Get shipments by group
router.get('/group/:groupId', ShipmentController.getByGroup);

// Convert Single shipment to Multi
router.patch('/:id/convert-to-multi', ShipmentController.convertToMulti);

// Add shipment to existing group
router.post('/add-to-group', ShipmentController.addToGroup);

// Get shipment by ID
router.get('/:id', ShipmentController.getById);

// Update shipment
router.put('/:id', ShipmentController.update);

// Delete shipment
router.delete('/:id', ShipmentController.delete);

module.exports = router;
