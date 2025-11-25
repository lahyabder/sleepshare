// server.js - SleepShare Realtime Backend

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// السماح لـ CORS مؤقتاً من أي مصدر (للتجارب)
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// نقطة اختبار بسيطة للتأكد أن السيرفر يعمل
app.get("/", (req, res) => {
  res.send("SleepShare backend is running.");
});

// تخزين مؤقت للي نايمين الآن (في الذاكرة فقط)
let activeSleepers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // استقبال دخول مستخدم في جلسة النوم
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

    // إرسال تحديث للخريطة لكل الموجودين في نفس الغرفة
    io.to(room).emit("sleep_map_update", getAmbientSleepers(room));

    console.log(
      `User joined room ${room} | mood=${moodSymbol} | geo=${geoCell}`
    );
  });

  socket.on("disconnect", () => {
    const sleeper = activeSleepers[socket.id];
    if (sleeper) {
      const room = sleeper.room;
      delete activeSleepers[socket.id];
      io.to(room).emit("sleep_map_update", getAmbientSleepers(room));
      console.log(`User disconnected from room ${room}`);
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
});

// دالة ترجع بيانات رمزية للخريطة
function getAmbientSleepers(room) {
  const roomSleepers = Object.values(activeSleepers).filter(
    (s) => s.room === room
  );

  return roomSleepers.map((s) => ({
    geo: s.geo,
    mood: s.mood,
  }));
}

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`SleepShare backend running on port ${PORT}`);
});
