import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

import { auth } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const Navbar = ({ user, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      logEvent('USER_LOGOUT_SUCCESS', { email: user.email });
      navigate('/');
    } catch (error) {
      logEvent('USER_LOGOUT_ERROR', { error: error.message });
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      logEvent('NAVBAR_SEARCH', { query: searchQuery });
      navigate(`/nearby-bunks?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-dark bg-primary'}`}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-lightning-charge me-2"></i>
          EV ChargeHub
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
            
            {user ? (
              <>
                {userRole === 'admin' ? (
                  <>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i className="bi bi-gear me-1"></i>
                        Admin
                      </a>
                      <ul className={`dropdown-menu ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                        <li>
                          <Link className="dropdown-item" to="/admin">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/bunks">
                            <i className="bi bi-ev-station me-2"></i>
                            Manage Bunks
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/slots">
                            <i className="bi bi-calendar me-2"></i>
                            Manage Slots
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/approvals">
                            <i className="bi bi-clipboard-check me-2"></i>
                            Approvals
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/nearby-bunks">Find Stations</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register-bunk">
                        <i className="bi bi-plus-circle me-1"></i>
                        Register Station
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/nearby-bunks">Find Stations</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register-bunk">
                    <i className="bi bi-plus-circle me-1"></i>
                    Register Station
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          {/* Search Box - Moved to right side and made more compact */}
          <form className="d-flex me-3 my-2 my-lg-0" onSubmit={handleSearch}>
            <div className="input-group" style={{ minWidth: '200px', maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
              <button className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-light'}`} type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
          
          <ul className="navbar-nav">
            {/* Theme Toggler */}
            <li className="nav-item me-2 d-flex align-items-center">
              <ThemeToggle />
            </li>
            
            {user ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle d-flex align-items-center" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-md-inline">
                    {user.email.split('@')[0]}
                  </span>
                </a>
                <ul className={`dropdown-menu dropdown-menu-end ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;