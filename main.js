const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().slice(0, 10);

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

let streak = 1;
let bestStreak = 1;

if (!snap.exists()) {
  await setDoc(ref, {
    streak: 1,
    bestStreak: 1,
    lastSeen: todayStr
  });
} else {
  const data = snap.data();

  if (data.lastSeen === todayStr) {
    streak = data.streak;
    bestStreak = data.bestStreak;
  } else if (data.lastSeen === yesterdayStr) {
    streak = data.streak + 1;
    bestStreak = Math.max(data.bestStreak || 1, streak);

    await updateDoc(ref, {
      streak,
      bestStreak,
      lastSeen: todayStr
    });
  } else {
    streak = 1;
    bestStreak = data.bestStreak || 1;

    await updateDoc(ref, {
      streak: 1,
      bestStreak,
      lastSeen: todayStr
    });
  }
}

document.getElementById("streak").innerText =
  `🔥 ${streak} day streak`;

document.getElementById("best").innerText =
  `🏆 best: ${bestStreak}`;
