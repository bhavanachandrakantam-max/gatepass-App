import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./hotp.css";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { state } = useLocation();
  const navigate = useNavigate();
  const hasSentRef = useRef(false);

  console.log("🚀 OTP Component Loaded");
  console.log("📋 Location State:", state);

  // Auto-send OTP on component mount
  // otp1.jsx - Updated useEffect with better cleanup
useEffect(() => {
  console.log("🔄 OTP useEffect triggered");
  
  if (!state?.empid) {
    console.error("❌ No employee ID in state!");
    alert("Session expired. Please go back and try again.");
    navigate('/faculty-dashboard');
    return;
  }

  // Create a cleanup flag
  let isMounted = true;
  
  const sendOtp = async () => {
    if (!hasSentRef.current && isMounted) {
      hasSentRef.current = true;
      await sendOtpOnLoad();
    }
  };

  sendOtp();

  // Cleanup function
  return () => {
    isMounted = false;
  };
}, [state, navigate]);
  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtpOnLoad = async () => {
    console.log("📤 SEND OTP ON LOAD CALLED");
    
    if (!state?.empid) {
      console.error("❌ Cannot send OTP: No empid");
      alert("Employee ID missing");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Sending OTP request for:", state.empid);
      console.log("📧 Email to send:", state.email);

      // Prepare request data
      const requestData = {
        empid: state.empid,
        source: state.source || 'admin-dashboard'
      };

      console.log("📦 Request data:", requestData);

      const response = await fetch(
        "http://127.0.0.1:8000/api/send-otp-for-password-change-ultrafast/",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📥 OTP Response data:", data);
      
      if (data.status) {
        console.log("✅ OTP sent successfully!");
        console.log("📧 Email sent to:", data.email);
        console.log("👤 Name:", data.empname);
        
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown for resend
        alert("✅ OTP has been sent to your registered email!");
      } else {
        console.error("❌ OTP send failed:", data.message);
        alert("❌ Failed to send OTP: " + data.message);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("❌ Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "your registered email";
    const [name, domain] = email.split("@");
    return name ? name.substring(0, 2) + "***@" + domain : email;
  };

  const submitOtp = async () => {
    if (!otp || otp.length < 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    if (!state?.empid) {
      alert("Session expired. Please try again.");
      return;
    }

    setLoading(true);
    console.log("🔐 Verifying OTP:", otp);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/verify-otp-for-password-change-ultrafast/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            empid: state.empid, 
            otp: otp 
          }),
        }
      );

      const data = await response.json();
      console.log("🔐 OTP Verification response:", data);

      if (data.status) {
        console.log("✅ OTP verified successfully!");
        
        // Navigate to change password with all user data
        navigate("/hchange-password", {
          state: {
            ...state,
            empid: state.empid,
            empname: data.empname || state.empname,
            email: data.email || state.email,
            role: data.role || state.role,
            department: data.department || state.department,
            otpVerified: true
          },
        });
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) {
      alert(`Please wait ${countdown} seconds before resending OTP`);
      return;
    }

    console.log("🔄 Resending OTP...");
    await sendOtpOnLoad();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitOtp();
    }
  };

  return (
    <div className="otp-container">
      <button 
      className="back-to-dashboard-btn"
      onClick={() => navigate('/hod-dashboard')} 
      aria-label="Back to Dashboard"
    >
      ← Back to Dashboard
    </button>
      <div className="otp-card">
        <div className="header-section">
          <div className="lock-icon">🔐</div>
          <h2>Verify Identity</h2>
          <p className="subtitle">
            Enter the OTP sent to your registered email
          </p>
        </div>

        {/* User Info Display */}
        

        {/* OTP Status */}
        <div className={`otp-status ${otpSent ? 'success' : 'pending'}`}>
          {loading ? (
            <div className="loading-status">
              <span className="spinner-small"></span>
              Sending OTP...
            </div>
          ) : otpSent ? (
            <div className="success-status">
              <span className="check-icon">✅</span>
              OTP sent successfully!
            </div>
          ) : (
            <div className="pending-status">
              <span className="info-icon">ℹ️</span>
              OTP will be sent automatically...
            </div>
          )}
        </div>

        {/* OTP Input */}
        <div className="otp-input-section">
          <label className="input-label">Enter 6-digit OTP:</label>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            onKeyPress={handleKeyPress}
            disabled={loading || !otpSent}
            maxLength="6"
            className="otp-input"
            autoFocus
          />
          <p className="input-hint">
            Check your email for the 6-digit OTP code
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={submitOtp}
            disabled={loading || !otp || otp.length < 6}
            className="verify-btn"
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

        </div>

        
      </div>
    </div>
  );
}