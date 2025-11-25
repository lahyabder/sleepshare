// auth.js
import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// إذا كان المستخدم مسجّل دخول بالفعل → ارسله مباشرة لـ index.html
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'index.html';
  }
});

// تبادل التبويبات
const tabs = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.form');
const messageBox = document.getElementById('auth-message');

function showForm(targetId) {
  forms.forEach(f => f.classList.toggle('active', f.id === targetId));
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetId));
  messageBox.textContent = '';
  messageBox.className = 'message';
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => showForm(tab.dataset.target));
});

document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', () => showForm(btn.dataset.open));
});

function setMessage(text, type = 'error') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

// تسجيل الدخول
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMessage('تم تسجيل الدخول بنجاح، جاري نقلك إلى SleepShare…', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } catch (err) {
    console.error(err);
    let msg = 'تعذّر تسجيل الدخول. تأكد من البريد وكلمة المرور.';
    if (err.code === 'auth/user-not-found') msg = 'لا يوجد حساب بهذا البريد.';
    if (err.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة.';
    setMessage(msg, 'error');
  }
});

// إنشاء حساب
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    setMessage('تم إنشاء الحساب بنجاح! سننقلك لاختيار الآفاتار…', 'success');
    setTimeout(() => {
      window.location.href = 'avatar.html';
    }, 900);
  } catch (err) {
    console.error(err);
    let msg = 'تعذّر إنشاء الحساب.';
    if (err.code === 'auth/email-already-in-use') msg = 'هذا البريد مسجل مسبقًا.';
    if (err.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة، استخدم 6 أحرف فأكثر.';
    setMessage(msg, 'error');
  }
});

// استرجاع كلمة المرور
const resetForm = document.getElementById('reset-form');
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reset-email').value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    setMessage('تم إرسال رابط استرجاع كلمة المرور إلى بريدك.', 'success');
  } catch (err) {
    console.error(err);
    let msg = 'تعذّر إرسال رسالة الاسترجاع.';
    if (err.code === 'auth/user-not-found') msg = 'لا يوجد حساب بهذا البريد.';
    setMessage(msg, 'error');
  }
});
