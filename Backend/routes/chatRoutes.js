// Backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMessages, sendMessage, clearChat } = require("../controllers/messageController");

router.post("/:receiverId", protect, sendMessage);
router.get("/:receiverId", protect, getMessages);
router.delete("/:receiverId", protect, clearChat);

module.exports = router;
