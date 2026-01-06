import { useEffect, useState, useRef, useCallback } from "react";
import { vehicleTypeAPI } from "../../API/api";
import { Button, Input, FormField, Card, LoadingSpinner, Modal } from "../Common";

export default function VehicleType() {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceTimer = useRef(null);
  
  const observer = useRef();
  const fetchedPages = useRef(new Set());
  const lastVehicleTypeRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle search with debouncing
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    // Clear existing timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // If search is empty, reset to normal pagination mode
    if (!value.trim()) {
      setIsSearching(false);
      setVehicleTypes([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchedPages.current.clear();
      return;
    }
    
    // Set debounce timer for 500ms
    searchDebounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      setLoading(true);
      
      try {
        const response = await vehicleTypeAPI.search(value.trim());
        
        if (response?.data?.data) {
          setVehicleTypes(response.data.data);
          setHasMore(false); // Disable pagination when searching
        }
      } catch (error) {
        console.error('Error searching vehicle types:', error);
        alert('Failed to search vehicle types');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // fetch vehicle types data with pagination
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      // Skip pagination when in search mode
      if (isSearching) return;
      
      // Prevent fetching the same page multiple times
      if (loading || !hasMore || fetchedPages.current.has(currentPage)) return;
      
      fetchedPages.current.add(currentPage);
      setLoading(true);
      
      try {
        const response = await vehicleTypeAPI.getAll({ page: currentPage, limit: 10 });
        
        if (response?.data?.data) {
          setVehicleTypes(prev => [...prev, ...response.data.data]);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(currentPage < totalPages);
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        fetchedPages.current.delete(currentPage); // Remove from set on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isSearching]);

  // Reset form fields
  const resetForm = () => {
    setName('');
    setWeight('');
    setVolume('');
    setEditingId(null);
    setShowForm(false);
  };

  // Handle create new vehicle type
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await vehicleTypeAPI.create({
        name,
        weight: parseFloat(weight),
        volume: parseFloat(volume)
      });
      
      if (response?.data) {
        setVehicleTypes(prev => [response.data, ...prev]);
        resetForm();
        alert('Vehicle Type created successfully!');
      }
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      alert('Failed to create vehicle type');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update vehicle type
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await vehicleTypeAPI.update(editingId, {
        name,
        weight: parseFloat(weight),
        volume: parseFloat(volume)
      });
      
      if (response?.data) {
        setVehicleTypes(prev => 
          prev.map(vt => vt._id === editingId ? response.data : vt)
        );
        resetForm();
        alert('Vehicle Type updated successfully!');
      }
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      alert('Failed to update vehicle type');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete vehicle type
  const handleDelete = async () => {
    try {
      await vehicleTypeAPI.delete(deleteModal.id);
      setVehicleTypes(prev => prev.filter(vt => vt._id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
      alert('Vehicle Type deleted successfully!');
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
      alert('Failed to delete vehicle type');
    }
  };

  // Handle edit button click
  const handleEdit = (vehicleType) => {
    setName(vehicleType.name);
    setWeight(vehicleType.weight.toString());
    setVolume(vehicleType.volume.toString());
    setEditingId(vehicleType._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Vehicle Types</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Vehicle Type'}
        </Button>
      </div>

      {/* Search Box */}
      <div style={{ marginBottom: '20px' }}>
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchQuery && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            {isSearching && loading ? 'Searching...' : 
             isSearching ? `Found ${vehicleTypes.length} result(s)` : null}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card title={editingId ? 'Edit Vehicle Type' : 'Add New Vehicle Type'} style={{ marginBottom: '20px' }}>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter vehicle type name"
                  required
                />
              </FormField>
              
              <FormField label="Weight (KG)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight capacity"
                  required
                />
              </FormField>
              
              <FormField label="Volume (CFT)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Enter volume capacity"
                  required
                />
              </FormField>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button type="submit" loading={formLoading}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              
              <Button variant="ghost" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <div style={{ 
        display: 'grid', 
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
      }}>
        {vehicleTypes.map((vehicleType, index) => {
          const isLastElement = vehicleTypes.length === index + 1;
          
          return (
            <div ref={isLastElement ? lastVehicleTypeRef : null} key={vehicleType._id}>
              <Card
                title={vehicleType.name}
                actions={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => handleEdit(vehicleType)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => setDeleteModal({ show: true, id: vehicleType._id })}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Weight:</strong> {vehicleType.weight} KG
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Volume:</strong> {vehicleType.volume} CFT
                  </p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      {loading && (
        <LoadingSpinner centered text="Loading more vehicle types..." />
      )}
      
      {!hasMore && vehicleTypes.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '14px',
          color: '#999'
        }}>
          No more vehicle types to load
        </div>
      )}
      
      {vehicleTypes.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '16px',
          color: '#999'
        }}>
          No vehicle types found
        </div>
      )}

      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        title="Confirm Delete"
        size="small"
        footer={
          <>
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ show: false, id: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this vehicle type? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
