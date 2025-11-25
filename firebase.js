// firebase.js
// استخدام أحدث نسخة من Firebase (v11)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// --- إعدادات مشروعك (جاهزة وصحيحة) ---
const firebaseConfig = {
  apiKey: "AIzaSyCtuWAOF9bCaPGosu0M44NtgL8XhzxNWec",
  authDomain: "sleepshare-fbe2a.firebaseapp.com",
  projectId: "sleepshare-fbe2a",
  storageBucket: "sleepshare-fbe2a.firebasestorage.app",
  messagingSenderId: "357111824676",
  appId: "1:357111824676:web:a425f1db67ea57bef3f3b1",
  measurementId: "G-9BTE9JG8NC"
};

// --- تشغيل Firebase ---
export const app = initializeApp(firebaseConfig);

// --- Auth مثالي مع اللغة العربية ---
export const auth = getAuth(app);

// إعداد لغة النظام إلى العربية (مهم جدًا)
auth.languageCode = "ar";
