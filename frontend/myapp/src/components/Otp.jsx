import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Otp.css";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return name.substring(0, 2) + "***@" + domain;
  };

  const submitOtp = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empid: state.empid, otp }),
    });

    const data = await res.json();

    if (data.status) {
      navigate("/change-password", { state });
    } else {
      alert(data.message);
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
        />

        <button onClick={submitOtp}>Verify OTP</button>
      </div>
    </div>
  );
}
