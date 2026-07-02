// A simple footer shown at the bottom of every page.
// The doctor's login is a small link here (the doctor logs in from /admin).
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">🩺 HeartCare Clinic</div>
          <p>© 2026 HeartCare Clinic. Demo project for portfolio purposes.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/login">Patient Login</Link>
          <Link to="/admin">Doctor Login</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
