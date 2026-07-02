// The booking page. A logged in patient picks the appointment type,
// a date and a time slot, then books the appointment.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Booking() {
  const navigate = useNavigate();

  // The availability (days + time slots) set by the doctor.
  const [availability, setAvailability] = useState({ days: [], slots: [] });

  // Form fields.
  const [type, setType] = useState("online"); // "online" or "walk-in"
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  // Load the doctor's availability when the page opens.
  useEffect(() => {
    api
      .get("/admin/availability")
      .then((res) => setAvailability(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Turn a date string like "2026-07-20" into the day name ("Monday" ...).
  const getDayName = (dateString) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const parts = dateString.split("-");
    const dateObject = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
    return dayNames[dateObject.getDay()];
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!date || !time) {
      setMessage("Please select a date and time slot");
      return;
    }

    // Make sure the doctor is available on the day the patient picked.
    const dayName = getDayName(date);
    if (!availability.days.includes(dayName)) {
      setMessage(
        "The doctor is not available on " +
          dayName +
          ". Please choose another date."
      );
      return;
    }

    try {
      await api.post("/appointments", {
        type: type,
        date: date,
        time: time,
        reason: reason,
      });
      navigate("/my-appointments");
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
      <div className="form-container wide">
        <div className="form-icon">📅</div>
        <h2>Book an Appointment</h2>
        <p className="form-note">
          Doctor is available on: {availability.days.join(", ")}
        </p>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleBook}>
          <div className="form-grid">
            <div>
              <label>Appointment Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="online">Online (Google Meet Video Call)</option>
                <option value="walk-in">Walk-in (Visit the Clinic)</option>
              </select>
            </div>

            <div>
              <label>Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label>Select Time Slot</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="">-- Choose a time slot --</option>
                {availability.slots.map((slot, index) => (
                  <option value={slot} key={index}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <label>Reason for Visit (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell the doctor why you are booking"
              ></textarea>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-block">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;
