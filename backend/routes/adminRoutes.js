// These are the admin (doctor) routes.
// Most of them need the user to be logged in AND be the admin,
// so we use both "protect" and "adminOnly" middlewares.
const express = require("express");
const router = express.Router();
const {
  getAllAppointments,
  updateAppointmentStatus,
  getAvailability,
  updateAvailability,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/admin/appointments      -> see all appointments (admin only)
router.get("/appointments", protect, adminOnly, getAllAppointments);

// PUT /api/admin/appointments/:id   -> update an appointment status (admin only)
router.put("/appointments/:id", protect, adminOnly, updateAppointmentStatus);

// GET /api/admin/availability       -> get availability (this one is PUBLIC so
//                                      patients can see the slots when booking)
router.get("/availability", getAvailability);

// PUT /api/admin/availability       -> set availability (admin only)
router.put("/availability", protect, adminOnly, updateAvailability);

module.exports = router;
