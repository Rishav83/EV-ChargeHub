import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const BunkRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    totalSlots: '',
    slotTypes: 'standard', // standard or fast
    amenities: [],
    latitude: '',
    longitude: '',
    operatingHours: '24/7',
    pricing: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const amenitiesOptions = [
    'Restrooms', 'Cafe', 'Wi-Fi', 'Covered Parking', 'Convenience Store',
    'Lounge', 'Food Court', 'Play Area', '24/7 Access', 'Payment Terminal'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle amenities checkboxes
      if (name === 'amenities') {
        setFormData(prev => ({
          ...prev,
          amenities: checked 
            ? [...prev.amenities, value]
            : prev.amenities.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add the new charging station to Firestore
      const docRef = await addDoc(collection(db, 'bunk_registrations'), {
        ...formData,
        totalSlots: parseInt(formData.totalSlots),
        status: 'pending', // pending, approved, rejected
        submittedBy: user ? user.uid : 'anonymous',
        submittedEmail: user ? user.email : formData.ownerEmail,
        submittedAt: new Date(),
        coordinates: formData.latitude && formData.longitude 
          ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
          : null
      });

      logEvent('BUNK_REGISTRATION_SUBMITTED', { 
        bunkName: formData.name,
        registrationId: docRef.id 
      });

      setSuccess('Your charging station registration has been submitted successfully! It will be reviewed by our team.');
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        totalSlots: '',
        slotTypes: 'standard',
        amenities: [],
        latitude: '',
        longitude: '',
        operatingHours: '24/7',
        pricing: ''
      });
      
      // Redirect after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setError(error.message);
      logEvent('BUNK_REGISTRATION_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="fade-in">
      <h4 className="mb-4">Step 1: Station Information</h4>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Station Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
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
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Address *</label>
        <input
          type="text"
          className="form-control"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">City *</label>
          <input
            type="text"
            className="form-control"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <label className="form-label">State *</label>
          <input
            type="text"
            className="form-control"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">ZIP Code *</label>
          <input
            type="text"
            className="form-control"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            className="form-control"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g., 34.0522"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Longitude (optional)</label>
          <input
            type="number"
            step="any"
            className="form-control"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g., -118.2437"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Owner Information
  const renderStep2 = () => (
    <div className="fade-in">
      <h4 className="mb-4">Step 2: Owner Information</h4>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Owner Name *</label>
          <input
            type="text"
            className="form-control"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Owner Phone *</label>
          <input
            type="tel"
            className="form-control"
            name="ownerPhone"
            value={formData.ownerPhone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Owner Email *</label>
        <input
          type="email"
          className="form-control"
          name="ownerEmail"
          value={formData.ownerEmail}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  // Step 3: Station Details
  const renderStep3 = () => (
    <div className="fade-in">
      <h4 className="mb-4">Step 3: Station Details</h4>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Total Charging Slots *</label>
          <input
            type="number"
            className="form-control"
            name="totalSlots"
            value={formData.totalSlots}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Charger Type *</label>
          <select
            className="form-select"
            name="slotTypes"
            value={formData.slotTypes}
            onChange={handleChange}
            required
          >
            <option value="standard">Standard Charging</option>
            <option value="fast">Fast Charging</option>
            <option value="both">Both Standard and Fast</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Operating Hours *</label>
        <select
          className="form-select"
          name="operatingHours"
          value={formData.operatingHours}
          onChange={handleChange}
          required
        >
          <option value="24/7">24/7</option>
          <option value="6am-10pm">6:00 AM - 10:00 PM</option>
          <option value="7am-11pm">7:00 AM - 11:00 PM</option>
          <option value="other">Other (please specify in comments)</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Pricing (optional)</label>
        <input
          type="text"
          className="form-control"
          name="pricing"
          value={formData.pricing}
          onChange={handleChange}
          placeholder="e.g., $0.15 per kWh or $5 per hour"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Amenities</label>
        <div className="row">
          {amenitiesOptions.map((amenity, index) => (
            <div key={index} className="col-md-6 mb-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleChange}
                  id={`amenity-${index}`}
                />
                <label className="form-check-label" htmlFor={`amenity-${index}`}>
                  {amenity}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-5">
                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                  <i className="bi bi-plus-circle-fill text-primary fs-1"></i>
                </div>
                <h1 className="card-title">Register New Charging Station</h1>
                <p className="text-muted">Add your EV charging hub to our network</p>
                
                {/* Progress Steps */}
                <div className="d-flex justify-content-center mb-4">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="d-flex align-items-center">
                      <div className={`rounded-circle ${currentStep >= step ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                        {step}
                      </div>
                      {step < 3 && <div className={`mx-2 ${currentStep > step ? 'bg-primary' : 'bg-secondary'}`} style={{width: '40px', height: '2px'}}></div>}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                <div className="d-flex justify-content-between mt-4">
                  {currentStep > 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      <i className="bi bi-arrow-left me-2"></i>
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 3 ? (
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Submit Registration
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              <hr className="my-4" />
              
              <div className="text-center">
                <small className="text-muted">
                  * Required fields. Your submission will be reviewed by our team before being added to the platform.
                  This process typically takes 1-2 business days.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunkRegistration;