// Backend/controllers/friendController.js
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const Skill = require("../models/Skill");
const socketStore = require("../sockets/socketStore");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      name: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("name email avatarUrl");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!senderId) return res.status(401).json({ message: "Unauthorized" });
    if (receiverId === senderId.toString()) return res.status(400).json({ message: "You cannot add yourself" });

    const existing = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    const newRequest = await FriendRequest.create({ sender: senderId, receiver: receiverId });

    // Emit socket event
    const io = socketStore.getIo();
    if (io) {
      io.to(receiverId.toString()).emit("friendRequestReceived", {
        senderId,
        receiverId,
        request: newRequest,
      });
    }

    res.status(201).json({ message: "Friend request sent successfully", request: newRequest });
  } catch (err) {
    console.error("Error sending friend request:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// Accept request
exports.acceptRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    // Update both users’ friend lists
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.receiver },
    });
    await User.findByIdAndUpdate(request.receiver, {
      $addToSet: { friends: request.sender },
    });
    // 🔹 Emit socket event to both users
    const io = socketStore.getIo();
    if (io) {
      io.to(request.sender.toString()).emit("friendRequestAccepted", { receiverId: request.receiver });
      io.to(request.receiver.toString()).emit("friendRequestAccepted", { senderId: request.sender });
    }

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove friend (unfriend)
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    if (friendId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    // Find the accepted friend request
    const friendRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: friendId, status: "accepted" },
        { sender: friendId, receiver: currentUserId, status: "accepted" },
      ],
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend relationship not found" });
    }

    // Delete the friend request (which removes the friendship)
    await FriendRequest.findByIdAndDelete(friendRequest._id);

    // Emit socket event to notify the other user
    const io = socketStore.getIo();
    if (io) {
      io.to(friendId.toString()).emit("friendRemoved", {
        removedBy: currentUserId,
      });
    }

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get accepted friends
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted friend requests involving the current user
    const acceptedRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name email avatarUrl")
      .populate("receiver", "name email avatarUrl");

    // Extract the friend user objects
    const friends = acceptedRequests.map((request) => {
      if (request.sender._id.toString() === userId.toString()) {
        return {
          _id: request.receiver._id,
          name: request.receiver.name,
          email: request.receiver.email,
          avatarUrl: request.receiver.avatarUrl
        };
      } else {
        return {
          _id: request.sender._id,
          name: request.sender.name,
          email: request.sender.email,
          avatarUrl: request.sender.avatarUrl
        };
      }
    });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get pending requests
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all pending requests where the current user is the receiver
    const pendingRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name email avatarUrl")  // Use 'name' field from User model
      .sort({ createdAt: -1 }); // newest first, optional

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Prevent viewing own profile through this endpoint (use settings endpoint instead)
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Use settings endpoint to view your own profile" });
    }

    const user = await User.findById(userId).select("name email avatarUrl");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    const friendRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: "accepted" },
        { sender: userId, receiver: currentUserId, status: "accepted" },
      ],
    });

    // Check if there's a pending request
    const pendingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: "pending" },
        { sender: userId, receiver: currentUserId, status: "pending" },
      ],
    });

    // Fetch user's skills
    const skills = await Skill.find({ userId: userId })
      .select("name category description experience")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isFriend: !!friendRequest,
      hasPendingRequest: !!pendingRequest,
      requestSentByMe: pendingRequest ? pendingRequest.sender.toString() === currentUserId.toString() : false,
      skills: skills || [],
    });
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ message: err.message });
  }
};

