import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Determine user role
      const isAdmin = email.includes('@admin.');
      const userRole = isAdmin ? 'admin' : 'user';
      
      localStorage.setItem('userRole', userRole);
      logEvent('USER_LOGIN_SUCCESS', { email: user.email, role: userRole });
      
      navigate(userRole === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setError(error.message);
      logEvent('USER_LOGIN_ERROR', { error: error.message, email: email });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    if (!resetEmail) {
      setError('Please enter your email address');
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      logEvent('PASSWORD_RESET_EMAIL_SENT', { email: resetEmail });
    } catch (error) {
      setError(error.message);
      logEvent('PASSWORD_RESET_ERROR', { error: error.message, email: resetEmail });
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow fade-in">
            <div className="card-body p-5">
              {!showForgotPassword ? (
                <>
                  <div className="text-center mb-4">
                    <div className="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="bi bi-lightning-charge-fill text-primary fs-1"></i>
                    </div>
                    <h2 className="card-title">Welcome to EV ChargeHub</h2>
                    <p className="text-muted">Sign in to your account</p>
                  </div>
                  
                  {/* Login Type Toggle */}
                  <div className="card mb-4">
                    <div className="card-body py-3">
                      <div className="d-flex justify-content-center">
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className={`btn ${!isAdminLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setIsAdminLogin(false)}
                          >
                            <i className="bi bi-person me-2"></i>
                            User Login
                          </button>
                          <button
                            type="button"
                            className={`btn ${isAdminLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setIsAdminLogin(true)}
                          >
                            <i className="bi bi-shield-lock me-2"></i>
                            Admin Login
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={isAdminLogin ? "admin@yourcompany.com" : "your@email.com"}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="password" className="form-label">Password</label>
                        <button 
                          type="button" 
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
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
                      className="btn btn-primary w-100 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                  
                  <hr className="my-4" />
                  
                  <div className="text-center">
                    <p className="mb-2">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none">
                        Register here
                      </Link>
                    </p>
                    {isAdminLogin ? (
                      <small className="text-muted">
                        Admin access requires special permissions. Contact system administrator.
                      </small>
                    ) : (
                      <small className="text-muted">
                        New to EV ChargeHub? Create a user account to get started.
                      </small>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="bi bi-key-fill text-primary fs-1"></i>
                    </div>
                    <h2 className="card-title">Reset Password</h2>
                    <p className="text-muted">
                      {resetSent 
                        ? "Check your email for reset instructions" 
                        : "Enter your email to reset your password"}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                  
                  {resetSent ? (
                    <div className="alert alert-success" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      Password reset email sent! Check your inbox and follow the instructions.
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword}>
                      <div className="mb-4">
                        <label htmlFor="resetEmail" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="resetEmail"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                        />
                        <div className="form-text">
                          Enter the email address associated with your account.
                        </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 mb-3"
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope me-2"></i>
                            Send Reset Instructions
                          </>
                        )}
                      </button>
                    </form>
                  )}
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100"
                    onClick={handleBackToLogin}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </button>
                  
                  {resetSent && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Didn't receive the email?
                      </h6>
                      <ul className="small mb-0 ps-3">
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email address</li>
                        <li>Wait a few minutes and try again</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;