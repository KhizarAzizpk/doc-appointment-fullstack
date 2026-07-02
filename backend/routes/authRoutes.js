// These are the authentication routes (signup + login).
const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// POST /api/auth/signup  -> create a new patient account
router.post("/signup", signup);

// POST /api/auth/login   -> login (patient with mobile, admin with email)
router.post("/login", login);

module.exports = router;
