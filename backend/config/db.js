// This file connects our app to the MongoDB database using mongoose.
const mongoose = require("mongoose");

// A simple function that connects to the database.
// We call this once when the server starts (see server.js).
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
    // If we can't connect to the DB there is no point running the app,
    // so we stop the process.
    process.exit(1);
  }
};

module.exports = connectDB;
