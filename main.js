// main.js

// API Endpoints
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=1';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// DOM Elements - Ensure your index.html has elements with these IDs
const wordEl = document.getElementById('word-display') || document.querySelector('.word');
const phoneticEl = document.getElementById('phonetic-display') || document.querySelector('.phonetic');
const definitionEl = document.getElementById('definition-display') || document.querySelector('.definition');
const partOfSpeechEl = document.getElementById('part-of-speech') || document.querySelector('.part-of-speech');
const audioBtn = document.getElementById('audio-btn') || document.querySelector('.audio-btn');

// State Management
let currentAudioUrl = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadDailyWord();
});

async function loadDailyWord() {
    const today = new Date().toLocaleDateString();
    const storedData = localStorage.getItem('oneWordADay_data');
    
    // Check if we already have a word for today stored locally
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === today) {
            console.log('Loading word from local storage...');
            renderWord(parsedData.wordData);
            return;
        }
    }

    // If no word for today, fetch a new one
    console.log('Fetching new daily word...');
    await fetchAndVerifyWord(today);
}

// Recursively fetch words until we find one with a valid definition
async function fetchAndVerifyWord(dateKey) {
    try {
        if (wordEl) wordEl.textContent = 'Loading...';
        
        // 1. Get a random word
        const wordRes = await fetch(RANDOM_WORD_API);
        const wordData = await wordRes.json();
        const candidateWord = wordData[0];

        // 2. Check if it has a definition
        const dictRes = await fetch(`${DICTIONARY_API}${candidateWord}`);
        
        if (!dictRes.ok) {
            // If 404 (no definition), try again
            console.log(`No definition found for "${candidateWord}", retrying...`);
            await fetchAndVerifyWord(dateKey); 
            return;
        }

        const dictData = await dictRes.json();
        const entry = dictData[0];

        // 3. Save valid word to LocalStorage
        const dataToStore = {
            date: dateKey,
            wordData: entry
        };
        localStorage.setItem('oneWordADay_data', JSON.stringify(dataToStore));

        // 4. Render
        renderWord(entry);

    } catch (error) {
        console.error('Error fetching word:', error);
        if (wordEl) wordEl.textContent = 'Error loading word. Please refresh.';
    }
}

function renderWord(data) {
    const word = data.word;
    const phonetic = data.phonetic || (data.phonetics.find(p => p.text)?.text) || '';
    // Find the first meaning with a definition
    const meaning = data.meanings[0];
    const definition = meaning?.definitions[0]?.definition || 'No definition available.';
    const partOfSpeech = meaning?.partOfSpeech || 'noun';
    
    // Find audio if available
    const audioObj = data.phonetics.find(p => p.audio && p.audio !== '');
    currentAudioUrl = audioObj ? audioObj.audio : null;

    // Update DOM
    if (wordEl) wordEl.textContent = word;
    if (phoneticEl) phoneticEl.textContent = phonetic;
    if (definitionEl) definitionEl.textContent = definition;
    if (partOfSpeechEl) partOfSpeechEl.textContent = partOfSpeech;

    // Handle Audio Button
    if (audioBtn) {
        if (currentAudioUrl) {
            audioBtn.style.display = 'inline-block';
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