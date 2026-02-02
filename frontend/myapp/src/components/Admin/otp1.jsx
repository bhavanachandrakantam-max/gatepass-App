import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./otp1.css";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const otpSentRef = useRef(false);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Send OTP on page load
  useEffect(() => {
    if (!state?.empid) {
      navigate('/admin-dashboard');
      return;
    }

    if (!otpSentRef.current) {
      sendOtpToUser();
    }
  }, [state, navigate]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Send OTP function
  const sendOtpToUser = async () => {
    otpSentRef.current = true;
    setSendingOtp(true);
    setError("");

    try {
      console.log("Sending OTP to empid:", state.empid);
      
      const response = await fetch('http://127.0.0.1:8000/api/send-otp-for-password-change/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          empid: state.empid
        })
      });

      const responseText = await response.text();
      console.log("OTP send response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid response from server");
      }
      
      if (data.status) {
        // Update state with email from response if available
        if (data.email && !state.email) {
          // Update the state with email
          state.email = data.email;
        }
        setTimer(60); // Reset timer
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(`Error: ${error.message || 'Failed to send OTP. Please try again.'}`);
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when last digit is entered
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        setTimeout(() => {
          submitOtp(fullOtp);
        }, 100);
      }
    }

    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle key down events
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      
      // Focus the last input
      inputRefs.current[5].focus();
      
      // Auto-submit after a short delay
      setTimeout(() => {
        submitOtp(pastedData);
      }, 100);
    }
  };

  // Submit OTP
  const submitOtp = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Verifying OTP for empid:", state.empid);
      
      const endpoint = "http://127.0.0.1:8000/api/verify-otp-for-password-change/";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          empid: state.empid, 
          otp: otpValue.trim() 
        }),
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        setError("Server returned invalid response. Please try again.");
        return;
      }

      if (data.status) {
        setSuccess(data.message || "OTP verified successfully!");
        
        // Navigate to change password page after successful verification
        setTimeout(() => {
          navigate("/change-password1", { 
            state: {
              empid: state.empid,
              username: data.empname || state.username,
              empname: data.empname || state.empname || state.username,
              email: state.email || data.email,
              role: state.role || data.role,
              department: state.department || data.department,
              otpVerified: true
            }
          });
        }, 1000);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        // Clear OTP and focus first input on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  // Auto-submit effect
  useEffect(() => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6 && !loading) {
      submitOtp(fullOtp);
    }
  }, [otp, loading]);

  return (
    <div className="otp-container">
      {/* Back Button */}
      <button 
        className="back-button"
        onClick={handleBackToDashboard}
        disabled={loading}
      >
        <span>←</span>
        Back to Dashboard
      </button>

      <div className="otp-card">
        <h2>
          <span>🔐</span>
          Verify OTP
        </h2>
        
        <p className="subtitle">
          Enter the 6-digit OTP sent to your email
        </p>

        {/* Loading state for OTP sending */}
        {sendingOtp && !error && (
          <div className="sending-otp-message">
            <div className="spinner-small"></div>
            Sending OTP to your email...
          </div>
        )}

        {/* Timer */}
        <div className="timer-container">
          <div className="timer-icon">⏳</div>
          <div className="timer-text">
            OTP expires in: <span>{formatTime(timer)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <button 
              className="retry-btn"
              onClick={sendOtpToUser}
              disabled={sendingOtp}
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="otp-boxes-container" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={loading || !!success || sendingOtp || !!error}
              className={`otp-input-box ${digit ? "filled" : ""} ${error ? "error" : ""} ${success ? "success" : ""}`}
              autoFocus={index === 0 && !sendingOtp}
            />
          ))}
        </div>

        {/* Auto Verify Hint */}
        <div className={`auto-verify-hint ${otp.join("").length === 6 && !loading ? "show" : ""}`}>
          <span>↻</span>
          Auto-verifying OTP...
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="verifying-message">
            <div className="spinner"></div>
            Verifying OTP...
          </div>
        )}
      </div>
    </div>
  );
}