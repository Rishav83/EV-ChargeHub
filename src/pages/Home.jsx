import React from 'react';
import { Link } from 'react-router-dom';
import { logEvent } from '../utils/logger';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { isDarkMode } = useTheme();
  logEvent('PAGE_VIEW', { page: 'Home' });

  return (
    <div>
      {/* Hero Section */}
      <section className={`hero-section py-5 ${isDarkMode ? 'bg-dark' : 'gradient-bg'} text-white`}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 fade-in">
              <h1 className="display-4 fw-bold mb-4">Power Your EV Journey Across India</h1>
              <p className="lead mb-4">
                Find, book, and manage EV charging stations across India. 
                Make your electric vehicle experience seamless and convenient.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/nearby-bunks" className="btn btn-light btn-lg btn-hover-effect">
                  Find Stations Near You
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg btn-hover-effect">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center fade-in">
              <img 
                src="https://images.unsplash.com/photo-1707341597123-c53bbb7e7f93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="EV Charging" 
                className="img-fluid rounded shadow-custom" 
                style={{maxHeight: '400px'}}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose EV ChargeHub?</h2>
            <p className="lead text-muted">We make EV charging simple and accessible</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4 fade-in">
              <div className="card feature-card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className={`feature-icon ${isDarkMode ? 'bg-primary bg-opacity-25' : 'bg-primary bg-opacity-10'} rounded-circle mb-3`}>
                    <i className="bi bi-geo-alt-fill fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title">Find Stations Easily</h5>
                  <p className="card-text">
                    Locate charging stations near you with our interactive map and detailed station information.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 fade-in">
              <div className="card feature-card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className={`feature-icon ${isDarkMode ? 'bg-success bg-opacity-25' : 'bg-success bg-opacity-10'} rounded-circle mb-3`}>
                    <i className="bi bi-calendar-check-fill fs-1 text-success"></i>
                  </div>
                  <h5 className="card-title">Book in Advance</h5>
                  <p className="card-text">
                    Reserve your charging slot ahead of time to avoid waiting and plan your journey efficiently.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 fade-in">
              <div className="card feature-card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className={`feature-icon ${isDarkMode ? 'bg-info bg-opacity-25' : 'bg-info bg-opacity-10'} rounded-circle mb-3`}>
                    <i className="bi bi-lightning-charge-fill fs-1 text-info"></i>
                  </div>
                  <h5 className="card-title">Real-time Status</h5>
                  <p className="card-text">
                    Get live updates on charging station availability and status to optimize your charging experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-5 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="container text-center py-5">
          <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
          <p className="lead text-muted mb-4">Join thousands of EV owners who are simplifying their charging experience</p>
          <Link to="/register" className="btn btn-primary btn-lg px-4 btn-hover-effect">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;