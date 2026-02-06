import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/login.css";
import College from "../../assets/svr logo.png";

const Login = () => {
  const [empId, setEmpId] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ MODIFIED: First box accepts letters & numbers, others only numbers
  const handleEmpChange = (value, index) => {
    // For first box (index 0), accept alphanumeric (letters and numbers)
    if (index === 0) {
      // Allow only alphanumeric characters (single character)
      if (!/^[a-zA-Z0-9]?$/.test(value)) return;
    } 
    // For other boxes (index 1, 2, 3), accept only numbers
    else {
      if (!/^\d?$/.test(value)) return;
    }

    const newEmpId = [...empId];
    newEmpId[index] = value.toUpperCase(); // Convert to uppercase for first box
    setEmpId(newEmpId);

    // Auto-focus to next box if value entered
    if (value && index < 3) {
      document.getElementById(`emp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !empId[index] && index > 0) {
      document.getElementById(`emp-${index - 1}`).focus();
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employeeId = empId.join("");

    if (employeeId.length < 4 || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending login request for employee ID:", employeeId);
      
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empid: employeeId,
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      // ✅ OTP FLOW
      if (data.status === "otp") {
        console.log("OTP flow triggered");
        navigate("/otp", { 
          state: { 
            empid: data.empid, 
            email: data.email 
          } 
        });
      }
      // ✅ NORMAL LOGIN
      else if (data.status && data.role) {
        console.log("Login successful! Role:", data.role, "Full data:", data);
        
        localStorage.setItem('empid', employeeId);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.empname || employeeId);
        
        const role = data.role.toLowerCase().trim();
        const dashboardPath = `/${role}-dashboard`;
        
        console.log("Navigating to:", dashboardPath);
        navigate(dashboardPath);
        
      }
      else {
        console.error("Login failed or no role:", data);
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
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
                    disabled={loading}
                    // Add title for first box to indicate it accepts letters
                    title={index === 0 ? "Enter a letter or number" : "Enter a number"}
                    // Optional: Different styling for first box
                    className={index === 0 ? "first-box" : ""}
                  />
                ))}
              </div>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <div className="forgot-password">
                <span
                  style={{ cursor: "pointer", color: "#4338ca" }}
                  onClick={loading ? undefined : handleForgot}
                  className={loading ? "disabled-link" : ""}
                >
                  Forgot Password?
                </span>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;