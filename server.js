// server.js - Backend Code for SleepShare

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// ⚠️ هام: يجب أن تسمح لجميع المصادر بالوصول لخادمك مؤقتاً
const io = socketIo(server, {
    cors: {
        origin: "*", // السماح بالاتصال من أي موقع (لتجنب مشاكل CORS)
        methods: ["GET", "POST"]
    }
});

// تخزين المستخدمين النشطين (Active Sleepers) بشكل مؤقت
let activeSleepers = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // [1] استقبال: وظيفة إعلان النية والانضمام إلى غرفة
    socket.on('join_sleep_session', (data) => {
        const { ephemeralId, geoCell, chosenRoom, moodSymbol } = data;
        
        // الانضمام إلى غرفة مخصصة
        socket.join(chosenRoom);

        // تسجيل بيانات المستخدم (مجهولة/رمزية)
        activeSleepers[socket.id] = {
            id: ephemeralId, 
            geo: geoCell, 
            room: chosenRoom,
            mood: moodSymbol,
            startTime: new Date()
        };
        
        // إرسال تحديث لخريطة السكون (لجميع المستخدمين في نفس الغرفة)
        io.to(chosenRoom).emit('sleep_map_update', getAmbientSleepers(chosenRoom));
    });

    // [2] عند الانفصال (الاستيقاظ أو إغلاق المتصفح)
    socket.on('disconnect', () => {
        const sleeper = activeSleepers[socket.id];
        if (sleeper) {
            const room = sleeper.room;
            delete activeSleepers[socket.id];
            
            // إرسال تحديث للخريطة بعد خروج المستخدم
            io.to(room).emit('sleep_map_update', getAmbientSleepers(room));
            console.log(`User disconnected from room ${room}`);
        }
    });
});

// وظيفة لاستخراج قائمة النائمين الرمزية
function getAmbientSleepers(room) {
    // إرجاع قائمة مجهولة بأشخاص في نفس الغرفة
    const roomSleepers = Object.values(activeSleepers).filter(s => s.room === room);
    
    // تطبيق المجهولية: إرجاع فقط الموقع الواسع
    return roomSleepers.map(s => ({ geo: s.geo, mood: s.mood }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SleepShare Server running on port ${PORT}`));

// تنبيه: هذا الكود لن يعمل إلا إذا تم تشغيله في بيئة Node.js حية.
