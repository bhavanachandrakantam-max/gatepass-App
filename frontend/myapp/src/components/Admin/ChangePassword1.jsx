import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChangePassword1.css";

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

  // Real-time validation states
  const [validations, setValidations] = useState({
    length: false,
    notUserId: false,
    notUserName: false,
    hasLetters: false,
    hasNumbers: false,
    hasSymbols: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: "weak",
    score: 0
  });

  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    // Check if user came from OTP verification
    if (!state?.empid) {
      alert("Session expired. Please start the password change process again.");
      navigate("/admin-dashboard");
      return;
    }
    
    console.log("ChangePassword1 received state:", state);
  }, [state, navigate]);

  // Real-time password validation
  useEffect(() => {
    const validatePassword = () => {
      if (!newPassword) {
        setValidations({
          length: false,
          notUserId: false,
          notUserName: false,
          hasLetters: false,
          hasNumbers: false,
          hasSymbols: false
        });
        setPasswordStrength({ level: "weak", score: 0 });
        return;
      }

      // Validation rules
      const validationsObj = {
        length: newPassword.length >= 6,
        notUserId: newPassword !== state.empid,
        notUserName: newPassword.toLowerCase() !== (state.empname || "").toLowerCase(),
        hasLetters: /[a-zA-Z]/.test(newPassword),
        hasNumbers: /[0-9]/.test(newPassword),
        hasSymbols: /[^a-zA-Z0-9]/.test(newPassword)
      };

      setValidations(validationsObj);

      // Calculate password strength
      let score = 0;
      if (validationsObj.length) score += 1;
      if (validationsObj.hasLetters) score += 1;
      if (validationsObj.hasNumbers) score += 1;
      if (validationsObj.hasSymbols) score += 1;
      if (newPassword.length >= 8) score += 1;
      if (newPassword.length >= 12) score += 1;

      let level = "weak";
      if (score >= 5) level = "strong";
      else if (score >= 3) level = "good";
      else if (score >= 2) level = "fair";

      setPasswordStrength({ level, score });
    };

    validatePassword();
  }, [newPassword, state.empid, state.empname]);

  // Check if passwords match
  useEffect(() => {
    if (newPassword && confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [newPassword, confirmPassword]);

  // Validate all requirements
  const allRequirementsMet = useMemo(() => {
    return (
      validations.length &&
      validations.notUserId &&
      validations.notUserName &&
      (validations.hasLetters || validations.hasNumbers || validations.hasSymbols)
    );
  }, [validations]);

  // Fast password change with minimal validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError("");
    setSuccess("");
    
    // Quick validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    
    if (!validations.notUserId) {
      setError("Password cannot be same as your Employee ID");
      return;
    }
    
    if (!validations.notUserName) {
      setError("Password cannot be same as your name");
      return;
    }
    
    // Ensure at least letters or numbers
    if (!validations.hasLetters && !validations.hasNumbers) {
      setError("Password must contain at least letters or numbers");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Updating password for empid:", state.empid);
      
      // Use FormData for faster processing
      const formData = new FormData();
      formData.append('empid', state.empid);
      formData.append('new_password', newPassword);
      formData.append('confirm_password', confirmPassword);
      
      const response = await fetch("http://127.0.0.1:8000/api/update-password-from-dashboard/", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      console.log("Password update response:", data);
      
      if (data.status) {
        setSuccess(data.message || "Password updated successfully!");
        
        // Clear form immediately
        setNewPassword("");
        setConfirmPassword("");
        
        // Fast redirect - reduced from 2 seconds to 1 second
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin-dashboard");
  }, [navigate]);

  // Toggle password visibility
  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>
          <span>🔐</span>
          Change Password
        </h2>
        
        {/* User Info */}
        <div className="user-info">
          <div className="user-details">
            <div className="user-detail-item">
              <span className="detail-label">Employee</span>
              <span className="detail-value">{state?.empname || state?.username || "N/A"}</span>
            </div>
            <div className="user-detail-item">
              <span className="detail-label">ID</span>
              <span className="detail-value">{state?.empid || "N/A"}</span>
            </div>
            {state?.email && (
              <div className="user-detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{state.email}</span>
              </div>
            )}
            {state?.role && (
              <div className="user-detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">{state.role}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ animation: "shake 0.5s ease" }}>
            <span>⚠️</span>
            {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="success-message">
            <span>✅</span>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="password-form">
          {/* New Password */}
          <div className="input-group">
            <label htmlFor="newPassword" className="input-label">
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter new password (min. 6 characters)"
                disabled={loading || !!success}
                required
                className={`password-input ${validations.length && passwordsMatch ? 'valid' : newPassword ? 'invalid' : ''}`}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleNewPasswordVisibility}
                disabled={loading || !!success}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className={`char-counter ${validations.length ? 'valid' : 'invalid'}`}>
              {newPassword.length}/6 characters
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Re-enter new password"
                disabled={loading || !!success}
                required
                className={`password-input ${passwordsMatch && confirmPassword ? 'valid' : confirmPassword ? 'invalid' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
                disabled={loading || !!success}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className={`match-indicator ${confirmPassword ? 'show' : ''} ${passwordsMatch ? 'matching' : 'not-matching'}`}>
              {passwordsMatch ? (
                <>
                  <span>✓</span>
                  Passwords match
                </>
              ) : (
                <>
                  <span>✗</span>
                  Passwords don't match
                </>
              )}
            </div>
          </div>
          
          {/* Password Strength */}
          {newPassword && (
            <div className="strength-indicator">
              <div className="strength-label">
                <span>Password Strength</span>
                <span className={`strength-value ${passwordStrength.level}`}>
                  {passwordStrength.level.toUpperCase()}
                </span>
              </div>
              <div className="strength-bar">
                <div className={`strength-fill ${passwordStrength.level}`} />
              </div>
            </div>
          )}
          
          {/* Password Requirements */}
          <div className="requirements-grid">
            <div className={`requirement-item ${validations.length ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.length ? 'valid' : 'invalid'}`}>
                {validations.length ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.length ? 'valid' : 'invalid'}`}>
                Minimum 6 characters
              </div>
            </div>
            
            <div className={`requirement-item ${validations.notUserId ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.notUserId ? 'valid' : 'invalid'}`}>
                {validations.notUserId ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.notUserId ? 'valid' : 'invalid'}`}>
                Cannot be same as Employee ID ({state.empid})
              </div>
            </div>
            
            <div className={`requirement-item ${validations.notUserName ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.notUserName ? 'valid' : 'invalid'}`}>
                {validations.notUserName ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.notUserName ? 'valid' : 'invalid'}`}>
                Cannot be same as your name
              </div>
            </div>
            
            <div className={`requirement-item ${validations.hasLetters ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.hasLetters ? 'valid' : 'invalid'}`}>
                {validations.hasLetters ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.hasLetters ? 'valid' : 'invalid'}`}>
                Contains letters
              </div>
            </div>
            
            <div className={`requirement-item ${validations.hasNumbers ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.hasNumbers ? 'valid' : 'invalid'}`}>
                {validations.hasNumbers ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.hasNumbers ? 'valid' : 'invalid'}`}>
                Contains numbers
              </div>
            </div>
            
            <div className={`requirement-item ${validations.hasSymbols ? 'valid' : 'invalid'}`}>
              <div className={`requirement-icon ${validations.hasSymbols ? 'valid' : 'invalid'}`}>
                {validations.hasSymbols ? '✓' : '✗'}
              </div>
              <div className={`requirement-text ${validations.hasSymbols ? 'valid' : 'invalid'}`}>
                Contains symbols
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="button-group">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !!success || !allRequirementsMet || !passwordsMatch}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Updating...
                </>
              ) : success ? (
                "✓ Updated"
              ) : (
                "Change Password"
              )}
            </button>
            
            <button 
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {/* Success Redirect Message */}
          {success && (
            <div className="success-redirect">
              <p>
                <span>✓</span>
                Password changed successfully! Redirecting...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}