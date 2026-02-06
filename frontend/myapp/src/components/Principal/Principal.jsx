import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../Admin/Admin.css';

const Admin = () => {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    role: 'Principal', 
    empid: '',
    email: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
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

  const handleToRequestForm = useCallback(() => {
    navigate('/request-form');
    setActiveTab('request-form');
    setSidebarOpen(false);
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

  // UPDATED: Fast navigation to OTP page (OTP sending happens in OTP page)
  const handleChangePassword = useCallback(() => {
    if (!user.empid) {
      alert("Employee ID not found. Please login again.");
      return;
    }

    // Navigate immediately to OTP page
    console.log("Navigating to OTP page...");
    
    navigate('/', {
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

  const handleCreateUser = useCallback(() => {
    setActiveTab('create-user');
    alert('Create User feature coming soon!');
    setSidebarOpen(false);
  }, []);

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

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
            disabled={loading}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={handleToRequestForm}
            disabled={loading}
          >
            <span className="nav-icon">📝</span>
            Request Form
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}
            disabled={loading}
          >
            <span className="nav-icon">📈</span>
            Reports
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

          <button 
            className={`nav-item ${activeTab === 'create-user' ? 'active' : ''}`}
            onClick={handleCreateUser}
            disabled={loading}
          >
            <span className="nav-icon">👤</span>
            Create User
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
            <button 
              className="create-pass-btn" 
              onClick={handleCreatePass}
              disabled={loading}
            >
              <span>+</span> Create New Pass
            </button>
            <div className="date-time">
              <span className="date">{currentDate}</span>
              <span className="time">{currentTime}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
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

          <div className="dashboard-grid">
            <div className="card consumption-card">
              <div className="card-header">
                <h3>Monthly Pass Consumption</h3>
                <span className="card-badge">Current Month</span>
              </div>
              <div className="consumption-content">
                <div className="consumption-number">
                  <span className="current">{stats.monthlyConsumption}</span>
                  <span className="total">/10</span>
                </div>
                <div className="consumption-details">
                  <p className="active-passes">Active passes: {stats.totalActivePasses}</p>
                  <p className="consumption-info">Limit: 10 passes per month</p>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${monthlyProgress}%` }}
                  ></div>
                </div>
                <button className="view-analytics-btn" onClick={handleViewAnalytics}>
                  View Analytics →
                </button>
              </div>
            </div>

            <div className="card annual-card">
              <div className="card-header">
                <h3>ANNUAL OVERVIEW</h3>
                <span className="card-badge">2026</span>
              </div>
              <div className="annual-content">
                <div className="total-passes">
                  <h4>Total Passes</h4>
                  <div className="total-number">{stats.totalPasses}</div>
                </div>
                <div className="monthly-breakdown">
                  {stats.recentMonths.map((monthData, index) => (
                    <div 
                      key={monthData.month}
                      className="month-item"
                      onClick={() => handleMonthClick(monthData.month)}
                    >
                      <span className="month-name">{monthData.month}</span>
                      <div className="month-bar-container">
                        <div 
                          className="month-bar"
                          style={{ 
                            height: `${(monthData.passes / 200) * 100}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                      <span className="month-count">{monthData.passes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card quick-actions-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="action-btn" disabled={loading}>
                  <span className="action-icon">📋</span>
                  Generate QR
                </button>
                <button className="action-btn" disabled={loading}>
                  <span className="action-icon">👥</span>
                  Add Visitor
                </button>
                <button className="action-btn" disabled={loading}>
                  <span className="action-icon">📤</span>
                  Export Data
                </button>
                <button className="action-btn" disabled={loading}>
                  <span className="action-icon">📧</span>
                  Send Alerts
                </button>
              </div>
            </div>

            <div className="card notifications-card">
              <div className="card-header">
                <h3>Recent Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={clearAllNotifications}
                    disabled={loading}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Admin);