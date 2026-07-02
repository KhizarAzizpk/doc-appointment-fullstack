// This route just sends the doctor's details to the frontend so the
// landing page can show them. The details come from data/doctor.js.
const express = require("express");
const router = express.Router();
const doctor = require("../data/doctor");

// GET /api/doctor  -> get the doctor details (public, anyone can see)
router.get("/", (req, res) => {
  res.json(doctor);
});

module.exports = router;
