'use client';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../Office/Office.css';

const Dashboard = () => {
  const [user, setUser] = useState({ name: 'Office', role: 'Office' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActivePasses: Math.floor(Math.random() * 5) + 7
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    alert('Logging out...');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar after navigation on mobile
  };

  const navigate = useNavigate();

   const handleToRequestForm = () => {
    navigate('/request');
    setActiveTab(tab);
    setSidebarOpen(false); 
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleCreatePass = () => {
    alert('Opening Pass Creation Form...');
  };

  const handleViewAnalytics = () => {
    alert('Opening Analytics Dashboard...');
  };

  const handleMonthClick = (month) => {
    alert(`Viewing details for ${month}`);
  };

  return (
    <div className="dashboard-container">
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Hamburger Button */}
      <button 
        className={`hamburger-btn ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Sidebar */}
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
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
             onClick={handleToRequestForm}
          >
            <span className="nav-icon">📝</span>
            Request Form
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}
          >
            <span className="nav-icon">📈</span>
            Reports
          </button>
          {/*<button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleNavClick('notifications')}
          >
            <span className="nav-icon">🔔</span>
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>*/}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Hi, {user.name} 👋</h1>
            <p className="welcome-text">Welcome to OutPass APP</p>
          </div>
          <div className="header-right">
            <button className="create-pass-btn" onClick={handleCreatePass}>
              <span>+</span> Create New Pass
            </button>
            <div className="date-time">
              <span className="date">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="time">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Welcome Section */}
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

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Monthly Pass Consumption */}
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
                    style={{ width: `${(stats.monthlyConsumption / 10) * 100}%` }}
                  ></div>
                </div>
                <button className="view-analytics-btn" onClick={handleViewAnalytics}>
                  View Analytics →
                </button>
              </div>
            </div>

            {/* Annual Overview */}
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
                      key={index}
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

            {/* Quick Actions */}
            <div className="card quick-actions-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="action-btn">
                  <span className="action-icon">📋</span>
                  Generate QR
                </button>
                <button className="action-btn">
                  <span className="action-icon">👥</span>
                  Add Visitor
                </button>
                <button className="action-btn">
                  <span className="action-icon">📤</span>
                  Export Data
                </button>
                <button className="action-btn">
                  <span className="action-icon">📧</span>
                  Send Alerts
                </button>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card notifications-card">
              <div className="card-header">
                <h3>Recent Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={clearAllNotifications}
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

export default Dashboard;
