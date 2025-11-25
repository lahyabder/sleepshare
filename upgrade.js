// upgrade.js — نظام ترقية الحساب إلى Premium

import { auth } from "./firebase.js";
import { activatePremium, isPremium } from "./premium.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const btn = document.getElementById("upgrade-btn");
const statusBox = document.getElementById("premium-status");

async function updateStatus() {
  const premium = await isPremium();
  if (premium) {
    statusBox.textContent = "✔ حسابك ذهبي";
    statusBox.style.color = "#7c3aed";
    btn.style.display = "none";
  } else {
    statusBox.textContent = "حسابك مجاني – يمكنك الترقية الآن";
  }
}

onAuthStateChanged(auth, (u) => {
  if (u) updateStatus();
});

// الضغط على زر الترقية
btn.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = "جاري الترقية...";

  // ⚠️ الدفع (Placeholder) — مكان ربط Stripe لاحقًا
  alert("سيتم إضافة الدفع عبر Stripe لاحقًا. سيتم تفعيل الحساب الآن لأغراض الاختبار.");

  await activatePremium();

  btn.textContent = "تم التفعيل ✔";
  updateStatus();
});
