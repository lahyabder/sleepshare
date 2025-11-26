// ===============================
// SleepShare Realtime – Mapbox Map
// ===============================

// 1) ضع هنا الـ Access Token من حسابك في Mapbox
// https://account.mapbox.com
mapboxgl.accessToken = "PUT_YOUR_MAPBOX_ACCESS_TOKEN_HERE";

// 2) تهيئة الخريطة
const map = new mapboxgl.Map({
  container: "sleep-map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [20, 25], // وسط العالم تقريباً
  zoom: 1.6,
  projection: "globe"
});

map.on("style.load", () => {
  map.setFog({
    color: "rgb(11, 15, 25)",
    "high-color": "rgb(36, 99, 235)",
    "space-color": "rgb(0, 0, 0)",
    "horizon-blend": 0.2
  });
});

// 3) الاتصال مع Backend عبر Socket.IO
const socket = io("https://sleepshare-backend.onrender.com", {
  transports: ["websocket"]
});

// 4) حالة المستخدم الحالية
let currentRoom = "Global";
let currentMood = randomMood(); // Wave / Stone / Cloud
let currentGeoCell = "SA-RIY"; // تقريباً: الرياض (يمكن تطويرها لاحقاً)
let ephemeralId = makeEphemeralId();

let hasJoined = false;
let markers = [];

// عناصر الواجهة
const joinBtn = document.getElementById("join-sleep-btn");
const roomButtons = document.querySelectorAll(".room-btn");
const statusEl = document.getElementById("sleep-room-status");

// 5) عند الضغط على زر الانضمام
joinBtn.addEventListener("click", () => {
  if (hasJoined) return;

  hasJoined = true;
  joinBtn.textContent = "✓ تم الانضمام إلى خريطة السكون";
  joinBtn.disabled = true;

  sendJoin();
});

// 6) عند تغيير الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.dataset.room;
    if (!room) return;

    currentRoom = room;

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    updateStatusCount(0);

    if (hasJoined) {
      // إعادة إرسال الانضمام لكن مع الغرفة الجديدة
      sendJoin();
    }
  });
});

// 7) إرسال حدث الانضمام إلى الـ backend
function sendJoin() {
  const payload = {
    ephemeralId,
    geoCell: currentGeoCell,
    chosenRoom: currentRoom,
    moodSymbol: currentMood
  };

  console.log("Joining sleep session:", payload);
  socket.emit("join_sleep_session", payload);
}

// 8) استقبال تحديث الخريطة من الـ backend
socket.on("sleep_map_update", (sleepers) => {
  console.log("Sleep map update:", sleepers);

  // إزالة الماركرات القديمة
  markers.forEach((m) => m.remove());
  markers = [];

  if (!Array.isArray(sleepers)) {
    updateStatusCount(0);
    return;
  }

  updateStatusCount(sleepers.length);

  sleepers.forEach((sleeper) => {
    const coords = geoToCoords(sleeper.geo);
    if (!coords) return;

    const mood = sleeper.mood || "Wave";
    const color = moodToColor(mood);

    const el = document.createElement("div");
    el.className = "sleep-marker";
    el.dataset.mood = mood;
    el.style.backgroundColor = color;
    el.style.boxShadow = `0 0 18px ${color}`;

    const marker = new mapboxgl.Marker(el).setLngLat(coords).addTo(map);

    markers.push(marker);
  });
});

// 9) دوال مساعدة

function updateStatusCount(count) {
  statusEl.textContent = `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
}

function makeEphemeralId() {
  return "EPH-" + Math.random().toString(36).substring(2, 8);
}

function randomMood() {
  const moods = ["Wave", "Stone", "Cloud"];
  const index = Math.floor(Math.random() * moods.length);
  return moods[index];
}

// تحويل geoCell إلى إحداثيات [lng, lat]
// يمكنك إضافة المزيد لاحقاً حسب الحاجة
function geoToCoords(geoCell) {
  if (!geoCell) return null;

  const table = {
    "SA-RIY": [46.6753, 24.7136], // الرياض
    "SA-JED": [39.19797, 21.4858], // جدة
    "MR-NKC": [-15.9785, 18.0858], // نواكشوط
    "FR-PAR": [2.3522, 48.8566], // باريس
    "US-NYC": [-74.006, 40.7128], // نيويورك
    "GB-LON": [-0.1276, 51.5074] // لندن
  };

  if (table[geoCell]) return table[geoCell];

  // fallback عشوائي على الكرة الأرضية
  const lon = Math.random() * 360 - 180;
  const lat = Math.random() * 140 - 70;
  return [lon, lat];
}

function moodToColor(mood) {
  switch (mood) {
    case "Wave":
      return "#4cc9f0";
    case "Stone":
      return "#6366f1";
    case "Cloud":
      return "#a855f7";
    default:
      return "#f97316";
  }
}

// 10) أحداث الاتصال
socket.on("connect", () => {
  console.log("Connected to SleepShare backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from backend");
});
