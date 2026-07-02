// This controller has the functions the ADMIN (doctor) uses on the /admin page.
// All of these routes are protected so only the admin can use them.
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");

// ---------------------------------------------------------------------------
// GET ALL APPOINTMENTS  ->  GET /api/admin/appointments
// The doctor sees every appointment from every patient.
// ---------------------------------------------------------------------------
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// UPDATE APPOINTMENT STATUS  ->  PUT /api/admin/appointments/:id
// The doctor can mark an appointment as completed or cancelled.
// ---------------------------------------------------------------------------
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Appointment updated", appointment: appointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// GET AVAILABILITY  ->  GET /api/admin/availability
// Returns the doctor's availability (days + time slots).
// This is a PUBLIC route so patients can also see the slots when booking.
// ---------------------------------------------------------------------------
const getAvailability = async (req, res) => {
  try {
    // There is only ever one availability document. If it does not exist yet
    // we create it with the default values from the model.
    let availability = await Availability.findOne();
    if (!availability) {
      availability = await Availability.create({});
    }
    res.json(availability);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// UPDATE AVAILABILITY  ->  PUT /api/admin/availability
// The doctor sets which days and time slots he is available.
// ---------------------------------------------------------------------------
const updateAvailability = async (req, res) => {
  try {
    const { days, slots } = req.body;

    let availability = await Availability.findOne();
    if (!availability) {
      availability = await Availability.create({});
    }

    if (days) {
      availability.days = days;
    }
    if (slots) {
      availability.slots = slots;
    }

    await availability.save();

    res.json({ message: "Availability updated", availability: availability });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getAllAppointments,
  updateAppointmentStatus,
  getAvailability,
  updateAvailability,
};
