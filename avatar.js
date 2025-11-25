// avatar.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const avatarsGrid = document.getElementById('avatars-grid');
const messageBox = document.getElementById('avatar-message');
const saveBtn = document.getElementById('save-avatar');
const logoutBtn = document.getElementById('avatar-logout');

let selectedAvatar = null;
let currentUser = null;

// التأكد من وجود مستخدم
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // لا يوجد مستخدم → العودة إلى صفحة auth
    window.location.href = 'auth.html';
  } else {
    currentUser = user;
    if (user.photoURL) {
      selectedAvatar = user.photoURL;
      markActiveAvatar(user.photoURL);
    }
  }
});

function markActiveAvatar(value) {
  document.querySelectorAll('.avatar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.avatar === value);
  });
}

avatarsGrid.addEventListener('click', (e) => {
  const item = e.target.closest('.avatar-item');
  if (!item) return;
  selectedAvatar = item.dataset.avatar;
  markActiveAvatar(selectedAvatar);
  messageBox.textContent = '';
  messageBox.className = 'message';
});

saveBtn.addEventListener('click', async () => {
  if (!currentUser) return;

  if (!selectedAvatar) {
    messageBox.textContent = 'اختر آفاتارًا أولًا.';
    messageBox.className = 'message error';
    return;
  }

  try {
    await updateProfile(currentUser, {
      photoURL: selectedAvatar
    });

    messageBox.textContent = 'تم حفظ الآفاتار بنجاح. مرحبًا بك في شبكة السكون!';
    messageBox.className = 'message success';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);
  } catch (err) {
    console.error(err);
    messageBox.textContent = 'تعذّر حفظ الآفاتار، حاول مرة أخرى.';
    messageBox.className = 'message error';
  }
});

// تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'auth.html';
  } catch (err) {
    console.error(err);
  }
});
