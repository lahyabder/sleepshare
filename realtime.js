// realtime.js – SleepShare Realtime World Map with Approximate Geo Positions + Mood Colors

// 1) الاتصال مع السيرفر (ضع هنا رابط الـ backend على Render)
const socket = io("https://sleepshare-backend.onrender.com", {
  transports: ["websocket"],
  timeout: 10000,
});

// 2) الغرفة الحالية
let currentRoom = "Global";

// 3) عناصر من الصفحة
const roomNameSpan = document.getElementById("current-room-name");
const sleepersCountSpan = document.getElementById("sleepers-count");
const roomButtons = document.querySelectorAll(".room-btn");
const joinButton = document.getElementById("join-sleep-btn");
const mapBox = document.getElementById("sleep-map");

// 4) قيم مؤقتة للمستخدم
// لاحقًا يمكن ربطها بحساب Firebase أو إعدادات المستخدم
let ephemeralId = "EPH-" + Math.random().toString(36).substring(2, 10);
// مثال افتراضي: السعودية – الرياض
let geoCell = "SA-RIY";
// مود افتراضي – يمكن تغييره من رحلة النوم
let moodSymbol = "Wave";

// 5) جدول مواقع تقريبية لكل دولة على خريطة العالم (بنسبة مئوية من عرض/ارتفاع العنصر)
const GEO_POSITIONS = {
  // الشرق الأوسط وشمال أفريقيا
  SA: { x: 62, y: 54 }, // السعودية
  AE: { x: 66, y: 54 }, // الإمارات
  QA: { x: 63, y: 52 },
  KW: { x: 61, y: 48 },
  OM: { x: 66, y: 58 },
  BH: { x: 62, y: 51 },
  EG: { x: 58, y: 49 },
  MA: { x: 49, y: 48 },
  DZ: { x: 52, y: 49 },
  TN: { x: 54, y: 47 },
  LY: { x: 57, y: 50 },
  MR: { x: 46, y: 52 }, // موريتانيا
  SD: { x: 60, y: 54 },

  // أوروبا
  FR: { x: 52, y: 40 },
  ES: { x: 50, y: 43 },
  PT: { x: 48, y: 44 },
  DE: { x: 54, y: 37 },
  IT: { x: 55, y: 42 },
  GB: { x: 50, y: 36 },
  NL: { x: 53, y: 36 },
  BE: { x: 52, y: 38 },
  SE: { x: 56, y: 30 },
  NO: { x: 55, y: 27 },
  RU: { x: 68, y: 32 },

  // الأمريكتان
  US: { x: 27, y: 43 },
  CA: { x: 25, y: 32 },
  MX: { x: 26, y: 49 },
  BR: { x: 33, y: 62 },
  AR: { x: 33, y: 72 },

  // أفريقيا جنوب الصحراء
  NG: { x: 56, y: 57 },
  ZA: { x: 57, y: 75 },
  KE: { x: 62, y: 60 },
  ET: { x: 62, y: 55 },

  // آسيا
  IN: { x: 69, y: 58 },
  PK: { x: 67, y: 51 },
  CN: { x: 76, y: 43 },
  JP: { x: 84, y: 41 },
  KR: { x: 81, y: 41 },
  ID: { x: 79, y: 68 },

  // أوقيانوسيا
  AU: { x: 82, y: 74 },
  NZ: { x: 89, y: 73 },
};

