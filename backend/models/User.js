// This is the User model. It represents a patient (or the admin/doctor).
// A "model" is like a blueprint that tells MongoDB what fields a user has.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Full name of the patient. Not required at signup, they can add it later
    // in their profile page.
    name: {
      type: String,
      default: "",
    },
    // Mobile number is used to login. It must be unique so two people
    // cannot use the same number.
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    // Password (we save the hashed version, not the real one).
    password: {
      type: String,
      required: true,
    },
    // Extra profile details. These are optional at signup.
    email: {
      type: String,
      default: "",
    },
    age: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    // role is "patient" for normal users and "admin" for the doctor.
    role: {
      type: String,
      default: "patient",
    },
  },
  // timestamps adds createdAt and updatedAt fields automatically.
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
