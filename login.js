import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((err) => alert("خطأ: " + err.message));
});
