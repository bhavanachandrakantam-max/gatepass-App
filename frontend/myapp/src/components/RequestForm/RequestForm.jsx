import React, { useState, useEffect } from "react";
import "./RequestForm.css";
import { useNavigate } from "react-router-dom";

const RequestForm = () => {
  const navigate = useNavigate();

  const [minTime, setMinTime] = useState("");

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    date: "",
    purpose: "",
    inTime: "",
    outTime: "",
  });

  // ✅ Set today's date on load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  // ✅ Update min time when picker opens
  const updateMinTime = () => {
    const now = new Date();
    setMinTime(now.toTimeString().slice(0, 5));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "outTime") {
      if (!value) return;

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      // 🚫 Block past time
      if (value < currentTime) {
        alert("Please select a future time ⏳");
        return;
      }

      const [hours, minutes] = value.split(":").map(Number);

      let newHour = hours + 1;
      if (newHour >= 24) newHour -= 24;

      const formattedHour = newHour.toString().padStart(2, "0");
      const newInTime = `${formattedHour}:${minutes
        .toString()
        .padStart(2, "0")}`;

      setFormData({
        ...formData,
        outTime: value,
        inTime: newInTime,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Request Submitted Successfully ✅");

    setFormData({
      employeeName: "",
      employeeId: "",
      department: "",
      date: new Date().toISOString().split("T")[0],
      purpose: "",
      inTime: "",
      outTime: "",
    });
  };

  return (
    <div className="request-container">
      <div className="request-card">
        <button className="back-btn" onClick={() => navigate("/Admin-dashboard")}>
          ← Back to Dashboard
        </button>

        <h2 className="request-title">Gate Pass Slip</h2>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label>Employee Name</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full">
            <label>Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Out Time</label>
            <input
              type="time"
              name="outTime"
              value={formData.outTime}
              min={minTime}
              onFocus={updateMinTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>In Time</label>
            <input
              type="time"
              name="inTime"
              value={formData.inTime}
              readOnly
              required
            />
          </div>

          <button className="submit-btn" type="submit">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
