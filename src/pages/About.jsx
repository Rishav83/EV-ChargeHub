import React from 'react';
import { logEvent } from '../utils/logger';

const About = () => {
  logEvent('PAGE_VIEW', { page: 'About' });

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="card-title text-center mb-4">About EV ChargeHub</h1>
              
              <div className="text-center mb-5">
                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                  <i className="bi bi-lightning-charge-fill text-primary fs-1"></i>
                </div>
                <p className="lead">Powering the future of transportation, one charge at a time.</p>
              </div>

              <div className="row mb-5">
                <div className="col-md-6 mb-4">
                  <div className="text-center">
                    <i className="bi bi-bullseye fs-1 text-primary mb-3"></i>
                    <h4>Our Mission</h4>
                    <p className="text-muted">
                      To make electric vehicle charging accessible, convenient, and reliable for everyone, 
                      accelerating the transition to sustainable transportation.
                    </p>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="text-center">
                    <i className="bi bi-eye fs-1 text-success mb-3"></i>
                    <h4>Our Vision</h4>
                    <p className="text-muted">
                      A world where finding and using EV charging stations is as easy and commonplace 
                      as finding gas stations, making electric vehicles the obvious choice for all drivers.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="mb-4">What We Offer</h3>
              
              <div className="row mb-5">
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-geo-alt-fill text-primary me-3 fs-4"></i>
                    <div>
                      <h5>Station Discovery</h5>
                      <p className="text-muted">Find charging stations near you with real-time availability.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-calendar-check-fill text-success me-3 fs-4"></i>
                    <div>
                      <h5>Slot Booking</h5>
                      <p className="text-muted">Reserve your charging slot in advance to avoid waiting.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-lightning-charge-fill text-warning me-3 fs-4"></i>
                    <div>
                      <h5>Real-time Status</h5>
                      <p className="text-muted">Get live updates on station availability and charging progress.</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="mb-4">Our Story</h3>
              <p className="text-muted mb-4">
                Founded in 2023, EV ChargeHub emerged from a simple observation: while electric vehicles 
                were becoming increasingly popular, the infrastructure to support them wasn't keeping pace. 
                Drivers struggled to find available charging stations, often facing long wait times or 
                completely occupied facilities.
              </p>
              <p className="text-muted mb-4">
                Our team of EV enthusiasts and technology experts came together to create a solution that 
                would make EV charging seamless and stress-free. Today, we're proud to connect thousands of 
                EV drivers with charging stations across the country, supporting the growth of sustainable 
                transportation.
              </p>

              <div className="text-center mt-5">
                <h4 className="mb-3">Join Our Mission</h4>
                <p className="text-muted mb-4">
                  Whether you're an EV driver, charging station owner, or just passionate about sustainable 
                  transportation, we invite you to be part of our journey.
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/register" className="btn btn-primary">Create Account</a>
                  <a href="/nearby-bunks" className="btn btn-outline-primary">Find Stations</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;