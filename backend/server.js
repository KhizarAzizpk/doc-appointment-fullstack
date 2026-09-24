// ==========================================================================
// server.js - This is the MAIN file of our backend.
// It starts the Express server, connects to MongoDB, and tells the app
// which routes to use.
// ==========================================================================

// Load the environment variables from the .env file (PORT, MONGO_URI, etc).
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import all our route files.
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Connect to the MongoDB database.
connectDB();

// Create the express app.
const app = express();

// --- Middlewares ---
// cors lets our React frontend (running on a different port) talk to this API.
app.use(cors());
// This lets express read JSON that the frontend sends in the request body.
app.use(express.json());

// A simple test route so we can check the server is running.
app.get("/", (req, res) => {
  res.send("Doctor Appointment API is running...");
});

// --- Connect the routes ---
// Every route inside authRoutes will start with /api/auth, and so on.
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);

// Start the server.
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
module.exports = app;