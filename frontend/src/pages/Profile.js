// The profile page. The patient can view and update their details.
// These details are reused when they book future appointments.
import React, { useEffect, useState } from "react";
import api from "../api";

function Profile() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  // Load the profile when the page opens.
  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const user = res.data;
        setName(user.name || "");
        setMobile(user.mobile || "");
        setEmail(user.email || "");
        setAge(user.age || "");
        setGender(user.gender || "");
        setAddress(user.address || "");
      })
      .catch((err) => console.log(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.put("/profile", {
        name: name,
        email: email,
        age: age,
        gender: gender,
        address: address,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Could not update profile");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-container wide">
        <div className="form-icon">🧑‍⚕️</div>
        <h2>My Profile</h2>
        <p className="form-note">
          Fill in your details. They will be used for your future appointments.
        </p>

        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleUpdate}>
          <div className="form-grid">
            <div>
              <label>Mobile Number (cannot be changed)</label>
              <input type="text" value={mobile} disabled />
            </div>

            <div>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label>Age</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="full-width">
              <label>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-block">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
