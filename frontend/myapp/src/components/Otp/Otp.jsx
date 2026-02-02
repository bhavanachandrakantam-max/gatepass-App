import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Otp.css";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return name ? name.substring(0, 2) + "***@" + domain : "";
  };

  const submitOtp = async () => {
    if (!otp || otp.length < 4) {
      alert("Please enter a valid OTP");
      return;
    }

    setLoading(true);

    try {
      console.log("Verifying OTP...");
      const startTime = performance.now();
      
      const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empid: state?.empid, otp }),
      });

      const endTime = performance.now();
      console.log(`OTP verification took ${(endTime - startTime).toFixed(2)}ms`);

      const data = await res.json();

      if (data.status) {
        navigate("/change-password", { state });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server error. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Verify OTP</h2>

        <p>
          An OTP has been sent to{" "}
          <strong>{maskEmail(state?.email)}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          maxLength="6"
        />

        <button onClick={submitOtp} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </div>
    </div>
  );
}