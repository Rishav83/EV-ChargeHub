import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'user' // 'user' or 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Admin registration validation
    if (formData.userType === 'admin' && !formData.email.includes('@admin.')) {
      setError('Admin accounts require email with @admin. domain');
      setLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: formData.name
      });
      
      // Determine user role based on selection and email
      const userRole = formData.userType;
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: userRole,
        userType: formData.userType,
        createdAt: new Date()
      });
      
      // Store role in localStorage for quick access
      localStorage.setItem('userRole', userRole);
      
      logEvent('USER_REGISTRATION_SUCCESS', { 
        userId: user.uid, 
        email: user.email, 
        role: userRole 
      });
      
      navigate(userRole === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setError(error.message);
      logEvent('USER_REGISTRATION_ERROR', { error: error.message, email: formData.email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow fade-in">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="feature-icon bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-person-plus-fill text-success fs-1"></i>
                </div>
                <h2 className="card-title">Create Your Account</h2>
                <p className="text-muted">Join EV ChargeHub today</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* User Type Selection */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Account Type</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="userType"
                            id="userTypeUser"
                            value="user"
                            checked={formData.userType === 'user'}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="userTypeUser">
                            <i className="bi bi-person me-1"></i>
                            User Account
                          </label>
                        </div>
                        <small className="text-muted ms-4">For EV owners</small>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="userType"
                            id="userTypeAdmin"
                            value="admin"
                            checked={formData.userType === 'admin'}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="userTypeAdmin">
                            <i className="bi bi-shield-lock me-1"></i>
                            Admin Account
                          </label>
                        </div>
                        <small className="text-muted ms-4">For station managers</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={formData.userType === 'admin' ? "admin@yourcompany.com" : "your@email.com"}
                  />
                  {formData.userType === 'admin' && (
                    <small className="text-muted">Admin accounts require email with @admin. domain</small>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </form>
              
              <hr className="my-4" />
              
              <div className="text-center">
                <p className="mb-0">
                  Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
                </p>
                <small className="text-muted">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;