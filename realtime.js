// ===============================================
// SleepShare Realtime Frontend (sleep.html)
// ===============================================

// عنوان الباكенд على Render
const SOCKET_URL = "https://sleepshare-backend.onrender.com";

// عناصر الواجهة
const joinBtn = document.getElementById("join-sleep-btn");
const joinStatusEl = document.getElementById("join-status");
const roomButtons = document.querySelectorAll(".room-btn");
const roomStatusEl = document.getElementById("sleep-room-status");
const sleepersLayer = document.getElementById("sleepers-layer");

// الحالة الحالية
let currentRoom = "Global";
let hasJoinedOnce = false;

// اتصال Socket.io
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

// اتصال ناجح
socket.on("connect", () => {
  console.log("Connected to SleepShare backend:", socket.id);
});

// خريطة بسيطة لتحويل geoCell إلى مواقع تقريبية على الخريطة
// القيم هي نسبة مئوية من عرض/ارتفاع الخريطة
const GEO_MAP = {
  "SA-RIY": { x: 58, y: 52 }, // الرياض تقريباً
  "FR-PAR": { x: 47, y: 34 }, // باريس
  "US-NYC": { x: 26, y: 34 }, // نيويورك
  "BR-RIO": { x: 33, y: 63 }, // ريو
  "JP-TYO": { x: 82, y: 40 }, // طوكيو
  "EG-CAI": { x: 52, y: 46 }, // القاهرة
};

// دالة لتحديد geoCell للمستخدم (حالياً ثابتة للرياض كتجربة)
function detectGeoCell() {
  // يمكنك لاحقاً ربطها بـ IP أو اختيار المستخدم
  return "SA-RIY";
}

// اختيار Mood عشوائي
function pickRandomMood() {
  const moods = ["Wave", "Stone", "Cloud"];
  return moods[Math.floor(Math.random() * moods.length)];
}

// تحديث نص حالة الغرفة
function updateRoomStatus(count) {
  roomStatusEl.textContent = `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
}

// رسم النقاط على الخريطة
function renderSleepDots(sleepers) {
  sleepersLayer.innerHTML = "";

  sleepers.forEach((sleeper) => {
    const geo = sleeper.geo || "SA-RIY";
    const mood = sleeper.mood || "Wave";

    const coords = GEO_MAP[geo] || { x: 58, y: 52 };

    const dot = document.createElement("div");
    dot.className = "sleep-dot";
    dot.dataset.mood = mood;
    dot.style.left = `${coords.x}%`;
    dot.style.top = `${coords.y}%`;

    sleepersLayer.appendChild(dot);
  });

  updateRoomStatus(sleepers.length);
}

// استقبال التحديث من الباكند
socket.on("sleep_map_update", (sleepers) => {
  console.log("sleep_map_update:", sleepers);
  renderSleepDots(sleepers || []);
});

// عند الضغط على زر الانضمام
joinBtn.addEventListener("click", () => {
  const geoCell = detectGeoCell();
  const moodSymbol = pickRandomMood();

  const payload = {
    ephemeralId: crypto.randomUUID ? crypto.randomUUID() : `EPH-${Date.now()}`,
    geoCell,
    chosenRoom: currentRoom,
    moodSymbol,
  };

  console.log("Joining sleep session:", payload);
  socket.emit("join_sleep_session", payload);

  hasJoinedOnce = true;
  joinBtn.textContent = "تم الانضمام إلى خريطة السكون ✔";
  joinBtn.disabled = true;
  joinStatusEl.textContent = "نقطة ضوئك بدأت تتنفس الآن مع الآخرين.";
});

// تغيير الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.dataset.room;

    if (room === currentRoom) return;

    currentRoom = room;

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // لو سبق أن انضمّ، نرسل طلب انضمام جديد بنفس الجلسة ولكن في الغرفة الجديدة
    if (hasJoinedOnce) {
      const geoCell = detectGeoCell();
      const moodSymbol = pickRandomMood();

      const payload = {
        ephemeralId: crypto.randomUUID ? crypto.randomUUID() : `EPH-${Date.now()}`,
        geoCell,
        chosenRoom: currentRoom,
        moodSymbol,
      };

      socket.emit("join_sleep_session", payload);
    }

    // تحديث النص مؤقتاً حتى يصل sleep_map_update من الباكند
    updateRoomStatus(0);
  });
});

/* =====================================
   Cyber Network Canvas Animation
===================================== */

const canvas = document.getElementById("map-overlay");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// إنشاء نقاط للشبكة
const NET_POINTS = [];
const NET_COUNT = 70;

function initNetwork() {
  NET_POINTS.length = 0;
  for (let i = 0; i < NET_COUNT; i++) {
    NET_POINTS.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    });
  }
}

initNetwork();

function drawNetwork() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // خطوط بين النقاط
  for (let i = 0; i < NET_POINTS.length; i++) {
    for (let j = i + 1; j < NET_POINTS.length; j++) {
      const a = NET_POINTS[i];
      const b = NET_POINTS[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 170) {
        const alpha = 1 - dist / 170;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // النقاط نفسها
  for (let p of NET_POINTS) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 200, 255, 0.9)";
    ctx.shadowColor = "rgba(0, 200, 255, 1)";
    ctx.shadowBlur = 9;
    ctx.fill();

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  }

  requestAnimationFrame(drawNetwork);
}

drawNetwork();
