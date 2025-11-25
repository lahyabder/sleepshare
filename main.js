// main.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ==============================
// التحقق من تسجيل الدخول
// ==============================
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  // لو أردت أن يكون الدخول إلزاميًا:
  // if (!user) {
  //   window.location.href = "auth.html";
  // }
});

// ==============================
// بيانات الجلسة
// ==============================
const state = {
  nickname: null,
  mood: null,
  room: "Nomad",
  startTime: null,
  endTime: null,
  serenity: null,
  dreamSignature: null,
  userMessage: null,
};

// إعداد الغرف
const roomConfig = {
  Global: {
    label: "World Room – العالم",
    labelFull: "World Room – العالم",
    tagline: "غرفة مفتوحة تلتقي فيها أنفاس من كل القارات في لحظة واحدة.",
    soundUrl: "",
  },
  Nomad: {
    label: "Nomad Room – الرحلة",
    labelFull: "Nomad Room – الرحلة",
    tagline:
      "رحلة هادئة تحت سماء مفتوحة… لا أحد يعرفك هنا، لكن الكل ينام معك.",
    soundUrl: "",
  },
  Hearth: {
    label: "Hearth Room – الدفء",
    labelFull: "Hearth Room – الدفء",
    tagline:
      "نار صغيرة في بيت بعيد، حولها أرواح تبحث عن دفء خفيف قبل النوم.",
    soundUrl: "",
  },
  Cave: {
    label: "Cave Room – العمق",
    labelFull: "Cave Room – العمق",
    tagline:
      "نوم عميق يشبه كهفًا آمنًا… الظلام هنا حارس وليس تهديدًا.",
    soundUrl: "",
  },
  Tide: {
    label: "Tide Room – المد والجزر",
    labelFull: "Tide Room – المد والجزر",
    tagline:
      "صعود وهبوط، أفكار تأتي وتذهب مثل الموج، لكنها في النهاية تهدأ.",
    soundUrl: "",
  },
  Nest: {
    label: "Nest Room – العش",
    labelFull: "Nest Room – العش",
    tagline:
      "غرفة صغيرة تلتف حولك كعشّ طائر، كل شيء فيها يدعوك للطمأنينة.",
    soundUrl: "",
  },
  Aurora: {
    label: "Aurora Room – الأضواء",
    labelFull: "Aurora Room – الأضواء",
    tagline:
      "ألوان هادئة ترقص فوق نومك، كأن السماء تكتب على وسادتك.",
    soundUrl: "",
  },
};

const anonymousMessages = [
  "كل ليلة فرصة صغيرة لنغفر لأنفسنا أشياء اليوم.",
  "أغمِض عينيك… العالم يمكنه أن ينتظر حتى الصباح.",
  "هناك من ينام الآن وهو ممتن لوجودك في حياته، حتى لو لم يقل ذلك.",
  "النوم ليس هروبًا، بل عودة هادئة إلى الداخل.",
  "دع روحك تستند على وسادة الليل كما يستند المسافر على كتف صديق.",
];

// ==============================
// عناصر DOM
// ==============================
const screens = document.querySelectorAll(".sleep-screen");

const btnStart = document.getElementById("btn-start");
const btnAuthSkip = document.getElementById("btn-auth-skip");
const btnAuthContinue = document.getElementById("btn-auth-continue");
const inputName = document.getElementById("input-name");

const btnGoingToSleep = document.getElementById("btn-going-to-sleep");

const moodButtons = document.querySelectorAll(".mood-option");
const roomButtons = document.querySelectorAll(".room-option");

const textareaMessage = document.getElementById("tomorrow-message");
const btnSkipMessage = document.getElementById("btn-skip-message");
const btnSendMessage = document.getElementById("btn-send-message");

const sleepersCountEl = document.getElementById("sleepers-count");
const roomNameLabel = document.getElementById("room-name-label");
const roomTaglineEl = document.getElementById("room-tagline");
const btnToggleSound = document.getElementById("btn-toggle-sound");
const btnWokeUp = document.getElementById("btn-woke-up");

const receivedMessageEl = document.getElementById("received-message");
const btnShowReport = document.getElementById("btn-show-report");

const reportMood = document.getElementById("report-mood");
const reportRoom = document.getElementById("report-room");
const reportDuration = document.getElementById("report-duration");
const reportSerenity = document.getElementById("report-serenity");
const reportDream = document.getElementById("report-dream");
const reportDescription = document.getElementById("report-description");

const btnResetFlow = document.getElementById("btn-reset-flow");

