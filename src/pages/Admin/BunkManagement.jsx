import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const BunkManagement = () => {
  const [bunks, setBunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBunk, setEditingBunk] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    totalSlots: 0,
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchBunks();
  }, []);

  const fetchBunks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bunks'));
      const bunksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBunks(bunksData);
      logEvent('BUNKS_FETCHED', { count: bunksData.length });
    } catch (error) {
      console.error('Error fetching bunks:', error);
      logEvent('BUNKS_FETCH_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBunk) {
        // Update existing bunk
        const bunkRef = doc(db, 'bunks', editingBunk.id);
        await updateDoc(bunkRef, formData);
        logEvent('BUNK_UPDATED', { bunkId: editingBunk.id, ...formData });
        setEditingBunk(null);
      } else {
        // Add new bunk
        await addDoc(collection(db, 'bunks'), {
          ...formData,
          createdAt: new Date(),
          slots: Array(parseInt(formData.totalSlots)).fill().map((_, index) => ({
            number: index + 1,
            status: 'available',
            type: 'standard'
          }))
        });
        logEvent('BUNK_CREATED', formData);
      }

      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        totalSlots: 0,
        latitude: '',
        longitude: ''
      });
      setShowForm(false);
      fetchBunks();
    } catch (error) {
      console.error('Error saving bunk:', error);
      logEvent('BUNK_SAVE_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bunk) => {
    setEditingBunk(bunk);
    setFormData({
      name: bunk.name,
      address: bunk.address,
      city: bunk.city,
      state: bunk.state,
      zipCode: bunk.zipCode,
      phone: bunk.phone,
      totalSlots: bunk.totalSlots,
      latitude: bunk.latitude,
      longitude: bunk.longitude
    });
    setShowForm(true);
  };

  const handleDelete = async (bunkId) => {
    if (window.confirm('Are you sure you want to delete this charging station?')) {
      try {
        await deleteDoc(doc(db, 'bunks', bunkId));
        logEvent('BUNK_DELETED', { bunkId });
        fetchBunks();
      } catch (error) {
        console.error('Error deleting bunk:', error);
        logEvent('BUNK_DELETE_ERROR', { error: error.message });
      }
    }
  };

  if (loading && bunks.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading charging stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Manage Charging Stations</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add New Station'}
            </button>
          </div>

          {showForm && (
            <div className="card mb-4 fade-in">
              <div className="card-header">
                <h5 className="mb-0">{editingBunk ? 'Edit' : 'Add New'} Charging Station</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Station Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Total Slots</label>
                      <input
                        type="number"
                        className="form-control"
                        name="totalSlots"
                        value={formData.totalSlots}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {editingBunk ? 'Update' : 'Create'} Station
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        setEditingBunk(null);
                        setFormData({
                          name: '',
                          address: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          phone: '',
                          totalSlots: 0,
                          latitude: '',
                          longitude: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">All Charging Stations</h5>
            </div>
            <div className="card-body">
              {bunks.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Slots</th>
                        <th>Available</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bunks.map(bunk => (
                        <tr key={bunk.id}>
                          <td>{bunk.name}</td>
                          <td>{bunk.address}, {bunk.city}, {bunk.state} {bunk.zipCode}</td>
                          <td>{bunk.slots?.length || 0}</td>
                          <td>
                            {bunk.slots?.filter(slot => slot.status === 'available').length || 0}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(bunk)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(bunk.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-ev-station fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No charging stations found</p>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={() => setShowForm(true)}
                  >
                    Add First Station
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunkManagement;