const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/friendController");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getPendingRequests,
  getUserProfile,
  removeFriend,
} = require("../controllers/friendController");
const protect = require("../middleware/authMiddleware"); // ✅ fixed import
router.get("/search/:query", protect, searchUsers);
router.get("/profile/:userId", protect, getUserProfile);
router.post("/send/:receiverId", protect, sendRequest);

router.post("/accept/:requestId", protect, acceptRequest);
router.post("/reject/:requestId", protect, rejectRequest);
router.delete("/remove/:friendId", protect, removeFriend);
router.get("/", protect, getFriends);
router.get("/pending", protect, getPendingRequests);

module.exports = router;
