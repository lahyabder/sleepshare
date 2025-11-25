// reset.js
import { auth } from "./firebase.js";
import {
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// نجعل رسائل Firebase بالعربية (اختياري)
auth.languageCode = "ar";

function mapFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "صيغة البريد الإلكتروني غير صحيحة.";
    case "auth/user-not-found":
      return "لا يوجد حساب مسجّل بهذا البريد.";
    case "auth/too-many-requests":
      return "عدد محاولات كبير. يرجى الانتظار قليلًا قبل المحاولة مرة أخرى.";
    default:
      return "حدث خطأ أثناء الإرسال. حاول مرة أخرى بعد لحظات.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const resetBtn = document.getElementById("reset-btn");

  if (!emailInput || !resetBtn) return;

  resetBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      alert("من فضلك أدخل البريد الإلكتروني أولًا.");
      return;
    }

    resetBtn.disabled = true;
    const originalText = resetBtn.textContent;
    resetBtn.textContent = "جارٍ الإرسال...";

    try {
      await sendPasswordResetEmail(auth, email);
      alert("تم إرسال رابط استرجاع كلمة المرور إلى بريدك الإلكتروني.");
    } catch (error) {
      console.error("Reset error:", error);
      alert(mapFirebaseError(error.code));
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = originalText;
    }
  });
});
