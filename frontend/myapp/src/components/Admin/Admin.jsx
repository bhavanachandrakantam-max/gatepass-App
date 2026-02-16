import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../Admin/Admin.css';

const Admin = () => {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    role: 'Admin', 
    empid: '',
    email: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState('hourly');
  const [distributionTab, setDistributionTab] = useState('hourly');
  
  // Enhanced stats for faculty outpass per hour
  const [stats, setStats] = useState({
    // Today's outpass stats
    todayTotalOutpass: 47,
    todayApproved: 42,
    todayPending: 3,
    todayRejected: 2,
    todayAvgDuration: '2.5 hrs',
    
    // Hourly breakdown for today
    hourlyOutpass: [
      { hour: '08:00', count: 5, approved: 4, pending: 1, rejected: 0 },
      { hour: '09:00', count: 8, approved: 7, pending: 1, rejected: 0 },
      { hour: '10:00', count: 12, approved: 11, pending: 0, rejected: 1 },
      { hour: '11:00', count: 15, approved: 14, pending: 1, rejected: 0 },
      { hour: '12:00', count: 18, approved: 16, pending: 1, rejected: 1 },
      { hour: '13:00', count: 14, approved: 13, pending: 0, rejected: 1 },
      { hour: '14:00', count: 16, approved: 15, pending: 1, rejected: 0 },
      { hour: '15:00', count: 11, approved: 10, pending: 0, rejected: 1 },
      { hour: '16:00', count: 9, approved: 8, pending: 1, rejected: 0 },
      { hour: '17:00', count: 6, approved: 5, pending: 1, rejected: 0 },
      { hour: '18:00', count: 4, approved: 4, pending: 0, rejected: 0 }
    ],
    
    // Monthly data for different months
    monthlyData: {
      '2024-01': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 20) + 5,
        approved: Math.floor(Math.random() * 15) + 3,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-02': Array.from({ length: 29 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 18) + 6,
        approved: Math.floor(Math.random() * 14) + 4,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-03': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 22) + 7,
        approved: Math.floor(Math.random() * 17) + 5,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-04': Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 21) + 6,
        approved: Math.floor(Math.random() * 16) + 4,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-05': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 23) + 8,
        approved: Math.floor(Math.random() * 18) + 6,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-06': Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 24) + 9,
        approved: Math.floor(Math.random() * 19) + 7,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-07': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 25) + 10,
        approved: Math.floor(Math.random() * 20) + 8,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-08': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 26) + 11,
        approved: Math.floor(Math.random() * 21) + 9,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-09': Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 24) + 10,
        approved: Math.floor(Math.random() * 19) + 8,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-10': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 22) + 9,
        approved: Math.floor(Math.random() * 17) + 7,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-11': Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 20) + 8,
        approved: Math.floor(Math.random() * 15) + 6,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2024-12': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 21) + 7,
        approved: Math.floor(Math.random() * 16) + 5,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2025-01': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 23) + 8,
        approved: Math.floor(Math.random() * 18) + 6,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2025-02': Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 21) + 7,
        approved: Math.floor(Math.random() * 16) + 5,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      })),
      '2025-03': Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        count: Math.floor(Math.random() * 24) + 9,
        approved: Math.floor(Math.random() * 19) + 7,
        pending: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2)
      }))
    },
    
    // Yearly data for different years
    yearlyData: {
      '2023': [
        { month: 'Jan', count: 215, approved: 190, pending: 15, rejected: 10 },
        { month: 'Feb', count: 237, approved: 210, pending: 17, rejected: 10 },
        { month: 'Mar', count: 259, approved: 230, pending: 19, rejected: 10 },
        { month: 'Apr', count: 280, approved: 250, pending: 20, rejected: 10 },
        { month: 'May', count: 312, approved: 280, pending: 22, rejected: 10 },
        { month: 'Jun', count: 326, approved: 295, pending: 21, rejected: 10 },
        { month: 'Jul', count: 348, approved: 315, pending: 23, rejected: 10 },
        { month: 'Aug', count: 360, approved: 330, pending: 20, rejected: 10 },
        { month: 'Sep', count: 315, approved: 285, pending: 20, rejected: 10 },
        { month: 'Oct', count: 282, approved: 255, pending: 17, rejected: 10 },
        { month: 'Nov', count: 268, approved: 240, pending: 18, rejected: 10 },
        { month: 'Dec', count: 285, approved: 260, pending: 15, rejected: 10 }
      ],
      '2024': [
        { month: 'Jan', count: 245, approved: 210, pending: 20, rejected: 15 },
        { month: 'Feb', count: 267, approved: 230, pending: 22, rejected: 15 },
        { month: 'Mar', count: 289, approved: 250, pending: 24, rejected: 15 },
        { month: 'Apr', count: 310, approved: 270, pending: 25, rejected: 15 },
        { month: 'May', count: 342, approved: 300, pending: 27, rejected: 15 },
        { month: 'Jun', count: 356, approved: 315, pending: 26, rejected: 15 },
        { month: 'Jul', count: 378, approved: 335, pending: 28, rejected: 15 },
        { month: 'Aug', count: 390, approved: 350, pending: 25, rejected: 15 },
        { month: 'Sep', count: 345, approved: 305, pending: 25, rejected: 15 },
        { month: 'Oct', count: 312, approved: 275, pending: 22, rejected: 15 },
        { month: 'Nov', count: 298, approved: 260, pending: 23, rejected: 15 },
        { month: 'Dec', count: 315, approved: 280, pending: 20, rejected: 15 }
      ],
      '2025': [
        { month: 'Jan', count: 265, approved: 235, pending: 18, rejected: 12 },
        { month: 'Feb', count: 287, approved: 255, pending: 20, rejected: 12 },
        { month: 'Mar', count: 309, approved: 275, pending: 22, rejected: 12 },
        { month: 'Apr', count: 330, approved: 295, pending: 23, rejected: 12 },
        { month: 'May', count: 362, approved: 325, pending: 25, rejected: 12 },
        { month: 'Jun', count: 376, approved: 340, pending: 24, rejected: 12 },
        { month: 'Jul', count: 398, approved: 360, pending: 26, rejected: 12 },
        { month: 'Aug', count: 410, approved: 375, pending: 23, rejected: 12 },
        { month: 'Sep', count: 365, approved: 330, pending: 23, rejected: 12 },
        { month: 'Oct', count: 332, approved: 300, pending: 20, rejected: 12 },
        { month: 'Nov', count: 318, approved: 285, pending: 21, rejected: 12 },
        { month: 'Dec', count: 335, approved: 305, pending: 18, rejected: 12 }
      ]
    },
    
    // Weekly trend
    weeklyTrend: [
      { day: 'Mon', count: 89 },
      { day: 'Tue', count: 94 },
      { day: 'Wed', count: 102 },
      { day: 'Thu', count: 87 },
      { day: 'Fri', count: 76 },
      { day: 'Sat', count: 23 },
      { day: 'Sun', count: 12 }
    ],
    
    // Peak hours analysis
    peakHours: [
      { hour: '12:00 - 13:00', count: 32, percentage: 18 },
      { hour: '11:00 - 12:00', count: 28, percentage: 16 },
      { hour: '14:00 - 15:00', count: 25, percentage: 14 },
      { hour: '10:00 - 11:00', count: 22, percentage: 12 }
    ],
    
    // Department wise outpass
    departmentWise: [
      { dept: 'Computer Science', count: 28, percentage: 24 },
      { dept: 'Electronics', count: 22, percentage: 19 },
      { dept: 'Mechanical', count: 18, percentage: 15 },
      { dept: 'Civil', count: 15, percentage: 13 },
      { dept: 'Electrical', count: 14, percentage: 12 },
      { dept: 'MBA', count: 12, percentage: 10 },
      { dept: 'Other', count: 8, percentage: 7 }
    ],
    
    // Purpose wise outpass
    purposeWise: [
      { purpose: 'Personal Work', count: 45, percentage: 38 },
      { purpose: 'Medical', count: 28, percentage: 24 },
      { purpose: 'Official Visit', count: 22, percentage: 19 },
      { purpose: 'Emergency', count: 12, percentage: 10 },
      { purpose: 'Other', count: 10, percentage: 9 }
    ],
    
    // Faculty on outpass right now
    currentOutpass: [
      { name: 'Dr. Sharma', dept: 'CSE', from: '10:30', to: '15:00', reason: 'Personal', status: 'approved' },
      { name: 'Prof. Patel', dept: 'ECE', from: '11:15', to: '16:30', reason: 'Medical', status: 'approved' },
      { name: 'Dr. Reddy', dept: 'Mech', from: '13:00', to: '17:00', reason: 'Official', status: 'approved' },
      { name: 'Prof. Kumar', dept: 'Civil', from: '14:30', to: '18:00', reason: 'Personal', status: 'pending' }
    ],
    
    // Recent outpass requests
    recentRequests: [
      { 
        id: 'REQ001',
        name: 'Dr. Anjali Desai', 
        dept: 'Computer Science',
        time: '10:23 AM',
        from: '11:30',
        to: '15:00',
        reason: 'Medical appointment',
        status: 'pending'
      },
      { 
        id: 'REQ002',
        name: 'Prof. Ravi Kumar', 
        dept: 'Mathematics',
        time: '09:45 AM',
        from: '14:00',
        to: '17:30',
        reason: 'Personal work',
        status: 'approved'
      },
      { 
        id: 'REQ003',
        name: 'Dr. Suresh Reddy', 
        dept: 'Physics',
        time: '09:12 AM',
        from: '13:00',
        to: '16:00',
        reason: 'Conference',
        status: 'approved'
      },
      { 
        id: 'REQ004',
        name: 'Prof. Meera Singh', 
        dept: 'Chemistry',
        time: '08:55 AM',
        from: '10:00',
        to: '12:30',
        reason: 'Bank work',
        status: 'rejected'
      },
      { 
        id: 'REQ005',
        name: 'Dr. Rajesh Gupta', 
        dept: 'Electronics',
        time: '08:30 AM',
        from: '09:00',
        to: '13:00',
        reason: 'Official visit',
        status: 'approved'
      }
    ],
    
    // System metrics
    avgResponseTime: '2.3 mins',
    approvalRate: '89%',
    peakHourTraffic: '12:00 - 14:00',
    facultyOnOutpass: 4,
    
    // Alerts
    recentAlerts: [
      { severity: 'medium', message: 'Multiple pending approvals in CSE dept', time: '15 min ago' },
      { severity: 'low', message: 'Outpass limit reached for Dr. Sharma', time: '1 hour ago' },
      { severity: 'high', message: 'System slowdown detected', time: '2 hours ago' }
    ]
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: '3 new outpass requests pending approval', time: '5 min ago', read: false },
    { id: 2, message: 'Dr. Sharma has requested extension for outpass', time: '15 min ago', read: false },
    { id: 3, message: 'Weekly outpass report is ready', time: '1 hour ago', read: true }
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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayTotalOutpass: prev.todayTotalOutpass + (Math.random() > 0.7 ? 1 : 0),
        todayPending: Math.max(2, prev.todayPending + (Math.random() > 0.8 ? 1 : -1)),
        facultyOnOutpass: prev.facultyOnOutpass + (Math.random() > 0.8 ? 1 : -1)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.date-picker-container') && 
          !e.target.closest('.month-picker-container') && 
          !e.target.closest('.year-picker-container')) {
        setShowDatePicker(false);
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleViewDetailedAnalytics = useCallback(() => {
    navigate('/admin-reports');
    setActiveTab('reports');
  }, [navigate]);

  const handleApproveRequest = useCallback((id) => {
    alert(`Approving request ${id}`);
  }, []);

  const handleRejectRequest = useCallback((id) => {
    alert(`Rejecting request ${id}`);
  }, []);

  const handleViewFacultyDetails = useCallback((name) => {
    alert(`Viewing details for ${name}`);
  }, []);

  const handleChangePassword = useCallback(() => {
    if (!user.empid) {
      alert("Employee ID not found. Please login again.");
      return;
    }

    navigate('/otp1', {
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

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
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

  const peakHourValue = useMemo(() => {
    return Math.max(...stats.hourlyOutpass.map(h => h.count));
  }, [stats.hourlyOutpass]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const weeklyTotal = useMemo(() => {
    return stats.weeklyTrend.reduce((acc, day) => acc + day.count, 0);
  }, [stats.weeklyTrend]);

  const weeklyAverage = useMemo(() => {
    return Math.round(weeklyTotal / stats.weeklyTrend.length);
  }, [weeklyTotal, stats.weeklyTrend.length]);

  const busiestDay = useMemo(() => {
    const max = Math.max(...stats.weeklyTrend.map(d => d.count));
    const day = stats.weeklyTrend.find(d => d.count === max);
    return { day: day?.day || 'Wed', count: max };
  }, [stats.weeklyTrend]);

  // Get current month data based on selected month and year
  const currentMonthData = useMemo(() => {
    const year = selectedYear;
    const month = String(selectedMonth + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    return stats.monthlyData[key] || stats.monthlyData['2024-01'];
  }, [selectedMonth, selectedYear, stats.monthlyData]);

  const monthlyTotal = useMemo(() => {
    return currentMonthData.reduce((acc, day) => acc + day.count, 0);
  }, [currentMonthData]);

  const monthlyAverage = useMemo(() => {
    return Math.round(monthlyTotal / currentMonthData.length);
  }, [monthlyTotal, currentMonthData]);

  const maxMonthlyValue = useMemo(() => {
    return Math.max(...currentMonthData.map(d => d.count));
  }, [currentMonthData]);

  // Get current year data based on selected year
  const currentYearData = useMemo(() => {
    return stats.yearlyData[selectedYear] || stats.yearlyData['2024'];
  }, [selectedYear, stats.yearlyData]);

  const yearlyTotal = useMemo(() => {
    return currentYearData.reduce((acc, month) => acc + month.count, 0);
  }, [currentYearData]);

  const yearlyAverage = useMemo(() => {
    return Math.round(yearlyTotal / currentYearData.length);
  }, [yearlyTotal, currentYearData]);

  const maxYearlyValue = useMemo(() => {
    return Math.max(...currentYearData.map(d => d.count));
  }, [currentYearData]);

  // Month names for dropdown
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options
  const yearOptions = useMemo(() => {
    return Object.keys(stats.yearlyData).map(Number).sort((a, b) => b - a);
  }, [stats.yearlyData]);

  // Format selected date for display
  const formattedSelectedDate = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, [selectedDate]);

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
            <div className="logo-circle">OP</div>
            <h2>OutPass System</h2>
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
            onClick={() => {
              navigate('/admin-reports');
              setActiveTab('reports');
              setSidebarOpen(false);
            }}
            disabled={loading}
          >
            <span className="nav-icon">📈</span>
            Reports
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
            <h1>Faculty Outpass Dashboard 👋</h1>
            <p className="welcome-text">Monitor faculty outpass requests in real-time</p>
            <p className="user-info-small">
              Role: <strong>{user.role}</strong> | 
              ID: <strong>{user.empid || 'Not set'}</strong>
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
          {/* Key Metrics Row - Faculty Outpass Focus */}
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-icon">🚪</div>
              <div className="metric-content">
                <span className="metric-label">Today's Outpass</span>
                <span className="metric-value">{stats.todayTotalOutpass}</span>
                <span className="metric-sub">Total requests</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <span className="metric-label">Approved</span>
                <span className="metric-value">{stats.todayApproved}</span>
                <span className="metric-trend positive">{Math.round((stats.todayApproved/stats.todayTotalOutpass)*100)}% rate</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <span className="metric-label">Pending</span>
                <span className="metric-value">{stats.todayPending}</span>
                <span className="metric-trend warning">Needs attention</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">👤</div>
              <div className="metric-content">
                <span className="metric-label">On Outpass Now</span>
                <span className="metric-value">{stats.facultyOnOutpass}</span>
                <span className="metric-sub">Faculty members</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="dashboard-main-grid">
            {/* Outpass Distribution Card - Hourly/Monthly/Yearly with Calendar Icons */}
            <div className="card distribution-card">
              <div className="card-header">
                <div>
                  <h3>Outpass Distribution</h3>
                  <div className="subtitle-with-picker">
                    <p className="card-subtitle">
                      {distributionTab === 'hourly' && 'Hourly requests'}
                      {distributionTab === 'monthly' && 'Monthly trend'}
                      {distributionTab === 'yearly' && 'Yearly overview'}
                    </p>
                    
                    {/* Picker Icons - Left Side */}
                    <div className="picker-icons-left">
                      {distributionTab === 'hourly' && (
                        <div className="date-picker-container">
                          <button 
                            className="picker-icon-btn"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            title="Select Date"
                          >
                            📅
                          </button>
                          <span className="selected-date">{formattedSelectedDate}</span>
                          {showDatePicker && (
                            <div className="date-picker-dropdown">
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                  setSelectedDate(e.target.value);
                                  setShowDatePicker(false);
                                }}
                                className="date-picker-input"
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {distributionTab === 'monthly' && (
                        <div className="month-picker-container">
                          <button 
                            className="picker-icon-btn"
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            title="Select Month"
                          >
                            📆
                          </button>
                          <span className="selected-date">
                            {monthNames[selectedMonth]} {selectedYear}
                          </span>
                          {showMonthPicker && (
                            <div className="month-picker-dropdown">
                              <div className="year-selector">
                                <select 
                                  value={selectedYear}
                                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                                  className="year-select"
                                >
                                  {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="month-grid">
                                {monthNames.map((month, index) => (
                                  <button
                                    key={month}
                                    className={`month-option ${selectedMonth === index ? 'active' : ''}`}
                                    onClick={() => {
                                      setSelectedMonth(index);
                                      setShowMonthPicker(false);
                                    }}
                                  >
                                    {month.slice(0, 3)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {distributionTab === 'yearly' && (
                        <div className="year-picker-container">
                          <button 
                            className="picker-icon-btn"
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            title="Select Year"
                          >
                            📊
                          </button>
                          <span className="selected-date">{selectedYear}</span>
                          {showYearPicker && (
                            <div className="year-picker-dropdown">
                              <div className="year-list">
                                {yearOptions.map((year) => (
                                  <button
                                    key={year}
                                    className={`year-option ${selectedYear === year ? 'active' : ''}`}
                                    onClick={() => {
                                      setSelectedYear(year);
                                      setShowYearPicker(false);
                                    }}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tabs - Right Side */}
                <div className="header-tabs">
                  <button 
                    className={`tab-btn ${distributionTab === 'hourly' ? 'active' : ''}`}
                    onClick={() => setDistributionTab('hourly')}
                  >
                    ⏰ Hourly
                  </button>
                  <button 
                    className={`tab-btn ${distributionTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setDistributionTab('monthly')}
                  >
                    📆 Monthly
                  </button>
                  <button 
                    className={`tab-btn ${distributionTab === 'yearly' ? 'active' : ''}`}
                    onClick={() => setDistributionTab('yearly')}
                  >
                    📊 Yearly
                  </button>
                </div>
              </div>
              
              <div className="distribution-content">
                {/* Hourly View */}
                {distributionTab === 'hourly' && (
                  <>
                    <div className="hourly-chart-container">
                      <div className="hourly-bars">
                        {stats.hourlyOutpass.map((hourData, index) => (
                          <div 
                            key={hourData.hour}
                            className="hour-column"
                            onMouseEnter={() => setHoveredHour(hourData)}
                            onMouseLeave={() => setHoveredHour(null)}
                          >
                            <div className="bar-wrapper">
                              <div 
                                className="hour-bar"
                                style={{ 
                                  height: `${(hourData.count / peakHourValue) * 150}px`,
                                  background: `linear-gradient(180deg, ${hourData.count > 15 ? '#4f46e5' : '#818cf8'} 0%, #6366f1 100%)`
                                }}
                              >
                                {hoveredHour?.hour === hourData.hour && (
                                  <div className="bar-tooltip">
                                    <strong>{hourData.hour}</strong>
                                    <span>Total: {hourData.count} requests</span>
                                    <span>✅ Approved: {hourData.approved}</span>
                                    <span>⏳ Pending: {hourData.pending}</span>
                                    <span>❌ Rejected: {hourData.rejected}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="hour-label">{hourData.hour}</span>
                            <span className="hour-count">{hourData.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hourly-stats-summary">
                      <div className="stat-box">
                        <span className="stat-box-label">Peak Hour</span>
                        <span className="stat-box-value">12:00 - 13:00</span>
                        <span className="stat-box-trend">32 requests</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-box-label">Avg Response Time</span>
                        <span className="stat-box-value">{stats.avgResponseTime}</span>
                        <span className="stat-box-trend">Fast</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-box-label">Approval Rate</span>
                        <span className="stat-box-value">{stats.approvalRate}</span>
                        <span className="stat-box-trend positive">+5% vs yesterday</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Monthly View */}
                {distributionTab === 'monthly' && (
                  <>
                    <div className="monthly-stats-header">
                      <div className="trend-stats">
                        <div className="trend-stat">
                          <span className="stat-label">Total This Month</span>
                          <span className="stat-value">{monthlyTotal}</span>
                          <span className="stat-badge">requests</span>
                        </div>
                        <div className="trend-stat">
                          <span className="stat-label">Daily Average</span>
                          <span className="stat-value">{monthlyAverage}</span>
                          <span className="stat-badge">requests/day</span>
                        </div>
                        <div className="trend-stat">
                          <span className="stat-label">Busiest Day</span>
                          <span className="stat-value">Day {currentMonthData.reduce((max, day) => day.count > max.count ? day : max).day}</span>
                          <span className="stat-badge">{currentMonthData.reduce((max, day) => day.count > max.count ? day : max).count} requests</span>
                        </div>
                      </div>
                    </div>

                    <div className="monthly-scroll-container">
                      <div className="monthly-bars">
                        {currentMonthData.map((dayData) => (
                          <div 
                            key={dayData.day} 
                            className="monthly-column"
                            onMouseEnter={() => setHoveredDay(dayData)}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            <div className="monthly-bar-wrapper">
                              <div 
                                className="monthly-bar"
                                style={{ 
                                  height: `${(dayData.count / maxMonthlyValue) * 120}px`,
                                  background: dayData.count > 20 
                                    ? 'linear-gradient(180deg, #4f46e5, #6366f1)' 
                                    : dayData.count > 12 
                                      ? 'linear-gradient(180deg, #8b5cf6, #7c3aed)'
                                      : 'linear-gradient(180deg, #94a3b8, #64748b)'
                                }}
                              >
                                {hoveredDay?.day === dayData.day && (
                                  <div className="monthly-tooltip">
                                    <strong>Day {dayData.day}</strong>
                                    <span>📊 Total: {dayData.count}</span>
                                    <span>✅ Approved: {dayData.approved}</span>
                                    <span>⏳ Pending: {dayData.pending}</span>
                                    <span>❌ Rejected: {dayData.rejected}</span>
                                  </div>
                                )}
                                <span className="bar-value">{dayData.count}</span>
                              </div>
                            </div>
                            <span className="monthly-day">{dayData.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="monthly-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#4f46e5' }}></span>
                        <span className="legend-label">High (&gt;20)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#8b5cf6' }}></span>
                        <span className="legend-label">Medium (12-20)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#94a3b8' }}></span>
                        <span className="legend-label">Low (&lt;12)</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Yearly View */}
                {distributionTab === 'yearly' && (
                  <>
                    <div className="yearly-stats-header">
                      <div className="trend-stats">
                        <div className="trend-stat">
                          <span className="stat-label">Total {selectedYear}</span>
                          <span className="stat-value">{yearlyTotal}</span>
                          <span className="stat-badge">requests</span>
                        </div>
                        <div className="trend-stat">
                          <span className="stat-label">Monthly Average</span>
                          <span className="stat-value">{yearlyAverage}</span>
                          <span className="stat-badge">requests/month</span>
                        </div>
                        <div className="trend-stat">
                          <span className="stat-label">vs {selectedYear - 1}</span>
                          <span className="stat-value positive">+12.5%</span>
                          <span className="stat-badge">growth</span>
                        </div>
                      </div>
                    </div>

                    <div className="yearly-scroll-container">
                      <div className="yearly-bars">
                        {currentYearData.map((monthData) => (
                          <div 
                            key={monthData.month} 
                            className="yearly-column"
                            onMouseEnter={() => setHoveredMonth(monthData)}
                            onMouseLeave={() => setHoveredMonth(null)}
                          >
                            <div className="yearly-bar-wrapper">
                              <div 
                                className="yearly-bar"
                                style={{ 
                                  height: `${(monthData.count / maxYearlyValue) * 150}px`,
                                  background: monthData.count > 350 
                                    ? 'linear-gradient(180deg, #4f46e5, #6366f1)' 
                                    : monthData.count > 300 
                                      ? 'linear-gradient(180deg, #8b5cf6, #7c3aed)'
                                      : 'linear-gradient(180deg, #94a3b8, #64748b)'
                                }}
                              >
                                {hoveredMonth?.month === monthData.month && (
                                  <div className="yearly-tooltip">
                                    <strong>{monthData.month} {selectedYear}</strong>
                                    <span>📊 Total: {monthData.count}</span>
                                    <span>✅ Approved: {monthData.approved}</span>
                                    <span>⏳ Pending: {monthData.pending}</span>
                                    <span>❌ Rejected: {monthData.rejected}</span>
                                  </div>
                                )}
                                <span className="bar-value">{monthData.count}</span>
                              </div>
                            </div>
                            <span className="yearly-month">{monthData.month}</span>
                            <span className="yearly-count">{monthData.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="yearly-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#4f46e5' }}></span>
                        <span className="legend-label">High (&gt;350)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#8b5cf6' }}></span>
                        <span className="legend-label">Medium (300-350)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#94a3b8' }}></span>
                        <span className="legend-label">Low (&lt;300)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Faculty Currently on Outpass */}
            <div className="card current-outpass-card">
              <div className="card-header">
                <div>
                  <h3>Faculty on Outpass</h3>
                  <p className="card-subtitle">Currently away from campus</p>
                </div>
                <span className="live-badge">🟢 {stats.facultyOnOutpass} active</span>
              </div>
              
              <div className="current-outpass-list">
                {stats.currentOutpass.map((faculty, index) => (
                  <div key={index} className="current-outpass-item">
                    <div className="faculty-info">
                      <div className="faculty-avatar">
                        {faculty.name.charAt(0)}
                      </div>
                      <div className="faculty-details">
                        <h4>{faculty.name}</h4>
                        <p className="faculty-dept">{faculty.dept}</p>
                      </div>
                    </div>
                    <div className="outpass-time">
                      <span className="time-label">From</span>
                      <span className="time-value">{faculty.from}</span>
                      <span className="time-label">To</span>
                      <span className="time-value">{faculty.to}</span>
                    </div>
                    <div className="outpass-reason">
                      <span className="reason-badge">{faculty.reason}</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(faculty.status) }}
                      >
                        {faculty.status}
                      </span>
                    </div>
                    <button 
                      className="view-faculty-btn"
                      onClick={() => handleViewFacultyDetails(faculty.name)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="view-all-outpass-btn">
                View All Faculty on Outpass →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Admin);