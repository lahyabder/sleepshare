// main.js

// ⚠️ هام: يجب تعديل هذا الرابط لاحقاً ليتطابق مع عنوان خادم Node.js الخاص بك.
// حالياً، سنستخدم عنواناً وهمياً.
const SERVER_URL = 'http://localhost:3000'; 
const socket = io(SERVER_URL);

// توليد هوية مؤقتة (Ephemeral ID) للمستخدم لضمان المجهولية
const ephemeralId = 'USER-' + Math.random().toString(36).substring(2, 9);

// بيانات المستخدم الرمزية الأساسية
const userData = {
    ephemeralId: ephemeralId,
    geoCell: 'wide_area_id_placeholder', // سيتم استبدالها لاحقاً بموقع واسع
    chosenRoom: 'Nomad Room', // نستخدم غرفة افتراضية مؤقتاً
    moodSymbol: 'Wave' 
};

// عناصر واجهة المستخدم (لربط الأزرار والأماكن)
const goToSleepButton = document.getElementById('go-to-sleep-button');
const activeSleepersSpan = document.getElementById('active-sleepers');

// ===================================================
// أ. وظائف الاتصال بالسيرفر
// ===================================================

// الوظيفة التي تُنفذ عند الضغط على زر "أنا ذاهب للنوم الآن"
function handleGoToSleep() {
    console.log("إعلان النية: أنا ذاهب للنوم الآن...");
    
    // إرسال البيانات الرمزية إلى الخادم عبر Socket.IO
    socket.emit('join_sleep_session', userData);
    
    // تغيير واجهة المستخدم بعد الدخول في وضع السكون
    goToSleepButton.innerText = "في وضع السكون (اضغط للاستيقاظ)";
    goToSleepButton.classList.add('sleeping');
    
    // هنا يجب بدء مؤقت الـ 2 دقيقة قبل إطفاء الشاشة
    // (سنترك هذه الوظيفة معقدة لوقت لاحق)
}

// ربط الوظيفة بالزر عند تحميل الصفحة
if (goToSleepButton) {
    goToSleepButton.addEventListener('click', handleGoToSleep);
}

// ===================================================
// ب. استقبال التحديثات من الخادم
// ===================================================

// استقبال تحديثات خريطة السكون العالمية
socket.on('sleep_map_update', (data) => {
    // تتلقى البيانات كقائمة مجهولة من النقاط
    const count = data.length;
    console.log(`عدد النائمين الحاليين: ${count}`);
    
    // تحديث رقم النائمين في الواجهة
    if (activeSleepersSpan) {
        activeSleepersSpan.innerText = count;
    }
    
    // هنا يجب إضافة كود عرض النقاط على الخريطة البصرية (سنتجاهله الآن)
});

// رسائل التأكيد والخطأ
socket.on('connect', () => {
    console.log("تم الاتصال بخادم SleepShare بنجاح.");
});

socket.on('disconnect', () => {
    console.log("تم قطع الاتصال بالخادم.");
});
// ---------------------------
// منطق رحلة النوم في journey.html
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  // نتأكد أن هذه الصفحة هي journey (تحتوي على flow-container)
  const flowContainer = document.querySelector(".flow-container");
  if (!flowContainer) return;

  const screens = document.querySelectorAll(".sleep-screen");

  function showScreen(id) {
    screens.forEach((s) => {
      s.style.display = s.id === id ? "block" : "none";
    });

    // منطق خاص عند الدخول إلى خريطة السكون
    if (id === "screen-map") {
      const countSpan = document.getElementById("sleepers-count");
      const randomCount = Math.floor(Math.random() * 4000) + 200; // رقم رمزي
      countSpan.textContent = randomCount;
      sleepState.sleepersCount = randomCount;
    }

    // عند عرض التقرير نبني الأرقام
    if (id === "screen-report") {
      buildReport();
    }
  }

  // حالة الجلسة الحالية
  const sleepState = {
    name: "",
    mood: "",
    message: "",
    startTime: null,
    endTime: null,
    sleepersCount: 0,
  };

  // إظهار أول شاشة
  showScreen("screen-welcome");

  // عناصر الشاشات
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

  // 1) من الترحيب إلى شاشة الدخول
  btnStart.addEventListener("click", () => {
    showScreen("screen-auth");
  });

  // 2) تخطي أو حفظ الاسم والانتقال
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

  // 4) اختيار الحالة النفسية
  moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // إزالة التحديد عن البقية
      moodButtons.forEach((b) => b.classList.remove("pill-active"));

      btn.classList.add("pill-active");
      sleepState.mood = btn.dataset.mood || "";

      // الانتقال مباشرة إلى الرسالة
      showScreen("screen-message");
    });
  });

  // 5) رسالة الغد
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

  // بناء التقرير الرمزي
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

      // نص بسيط لمدة الجلسة
      if (diffMinutes < 20) {
        durationText = diffMinutes + " دقيقة (قيلولة قصيرة جدًا)";
        serenity = "منخفضة – جرّب تمديد وقت نومك.";
        dream = "Dr-Short-" + diffMinutes;
      } else if (diffMinutes < 90) {
        durationText = diffMinutes + " دقيقة (نوم خفيف تجريبي)";
        serenity = "متوسطة – بداية علاقة ألطف مع النوم.";
        dream = "Dr-Mid-" + diffMinutes;
      } else {
        durationText = diffMinutes + " دقيقة (نوم عميق نسبيًا)";
        serenity = "مرتفعة – جلسة سكون محترمة.";
        dream = "Dr-Deep-" + diffMinutes;
      }
    }

    document.getElementById("report-mood").textContent = moodText;
    document.getElementById("report-duration").textContent = durationText;
    document.getElementById("report-serenity").textContent = serenity;
    document.getElementById("report-dream").textContent = dream;
  }
});
