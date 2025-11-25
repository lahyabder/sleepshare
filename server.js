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
    const { ephemeralId, geoCell, chosenRoom, mo
