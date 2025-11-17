let ioInstance;

module.exports = {
  init(io) {
    ioInstance = io;
  },
  getIo() { // ✅ renamed to match controller usage
    if (!ioInstance) {
      throw new Error("Socket.IO not initialized!");
    }
    return ioInstance;
  },
};
