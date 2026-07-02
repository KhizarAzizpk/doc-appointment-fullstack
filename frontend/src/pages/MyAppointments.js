// The "My Appointments" page. Shows all appointments the logged in patient
// has booked. For online appointments they can join the google meet call
// once the appointment time is reached.
import React, { useEffect, useState } from "react";
import api from "../api";
import { isTimeReached } from "../utils";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = () => {
    api
      .get("/appointments/my")
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Cancel one of my appointments.
  const handleCancel = async (id) => {
    try {
      await api.put("/appointments/" + id + "/cancel");
      loadAppointments(); // reload the list to show the new status
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Appointments</h2>
        <p>All the appointments you have booked with the doctor.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>You have not booked any appointments yet.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appt) => (
            <div className="appointment-card" key={appt._id}>
              <div className="appt-top">
                <span className="appt-date">📅 {appt.date}</span>
                <span className={"status status-" + appt.status}>
                  {appt.status}
                </span>
              </div>

              <div className="appt-row">
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

              {/* For ONLINE appointments show the google meet link.
                  The join button only works once the time is reached. */}
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
                      🔒 The Google Meet link will be available at your
                      appointment time.
                    </p>
                  )}
                </div>
              )}

              {/* For WALK-IN appointments remind them to visit the clinic. */}
              {appt.type === "walk-in" && appt.status === "booked" && (
                <p className="meet-note">🏥 Please visit the clinic at your time.</p>
              )}

              {/* Let the patient cancel if it is still booked. */}
              {appt.status === "booked" && (
                <div className="appt-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancel(appt._id)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
