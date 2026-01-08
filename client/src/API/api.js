import axios from 'axios';

// Base URL for API - Update this if your backend runs on a different port or URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Material APIs ====================

export const materialAPI = {
  // Create a new material
  create: (materialData) => apiClient.post('/materials', materialData),

  // Get all materials
  getAll: (params = {}) => apiClient.get('/materials', { params }),

  // Search materials by name
  search: (name) => apiClient.get(`/materials/search?name=${name}`),

  // Get material by ID
  getById: (id) => apiClient.get(`/materials/${id}`),

  // Update material
  update: (id, materialData) => apiClient.put(`/materials/${id}`, materialData),

  // Delete material
  delete: (id) => apiClient.delete(`/materials/${id}`),
};




// ==================== Shipment APIs ====================

export const shipmentAPI = {
  // Create a new shipment
  create: (shipmentData) => apiClient.post('/shipments', shipmentData),

  // Get all shipments
  getAll: (params = {}) => apiClient.get('/shipments', { params }),

  // Get all unique group IDs
  getAllGroupIDs: () => apiClient.get('/shipments/group-ids/all'),

  // Get shipments for selection
  getShipmentsForSelection: () => apiClient.get('/shipments/selection/all'),

  // Get shipments by route
  getByRoute: (source, destination) => 
    apiClient.get(`/shipments/route?source=${source}&destination=${destination}`),

  // Get shipments by transporter
  getByTransporter: (transporterId) => 
    apiClient.get(`/shipments/transporter/${transporterId}`),

  // Get shipments by vehicle type
  getByVehicleType: (vehicleTypeId) => 
    apiClient.get(`/shipments/vehicle-type/${vehicleTypeId}`),

  // Get shipments by group
  getByGroup: (groupId) => apiClient.get(`/shipments/group/${groupId}`),

  // Get shipment by ID
  getById: (id) => apiClient.get(`/shipments/${id}`),

  // Update shipment
  update: (id, shipmentData) => apiClient.put(`/shipments/${id}`, shipmentData),

  // Delete shipment
  delete: (id) => apiClient.delete(`/shipments/${id}`),

  // Convert Single to Multi
  convertToMulti: (id, groupID) => apiClient.patch(`/shipments/${id}/convert-to-multi`, { groupID }),

  // Add to existing group
  addToGroup: (shipmentData) => apiClient.post('/shipments/add-to-group', shipmentData),
};





// ==================== Transporter APIs ====================

export const transporterAPI = {
  // Create a new transporter
  create: (transporterData) => apiClient.post('/transporters', transporterData),

  // Get all transporters
  getAll: (params = {}) => apiClient.get('/transporters', { params }),

  // Search transporters
  search: (query) => apiClient.get(`/transporters/search?query=${query}`),

  // Get transporter by GSTN
  getByGstn: (gstn) => apiClient.get(`/transporters/gstn/${gstn}`),

  // Get transporter by ID
  getById: (id) => apiClient.get(`/transporters/${id}`),

  // Update transporter
  update: (id, transporterData) => 
    apiClient.put(`/transporters/${id}`, transporterData),

  // Delete transporter
  delete: (id) => apiClient.delete(`/transporters/${id}`),
};






// ==================== Vehicle Type APIs ====================

export const vehicleTypeAPI = {
  // Create a new vehicle type
  create: (vehicleTypeData) => apiClient.post('/vehicle-types', vehicleTypeData),

  // Get all vehicle types
  getAll: (params = {}) => apiClient.get('/vehicle-types', { params }),

  // Search vehicle types by name
  search: (name) => apiClient.get(`/vehicle-types/search?name=${encodeURIComponent(name)}`),

  // Get vehicle type by ID
  getById: (id) => apiClient.get(`/vehicle-types/${id}`),

  // Update vehicle type
  update: (id, vehicleTypeData) => 
    apiClient.put(`/vehicle-types/${id}`, vehicleTypeData),

  // Delete vehicle type
  delete: (id) => apiClient.delete(`/vehicle-types/${id}`),
};

// ==================== Default Export ====================

const api = {
  material: materialAPI,
  shipment: shipmentAPI,
  transporter: transporterAPI,
  vehicleType: vehicleTypeAPI,
};

export default api;
