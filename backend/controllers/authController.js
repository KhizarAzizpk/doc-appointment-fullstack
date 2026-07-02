// This controller has the functions for signup and login.
// A "controller" just means the functions that handle the request and
// send back a response.
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// A small helper that creates a JWT token for a user.
// The token holds the user id and role, and expires in 7 days.
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------------------------------------------------------------------
// SIGNUP  ->  POST /api/auth/signup
// A new patient creates an account with a mobile number and password.
// Name is optional (they can add it later in the profile page).
// ---------------------------------------------------------------------------
const signup = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    // Basic validation - mobile and password are required.
    if (!mobile || !password) {
      return res
        .status(400)
        .json({ message: "Mobile number and password are required" });
    }

    // Check if a user with this mobile already exists.
    const existingUser = await User.findOne({ mobile: mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This mobile number is already registered" });
    }

    // Hash (scramble) the password so we never store the real one.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database.
    const user = await User.create({
      name: name || "",
      mobile: mobile,
      password: hashedPassword,
    });

    // Make a login token so the user is logged in right after signup.
    const token = createToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// LOGIN  ->  POST /api/auth/login
// A patient logs in with mobile + password.
// The admin (doctor) logs in with email admin@admin.com + password.
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    // The frontend sends "loginId" which can be a mobile number OR the
    // admin email. We handle both in the same login form.
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res
        .status(400)
        .json({ message: "Please enter your mobile/email and password" });
    }

    // --- Special case: the admin (doctor) ---
    // The admin email is fixed. If the admin does not exist yet we create it
    // the first time with the password they typed. (Simple demo approach.)
    if (loginId === "admin@admin.com") {
      let admin = await User.findOne({ mobile: "admin@admin.com" });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await User.create({
          name: "Dr. Admin",
          mobile: "admin@admin.com", // we reuse the mobile field to store the email
          password: hashedPassword,
          role: "admin",
        });
      }

      // Check the password.
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      const token = createToken(admin);
      return res.json({
        message: "Admin logged in",
        token: token,
        user: {
          id: admin._id,
          name: admin.name,
          mobile: admin.mobile,
          role: admin.role,
        },
      });
    }

    // --- Normal patient login ---
    const user = await User.findOne({ mobile: loginId });
    if (!user) {
      return res.status(400).json({ message: "No account found with this mobile number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = createToken(user);
    res.json({
      message: "Logged in successfully",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { signup, login };
