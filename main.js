// main.js

const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=1';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Elements
const wordEl = document.getElementById('word-display');
const phoneticEl = document.getElementById('phonetic-display');
const definitionEl = document.getElementById('definition-display');
const partOfSpeechEl = document.getElementById('part-of-speech');
const audioBtn = document.getElementById('audio-btn');
const currentStreakEl = document.getElementById('current-streak');
const maxStreakEl = document.getElementById('max-streak');

let currentAudioUrl = null;

document.addEventListener('DOMContentLoaded', () => {
    updateStreak(); // Handle streak logic first
    loadDailyWord(); // Then load the word
});

function updateStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('oneWord_lastVisit');
    let currentStreak = parseInt(localStorage.getItem('oneWord_streak') || '0');
    let maxStreak = parseInt(localStorage.getItem('oneWord_maxStreak') || '0');

    if (lastVisit === today) {
        // User already visited today, do nothing
    } else if (isYesterday(lastVisit)) {
        // User visited yesterday, increment streak
        currentStreak++;
    } else {
        // User missed a day (or first visit), reset to 1
        currentStreak = 1;
    }

    // Update Max Streak if broken
    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
    }

    // Save new values
    localStorage.setItem('oneWord_lastVisit', today);
    localStorage.setItem('oneWord_streak', currentStreak);
    localStorage.setItem('oneWord_maxStreak', maxStreak);

    // Update UI
    currentStreakEl.textContent = currentStreak;
    maxStreakEl.textContent = maxStreak;
}

function isYesterday(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return dateString === yesterday.toDateString();
}

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
    const word = data.word;
    const phonetic = data.phonetic || (data.phonetics.find(p => p.text)?.text) || '';
    const meaning = data.meanings[0];
    const definition = meaning?.definitions[0]?.definition || 'No definition available.';
    const partOfSpeech = meaning?.partOfSpeech || 'noun';
    
    const audioObj = data.phonetics.find(p => p.audio && p.audio !== '');
    currentAudioUrl = audioObj ? audioObj.audio : null;

    if (wordEl) wordEl.textContent = word;
    if (phoneticEl) phoneticEl.textContent = phonetic;
    if (definitionEl) definitionEl.textContent = definition;
    if (partOfSpeechEl) partOfSpeechEl.textContent = partOfSpeech;

    if (audioBtn) {
        if (currentAudioUrl) {
            audioBtn.style.display = 'inline-flex'; // changed to flex for centering
            audioBtn.onclick = playAudio;
        } else {
            audioBtn.style.display = 'none';
        }
    }
}

function playAudio() {
    if (currentAudioUrl) {
        const audio = new Audio(currentAudioUrl);
        audio.play();
    }
}