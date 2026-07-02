// The PATIENT login page. Patients login with their mobile number + password.
// (The doctor does NOT log in here - the doctor logs in from the /admin page.)
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { saveLogin } from "../auth";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", {
        loginId: mobile,
        password: password,
      });

      // Just in case someone tries an admin account here, keep this page
      // for patients only.
      if (res.data.user.role === "admin") {
        setMessage("Please use the Doctor Login page.");
        return;
      }

      saveLogin(res.data.token, res.data.user);
      navigate("/book");
      window.location.reload();
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Something went wrong");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-container">
        <div className="form-icon">👤</div>
        <h2>Patient Login</h2>
        <p className="form-note">Login with your mobile number to continue.</p>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleLogin}>
          <label>Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter your mobile number"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button type="submit" className="btn-primary btn-block">
            Login
          </button>
        </form>

        <p className="form-bottom">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
