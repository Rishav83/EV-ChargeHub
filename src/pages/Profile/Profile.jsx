import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import { auth, db } from '../../services/firebase';
import { logEvent } from '../../utils/logger';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        logEvent('PROFILE_PAGE_ACCESS', { userId: user.uid });

        // Fetch user profile data
        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const data = userDoc.data();
          setUserData({ id: userDoc.id, ...data });
          setName(data.name || '');
          setPhone(data.phone || '');
          setVehicleType(data.vehicleType || '');
          setNewEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        logEvent('PROFILE_FETCH_ERROR', { error: error.message });
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Update Firestore document
      const userDocRef = doc(db, 'users', userData.id);
      await updateDoc(userDocRef, {
        name,
        phone,
        vehicleType,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      logEvent('PROFILE_UPDATE_SUCCESS', { userId: user.uid });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
      logEvent('PROFILE_UPDATE_ERROR', { error: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logEvent('PASSWORD_CHANGE_SUCCESS', { userId: user.uid });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
      logEvent('PASSWORD_CHANGE_ERROR', { error: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);

      // Update Firestore document
      const userDocRef = doc(db, 'users', userData.id);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Email updated successfully!' });
      logEvent('EMAIL_CHANGE_SUCCESS', { userId: user.uid, newEmail });
    } catch (error) {
      console.error('Error changing email:', error);
      setMessage({ type: 'error', text: 'Failed to change email. Please check your current password.' });
      logEvent('EMAIL_CHANGE_ERROR', { error: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Profile Settings</h1>
            <Link to="/dashboard" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </Link>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              {message.text}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile Information
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                  >
                    <i className="bi bi-envelope me-2"></i>
                    Change Email
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="vehicleType" className="form-label">Vehicle Type</label>
                      <select
                        className="form-control"
                        id="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="car">Car</option>
                        <option value="scooter">Scooter</option>
                        <option value="bike">Bike</option>
                        <option value="bus">Bus</option>
                        <option value="truck">Truck</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="currentEmail" className="form-label">Current Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="currentEmail"
                        value={userData?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="currentPassword" className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>
              )}

              {/* Change Email Tab */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailChange}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="emailCurrentPassword" className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="emailCurrentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="newEmail" className="form-label">New Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="newEmail"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="currentEmailDisplay" className="form-label">Current Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="currentEmailDisplay"
                        value={userData?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      'Change Email'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Account Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>User ID:</strong> {auth.currentUser?.uid}</p>
                  <p><strong>Account Created:</strong> {auth.currentUser?.metadata.creationTime}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Last Sign-in:</strong> {auth.currentUser?.metadata.lastSignInTime}</p>
                  <p><strong>Email Verified:</strong> {auth.currentUser?.emailVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;