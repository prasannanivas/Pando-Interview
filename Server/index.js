const express = require('express');
const connectDB = require("./config/db");
const cors = require('cors');
// Import routes
const vehicleTypeRoutes = require('./Routes/vehicleTypeRoutes');
const transporterRoutes = require('./Routes/transporterRoutes');
const shipmentRoutes = require('./Routes/shipmentRoutes');
const materialRoutes = require('./Routes/materialRoutes');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/transporters', transporterRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/materials', materialRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Connect to DB
 connectDB();
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
