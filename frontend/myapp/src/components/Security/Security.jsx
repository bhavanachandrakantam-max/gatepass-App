import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../Security/Security.css';

const Security = () => {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    role: 'Security', 
    empid: '',
    email: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State for QR scanner
  const [showCamera, setShowCamera] = useState(false);
  const [activePassId, setActivePassId] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationType, setVerificationType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State for OTP popup
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otpPassId, setOtpPassId] = useState(null);
  const [otpType, setOtpType] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Visitor passes data
  const [visitorPasses, setVisitorPasses] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      passNumber: '#001',
      date: 'JAN 01 2026',
      outTime: null,
      inTime: null,
      status: 'pending',
      qrCode: 'AXL-2026-001',
      otpCode: '1234',
      leaveDuration: 60,
      timeRemaining: null,
      timerStarted: false
    },
    {
      id: 2,
      name: 'Sarah Miller',
      passNumber: '#002',
      date: 'JAN 01 2026',
      outTime: '10:30',
      inTime: '11:45',
      status: 'completed',
      qrCode: 'SAR-2026-002',
      otpCode: '5678',
      leaveDuration: 60,
      timeRemaining: 0,
      timerStarted: false
    },
    {
      id: 3,
      name: 'Robert Chen',
      passNumber: '#003',
      date: 'JAN 02 2026',
      outTime: '09:15',
      inTime: null,
      status: 'active',
      qrCode: 'ROB-2026-003',
      otpCode: '9012',
      leaveDuration: 60,
      timeRemaining: 35,
      timerStarted: true
    },
    {
      id: 4,
      name: 'Maria Garcia',
      passNumber: '#004',
      date: 'JAN 02 2026',
      outTime: null,
      inTime: null,
      status: 'pending',
      qrCode: 'MAR-2026-004',
      otpCode: '3456',
      leaveDuration: 60,
      timeRemaining: null,
      timerStarted: false
    }
  ]);

  const [stats, setStats] = useState({
    totalActivePasses: 1,
    visitorsToday: 4,
    pendingPasses: 2,
    successRate: 98
  });

  const navigate = useNavigate();

  // Timer effect for active passes
  useEffect(() => {
    const timer = setInterval(() => {
      setVisitorPasses(prevPasses => 
        prevPasses.map(pass => {
          if (pass.status === 'active' && pass.timeRemaining > 0) {
            const newTimeRemaining = pass.timeRemaining - 1;
            
            if (newTimeRemaining <= 0) {
              return {
                ...pass,
                status: 'expired',
                timeRemaining: 0,
                timerStarted: false
              };
            }
            
            return {
              ...pass,
              timeRemaining: newTimeRemaining
            };
          }
          return pass;
        })
      );
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Update stats
  useEffect(() => {
    setStats({
      totalActivePasses: visitorPasses.filter(p => p.status === 'active').length,
      visitorsToday: visitorPasses.length,
      pendingPasses: visitorPasses.filter(p => p.status === 'pending').length,
      successRate: 98
    });
  }, [visitorPasses]);

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
            role: role || 'Security',
            empid: empid
          }));
          
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/get-user-details/${empid}/`);
            
            if (response.ok) {
              const userData = await response.json();
              
              if (userData.status) {
                const userName = userData.data.empname || 
                               userData.data.name || 
                               userData.data.username || 
                               empid;
                
                const userRole = userData.data.role || role || 'Security';
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
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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

  const handleChangePassword = useCallback(() => {
    if (!user.empid) {
      alert("Employee ID not found. Please login again.");
      return;
    }
    
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

  // Filter passes based on status
  const filteredPasses = useMemo(() => {
    if (filterStatus === 'all') return visitorPasses;
    return visitorPasses.filter(pass => pass.status === filterStatus);
  }, [visitorPasses, filterStatus]);

  // Format time remaining
  const formatTimeRemaining = useCallback((minutes) => {
    if (!minutes && minutes !== 0) return '--:--';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }, []);

  // Get current time for out/in
  const getCurrentTimeString = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, []);

  // Handle QR scan for out-time
  const handleQRScanOut = useCallback((passId) => {
    const pass = visitorPasses.find(p => p.id === passId);
    if (!pass) return;
    
    if (pass.status === 'pending') {
      const currentTimeStr = getCurrentTimeString();
      
      setVisitorPasses(prev => prev.map(p => 
        p.id === passId 
          ? { 
              ...p, 
              status: 'active',
              outTime: currentTimeStr,
              timeRemaining: p.leaveDuration,
              timerStarted: true
            }
          : p
      ));
      
      setVerificationMessage(`✅ Out-time recorded: ${currentTimeStr}. 1-hour timer started.`);
      setVerificationType('success');
      
      setTimeout(() => setVerificationMessage(''), 5000);
    }
  }, [visitorPasses, getCurrentTimeString]);

  // Handle QR scan for in-time
  const handleQRScanIn = useCallback((passId) => {
    const pass = visitorPasses.find(p => p.id === passId);
    if (!pass) return;
    
    if (pass.status === 'active') {
      const currentTimeStr = getCurrentTimeString();
      
      setVisitorPasses(prev => prev.map(p => 
        p.id === passId 
          ? { 
              ...p, 
              status: 'completed',
              inTime: currentTimeStr,
              timeRemaining: 0,
              timerStarted: false
            }
          : p
      ));
      
      setVerificationMessage(`✅ In-time recorded: ${currentTimeStr}. Visit completed.`);
      setVerificationType('success');
      
      setTimeout(() => setVerificationMessage(''), 5000);
    }
  }, [visitorPasses, getCurrentTimeString]);

  // Handle manual code verification for out-time
  const handleManualCodeOut = useCallback((passId, enteredCode) => {
    const pass = visitorPasses.find(p => p.id === passId);
    if (!pass) return;
    
    if (enteredCode === pass.otpCode) {
      if (pass.status === 'pending') {
        const currentTimeStr = getCurrentTimeString();
        
        setVisitorPasses(prev => prev.map(p => 
          p.id === passId 
            ? { 
                ...p, 
                status: 'active',
                outTime: currentTimeStr,
                timeRemaining: p.leaveDuration,
                timerStarted: true
              }
            : p
        ));
        
        setVerificationMessage(`✅ OTP verified! Out-time: ${currentTimeStr}. 1-hour timer started.`);
        setVerificationType('success');
        setOtpInput('');
        setShowOTPPopup(false);
        setOtpPassId(null);
        
        setTimeout(() => setVerificationMessage(''), 5000);
      }
    } else {
      setVerificationMessage('❌ Invalid OTP code. Please try again.');
      setVerificationType('error');
      setTimeout(() => setVerificationMessage(''), 3000);
    }
  }, [visitorPasses, getCurrentTimeString]);

  // Handle manual code verification for in-time
  const handleManualCodeIn = useCallback((passId, enteredCode) => {
    const pass = visitorPasses.find(p => p.id === passId);
    if (!pass) return;
    
    if (enteredCode === pass.otpCode) {
      if (pass.status === 'active') {
        const currentTimeStr = getCurrentTimeString();
        
        setVisitorPasses(prev => prev.map(p => 
          p.id === passId 
            ? { 
                ...p, 
                status: 'completed',
                inTime: currentTimeStr,
                timeRemaining: 0,
                timerStarted: false
              }
            : p
        ));
        
        setVerificationMessage(`✅ OTP verified! In-time: ${currentTimeStr}. Visit completed.`);
        setVerificationType('success');
        setOtpInput('');
        setShowOTPPopup(false);
        setOtpPassId(null);
        
        setTimeout(() => setVerificationMessage(''), 5000);
      }
    } else {
      setVerificationMessage('❌ Invalid OTP code. Please try again.');
      setVerificationType('error');
      setTimeout(() => setVerificationMessage(''), 3000);
    }
  }, [visitorPasses, getCurrentTimeString]);

  // Open camera scanner
  const handleOpenCamera = useCallback((passId, type) => {
    setActivePassId(passId);
    setShowCamera(true);
    
    setTimeout(() => {
      const pass = visitorPasses.find(p => p.id === passId);
      if (pass) {
        const mockScan = () => {
          if (type === 'out') {
            handleQRScanOut(passId);
          } else if (type === 'in') {
            handleQRScanIn(passId);
          }
          setShowCamera(false);
          setActivePassId(null);
        };
        
        window.mockScanFunction = mockScan;
      }
    }, 500);
  }, [visitorPasses, handleQRScanOut, handleQRScanIn]);

  // Close camera
  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
    setActivePassId(null);
  }, []);

  // Simulate QR scan (for demo purposes)
  const handleSimulateScan = useCallback(() => {
    if (window.mockScanFunction) {
      window.mockScanFunction();
    }
  }, []);

  // Open OTP popup
  const handleOpenOTPPopup = useCallback((passId, type) => {
    setOtpPassId(passId);
    setOtpType(type);
    setOtpInput('');
    setShowOTPPopup(true);
  }, []);

  // Close OTP popup
  const handleCloseOTPPopup = useCallback(() => {
    setShowOTPPopup(false);
    setOtpPassId(null);
    setOtpType('');
    setOtpInput('');
  }, []);

  // Handle OTP submit from popup
  const handleOTPSubmit = useCallback(() => {
    if (otpInput.length === 4) {
      if (otpType === 'out') {
        handleManualCodeOut(otpPassId, otpInput);
      } else if (otpType === 'in') {
        handleManualCodeIn(otpPassId, otpInput);
      }
    } else {
      setVerificationMessage('❌ Please enter 4-digit OTP code');
      setVerificationType('error');
      setTimeout(() => setVerificationMessage(''), 3000);
    }
  }, [otpInput, otpType, otpPassId, handleManualCodeOut, handleManualCodeIn]);

  // Handle filter change
  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // Handle search input change - only 3 digits
  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setSearchQuery(value);
    setShowSearchResult(false);
    setSearchError('');
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.length !== 3) {
      setSearchError('Please enter exactly 3 digits');
      setShowSearchResult(false);
      return;
    }

    const passId = parseInt(searchQuery);
    const foundPass = visitorPasses.find(p => 
      p.id === passId || 
      p.passNumber === `#${searchQuery}` ||
      p.passNumber.includes(searchQuery)
    );

    if (foundPass) {
      setSearchResult(foundPass);
      setShowSearchResult(true);
      setSearchError('');
      
      setTimeout(() => {
        setShowSearchResult(false);
        setSearchResult(null);
        setSearchQuery('');
      }, 8000);
    } else {
      setSearchError('No pass found with this number');
      setShowSearchResult(false);
      setSearchResult(null);
    }
  }, [searchQuery, visitorPasses]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResult(false);
    setSearchResult(null);
    setSearchError('');
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'expired': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  }, []);

  // Get status text
  const getStatusText = useCallback((status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'expired': return 'Expired';
      case 'completed': return 'Completed';
      default: return status;
    }
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
            className={`nav-item ${activeTab === 'change-password' ? 'active' : ''}`}
            onClick={handleChangePassword}
            disabled={loading || !user.empid}
          >
            <span className="nav-icon">🔑</span>
            Change Password
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
            <p className="welcome-text">Welcome to Security Dashboard</p>
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

        {/* Camera Modal */}
        {showCamera && (
          <div className="camera-modal">
            <div className="camera-modal-content">
              <div className="camera-modal-header">
                <h3>QR Code Scanner</h3>
                <button className="close-modal-btn" onClick={handleCloseCamera}>✕</button>
              </div>
              <div className="camera-preview-area">
                <div className="camera-viewfinder">
                  <div className="camera-icon-large">📷</div>
                  <div className="qr-scan-animation"></div>
                  <p>Position QR code within frame</p>
                </div>
              </div>
              <div className="camera-actions">
                <button className="simulate-scan-btn" onClick={handleSimulateScan}>
                  Simulate QR Scan
                </button>
                <button className="cancel-scan-btn" onClick={handleCloseCamera}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Popup Modal */}
        {showOTPPopup && (
          <div className="otp-popup-modal">
            <div className="otp-popup-content">
              <div className="otp-popup-header">
                <h3>Enter Code</h3>
                <button className="close-popup-btn" onClick={handleCloseOTPPopup}>✕</button>
              </div>
              <div className="otp-popup-body">
                <div className="otp-popup-icon">🔐</div>
                <p className="otp-popup-instruction">
                  Please enter the 4-digit code
                </p>
                <div className="otp-popup-input-container">
                  <input
                    type="text"
                    maxLength="4"
                    placeholder="• • • •"
                    value={otpInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setOtpInput(value);
                    }}
                    className="otp-popup-input"
                    autoFocus
                  />
                </div>
                <div className="otp-popup-actions">
                  <button 
                    className="otp-popup-submit-btn"
                    onClick={handleOTPSubmit}
                    disabled={otpInput.length !== 4}
                  >
                    Verify
                  </button>
                  <button 
                    className="otp-popup-cancel-btn"
                    onClick={handleCloseOTPPopup}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Message Toast */}
        {verificationMessage && (
          <div className={`verification-toast ${verificationType}`}>
            {verificationMessage}
          </div>
        )}

        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-cards-row">
            <div className="stat-card">
              <div className="stat-card-icon">🟢</div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.totalActivePasses}</span>
                <span className="stat-card-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.visitorsToday}</span>
                <span className="stat-card-label">Today</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">⏳</div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.pendingPasses}</span>
                <span className="stat-card-label">Pending</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📊</div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.successRate}%</span>
                <span className="stat-card-label">Success</span>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by 3-digit pass number (e.g., 001)"
                value={searchQuery}
                onChange={handleSearchInputChange}
                maxLength="3"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button 
                className="search-btn"
                onClick={handleSearchSubmit}
                disabled={searchQuery.length !== 3}
              >
                Search
              </button>
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={handleClearSearch}
                >
                  ✕
                </button>
              )}
            </div>
            
            {searchError && (
              <div className="search-error-message">
                {searchError}
              </div>
            )}
            
            {showSearchResult && searchResult && (
              <div className="search-result-card">
                <div className="search-result-header">
                  <h3>Pass Found</h3>
                  <button 
                    className="close-result-btn"
                    onClick={() => {
                      setShowSearchResult(false);
                      setSearchResult(null);
                      setSearchQuery('');
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="search-result-content">
                  <div className="result-pass-number">{searchResult.passNumber}</div>
                  <div className="result-visitor-name">{searchResult.name}</div>
                  <div className="result-details">
                    <div className="result-detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{searchResult.date}</span>
                    </div>
                    <div className="result-detail-item">
                      <span className="detail-label">Status:</span>
                      <span 
                        className="detail-status"
                        style={{ 
                          backgroundColor: getStatusColor(searchResult.status),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        {getStatusText(searchResult.status)}
                      </span>
                    </div>
                    <div className="result-detail-item">
                      <span className="detail-label">Out Time:</span>
                      <span className="detail-value">{searchResult.outTime || '--:--'}</span>
                    </div>
                    <div className="result-detail-item">
                      <span className="detail-label">In Time:</span>
                      <span className="detail-value">{searchResult.inTime || '--:--'}</span>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button 
                      className="result-view-btn"
                      onClick={() => alert(`Viewing details for ${searchResult.name}`)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visitor Pass Cards Section - Ultra Compact Design */}
          <div className="visitor-passes-section">
            <div className="section-header">
              <h2>Visitor Passes</h2>
              <div className="passes-filters">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All ({visitorPasses.length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending ({visitorPasses.filter(p => p.status === 'pending').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('active')}
                >
                  Active ({visitorPasses.filter(p => p.status === 'active').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('completed')}
                >
                  Completed ({visitorPasses.filter(p => p.status === 'completed').length})
                </button>
              </div>
            </div>

            <div className="visitor-passes-vertical">
              {filteredPasses.length > 0 ? (
                filteredPasses.map((pass) => (
                  <div key={pass.id} className="visitor-pass-card-ultra">
                    {/* Row 1: Pass Number and Action Buttons */}
                    <div className="card-row-1">
                      <div className="pass-number-ultra">{pass.passNumber.replace('#', '')}</div>
                      <div className="action-icons-ultra">
                        <button 
                          className="icon-btn-ultra camera-icon"
                          onClick={() => handleOpenCamera(pass.id, pass.status === 'pending' ? 'out' : 'in')}
                          title="Scan QR Code"
                        >
                          Scan
                        </button>
                        <button 
                          className="icon-btn-ultra code-icon"
                          onClick={() => handleOpenOTPPopup(pass.id, pass.status === 'pending' ? 'out' : 'in')}
                          title="Enter Code"
                        >
                          Code
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Visitor Name and Times */}
                    <div className="card-row-2">
                      <div className="visitor-name-ultra">{pass.name}</div>
                      <div className="times-ultra">
                        <span className="time-out-ultra">Out: {pass.outTime || '--:--'}</span>
                        <span className="time-in-ultra">In: {pass.inTime || '--:--'}</span>
                      </div>
                    </div>

                    {/* Row 3: Date */}
                    <div className="card-row-3">
                      <div className="date-ultra">{pass.date}</div>
                    </div>

                    {/* Digital Pass Message - Compact */}
                    <div className="digital-pass-message-ultra">
                      Streamline your visitor management with our new digital pass system.
                    </div>

                    {/* Status Badge for completed/expired passes */}
                    {(pass.status === 'completed' || pass.status === 'expired') && (
                      <div className="status-badge-container-ultra">
                        <span 
                          className="status-badge-ultra"
                          style={{ backgroundColor: getStatusColor(pass.status) }}
                        >
                          {getStatusText(pass.status)}
                        </span>
                      </div>
                    )}

                    {/* Timer for active passes - Ultra Compact */}
                    {pass.status === 'active' && (
                      <div className="timer-container-ultra">
                        <div className="timer-display-ultra">
                          <span className="timer-label-ultra">Time:</span>
                          <span className="timer-value-ultra">{formatTimeRemaining(pass.timeRemaining)}</span>
                        </div>
                        <div className="progress-bar-ultra">
                          <div 
                            className="progress-fill-ultra"
                            style={{ 
                              width: `${(pass.timeRemaining / pass.leaveDuration) * 100}%`,
                              backgroundColor: pass.timeRemaining < 10 ? '#ef4444' : '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-passes-message">
                  <span className="no-passes-icon">📋</span>
                  <h3>No passes found</h3>
                  <p>There are no {filterStatus !== 'all' ? filterStatus : ''} passes to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Security);