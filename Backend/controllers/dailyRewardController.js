// Backend/controllers/dailyRewardController.js
const DailyReward = require("../models/DailyReward");
const User = require("../models/User");

// Claim daily login reward
exports.claimDailyReward = async (req, res) => {
  try {
    const userId = req.user._id;
    const REWARD_AMOUNT = 10;

    // Find or create daily reward record
    let dailyReward = await DailyReward.findOne({ userId });

    if (!dailyReward) {
      // First time claiming - create new record
      dailyReward = await DailyReward.create({
        userId,
        lastClaimedDate: new Date(),
        streak: 1,
        totalClaims: 1,
      });

      // Add credits to user
      const user = await User.findById(userId);
      user.credits = (user.credits || 0) + REWARD_AMOUNT;
      await user.save();

      return res.json({
        success: true,
        claimed: true,
        credits: REWARD_AMOUNT,
        newBalance: user.credits,
        streak: 1,
        message: "Daily reward claimed! You received 10 credits.",
      });
    }

    // Check if user can claim today
    if (!dailyReward.canClaimToday()) {
      return res.json({
        success: true,
        claimed: false,
        message: "You've already claimed your daily reward today!",
        nextClaimDate: dailyReward.lastClaimedDate,
      });
    }

    // Check if it's a consecutive day (streak)
    const isConsecutive = dailyReward.isConsecutiveDay();
    const newStreak = isConsecutive ? dailyReward.streak + 1 : 1;

    // Update daily reward record
    dailyReward.lastClaimedDate = new Date();
    dailyReward.streak = newStreak;
    dailyReward.totalClaims += 1;
    await dailyReward.save();

    // Add credits to user
    const user = await User.findById(userId);
    user.credits = (user.credits || 0) + REWARD_AMOUNT;
    await user.save();

    res.json({
      success: true,
      claimed: true,
      credits: REWARD_AMOUNT,
      newBalance: user.credits,
      streak: newStreak,
      isConsecutive,
      message: isConsecutive
        ? `Daily reward claimed! ${REWARD_AMOUNT} credits added. Streak: ${newStreak} days! 🔥`
        : `Daily reward claimed! ${REWARD_AMOUNT} credits added.`,
    });
  } catch (err) {
    console.error("Error claiming daily reward:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get daily reward status (check if can claim)
exports.getDailyRewardStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const dailyReward = await DailyReward.findOne({ userId });

    if (!dailyReward) {
      return res.json({
        canClaim: true,
        streak: 0,
        message: "Claim your first daily reward!",
      });
    }

    const canClaim = dailyReward.canClaimToday();

    res.json({
      canClaim,
      streak: dailyReward.streak,
      lastClaimedDate: dailyReward.lastClaimedDate,
      totalClaims: dailyReward.totalClaims,
      message: canClaim
        ? "You can claim your daily reward!"
        : "You've already claimed today's reward.",
    });
  } catch (err) {
    console.error("Error getting daily reward status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

