// This is our authentication middleware.
// A middleware is a function that runs BEFORE our route code.
// We use it to check if the request has a valid login token (JWT).
// If it does, we allow the request. If not, we send back an error.
const jwt = require("jsonwebtoken");

// protect: makes sure the user is logged in.
const protect = (req, res, next) => {
  try {
    // The frontend sends the token in the "Authorization" header like:
    // Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token, please login first" });
    }

    // Remove the "Bearer " part to get just the token.
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret key.
    // If the token is fake or expired this will throw an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save the user info on the request so the next function can use it.
    req.user = decoded; // decoded has { id, role }
    next(); // move on to the actual route
  } catch (error) {
    return res.status(401).json({ message: "Invalid token, please login again" });
  }
};

// adminOnly: makes sure the logged in user is the admin (doctor).
// This must run AFTER protect so req.user already exists.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Only admin can do this" });
  }
};

module.exports = { protect, adminOnly };
