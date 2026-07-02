// Small helper functions for login state.
// We save the user and token in localStorage so the login is remembered
// even after the page is refreshed.

// Save the user + token after login/signup.
export function saveLogin(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

// Get the currently logged in user (or null if nobody is logged in).
export function getUser() {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user);
  }
  return null;
}

// Check if someone is logged in.
export function isLoggedIn() {
  return localStorage.getItem("token") ? true : false;
}

// Check if the logged in user is a patient (not the doctor/admin).
// Only patients can book appointments, so this is what the booking
// flow checks - being "logged in" is not enough.
export function isPatient() {
  const user = getUser();
  return isLoggedIn() && user && user.role !== "admin";
}

// Logout - remove everything from localStorage.
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
