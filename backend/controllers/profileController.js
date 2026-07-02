// This controller handles the patient's profile page.
// The patient can view and update their profile details here.
const User = require("../models/User");

// ---------------------------------------------------------------------------
// GET PROFILE  ->  GET /api/profile
// Returns the logged in user's profile. We know who the user is from the
// token (req.user.id is set by the protect middleware).
// ---------------------------------------------------------------------------
const getProfile = async (req, res) => {
  try {
    // .select("-password") means "give me everything EXCEPT the password".
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------------------------------------------------------
// UPDATE PROFILE  ->  PUT /api/profile
// The patient updates their details (name, email, age, gender, address).
// These details are reused when booking future appointments.
// ---------------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
    const { name, email, age, gender, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the fields. If a field was not sent we keep the old value.
    user.name = name !== undefined ? name : user.name;
    user.email = email !== undefined ? email : user.email;
    user.age = age !== undefined ? age : user.age;
    user.gender = gender !== undefined ? gender : user.gender;
    user.address = address !== undefined ? address : user.address;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        age: user.age,
        gender: user.gender,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getProfile, updateProfile };
