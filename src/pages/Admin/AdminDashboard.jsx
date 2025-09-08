import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBunks: 0,
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        logEvent('ADMIN_DASHBOARD_ACCESS');
        
        // Fetch bunks data
        const bunksQuery = query(collection(db, 'bunks'));
        const bunksSnapshot = await getDocs(bunksQuery);
        const bunksData = bunksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate slot statistics
        let totalSlots = 0;
        let availableSlots = 0;
        let occupiedSlots = 0;
        
        bunksData.forEach(bunk => {
          totalSlots += bunk.slots?.length || 0;
          availableSlots += bunk.slots?.filter(slot => slot.status === 'available').length || 0;
          occupiedSlots += bunk.slots?.filter(slot => slot.status === 'occupied').length || 0;
        });
        
        // Fetch users data
        const usersQuery = query(collection(db, 'users'), where('role', '==', 'user'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch recent bookings
        const bookingsQuery = query(collection(db, 'bookings'));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch pending approvals
        const approvalsQuery = query(collection(db, 'bunk_registrations'), where('status', '==', 'pending'));
        const approvalsSnapshot = await getDocs(approvalsQuery);
        const pendingApprovals = approvalsSnapshot.docs.length;

        setStats({
          totalBunks: bunksData.length,
          totalSlots,
          availableSlots,
          occupiedSlots,
          totalUsers: usersData.length,
          pendingApprovals
        });
        
        setRecentBookings(bookingsData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        logEvent('ADMIN_DASHBOARD_ERROR', { error: error.message });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Admin Dashboard</h1>
            <div className="d-flex gap-2">
              <Link to="/admin/bunks" className="btn btn-outline-primary">
                Manage Bunks
              </Link>
              <Link to="/admin/slots" className="btn btn-outline-primary">
                Manage Slots
              </Link>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="row mb-5">
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-building fs-1 text-primary mb-2"></i>
                  <h3>{stats.totalBunks}</h3>
                  <p className="text-muted">Total Charging Stations</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-ev-station fs-1 text-success mb-2"></i>
                  <h3>{stats.totalSlots}</h3>
                  <p className="text-muted">Total Charging Slots</p>
                  <div className="d-flex justify-content-around">
                    <span className="text-success">{stats.availableSlots} Available</span>
                    <span className="text-warning">{stats.occupiedSlots} Occupied</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-people fs-1 text-info mb-2"></i>
                  <h3>{stats.totalUsers}</h3>
                  <p className="text-muted">Registered Users</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-clipboard-check fs-1 text-warning mb-2"></i>
                  <h3>{stats.pendingApprovals}</h3>
                  <p className="text-muted">Pending Approvals</p>
                  {stats.pendingApprovals > 0 && (
                    <Link to="/admin/approvals" className="btn btn-sm btn-outline-warning mt-2">
                      Review Requests
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Bookings */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <span className="badge bg-primary">{recentBookings.length} bookings</span>
                </div>
                <div className="card-body">
                  {recentBookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Station</th>
                            <th>Slot</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>{booking.userEmail}</td>
                              <td>{booking.bunkName}</td>
                              <td>Slot #{booking.slotNumber}</td>
                              <td>{booking.bookingTime?.toDate ? new Date(booking.bookingTime.toDate()).toLocaleString() : 'N/A'}</td>
                              <td>
                                <span className={`badge ${booking.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-calendar-x fs-1 text-muted"></i>
                      <p className="text-muted mt-2">No recent bookings found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex gap-3 flex-wrap">
                    <Link to="/admin/bunks" className="btn btn-outline-primary">
                      <i className="bi bi-building me-2"></i>
                      Manage Stations
                    </Link>
                    <Link to="/admin/slots" className="btn btn-outline-primary">
                      <i className="bi bi-ev-station me-2"></i>
                      Manage Slots
                    </Link>
                    <Link to="/admin/approvals" className="btn btn-outline-warning">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Review Approvals
                    </Link>
                    <Link to="/register-bunk" className="btn btn-outline-success">
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Station
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;