// 6) ألوان المزاج (Mood → لون النقطة)
const MOOD_COLORS = {
  Wave: {
    bg: "#38bdf8", // أزرق هادئ
    glow: "0 0 10px rgba(56,189,248,0.9)",
  },
  Stone: {
    bg: "#f97316", // برتقالي متعب
    glow: "0 0 10px rgba(249,115,22,0.9)",
  },
  Cloud: {
    bg: "#a855f7", // بنفسجي ضبابي
    glow: "0 0 10px rgba(168,85,247,0.9)",
  },
  Echo: {
    bg: "#fb7185", // وردي حنين
    glow: "0 0 10px rgba(251,113,133,0.9)",
  },
  Light: {
    bg: "#facc15", // أصفر متفائل
    glow: "0 0 10px rgba(250,204,21,0.9)",
  },
  Drift: {
    bg: "#64748b", // أزرق رمادي
    glow: "0 0 10px rgba(100,116,139,0.9)",
  },
  Focus: {
    bg: "#22c55e", // أخضر نقي
    glow: "0 0 10px rgba(34,197,94,0.9)",
  },
  Ease: {
    bg: "#14b8a6", // تركواز مريح
    glow: "0 0 10px rgba(20,184,166,0.9)",
  },
  Default: {
    bg: "#e5e7eb",
    glow: "0 0 10px rgba(229,231,235,0.9)",
  },
};

// 7) دالة لحساب موضع النقطة بناءً على geoCell
function getPositionForGeo(geo) {
  if (!geo) {
    return { x: 50, y: 50 }; // مركز الخريطة تقريباً
  }

  // نأخذ أول جزء قبل "-" ليكون كود الدولة (SA, FR, US, …)
  const countryCode = geo.split("-")[0].toUpperCase();
  const base = GEO_POSITIONS[countryCode] || { x: 50, y: 50 };

  // اهتزاز بسيط حتى لا تتراكم النقاط فوق بعض
  const jitterX = (Math.random() - 0.5) * 6; // من -3 إلى +3
  const jitterY = (Math.random() - 0.5) * 6;

  let x = base.x + jitterX;
  let y = base.y + jitterY;

  // نضمن أن النقطة تبقى داخل الخريطة (من 2% إلى 98%)
  x = Math.max(2, Math.min(98, x));
  y = Math.max(2, Math.min(98, y));

  return { x, y };
}

// 8) تغيير الغرفة من الأزرار
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentRoom = btn.getAttribute("data-room") || "Global";

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    if (roomNameSpan) {
      roomNameSpan.textContent = currentRoom;
    }
    if (sleepersCountSpan) {
      sleepersCountSpan.textContent = "0";
    }
    if (mapBox) {
      mapBox.innerHTML = "";
    }
  });
});

// 9) عند الضغط على زر "أنا أبدأ جلسة النوم الآن" (أو ما يعادلها)
if (joinButton) {
  joinButton.addEventListener("click", () => {
    socket.emit("join_sleep_session", {
      ephemeralId,
      geoCell,
      chosenRoom: currentRoom,
      moodSymbol,
    });

    console.log(
      "Joined room:",
      currentRoom,
      "| geo:",
      geoCell,
      "| mood:",
      moodSymbol
    );
  });
}

// 10) استقبال تحديث الخريطة من السيرفر
socket.on("sleep_map_update", (sleepers) => {
  if (!mapBox) return;

  const count = sleepers.length || 0;
  if (sleepersCountSpan) {
    sleepersCountSpan.textContent = String(count);
  }

  // مسح النقاط القديمة
  mapBox.innerHTML = "";

  // رسم نقاط جديدة حسب مواقعها + المود
  sleepers.forEach((sleeper) => {
    const pos = getPositionForGeo(sleeper.geo);
    const mood = sleeper.mood || "Default";
    const moodStyle = MOOD_COLORS[mood] || MOOD_COLORS.Default;

    const dot = document.createElement("div");
    dot.className = "sleep-dot";

    // استخدام النِّسَب المئوية على الخريطة
    dot.style.left = pos.x + "%";
    dot.style.top = pos.y + "%";

    // لون حسب الحالة
    dot.style.background = moodStyle.bg;
    dot.style.boxShadow = moodStyle.glow;

    // (اختياري) Tooltip بسيط عند تمرير الفأرة
    dot.title = `Mood: ${mood}`;

    mapBox.appendChild(dot);
  });
});

// 11) رسائل اتصال / قطع
socket.on("connect", () => {
  console.log("Connected to SleepShare backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from backend");
  if (sleepersCountSpan) {
    sleepersCountSpan.textContent = "0";
  }
  if (mapBox) {
    mapBox.innerHTML = "";
  }
});
