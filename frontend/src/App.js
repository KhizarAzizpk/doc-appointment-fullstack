// This is the main App component. It sets up all the pages (routes) and
// shows the Navbar and Footer on every page.
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Booking from "./pages/Booking";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

import { isLoggedIn, isPatient } from "./auth";

// A small wrapper that protects a page so only logged in users can see it.
// If not logged in we send them to the PATIENT login page.
function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  return children;
}

// A stricter wrapper for pages that only a patient may use (like booking).
// The doctor/admin is NOT a patient, so if they are not a logged in patient
// we send them to the patient login page to sign in as a patient first.
function PatientRoute({ children }) {
  if (!isPatient()) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <div>
      <Navbar />

      {/* The main area where each page is shown */}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* These pages need the user to be logged in */}
          <Route
            path="/book"
            element={
              <PatientRoute>
                <Booking />
              </PatientRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <PrivateRoute>
                <MyAppointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* The doctor's area. The Admin page shows its OWN login form
              if the doctor is not logged in yet, so patients and doctor
              never share a login page. */}
          <Route path="/admin" element={<Admin />} />

          {/* If someone types an unknown URL, send them to the home page. */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
