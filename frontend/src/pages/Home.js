// The landing page. It shows the doctor details, skills, clinic info and
// a "Book Appointment" button.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { isPatient } from "../auth";

function Home() {
  const navigate = useNavigate();

  // We store the doctor details we get from the backend here.
  const [doctor, setDoctor] = useState(null);

  // When the page loads, get the doctor details from the API.
  useEffect(() => {
    api
      .get("/doctor")
      .then((res) => setDoctor(res.data))
      .catch((err) => console.log(err));
  }, []);

  // When the user clicks "Book Appointment":
  // Only a logged in PATIENT can book. If they are a patient we take them
  // straight to the booking page. Otherwise (a guest, or the doctor/admin)
  // we send them to the patient login page to sign in as a patient first.
  const handleBookClick = () => {
    if (isPatient()) {
      navigate("/book");
    } else {
      navigate("/login");
    }
  };

  if (!doctor) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div>
      {/* ---------------- Hero / banner ---------------- */}
      <div className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${doctor.bannerImage})` }}
        ></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">🩺 {doctor.clinic.name}</span>
          <h1>{doctor.name}</h1>
          <p className="hero-specialty">{doctor.specialty}</p>
          <p className="hero-exp">{doctor.experience}</p>
          <div className="hero-buttons">
            <button className="btn-white" onClick={handleBookClick}>
              Book an Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Quick stats ---------------- */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-number">5000+</div>
          <div className="stat-label">Happy Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">12+</div>
          <div className="stat-label">Years Experience</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">4.9★</div>
          <div className="stat-label">Patient Rating</div>
        </div>
      </div>

      {/* ---------------- About the doctor ---------------- */}
      <div className="section">
        <div className="about-doctor">
          <img className="doctor-photo" src={doctor.doctorImage} alt="doctor" />
          <div className="about-text">
            <h2>About the Doctor</h2>
            <p>{doctor.about}</p>
            <div className="skills-list">
              {doctor.skills.map((skill, index) => (
                <span className="skill-badge" key={index}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Clinic details + CTA ---------------- */}
      <div className="clinic-section">
        <div className="section">
          <h2 className="section-title">Visit Our Clinic</h2>
          <p className="section-subtitle">
            Book online or walk in - we are here to care for you.
          </p>

          <div className="clinic-grid">
            <div className="clinic-card">
              <div className="clinic-row">
                <span className="clinic-icon">🏥</span>
                <div>
                  <div className="clinic-label">Clinic</div>
                  <div className="clinic-value">{doctor.clinic.name}</div>
                </div>
              </div>
              <div className="clinic-row">
                <span className="clinic-icon">📍</span>
                <div>
                  <div className="clinic-label">Address</div>
                  <div className="clinic-value">{doctor.clinic.address}</div>
                </div>
              </div>
              <div className="clinic-row">
                <span className="clinic-icon">📞</span>
                <div>
                  <div className="clinic-label">Phone</div>
                  <div className="clinic-value">{doctor.clinic.phone}</div>
                </div>
              </div>
              <div className="clinic-row">
                <span className="clinic-icon">✉️</span>
                <div>
                  <div className="clinic-label">Email</div>
                  <div className="clinic-value">{doctor.clinic.email}</div>
                </div>
              </div>
              <div className="clinic-row">
                <span className="clinic-icon">🕒</span>
                <div>
                  <div className="clinic-label">Timings</div>
                  <div className="clinic-value">{doctor.clinic.timings}</div>
                </div>
              </div>
            </div>

            <div className="clinic-cta">
              <h3>Ready to see the doctor?</h3>
              <p>
                Consultation Fee: <b>{doctor.fee}</b>
              </p>
              <p>
                Choose an online video call on Google Meet, or a walk-in visit
                at the clinic.
              </p>
              <button className="btn-white" onClick={handleBookClick}>
                Book an Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
