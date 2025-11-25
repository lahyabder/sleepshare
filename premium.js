// premium.js — نظام الحساب الذهبي في SleepShare

import { auth, db } from "./firebase.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export async function isPremium() {
  const user = auth.currentUser;
  if (!user) return false;

  const ref = doc(db, "users", user.uid, "premium", "status");
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const data = snap.data();
  return data.active === true;
}

export async function activatePremium() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "premium", "status");

  await setDoc(ref, {
    active: true,
    activatedAt: serverTimestamp(),
    expires: null  // لاحقًا نضيف تاريخ الانتهاء
  });

  return true;
}
