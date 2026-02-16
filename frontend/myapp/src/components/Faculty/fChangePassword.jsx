import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./fChangePassword.css";

export default function ChangePassword1() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use refs for performance (no re-renders)
  const previousPasswordRef = useRef("");
  const empidRef = useRef(state?.empid || "");
  const abortControllerRef = useRef(null);

  // Simple validation states
  const [validations, setValidations] = useState({
    length: false,
    notUserId: false,
    notPrevious: true,
    hasLetters: false,
    hasNumbers: false,
    hasBothLettersAndNumbers: false // New validation rule
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: "weak",
    score: 0
  });

  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Fast fetch previous password on mount
  useEffect(() => {
    if (!state?.empid) {
      navigate("/faculty-dashboard");
      return;
    }
    
    empidRef.current = state.empid;
    console.log("🆔 EmpID for password change:", empidRef.current);
    
    // Silent fetch - don't block UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    fetch("http://127.0.0.1:8000/api/get-previous-password/", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empid: state.empid }),
      signal: controller.signal
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("📋 Previous password response:", data);
        if (data.status) {
          previousPasswordRef.current = data.previous_password || "";
          console.log("🔐 Previous password cached:", previousPasswordRef.current ? "***" : "None");
        }
      })
      .catch((err) => {
        console.warn("⚠️ Could not fetch previous password:", err.message);
      })
      .finally(() => clearTimeout(timeoutId));
  }, [state, navigate]);

  // Instant validation on password change
  useEffect(() => {
    if (!newPassword) {
      setValidations({
        length: false,
        notUserId: false,
        notPrevious: true,
        hasLetters: false,
        hasNumbers: false,
        hasBothLettersAndNumbers: false
      });
      setPasswordStrength({ level: "weak", score: 0 });
      return;
    }

    const isPrevious = newPassword === previousPasswordRef.current;
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasBothLettersAndNumbers = hasLetters && hasNumbers;
    
    const validationsObj = {
      length: newPassword.length >= 6,
      notUserId: newPassword !== empidRef.current,
      notPrevious: !isPrevious,
      hasLetters: hasLetters,
      hasNumbers: hasNumbers,
      hasBothLettersAndNumbers: hasBothLettersAndNumbers
    };

    setValidations(validationsObj);

    // Fast strength calculation
    let score = 0;
    if (validationsObj.length) score++;
    if (validationsObj.hasLetters) score++;
    if (validationsObj.hasNumbers) score++;
    if (validationsObj.hasBothLettersAndNumbers) score += 2; // Extra weight for having both
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (validationsObj.notPrevious) score++;

    let level = "weak";
    if (score >= 7) level = "strong";
    else if (score >= 5) level = "good";
    else if (score >= 3) level = "fair";

    setPasswordStrength({ level, score });
  }, [newPassword]);

  // Instant match check
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  // Fast requirement check
  const allRequirementsMet = useMemo(() => {
    return (
      validations.length &&
      validations.notUserId &&
      validations.notPrevious &&
      validations.hasBothLettersAndNumbers && // Changed from hasLetters or hasNumbers
      passwordsMatch
    );
  }, [validations, passwordsMatch]);

  // Lightning-fast submit - UPDATED TO HANDLE SESSION EXPIRATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear messages instantly
    setError("");
    setSuccess("");
    
    // Ultra-fast validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!allRequirementsMet) {
      setError("Please check all requirements");
      return;
    }
    
    setLoading(true);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const startTime = performance.now();
      
      console.log("🚀 Sending password update request...");
      console.log("📤 EmpID:", empidRef.current);
      console.log("🔑 New password length:", newPassword.length);
      console.log("🔐 Confirm password length:", confirmPassword.length);
      
      const response = await fetch("http://127.0.0.1:8000/api/update-password-from-dashboard/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empid: empidRef.current,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      console.log(`⚡ Password update request took ${Math.round(endTime - startTime)}ms`);
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      if (data.status) {
        // Update cache
        previousPasswordRef.current = newPassword;
        
        setSuccess("Password updated successfully!");
        
        // Clear form instantly
        setNewPassword("");
        setConfirmPassword("");
        
        // Show success message for 2 seconds before redirect
        setTimeout(() => navigate("/admin-dashboard"), 2000);
      } else {
        setError(data.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Network error. Please check connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fast handlers
  const handleCancel = () => navigate("/admin-dashboard");
  
  const toggleNewPasswordVisibility = () => setShowNewPassword(p => !p);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(p => !p);
  
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };
  
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="header-section">
          <div className="icon-wrapper">
            <span className="lock-icon">🔐</span>
          </div>
          <h1>Change Password</h1>
          <p className="subtitle">Secure your account with a new password</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="alert-message error">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="alert-message success">
            <div className="alert-icon">✅</div>
            <div className="alert-content">
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="password-form">
          {/* New Password */}
          <div className="form-group">
            <label className="form-label">
              New Password
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="Enter new password"
                disabled={loading || !!success}
                required
                className={`form-input ${
                  newPassword && validations.length && validations.notPrevious && validations.hasBothLettersAndNumbers ? 'valid' : 
                  newPassword && !validations.notPrevious ? 'invalid' : ''
                }`}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleNewPasswordVisibility}
                disabled={loading || !!success}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                <span className="eye-icon">
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </button>
            </div>
            <div className="input-footer">
              <span className={`char-count ${validations.length ? 'valid' : 'invalid'}`}>
                {newPassword.length}/6 characters
              </span>
              {newPassword && !validations.notPrevious && (
                <span className="warning-text">
                  <span className="warning-icon">⚠️</span>
                  This password has been used before
                </span>
              )}
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">
              Confirm Password
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                disabled={loading || !!success}
                required
                className={`form-input ${
                  passwordsMatch && confirmPassword ? 'valid' : 
                  confirmPassword && !passwordsMatch ? 'invalid' : ''
                }`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={loading || !!success}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="eye-icon">
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </button>
            </div>
            <div className="input-footer">
              <span className={`match-status ${passwordsMatch ? 'valid' : 'invalid'}`}>
                {passwordsMatch ? (
                  <>
                    <span className="status-icon">✓</span>
                    Passwords match
                  </>
                ) : (
                  <>
                    <span className="status-icon">✗</span>
                    Passwords don't match
                  </>
                )}
              </span>
            </div>
          </div>
          
          {/* Password Strength */}
          {newPassword && validations.length && validations.notPrevious && (
            <div className="strength-section">
              <div className="strength-header">
                <span className="strength-label">Password Strength</span>
                <span className={`strength-badge ${passwordStrength.level}`}>
                  {passwordStrength.level.toUpperCase()}
                </span>
              </div>
              <div className="strength-meter">
                <div className={`strength-fill ${passwordStrength.level}`} 
                     style={{ width: Math.min(passwordStrength.score * 10, 100) + '%' }} />
              </div>
            </div>
          )}
          
          {/* Requirements */}
          <div className="requirements-section">
            <h3 className="requirements-title">Password Requirements</h3>
            <div className="requirements-grid">
              <div className={`requirement ${validations.length ? 'met' : 'unmet'}`}>
                <div className="requirement-check">
                  {validations.length ? '✓' : '✗'}
                </div>
                <span className="requirement-text">Minimum 6 characters</span>
              </div>
              
              <div className={`requirement ${validations.notUserId ? 'met' : 'unmet'}`}>
                <div className="requirement-check">
                  {validations.notUserId ? '✓' : '✗'}
                </div>
                <span className="requirement-text">Different from Employee ID</span>
              </div>
              
              <div className={`requirement ${validations.notPrevious ? 'met' : 'unmet'}`}>
                <div className="requirement-check">
                  {validations.notPrevious ? '✓' : '✗'}
                </div>
                <span className="requirement-text">Not a previous password</span>
              </div>
              
              <div className={`requirement ${validations.hasBothLettersAndNumbers ? 'met' : 'unmet'}`}>
                <div className="requirement-check">
                  {validations.hasBothLettersAndNumbers ? '✓' : '✗'}
                </div>
                <span className="requirement-text">Contains both letters AND numbers</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !!success || !allRequirementsMet}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Updating Password...
                </>
              ) : success ? (
                <>
                  <span className="check-icon">✓</span>
                  Password Updated
                </>
              ) : (
                "Change Password"
              )}
            </button>
            
            <button 
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {/* Success Redirect */}
          {success && (
            <div className="redirect-notice">
              <div className="redirect-content">
                <span className="redirect-icon">⏳</span>
                <p>Redirecting to dashboard...</p>
              </div>
              <div className="redirect-progress"></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}