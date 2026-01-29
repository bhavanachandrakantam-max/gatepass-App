import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const submitOtp = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empid: state.empid, otp }),
    });

    const data = await res.json();

    if (data.status) {
      navigate("/change-password", { state });
    } else alert(data.message);
  };

  return (
    <>
      <h2>Enter OTP</h2>
      <input onChange={(e)=>setOtp(e.target.value)} />
      <button onClick={submitOtp}>Verify</button>
    </>
  );
}
