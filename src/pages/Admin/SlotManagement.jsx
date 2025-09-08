import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

import { db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const SlotManagement = () => {
  const [bunks, setBunks] = useState([]);
  const [selectedBunk, setSelectedBunk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBunks();
  }, []);

  const fetchBunks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bunks'));
      const bunksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBunks(bunksData);
      logEvent('SLOT_MANAGEMENT_ACCESS', { count: bunksData.length });
    } catch (error) {
      console.error('Error fetching bunks:', error);
      logEvent('SLOT_MANAGEMENT_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotStatusChange = async (bunkId, slotIndex, newStatus) => {
    try {
      const bunk = bunks.find(b => b.id === bunkId);
      const updatedSlots = [...bunk.slots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        status: newStatus
      };

      const bunkRef = doc(db, 'bunks', bunkId);
      await updateDoc(bunkRef, {
        slots: updatedSlots
      });

      // Update local state
      setBunks(prev => prev.map(b => 
        b.id === bunkId ? { ...b, slots: updatedSlots } : b
      ));

      if (selectedBunk && selectedBunk.id === bunkId) {
        setSelectedBunk({ ...selectedBunk, slots: updatedSlots });
      }

      logEvent('SLOT_STATUS_CHANGED', { 
        bunkId, 
        slotNumber: slotIndex + 1, 
        newStatus 
      });
    } catch (error) {
      console.error('Error updating slot status:', error);
      logEvent('SLOT_UPDATE_ERROR', { error: error.message });
    }
  };

  const handleBunkSelect = (bunkId) => {
    const bunk = bunks.find(b => b.id === bunkId);
    setSelectedBunk(bunk);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading slot management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Manage Charging Slots</h1>

          {/* Bunk Selection */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Select Charging Station</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <select 
                    className="form-select"
                    value={selectedBunk?.id || ''}
                    onChange={(e) => handleBunkSelect(e.target.value)}
                  >
                    <option value="">Choose a station...</option>
                    {bunks.map(bunk => (
                      <option key={bunk.id} value={bunk.id}>
                        {bunk.name} - {bunk.address}, {bunk.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Management */}
          {selectedBunk && (
            <div className="card fade-in">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Slots for {selectedBunk.name}</h5>
                <span className="badge bg-primary">
                  {selectedBunk.slots?.filter(slot => slot.status === 'available').length || 0} / {selectedBunk.slots?.length || 0} Available
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  {selectedBunk.slots?.map((slot, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <div className={`card ${slot.status === 'available' ? 'border-success' : 'border-warning'}`}>
                        <div className="card-body text-center">
                          <h6 className="card-title">Slot #{slot.number}</h6>
                          <p className="card-text">
                            <span className={`badge ${slot.status === 'available' ? 'bg-success' : 'bg-warning'}`}>
                              {slot.status}
                            </span>
                          </p>
                          <p className="card-text small text-muted">Type: {slot.type || 'standard'}</p>
                          
                          <div className="btn-group w-100">
                            <button
                              className={`btn btn-sm ${slot.status === 'available' ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleSlotStatusChange(selectedBunk.id, index, 'available')}
                            >
                              Available
                            </button>
                            <button
                              className={`btn btn-sm ${slot.status === 'occupied' ? 'btn-warning' : 'btn-outline-warning'}`}
                              onClick={() => handleSlotStatusChange(selectedBunk.id, index, 'occupied')}
                            >
                              Occupied
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedBunk.slots || selectedBunk.slots.length === 0) && (
                  <div className="text-center py-4">
                    <i className="bi bi-ev-station fs-1 text-muted"></i>
                    <p className="text-muted mt-2">No slots configured for this station</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedBunk && (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-ev-station fs-1 text-muted"></i>
                <p className="text-muted mt-2">Please select a charging station to manage its slots</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotManagement;