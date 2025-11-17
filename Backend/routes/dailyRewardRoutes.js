// Backend/routes/dailyRewardRoutes.js
const express = require("express");
const router = express.Router();
const {
  claimDailyReward,
  getDailyRewardStatus,
} = require("../controllers/dailyRewardController");
const protect = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.post("/claim", claimDailyReward);
router.get("/status", getDailyRewardStatus);

module.exports = router;

