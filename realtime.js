// realtime.js – ربط واجهة SleepShare مع السيرفر اللحظي (Render)

// عدّل هذا الرابط إذا كان رابط Render مختلفًا
const BACKEND_URL = "https://sleepshare-backend.onrender.com";

let socket = null;
let hasJoined = false;
let currentRoom = "Global";
let ephemeralId = null;

// خريطة بسيطة لتحويل الرموز إلى ألوان / أسماء
const MOOD_COLORS = {
  Wave: "#4cc9f0",
  Stone: "#f72585",
  Cloud: "#b197fc",
  Echo: "#ffd166",
  Light: "#3bcf93",
  Drift: "#f8961e",
  Focus: "#00e5ff",
  Ease: "#8b5cff",
  Unknown: "#999999"
};

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-sleep-btn");
  const leaveBtn = document.getElementById("leave-sleep-btn");
  const statusEl = document.getElementById("sleep-map-status");

  // 1) إنشاء اتصال Socket.io مع السيرفر
  try {
    socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5
    });

    socket.on("connect", () => {
      console.log("Connected to SleepShare backend:", socket.id);
      if (statusEl && !hasJoined) {
        statusEl.textContent = "متصل بالسيرفر. يمكنك الآن الانضمام لخريطة السكون.";
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      if (statusEl) {
        statusEl.textContent = "تعذّر الاتصال بخادم SleepShare حاليًا. جرّب إعادة تحميل الصفحة.";
      }
    });

    // 2) استقبال أي تحديث لخريطة السكون
    socket.on("sleep_map_update", (sleepers) => {
      console.log("Sleep map update:", sleepers);
      updateSleepMapUI(sleepers);
    });
  } catch (e) {
    console.error("Error initializing socket:", e);
    if (statusEl) {
      statusEl.textContent = "حدث خطأ في تهيئة الاتصال اللحظي.";
    }
  }

  // 3) عند الضغط على "أنا ذاهب للنوم الآن"
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (!socket || !socket.connected) {
        alert("الاتصال بالسيرفر غير جاهز بعد. انتظر ثوانٍ ثم حاول مجددًا.");
        return;
      }

      if (hasJoined) {
        return;
      }

      // قراءة الحالة الشعورية والغرفة من التخزين المحلي (لو موجودة)
      const savedMood = localStorage.getItem("sleep_mood_symbol") || "Wave";
      const savedRoom = localStorage.getItem("sleep_room") || "Global";

      currentRoom = savedRoom;

      // هوية رمزية مؤقتة
      ephemeralId = "EPH-" + Math.random().toString(36).substring(2, 9);

      // موقع جغرافي واسع (يمكن تطويره لاحقًا)
      const geoCell = localStorage.getItem("sleep_geo_cell") || "SA-RI";

      // إرسال الانضمام للجلسة
      socket.emit("join_sleep_session", {
        ephemeralId,
        geoCell,
        chosenRoom: currentRoom,
        moodSymbol: savedMood
      });

      hasJoined = true;

      if (statusEl) {
        statusEl.textContent =
          `انضممت الآن إلى غرفة السكون «${currentRoom}» بحالة شعورية (${savedMood}). ` +
          "نقطة الضوء الخاصة بك ستظهر في الخريطة أدناه.";
      }

      startBtn.style.display = "none";
      if (leaveBtn) leaveBtn.style.display = "inline-block";
    });
  }

  // 4) إنهاء الجلسة يدويًا (اختياري – الفعل الحقيقي يتم عند إغلاق الصفحة)
  if (leaveBtn) {
    leaveBtn.addEventListener("click", () => {
      if (!socket) return;

      // Socket.io سيولّد disconnect تلقائيًا عند إغلاق الصفحة،
      // هنا فقط نحدّث الواجهة بصريًا.
      hasJoined = false;
      if (statusEl) {
        statusEl.textContent = "أنهيت جلسة النوم لهذه الليلة. نراك في سكون جديد لاحقًا.";
      }
      leaveBtn.style.display = "none";
      if (startBtn) startBtn.style.display = "inline-block";
    });
  }
});

/**
 * رسم خريطة السكون:
 * sleepers = [{ geo: "SA-RI", mood: "Wave" }, ...]
 */
function updateSleepMapUI(sleepers) {
  const container = document.getElementById("sleep-map");
  const statusEl = document.getElementById("sleep-map-status");
  if (!container) return;

  container.innerHTML = '<div class="sleep-map-glow"></div><div class="sleep-map-glow second"></div>';

  const count = Array.isArray(sleepers) ? sleepers.length : 0;

  if (statusEl && hasJoined) {
    statusEl.textContent =
      `أنت الآن في الغرفة «${currentRoom}». عدد الأرواح النائمة معك حاليًا: ${count}.`;
  } else if (statusEl && !hasJoined) {
    statusEl.textContent =
      `هناك ${count} شخصًا في حالة سكون الآن في هذه الغرفة. يمكنك الانضمام بالضغط على الزر أعلاه.`;
  }
let currentRoom = "Global"; // الغرفة الافتراضية

  if (!sleepers || !sleepers.length) return;

  const w = container.clientWidth;
  const h = container.clientHeight;

  sleepers.forEach((sleeper, index) => {
    const dot = document.createElement("div");
    dot.className = "sleep-dot";

    const mood = sleeper.mood || "Unknown";
    const color = MOOD_COLORS[mood] || MOOD_COLORS.Unknown;
    dot.style.backgroundColor = color;

    // توزيع عشوائي ناعم داخل الخريطة
    const x = Math.random();
    const y = Math.random();

    dot.style.left = `${x * 100}%`;
    dot.style.top = `${y * 100}%`;

    dot.title = `Mood: ${mood} | Geo: ${sleeper.geo || "Unknown"}`;

    // تأخير بسيط في الأنيميشن لكل نقطة (إحساس تنفّس)
    dot.style.animationDelay = `${(index * 0.3) % 6}s`;

    container.appendChild(dot);
  });
}
