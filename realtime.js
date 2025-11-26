// ===============================
// SleepShare Realtime Frontend
// رسم النقاط فوق خريطة العالم
// ===============================

// عنوان السيرفر في Render
const SOCKET_URL = "https://sleepshare-backend.onrender.com";

// عناصر من الصفحة
const joinBtn = document.getElementById("join-sleep-btn");
const roomButtons = document.querySelectorAll(".room-btn");
const statusEl = document.getElementById("sleep-room-status");
const mapEl = document.getElementById("sleep-map");

// الحالة الحالية
let socket = null;
let currentRoom = "Calm Souls";
let joined = false;

// اتصال Socket.IO
socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

// عند الاتصال
socket.on("connect", () => {
  console.log("Connected to SleepShare backend:", socket.id);
});

// تحديث النقاط عند استقبال بيانات من السيرفر
socket.on("sleep_map_update", (sleepers) => {
  console.log("Sleep map update:", sleepers);
  renderDots(sleepers);
  updateCountText(sleepers.length);
});

// زر الانضمام
joinBtn.addEventListener("click", () => {
  if (!socket || !socket.connected) {
    console.warn("Socket not connected yet");
    return;
  }

  if (!joined) {
    joined = true;
    joinBtn.classList.add("joined");
    joinBtn.textContent = "✔ تم الانضمام إلى خريطة السكون";

    const payload = {
      ephemeralId: generateEphemeralId(),
      geoCell: "SA-RIY", // مثال ثابت (يمكن تغييره لاحقًا)
      chosenRoom: currentRoom,
      moodSymbol: randomMood(),
    };

    console.log("Joining sleep session:", payload);
    socket.emit("join_sleep_session", payload);
  }
});

// تغيير الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.dataset.room;
    if (!room) return;

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentRoom = room;
    updateRoomText(room);
  });
});

// ===============================
// دوال مساعدة
// ===============================

function updateRoomText(room) {
  const text = `أنت الآن في غرفة «${room}». عدد الأرواح النائمة معك الآن: 0.`;
  statusEl.textContent = text;
}

function updateCountText(count) {
  const text = `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
  statusEl.textContent = text;
}

function generateEphemeralId() {
  return (
    "EPH-" +
    Math.random().toString(36).substring(2, 8) +
    "-" +
    Date.now().toString(36).slice(-4)
  );
}

function randomMood() {
  const moods = ["Wave", "Stone", "Cloud"];
  return moods[Math.floor(Math.random() * moods.length)];
}

/**
 * تحويل geo string إلى إحداثيات على الخريطة
 * (إسقاط تقريبي/رمزي – الهدف شكل جميل وليس دقة جغرافية كاملة)
 */
function geoToXY(geoString) {
  if (!geoString) {
    return { x: Math.random(), y: Math.random() };
  }

  // خريطة تقريبة لبعض المناطق (يمكن توسيعها لاحقًا)
  const presets = {
    "SA-RIY": { x: 0.57, y: 0.55 }, // الرياض
    "FR-PAR": { x: 0.48, y: 0.40 }, // باريس
    "US-NYC": { x: 0.28, y: 0.42 }, // نيويورك
    "JP-TKO": { x: 0.80, y: 0.50 }, // طوكيو
    "BR-RIO": { x: 0.34, y: 0.70 }, // ريو
  };

  if (presets[geoString]) return presets[geoString];

  // إذا غير موجود: موقع عشوائي ثابت بناءً على النص
  const hash = hashString(geoString);
  const x = (hash % 1000) / 1000; // بين 0 و 1
  const y = ((Math.floor(hash / 1000) % 1000) / 1000) * 0.5 + 0.25; // وسط الخريطة
  return { x, y };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * رسم النقاط فوق الخريطة
 * sleepers: [{ geo: "SA-RIY", mood: "Wave" }, ...]
 */
function renderDots(sleepers) {
  if (!mapEl) return;

  // إزالة النقاط القديمة
  const oldDots = mapEl.querySelectorAll(".sleep-dot");
  oldDots.forEach((d) => d.remove());

  const rect = mapEl.getBoundingClientRect();

  sleepers.forEach((sleeper) => {
    const { geo, mood } = sleeper;

    const { x, y } = geoToXY(geo || "GLOBAL");
    const jitterX = (Math.random() - 0.5) * 0.04;
    const jitterY = (Math.random() - 0.5) * 0.04;

    const dot = document.createElement("div");
    dot.className = "sleep-dot";
    dot.dataset.mood = mood || "Wave";

    const px = (x + jitterX) * rect.width;
    const py = (y + jitterY) * rect.height;

    dot.style.left = `${px}px`;
    dot.style.top = `${py}px`;

    mapEl.appendChild(dot);
  });
}
