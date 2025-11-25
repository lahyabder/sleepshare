// login.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// (اختياري) ضبط لغة رسائل Firebase إلى العربية
auth.languageCode = "ar";

function mapFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "صيغة البريد الإلكتروني غير صحيحة.";
    case "auth/user-not-found":
      return "لا يوجد حساب بهذا البريد.";
    case "auth/wrong-password":
      return "كلمة المرور غير صحيحة.";
    case "auth/too-many-requests":
      return "عدد محاولات كبير. يرجى الانتظار قليلًا قبل المحاولة مرة أخرى.";
    default:
      return "حدث خطأ غير متوقع. حاول مرة أخرى بعد لحظات.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");

  if (!emailInput || !passwordInput || !loginBtn) return;

  // لو المستخدم مسجّل دخول بالفعل → نحوله مباشرة
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // غيّر الوجهة لو تحب (مثلاً: avatar.html أو sleep.html)
      window.location.href = "home.html";
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("من فضلك أدخل البريد الإلكتروني وكلمة المرور.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "جارٍ تسجيل الدخول...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // نجاح → تحويل لصفحة التطبيق
      window.location.href = "home.html"; // غيّرها حسب مسارك
    } catch (error) {
      console.error("Login error:", error);
      alert(mapFirebaseError(error.code));
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "دخول";
    }
  });
});
