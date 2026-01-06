import { useEffect, useState, useRef, useCallback } from "react";
import { transporterAPI } from "../../API/api";
import { Button, Input, FormField, Card, LoadingSpinner, Modal } from "../Common";


export default function Transporter() {


  const [name, setName] = useState('');
  const [gstn, setGstn] = useState('');
  const [address, setAddress] = useState('');
  const [emailId, setEmailId] = useState('');


  const [transporters, setTransporters] = useState([]);
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
  const lastTransporterRef = useCallback(node => {
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
      setTransporters([]);
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
        const response = await transporterAPI.search(value.trim());
        
        if (response?.data?.data) {
          setTransporters(response.data.data);
          setHasMore(false); // Disable pagination when searching
        }
      } catch (error) {
        console.error('Error searching transporters:', error);
        alert('Failed to search transporters');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // fetch transporters data with pagination
  useEffect(() => {
    const fetchTransporters = async () => {
      // Skip pagination when in search mode
      if (isSearching) return;
      
      // Prevent fetching the same page multiple times
      if (loading || !hasMore || fetchedPages.current.has(currentPage)) return;
      
      fetchedPages.current.add(currentPage);
      setLoading(true);
      
      try {
        const response = await transporterAPI.getAll({ page: currentPage, limit: 10 });
        
        if (response?.data?.data) {
          setTransporters(prev => [...prev, ...response.data.data]);
          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(currentPage < totalPages);
        }
      } catch (error) {
        console.error('Error fetching transporters:', error);
        fetchedPages.current.delete(currentPage); // Remove from set on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    fetchTransporters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isSearching]);

  // Reset form fields
  const resetForm = () => {
    setName('');
    setGstn('');
    setAddress('');
    setEmailId('');
    setEditingId(null);
    setShowForm(false);
  };

  // Handle create new transporter
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await transporterAPI.create({
        name,
        gstn,
        address,
        emailId
      });
      
      if (response?.data) {
        setTransporters(prev => [response.data, ...prev]);
        resetForm();
        alert('Transporter created successfully!');
      }
    } catch (error) {
      console.error('Error creating transporter:', error);
      alert('Failed to create transporter');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update transporter
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await transporterAPI.update(editingId, {
        name,
        gstn,
        address,
        emailId
      });
      
      if (response?.data) {
        setTransporters(prev => 
          prev.map(t => t._id === editingId ? response.data : t)
        );
        resetForm();
        alert('Transporter updated successfully!');
      }
    } catch (error) {
      console.error('Error updating transporter:', error);
      alert('Failed to update transporter');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete transporter
  const handleDelete = async () => {
    try {
      await transporterAPI.delete(deleteModal.id);
      setTransporters(prev => prev.filter(t => t._id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
      alert('Transporter deleted successfully!');
    } catch (error) {
      console.error('Error deleting transporter:', error);
      alert('Failed to delete transporter');
    }
  };

  // Handle edit button click
  const handleEdit = (transporter) => {
    setName(transporter.name);
    setGstn(transporter.gstn);
    setAddress(transporter.address);
    setEmailId(transporter.emailId);
    setEditingId(transporter._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Transporters</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Transporter'}
        </Button>
      </div>

      {/* Search Box */}
      <div style={{ marginBottom: '20px' }}>
        <Input
          type="text"
          placeholder="Search by name or GSTN..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchQuery && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            {isSearching && loading ? 'Searching...' : 
             isSearching ? `Found ${transporters.length} result(s)` : null}
          </div>
        )}
      </div>
     
      {showForm && (
        <Card title={editingId ? 'Edit Transporter' : 'Add New Transporter'} style={{ marginBottom: '20px' }}>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter transporter name"
                  required
                />
              </FormField>
              
              <FormField label="GSTN" required>
                <Input
                  type="text"
                  value={gstn}
                  onChange={(e) => setGstn(e.target.value)}
                  placeholder="Enter GSTN"
                  required
                />
              </FormField>
              
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </FormField>
              
              <FormField label="Address" required>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
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
        {transporters.map((transporter, index) => {
          const isLastElement = transporters.length === index + 1;
          
          return (
            <div ref={isLastElement ? lastTransporterRef : null} key={transporter._id}>
              <Card
                title={transporter.name}
                actions={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => handleEdit(transporter)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => setDeleteModal({ show: true, id: transporter._id })}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  <p style={{ margin: '6px 0' }}>
                    <strong>GSTN:</strong> {transporter.gstn}
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Address:</strong> {transporter.address}
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Email:</strong> {transporter.emailId}
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>Transporter ID:</strong> {transporter.transporterID}
                  </p>
                  <p style={{ margin: '6px 0', fontSize: '12px', color: '#999' }}>
                    Created: {new Date(transporter.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      {loading && (
        <LoadingSpinner centered text="Loading more transporters..." />
      )}
      
      {!hasMore && transporters.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '14px',
          color: '#999'
        }}>
          No more transporters to load
        </div>
      )}
      
      {transporters.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '16px',
          color: '#999'
        }}>
          No transporters found
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
        <p>Are you sure you want to delete this transporter? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
