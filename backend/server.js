const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log(socket);

  socket.on("message", (msg) => {
    console.log(`Message: ${msg}`);
    io.emit("message", msg); // Broadcast the message
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO Server is running");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
