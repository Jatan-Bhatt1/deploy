const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// Upload a real user-selected image file
exports.uploadAvatarFile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      public_id: `avatar_${user._id}`,
      overwrite: true,
      resource_type: "image",
    });

    user.avatarUrl = upload.secure_url;
    await user.save();

    // Clean up local temp file created by multer
    try { await fs.promises.unlink(req.file.path); } catch {}

    return res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("Avatar file upload error:", err.message);
    // Best-effort cleanup if file exists
    if (req?.file?.path) { try { await fs.promises.unlink(req.file.path); } catch {} }
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};


