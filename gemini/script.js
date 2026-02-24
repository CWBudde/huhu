// --- Configuration ---
const ROUND_TIME = 20;
const SPAWN_INTERVAL = 500;
const WORD_LIFETIME = 3000;

const HU_WORDS = ["Hupe", "Schuh", "Kuh", "Humor", "Hummel", "Husten", "HU", "Huhn", "Hund", "Huhu", "Humus"];
const NEUTRAL_WORDS = ["Apfel", "Birne", "Haus", "Auto", "Baum", "Blume", "Pixel", "Sport", "Fenster", "Tasse"];

// --- State ---
let score = 0;
let timeLeft = ROUND_TIME;
let isPlaying = false;
let spawnTimer = null;
let gameCountdown = null;

const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');

function startGame() {
    score = 0;
    timeLeft = ROUND_TIME;
    isPlaying = true;
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameArea.innerHTML = '';
    
    updateHUD();
    spawnTimer = setInterval(spawnWord, SPAWN_INTERVAL);
    gameCountdown = setInterval(tick, 1000);
}

function tick() {
    timeLeft--;
    updateHUD();
    if (timeLeft <= 0) endGame();
}

function updateHUD() {
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
}

function spawnWord() {
    if (!isPlaying) return;

    const isHu = Math.random() < 0.3;
    const pool = isHu ? HU_WORDS : NEUTRAL_WORDS;
    const wordText = pool[Math.floor(Math.random() * pool.length)];

    const colors = ['word-pink', 'word-blue', 'word-green', 'word-orange', 'word-purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const wordEl = document.createElement('div');
    wordEl.className = `word ${randomColor}`;
    wordEl.textContent = wordText;

    // Random X between 5% and 85% to stay on screen
    const randomX = 5 + Math.random() * 80;
    wordEl.style.left = `${randomX}%`;
    wordEl.style.top = `-60px`;

    wordEl.addEventListener('pointerdown', (e) => handleInteraction(e, wordEl, wordText));

    gameArea.appendChild(wordEl);

    // Animate falling
    requestAnimationFrame(() => {
        wordEl.style.transform = `translateY(${gameArea.offsetHeight + 100}px)`;
    });

    // Cleanup
    setTimeout(() => {
        if (wordEl.parentNode === gameArea) wordEl.remove();
    }, WORD_LIFETIME);
}

function handleInteraction(e, element, text) {
    if (!isPlaying || element.dataset.clicked) return;
    element.dataset.clicked = "true";

    const isHu = text.toLowerCase().includes('hu');
    const points = isHu ? 1 : -1;
    score += points;
    updateHUD();

    // Enhanced Feedback
    const feedbackText = isHu ? "HU-TREFFER! +1" : "FALSCH! -1";
    const feedbackColor = isHu ? "#00ff00" : "#ff0000";
    showPopup(e.clientX, e.clientY, feedbackText, feedbackColor);

    element.remove();
}

function showPopup(x, y, text, color) {
    const p = document.createElement('div');
    p.className = 'feedback-popup';
    p.textContent = text;
    p.style.color = 'white';
    p.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
    p.style.left = `${x}px`;
    p.style.top = `${y - 50}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

function endGame() {
    isPlaying = false;
    clearInterval(spawnTimer);
    clearInterval(gameCountdown);
    document.getElementById('final-score').textContent = score;
    endScreen.classList.remove('hidden');
    gameArea.innerHTML = '';
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
