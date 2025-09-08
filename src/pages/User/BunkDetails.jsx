import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

import { auth, db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const BunkDetails = ({ user }) => {
  const { id } = useParams();
  const [bunk, setBunk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchBunkDetails = async () => {
      try {
        logEvent('BUNK_DETAILS_VIEW', { bunkId: id });
        
        // In a real app, you would fetch from Firestore
        // For demo purposes, we'll use mock data
        const mockBunk = {
          id: id,
          name: "Downtown Charging Station",
          address: "123 Main St, City Center",
          city: "Metropolis",
          state: "CA",
          zipCode: "12345",
          phone: "(555) 123-4567",
          totalSlots: 10,
          latitude: "34.0522",
          longitude: "-118.2437",
          slots: Array(10).fill().map((_, index) => ({
            number: index + 1,
            status: Math.random() > 0.5 ? 'available' : 'occupied',
            type: index < 3 ? 'fast' : 'standard'
          }))
        };
        
        setBunk(mockBunk);
      } catch (error) {
        console.error('Error fetching bunk details:', error);
        logEvent('BUNK_DETAILS_ERROR', { error: error.message, bunkId: id });
      } finally {
        setLoading(false);
      }
    };

    fetchBunkDetails();
  }, [id]);

  const handleBookSlot = async () => {
    if (!user) {
      alert('Please login to book a slot');
      return;
    }

    if (!selectedSlot || !bookingTime) {
      alert('Please select a slot and booking time');
      return;
    }

    try {
      // Create booking in Firestore
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userEmail: user.email,
        bunkId: bunk.id,
        bunkName: bunk.name,
        slotNumber: selectedSlot.number,
        bookingTime: new Date(bookingTime),
        status: 'active',
        createdAt: new Date()
      });

      // Update slot status to occupied
      const updatedSlots = bunk.slots.map(slot =>
        slot.number === selectedSlot.number ? { ...slot, status: 'occupied' } : slot
      );

      setBunk({ ...bunk, slots: updatedSlots });
      setBookingSuccess(true);
      logEvent('SLOT_BOOKED', { 
        bunkId: bunk.id, 
        slotNumber: selectedSlot.number,
        bookingTime: bookingTime 
      });
    } catch (error) {
      console.error('Error booking slot:', error);
      logEvent('BOOKING_ERROR', { error: error.message });
      alert('Error booking slot. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading station details...</p>
        </div>
      </div>
    );
  }

  if (!bunk) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-ev-station fs-1 text-muted"></i>
          <h3 className="mt-3">Station Not Found</h3>
          <p className="text-muted">The charging station you're looking for doesn't exist.</p>
          <Link to="/nearby-bunks" className="btn btn-primary">
            Find Other Stations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/nearby-bunks">Stations</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{bunk.name}</li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-body">
                  <h2 className="card-title">{bunk.name}</h2>
                  <p className="text-muted">
                    <i className="bi bi-geo-alt me-2"></i>
                    {bunk.address}, {bunk.city}, {bunk.state} {bunk.zipCode}
                  </p>
                  <p className="text-muted">
                    <i className="bi bi-telephone me-2"></i>
                    {bunk.phone}
                  </p>

                  <div className="map-container bg-light mb-4 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="bi bi-map fs-1 text-muted"></i>
                      <p className="mt-2">Map would appear here</p>
                      <small className="text-muted">Lat: {bunk.latitude}, Long: {bunk.longitude}</small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-star me-2"></i>
                      Add to Favorites
                    </button>
                    <button className="btn btn-outline-secondary">
                      <i className="bi bi-share me-2"></i>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Available Slots</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {bunk.slots.map(slot => (
                      <div key={slot.number} className="col-6 mb-3">
                        <div 
                          className={`card text-center cursor-pointer ${selectedSlot?.number === slot.number ? 'border-primary' : ''} ${slot.status === 'available' ? 'border-success' : 'border-warning'}`}
                          onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                          style={{ cursor: slot.status === 'available' ? 'pointer' : 'not-allowed', opacity: slot.status === 'available' ? 1 : 0.6 }}
                        >
                          <div className="card-body py-3">
                            <h6 className="card-title mb-1">Slot #{slot.number}</h6>
                            <span className={`badge ${slot.status === 'available' ? 'bg-success' : 'bg-warning'}`}>
                              {slot.status}
                            </span>
                            <small className="d-block text-muted mt-1">{slot.type}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSlot && selectedSlot.status === 'available' && (
                <div className="card fade-in">
                  <div className="card-header">
                    <h5 className="mb-0">Book Slot #{selectedSlot.number}</h5>
                  </div>
                  <div className="card-body">
                    {bookingSuccess ? (
                      <div className="text-center py-3">
                        <i className="bi bi-check-circle-fill text-success fs-1"></i>
                        <h5 className="mt-3">Booking Confirmed!</h5>
                        <p className="text-muted">Your slot has been successfully booked.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedSlot(null);
                            setBookingSuccess(false);
                          }}
                        >
                          Book Another Slot
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Booking Time</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                        <button 
                          className="btn btn-primary w-100"
                          onClick={handleBookSlot}
                          disabled={!bookingTime}
                        >
                          Confirm Booking
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunkDetails;