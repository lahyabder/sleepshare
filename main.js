const screens = [
  "screen-welcome",
  "screen-auth",
  "screen-intention",
  "screen-mood",
  "screen-message",
  "screen-map",
  "screen-wake",
  "screen-report",
];

let currentScreen = "screen-welcome";
let sessionStartTime = null;
let selectedMood = null;

// إظهار شاشة معينة وإخفاء الباقي
function showScreen(id) {
  screens.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    if (s === id) {
      el.classList.add("active-screen");
    } else {
      el.classList.remove("active-screen");
    }
  });
  currentScreen = id;
}

// رقم عشوائي بين min و max
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("DOMContentLoaded", () => {
  // تأكد أن البداية من شاشة الترحيب
  showScreen("screen-welcome");

  // 1) زر "ابدأ / تسجيل الدخول" -> شاشة الدخول
  const btnStart = document.getElementById("btn-start");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      showScreen("screen-auth");
    });
  }

  // 2) شاشة الدخول: تخطي أو متابعة -> إعلان النية
  const btnAuthSkip = document.getElementById("btn-auth-skip");
  const btnAuthContinue = document.getElementById("btn-auth-continue");
  [btnAuthSkip, btnAuthContinue].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        showScreen("screen-intention");
      });
    }
  });

  // 3) إعلان النية -> اختيار الحالة النفسية
  const btnGoingToSleep = document.getElementById("btn-going-to-sleep");
  if (btnGoingToSleep) {
    btnGoingToSleep.addEventListener("click", () => {
      showScreen("screen-mood");
    });
  }

  // 4) اختيار الحالة النفسية -> رسالة الغد
  document.querySelectorAll(".mood-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMood = btn.dataset.mood || btn.textContent.trim();
      showScreen("screen-message");
    });
  });

  // 5) رسالة الغد -> خريطة السكون
  const btnSkipMessage = document.getElementById("btn-skip-message");
  const btnSendMessage = document.getElementById("btn-send-message");

  [btnSkipMessage, btnSendMessage].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        const msg = document.getElementById("tomorrow-message");
        if (msg && btn === btnSendMessage) {
          // الآن مجرد تسجيل في الكونسول – لاحقاً يمكن ربطه بقاعدة بيانات
          console.log("Tomorrow note:", msg.value);
        }

        // عدد النائمين الآن (رمزي عشوائي)
        const sleepersCount = document.getElementById("sleepers-count");
        if (sleepersCount) {
          sleepersCount.textContent = randInt(120, 8000);
        }

        // بداية جلسة النوم
        sessionStartTime = Date.now();
        showScreen("screen-map");
      });
    }
  });

  // 6) "أنا استيقظت الآن" -> رسالة مجهولة
  const btnWokeUp = document.getElementById("btn-woke-up");
  if (btnWokeUp) {
    btnWokeUp.addEventListener("click", () => {
      const received = document.getElementById("received-message");
      if (received) {
        const messages = [
          "كل ليلة فرصة صغيرة لنعتني بقلبنا قبل أن ننام.",
          "هناك من ينام الآن وهو ممتن لوجود أرواح هادئة مثلك في هذا العالم.",
          "نم بسلام، فالعالم لا يزال يدور حتى وأنت تستريح.",
          "أحيانًا يكفي أن نُغمض أعيننا لنقول لأنفسنا: لقد فعلت ما أستطيع اليوم.",
        ];
        received.textContent =
          messages[randInt(0, messages.length - 1)];
      }
      showScreen("screen-wake");
    });
  }

  // 7) عرض تقرير النوم -> شاشة التقرير
  const btnShowReport = document.getElementById("btn-show-report");
  if (btnShowReport) {
    btnShowReport.addEventListener("click", () => {
      // الحالة عند النوم
      const moodSpan = document.getElementById("report-mood");
      if (moodSpan) {
        moodSpan.textContent = selectedMood || "—";
      }

      // مدة الجلسة التقريبية
      const durationSpan = document.getElementById("report-duration");
      if (durationSpan) {
        let durationText = "—";
        if (sessionStartTime) {
          const ms = Date.now() - sessionStartTime;
          const hours = ms / (1000 * 60 * 60);
          const rounded = Math.max(0.1, Math.round(hours * 10) / 10);
          durationText = `${rounded} ساعة (تقريبًا)`;
        }
        durationSpan.textContent = durationText;
      }

      // مؤشر السكينة
      const serenitySpan = document.getElementById("report-serenity");
      if (serenitySpan) {
        serenitySpan.textContent = `${randInt(60, 99)} / 100`;
      }

      // توقيع الحلم
      const dreamSpan = document.getElementById("report-dream");
      if (dreamSpan) {
        const sigs = [
          "Wave-Cloud-01",
          "Light-Nest-07",
          "Echo-Stone-03",
          "Aurora-Drift-11",
        ];
        dreamSpan.textContent = sigs[randInt(0, sigs.length - 1)];
      }

      showScreen("screen-report");
    });
  }

  // 8) إعادة البداية
  const btnReset = document.getElementById("btn-reset-flow");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      sessionStartTime = null;
      selectedMood = null;

      const msg = document.getElementById("tomorrow-message");
      if (msg) msg.value = "";

      showScreen("screen-welcome");
    });
  }
});
