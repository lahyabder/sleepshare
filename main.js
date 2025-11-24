// ---------------------------
// منطق رحلة النوم في journey.html
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const flowContainer = document.querySelector(".flow-container");
  if (!flowContainer) return;

  const screens = document.querySelectorAll(".sleep-screen");

  function showScreen(id) {
    screens.forEach((s) => {
      s.style.display = s.id === id ? "block" : "none";
    });

    if (id === "screen-map") {
      const countSpan = document.getElementById("sleepers-count");
      const randomCount = Math.floor(Math.random() * 4000) + 200;
      countSpan.textContent = randomCount;
      sleepState.sleepersCount = randomCount;
    }

    if (id === "screen-report") {
      buildReport();
    }
  }

  const sleepState = {
    name: "",
    mood: "",
    message: "",
    startTime: null,
    endTime: null,
    sleepersCount: 0,
  };

  showScreen("screen-welcome");

  const btnStart = document.getElementById("btn-start");
  const btnAuthContinue = document.getElementById("btn-auth-continue");
  const btnAuthSkip = document.getElementById("btn-auth-skip");
  const inputName = document.getElementById("input-name");

  const btnGoingToSleep = document.getElementById("btn-going-to-sleep");

  const moodButtons = document.querySelectorAll(".mood-option");

  const textareaMessage = document.getElementById("tomorrow-message");
  const btnSendMessage = document.getElementById("btn-send-message");
  const btnSkipMessage = document.getElementById("btn-skip-message");

  const btnWokeUp = document.getElementById("btn-woke-up");
  const btnShowReport = document.getElementById("btn-show-report");
  const btnResetFlow = document.getElementById("btn-reset-flow");

  // 1) الترحيب → الدخول
  btnStart.addEventListener("click", () => {
    showScreen("screen-auth");
  });

  // 2) الاسم أو تخطي
  btnAuthSkip.addEventListener("click", () => {
    sleepState.name = "";
    showScreen("screen-intention");
  });

  btnAuthContinue.addEventListener("click", () => {
    sleepState.name = (inputName.value || "").trim();
    showScreen("screen-intention");
  });

  // 3) إعلان النية
  btnGoingToSleep.addEventListener("click", () => {
    sleepState.startTime = new Date();
    showScreen("screen-mood");
  });

  // 4) اختيار المزاج
  moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      moodButtons.forEach((b) => b.classList.remove("pill-active"));
      btn.classList.add("pill-active");
      sleepState.mood = btn.dataset.mood || "";
      showScreen("screen-message");
    });
  });

  // 5) كتابة رسالة أو تخطي
  btnSendMessage.addEventListener("click", () => {
    sleepState.message = (textareaMessage.value || "").trim();
    showScreen("screen-map");
  });

  btnSkipMessage.addEventListener("click", () => {
    sleepState.message = "";
    showScreen("screen-map");
  });

  // 6) عند الاستيقاظ
  btnWokeUp.addEventListener("click", () => {
    sleepState.endTime = new Date();
    showScreen("screen-wake");
  });

  // 7) عرض التقرير
  btnShowReport.addEventListener("click", () => {
    showScreen("screen-report");
  });

  // 8) إعادة البداية
  btnResetFlow.addEventListener("click", () => {
    textareaMessage.value = "";
    inputName.value = "";
    sleepState.mood = "";
    sleepState.message = "";
    sleepState.startTime = null;
    sleepState.endTime = null;

    moodButtons.forEach((b) => b.classList.remove("pill-active"));
    showScreen("screen-welcome");
  });

  // بناء التقرير
  function buildReport() {
    const moodMap = {
      Wave: "هدوء (Wave)",
      Stone: "تعب (Stone)",
      Cloud: "تشتّت (Cloud)",
      Echo: "حنين (Echo)",
      Light: "تفاؤل (Light)",
      Drift: "شرود (Drift)",
      Focus: "صفاء (Focus)",
      Ease: "راحة (Ease)",
    };

    const moodText =
      sleepState.mood && moodMap[sleepState.mood]
        ? moodMap[sleepState.mood]
        : "لم تُحدَّد";

    let durationText = "غير معروفة";
    let serenity = "—";
    let dream = "—";

    if (sleepState.startTime && sleepState.endTime) {
      const diffMs = sleepState.endTime - sleepState.startTime;
      const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

      if (diffMinutes < 20) {
        durationText = diffMinutes + " دقيقة (قيلولة قصيرة جدًا)";
        serenity = "منخفضة – جرّب تمديد النوم.";
        dream = "Dr-Short-" + diffMinutes;
      } else if (diffMinutes < 90) {
        durationText = diffMinutes + " دقيقة (نوم خفيف)";
        serenity = "متوسطة – علاقة لطيفة مع النوم.";
        dream = "Dr-Mid-" + diffMinutes;
      } else {
        durationText = diffMinutes + " دقيقة (نوم أعمق)";
        serenity = "مرتفعة – جلسة سكون ممتازة.";
        dream = "Dr-Deep-" + diffMinutes;
      }
    }

    document.getElementById("report-mood").textContent = moodText;
    document.getElementById("report-duration").textContent = durationText;
    document.getElementById("report-serenity").textContent = serenity;
    document.getElementById("report-dream").textContent = dream;
  }
});
