// auth.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { auth } from "./firebase.js";

// عناصر الواجهة
const tabs = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".form");
const messageEl = document.getElementById("auth-message");

// نماذج
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const resetForm = document.getElementById("reset-form");

// دالة لمسطرة الرسائل
function showMessage(text, type = "success") {
  if (!messageEl) return;
  messageEl.textContent = text || "";
  messageEl.classList.remove("error", "success");
  if (text) {
    messageEl.classList.add(type);
  }
}

// التحكم في التابات
function setActiveForm(targetId) {
  // زر التاب
  tabs.forEach((btn) => {
    if (btn.dataset.target === targetId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // النماذج
  forms.forEach((form) => {
    if (form.id === targetId) {
      form.classList.add("active");
    } else {
      form.classList.remove("active");
    }
  });

  // تنظيف الرسالة عند تغيير التاب
  showMessage("");
}

// عند الضغط على التابات
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target) {
      setActiveForm(target);
    }
  });
});

// الروابط الداخلية (مثل "نسيت كلمة المرور؟")
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.open;
    if (target) {
      setActiveForm(target);
    }
  });
});

// ===== تسجيل الدخول =====
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("جاري الدخول بهدوء…", "success");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      showMessage("تم تسجيل الدخول بنجاح. نومًا هادئًا 🌙", "success");

      // هنا يمكنك إعادة التوجيه لصفحة أخرى بعد تسجيل الدخول
      // window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      let msg = "تعذر تسجيل الدخول. تأكد من البيانات.";

      if (err.code === "auth/user-not-found") msg = "لا يوجد حساب بهذا البريد.";
      else if (err.code === "auth/wrong-password") msg = "كلمة المرور غير صحيحة.";
      else if (err.code === "auth/invalid-email") msg = "صيغة البريد غير صحيحة.";

      showMessage(msg, "error");
    }
  });
}

// ===== إنشاء حساب =====
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("جاري إنشاء حسابك الهادئ…", "success");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (password.length < 6) {
      showMessage("الرجاء اختيار كلمة مرور من 6 أحرف فأكثر.", "error");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      showMessage("تم إنشاء حسابك في SleepShare بنجاح 🌌", "success");

      // يمكنك تحويل المستخدم مباشرة بعد التسجيل
      // window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      let msg = "تعذر إنشاء الحساب. حاول مرة أخرى.";

      if (err.code === "auth/email-already-in-use")
        msg = "هذا البريد مستخدم بالفعل.";
      else if (err.code === "auth/invalid-email")
        msg = "صيغة البريد الإلكتروني غير صحيحة.";
      else if (err.code === "auth/weak-password")
        msg = "كلمة المرور ضعيفة. اختر كلمة أقوى.";

      showMessage(msg, "error");
    }
  });
}

// ===== استرجاع كلمة المرور =====
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("جاري إرسال الرابط…", "success");

    const email = document.getElementById("reset-email").value.trim();

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage(
        "تم إرسال رابط استرجاع كلمة المرور إلى بريدك (تحقق من صندوق الرسائل والرسائل غير المرغوب فيها).",
        "success"
      );
    } catch (err) {
      console.error(err);
      let msg = "تعذر إرسال رابط الاسترجاع.";

      if (err.code === "auth/user-not-found")
        msg = "لا يوجد حساب مرتبط بهذا البريد.";
      else if (err.code === "auth/invalid-email")
        msg = "صيغة البريد الإلكتروني غير صحيحة.";

      showMessage(msg, "error");
    }
  });
}
