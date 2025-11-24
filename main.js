// ============================
//  SleepShare – تدفّق الشاشات
// ============================

// دالة مساعده لإظهار شاشة وإخفاء البقية
function showScreen(id) {
    document.querySelectorAll(".sleep-screen").forEach(s => s.classList.remove("is-active"));
    document.getElementById(id).classList.add("is-active");
}

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
document.querySelectorAll(".mood-option").forEach(btn => {
    btn.addEventListener("click", () => {
        window.selectedMood = btn.dataset.mood;
        showScreen("screen-message");
    });
});

// ========== 5. رسالة الغد ==========
document.getElementById("btn-skip-message").addEventListener("click", () => {
    window.tomorrowMessage = "— بدون رسالة —";
    showScreen("screen-map");
});

document.getElementById("btn-send-message").addEventListener("click", () => {
    const msg = document.getElementById("tomorrow-message").value.trim();
    window.tomorrowMessage = msg === "" ? "— بدون رسالة —" : msg;
    showScreen("screen-map");
});

// ========== 6. خريطة السكون ==========
let sleepers = Math.floor(Math.random() * 3000) + 1500; // رقم رمزي للنائمين
document.getElementById("sleepers-count").textContent = sleepers;

document.getElementById("btn-woke-up").addEventListener("click", () => {
    document.getElementById("received-message").textContent = window.tomorrowMessage;
    showScreen("screen-wake");
});

// ========== 7. رسالة بعد الاستيقاظ ==========
document.getElementById("btn-show-report").addEventListener("click", () => {
    // توليد بيانات رمزية للتقرير
    const moods = {
        Wave: "هدوء",
        Stone: "تعب",
        Cloud: "تشتّت",
        Echo: "حنين",
        Light: "تفاؤل",
        Drift: "شرود",
        Focus: "صفاء",
        Ease: "راحة"
    };

    const dreamCodes = ["Aurora", "Drift", "Echo", "Nomad", "Wave", "Cave"];
    const dreamPick = dreamCodes[Math.floor(Math.random() * dreamCodes.length)];

    let randomMinutes = Math.floor(Math.random() * 50);
    let randomSerenity = Math.floor(Math.random() * 30) + 70;
    let dreamSignature = `${dreamPick}-${Math.floor(Math.random() * 99)}`;

    document.getElementById("report-mood").textContent =
        moods[window.selectedMood] || "—";

    document.getElementById("report-duration").textContent =
        (randomMinutes / 60).toFixed(1) + " ساعة (تقريبًا)";

    document.getElementById("report-serenity").textContent =
        randomSerenity + " / 100";

    document.getElementById("report-dream").textContent =
        dreamSignature;

    showScreen("screen-report");
});

// ========== 8. العودة للبداية ==========
document.getElementById("btn-reset-flow").addEventListener("click", () => {
    showScreen("screen-welcome");
});
