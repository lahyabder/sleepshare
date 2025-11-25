// firebase.js — ملف نظيف وصحيح بالكامل

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtuWAOF9bCaPGosu0M44NtgL8XhzxNWec",
  authDomain: "sleepshare-fbe2a.firebaseapp.com",
  projectId: "sleepshare-fbe2a",
  storageBucket: "sleepshare-fbe2a.firebasestorage.app",
  messagingSenderId: "357111824676",
  appId: "1:357111824676:web:a425f1db67ea57bef3f3b1",
  measurementId: "G-9BTE9JG8NC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
