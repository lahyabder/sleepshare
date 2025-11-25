import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById("reset-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;

  sendPasswordResetEmail(auth, email)
    .then(() => alert("تم إرسال رابط الاسترجاع إلى بريدك الإلكتروني"))
    .catch((err) => alert("خطأ: " + err.message));
});
