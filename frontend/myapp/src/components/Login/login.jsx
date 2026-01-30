import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/login.css";
import College from "../../assets/svr logo.png";

const Login = () => {
  const [empId, setEmpId] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleEmpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newEmpId = [...empId];
    newEmpId[index] = value;
    setEmpId(newEmpId);

    if (value && index < 3) {
      document.getElementById(`emp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !empId[index] && index > 0) {
      document.getElementById(`emp-${index - 1}`).focus();
    }
  };

  // ✅ FORGOT PASSWORD HANDLER
  const handleForgot = async () => {
    const employeeId = empId.join("");

    if (employeeId.length < 4) {
      alert("Please enter Employee ID first");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empid: employeeId }),
      });

      const data = await res.json();
      console.log(data);

      if (data.status) {
        navigate("/otp", {
          state: { empid: employeeId, email: data.email },
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error");
    }
  };

  // ✅ LOGIN HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const employeeId = empId.join("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empid: employeeId,
          password: password,
        }),
      });

      const data = await res.json();

      // ✅ OTP FLOW
      if (data.status === "otp") {
        navigate("/otp", { state: { empid: data.empid, email: data.email } });
      }
      // ✅ NORMAL LOGIN
      else if (data.status) {
        navigate(`/${data.role}-dashboard`);
      }
      // ❌ ERROR
      else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server error");
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
      <div className="login-card">
        {/* LEFT */}
        <div className="login-left">
          <img src={College} alt="college" />
          <h2>Gate Pass App</h2>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <h1>Welcome</h1>
          <p>Please login to your account</p>

          <form onSubmit={handleSubmit}>
            <h3>Employee ID</h3>
            <br />

            <div className="otp-boxes">
              {empId.map((digit, index) => (
                <input
                  key={index}
                  id={`emp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleEmpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="forgot-password">
              <span
                style={{ cursor: "pointer", color: "#4338ca" }}
                onClick={handleForgot}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
