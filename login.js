// login.js — منطق تسجيل الدخول في SleepShare

import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// عناصر الواجهة
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");

// عنصر لعرض الرسالة (اختياري: أضفه في login.html إن أحببت)
// <div id="auth-message" class="message"></div>
const messageBox = document.getElementById("auth-message");

// دالة مساعدة لعرض رسالة
function showMessage(text, type = "normal") {
  if (!messageBox) {
    if (type === "error") {
      alert(text);
    }
    return;
  }

  messageBox.textContent = text || "";
  messageBox.classList.remove("error", "success");

  if (type === "error") messageBox.classList.add("error");
  if (type === "success") messageBox.classList.add("success");
}

// تحويل أكواد Firebase إلى رسائل لطيفة
function mapFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "صيغة البريد الإلكتروني غير صحيحة.";
    case "auth/user-not-found":
      return "لا يوجد حساب بهذا البريد. جرّب إنشاء حساب جديد.";
    case "auth/wrong-password":
      return "كلمة المرور غير صحيحة، حاول مرة أخرى.";
    case "auth/too-many-requests":
      return "تم إيقاف المحاولات مؤقتًا بسبب محاولات عديدة. انتظر قليلًا ثم جرّب من جديد.";
    default:
      return "حدث خلل بسيط في الاتصال. حاول مرة أخرى بعد لحظات.";
  }
}

// لو كان المستخدم مسجّل دخول بالفعل → نأخذه مباشرة إلى تجربة النوم
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "sleep.html";
  }
});

// حدث الضغط على زر الدخول
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showMessage("أدخل البريد وكلمة المرور أولًا.", "error");
      return;
    }

    loginBtn.disabled = true;
    showMessage("يتم تسجيل الدخول بهدوء...", "normal");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("تم تسجيل الدخول بنجاح. جارٍ نقلك إلى رحلة النوم…", "success");

      setTimeout(() => {
        window.location.href = "sleep.html";
      }, 900);
    } catch (err) {
      console.error("Login error:", err);
      showMessage(mapFirebaseError(err.code), "error");
    } finally {
      loginBtn.disabled = false;
    }
  });
}
