// realtime.js – SleepShare live map

(() => {
  // عنوان السيرفر على Render (عدّله إذا تغير)
  const SOCKET_URL = "wss://sleepshare-backend.onrender.com";

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    timeout: 10000,
  });

  const joinBtn = document.getElementById("join-sleep-btn");
  const roomButtons = document.querySelectorAll(".room-btn");
  const roomStatusEl = document.getElementById("sleep-room-status");
  const sleepMapEl = document.getElementById("sleep-map");

  let currentRoom = "Global";
  let localMood = randomMood();
  let localGeoCell = "SA-RIY"; // افتراضياً: الرياض

  let latestSleepers = [];

  // مزاج عشوائي
  function randomMood() {
    const moods = ["Wave", "Stone", "Cloud"];
    const idx = Math.floor(Math.random() * moods.length);
    return moods[idx];
  }

  // تغيير الغرفة من الأزرار
  roomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      roomButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRoom = btn.dataset.room || "Global";
      updateRoomStatus(latestSleepers.length);
      // نطلب من السيرفر أن يعيد إرسال الحالة لهذه الغرفة
      socket.emit("join_sleep_session", {
        ephemeralId: createEphemeralId(),
        geoCell: localGeoCell,
        chosenRoom: currentRoom,
        moodSymbol: localMood,
      });
    });
  });

  // الضغط على زر "أميت جلسة النوم الآن"
  joinBtn.addEventListener("click", () => {
    localMood = randomMood();

    socket.emit("join_sleep_session", {
      ephemeralId: createEphemeralId(),
      geoCell: localGeoCell,
      chosenRoom: currentRoom,
      moodSymbol: localMood,
    });

    joinBtn.disabled = true;
    joinBtn.textContent = "تم الانضمام إلى خريطة السكون ✔";
  });

  // استقبال تحديث الخريطة من السيرفر
  socket.on("sleep_map_update", (sleepers) => {
    latestSleepers = sleepers || [];
    renderSleepDots(latestSleepers);
    updateRoomStatus(latestSleepers.length);
  });

  // فقط للمتابعة في الكونسول
  socket.on("connect", () => {
    console.log("Connected to SleepShare backend:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("SleepShare socket error:", err.message);
  });

  /* =============================
       رسم النقاط على الخريطة
     ============================= */

  function renderSleepDots(sleepers) {
    if (!sleepMapEl) return;

    // إزالة النقاط السابقة
    const oldDots = sleepMapEl.querySelectorAll(".sleep-dot");
    oldDots.forEach((dot) => dot.remove());

    sleepers.forEach((sleeper) => {
      const geoCode = (sleeper.geo || "SA-RIY").split("-")[0]; // الدولة
      const mood = sleeper.mood || "Wave";

      const { x, y } = geoCodeToXY(geoCode);

      const dot = document.createElement("div");
      dot.className = "sleep-dot";
      dot.dataset.mood = mood;
      dot.style.left = `${x}%`;
      dot.style.top = `${y}%`;

      sleepMapEl.appendChild(dot);
    });
  }

  // تحويل كود الدولة إلى إحداثيات تقريبية على الخريطة
  function geoCodeToXY(code) {
    const map = {
      US: { lat: 38, lon: -97 },
      CA: { lat: 56, lon: -96 },
      BR: { lat: -14, lon: -52 },
      GB: { lat: 54, lon: -2 },
      FR: { lat: 47, lon: 2 },
      DE: { lat: 51, lon: 9 },
      ES: { lat: 40, lon: -4 },
      IT: { lat: 42.5, lon: 12.5 },
      MA: { lat: 31.7, lon: -7.1 },
      DZ: { lat: 28, lon: 3 },
      TN: { lat: 34, lon: 9 },
      EG: { lat: 27, lon: 30 },
      SA: { lat: 24, lon: 45 },
      AE: { lat: 24, lon: 54 },
      QA: { lat: 25.3, lon: 51.2 },
      OM: { lat: 21, lon: 57 },
      KW: { lat: 29.3, lon: 47.5 },
      MR: { lat: 21, lon: -10 },
      SN: { lat: 14.5, lon: -14 },
      NG: { lat: 9, lon: 8 },
      IN: { lat: 21, lon: 78 },
      PK: { lat: 30, lon: 69 },
      CN: { lat: 35, lon: 103 },
      JP: { lat: 36, lon: 138 },
      AU: { lat: -25, lon: 133 },
      RU: { lat: 60, lon: 90 },
    };

    const upper = code.toUpperCase();
    const ref = map[upper] || { lat: 20 + Math.random() * 20, lon: 0 + Math.random() * 40 - 20 };

    // تحويل lat/lon إلى نسبة مئوية (خريطة إسقاط بسيط)
    const x = ((ref.lon + 180) / 360) * 100;
    const y = ((90 - ref.lat) / 180) * 100;

    // نقيّد داخل الحواف
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  }

  // معرّف مؤقت للمستخدم
  function createEphemeralId() {
    return "EPH-" + Math.random().toString(36).slice(2, 10);
  }

  // تحديث النص أسفل أزرار الغرفة
  function updateRoomStatus(count) {
    if (!roomStatusEl) return;
    roomStatusEl.textContent =
      `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
  }
})();
