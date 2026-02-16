import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './hReports.css';

const Reports = () => {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    role: 'Admin', 
    empid: '',
    email: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');
  
  // Filter states
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [staff, setStaff] = useState('All Staff');
  const [staffId, setStaffId] = useState('all');
  
  // Dynamic data
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [staffMembers, setStaffMembers] = useState(['All Staff']);
  const [reportsData, setReportsData] = useState({
    totalOutings: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    monthlyData: [],
    staffOutings: []
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const empid = localStorage.getItem('empid');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');
      const email = localStorage.getItem('email');
      const department = localStorage.getItem('department');
      
      console.log('👤 User data from localStorage:', {
        empid, username, role, email, department
      });
      
      if (empid) {
        setUser({
          name: username || empid,
          role: role || 'Admin',
          empid: empid,
          email: email || '',
          department: department || ''
        });
        // Fetch dynamic data after user data is loaded
        fetchAvailableYearsMonths();
        fetchStaffList();
        fetchReportsData();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  fetchUserData();
}, [navigate]);

  const fetchAvailableYearsMonths = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming you use token-based auth
      const response = await fetch('/api/get-available-years-months/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setYears(data.years.map(y => y.toString()));
          setMonths(data.months);
          
          // Set current month and year from API response
          if (data.current_month && data.current_year) {
            const currentMonthObj = data.months.find(m => m.value === data.current_month);
            if (currentMonthObj) {
              setMonth(currentMonthObj.name);
            }
            setYear(data.current_year.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching years/months:', error);
      // Fallback to default values
      setYears(['2023', '2024', '2025', '2026']);
      setMonths([
        { value: 1, name: 'January' }, { value: 2, name: 'February' }, 
        { value: 3, name: 'March' }, { value: 4, name: 'April' }, 
        { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' }, 
        { value: 9, name: 'September' }, { value: 10, name: 'October' }, 
        { value: 11, name: 'November' }, { value: 12, name: 'December' }
      ]);
    }
  };

  const fetchStaffList = async () => {
  try {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role')?.toLowerCase();
    
    let apiEndpoint = '';
    
    // Use appropriate endpoint based on role
    if (userRole === 'hod') {
      apiEndpoint = '/api/get-hod-staff-list/';
    } else if (userRole === 'admin' || userRole === 'principal') {
      apiEndpoint = '/api/get-all-staff-list/';
    } else {
      // For other roles, use a minimal staff list
      setStaffMembers(['All Staff']);
      return;
    }
    
    console.log(`👥 Fetching staff list from: ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Staff list response:', data);
      
      if (data.status) {
        // Transform staff data for dropdown
        const staffOptions = data.staff_list.map(staff => ({
          id: staff.id,
          name: staff.formatted_name || staff.name,
          value: staff.formatted_name || staff.name
        }));
        
        // Add "All Staff" option
        const allStaffOptions = ['All Staff', ...staffOptions.map(s => s.name)];
        console.log('👥 Staff dropdown options:', allStaffOptions);
        setStaffMembers(allStaffOptions);
      }
    } else {
      console.error('❌ Staff list API failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error fetching staff list:', error);
    // Fallback options
    setStaffMembers(['All Staff']);
  }
};

  const fetchReportsData = async () => {
  setIsLoadingData(true);
  try {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role')?.toLowerCase();
    
    // Convert month name to month number
    const monthObj = months.find(m => m.name === month);
    const monthValue = monthObj ? monthObj.value : new Date().getMonth() + 1;
    
    // Get staff ID if a specific staff is selected
    const selectedStaffId = staff === 'All Staff' ? 'all' : staffId;
    
    // CHANGE THIS: Use different endpoints based on role
    let apiEndpoint = '';
    if (userRole === 'hod') {
      apiEndpoint = '/api/get-hod-reports-data/';
    } else {
      apiEndpoint = '/api/get-user-role-reports/';
    }
    
    const params = new URLSearchParams({
      year: year,
      month: monthValue.toString(),
      staff_id: selectedStaffId
    });
    
    console.log(`📊 Fetching reports from: ${apiEndpoint}?${params}`);
    console.log(`👤 User role: ${userRole}, Department: ${user.department}`);
    
    const response = await fetch(`${apiEndpoint}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Reports API response:', data);
      
      if (data.status) {
        setReportsData({
          totalOutings: data.data.summary.totalOutings,
          approved: data.data.summary.approved,
          pending: data.data.summary.pending,
          rejected: data.data.summary.rejected,
          monthlyData: data.data.monthlyData || [],
          staffOutings: data.data.staffOutings || data.data.departmentsData || []
        });
        
        // If staff list is returned, update dropdown
        if (data.data.staffList && userRole === 'hod') {
          const staffOptions = data.data.staffList
            .filter(staff => staff.id !== 'all')
            .map(staff => staff.name || staff.formatted_name || staff.value);
          setStaffMembers(['All Staff', ...staffOptions]);
        }
      } else {
        console.error('❌ API returned false status:', data.message);
      }
    } else {
      console.error('❌ API request failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error fetching reports data:', error);
  } finally {
    setIsLoadingData(false);
  }
};

  // Fetch reports when filters change
  useEffect(() => {
    if (user.empid && years.length > 0) {
      fetchReportsData();
    }
  }, [year, month, staff, staffId]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleNavClick = useCallback((tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    
    if (tab === 'dashboard') {
      navigate('/admin');
    } else if (tab === 'request-form') {
      navigate('/request-form');
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setLoading(true);
    localStorage.removeItem('empid');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('department');
    localStorage.removeItem('token');
    
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
        department: user.department || ''
      }
    });
    setActiveTab('change-password');
    setSidebarOpen(false);
  }, [navigate, user.empid, user.email, user.name, user.role, user.department]);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleGenerateReport = useCallback(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const handleExportReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const monthObj = months.find(m => m.name === month);
      const monthValue = monthObj ? monthObj.value : new Date().getMonth() + 1;
      const selectedStaffId = staff === 'All Staff' ? 'all' : staffId;
      
      const params = new URLSearchParams({
        year: year,
        month: monthValue.toString(),
        staff_id: selectedStaffId
      });
      
      const response = await fetch(`/api/export-reports-csv/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          // Create and download CSV file
          const blob = new Blob([data.csv_content], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  }, [month, months, staff, staffId, year]);

  const handleStaffChange = useCallback((e) => {
  const selectedName = e.target.value;
  setStaff(selectedName);
  
  console.log(`Selected staff: ${selectedName}`);
  
  // Find the corresponding staff ID
  if (selectedName !== 'All Staff') {
    // Here you need to map the name back to ID
    // You might need to maintain a list of staff with IDs
    // For now, set a dummy ID - you should fix this based on your data structure
    const selectedStaffId = selectedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setStaffId(selectedStaffId);
    console.log(`Mapped to staff ID: ${selectedStaffId}`);
  } else {
    setStaffId('all');
    console.log('Selected: All Staff');
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
            {user.department && (
              <p className="user-department">Dept: {user.department}</p>
            )}
            {user.email && (
              <p className="user-email" title={user.email}>
                {user.email}
              </p>
            )}
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
            className={`nav-item ${activeTab === 'request-form' ? 'active' : ''}`}
            onClick={() => handleNavClick('request-form')}
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
            <h1>Reports & Analytics</h1>
            <p className="welcome-text">View and analyze outing applications and usage summary</p>
            <p className="user-info-small">
              Role: <strong>{user.role}</strong> | 
              ID: <strong>{user.empid || 'Not set'}</strong>
              {user.department && ` | Department: ${user.department}`}
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
          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-card">
              <div className="filter-header">
                <h3>Filter Reports</h3>
                <p>Select Month and year to view your outing application and usage summary</p>
              </div>
              
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Year</label>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="filter-select"
                    disabled={isLoadingData}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Month</label>
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="filter-select"
                    disabled={isLoadingData}
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Staff</label>
                  <select 
                    value={staff} 
                    onChange={handleStaffChange}
                    className="filter-select"
                    disabled={isLoadingData}
                  >
                    {staffMembers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="generate-btn"
                    onClick={handleGenerateReport}
                    disabled={isLoadingData}
                  >
                    {isLoadingData ? 'Loading...' : 'Generate Report'}
                  </button>
                  <button 
                    className="export-btn"
                    onClick={handleExportReport}
                    disabled={isLoadingData}
                  >
                    Export to Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingData ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading reports data...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon total">📊</div>
                  <div className="stat-details">
                    <h4>Total Outings</h4>
                    <div className="stat-number">{reportsData.totalOutings}</div>
                    <p className="stat-subtext">This {month}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon approved">✅</div>
                  <div className="stat-details">
                    <h4>Approved</h4>
                    <div className="stat-number">{reportsData.approved}</div>
                    <p className="stat-subtext">
                      {reportsData.totalOutings > 0 
                        ? `${((reportsData.approved / reportsData.totalOutings) * 100).toFixed(1)}% approval rate`
                        : 'No data'}
                    </p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon pending">⏳</div>
                  <div className="stat-details">
                    <h4>Pending</h4>
                    <div className="stat-number">{reportsData.pending}</div>
                    <p className="stat-subtext">Awaiting approval</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon rejected">❌</div>
                  <div className="stat-details">
                    <h4>Rejected</h4>
                    <div className="stat-number">{reportsData.rejected}</div>
                    <p className="stat-subtext">
                      {reportsData.totalOutings > 0 
                        ? `${((reportsData.rejected / reportsData.totalOutings) * 100).toFixed(1)}% rejection rate`
                        : 'No data'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts and Tables */}
              <div className="reports-grid">
                <div className="chart-card">
                  <div className="card-header">
                    <h3>Monthly Outing Trends</h3>
                    <span className="card-badge">{year}</span>
                  </div>
                  <div className="chart-container">
                    {reportsData.monthlyData.length > 0 ? (
                      <>
                        <div className="bar-chart">
                          {reportsData.monthlyData.map((data, index) => {
                            const maxValue = Math.max(...reportsData.monthlyData.map(d => d.outings));
                            return (
                              <div key={index} className="bar-group">
                                <div className="bar-label">{data.month}</div>
                                <div className="bar-wrapper">
                                  <div 
                                    className="bar approved-bar"
                                    style={{ height: `${(data.approved / maxValue) * 80}%` }}
                                    title={`Approved: ${data.approved}`}
                                  ></div>
                                  <div 
                                    className="bar pending-bar"
                                    style={{ height: `${(data.pending / maxValue) * 80}%` }}
                                    title={`Pending: ${data.pending}`}
                                  ></div>
                                  <div 
                                    className="bar rejected-bar"
                                    style={{ height: `${(data.rejected / maxValue) * 80}%` }}
                                    title={`Rejected: ${data.rejected}`}
                                  ></div>
                                </div>
                                <div className="bar-total">{data.outings}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color approved"></span>
                            <span>Approved</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color pending"></span>
                            <span>Pending</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color rejected"></span>
                            <span>Rejected</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-data-message">
                        No monthly data available for selected filters
                      </div>
                    )}
                  </div>
                </div>

                <div className="table-card">
                  <div className="card-header">
                    <h3>Staff Outing Summary</h3>
                    <span className="card-badge">{staff}</span>
                  </div>
                  <div className="table-container">
                    {reportsData.staffOutings.length > 0 ? (
                      <table className="reports-table">
                        <thead>
                          <tr>
                            <th>Staff Name</th>
                            <th>Department</th>
                            <th>Total</th>
                            <th>Approved</th>
                            <th>Pending</th>
                            <th>Rejected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.staffOutings.map((staffData, index) => (
                            <tr key={index}>
                              <td>{staffData.name}</td>
                              <td>{staffData.department}</td>
                              <td><span className="count-badge total">{staffData.outings}</span></td>
                              <td><span className="count-badge approved">{staffData.approved}</span></td>
                              <td><span className="count-badge pending">{staffData.pending}</span></td>
                              <td><span className="count-badge rejected">{staffData.rejected}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="no-data-message">
                        No staff data available for selected filters
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;