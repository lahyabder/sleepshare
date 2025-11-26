// realtime.js – SleepShare Realtime World Map with Approximate Geo Positions

// 1) الاتصال مع السيرفر
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
//   يمكن لاحقاً توليد هذه القيم من الموقع أو من Firebase User Profile
let ephemeralId = "EPH-" + Math.random().toString(36).substring(2, 10);
// نفترض أنك الآن في الرياض مثلاً
let geoCell = "SA-RIY";
let moodSymbol = "Wave"; // مستقبلاً يمكن ربطها بالحالة النفسية الفعلية

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

// 6) دالة لحساب موضع النقطة بناءً على geoCell
function getPositionForGeo(geo) {
  if (!geo) {
    // مركز الخريطة تقريباً إذا ما عندنا أي كود
    return { x: 50, y: 50 };
  }

  // نأخذ أول جزء قبل "-" ليكون كود الدولة (SA, FR, US, …)
  const countryCode = geo.split("-")[0].toUpperCase();
  const base = GEO_POSITIONS[countryCode] || { x: 50, y: 50 };

  // نضيف اهتزاز بسيط حتى لا تتراكم النقاط فوق بعض
  const jitterX = (Math.random() - 0.5) * 6; // من -3 إلى +3
  const jitterY = (Math.random() - 0.5) * 6;

  let x = base.x + jitterX;
  let y = base.y + jitterY;

  // نضمن أن النقطة تبقى داخل الخريطة (2% إلى 98%)
  x = Math.max(2, Math.min(98, x));
  y = Math.max(2, Math.min(98, y));

  return { x, y };
}

// 7) تغيير الغرفة من الأزرار
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentRoom = btn.getAttribute("data-room") || "Global";

    roomButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    roomNameSpan.textContent = currentRoom;
    sleepersCountSpan.textContent = "0";
    if (mapBox) {
      mapBox.innerHTML = "";
    }
  });
});

// 8) عند الضغط على زر "أُميتُ جلسة النوم الآن"
if (joinButton) {
  joinButton.addEventListener("click", () => {
    socket.emit("join_sleep_session", {
      ephemeralId,
      geoCell,
      chosenRoom: currentRoom,
      moodSymbol,
    });

    console.log("Joined room:", currentRoom, "geo:", geoCell, "mood:", moodSymbol);
  });
}

// 9) استقبال تحديث الخريطة من السيرفر
socket.on("sleep_map_update", (sleepers) => {
  if (!mapBox) return;

  const count = sleepers.length || 0;
  sleepersCountSpan.textContent = String(count);

  // مسح النقاط القديمة
  mapBox.innerHTML = "";

  // رسم نقاط جديدة حسب مواقعها التقريبية
  sleepers.forEach((sleeper) => {
    const pos = getPositionForGeo(sleeper.geo);

    const dot = document.createElement("div");
    dot.className = "sleep-dot";

    // استخدام النِّسَب المئوية على الخريطة
    dot.style.left = pos.x + "%";
    dot.style.top = pos.y + "%";

    // (اختياري) يمكن تغيير اللون بناءً على المود
    // if (sleeper.mood === "Stone") dot.style.background = "#f97373";

    mapBox.appendChild(dot);
  });
});

// 10) رسائل اتصال / قطع
socket.on("connect", () => {
  console.log("Connected to SleepShare backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from backend");
  sleepersCountSpan.textContent = "0";
  if (mapBox) {
    mapBox.innerHTML = "";
  }
});
