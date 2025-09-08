import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate admin email
    if (!email.includes('@admin.')) {
      setError('Admin access requires email with @admin. domain');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      localStorage.setItem('userRole', 'admin');
      logEvent('ADMIN_LOGIN_SUCCESS', { email: user.email });
      
      navigate('/admin');
    } catch (error) {
      setError(error.message);
      logEvent('ADMIN_LOGIN_ERROR', { error: error.message, email: email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow fade-in">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="feature-icon bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-shield-lock text-warning fs-1"></i>
                </div>
                <h2 className="card-title">Admin Portal</h2>
                <p className="text-muted">Sign in to manage charging stations</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Admin Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@yourcompany.com"
                  />
                  <small className="text-muted">Must contain @admin. domain</small>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-warning w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-lock me-2"></i>
                      Admin Sign In
                    </>
                  )}
                </button>
              </form>
              
              <hr className="my-4" />
              
              <div className="text-center">
                <p className="mb-2">
                  <Link to="/login" className="text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to User Login
                  </Link>
                </p>
                <small className="text-muted">
                  Admin access requires special permissions. Contact system administrator for credentials.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;