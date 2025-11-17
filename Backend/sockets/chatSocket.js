// Backend/sockets/chatSocket.js
const activeUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on("connection", (socket) => {
    // When user joins after login
    socket.on("join", (userId) => {
      // Store userId as string for consistent lookup
      const userIdStr = userId.toString();
      activeUsers.set(userIdStr, socket.id);
      // Join a room with userId for targeted messaging
      socket.join(userIdStr);
    });

    // Friend request sent
    socket.on("sendFriendRequest", ({ senderId, receiverId }) => {
      const receiverSocket = activeUsers.get(receiverId.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("friendRequestReceived", { senderId: senderId.toString() });
      }
    });

    // Friend request accepted
    socket.on("acceptFriendRequest", ({ senderId, receiverId }) => {
      const senderSocket = activeUsers.get(senderId.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("friendRequestAccepted", { receiverId: receiverId.toString() });
      }
    });

    // ============ CHAT MESSAGE EVENTS ============
    socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
      // Persist message in MongoDB first
      try {
        const Message = require("../models/Message");
        const savedMessage = await Message.create({ sender: senderId, receiver: receiverId, content });
        
        // Emit to receiver if online (convert IDs to string for consistent lookup)
        const receiverSocket = activeUsers.get(receiverId.toString());
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", { 
            senderId: senderId.toString(), 
            content: savedMessage.content,
            createdAt: savedMessage.createdAt 
          });
        }
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    // When user disconnects
    socket.on("disconnect", () => {
      for (const [userId, id] of activeUsers.entries()) {
        if (id === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
    });
  });
};
