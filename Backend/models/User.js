const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    credits: { type: Number, default: 100 }, // Starting credits for new users
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
