const WORD_LIFETIME_MS = 3000;
const GAME_TIME_SECONDS = 20;
const START_SPAWN_MS = 1800;
const MIN_SPAWN_MS = 700;
const SPAWN_ACCELERATION = 0.99;

const huWords = [
  "huhn",
  "schuh",
  "hupe",
  "ruhehu",
  "huelle",
  "muhund",
  "bahuhu",
  "husten",
  "thunfisch",
  "huldigung",
];

const nonHuWords = [
  "tempo",
  "katze",
  "stern",
  "glanz",
  "pixel",
  "route",
  "feder",
  "kiste",
  "vibe",
  "laser",
  "komet",
  "bingo",
];

const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const spawnRateEl = document.getElementById("spawnRate");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

let score = 0;
let timeLeft = GAME_TIME_SECONDS;
let spawnMs = START_SPAWN_MS;
let isRunning = false;
let spawnTimer = null;
let gameTicker = null;

function updateHud() {
  scoreEl.textContent = String(score);
  timeEl.textContent = String(timeLeft);
  spawnRateEl.textContent = String(Math.round(spawnMs));
}

function changeScore(delta) {
  score += delta;
  scoreEl.textContent = String(score);
}

function pickWord() {
  const useHu = Math.random() < 0.42;
  const from = useHu ? huWords : nonHuWords;
  return from[Math.floor(Math.random() * from.length)];
}

function clearWordNodes() {
  for (const node of gameArea.querySelectorAll(".word")) {
    node.remove();
  }
}

function spawnScorePop(x, y, text, tone) {
  const pop = document.createElement("div");
  pop.className = `pop-score ${tone}`;
  pop.textContent = text;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  gameArea.appendChild(pop);
  window.setTimeout(() => pop.remove(), 480);
}

function spawnWord() {
  if (!isRunning) return;

  const text = pickWord();
  const hasHu = text.toLowerCase().includes("hu");

  const word = document.createElement("button");
  word.type = "button";
  word.className = "word";
  word.textContent = text;
  word.dataset.hasHu = String(hasHu);
  word.dataset.clicked = "false";

  const safeWidth = Math.max(gameArea.clientWidth - 120, 20);
  const left = Math.floor(Math.random() * safeWidth) + 8;
  word.style.left = `${left}px`;
  word.style.transitionDuration = `${WORD_LIFETIME_MS}ms`;
  gameArea.appendChild(word);

  requestAnimationFrame(() => {
    const targetTop = gameArea.clientHeight + 40;
    word.style.top = `${targetTop}px`;
  });

  word.addEventListener("click", (ev) => {
    if (!isRunning || word.dataset.clicked === "true") return;
    word.dataset.clicked = "true";
    const rect = gameArea.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    if (hasHu) {
      changeScore(1);
      word.classList.add("hit");
      statusEl.textContent = `"${text}" enthält hu: +1 Punkt`;
      spawnScorePop(x, y, "+1", "good");
    } else {
      changeScore(-1);
      word.classList.add("miss");
      statusEl.textContent = `"${text}" ohne hu: -1 Punkt`;
      spawnScorePop(x, y, "-1", "bad");
    }

    setTimeout(() => word.remove(), 120);
  });

  setTimeout(() => {
    const wasClicked = word.dataset.clicked === "true";
    if (!wasClicked && hasHu && isRunning) {
      changeScore(-1);
      statusEl.textContent = `"${text}" verpasst: -1 Punkt`;
      const x = word.offsetLeft + word.offsetWidth / 2;
      const y = gameArea.clientHeight - 28;
      spawnScorePop(x, y, "-1", "bad");
    }
    word.remove();
  }, WORD_LIFETIME_MS);
}

function scheduleSpawn() {
  if (!isRunning) return;
  spawnTimer = window.setTimeout(() => {
    spawnWord();
    spawnMs = Math.max(MIN_SPAWN_MS, spawnMs * SPAWN_ACCELERATION);
    spawnRateEl.textContent = String(Math.round(spawnMs));
    scheduleSpawn();
  }, spawnMs);
}

function endGame() {
  isRunning = false;
  window.clearTimeout(spawnTimer);
  window.clearInterval(gameTicker);
  clearWordNodes();
  statusEl.textContent = `Zeit um. Endstand: ${score} Punkte.`;
}

function startGame() {
  window.clearTimeout(spawnTimer);
  window.clearInterval(gameTicker);
  clearWordNodes();

  score = 0;
  timeLeft = GAME_TIME_SECONDS;
  spawnMs = START_SPAWN_MS;
  isRunning = true;
  updateHud();
  statusEl.textContent = "Laufend! Triff alle hu-Wörter.";

  scheduleSpawn();

  gameTicker = window.setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

startBtn.addEventListener("click", startGame);
updateHud();
