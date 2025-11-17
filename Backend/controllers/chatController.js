// Backend/controllers/chatController.js
const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Message content required" });

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "name email");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
