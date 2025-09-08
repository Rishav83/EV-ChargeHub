import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

import { auth, db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        logEvent('USER_DASHBOARD_ACCESS', { userId: user.uid });

        // Fetch user profile data
        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          setUserData(userSnapshot.docs[0].data());
        }

        // Fetch recent bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('bookingTime', 'desc'),
          limit(5)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentBookings(bookingsData);

        // Fetch favorite stations (mock data for now)
        setFavoriteStations([
          { id: 1, name: "Downtown Charging Station", address: "123 Main St" },
          { id: 2, name: "Westside EV Hub", address: "456 Oak Ave" }
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        logEvent('USER_DASHBOARD_ERROR', { error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Welcome back, {userData?.name || 'User'}!</h1>
            <Link to="/nearby-bunks" className="btn btn-primary">
              Find Charging Stations
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="row mb-5">
            <div className="col-md-4 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-calendar-check fs-1 text-primary mb-2"></i>
                  <h3>{recentBookings.length}</h3>
                  <p className="text-muted">Total Bookings</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-star fs-1 text-warning mb-2"></i>
                  <h3>{favoriteStations.length}</h3>
                  <p className="text-muted">Favorite Stations</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card dashboard-card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-clock-history fs-1 text-info mb-2"></i>
                  <h3>
                    {recentBookings.filter(booking => booking.status === 'active').length}
                  </h3>
                  <p className="text-muted">Active Sessions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Recent Bookings */}
            <div className="col-md-8 mb-4">
              <div className="card h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <Link to="/nearby-bunks" className="btn btn-sm btn-outline-primary">
                    Book Now
                  </Link>
                </div>
                <div className="card-body">
                  {recentBookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Station</th>
                            <th>Slot</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>{booking.bunkName}</td>
                              <td>Slot #{booking.slotNumber}</td>
                              <td>{new Date(booking.bookingTime?.toDate()).toLocaleString()}</td>
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
                      <Link to="/nearby-bunks" className="btn btn-primary mt-2">
                        Book Your First Session
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Stations */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Favorite Stations</h5>
                </div>
                <div className="card-body">
                  {favoriteStations.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {favoriteStations.map(station => (
                        <Link
                          key={station.id}
                          to={`/bunk/${station.id}`}
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{station.name}</h6>
                            <i className="bi bi-arrow-right"></i>
                          </div>
                          <p className="mb-1 small text-muted">{station.address}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-star fs-1 text-muted"></i>
                      <p className="text-muted mt-2">No favorite stations yet</p>
                      <Link to="/nearby-bunks" className="btn btn-outline-primary mt-2">
                        Explore Stations
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;