import { useEffect, useState, useRef, useCallback } from "react";
import { shipmentAPI, materialAPI, transporterAPI, vehicleTypeAPI } from "../../API/api";
import * as XLSX from 'xlsx';
import "./Shipment.css";

export default function Shipment() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [transporterID, setTransporterID] = useState('');
  const [vehicleTypeID, setVehicleTypeID] = useState('');
  const [material, setMaterial] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState('Single');
  const [groupID, setGroupID] = useState('');
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [targetShipment, setTargetShipment] = useState(null);
  
  // Multi shipment Excel upload states
  const [excelData, setExcelData] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  const [shipments, setShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  
  // Dropdown options
  const [materials, setMaterials] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [availableGroupIDs, setAvailableGroupIDs] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  
  const observer = useRef();
  const fetchedPages = useRef(new Set());
  const lastShipmentRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [materialsRes, transportersRes, vehicleTypesRes, groupIDsRes, shipmentsRes] = await Promise.all([
          materialAPI.getAll({ limit: 1000 }),
          transporterAPI.getAll({ limit: 1000 }),
          vehicleTypeAPI.getAll({ limit: 1000 }),
          shipmentAPI.getAllGroupIDs(),
          shipmentAPI.getShipmentsForSelection()
        ]);
        
        setMaterials(materialsRes?.data?.data || []);
        setTransporters(transportersRes?.data?.data || []);
        setVehicleTypes(vehicleTypesRes?.data?.data || []);
        setAvailableGroupIDs(Array.isArray(groupIDsRes?.data?.data) ? groupIDsRes.data.data : (Array.isArray(groupIDsRes?.data) ? groupIDsRes.data : []));
        setAvailableShipments(Array.isArray(shipmentsRes?.data?.data) ? shipmentsRes.data.data : (Array.isArray(shipmentsRes?.data) ? shipmentsRes.data : []));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setDropdownsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch shipments data with pagination
  useEffect(() => {
    const fetchShipments = async () => {
      if (loading || !hasMore || fetchedPages.current.has(currentPage)) return;
      
      fetchedPages.current.add(currentPage);
      setLoading(true);
      
      try {
        const response = await shipmentAPI.getAll({ page: currentPage, limit: 10, grouped: true });
        
        if (response?.data?.data) {
          setShipments(prev => [...prev, ...response.data.data]);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(currentPage < totalPages);
        } else if (response?.data) {
          // If no pagination structure, assume single page response
          setShipments(response.data);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
        fetchedPages.current.delete(currentPage);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [currentPage, hasMore, loading]);

  // Reset form fields
  const resetForm = () => {
    setSource('');
    setDestination('');
    setTransporterID('');
    setVehicleTypeID('');
    setMaterial('');
    setTotalWeight('');
    setVolume('');
    setQuantity('');
    setType('Single');
    setGroupID('');
    setEditingId(null);
    setShowForm(false);
    setExcelData([]);
    setShowExcelPreview(false);
    setShowAddToGroupModal(false);
    setTargetShipment(null);
  };

  // Download sample Excel template
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        Source: 'Mumbai',
        Destination: 'Delhi',
        OrderNo: 'ORD001',
        Material: 'Electronics',
        Weight: 500,
        Volume: 10,
        QTY: 20,
        GroupID: 'GRP001'
      },
      {
        Source: 'Mumbai',
        Destination: 'Bangalore',
        OrderNo: 'ORD002',
        Material: 'Furniture',
        Weight: 1000,
        Volume: 25,
        QTY: 10,
        GroupID: 'GRP001'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');
    XLSX.writeFile(workbook, 'shipment_template.xlsx');
  };

  // Handle Excel file upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to our expected format
        const mappedData = jsonData.map((row, index) => ({
          id: index,
          source: row.Source || '',
          destination: row.Destination || '',
          orderNo: row.OrderNo || '',
          material: row.Material || '',
          totalWeight: parseFloat(row.Weight) || 0,
          volume: parseFloat(row.Volume) || 0,
          quantity: parseInt(row.QTY) || 0,
          groupID: row.GroupID || '',
          transporterID: '',
          vehicleTypeID: ''
        }));
        
        setExcelData(mappedData);
        setShowExcelPreview(true);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Failed to parse Excel file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Update transporter/vehicle for a specific row in Excel data
  const updateExcelRow = (id, field, value) => {
    setExcelData(prev => 
      prev.map(row => row.id === id ? { ...row, [field]: value } : row)
    );
  };

  // Toggle expand/collapse for grouped shipments
  const toggleGroupExpansion = (groupID) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupID)) {
        newSet.delete(groupID);
      } else {
        newSet.add(groupID);
      }
      return newSet;
    });
  };

  // Handle add to group button click
  const handleAddToGroup = (shipment) => {
    setTargetShipment(shipment);
    setShowAddToGroupModal(true);
  };

  // Handle add shipment to existing shipment/group
  const handleAddShipmentToGroup = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const shipmentData = {
        source,
        destination,
        transporterID,
        vehicleTypeID,
        material,
        totalWeight: parseFloat(totalWeight),
        volume: parseFloat(volume),
        quantity: parseInt(quantity)
      };

      if (targetShipment.isGrouped) {
        // Add to existing group
        shipmentData.groupID = targetShipment.groupID;
        await shipmentAPI.addToGroup(shipmentData);
        alert('Shipment added to group successfully!');
      } else {
        // Convert Single shipment to Multi and add new one
        const newGroupID = `GRP_${Date.now()}`;
        
        // Convert the target shipment to Multi
        await shipmentAPI.convertToMulti(targetShipment._id, newGroupID);
        
        // Add the new shipment with same group ID
        shipmentData.groupID = newGroupID;
        await shipmentAPI.addToGroup(shipmentData);
        alert('Shipments grouped successfully!');
      }
      
      // Refresh the shipments list
      setShipments([]);
      setCurrentPage(1);
      fetchedPages.current.clear();
      setHasMore(true);
      
      resetForm();
    } catch (error) {
      console.error('Error adding shipment to group:', error);
      alert(error.response?.data?.message || 'Failed to add shipment to group');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle bulk shipment creation from Excel
  const handleBulkCreate = async () => {
    // Validate all rows have required fields
    const invalidRows = excelData.filter(row => 
      !row.source || !row.destination || !row.material || 
      !row.transporterID || !row.vehicleTypeID ||
      row.totalWeight <= 0 || row.volume <= 0 || row.quantity <= 0
    );
    
    if (invalidRows.length > 0) {
      alert('Please fill all required fields for all rows');
      return;
    }
    
    setFormLoading(true);
    
    try {
      const promises = excelData.map(row => 
        shipmentAPI.create({
          source: row.source,
          destination: row.destination,
          transporterID: row.transporterID,
          vehicleTypeID: row.vehicleTypeID,
          material: row.material,
          totalWeight: row.totalWeight,
          volume: row.volume,
          quantity: row.quantity,
          type: 'Multi',
          groupID: row.groupID
        })
      );
      
      const results = await Promise.all(promises);
      
      // Add new shipments to the list
      const newShipments = results.map(res => res.data).filter(Boolean);
      setShipments(prev => [...newShipments, ...prev]);
      
      resetForm();
      alert(`Successfully created ${newShipments.length} shipments!`);
    } catch (error) {
      console.error('Error creating bulk shipments:', error);
      alert('Failed to create some shipments. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle create new shipment
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const shipmentData = {
        source,
        destination,
        transporterID,
        vehicleTypeID,
        material,
        totalWeight: parseFloat(totalWeight),
        volume: parseFloat(volume),
        quantity: parseInt(quantity),
        type
      };

      if (type === 'Multi' && groupID) {
        shipmentData.groupID = groupID;
      }
      
      const response = await shipmentAPI.create(shipmentData);
      
      if (response?.data) {
        // Refresh the shipments list
        setShipments([]);
        setCurrentPage(1);
        fetchedPages.current.clear();
        setHasMore(true);
      }
      
      resetForm();
      alert('Shipment created successfully!');
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update shipment
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const shipmentData = {
        source,
        destination,
        transporterID,
        vehicleTypeID,
        material,
        totalWeight: parseFloat(totalWeight),
        volume: parseFloat(volume),
        quantity: parseInt(quantity),
        type
      };
      
      if (type === 'Multi' && groupID) {
        shipmentData.groupID = groupID;
      }
      
      const response = await shipmentAPI.update(editingId, shipmentData);
      
      if (response?.data) {
        setShipments(prev => 
          prev.map(s => s._id === editingId ? response.data : s)
        );
        resetForm();
        alert('Shipment updated successfully!');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Failed to update shipment');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete shipment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) {
      return;
    }
    
    try {
      await shipmentAPI.delete(id);
      setShipments(prev => prev.filter(s => s._id !== id));
      alert('Shipment deleted successfully!');
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('Failed to delete shipment');
    }
  };

  // Handle edit button click
  const handleEdit = (shipment) => {
    setSource(shipment.source || '');
    setDestination(shipment.destination || '');
    setTransporterID(shipment.transporterID || '');
    setVehicleTypeID(shipment.vehicleTypeID || '');
    setMaterial(shipment.material || '');
    setTotalWeight(shipment.totalWeight ? shipment.totalWeight.toString() : '');
    setVolume(shipment.volume ? shipment.volume.toString() : '');
    setQuantity(shipment.quantity ? shipment.quantity.toString() : '');
    setType(shipment.type || 'Single');
    setGroupID(shipment.groupID || '');
    setEditingId(shipment._id);
    setShowForm(true);
    setExcelData([]);
    setShowExcelPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const getTransporterName = (id) => {
    const transporter = transporters.find(t => t._id === id);
    return transporter?.name || id;
  };

  const getVehicleTypeName = (id) => {
    const vehicleType = vehicleTypes.find(vt => vt._id === id);
    return vehicleType?.name || id;
  };

  if (dropdownsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Shipment-container">
      <div className="Shipment-header">
        <h2 className="Shipment-title">Shipments</h2>
        <button className="Shipment-toggle-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Shipment'}
        </button>
      </div>

      {showForm && (
        <div className="Shipment-form-container">
          <h3 className="Shipment-form-title">
            {editingId ? 'Edit Shipment' : 'Add New Shipment'}
          </h3>
          
          {/* Type Selection at the top - only for new shipments */}
          {!editingId && (
            <div className="Shipment-type-selector" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <label className="Shipment-type-label" style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '15px' }}>
                Shipment Type *
              </label>
              <label className="Shipment-radio-label" style={{ marginRight: '20px' }}>
                <input
                  className="Shipment-radio-input"
                  type="radio"
                  value="Single"
                  checked={type === 'Single'}
                  onChange={(e) => {
                    setType(e.target.value);
                    setExcelData([]);
                    setShowExcelPreview(false);
                  }}
                  style={{ marginRight: '5px' }}
                />
                Single Shipment
              </label>
              <label className="Shipment-radio-label">
                <input
                  className="Shipment-radio-input"
                  type="radio"
                  value="Multi"
                  checked={type === 'Multi'}
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                  style={{ marginRight: '5px' }}
                />
                Multi Shipment
              </label>
            </div>
          )}
          
          {/* Single Shipment Form */}
          {(type === 'Single' || editingId) && (
            <form className="Shipment-single-form" onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="Shipment-form-fields">
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Source *</label>
                  <input
                    className="Shipment-field-input"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                  />
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Destination *</label>
                  <input
                    className="Shipment-field-input"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Material *</label>
                  
                 <input
                    className="Shipment-field-input"
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    required
                  />
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Transporter *</label>
                  <select
                    className="Shipment-field-select"
                    value={transporterID}
                    onChange={(e) => setTransporterID(e.target.value)}
                    required
                  >
                    <option value="">Select Transporter</option>
                    {transporters.map(transporter => (
                      <option key={transporter._id} value={transporter._id}>
                        {transporter.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Vehicle Type *</label>
                  <select
                    className="Shipment-field-select"
                    value={vehicleTypeID}
                    onChange={(e) => setVehicleTypeID(e.target.value)}
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(vehicleType => (
                      <option key={vehicleType._id} value={vehicleType._id}>
                        {vehicleType.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Total Weight (KG) *</label>
                  <input
                    className="Shipment-field-input"
                    type="number"
                    step="0.01"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                    required
                  />
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Volume (CFT) *</label>
                  <input
                    className="Shipment-field-input"
                    type="number"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    required
                  />
                </div>
                
                <div className="Shipment-field-group">
                  <label className="Shipment-field-label">Quantity *</label>
                  <input
                    className="Shipment-field-input"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                
                {editingId && (
                  <>
                    <div className="Shipment-field-group">
                      <label className="Shipment-field-label">Type *</label>
                      <select
                        className="Shipment-field-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="Multi">Multi</option>
                      </select>
                    </div>
                    
                    {type === 'Multi' && (
                      <div className="Shipment-field-group">
                        <label className="Shipment-field-label">Group ID *</label>
                        <input
                          className="Shipment-field-input"
                          type="text"
                          value={groupID}
                          onChange={(e) => setGroupID(e.target.value)}
                          required={type === 'Multi'}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="Shipment-form-actions">
                <button className="Shipment-submit-button" type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
                
                <button className="Shipment-cancel-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {/* Multi Shipment Excel Upload */}
          {type === 'Multi' && !editingId && (
            <div className="Shipment-multi-form">
              <div className="Shipment-excel-upload-section" style={{ marginBottom: '20px' }}>
                <button 
                  className="Shipment-download-template-button"
                  type="button" 
                  onClick={downloadSampleExcel}
                  style={{ marginRight: '10px', padding: '10px 20px' }}
                >
                  Download Sample Excel
                </button>
                
                <label className="Shipment-upload-label" style={{ padding: '10px 20px', backgroundColor: '#226f0aff', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>
                 Upload Excel File
                  <input
                    className="Shipment-file-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              
              {showExcelPreview && excelData.length > 0 && (
                <div className="Shipment-excel-preview">
                  <h4 className="Shipment-preview-title">Preview & Configure Shipments ({excelData.length} rows)</h4>
                  <div className="Shipment-table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="Shipment-excel-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                      <thead className="Shipment-table-head">
                        <tr className="Shipment-table-header-row" style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Source</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Destination</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Order No</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Material</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Weight (KG)</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Volume (CFT)</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Quantity</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Group ID</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Transporter *</th>
                          <th style={{ border: '1px solid #ddd', padding: '10px' }}>Vehicle Type *</th>
                        </tr>
                      </thead>
                      <tbody className="Shipment-table-body">
                        {excelData.map((row) => (
                          <tr className="Shipment-table-row" key={row.id}>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.source}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.destination}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.orderNo}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.material}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.totalWeight}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.volume}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.quantity}</td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>{row.groupID}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                              <select
                                value={row.transporterID}
                                onChange={(e) => updateExcelRow(row.id, 'transporterID', e.target.value)}
                                style={{ width: '150px', padding: '5px' }}
                              >
                                <option value="">Select</option>
                                {transporters.map(transporter => (
                                  <option key={transporter._id} value={transporter._id}>
                                    {transporter.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="Shipment-table-cell" style={{ border: '1px solid #ddd', padding: '8px' }}>
                              <select
                                className="Shipment-table-select"
                                value={row.vehicleTypeID}
                                onChange={(e) => updateExcelRow(row.id, 'vehicleTypeID', e.target.value)}
                                style={{ width: '150px', padding: '5px' }}
                              >
                                <option value="">Select</option>
                                {vehicleTypes.map(vehicleType => (
                                  <option key={vehicleType._id} value={vehicleType._id}>
                                    {vehicleType.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="Shipment-excel-actions">
                    <button 
                      className="Shipment-bulk-create-button"
                      type="button" 
                      onClick={handleBulkCreate} 
                      disabled={formLoading}
                      style={{ padding: '10px 20px', marginRight: '10px' }}
                    >
                      {formLoading ? 'Creating...' : `Create ${excelData.length} Shipments`}
                    </button>
                    
                    <button 
                      className="Shipment-cancel-button"
                      type="button" 
                      onClick={resetForm}
                      style={{ padding: '10px 20px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="Shipment-table-container">
        {shipments.length > 0 && (
          <table className="Shipment-data-table">
            <thead>
              <tr>
                <th>Expand</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Material</th>
                <th>Transporter</th>
                <th>Vehicle Type</th>
                <th>Weight (KG)</th>
                <th>Volume (CFT)</th>
                <th>Quantity</th>
                <th>Type</th>
                <th>Group ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment, index) => {
                const isLastElement = shipments.length === index + 1;
                const isGrouped = shipment.isGrouped;
                const isExpanded = expandedGroups.has(shipment.groupID);
                
                return (
                  <>
                    <tr
                      ref={isLastElement ? lastShipmentRef : null}
                      key={shipment._id || shipment.groupID}
                      style={{ 
                        backgroundColor: isGrouped ? '#f0f8ff' : 'transparent',
                        fontWeight: isGrouped ? 'bold' : 'normal'
                      }}
                    >
                      <td>
                        {isGrouped && (
                          <button 
                            onClick={() => toggleGroupExpansion(shipment.groupID)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '5px 10px'
                            }}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        )}
                      </td>
                      <td>{shipment.source}</td>
                      <td>{shipment.destination}</td>
                      <td>{shipment.material}</td>
                      <td>{getTransporterName(shipment.transporterID)}</td>
                      <td>{getVehicleTypeName(shipment.vehicleTypeID)}</td>
                      <td>{shipment.totalWeight.toFixed(2)}</td>
                      <td>{shipment.volume.toFixed(2)}</td>
                      <td>{shipment.quantity}</td>
                      <td>{shipment.type}{isGrouped ? ` (${shipment.itemCount} items)` : ''}</td>
                      <td>{shipment.groupID || '-'}</td>
                      <td>
                        <div className="Shipment-action-buttons">
                          {!isGrouped && (
                            <>
                              <button className="Shipment-edit-button" onClick={() => handleEdit(shipment)}>Edit</button>
                              <button className="Shipment-delete-button" onClick={() => handleDelete(shipment._id)}>Delete</button>
                            </>
                          )}
                          <button 
                            className="Shipment-add-to-group-button" 
                            onClick={() => handleAddToGroup(shipment)}
                            title={isGrouped ? 'Add to this group' : 'Group with this shipment'}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Render individual items if group is expanded */}
                    {isGrouped && isExpanded && shipment.items && shipment.items.map((item) => (
                      <tr 
                        key={item._id}
                        style={{ 
                          backgroundColor: '#f9f9f9',
                          fontSize: '0.9em'
                        }}
                      >
                        <td style={{ paddingLeft: '30px' }}>└─</td>
                        <td>{item.source}</td>
                        <td>{item.destination}</td>
                        <td>{item.material}</td>
                        <td>{getTransporterName(item.transporterID)}</td>
                        <td>{getVehicleTypeName(item.vehicleTypeID)}</td>
                        <td>{item.totalWeight.toFixed(2)}</td>
                        <td>{item.volume.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>{item.type}</td>
                        <td>{item.groupID || '-'}</td>
                        <td>
                          <div className="Shipment-action-buttons">
                            <button className="Shipment-edit-button" onClick={() => handleEdit(item)}>Edit</button>
                            <button className="Shipment-delete-button" onClick={() => handleDelete(item._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {loading && <div className="Shipment-loading-message">Loading more shipments...</div>}
      
      {!hasMore && shipments.length > 0 && (
        <div className="Shipment-end-message">No more shipments to load</div>
      )}
      
      {shipments.length === 0 && !loading && (
        <div className="Shipment-empty-message">No shipments found</div>
      )}

      {/* Add to Group Modal */}
      {showAddToGroupModal && targetShipment && (
        <div className="Shipment-modal-overlay" onClick={() => setShowAddToGroupModal(false)}>
          <div className="Shipment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="Shipment-modal-header">
              <h3>
                {targetShipment.isGrouped 
                  ? `Add Shipment to Group: ${targetShipment.groupID}`
                  : `Group with Shipment`
                }
              </h3>
              <button 
                className="Shipment-modal-close"
                onClick={() => setShowAddToGroupModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div className="Shipment-modal-body">
              {!targetShipment.isGrouped && (
                <div style={{ padding: '10px', backgroundColor: '#fff3e0', borderRadius: '5px', marginBottom: '15px' }}>
                  <strong>Note:</strong> This will create a new group with the selected shipment and your new shipment.
                </div>
              )}
              
              <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>Target Shipment:</strong><br/>
                {targetShipment.source} → {targetShipment.destination} | {targetShipment.material} | {targetShipment.totalWeight}kg
              </div>

              <form onSubmit={handleAddShipmentToGroup}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Source *</label>
                    <input
                      className="Shipment-field-input"
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Destination *</label>
                    <input
                      className="Shipment-field-input"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Material *</label>
                    <input
                      className="Shipment-field-input"
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Transporter *</label>
                    <select
                      className="Shipment-field-select"
                      value={transporterID}
                      onChange={(e) => setTransporterID(e.target.value)}
                      required
                    >
                      <option value="">Select Transporter</option>
                      {transporters.map(transporter => (
                        <option key={transporter._id} value={transporter._id}>
                          {transporter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Vehicle Type *</label>
                    <select
                      className="Shipment-field-select"
                      value={vehicleTypeID}
                      onChange={(e) => setVehicleTypeID(e.target.value)}
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map(vehicleType => (
                        <option key={vehicleType._id} value={vehicleType._id}>
                          {vehicleType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Weight (KG) *</label>
                    <input
                      className="Shipment-field-input"
                      type="number"
                      step="0.01"
                      value={totalWeight}
                      onChange={(e) => setTotalWeight(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Volume (CFT) *</label>
                    <input
                      className="Shipment-field-input"
                      type="number"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="Shipment-field-group">
                    <label className="Shipment-field-label">Quantity *</label>
                    <input
                      className="Shipment-field-input"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="Shipment-modal-footer">
                  <button 
                    className="Shipment-submit-button" 
                    type="submit" 
                    disabled={formLoading}
                  >
                    {formLoading ? 'Adding...' : 'Add to Group'}
                  </button>
                  <button 
                    className="Shipment-cancel-button" 
                    type="button" 
                    onClick={() => setShowAddToGroupModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
