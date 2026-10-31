import { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc } from './firebase-config.js';

const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=1';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// dom elements
const wordEl = document.getElementById('word-display');
const phoneticEl = document.getElementById('phonetic-display');
const definitionEl = document.getElementById('definition-display');
const partOfSpeechEl = document.getElementById('part-of-speech');
const audioBtn = document.getElementById('audio-btn');
const currentStreakEl = document.getElementById('current-streak');
const maxStreakEl = document.getElementById('max-streak');
const loginBtn = document.getElementById('google-login-btn');
const userInfo = document.getElementById('user-info');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

let currentAudioUrl = null;
let currentWordText = '';
let currentUser = null;

// auth & streak

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // auth user
        currentUser = user;
        loginBtn.style.display = 'none';
        userInfo.style.display = 'block';
        userNameEl.textContent = user.displayName.split(' ')[0]; 
        await loadFirebaseUserData(user.uid); 
    } else {
        // guest storage
        currentUser = null;
        loginBtn.style.display = 'flex';
        userInfo.style.display = 'none';
        updateLocalStreak(); // guest init
    }
});

// auth listeners
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => console.error("Login failed:", error));
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// streak logic

// guest streak
function updateLocalStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('oneWord_lastVisit');
    let currentStreak = parseInt(localStorage.getItem('oneWord_streak') || '0');
    let maxStreak = parseInt(localStorage.getItem('oneWord_maxStreak') || '0');

    if (lastVisit === today) {
        // same day
        if(currentStreak === 0) currentStreak = 1; // handle zero
    } else if (isYesterday(lastVisit)) {
        // next day
        currentStreak++;
    } else {
        // streak reset
        currentStreak = 1; 
    }

    if (currentStreak > maxStreak) maxStreak = currentStreak;

    // save ui
    localStorage.setItem('oneWord_lastVisit', today);
    localStorage.setItem('oneWord_streak', currentStreak);
    localStorage.setItem('oneWord_maxStreak', maxStreak);
    
    currentStreakEl.textContent = currentStreak;
    maxStreakEl.textContent = maxStreak;
}

// user streak
async function loadFirebaseUserData(userId) {
    const today = new Date().toDateString();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    let streak = 0;
    let maxStreak = 0;
    let lastVisit = '';

    if (userSnap.exists()) {
        const data = userSnap.data();
        streak = data.currentStreak || 0;
        maxStreak = data.highestStreak || 0;
        lastVisit = data.lastVisit || '';
    }

    // calc streak
    if (lastVisit === today) {
        if(streak === 0) streak = 1;
    } else if (isYesterday(lastVisit)) {
        streak++;
    } else {
        streak = 1;
    }

    if (streak > maxStreak) maxStreak = streak;

    // cloud save
    await setDoc(userRef, {
        currentStreak: streak,
        highestStreak: maxStreak,
        lastVisit: today,
        email: currentUser.email
    }, { merge: true });

    // update ui
    currentStreakEl.textContent = streak;
    maxStreakEl.textContent = maxStreak;
}

// date check
function isYesterday(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return dateString === yesterday.toDateString();
}


// word loader

document.addEventListener('DOMContentLoaded', () => {
    loadDailyWord();
    // auth managed
});

async function loadDailyWord() {
    const today = new Date().toLocaleDateString();
    const storedData = localStorage.getItem('oneWordADay_data');
    
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === today) {
            renderWord(parsedData.wordData);
            return;
        }
    }
    await fetchAndVerifyWord(today);
}

async function fetchAndVerifyWord(dateKey) {
    try {
        if (wordEl) wordEl.textContent = 'Loading...';
        
        const wordRes = await fetch(RANDOM_WORD_API);
        const wordData = await wordRes.json();
        const candidateWord = wordData[0];

        const dictRes = await fetch(`${DICTIONARY_API}${candidateWord}`);
        
        if (!dictRes.ok) {
            await fetchAndVerifyWord(dateKey); 
            return;
        }

        const dictData = await dictRes.json();
        const entry = dictData[0];

        const dataToStore = {
            date: dateKey,
            wordData: entry
        };
        localStorage.setItem('oneWordADay_data', JSON.stringify(dataToStore));
        renderWord(entry);

    } catch (error) {
        console.error('Error:', error);
        if (wordEl) wordEl.textContent = 'Error loading.';
    }
}

function renderWord(data) {
    currentWordText = data.word;
    const phonetic = data.phonetic || (data.phonetics.find(p => p.text)?.text) || '';
    const meaning = data.meanings[0];
    const definition = meaning?.definitions[0]?.definition || 'No definition available.';
    const partOfSpeech = meaning?.partOfSpeech || 'noun';
    
    const audioObj = data.phonetics.find(p => p.audio && p.audio !== '');
    currentAudioUrl = audioObj ? audioObj.audio : null;

    if (wordEl) wordEl.textContent = currentWordText;
    if (phoneticEl) phoneticEl.textContent = phonetic;
    if (definitionEl) definitionEl.textContent = definition;
    if (partOfSpeechEl) partOfSpeechEl.textContent = partOfSpeech;

    if (audioBtn) {
        audioBtn.style.display = 'inline-flex';
        audioBtn.onclick = playAudio;
    }
}

function playAudio() {
    if (currentAudioUrl) {
        const audio = new Audio(currentAudioUrl);
        audio.play();
    } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWordText);
        utterance.lang = 'en-US'; 
        window.speechSynthesis.speak(utterance);
    }
}