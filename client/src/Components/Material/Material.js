import { useEffect, useState, useRef, useCallback } from "react";
import { materialAPI } from "../../API/api";
import { Button, Input, FormField, Card, LoadingSpinner, Modal } from "../Common";

export default function Material() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');

  const [materials, setMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  
  const observer = useRef();
  const fetchedPages = useRef(new Set());
  const lastMaterialRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // fetch materials data with pagination
  useEffect(() => {
    const fetchMaterials = async () => {
      // Prevent fetching the same page multiple times
      if (loading || !hasMore || fetchedPages.current.has(currentPage)) return;
      
      fetchedPages.current.add(currentPage);
      setLoading(true);
      
      try {
        const response = await materialAPI.getAll({ page: currentPage, limit: 10 });
        
        if (response?.data?.data) {
          setMaterials(prev => [...prev, ...response.data.data]);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(currentPage < totalPages);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        fetchedPages.current.delete(currentPage); // Remove from set on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Reset form fields
  const resetForm = () => {
    setName('');
    setDescription('');
    setWeight('');
    setVolume('');
    setEditingId(null);
    setShowForm(false);
  };

  // Handle create new material
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await materialAPI.create({
        name,
        description,
        weight: parseFloat(weight),
        volume: parseFloat(volume)
      });
      
      if (response?.data) {
        setMaterials(prev => [response.data, ...prev]);
        resetForm();
        alert('Material created successfully!');
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Failed to create material');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update material
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await materialAPI.update(editingId, {
        name,
        description,
        weight: parseFloat(weight),
        volume: parseFloat(volume)
      });
      
      if (response?.data) {
        setMaterials(prev => 
          prev.map(m => m._id === editingId ? response.data : m)
        );
        resetForm();
        alert('Material updated successfully!');
      }
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Failed to update material');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete material
  const handleDelete = async () => {
    try {
      await materialAPI.delete(deleteModal.id);
      setMaterials(prev => prev.filter(m => m._id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
      alert('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    }
  };

  // Handle edit button click
  const handleEdit = (material) => {
    setName(material.name);
    setDescription(material.description || '');
    setWeight(material.weight.toString());
    setVolume(material.volume.toString());
    setEditingId(material._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Materials</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Material'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card 
          title={editingId ? 'Edit Material' : 'Add New Material'}
          style={{ marginBottom: '20px' }}
        >
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter material name"
                  required
                />
              </FormField>
              
              <FormField label="Description">
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </FormField>
              
              <FormField label="Weight (KG)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  required
                />
              </FormField>
              
              <FormField label="Volume (CFT)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Enter volume"
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
        {materials.map((material, index) => {
          const isLastElement = materials.length === index + 1;
          
          return (
            <div ref={isLastElement ? lastMaterialRef : null} key={material._id}>
              <Card
                title={material.name}
                actions={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => handleEdit(material)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => setDeleteModal({ show: true, id: material._id })}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  {material.description && (
                    <p style={{ margin: '6px 0' }}>
                      <strong>Description:</strong> {material.description}
                    </p>
                  )}
                  <p style={{ margin: '6px 0' }}>
                    <strong>Weight:</strong> {material.weight} KG
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Volume:</strong> {material.volume} CFT
                  </p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      {loading && (
        <LoadingSpinner centered text="Loading more materials..." />
      )}
      
      {!hasMore && materials.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '14px',
          color: '#999'
        }}>
          No more materials to load
        </div>
      )}
      
      {materials.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '16px',
          color: '#999'
        }}>
          No materials found
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
        <p>Are you sure you want to delete this material? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
