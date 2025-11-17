const User = require("../models/User");
const EnhancedProfile = require("../models/EnhancedProfile");

// Update user settings (name, email, avatar)
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic user fields
    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update enhanced profile
exports.updateEnhancedProfile = async (req, res) => {
  try {
    const { gender, dob, role, phone, education } = req.body;

    // Find or create enhanced profile
    let enhancedProfile = await EnhancedProfile.findOne({ userId: req.user._id });
    
    if (!enhancedProfile) {
      enhancedProfile = new EnhancedProfile({ userId: req.user._id });
    }

    // Update fields
    if (gender !== undefined) enhancedProfile.gender = gender;
    if (dob !== undefined) enhancedProfile.dob = dob ? new Date(dob) : null;
    if (role !== undefined) enhancedProfile.role = role;
    if (phone !== undefined) enhancedProfile.phone = phone;
    if (education !== undefined) enhancedProfile.education = education;

    const savedProfile = await enhancedProfile.save();

    res.json({
      _id: savedProfile.id,
      userId: savedProfile.userId,
      gender: savedProfile.gender,
      dob: savedProfile.dob,
      role: savedProfile.role,
      phone: savedProfile.phone,
      education: savedProfile.education,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get enhanced profile
exports.getEnhancedProfile = async (req, res) => {
  try {
    const enhancedProfile = await EnhancedProfile.findOne({ userId: req.user._id });
    
    if (!enhancedProfile) {
      return res.json({
        _id: null,
        userId: req.user._id,
        gender: null,
        dob: null,
        role: "other",
        phone: null,
        education: null,
      });
    }

    res.json({
      _id: enhancedProfile.id,
      userId: enhancedProfile.userId,
      gender: enhancedProfile.gender,
      dob: enhancedProfile.dob,
      role: enhancedProfile.role,
      phone: enhancedProfile.phone,
      education: enhancedProfile.education,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
