// These are the appointment routes for patients.
// The patient must be logged in for all of them.
const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  cancelMyAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");

// POST /api/appointments        -> book a new appointment
router.post("/", protect, bookAppointment);

// GET  /api/appointments/my     -> get my appointments
router.get("/my", protect, getMyAppointments);

// PUT  /api/appointments/:id/cancel -> cancel my appointment
router.put("/:id/cancel", protect, cancelMyAppointment);

module.exports = router;
