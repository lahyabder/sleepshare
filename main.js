// ============================
//  SleepShare – تدفّق الشاشات
// ============================

// دالة مساعده لإظهار شاشة وإخفاء البقية
function showScreen(id) {
  document.querySelectorAll(".sleep-screen").forEach((s) =>
    s.classList.remove("is-active")
  );
  const target = document.getElementById(id);
  if (target) target.classList.add("is-active");
}

// تخزين متغيرات بسيطة في الذاكرة العامة
window.userName = "مستخدم مجهول";
window.selectedMood = null;
window.selectedRoom = null;
window.tomorrowMessage = "— بدون رسالة —";

// ========== 1. شاشة الترحيب ==========
document.getElementById("btn-start").addEventListener("click", () => {
  showScreen("screen-auth");
});

// ========== 2. شاشة تسجيل الدخول ==========
document.getElementById("btn-auth-skip").addEventListener("click", () => {
  window.userName = "مستخدم مجهول";
  showScreen("screen-intention");
});

document.getElementById("btn-auth-continue").addEventListener("click", () => {
  const name = document.getElementById("input-name").value.trim();
  window.userName = name === "" ? "مستخدم مجهول" : name;
  showScreen("screen-intention");
});

// ========== 3. إعلان النية ==========
document.getElementById("btn-going-to-sleep").addEventListener("click", () => {
  showScreen("screen-mood");
});

// ========== 4. اختيار الحالة النفسية ==========
document.querySelectorAll(".mood-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.selectedMood = btn.dataset.mood; // حفظ الرمز (Wave, Stone…)
    showScreen("screen-room"); // الانتقال إلى شاشة الغرفة
  });
});

// ========== 5. اختيار الغرفة الجماعية ==========
document.querySelectorAll(".room-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.selectedRoom = btn.dataset.room; // مثال: "Tide Room"
    showScreen("screen-message");
  });
});

// ========== 6. رسالة الغد ==========
document.getElementById("btn-skip-message").addEventListener("click", () => {
  window.tomorrowMessage = "— بدون رسالة —";
  prepareSleepMap();
  showScreen("screen-map");
});

document.getElementById("btn-send-message").addEventListener("click", () => {
  const msg = document.getElementById("tomorrow-message").value.trim();
  window.tomorrowMessage = msg === "" ? "— بدون رسالة —" : msg;
  prepareSleepMap();
  showScreen("screen-map");
});

// إعداد خريطة السكون (حسب الغرفة المختارة)
function prepareSleepMap() {
  let sleepers = Math.floor(Math.random() * 3000) + 1500;

  const span = document.getElementById("sleepers-count");
  if (span) span.textContent = sleepers.toString();

  const box = document.getElementById("map-box");
  const sky = document.getElementById("map-sky");
  const roomText = document.getElementById("current-room-text");

  // إعادة الكلاسات الأساسية
  box.className = "map-box";
  sky.className = "map-sky";

  // ربط الغرف بالألوان
  const roomStyles = {
    "Global Room": "room-global",
    "Tide Room": "room-tide",
    "Hearth Room": "room-hearth",
    "Cave Room": "room-cave",
    "Nest Room": "room-nest",
    "Nomad Room": "room-nomad",
    "Aurora Room": "room-aurora",
    "Friends Room": "room-friends",
    "Silent Room": "room-silent",
  };

  const selectedClass = roomStyles[window.selectedRoom] || "room-global";

  box.classList.add(selectedClass);
  sky.classList.add(selectedClass);

  // نص الغرفة تحت الخريطة
  if (roomText) {
    roomText.textContent = `أنت الآن في ${window.selectedRoom || "Global Room"}`;
  }
}

// ========== 7. خريطة السكون ==========
document.getElementById("btn-woke-up").addEventListener("click", () => {
  document.getElementById("received-message").textContent =
    window.tomorrowMessage;
  showScreen("screen-wake");
});

// ========== 8. رسالة بعد الاستيقاظ ==========
document.getElementById("btn-show-report").addEventListener("click", () => {
  // قاموس الحالة
  const moods = {
    Wave: "هدوء",
    Stone: "تعب",
    Cloud: "تشتّت",
    Echo: "حنين",
    Light: "تفاؤل",
    Drift: "شرود",
    Focus: "صفاء",
    Ease: "راحة",
  };

  // توليد بيانات رمزية للتقرير
  const dreamCodes = ["Aurora", "Drift", "Echo", "Nomad", "Wave", "Cave"];
  const dreamPick =
    dreamCodes[Math.floor(Math.random() * dreamCodes.length)];

  let randomMinutes = Math.floor(Math.random() * 50) + 240; // من 4 إلى 4.8 ساعات تقريباً
  let randomSerenity = Math.floor(Math.random() * 30) + 70;
  let dreamSignature = `${dreamPick}-${Math.floor(Math.random() * 99)}`;

  // تعبئة التقرير
  const moodSpan = document.getElementById("report-mood");
  if (moodSpan) {
    moodSpan.textContent = moods[window.selectedMood] || "—";
  }

  const roomSpan = document.getElementById("report-room");
  if (roomSpan) {
    roomSpan.textContent = window.selectedRoom || "—";
  }

  const durationSpan = document.getElementById("report-duration");
  if (durationSpan) {
    durationSpan.textContent =
      (randomMinutes / 60).toFixed(1) + " ساعة (تقريبًا)";
  }

  const serenitySpan = document.getElementById("report-serenity");
  if (serenitySpan) {
    serenitySpan.textContent = randomSerenity + " / 100";
  }

  const dreamSpan = document.getElementById("report-dream");
  if (dreamSpan) {
    dreamSpan.textContent = dreamSignature;
  }

  showScreen("screen-report");
});

// ========== 9. العودة للبداية ==========
document.getElementById("btn-reset-flow").addEventListener("click", () => {
  showScreen("screen-welcome");
});
