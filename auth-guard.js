import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// حراسة الصفحة: لو ما فيه مستخدم مسجل، نرجّعه لصفحة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // المستخدم غير مسجل الدخول → نعيده لـ login.html
    window.location.href = "login.html";
  } else {
    // هنا يمكنك لاحقًا عرض البريد أو الاسم، إن أحببت
    console.log("مستخدم مسجل الدخول:", user.email);
  }
});

// زر تسجيل الخروج في تقرير النوم
const logoutBtn = document.getElementById("btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "home.html";
      })
      .catch((err) => {
        alert("حدث خطأ أثناء تسجيل الخروج: " + err.message);
      });
  });
}
