const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

// Upload a real user-selected image file
exports.uploadAvatarFile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            public_id: `avatar_${user._id}`,
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const upload = await streamUpload();

    user.avatarUrl = upload.secure_url;
    await user.save();

    return res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("Avatar file upload error:", err.message);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};


