// auth-guard.js — حارس الصفحات المحمية في SleepShare

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// إذا لم يكن المستخدم مسجّلاً → نرسله إلى صفحة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// زر تسجيل الخروج (اختياري: لو وُجد في الصفحة)
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    try {
      await signOut(auth);
      window.location.href = "home.html";
    } catch (err) {
      console.error("Logout error:", err);
      alert("حدث خطأ أثناء تسجيل الخروج، حاول مرة أخرى.");
      logoutBtn.disabled = false;
    }
  });
}
