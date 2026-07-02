// The doctor's area at /admin.
//
// This page is DIFFERENT from the patient login. If the doctor is not
// logged in yet, this page shows its own "Doctor Login" form. Once the
// doctor logs in (with admin@admin.com), it shows the dashboard where the
// doctor can manage appointments and set availability.
import React, { useEffect, useState } from "react";
import api from "../api";
import { getUser, saveLogin } from "../auth";
import { isTimeReached } from "../utils";

// The 7 days of the week for the availability checkboxes.
const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ===========================================================================
// The Doctor Login form (shown when the doctor is not logged in).
// ===========================================================================
function DoctorLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", {
        loginId: email,
        password: password,
      });

      // Only allow admin accounts here.
      if (res.data.user.role !== "admin") {
        setMessage("This login is only for the doctor.");
        return;
      }

      saveLogin(res.data.token, res.data.user);
      onLoggedIn(); // tell the parent to show the dashboard
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
        <div className="form-icon">🩺</div>
        <h2>Doctor Login</h2>
        <p className="form-note">Only the doctor can access this area.</p>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@admin.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button type="submit" className="btn-primary btn-block">
            Login as Doctor
          </button>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// The Dashboard (shown when the doctor IS logged in).
// ===========================================================================
function Dashboard() {
  const [appointments, setAppointments] = useState([]);

  // Availability state.
  const [days, setDays] = useState([]);
  const [slotsText, setSlotsText] = useState(""); // slots as comma separated text
  const [availMessage, setAvailMessage] = useState("");

  const loadAppointments = () => {
    api
      .get("/admin/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.log(err));
  };

  const loadAvailability = () => {
    api
      .get("/admin/availability")
      .then((res) => {
        setDays(res.data.days);
        setSlotsText(res.data.slots.join(", "));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, []);

  // Mark an appointment as completed or cancelled.
  const updateStatus = async (id, status) => {
    try {
      await api.put("/admin/appointments/" + id, { status: status });
      loadAppointments();
    } catch (err) {
      console.log(err);
    }
  };

  // Add or remove a day from the availability list.
  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const saveAvailability = async (e) => {
    e.preventDefault();
    setAvailMessage("");

    const slots = slotsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    try {
      await api.put("/admin/availability", { days: days, slots: slots });
      setAvailMessage("Availability saved!");
    } catch (err) {
      setAvailMessage("Could not save availability");
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div className="admin-header-inner">
          <h2>Doctor Dashboard</h2>
          <p>Manage your appointments and set your availability.</p>
        </div>
      </div>

      <div className="admin-wrap">
        {/* ------------ Availability section ------------ */}
        <div className="admin-box">
          <h3>Set My Availability</h3>
          {availMessage && <p className="success-message">{availMessage}</p>}

          <form onSubmit={saveAvailability}>
            <span className="field-label">Available Days</span>
            <div className="days-checkboxes">
              {ALL_DAYS.map((day) => (
                <label
                  key={day}
                  className={"day-checkbox " + (days.includes(day) ? "checked" : "")}
                >
                  <input
                    type="checkbox"
                    checked={days.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>

            <span className="field-label">Time Slots (separate with commas)</span>
            <input
              type="text"
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              placeholder="10:00 AM, 11:00 AM, 12:00 PM"
            />

            <br />
            <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
              Save Availability
            </button>
          </form>
        </div>

        {/* ------------ Appointments section ------------ */}
        <div className="admin-box">
          <h3>All Appointments ({appointments.length})</h3>

          {appointments.length === 0 && <p>No appointments yet.</p>}

          <div className="admin-grid">
            {appointments.map((appt) => (
              <div className="appointment-card" key={appt._id}>
                <div className="appt-top">
                  <span className="appt-date">👤 {appt.patientName || "N/A"}</span>
                  <span className={"status status-" + appt.status}>
                    {appt.status}
                  </span>
                </div>

                <div className="appt-row">
                  <span className="label">Mobile:</span> {appt.patientMobile}
                </div>
                <div className="appt-row">
                  <span className="label">Date:</span> {appt.date} &nbsp;
                  <span className="label">Time:</span> {appt.time}
                </div>
                <div className="appt-row">
                  <span className="label">Type:</span>{" "}
                  <span className={"type-pill type-" + appt.type}>
                    {appt.type === "online" ? "Online Video" : "Walk-in Clinic"}
                  </span>
                </div>
                {appt.reason && (
                  <div className="appt-row">
                    <span className="label">Reason:</span> {appt.reason}
                  </div>
                )}

                {/* For online appointments show the meet link button.
                    It only works once the appointment time is reached. */}
                {appt.type === "online" && appt.status === "booked" && (
                  <div>
                    {isTimeReached(appt.date, appt.time) ? (
                      <div className="appt-actions">
                        <a
                          href={appt.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-meet"
                        >
                          🎥 Join Google Meet
                        </a>
                      </div>
                    ) : (
                      <p className="meet-note">
                        🔒 Meet link opens at the appointment time.
                      </p>
                    )}
                  </div>
                )}

                {/* Buttons to update the status. */}
                {appt.status === "booked" && (
                  <div className="appt-actions">
                    <button
                      className="btn-primary"
                      onClick={() => updateStatus(appt._id, "completed")}
                    >
                      Mark Completed
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => updateStatus(appt._id, "cancelled")}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// The main Admin component. It decides which of the two to show.
// ===========================================================================
function Admin() {
  const user = getUser();

  // We keep a small state so the page updates after the doctor logs in
  // or logs out, without needing a full page reload.
  const [isAdmin, setIsAdmin] = useState(user && user.role === "admin");

  if (!isAdmin) {
    return <DoctorLogin onLoggedIn={() => setIsAdmin(true)} />;
  }

  return <Dashboard />;
}

export default Admin;
