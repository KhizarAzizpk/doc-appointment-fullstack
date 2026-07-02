// The top navigation bar shown on every page.
// It is responsive: on mobile the links collapse into a menu that opens
// when you tap the hamburger (☰) button.
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  // "open" controls whether the mobile menu is showing.
  const [open, setOpen] = useState(false);

  // When the user clicks logout we clear localStorage and go to home.
  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
  };

  // Is the logged in user the admin (doctor)?
  const isAdmin = isLoggedIn() && user && user.role === "admin";
  // Is the logged in user a patient?
  const isPatient = isLoggedIn() && user && user.role !== "admin";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link className="navbar-logo" to="/">
          <span className="logo-icon">🩺</span> HeartCare Clinic
        </Link>

        {/* Hamburger button - only visible on mobile */}
        <button className="nav-toggle" onClick={() => setOpen(!open)}>
          ☰
        </button>

        {/* Clicking any link closes the mobile menu (event bubbles up) */}
        <div
          className={"navbar-links " + (open ? "open" : "")}
          onClick={() => setOpen(false)}
        >
          <Link to="/">Home</Link>

          {/* Admin (doctor) sees only the dashboard link */}
          {isAdmin && <Link to="/admin">Dashboard</Link>}

          {/* Patient links.
              Note: we intentionally do NOT put "Book Appointment" here -
              patients book from the button (CTA) on the landing page. */}
          {isPatient && (
            <>
              <Link to="/my-appointments">My Appointments</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}

          {/* Guests (not logged in) see login + signup.
              NOTE: this is the PATIENT login only. The doctor logs in
              from the /admin page, which is not linked here. */}
          {!isLoggedIn() && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="nav-cta">
                Sign Up
              </Link>
            </>
          )}

          {isLoggedIn() && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
