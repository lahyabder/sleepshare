// realtime.js – SleepShare Realtime World Map

(() => {
  // عنوان خادم SleepShare على Render
  const SOCKET_URL = "https://sleepshare-backend.onrender.com";

  // الاتصال بـ Socket.IO
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  // عناصر الواجهة
  const joinBtn = document.getElementById("join-sleep-btn");
  const roomButtons = document.querySelectorAll(".room-btn");
  const mapEl = document.getElementById("sleep-map");
  const currentRoomSpan = document.getElementById("current-room-name");
  const sleepersCountSpan = document.getElementById("sleepers-count");
  const statusParagraph = document.getElementById("sleep-room-status");

  let currentRoom = "Global";
  let currentMood = "Wave";
  let lastLocation = null; // { lat, lng } من المتصفح إن توفّرت

  /* ============================
       1) الحصول على الموقع
     ============================ */

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lastLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("User geo:", lastLocation);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        lastLocation = null; // سنستخدم موقعًا عشوائيًا عند الحاجة
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
      }
    );
  }

  // تحويل إحداثيات lat/lng إلى نسبة مئوية (x,y) على خريطة إسقاط Equirectangular
  function latLngToPercent(lat, lng) {
    let x = (lng + 180) / 360; // 0..1
    let y = (90 - lat) / 180;  // 0..1

    x = Math.min(1, Math.max(0, x));
    y = Math.min(1, Math.max(0, y));

    return {
      left: x * 100,
      top: y * 100,
    };
  }

  /* ============================
       2) رسم النقاط على الخريطة
     ============================ */

  function clearDots() {
    document
      .querySelectorAll("#sleep-map .sleep-dot")
      .forEach((d) => d.remove());
  }

  function renderSleepMap(sleepers) {
    clearDots();

    sleepers.forEach((sleeper) => {
      let lat, lng;

      // نتوقّع أن backend يرسل geo ككائن { lat, lng }
      if (
        sleeper.geo &&
        typeof sleeper.geo === "object" &&
        "lat" in sleeper.geo &&
        "lng" in sleeper.geo
      ) {
        lat = Number(sleeper.geo.lat);
        lng = Number(sleeper.geo.lng);
      } else {
        // في حال لم نجد إحداثيات حقيقية، نختار موقعًا عشوائيًا
        lat = Math.random() * 180 - 90;
        lng = Math.random() * 360 - 180;
      }

      const pos = latLngToPercent(lat, lng);

      const dot = document.createElement("div");
      dot.className = "sleep-dot";
      dot.dataset.mood = sleeper.mood || "Wave"; // اللون من الـCSS
      dot.style.left = `${pos.left}%`;
      dot.style.top = `${pos.top}%`;

      mapEl.appendChild(dot);
    });

    const count = sleepers.length;
    if (sleepersCountSpan) {
      sleepersCountSpan.textContent = String(count);
    }

    if (statusParagraph) {
      statusParagraph.textContent = `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
    }
  }

  /* ============================
       3) Socket.IO Events
     ============================ */

  socket.on("connect", () => {
    console.log("Connected to SleepShare backend:", socket.id);
  });

  socket.on("disconnect", () => {
    console.warn("Disconnected from SleepShare backend.");
  });

  // يستقبل التحديثات من الخادم
  socket.on("sleep_map_update", (payload) => {
    console.log("Sleep map update:", payload);

    const sleepers = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.sleepers)
      ? payload.sleepers
      : [];

    renderSleepMap(sleepers);
  });

  /* ============================
       4) تغيير الغرفة
     ============================ */

  roomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      roomButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentRoom = btn.dataset.room || "Global";

      if (currentRoomSpan) {
        currentRoomSpan.textContent = currentRoom;
      }

      // تحديث النص السفلي فورًا (حتى قبل وصول التحديث من الخادم)
      if (statusParagraph) {
        const count = sleepersCountSpan
          ? Number(sleepersCountSpan.textContent || "0")
          : 0;
        statusParagraph.textContent = `أنت الآن في غرفة «${currentRoom}». عدد الأرواح النائمة معك الآن: ${count}.`;
      }
    });
  });

  /* ============================
       5) زر "أُميت جلسة النوم الآن"
     ============================ */

  joinBtn.addEventListener("click", () => {
    if (!socket.connected) {
      alert(
        "الاتصال بخادم SleepShare غير جاهز بعد. انتظر ثوانٍ قليلة ثم حاول مرة أخرى."
      );
      return;
    }

    // اختيار Mood عشوائي حاليًا (إلى أن نضيف واجهة اختيار mood)
    const moods = ["Wave", "Stone", "Cloud"];
    currentMood = moods[Math.floor(Math.random() * moods.length)];

    const payload = {
      ephemeralId: `EPH-${Math.random().toString(36).slice(2, 9)}`,
      geoCell: lastLocation
        ? { lat: lastLocation.lat, lng: lastLocation.lng }
        : null,
      chosenRoom: currentRoom,
      moodSymbol: currentMood,
    };

    console.log("Joining sleep session:", payload);
    socket.emit("join_sleep_session", payload);
  });
})();
