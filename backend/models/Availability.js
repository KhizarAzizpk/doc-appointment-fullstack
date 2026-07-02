// This model stores the doctor's availability (which days and time slots
// he is available for appointments). The admin sets this from the /admin page.
// We only keep ONE availability document in the whole database because there
// is only one doctor.
const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    // Days the doctor is available, for example ["Monday", "Tuesday"].
    days: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    // The time slots the doctor is available, for example ["10:00 AM", "11:00 AM"].
    slots: {
      type: [String],
      default: [
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
