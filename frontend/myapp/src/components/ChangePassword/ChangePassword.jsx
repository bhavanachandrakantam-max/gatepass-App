import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { state } = useLocation();
  const navigate = useNavigate();

  const submitPassword = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/change-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empid: state.empid, password }),
    });

    const data = await res.json();

    if (data.status) {
      alert("Password changed successfully");
      navigate("/");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-card">
        <h2>Change Password</h2>
        <p>Create a new secure password</p>

        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={submitPassword}>Update Password</button>
      </div>
    </div>
  );
}
