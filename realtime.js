// realtime.js - Client-side Realtime Logic for SleepShare Map

// عدّل هذا الرابط حسب مكان تشغيل السيرفر:
// - لو محلياً مع server.js على نفس الجهاز: http://localhost:3000
// - لو على دومين: https://your-domain.com
const SOCKET_SERVER_URL = "http://localhost:3000";

// الاتصال بخادم Socket.IO
const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"],
});

// عناصر من الـDOM
const sleepersCountEl = document.getElementById("sleepers-count");
// اختياري: عنصر لعرض قائمة رمزية للنائمين
const sleepersListEl = document.getElementById("sleepers-list");

// دالة توليد ID مؤقت (Ephemeral ID)
function generateEphemeralId() {
  return "EPH-" + Math.random().toString(36).substring(2, 10);
}

// دالة تقريب للموقع (geoCell) – حالياً عشوائية (يمكن تطويرها لاحقاً)
function getGeoCell() {
  const cells = ["NA", "EU", "AF", "AS", "SA", "OC"];
  return cells[Math.floor(Math.random() * cells.length)];
}

// مزاج المستخدم الحالي – نحاول قراءته من زر مختار في واجهة SleepShare
function getCurrentMoodSymbol() {
  const moodEl = document.querySelector(".mood-option.selected");
  if (moodEl && moodEl.dataset.mood) {
    return moodEl.dataset.mood;
  }
  return "Unknown";
}

// الغرفة الحالية – نحاول أخذها من class على الـbody: room-Nomad مثلاً
function getCurrentRoom() {
  const bodyClasses = Array.from(document.body.classList);
  const roomClass = bodyClasses.find((c) => c.startsWith("room-"));
  if (roomClass) {
    return roomClass.replace("room-", ""); // room-Nomad → Nomad
  }
  return "Global";
}

// 1) إرسال حدث الانضمام للجلسة عندما يضغط المستخدم "أنا ذاهب للنوم الآن"
const btnGoingToSleep = document.getElementById("btn-going-to-sleep");
if (btnGoingToSleep) {
  btnGoingToSleep.addEventListener("click", () => {
    const payload = {
      ephemeralId: generateEphemeralId(),
      geoCell: getGeoCell(),
      chosenRoom: getCurrentRoom(),
      moodSymbol: getCurrentMoodSymbol(),
    };

    socket.emit("join_sleep_session", payload);
    // التحديث الفعلي سيأتي من حدث sleep_map_update
  });
}

// 2) استقبال التحديثات من السيرفر
socket.on("sleep_map_update", (sleepers) => {
  // sleepers: مصفوفة من { geo: "...", mood: "..." }

  // تحديث عدّاد النائمين
  if (sleepersCountEl) {
    sleepersCountEl.textContent = sleepers.length.toString();
  }

  // تحديث قائمة رمزية (إن وجدت)
  if (sleepersListEl) {
    sleepersListEl.innerHTML = "";
    sleepers.forEach((sleeper) => {
      const li = document.createElement("li");
      li.textContent = `منطقة: ${sleeper.geo} — مزاج: ${sleeper.mood}`;
      sleepersListEl.appendChild(li);
    });
  }
});

// 3) لأغراض التتبع في الكونسول
socket.on("connect", () => {
  console.log("متصل بخادم SleepShare Realtime. Socket ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("تم قطع الاتصال بخادم SleepShare Realtime.");
});
// الاتصال بخادم SleepShare على Render
const BACKEND_URL = "https://sleepshare-backend.onrender.com"; // عدل الرابط لو مختلف
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});

// [1] عند فتح الصفحة: إرسال الجلسة
function joinSleepSession(ephemeralId, geoCell, room, moodSymbol) {
  socket.emit("join_sleep_session", {
    ephemeralId,
    geoCell,
    chosenRoom: room,
    moodSymbol
  });
}

// [2] استقبال التحديثات من السيرفر
socket.on("sleep_map_update", (sleepers) => {
  console.log("Updated sleepers:", sleepers);

  // هنا تضع أي كود لعرض النقاط على الخريطة
  updateSleepMapUI(sleepers);
});

// مثال بسيط لعرض النقاط على الشاشة
function updateSleepMapUI(list) {
  const container = document.getElementById("sleep-map");
  if (!container) return;

  container.innerHTML = "";
  
  list.forEach((sleeper) => {
    const dot = document.createElement("div");
    dot.className = "sleep-dot";
    dot.title = `Mood: ${sleeper.mood} | Geo: ${sleeper.geo}`;
    container.appendChild(dot);
  });
}