// ==============================
// التنقل بين الشاشات
// ==============================
function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==============================
// المؤشرات (Serenity + Dream)
// ==============================
function generateSerenityIndex() {
  return Math.floor(60 + Math.random() * 40); // 60–100
}

function generateDreamSignature() {
  const dictionaries = {
    Wave: ["Wave", "Tide", "Azure"],
    Stone: ["Stone", "Basalt", "IronShade"],
    Cloud: ["Cloud", "Mist", "Vapor"],
    Echo: ["Echo", "MemoryLine", "Hollow"],
    Light: ["Light", "Dawn", "Halo"],
    Drift: ["Drift", "Wander", "Float"],
    Focus: ["Focus", "ClearTone", "Prism"],
    Ease: ["Ease", "SoftAir", "Velvet"],
    Default: ["Dream", "NightTrace", "SilentSign"],
  };

  const mood = state.mood || "Default";
  const baseList = dictionaries[mood] || dictionaries.Default;
  const word = baseList[Math.floor(Math.random() * baseList.length)];
  const number = Math.floor(Math.random() * 100);
  return `${word}-${number}`;
}

function poeticSerenityDescription(score) {
  if (score >= 90)
    return "سكونٌ صافٍ يهبّ على روحك كنسيم فجرٍ بعيد… الليلة كانت متوازنة كقلبٍ يطمئن.";
  if (score >= 75)
    return "موجة هادئة مرّت بك، هناك سلام يلمع تحت جلد الليل حتى لو بقيت أسئلة صغيرة.";
  if (score >= 60)
    return "ظلال خفيفة كانت حولك، لكن قلبك حافظ على إيقاعه الهادئ… نوم جيد يستحق الامتنان.";
  if (score >= 40)
    return "كانت الليلة مثل ممرّ طويل… خطواتك كانت ثقيلة قليلًا، لكنك وصلت في النهاية.";
  return "كأن النوم كان بعيدًا عن متناولك هذه المرة… لا بأس، فحتى الأرق جزء من الحكاية.";
}

// ==============================
// تفعيل سمة الغرفة
// ==============================
function applyRoomTheme(roomKey) {
  state.room = roomKey;

  document.body.classList.remove(
    "room-Global",
    "room-Nomad",
    "room-Hearth",
    "room-Cave",
    "room-Tide",
    "room-Nest",
    "room-Aurora"
  );
  document.body.classList.add(`room-${roomKey}`);

  const cfg = roomConfig[roomKey];
  if (cfg) {
    if (roomNameLabel) roomNameLabel.textContent = cfg.labelFull;
    if (roomTaglineEl) roomTaglineEl.textContent = cfg.tagline;
  }
}

// ==============================
// الصوت (اختياري)
// ==============================
let soundEnabled = true;
let currentAudio = null;

function startRoomSound() {
  if (!soundEnabled) return;
  const cfg = roomConfig[state.room];
  if (!cfg || !cfg.soundUrl) return;

  stopRoomSound();

  currentAudio = new Audio(cfg.soundUrl);
  currentAudio.loop = true;
  currentAudio.volume = 0.35;
  currentAudio.play().catch(() => {});
}

function stopRoomSound() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// ==============================
// المدة
// ==============================
function computeDurationMinutes(start, end) {
  if (!start || !end) return null;
  const diffMs = end - start;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  return diffMinutes;
}

function formatDuration(start, end) {
  const diffMinutes = computeDurationMinutes(start, end);
  if (!diffMinutes) return "غير معروفة";
  if (diffMinutes < 60) return `${diffMinutes} دقيقة تقريبًا`;
  const hours = (diffMinutes / 60).toFixed(1);
  return `${hours} ساعة (تقريبًا)`;
}

// ==============================
// عدّاد النائمين
// ==============================
let sleepersBase = 2600 + Math.floor(Math.random() * 200);

function tickSleepers() {
  if (!sleepersCountEl) return;
  const delta = Math.floor(Math.random() * 7) - 3;
  sleepersBase = Math.max(1200, sleepersBase + delta);
  sleepersCountEl.textContent = sleepersBase.toString();
}
setInterval(tickSleepers, 5000);

