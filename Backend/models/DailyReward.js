// Backend/models/DailyReward.js
const mongoose = require("mongoose");

const dailyRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastClaimedDate: {
      type: Date,
      required: true,
    },
    streak: {
      type: Number,
      default: 1, // Consecutive days
    },
    totalClaims: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Index for faster queries
dailyRewardSchema.index({ userId: 1, lastClaimedDate: 1 });

// Method to check if user can claim today's reward
dailyRewardSchema.methods.canClaimToday = function () {
  const today = new Date();
  const lastClaimed = new Date(this.lastClaimedDate);
  
  // Reset to start of day for comparison
  today.setHours(0, 0, 0, 0);
  lastClaimed.setHours(0, 0, 0, 0);
  
  return today.getTime() > lastClaimed.getTime();
};

// Method to check if it's a consecutive day
dailyRewardSchema.methods.isConsecutiveDay = function () {
  const today = new Date();
  const lastClaimed = new Date(this.lastClaimedDate);
  
  today.setHours(0, 0, 0, 0);
  lastClaimed.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastClaimed.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1; // Exactly 1 day difference means consecutive
};

module.exports = mongoose.model("DailyReward", dailyRewardSchema);

