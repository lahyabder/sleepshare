// حالة بسيطة نخزن فيها رحلة المستخدم
const state = {
  name: null,
  mood: null,
  room: null,
  startTime: null,
  message: null,
};

// عناصر الشاشات
const screens = Array.from(document.querySelectorAll(".sleep-screen"));

function showScreen(id) {
  screens.forEach((s) => {
    s.classList.toggle("active", s.id === id);
  });
}

// اختيار العناصر
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
const btnWokeUp = document.getElementById("btn-woke-up");

const receivedMessageEl = document.getElementById("received-message");
const btnShowReport = document.getElementById("btn-show-report");

// عناصر التقرير
const reportNameEl = document.getElementById("report-name");
const reportMoodEl = document.getElementById("report-mood");
const reportRoomEl = document.getElementById("report-room");
const reportDurationEl = document.getElementById("report-duration");
const reportSerenityEl = document.getElementById("report-serenity");
const reportDreamEl = document.getElementById("report-dream");
const btnResetFlow = document.getElementById("btn-reset-flow");

// 1) البداية -> شاشة التسجيل
btnStart.addEventListener("click", () => {
  showScreen("screen-auth");
});

// 2) تجاوز الاسم أو المتابعة
btnAuthSkip.addEventListener("click", () => {
  state.name = null;
  showScreen("screen-intention");
});

btnAuthContinue.addEventListener("click", () => {
  const value = inputName.value.trim();
  state.name = value || null;
  showScreen("screen-intention");
});

// 3) إعلان النية -> يبدأ التوقيت
btnGoingToSleep.addEventListener("click", () => {
  state.startTime = Date.now();
  showScreen("screen-mood");
});

// 4) اختيار المزاج
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.mood = btn.dataset.mood;
    showScreen("screen-room");
  });
});

// 5) اختيار الغرفة
roomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    roomButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.room = btn.dataset.room;
    showScreen("screen-message");
  });
});

// 6) رسالة الغد
btnSkipMessage.addEventListener("click", () => {
  state.message = null;
  openSleepMap();
});

btnSendMessage.addEventListener("click", () => {
  const msg = textareaMessage.value.trim();
  state.message = msg || null;
  openSleepMap();
});

function openSleepMap() {
  // رقم عشوائي للنائمين
  const sleepers = randomInt(1200, 9000);
  sleepersCountEl.textContent = sleepers.toLocaleString("ar-SA");
  showScreen("screen-map");
}

// 7) عند الاستيقاظ
btnWokeUp.addEventListener("click", () => {
  // رسالة رمزية عشوائية
  const messages = [
    "كل ليلة فرصة صغيرة لنعيد ترتيب أرواحنا بهدوء.",
    "أنت جزء من خريطة هادئة، حتى لو لم ترَ الآخرين.",
    "السكون الذي صنعته هذه الليلة سيعود إليك في الغد.",
    "شكرًا لأنك اخترت أن تنام مع العالم لا ضده.",
    "الراحة ليست كسلاً، بل عناية ناعمة بنفسك.",
  ];

  const randomMsg = messages[randomInt(0, messages.length - 1)];

  // إن كتب المستخدم رسالة، يمكن أن نعرض جملة تدل عليها
  if (state.message) {
    receivedMessageEl.textContent =
      randomMsg +
      " \n\nرسالة مجهولة كانت تنتظر أحدًا ما هذه الليلة، كما تنتظرك رسالة أخرى في الغد.";
  } else {
    receivedMessageEl.textContent = randomMsg;
  }

  showScreen("screen-wake");
});

// 8) عرض التقرير
btnShowReport.addEventListener("click", () => {
  reportNameEl.textContent = state.name || "ضيف هادئ";

  reportMoodEl.textContent = state.mood || "لم يتم تسجيل الحالة";
  reportRoomEl.textContent = state.room || "غرفة افتراضية هادئة";

  // حساب مدة الجلسة تقريبية
  if (state.startTime) {
    const diffMs = Date.now() - state.startTime;
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    let label = "";
    if (hours > 0) {
      label += hours + " ساعة ";
    }
    label += minutes + " دقيقة تقريبًا";
    reportDurationEl.textContent = label;
  } else {
    reportDurationEl.textContent = "مدة غير محدّدة (تجريبية)";
  }

  // مؤشر سكينة عشوائي رمزي
  const serenity = randomInt(60, 98);
  reportSerenityEl.textContent = serenity + " / 100";

  // Dream Signature رمزي
  reportDreamEl.textContent = generateDreamSignature();

  showScreen("screen-report");
});

// 9) إعادة الرحلة من البداية
btnResetFlow.addEventListener("click", () => {
  state.name = null;
  state.mood = null;
  state.room = null;
  state.startTime = null;
  state.message = null;

  inputName.value = "";
  textareaMessage.value = "";
  moodButtons.forEach((b) => b.classList.remove("selected"));
  roomButtons.forEach((b) => b.classList.remove("selected"));

  showScreen("screen-welcome");
});

/* أدوات مساعدة صغيرة */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDreamSignature() {
  const letters = ["A", "E", "N", "Q", "S", "L", "M", "D"];
  const symbols = ["⋆", "❊", "✦", "✺", "☽", "☄"];
  const part1 =
    letters[randomInt(0, letters.length - 1)] +
    letters[randomInt(0, letters.length - 1)];
  const part2 = randomInt(1, 9);
  const part3 = symbols[randomInt(0, symbols.length - 1)];
  return `${part1}-${part2}${part3}`;
}
