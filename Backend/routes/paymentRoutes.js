// Backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getBalance,
  sendCredits,
  getPaymentHistory,
  getRecentTransactions,
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.get("/balance", getBalance);
router.post("/send", sendCredits);
router.get("/history", getPaymentHistory);
router.get("/recent", getRecentTransactions);

module.exports = router;

