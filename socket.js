let io;

module.exports = {
  socketInit: (httpServer) => {
    io = require("socket.io")(httpServer);
    return io;
  },
  getSokectIO: () => {
    if (!io) {
      throw new Error("Socket not connected");
    } else {
      return io;
    }
  },
};
