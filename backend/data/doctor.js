// ==========================================================================
// DOCTOR DETAILS
// --------------------------------------------------------------------------
// This is the doctor whose clinic the website belongs to.
// It is just placeholder (fake) content so the landing page looks real.
// >>> Your friend can change all of this to the real doctor's info. <<<
// We keep it in one file so it is easy to edit in one place.
// ==========================================================================

const doctor = {
  name: "Dr. Sarah Ahmed",
  specialty: "Cardiologist (Heart Specialist)",
  experience: "12 years of experience",
  // A short about / bio paragraph shown on the landing page.
  about:
    "Dr. Sarah Ahmed is a board-certified cardiologist with over 12 years of experience in diagnosing and treating heart conditions. She is passionate about preventive care and helping her patients live healthier lives. She has treated thousands of patients and is known for her friendly and caring nature.",

  // The doctor's main skills / areas of expertise (shown as a list).
  skills: [
    "Heart Disease Diagnosis",
    "ECG & Echocardiography",
    "Blood Pressure Management",
    "Cholesterol Management",
    "Preventive Heart Care",
    "Cardiac Rehabilitation",
  ],

  // Clinic details shown on the landing page.
  clinic: {
    name: "HeartCare Clinic",
    address: "123 Main Street, Gulberg, Lahore, Pakistan",
    phone: "+92 300 1234567",
    email: "info@heartcareclinic.com",
    timings: "Monday to Saturday, 9:00 AM to 5:00 PM",
  },

  // Banner image shown at the top of the landing page.
  // This is a free stock image from unsplash (needs internet to load).
  bannerImage:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",

  // The doctor's photo shown on the landing page.
  doctorImage:
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80",

  // Consultation fee shown on the booking page.
  fee: "PKR 2000",
};

module.exports = doctor;
