import { auth, provider, db } from "./firebase-config.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const content = document.getElementById("content");

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  loginBtn.style.display = "none";
  content.style.display = "block";

  const res = await fetch("/api/today-word");
  const wordData = await res.json();

  if (wordData.error) {
    document.getElementById("word").innerText = "Error";
    document.getElementById("meaning").innerText = wordData.error;
    document.getElementById("example").innerText = wordData.details || "";
    return;
  }

  document.getElementById("word").innerText =
  wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1);
  document.getElementById("meaning").innerText = wordData.meaning;
  document.getElementById("example").innerText = wordData.example;


  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const today = new Date().toISOString().slice(0, 10);

  if (!snap.exists()) {
    await setDoc(ref, {
      streak: 1,
      learned: [today]
    });
    document.getElementById("streak").innerText = "Streak: 1";
  } else {
    const data = snap.data();
    if (!data.learned.includes(today)) {
      await updateDoc(ref, {
        streak: data.streak + 1,
        learned: arrayUnion(today)
      });
      document.getElementById("streak").innerText =
        "Streak: " + (data.streak + 1);
    } else {
      document.getElementById("streak").innerText =
        "Streak: " + data.streak;
    }
  }
  const wordEl = document.getElementById("word");

  wordEl.style.opacity = 0;
  setTimeout(() => {
    wordEl.style.transition = "opacity 0.6s ease";
    wordEl.style.opacity = 1;
  }, 50);

});
