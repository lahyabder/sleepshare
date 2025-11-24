// إخفاء كل الصفحات
function hideAll() {
  document.querySelectorAll(".sleep-screen").forEach(s => {
    s.style.display = "none";
  });
}

// إظهار صفحة
function show(id) {
  hideAll();
  document.getElementById(id).style.display = "block";
}

/* -----------------------------
   1) زر: ابدأ / تسجيل الدخول
------------------------------*/
document.getElementById("btn-start").addEventListener("click", () => {
  show("screen-auth");
});

/* -----------------------------
   2) تسجيل الدخول أو تخطيه
------------------------------*/
document.getElementById("btn-auth-skip").addEventListener("click", () => {
  show("screen-intention");
});

document.getElementById("btn-auth-continue").addEventListener("click", () => {
  show("screen-intention");
});

/* -----------------------------
   3) إعلان النية
------------------------------*/
document.getElementById("btn-going-to-sleep").addEventListener("click", () => {
  show("screen-mood");
});

/* -----------------------------
   4) اختيار الحالة النفسية
------------------------------*/
let selectedMood = "";

document.querySelectorAll(".mood-option").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMood = btn.dataset.mood;
    show("screen-message");
  });
});

/* -----------------------------
   5) رسالة الغد
------------------------------*/
document.getElementById("btn-send-message").addEventListener("click", () => {
  show("screen-map");
});

document.getElementById("btn-skip-message").addEventListener("click", () => {
  show("screen-map");
});

/* -----------------------------
   6) خريطة السكون
------------------------------*/
document.getElementById("btn-woke-up").addEventListener("click", () => {
  show("screen-wake");
});

/* -----------------------------
   7) رسالة مجهول
------------------------------*/
document.getElementById("btn-show-report").addEventListener("click", () => {
  // تعبئة التقرير
  document.getElementById("report-mood").textContent = selectedMood;
  document.getElementById("report-duration").textContent = "تقريبًا 7 ساعات";
  document.getElementById("report-serenity").textContent = "78%";
  document.getElementById("report-dream").textContent = "Wave-Light-3";

  show("screen-report");
});

/* -----------------------------
   8) العودة للب
