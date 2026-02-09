import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RequestForm.css';

const RequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug: Log everything on component mount
  useEffect(() => {
    console.log("🚀 REQUESTFORM COMPONENT MOUNTED");
    console.log("📍 location.state:", location.state);
    console.log("📦 location.state type:", typeof location.state);
    console.log("📱 localStorage empid:", localStorage.getItem('empid'));
    console.log("📱 localStorage username:", localStorage.getItem('username'));
    console.log("📱 localStorage department:", localStorage.getItem('department'));
    console.log("📱 localStorage role:", localStorage.getItem('role'));
    console.log("📱 localStorage email:", localStorage.getItem('email'));
  }, []);

  // Get ALL possible data sources
  const getInitialFormData = () => {
    // Priority 1: location.state
    const state = location.state || {};
    
    // Priority 2: localStorage
    const localStorageData = {
      empid: localStorage.getItem('empid') || '',
      username: localStorage.getItem('username') || '',
      department: localStorage.getItem('department') || '',
      role: localStorage.getItem('role') || '',
      email: localStorage.getItem('email') || ''
    };
    
    // Combine with priority: state > localStorage
    const finalEmpid = state.empid || localStorageData.empid || '';
    const finalName = state.empname || state.username || localStorageData.username || '';
    const finalDepartment = state.department || localStorageData.department || '';
    
    console.log("🎯 Final auto-fill data:", {
      empid: finalEmpid,
      name: finalName,
      department: finalDepartment
    });
    
    // Get current time in 24-hour format (HH:MM)
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Default out time: current time or 09:30 if before 9:30 AM
    let defaultOutTime = currentTime;
    if (currentTime < "09:30") {
      defaultOutTime = "09:30";
    } else if (currentTime > "16:30") {
      defaultOutTime = "09:30"; // Next day if after 4:30 PM
    }
    
    // Default in time: 30 minutes after out time, but not after 16:30
    let defaultInTime = addMinutesToTime(defaultOutTime, 30);
    if (defaultInTime > "16:30") {
      defaultInTime = "16:30";
    }
    
    return {
      employeeName: finalName,
      employeeId: finalEmpid,
      department: finalDepartment,
      purpose: '',
      date: new Date().toISOString().split('T')[0],
      outTime: defaultOutTime,
      inTime: defaultInTime,
      visitorName: '',
      visitorPhone: '',
      visitorEmail: '',
      vehicleNumber: '',
      itemsCarrying: '',
      remarks: ''
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Set auto-filled status on mount
  useEffect(() => {
    const hasAutoFilledData = formData.employeeName || formData.employeeId || formData.department;
    if (hasAutoFilledData) {
      setIsAutoFilled(true);
      console.log("✅ Auto-fill status: TRUE");
      console.log("📊 Current formData:", formData);
    }
  }, [formData]);

  // Helper function to add minutes to time
  function addMinutesToTime(time, minutesToAdd) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // Validate time is within allowed range (9:30 AM to 4:30 PM)
  const validateTimeRange = (time, fieldName) => {
    if (!time) return { isValid: true, message: '' };
    
    if (time < "09:30") {
      return { 
        isValid: false, 
        message: `${fieldName} must be 9:30 AM or later` 
      };
    }
    
    if (time > "16:30") {
      return { 
        isValid: false, 
        message: `${fieldName} must be 4:30 PM or earlier` 
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Validate that time is not in the past (for current day)
  const validateNotPastTime = (time) => {
    if (!time) return { isValid: true, message: '' };
    
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Only validate if it's today
    const today = new Date().toISOString().split('T')[0];
    if (formData.date === today && time < currentTime) {
      return { 
        isValid: false, 
        message: 'Cannot select past time for today' 
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Special validation for time fields
    if (name === 'outTime') {
      // Validate out time
      const timeRangeValidation = validateTimeRange(value, 'Out Time');
      const pastTimeValidation = validateNotPastTime(value);
      
      if (!timeRangeValidation.isValid) {
        setError(timeRangeValidation.message);
      } else if (!pastTimeValidation.isValid) {
        setError(pastTimeValidation.message);
      } else {
        setError('');
      }
      
      // Auto-adjust in time if it becomes invalid
      if (value >= newFormData.inTime) {
        const newInTime = addMinutesToTime(value, 30);
        if (newInTime > "16:30") {
          newFormData.inTime = "16:30";
        } else {
          newFormData.inTime = newInTime;
        }
      }
    }
    
    if (name === 'inTime') {
      // Validate in time
      const timeRangeValidation = validateTimeRange(value, 'In Time');
      if (!timeRangeValidation.isValid) {
        setError(timeRangeValidation.message);
      } else {
        setError('');
      }
    }
    
    setFormData(newFormData);
  };

  // Handle date change - reset times if date changes
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    let updatedData = { ...formData, date: newDate };
    
    // If date is today, ensure times are not in past
    if (newDate === today) {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Adjust out time if it's in the past
      if (updatedData.outTime < currentTime) {
        if (currentTime < "09:30") {
          updatedData.outTime = "09:30";
        } else if (currentTime > "16:30") {
          updatedData.outTime = "09:30";
          // If after 4:30 PM, maybe show error
          setError('Office hours are 9:30 AM to 4:30 PM. Please select tomorrow\'s date.');
        } else {
          updatedData.outTime = currentTime;
        }
        
        // Adjust in time accordingly
        let newInTime = addMinutesToTime(updatedData.outTime, 30);
        if (newInTime > "16:30") {
          newInTime = "16:30";
        }
        updatedData.inTime = newInTime;
      }
    } else if (newDate > today) {
      // Future date - reset to default times
      updatedData.outTime = "09:30";
      updatedData.inTime = "09:45"; // 15 minutes after
      setError('');
    }
    
    setFormData(updatedData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    const requiredFields = {
      'employeeName': 'Employee Name',
      'employeeId': 'Employee ID',
      'department': 'Department',
      'purpose': 'Purpose of Visit',
      'outTime': 'Out Time',
      'inTime': 'In Time'
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([key, label]) => {
      if (!formData[key]?.trim()) {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Time validations
    const outTimeValidation = validateTimeRange(formData.outTime, 'Out Time');
    const inTimeValidation = validateTimeRange(formData.inTime, 'In Time');
    const pastTimeValidation = validateNotPastTime(formData.outTime);
    
    if (!outTimeValidation.isValid) {
      setError(outTimeValidation.message);
      setLoading(false);
      return;
    }
    
    if (!inTimeValidation.isValid) {
      setError(inTimeValidation.message);
      setLoading(false);
      return;
    }
    
    if (!pastTimeValidation.isValid) {
      setError(pastTimeValidation.message);
      setLoading(false);
      return;
    }

    // Validate that inTime is after outTime
    if (formData.outTime >= formData.inTime) {
      setError('In Time must be after Out Time');
      setLoading(false);
      return;
    }

    // Validate time difference (minimum 15 minutes, maximum 7 hours)
    const timeDiff = calculateTimeDifference(formData.outTime, formData.inTime);
    if (timeDiff < 15) {
      setError('Minimum time difference should be 15 minutes');
      setLoading(false);
      return;
    }
    
    if (timeDiff > 420) { // 7 hours
      setError('Maximum allowed duration is 7 hours');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        submittedBy: localStorage.getItem('empid') || formData.employeeId,
        submittedRole: localStorage.getItem('role') || '',
        submissionTime: new Date().toISOString(),
        durationMinutes: timeDiff
      };

      console.log("📤 Submitting form data:", submitData);
      
      // Use the new endpoint
      const response = await fetch('http://127.0.0.1:8000/api/create-gate-pass/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      
      if (result.status) {
        alert('✅ Gate pass request submitted successfully!');
        navigate('/admin');
      } else {
        setError(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  // Get min and max time for time inputs
  const getMinTime = () => {
    const today = new Date().toISOString().split('T')[0];
    if (formData.date === today) {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      return `${currentHour}:${currentMinute}`;
    }
    return "09:30";
  };

  const getMaxTime = () => {
    return "16:30";
  };

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <div className="request-form-container">
      <button className="back-button" onClick={handleBack} disabled={loading}>
        ← Back to Dashboard
      </button>

      <div className="form-header">
        <h1>Gate Pass Request Form</h1>
        <p className="form-subtitle">Fill in the details to create a new gate pass</p>
        {isAutoFilled && (
          <div className="prefill-notice success">
            <span>✓ Form auto-filled with your details</span>
            <small> (Name: {formData.employeeName}, ID: {formData.employeeId}, Dept: {formData.department})</small>
          </div>
        )}
        
        <div className="time-restrictions">
          <span>⏰ Office Hours: 9:30 AM to 4:30 PM only</span>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="gate-pass-form">
        <div className="form-section">
          <h2>Employee Information</h2>
          
          <div className="form-group">
            <label htmlFor="employeeName">Employee Name *</label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
              disabled={loading}
              className={formData.employeeName ? 'filled' : ''}
            />
            {formData.employeeName && (
              <div className="field-status">✓ Auto-filled from {location.state?.empname ? 'Admin' : 'localStorage'}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="employeeId">Employee ID *</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter your employee ID"
              required
              disabled={loading}
              className={formData.employeeId ? 'filled' : ''}
            />
            {formData.employeeId && (
              <div className="field-status">✓ Auto-filled from {location.state?.empid ? 'Admin' : 'localStorage'}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter your department"
              required
              disabled={loading}
              className={formData.department ? 'filled' : ''}
            />
            {formData.department && (
              <div className="field-status">✓ Auto-filled from {location.state?.department ? 'Admin' : 'localStorage'}</div>
            )}
            {!formData.department && (
              <div className="field-hint">If not auto-filled, please enter your department</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Visit *</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Describe the purpose of the visit (e.g., Meeting, Delivery, Maintenance)..."
              rows="3"
              required
              disabled={loading}
            />
            <div className="field-hint">Please provide a detailed purpose for the visit</div>
          </div>
        </div>

        <div className="form-section">
          <h2>Visit Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleDateChange}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="field-status">✓ Today's date is pre-selected</div>
            </div>

            <div className="form-group">
              <label htmlFor="outTime">Out Time *</label>
              <input
                type="time"
                id="outTime"
                name="outTime"
                value={formData.outTime}
                onChange={handleInputChange}
                required
                disabled={loading}
                min={getMinTime()}
                max={getMaxTime()}
                step="300" // 5 minute intervals
              />
              <div className="field-hint">
                Select between 9:30 AM - 4:30 PM
                {formData.date === new Date().toISOString().split('T')[0] && " (No past time allowed)"}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="inTime">In Time *</label>
              <input
                type="time"
                id="inTime"
                name="inTime"
                value={formData.inTime}
                onChange={handleInputChange}
                required
                disabled={loading}
                min={formData.outTime}
                max={getMaxTime()}
                step="300" // 5 minute intervals
              />
              <div className="field-hint">
                Select between {formData.outTime || "9:30 AM"} - 4:30 PM
              </div>
              {formData.outTime && formData.inTime && (
                <div className="duration-display">
                  Duration: {calculateTimeDifference(formData.outTime, formData.inTime)} minutes
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-summary">
          <h3>Request Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Employee:</span>
              <span className="summary-value">{formData.employeeName || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Employee ID:</span>
              <span className="summary-value">{formData.employeeId || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Department:</span>
              <span className="summary-value">{formData.department || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{formData.date || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Out Time:</span>
              <span className="summary-value">
                {formData.outTime ? formatTimeDisplay(formData.outTime) : 'Not specified'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">In Time:</span>
              <span className="summary-value">
                {formData.inTime ? formatTimeDisplay(formData.inTime) : 'Not specified'}
              </span>
            </div>
            {formData.outTime && formData.inTime && (
              <div className="summary-item">
                <span className="summary-label">Duration:</span>
                <span className="summary-value">
                  {calculateTimeDifference(formData.outTime, formData.inTime)} minutes
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={handleBack}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function to format time for display (convert 24h to 12h with AM/PM)
const formatTimeDisplay = (time24h) => {
  if (!time24h) return '';
  const [hours, minutes] = time24h.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default RequestForm;