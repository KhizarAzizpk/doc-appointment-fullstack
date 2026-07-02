// The signup page. A new patient creates an account with mobile + password.
// Name is optional here (they can add it later in their profile).
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { saveLogin } from "../auth";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/signup", {
        name: name,
        mobile: mobile,
        password: password,
      });

      // Save the token and user so they are logged in right away.
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
        <div className="form-icon">✨</div>
        <h2>Create an Account</h2>
        <p className="form-note">
          You only need a mobile number and password to sign up.
        </p>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleSignup}>
          <label>Full Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />

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
            placeholder="Create a password"
          />

          <button type="submit" className="btn-primary btn-block">
            Sign Up
          </button>
        </form>

        <p className="form-bottom">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
