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

// متغيرات المستخدم
window.userName = "مستخدم مجهول";
window.userEmail = null;
window.userAvatar = "🌙";
window.selectedMood = null;
window.selectedRoom = null;
window.tomorrowMessage = "— بدون رسالة —";

const roomAudio = document.getElementById("room-audio");
const soundToggleBtn = document.getElementById("sound-toggle");
let soundEnabled = true;

// قراءة المستخدم المخزن (إن وجد)
function loadStoredUser() {
  try {
    const raw = localStorage.getItem("sleepShareUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveStoredUser(user) {
  localStorage.setItem("sleepShareUser", JSON.stringify(user));
}

// ========== Tabs المصادقة ==========
const authTabs = document.querySelectorAll(".auth-tab");
const authPanels = {
  register: document.getElementById("auth-register"),
  login: document.getElementById("auth-login"),
  reset: document.getElementById("auth-reset"),
};

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.mode;
    authTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    Object.keys(authPanels).forEach((key) => {
      authPanels[key].classList.remove("is-active");
    });
    authPanels[mode].classList.add("is-active");
  });
});

// ========== اختيار الآفاتار ==========
const avatarButtons = document.querySelectorAll(".avatar-option");
avatarButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    avatarButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    const avatarKey = btn.dataset.avatar;
    const mapping = {
      moon: "🌙",
      wave: "🌊",
      star: "⭐",
      firefly: "✨",
      cloud: "☁️",
    };
    window.userAvatar = mapping[avatarKey] || "🌙";
  });
});

// ========== 1. شاشة الترحيب ==========
document.getElementById("btn-start").addEventListener("click", () => {
  const stored = loadStoredUser();
  if (stored) {
    // يمكن تعبئة الإيميل تلقائياً في شاشة الدخول
    document.getElementById("login-email").value = stored.email || "";
  }
  showScreen("screen-auth");
});

// ========== 2. إنشاء حساب ==========
document
  .getElementById("btn-register-submit")
  .addEventListener("click", () => {
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const name = document.getElementById("reg-name").value.trim();

    if (!email || !password) {
      alert("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    const user = {
      email,
      password,
      name: name || "مستخدم نائم",
      avatar: window.userAvatar || "🌙",
    };

    saveStoredUser(user);

    window.userEmail = email;
    window.userName = user.name;
    window.userAvatar = user.avatar;

    showScreen("screen-intention");
  });

// ========== 3. تسجيل الدخول ==========
document.getElementById("btn-login-submit").addEventListener("click", () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const stored = loadStoredUser();
  if (!stored) {
    alert("لا يوجد حساب مخزن على هذا الجهاز. أنشئ حسابًا أولاً.");
    return;
  }

  if (stored.email === email && stored.password === password) {
    window.userEmail = stored.email;
    window.userName = stored.name || "مستخدم نائم";
    window.userAvatar = stored.avatar || "🌙";
    showScreen("screen-intention");
  } else {
    alert("بيانات الدخول غير صحيحة.");
  }
});

// ========== 4. استرجاع كلمة المرور (تجريبي) ==========
document.getElementById("btn-reset-submit").addEventListener("click", () => {
  const email = document.getElementById("reset-email").value.trim();
  if (!email) {
    alert("يرجى إدخال البريد الإلكتروني.");
    return;
  }
  alert(
    "في النسخة الفعلية سيتم إرسال رابط استرجاع إلى بريدك.\nحاليًا هذا مجرد نموذج تجريبي."
  );
});

// ========== 5. الدخول كضيف ==========
document.getElementById("btn-auth-guest").addEventListener("click", () => {
  window.userName = "ضيف SleepShare";
  window.userEmail = null;
  window.userAvatar = "🌙";
  showScreen("screen-intention");
});

// ========== 6. إعلان النية ==========
document.getElementById("btn-going-to-sleep").addEventListener("click", () => {
  showScreen("screen-mood");
});

// ========== 7. اختيار الحالة النفسية ==========
document.querySelectorAll(".mood-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.selectedMood = btn.dataset.mood; // حفظ الرمز (Wave, Stone…)
    showScreen("screen-room"); // الانتقال إلى شاشة الغرفة
  });
});

// ========== 8. اختيار الغرفة الجماعية ==========
document.querySelectorAll(".room-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.selectedRoom = btn.dataset.room; // مثال: "Tide Room"
    showScreen("screen-message");
  });
});

// ========== 9. رسالة الغد ==========
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

// زر تفعيل/إيقاف الصوت
if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    if (!roomAudio || !roomAudio.src) return;

    if (soundEnabled) {
      roomAudio.muted = true;
      soundEnabled = false;
      soundToggleBtn.textContent = "🔇";
      soundToggleBtn.classList.add("sound-off");
    } else {
      roomAudio.muted = false;
      soundEnabled = true;
      soundToggleBtn.textContent = "🔊";
      soundToggleBtn.classList.remove("sound-off");
    }
  });
}

// إعداد خريطة السكون + الصوت
function prepareSleepMap() {
  let sleepers = Math.floor(Math.random() * 3000) + 1500;

  const span = document.getElementById("sleepers-count");
  if (span) span.textContent = sleepers.toString();

  const box = document.getElementById("map-box");
  const sky = document.getElementById("map-sky");
  const roomText = document.getElementById("current-room-text");

  box.className = "map-box";
  sky.className = "map-sky";

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

  if (roomText) {
    roomText.textContent = `أنت الآن في ${window.selectedRoom || "Global Room"}`;
  }

  const roomSounds = {
    "Global Room": "sounds/global.mp3",
    "Tide Room": "sounds/tide.mp3",
    "Hearth Room": "sounds/hearth.mp3",
    "Cave Room": "sounds/cave.mp3",
    "Nest Room": "sounds/nest.mp3",
    "Nomad Room": "sounds/nomad.mp3",
    "Aurora Room": "sounds/aurora.mp3",
    "Friends Room": "sounds/friends.mp3",
    "Silent Room": "sounds/silent.mp3",
  };

  if (roomAudio) {
    const src = roomSounds[window.selectedRoom] || roomSounds["Global Room"];
    roomAudio.src = src;
    roomAudio.volume = 0.35;
    roomAudio.muted = !soundEnabled;

    roomAudio.play().catch(() => {
      // إذا المتصفح منع التشغيل التلقائي، نتجاهل الخطأ
    });
  }
}

// ========== 10. خريطة السكون ==========
document.getElementById("btn-woke-up").addEventListener("click", () => {
  document.getElementById("received-message").textContent =
    window.tomorrowMessage;

  if (roomAudio) {
    roomAudio.pause();
  }

  showScreen("screen-wake");
});

// ========== 11. رسالة بعد الاستيقاظ ==========
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
  const nameSpan = document.getElementById("report-name");
  if (nameSpan) {
    nameSpan.textContent = window.userName || "—";
  }

  const avatarSpan = document.getElementById("report-avatar");
  if (avatarSpan) {
    avatarSpan.textContent = window.userAvatar || "—";
  }

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

// ========== 12. العودة للبداية ==========
document.getElementById("btn-reset-flow").addEventListener("click", () => {
  if (roomAudio) {
    roomAudio.pause();
    roomAudio.currentTime = 0;
  }
  showScreen("screen-welcome");
});
