import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./otp1.css";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(true); // Start as true for immediate feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const otpSentRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Send OTP immediately on page load
  useEffect(() => {
    if (!state?.empid) {
      navigate('/admin-dashboard');
      return;
    }

    if (!otpSentRef.current) {
      sendOtpToUser();
    }
  }, [state, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ULTRA-FAST OTP SEND FUNCTION
  const sendOtpToUser = useCallback(async () => {
    if (sendingOtp) return;
    
    otpSentRef.current = true;
    setSendingOtp(true);
    setError("");
    setSuccess("");

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      // Use ULTRA-FAST endpoint
      const response = await fetch('http://127.0.0.1:8000/api/send-otp-ultrafast/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          empid: state.empid
        }),
        signal: abortControllerRef.current.signal
      });

      // Set loading to false immediately (email sends in background)
      setSendingOtp(false);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status) {
        // Immediate success - email is sending in background
        setSuccess("✓ OTP sent! Check your email.");
        
        // Update state with email
        if (data.email && !state.email) {
          state.email = data.email;
        }
        
        // Auto-focus first input after short delay
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 300);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error sending OTP:', error);
      setError("Network error. Please check connection.");
      setSendingOtp(false);
    }
  }, [state?.empid, sendingOtp]);

  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    setError("");
    setSuccess("");

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // Auto-submit when last digit is entered
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        setTimeout(() => {
          submitOtp(fullOtp);
        }, 150);
      }
    }

    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  // Handle key down events
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 10);
      
      // Auto-submit after a short delay
      setTimeout(() => {
        submitOtp(pastedData);
      }, 150);
    }
  };

  // ULTRA-FAST OTP VERIFICATION
  const submitOtp = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (loading) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      // Use ULTRA-FAST verification endpoint
      const response = await fetch('http://127.0.0.1:8000/api/verify-otp-ultrafast/', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          empid: state.empid, 
          otp: otpValue.trim() 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status) {
        setSuccess("✓ OTP Verified! Redirecting...");
        
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
        }, 800);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        // Clear OTP and focus first input on error
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 50);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("OTP verification error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    navigate("/admin-dashboard");
  };

  // Manual submit button handler
  const handleManualSubmit = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) {
      submitOtp(fullOtp);
    } else {
      setError("Please enter all 6 digits");
    }
  };

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
        {sendingOtp && (
          <div className="sending-otp-message">
            <div className="spinner-small"></div>
            Sending OTP...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <div className="error-actions">
              <button 
                className="retry-btn"
                onClick={sendOtpToUser}
                disabled={sendingOtp}
              >
                Resend OTP
              </button>
            </div>
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
              disabled={loading || !!success || sendingOtp}
              className={`otp-input-box ${digit ? "filled" : ""} ${error ? "error" : ""} ${success ? "success" : ""}`}
              autoFocus={index === 0 && !sendingOtp}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Auto Verify Hint */}
        <div className={`auto-verify-hint ${otp.join("").length === 6 && !loading ? "show" : ""}`}>
          <div className="spinner-small"></div>
          Auto-verifying...
        </div>

        {/* Manual Submit Button */}
        {otp.join("").length === 6 && !loading && !success && (
          <button 
            className="verify-btn"
            onClick={handleManualSubmit}
            disabled={loading}
          >
            Verify OTP
          </button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="verifying-message">
            <div className="spinner"></div>
            Verifying OTP...
          </div>
        )}

        {/* Resend OTP Link */}
        {!sendingOtp && !success && !loading && (
          <div className="resend-otp">
            Didn't receive OTP?{" "}
            <button 
              onClick={sendOtpToUser}
              disabled={sendingOtp}
              className="resend-link"
            >
              {sendingOtp ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        )}

        {/* Email Info */}
        {state?.email && (
          <div className="email-info">
            📧 Sent to: {state.email}
          </div>
        )}
      </div>
    </div>
  );
}