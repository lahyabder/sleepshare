import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* --------------------------------------------------
   حراسة الصفحة: منع الدخول لغير المسجلين
-------------------------------------------------- */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // المستخدم غير مسجل الدخول -> نعيده للصفحة الرئيسية
    window.location.href = "home.html";
  } else {
    console.log("مستخدم مسجل الدخول:", user.email);
  }
});

/* --------------------------------------------------
   زر تسجيل الخروج
-------------------------------------------------- */

const logoutBtn = document.getElementById("btn-logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // بعد تسجيل الخروج نرجع لصفحة تسجيل الدخول
        window.location.href = "login.html";
      })
      .catch((err) => {
        alert("حدث خطأ أثناء تسجيل الخروج: " + err.message);
      });
  });
}