// ==============================
// حفظ الجلسة في Firestore
// ==============================
async function saveSessionToFirestore() {
  try {
    await addDoc(collection(db, "sleepSessions"), {
      uid: currentUser ? currentUser.uid : null,
      nickname: state.nickname || null,
      mood: state.mood || null,
      room: state.room || null,
      serenity: state.serenity || null,
      dreamSignature: state.dreamSignature || null,
      durationMinutes: computeDurationMinutes(
        state.startTime,
        state.endTime
      ),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("خطأ في حفظ الجلسة في Firestore:", err);
  }
}

// ==============================
// الأحداث
// ==============================

// بداية الرحلة
if (btnStart) {
  btnStart.addEventListener("click", () => {
    showScreen("screen-auth");
  });
}

// الاسم المستعار
if (btnAuthSkip) {
  btnAuthSkip.addEventListener("click", () => {
    state.nickname = null;
    showScreen("screen-intention");
  });
}

if (btnAuthContinue) {
  btnAuthContinue.addEventListener("click", () => {
    const value = inputName ? inputName.value.trim() : "";
    state.nickname = value || null;
    showScreen("screen-intention");
  });
}

// إعلان النية
if (btnGoingToSleep) {
  btnGoingToSleep.addEventListener("click", () => {
    state.startTime = Date.now();
    showScreen("screen-mood");
  });
}

// الحالة النفسية
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.mood = btn.dataset.mood;
    showScreen("screen-room");
  });
});

// اختيار الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    roomButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    const roomKey = btn.dataset.room;
    applyRoomTheme(roomKey);
    showScreen("screen-message");
  });
});

// رسالة الغد
if (btnSkipMessage) {
  btnSkipMessage.addEventListener("click", () => {
    state.userMessage = null;
    showScreen("screen-map");
    startRoomSound();
  });
}

if (btnSendMessage) {
  btnSendMessage.addEventListener("click", () => {
    const msg = textareaMessage ? textareaMessage.value.trim() : "";
    state.userMessage = msg || null;
    showScreen("screen-map");
    startRoomSound();
  });
}

// الصوت
if (btnToggleSound) {
  btnToggleSound.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btnToggleSound.textContent = "الصوت: مفعّل";
      btnToggleSound.classList.add("active");
      startRoomSound();
    } else {
      btnToggleSound.textContent = "الصوت: متوقّف";
      btnToggleSound.classList.remove("active");
      stopRoomSound();
    }
  });
}

// الاستيقاظ
if (btnWokeUp) {
  btnWokeUp.addEventListener("click", () => {
    state.endTime = Date.now();
    stopRoomSound();

    if (receivedMessageEl) {
      const randomMsg =
        anonymousMessages[
          Math.floor(Math.random() * anonymousMessages.length)
        ];
      receivedMessageEl.textContent = `"${randomMsg}"`;
    }

    showScreen("screen-wake");
  });
}

// التقرير + الحفظ
if (btnShowReport) {
  btnShowReport.addEventListener("click", async () => {
    state.serenity = generateSerenityIndex();
    state.dreamSignature = generateDreamSignature();

    if (reportMood) {
      reportMood.textContent = state.mood ? state.mood : "غير محددة";
    }
    const roomCfg = roomConfig[state.room];
    if (reportRoom) {
      reportRoom.textContent = roomCfg ? roomCfg.label : state.room;
    }
    if (reportDuration) {
      reportDuration.textContent = formatDuration(
        state.startTime,
        state.endTime
      );
    }
    if (reportSerenity) {
      reportSerenity.textContent = `${state.serenity} / 100`;
    }
    if (reportDream) {
      reportDream.textContent = state.dreamSignature;
    }
    if (reportDescription) {
      reportDescription.textContent = poeticSerenityDescription(
        state.serenity
      );
    }

    await saveSessionToFirestore();
    showScreen("screen-report");
  });
}

// إعادة البداية
if (btnResetFlow) {
  btnResetFlow.addEventListener("click", () => {
    state.startTime = null;
    state.endTime = null;
    state.serenity = null;
    state.dreamSignature = null;
    if (textareaMessage) textareaMessage.value = "";
    if (inputName) inputName.value = "";
    moodButtons.forEach((b) => b.classList.remove("selected"));
    roomButtons.forEach((b) => b.classList.remove("selected"));
    applyRoomTheme("Nomad");
    soundEnabled = true;
    if (btnToggleSound) {
      btnToggleSound.textContent = "الصوت: مفعّل";
      btnToggleSound.classList.add("active");
    }
    showScreen("screen-welcome");
  });
}

// تهيئة أولية
applyRoomTheme("Nomad");
if (btnToggleSound) {
  btnToggleSound.classList.add("active");
  btnToggleSound.textContent = "الصوت: مفعّل";
}
