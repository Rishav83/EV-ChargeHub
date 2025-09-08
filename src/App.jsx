import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile/Profile'; 
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserDashboard from './pages/User/UserDashboard';
import BunkManagement from './pages/Admin/BunkManagement';
import SlotManagement from './pages/Admin/SlotManagement';
import NearbyBunks from './pages/User/NearbyBunks';
import BunkDetails from './pages/User/BunkDetails';
import BunkRegistration from './pages/Auth/BunkRegistration';
import BunkApprovals from './pages/Admin/BunkApprovals';

// Services
import { auth } from './services/firebase';
import { logEvent } from './utils/logger';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const role = localStorage.getItem('userRole') || 
                    (user.email && user.email.includes('@admin.') ? 'admin' : 'user');
        setUserRole(role);
        
        if (!localStorage.getItem('userRole')) {
          localStorage.setItem('userRole', role);
        }
        
        logEvent('USER_AUTH_CHANGED', { userId: user.uid, role: role });
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem('userRole');
        logEvent('USER_SIGNED_OUT');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Navbar user={user} userRole={userRole} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />} 
            />
            <Route 
              path="/admin" 
              element={user && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/admin/bunks" 
              element={user && userRole === 'admin' ? <BunkManagement /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/admin/slots" 
              element={user && userRole === 'admin' ? <SlotManagement /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/admin/approvals" 
              element={user && userRole === 'admin' ? <BunkApprovals /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={user && userRole === 'user' ? <UserDashboard /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/nearby-bunks" 
              element={<NearbyBunks user={user} />} 
            />
            <Route 
              path="/bunk/:id" 
              element={<BunkDetails user={user} />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/login" replace />} 
            />
            <Route path="/register-bunk" element={<BunkRegistration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;