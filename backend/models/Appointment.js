// This is the Appointment model. Every time a patient books an appointment
// we save one document like this in the database.
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Which patient booked this appointment. We store the patient's user id.
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // We also save the name and mobile at booking time so the admin can
    // see them easily without loading the user every time.
    patientName: {
      type: String,
      default: "",
    },
    patientMobile: {
      type: String,
      default: "",
    },
    // The date of the appointment, saved as a simple string like "2026-07-10".
    date: {
      type: String,
      required: true,
    },
    // The time slot, saved as a string like "10:00 AM".
    time: {
      type: String,
      required: true,
    },
    // Optional reason / notes the patient can type.
    reason: {
      type: String,
      default: "",
    },
    // The type of appointment. It can be:
    //   "online"  -> the patient meets the doctor on a google meet call
    //   "walk-in" -> the patient visits the clinic in person
    type: {
      type: String,
      default: "online",
    },
    // A random google meet link picked when the appointment is booked.
    // This is ONLY used for online appointments. For walk-in appointments
    // it stays empty because the patient comes to the clinic.
    meetLink: {
      type: String,
      default: "",
    },
    // status can be "booked", "completed" or "cancelled".
    status: {
      type: String,
      default: "booked",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
