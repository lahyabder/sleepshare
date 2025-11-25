// private-room.js — إنشاء غرفة نوم خاصة ودعوة الآخرين

import { auth, db } from "./firebase.js";
import {
  addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { isPremium } from "./premium.js";

const btn = document.getElementById("create-private-room");
const output = document.getElementById("private-room-output");

btn.addEventListener("click", async () => {
  const premium = await isPremium();
  if (!premium) {
    alert("هذه الميزة مخصصة فقط للحساب الذهبي.");
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  const code = "ROOM-" + Math.floor(Math.random() * 100000);

  const ref = await addDoc(collection(db, "privateRooms"), {
    owner: user.uid,
    roomCode: code,
    createdAt: serverTimestamp(),
    active: true
  });

  const inviteLink = `https://sleepshare.app/join.html?room=${ref.id}&code=${code}`;

  output.innerHTML = `
    <p>✔ تم إنشاء غرفتك الخاصة</p>
    <p>رمز الغرفة: <strong>${code}</strong></p>
    <p><a href="${inviteLink}" target="_blank">رابط الدعوة</a></p>
  `;
});
