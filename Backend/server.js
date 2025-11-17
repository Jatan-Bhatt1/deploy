const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const friendRoutes = require("./routes/friendRoutes");
const socketStore = require("./sockets/socketStore");

// For Socket.IO
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Load environment variables
// Try root .env first (for local development), then Backend/.env (for Render deployment)
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect MongoDB
connectDB();

const app = express();

// --- MIDDLEWARES ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ▶ ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
// Static assets route removed - all images now served from Cloudinary

// --- ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/avatar", require("./routes/avatarRoutes"));
app.use("/api/friends", friendRoutes);
app.use("/api/messages", require("./routes/chatRoutes"));

// Skills routes (handle creating and listing user skills)
const skillsRoutes = require("./routes/skillsRoutes");
app.use("/api/skills", skillsRoutes);

// Payment routes (credits system)
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

// Daily reward routes
const dailyRewardRoutes = require("./routes/dailyRewardRoutes");
app.use("/api/daily-reward", dailyRewardRoutes);

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Add this line: makes `io` available to all controllers via req.app.get("io")
app.set("io", io);

// Initialize your socket store and attach socket logic
socketStore.init(io);
require("./sockets/chatSocket")(io);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`⚡ Socket.IO server active on port ${PORT}`);
});
