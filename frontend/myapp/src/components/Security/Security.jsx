import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../Security/Security.css';

const Admin = () => {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    role: 'Security', 
    empid: '',
    email: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State for QR code input
  const [qrCode, setQrCode] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanResult, setScanResult] = useState('');
  
  const [stats, setStats] = useState({
    monthlyConsumption: 1,
    totalActivePasses: 9,
    totalPasses: 2026,
    recentMonths: [
      { month: 'OCT', passes: 45 },
      { month: 'NOV', passes: 67 },
      { month: 'DEC', passes: 89 },
      { month: 'JAN', passes: 120 },
      { month: 'FEB', passes: 156 }
    ]
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New pass request from Student Affairs', time: '10 min ago', read: false },
    { id: 2, message: 'Visitor QR Code expiring in 2 hours', time: '1 hour ago', read: false },
    { id: 3, message: 'Monthly report is ready', time: '2 hours ago', read: true }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const empid = localStorage.getItem('empid');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        
        if (empid) {
          setUser(prev => ({
            ...prev,
            name: username || empid,
            role: role || 'Admin',
            empid: empid
          }));
          
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/get-user-details/${empid}/`);
            
            if (response.ok) {
              const userData = await response.json();
              console.log("User details API response:", userData);
              
              if (userData.status) {
                const userName = userData.data.empname || 
                               userData.data.name || 
                               userData.data.username || 
                               empid;
                
                const userRole = userData.data.role || role || 'Admin';
                const userEmail = userData.data.email || '';
                
                setUser({
                  name: userName,
                  role: userRole.charAt(0).toUpperCase() + userRole.slice(1),
                  empid: empid,
                  email: userEmail
                });
                
                localStorage.setItem('username', userName);
                localStorage.setItem('role', userRole);
                if (userEmail) localStorage.setItem('email', userEmail);
              }
            }
          } catch (apiError) {
            console.warn("Could not fetch user details from API:", apiError);
            setUser(prev => ({
              ...prev,
              name: username || empid,
              role: role || 'Admin'
            }));
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const empid = localStorage.getItem('empid') || '';
        const empname = localStorage.getItem('username') || empid || 'User';
        const role = localStorage.getItem('role') || 'Admin';
        setUser({
          name: empname,
          role: role,
          empid: empid,
          email: ''
        });
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleNavClick = useCallback((tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setLoading(true);
    localStorage.removeItem('empid');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    
    setTimeout(() => {
      navigate('/');
      setLoading(false);
    }, 300);
  }, [navigate]);

  const handleCreatePass = useCallback(() => {
    navigate('/request-form');
    setActiveTab('request-form');
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActivePasses: Math.floor(Math.random() * 5) + 7
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const monthlyProgress = useMemo(() => {
    return (stats.monthlyConsumption / 10) * 100;
  }, [stats.monthlyConsumption]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleViewAnalytics = useCallback(() => {
    alert('Opening Analytics Dashboard...');
  }, []);

  const handleMonthClick = useCallback((month) => {
    alert(`Viewing details for ${month}`);
  }, []);

  // Handle QR code scan with camera
  const handleScanQR = useCallback(() => {
    setShowCamera(true);
    // In a real app, you would initialize camera here
    alert('Camera activated for QR scanning. In production, implement actual camera.');
  }, []);

  // Handle manual QR code submission
  const handleSubmitQR = useCallback((e) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setScanResult(`QR Code scanned: ${qrCode}`);
      // Here you would typically validate the QR code with your backend
      alert(`Validating QR Code: ${qrCode}`);
      setQrCode('');
    }
  }, [qrCode]);

  // UPDATED: Fast navigation to OTP page
  const handleChangePassword = useCallback(() => {
    if (!user.empid) {
      alert("Employee ID not found. Please login again.");
      return;
    }

    console.log("Navigating to OTP page...");
    
    navigate('/sotp', {
      state: {
        empid: user.empid,
        email: user.email || '',
        username: user.name,
        empname: user.name,
        role: user.role,
        source: 'password-change',
        department: ''
      }
    });
    setActiveTab('change-password');
    setSidebarOpen(false);
  }, [navigate, user.empid, user.email, user.name, user.role]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <button 
        className={`hamburger-btn ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        disabled={loading}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Simplified Sidebar with only 2 buttons */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="logo-circle">GP</div>
            <h2>Gate Pass App</h2>
          </div>
          <p className="college-name">SVR Engineering College</p>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-details">
            <h3>{user.name}</h3>
            <p className="user-role">{user.role}</p>
            <p className="user-empid">{user.empid ? `ID: ${user.empid}` : ''}</p>
            {user.email && <p className="user-email">{user.email}</p>}
          </div>
        </div>

        {/* Only 2 navigation buttons as requested */}
        <nav className="sidebar-nav">
          
          <button 
            className="nav-item"
            onClick={() => handleNavClick('dashboard')}
            disabled={loading}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>

          <button 
            className={`nav-item ${activeTab === 'change-password' ? 'active' : ''}`}
            onClick={handleChangePassword}
            disabled={loading || !user.empid}
            title={!user.empid ? "Employee ID not available" : "Change your password"}
          >
            <span className="nav-icon">🔑</span>
            Change Password
            {!user.empid && <span className="tooltip">⚠️ ID missing</span>}
          </button>

          
        </nav>

        <button className="logout-btn" onClick={handleLogout} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Logging out...
            </>
          ) : (
            <>
              <span className="logout-icon">🚪</span>
              Logout
            </>
          )}
        </button>
      </div>

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Hi, {user.name} 👋</h1>
            <p className="welcome-text">Welcome to OutPass APP</p>
            <p className="user-info-small">
              Role: <strong>{user.role}</strong> | 
              ID: <strong>{user.empid || 'Not set'}</strong>
              {user.email && ` | Email: ${user.email}`}
            </p>
          </div>
          <div className="header-right">
            <div className="date-time">
              <span className="date">{currentDate}</span>
              <span className="time">{currentTime}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Welcome Card exactly as in the image */}
          <div className="welcome-card">
            <div className="welcome-content">
              <h2>Streamline Your Visitor Management</h2>
              <p>Streamline your visitor management with our new digital pass system. Create QR codes instantly and track entry logs in real-time.</p>
              <div className="features-list">
                <span className="feature">✓ Instant QR Code Generation</span>
                <span className="feature">✓ Real-time Tracking</span>
                <span className="feature">✓ Digital Records</span>
                <span className="feature">✓ Analytics Dashboard</span>
              </div>
            </div>
            <div className="welcome-illustration">
              <div className="illustration">📱🔐</div>
            </div>
          </div>

          {/* QR Code Scanner Section */}
          <div className="qr-scanner-section">
            <div className="scanner-card">
              <div className="scanner-header">
                <h3>QR Code Scanner</h3>
                <p>Scan visitor QR codes or enter manually</p>
              </div>
              
              <div className="scanner-content">
                {/* Camera Preview */}
                <div className="camera-preview">
                  {showCamera ? (
                    <div className="camera-active">
                      <div className="camera-view">
                        <div className="camera-placeholder">
                          <span className="camera-icon">📷</span>
                          <p>Camera Active</p>
                          <div className="qr-frame"></div>
                        </div>
                      </div>
                      <button 
                        className="scan-button"
                        onClick={() => {
                          // Simulate QR code scan
                          const fakeQR = `VISIT-${Date.now().toString().slice(-6)}`;
                          setScanResult(`Scanned: ${fakeQR}`);
                          alert(`QR Code detected: ${fakeQR}`);
                        }}
                      >
                        Scan QR Code
                      </button>
                      <button 
                        className="close-camera-btn"
                        onClick={() => setShowCamera(false)}
                      >
                        Close Camera
                      </button>
                    </div>
                  ) : (
                    <div className="camera-inactive">
                      <div className="camera-placeholder">
                        <span className="camera-icon">📷</span>
                        <p>Click to activate camera</p>
                      </div>
                      <button 
                        className="activate-camera-btn"
                        onClick={handleScanQR}
                      >
                        Activate Camera
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual QR Code Input */}
                <div className="manual-input">
                  <h4>Or Enter QR Code Manually</h4>
                  <form onSubmit={handleSubmitQR} className="qr-input-form">
                    <div className="input-group">
                      <input
  type="text"
  value={qrCode}
  onChange={(e) => {
    // Remove any non-digit characters
    const value = e.target.value.replace(/\D/g, '');
    
    // Limit to 4 digits
    if (value.length <= 4) {
      setQrCode(value);
    }
  }}
  placeholder="Enter 4-digit code..."
  className="qr-input"
  maxLength={4}
  pattern="\d{4}"
  inputMode="numeric"
/>
                      <button 
                        type="submit" 
                        className="submit-qr-btn"
                        disabled={!qrCode.trim()}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                  
                  {/* Scan Result Display */}
                  {scanResult && (
                    <div className="scan-result">
                      <h4>Scan Result:</h4>
                      <div className="result-box">
                        {scanResult}
                      </div>
                      <button 
                        className="clear-result-btn"
                        onClick={() => setScanResult('')}
                      >
                        Clear Result
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="quick-stats-card">
              <div className="stats-header">
                <h3>Today's Activity</h3>
                <span className="stats-badge">Live</span>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{stats.totalActivePasses}</span>
                  <span className="stat-label">Active Passes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">15</span>
                  <span className="stat-label">Visitors Today</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
              </div>
              <button className="view-details-btn">
                View All Details →
              </button>
            </div>
          </div>

          
          
        </div>
      </div>
    </div>
  );
};

export default React.memo(Admin);