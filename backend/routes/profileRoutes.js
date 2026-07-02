// These are the profile routes. Both need the user to be logged in,
// so we use the "protect" middleware.
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

// GET /api/profile  -> get my profile
router.get("/", protect, getProfile);

// PUT /api/profile  -> update my profile
router.put("/", protect, updateProfile);

module.exports = router;
