// Backend/controllers/paymentController.js
const Payment = require("../models/Payment");
const User = require("../models/User");
const socketStore = require("../sockets/socketStore");

// Get user's credit balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("credits name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ credits: user.credits || 0, name: user.name });
  } catch (err) {
    console.error("Error getting balance:", err);
    res.status(500).json({ message: err.message });
  }
};

// Send credits to another user
exports.sendCredits = async (req, res) => {
  try {
    const { receiverId, amount, description } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!receiverId || !amount) {
      return res.status(400).json({ message: "Receiver ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot send credits to yourself" });
    }

    // Get sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if sender has enough credits
    if ((sender.credits || 0) < amount) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Perform transaction
    sender.credits = (sender.credits || 0) - amount;
    receiver.credits = (receiver.credits || 0) + amount;

    await sender.save();
    await receiver.save();

    // Create payment record
    const payment = await Payment.create({
      sender: senderId,
      receiver: receiverId,
      amount,
      type: "payment",
      status: "completed",
      description: description || `Payment from ${sender.name}`,
    });

    // Emit socket event to receiver for real-time notification
    const io = socketStore.getIo();
    if (io) {
      io.to(receiverId.toString()).emit("creditReceived", {
        senderId: senderId.toString(),
        senderName: sender.name,
        amount,
        newBalance: receiver.credits,
        paymentId: payment._id,
      });
    }

    res.json({
      message: "Credits sent successfully",
      payment: {
        _id: payment._id,
        amount,
        receiver: {
          _id: receiver._id,
          name: receiver.name,
        },
        createdAt: payment.createdAt,
      },
      newBalance: sender.credits,
    });
  } catch (err) {
    console.error("Error sending credits:", err);
    res.status(500).json({ message: err.message || "Failed to send credits" });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query; // 'sent' or 'received' or 'all'

    let query = {};
    if (type === "sent") {
      query = { sender: userId };
    } else if (type === "received") {
      query = { receiver: userId };
    } else {
      query = { $or: [{ sender: userId }, { receiver: userId }] };
    }

    const payments = await Payment.find(query)
      .populate("sender", "name email avatarUrl")
      .populate("receiver", "name email avatarUrl")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      description: payment.description,
      isSent: payment.sender._id.toString() === userId.toString(),
      otherUser: payment.sender._id.toString() === userId.toString()
        ? {
            _id: payment.receiver._id,
            name: payment.receiver.name,
            avatarUrl: payment.receiver.avatarUrl,
          }
        : {
            _id: payment.sender._id,
            name: payment.sender.name,
            avatarUrl: payment.sender.avatarUrl,
          },
      createdAt: payment.createdAt,
    }));

    res.json({ payments: formattedPayments });
  } catch (err) {
    console.error("Error getting payment history:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get recent transactions (for dashboard)
exports.getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name avatarUrl")
      .populate("receiver", "name avatarUrl")
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      amount: payment.amount,
      type: payment.type,
      isSent: payment.sender._id.toString() === userId.toString(),
      otherUser: payment.sender._id.toString() === userId.toString()
        ? {
            _id: payment.receiver._id,
            name: payment.receiver.name,
            avatarUrl: payment.receiver.avatarUrl,
          }
        : {
            _id: payment.sender._id,
            name: payment.sender.name,
            avatarUrl: payment.sender.avatarUrl,
          },
      createdAt: payment.createdAt,
    }));

    res.json({ transactions: formattedPayments });
  } catch (err) {
    console.error("Error getting recent transactions:", err);
    res.status(500).json({ message: err.message });
  }
};

