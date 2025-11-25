// server.js - Backend Code for SleepShare (Realtime Sleep Map)

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

// السماح لجميع المصادر بالوصول مؤقتاً (للتجارب)
const io = socketIo(server, {
  cors: {
    origin: "*", // يمكن تقييدها لاحقاً لدومين محدد
    methods: ["GET", "POST"],
  },
});

// تخزين المستخدمين النشطين (Active Sleepers) في الذاكرة مؤقتاً
let activeSleepers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // [1] استقبال: إعلان النية والانضمام إلى غرفة شعورية
  socket.on("join_sleep_session", (data) => {
    const { ephemeralId, geoCell, chosenRoom, moodSymbol } = data || {};

    const safeRoom = chosenRoom || "Global";

    // الانضمام إلى غرفة مخصصة
    socket.join(safeRoom);

    // تسجيل بيانات المستخدم (مجهولة/رمزية)
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

    // إرسال تحديث لخريطة السكون (لجميع الموجودين في نفس الغرفة)
    io.to(safeRoom).emit("sleep_map_update", getAmbientSleepers(safeRoom));
  });

  // [2] عند الانفصال (الاستيقاظ أو إغلاق المتصفح)
  socket.on("disconnect", () => {
    const sleeper = activeSleepers[socket.id];
    if (sleeper) {
      const room = sleeper.room;
      delete activeSleepers[socket.id];

      // تحديث الخريطة بعد خروج المستخدم
      io.to(room).emit("sleep_map_update", getAmbientSleepers(room));
      console.log(`User disconnected from room ${room}`);
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// إرجاع قائمة النائمين الرمزية في غرفة معينة
function getAmbientSleepers(room) {
  const roomSleepers = Object.values(activeSleepers).filter(
    (s) => s.room === room
  );

  // لا نُرجع الـid الحقيقية – فقط geo + mood (مجهولية)
  return roomSleepers.map((s) => ({
    geo: s.geo,
    mood: s.mood,
  }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SleepShare Server running on port ${PORT}`));

// ملاحظة: يجب تشغيل هذا الملف في بيئة Node.js عبر:
// node server.js
