const express = require('express');
const router = express.Router();
const MaterialController = require('../Controller/materialController');

// Create a new material
router.post('/', MaterialController.create);

// Get all materials
router.get('/', MaterialController.getAll);

// Search materials by name
router.get('/search', MaterialController.search);

// Get material by ID
router.get('/:id', MaterialController.getById);

// Update material
router.put('/:id', MaterialController.update);

// Delete material
router.delete('/:id', MaterialController.delete);

module.exports = router;
