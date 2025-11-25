const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activeSleepers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_sleep_session", (data) => {
    const { ephemeralId, geoCell, chosenRoom, moodSymbol } = data || {};
    const room = chosenRoom || "Global";

    socket.join(room);

    activeSleepers[socket.id] = {
      id: ephemeralId || `EPH-${socket.id}`,
      geo: geoCell || "UN",
      room,
      mood: moodSymbol || "Unknown",
      startTime: new Date(),
    };

    io.to(room).emit("sleep_map_update", getAmbientSleepers(room));
  });

  socket.on("disconnect", () => {
    const sleeper = activeSleepers[socket.id];
    if (sleeper) {
      const room = sleeper.room;
      delete activeSleepers[socket.id];
      io.to(room).emit("sleep_map_update", getAmbientSleepers(room));
    }
  });
});

function getAmbientSleepers(room) {
  return Object.values(activeSleepers)
    .filter((s) => s.room === room)
    .map((s) => ({
      geo: s.geo,
      mood: s.mood,
    }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SleepShare backend running on ${PORT}`));
