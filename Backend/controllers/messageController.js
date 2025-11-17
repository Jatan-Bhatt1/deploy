const Message = require("../models/Message");
const User = require("../models/User");
const socketStore = require("../sockets/socketStore");

// =====================
//  GET /api/messages/:receiverId
// =====================
exports.getMessages = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

// =====================
//  POST /api/messages/:receiverId
// =====================
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.receiverId;

    if (!content || !receiverId) {
      return res.status(400).json({ message: "Missing content or receiverId" });
    }

    // Save message
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // 🔹 Emit live event via Socket.IO
    const io = socketStore.getIo();
    io.to(receiverId.toString()).emit("receiveMessage", {
      senderId: req.user._id,
      content: message.content,
      createdAt: message.createdAt,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// =====================
//  DELETE /api/messages/:receiverId (Clear chat)
// =====================
exports.clearChat = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const userId = req.user._id;

    // Delete all messages between current user and receiver
    const result = await Message.deleteMany({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    });

    res.status(200).json({ 
      message: "Chat cleared successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ message: "Failed to clear chat" });
  }
};
