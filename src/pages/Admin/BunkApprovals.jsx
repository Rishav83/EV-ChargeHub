import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const BunkApprovals = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bunk_registrations'));
      const registrationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter to show only pending registrations
      const pendingRegistrations = registrationsData.filter(reg => reg.status === 'pending');
      setRegistrations(pendingRegistrations);
      
      logEvent('BUNK_APPROVALS_VIEW', { count: pendingRegistrations.length });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      logEvent('BUNK_APPROVALS_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registration) => {
    try {
      // Update registration status to approved
      await updateDoc(doc(db, 'bunk_registrations', registration.id), {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: 'admin' // In real app, use actual admin user ID
      });

      // Create the actual bunk in the main collection
      await addDoc(collection(db, 'bunks'), {
        name: registration.name,
        address: registration.address,
        city: registration.city,
        state: registration.state,
        zipCode: registration.zipCode,
        phone: registration.phone,
        coordinates: registration.coordinates || null,
        totalSlots: parseInt(registration.totalSlots) || 1,
        amenities: registration.amenities || [],
        operatingHours: registration.operatingHours || '24/7',
        pricing: registration.pricing || '',
        owner: {
          name: registration.ownerName,
          email: registration.ownerEmail,
          phone: registration.ownerPhone
        },
        slots: Array(parseInt(registration.totalSlots) || 1).fill().map((_, index) => ({
          number: index + 1,
          status: 'available',
          type: registration.slotTypes === 'both' 
            ? (index % 2 === 0 ? 'standard' : 'fast')
            : (registration.slotTypes || 'standard')
        })),
        createdAt: new Date(),
        isActive: true
      });

      logEvent('BUNK_APPROVED', { 
        bunkName: registration.name,
        registrationId: registration.id 
      });
      
      // Refresh the list
      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      logEvent('BUNK_APPROVAL_ERROR', { error: error.message });
    }
  };

  const rejectRegistration = async (registration) => {
    try {
      await updateDoc(doc(db, 'bunk_registrations', registration.id), {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: 'admin', // In real app, use actual admin user ID
        rejectionReason: 'Manual rejection by admin' // Could be customized
      });

      logEvent('BUNK_REJECTED', { 
        registrationId: registration.id,
        bunkName: registration.name 
      });
      
      // Refresh the list
      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      logEvent('BUNK_REJECTION_ERROR', { error: error.message });
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading registration requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Charging Station Approvals</h1>
            <button className="btn btn-outline-secondary" onClick={fetchRegistrations}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <h4 className="mt-3">No Pending Registrations</h4>
                <p className="text-muted">There are no charging station registration requests to review.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                You have {registrations.length} pending registration{registrations.length !== 1 ? 's' : ''} to review.
              </div>

              <div className="row">
                {registrations.map(registration => (
                  <div key={registration.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">{registration.name}</h6>
                        <small className="text-muted">
                          Submitted: {new Date(registration.submittedAt?.toDate()).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                          <i className="bi bi-geo-alt me-1 text-muted"></i>
                          {registration.address}, {registration.city}, {registration.state} {registration.zipCode}
                        </p>
                        
                        <div className="mb-3">
                          <strong>Owner Information:</strong><br/>
                          <i className="bi bi-person me-1 text-muted"></i> {registration.ownerName}<br/>
                          <i className="bi bi-envelope me-1 text-muted"></i> {registration.ownerEmail}<br/>
                          <i className="bi bi-telephone me-1 text-muted"></i> {registration.ownerPhone}
                        </div>
                        
                        <div className="mb-3">
                          <strong>Station Details:</strong><br/>
                          <i className="bi bi-ev-station me-1 text-muted"></i> {registration.totalSlots} slots ({registration.slotTypes})<br/>
                          <i className="bi bi-clock me-1 text-muted"></i> {registration.operatingHours}<br/>
                          {registration.pricing && (
                            <><i className="bi bi-currency-dollar me-1 text-muted"></i> {registration.pricing}<br/></>
                          )}
                        </div>

                        {registration.amenities && registration.amenities.length > 0 && (
                          <div className="mb-3">
                            <strong>Amenities:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {registration.amenities.map((amenity, index) => (
                                <span key={index} className="badge bg-light text-dark border">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {registration.coordinates && (
                          <div className="mb-3">
                            <strong>Coordinates:</strong><br/>
                            Lat: {registration.coordinates.lat}, Lng: {registration.coordinates.lng}
                          </div>
                        )}
                      </div>
                      <div className="card-footer bg-white">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success flex-fill"
                            onClick={() => approveRegistration(registration)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => rejectRegistration(registration)}
                            title="Reject Registration"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BunkApprovals;