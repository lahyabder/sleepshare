// server.js - Backend Code for SleepShare (Realtime Sleep Map)

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

// السماح لجميع المصادر - للتجارب / سيتم تقييدها لاحقاً
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// تخزين النائمين النشطين مؤقتاً (In-memory)
let activeSleepers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // [1] استقبال إعلان النوم والانضمام إلى غرفة
  socket.on("join_sleep_session", (data) => {
    const { ephemeralId, geoCell, chosenRoom, moodSymbol } = data || {};

    const safeRoom = chosenRoom || "Global";

    // الانضمام إلى غرفة
    socket.join(safeRoom);

    // تسجيل المستخدم (بشكل مجهول)
    activeSleepers[socket.id] = {
      id: ephemeralId || `EPH-${socket.id}`,
      geo: geoCell || "UN",
      room: safeRoom,
      mood: moodSymbol || "Unknown",
      startTime: new Date(),
    };

    console.log(
      `User joined room ${safeRoom} with mood ${moodSymbol} and geo ${geoCell}`
    );

    // إرسال تحديث للخريطة في نفس الغرفة
    io.to(safeRoom).emit("sleep_map_update", getAmbientSleepers(safeRoom));
  });

  // [2] عند مغادرة المستخدم
  socket.on("disconnect", () => {
    const sleeper = activeSleepers[socket.id];

    if (sleeper) {
      const room = sleeper.room;
      delete activeSleepers[socket.id];

      io.to(room).emit("sleep_map_update", getAmbientSleepers(room));
      console.log(`User disconnected from room ${room}`);
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// إرجاع الخريطة الرمزية (بدون هويات)
function getAmbientSleepers(room) {
  const roomSleepers = Object.values(activeSleepers).filter(
    (s) => s.room === room
  );

  return roomSleepers.map((s) => ({
    geo: s.geo,
    mood: s.mood,
  }));
}

// تشغيل السيرفر مع PORT الخاص بـ Render
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`SleepShare Server running on port ${PORT}`);
});
