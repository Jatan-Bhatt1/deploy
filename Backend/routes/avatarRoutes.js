const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

// Use in-memory storage so we never write to the filesystem (required on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadAvatarFile } = require("../controllers/avatarController");

router.post("/upload", protect, upload.single("avatar"), uploadAvatarFile);

module.exports = router;


