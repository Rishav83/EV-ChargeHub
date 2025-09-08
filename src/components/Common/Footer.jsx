import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>EV ChargeHub</h5>
            <p>Find and book EV charging stations with ease.</p>
          </div>
          <div className="col-md-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/nearby-bunks" className="text-light">Find Stations</a></li>
              <li><a href="/login" className="text-light">Login</a></li>
              <li><a href="/register" className="text-light">Register</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li><i className="bi bi-envelope me-2"></i> support@evchargehub.com</li>
              <li><i className="bi bi-telephone me-2"></i> +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} EV ChargeHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;