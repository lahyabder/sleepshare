// server.js - Backend Code for SleepShare (Realtime Sleep Map)

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// middlewares
app.use(cors());

// simple health check (اختبار تشغيل)
app.get("/", (req, res) => {
  res.send("SleepShare backend OK");
});

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

      // تحديث الخريط
