// This controller handles booking appointments and showing the patient
// their own appointments.
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Availability = require("../models/Availability");
// We read the google meet links from our JSON file.
const meetData = require("../data/meetLinks.json");

// A little helper that turns a date string like "2026-07-20" into the day
// name ("Monday", "Tuesday", ...). We use it to check the doctor is
// available on that day.
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
  const parts = dateString.split("-"); // ["2026", "07", "20"]
  const dateObject = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1, // months start at 0 in JavaScript
    parseInt(parts[2])
  );
  return dayNames[dateObject.getDay()];
};

// A small helper that picks ONE random google meet link from the list.
// (In a real app we would use the Google Meet API, but for this demo we
//  just keep 50 links in a file and pick a random one.)
const getRandomMeetLink = () => {
  const links = meetData.links;
  const randomIndex = Math.floor(Math.random() * links.length);
  return links[randomIndex];
};

// ---------------------------------------------------------------------------
// BOOK APPOINTMENT  ->  POST /api/appointments
// A logged in patient books an appointment (online or walk-in).
// ---------------------------------------------------------------------------
const bookAppointment = async (req, res) => {
  try {
    const { date, time, reason, type } = req.body;

    // Date and time are required to book.
    if (!date || !time) {
      return res.status(400).json({ message: "Please select a date and time" });
    }

    // Only patients can book appointments. The admin (doctor) is not a
    // patient, so we must never store the admin's own name/mobile as the
    // patient on a booking. Block it here - this is the real protection,
    // the frontend also hides booking from the admin.
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "The doctor cannot book an appointment. Please login as a patient.",
      });
    }

    // Check the doctor is actually available on the chosen day and time slot.
    // (This is the real protection - the frontend also checks, but a user
    //  could skip the frontend, so we check here too.)
    const availability = await Availability.findOne();
    if (availability) {
      const dayName = getDayName(date);
      if (!availability.days.includes(dayName)) {
        return res
          .status(400)
          .json({ message: "The doctor is not available on " + dayName });
      }
      if (!availability.slots.includes(time)) {
        return res
          .status(400)
          .json({ message: "That time slot is not available" });
      }
    }

    // Get the patient details to save their name and mobile on the booking.
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // If it is an online appointment we give them a google meet link.
    // For a walk-in (clinic visit) there is no meet link.
    let meetLink = "";
    if (type === "online") {
      meetLink = getRandomMeetLink();
    }

    // Create the appointment in the database.
    const appointment = await Appointment.create({
      patient: patient._id,
      patientName: patient.name,
      patientMobile: patient.mobile,
      date: date,
      time: time,
      reason: reason || "",
      type: type || "online",
      meetLink: meetLink,
      status: "booked",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// MY APPOINTMENTS  ->  GET /api/appointments/my
// Returns all appointments that belong to the logged in patient.
// Newest first.
// ---------------------------------------------------------------------------
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(appointments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// CANCEL MY APPOINTMENT  ->  PUT /api/appointments/:id/cancel
// A patient can cancel one of their own appointments.
// ---------------------------------------------------------------------------
const cancelMyAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Make sure this appointment belongs to the logged in patient.
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "This is not your appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled", appointment: appointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { bookAppointment, getMyAppointments, cancelMyAppointment };
