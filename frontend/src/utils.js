// Small helper functions used in more than one page.

// This checks if the appointment time has been reached (so the google meet
// link can be clicked). We only want people to join the call at the right time.
//
// date looks like "2026-07-10" and time looks like "10:00 AM".
// We turn them into a real Date object and compare it with "now".
export function isTimeReached(date, time) {
  try {
    // Split the time like "10:00 AM" into parts.
    const parts = time.split(" "); // ["10:00", "AM"]
    const hm = parts[0].split(":"); // ["10", "00"]
    let hour = parseInt(hm[0]);
    const minute = parseInt(hm[1]);
    const ampm = parts[1];

    // Convert 12 hour time to 24 hour time.
    if (ampm === "PM" && hour !== 12) {
      hour = hour + 12;
    }
    if (ampm === "AM" && hour === 12) {
      hour = 0;
    }

    // date is "2026-07-10" -> [2026, 07, 10]
    const dateParts = date.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // months start at 0 in JS
    const day = parseInt(dateParts[2]);

    const appointmentDate = new Date(year, month, day, hour, minute);
    const now = new Date();

    // Return true if now is at or after the appointment time.
    return now >= appointmentDate;
  } catch (e) {
    // If something goes wrong just allow the link.
    return true;
  }
}
