import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const submit = async () => {
    if (pwd !== cpwd) return alert("Passwords mismatch");

    const res = await fetch("http://127.0.0.1:8000/api/change-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empid: state.empid, password: pwd }),
    });

    const data = await res.json();

    if (data.status) {
      alert("Password Updated");
      navigate("/");
    } else alert(data.message);
  };

  return (
    <>
      <h2>Change Password</h2>
      <input type="password" onChange={(e)=>setPwd(e.target.value)} placeholder="New Password"/>
      <input type="password" onChange={(e)=>setCpwd(e.target.value)} placeholder="Confirm Password"/>
      <button onClick={submit}>Save</button>
    </>
  );
}
