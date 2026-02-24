const CONFIG = {
  roundDurationSec: 20,
  wordLifetimeMs: 3000,
  spawnStartMs: 500,
  spawnMinMs: 250,
  spawnRampMsPerSec: 8,
  huChance: 0.3,
  fallSpeedFactor: 0.7,
};

const HU_WORDS = [
  "Hupe",
  "Schuh",
  "Kuh",
  "Humor",
  "Hummel",
  "Husten",
  "HU",
  "Hut",
  "Hund",
  "Hula",
  "Huhn",
  "Sachunterricht",
  "Entschuldigung",
  "Huckepack",
  "Hula-Hoop",
];
const NEUTRAL_WORDS = [
  "Tisch",
  "Wolke",
  "Lampe",
  "Karte",
  "Regen",
  "Auto",
  "Sonne",
  "Birne",
  "Apfel",
  "Pinsel",
  "Stein",
  "Sport",
  "Pixel",
  "Tasse",
  "Fenster",
  "Hamburg",
  "Hannover",
];
const WORD_SKINS = [
  "skin-green",
  "skin-pink",
  "skin-purple",
  "skin-orange",
  "skin-cyan",
];

const gameAreaEl = document.getElementById("gameArea");
const scoreDisplayEl = document.getElementById("scoreDisplay");
const timeDisplayEl = document.getElementById("timeDisplay");
const endScreenEl = document.getElementById("endScreen");
const finalScoreEl = document.getElementById("finalScore");
const playAgainBtn = document.getElementById("playAgainBtn");
const shareBtn = document.getElementById("shareBtn");

const state = {
  running: false,
  score: 0,
  timeLeft: CONFIG.roundDurationSec,
  nextWordId: 1,
  roundStartTs: 0,
  spawnTimeoutId: null,
  timerIntervalId: null,
  rafId: null,
  activeWords: new Map(),
};

function sampleWord() {
  const fromHU = Math.random() < CONFIG.huChance;
  const pool = fromHU ? HU_WORDS : NEUTRAL_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function formatScore(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function updateHud() {
  scoreDisplayEl.textContent = formatScore(state.score);
  timeDisplayEl.textContent = `${state.timeLeft}s`;
}

function pickSpawnX(width, nowTs) {
  const areaWidth = gameAreaEl.clientWidth;
  const maxX = Math.max(0, areaWidth - width);

  // Keep rapid spawns from heavily overlapping while words are still near the top.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = Math.random() * maxX;
    let overlap = false;

    for (const word of state.activeWords.values()) {
      const age = nowTs - word.spawnTs;
      const nearTop = age < 500;
      if (!nearTop) continue;

      const tooClose = Math.abs(x - word.x) < (width + word.width) * 0.5 + 10;
      if (tooClose) {
        overlap = true;
        break;
      }
    }

    if (!overlap) return x;
  }

  return Math.random() * maxX;
}

function showDelta(word, delta) {
  const areaRect = gameAreaEl.getBoundingClientRect();
  const wordRect = word.el.getBoundingClientRect();

  const el = document.createElement("div");
  el.className = `delta ${delta > 0 ? "good" : "bad"}`;
  el.textContent = delta > 0 ? "+1" : "-1";
  el.style.left = `${wordRect.left - areaRect.left + wordRect.width * 0.25}px`;
  el.style.top = `${wordRect.top - areaRect.top}px`;

  gameAreaEl.appendChild(el);
  window.setTimeout(() => el.remove(), 650);
}

function removeWord(wordId) {
  const word = state.activeWords.get(wordId);
  if (!word) return;

  if (word.expireTimeoutId) {
    window.clearTimeout(word.expireTimeoutId);
  }

  state.activeWords.delete(wordId);
  word.el.remove();
}

function onWordTap(wordId) {
  if (!state.running) return;
  const word = state.activeWords.get(wordId);
  if (!word || word.clicked) return;
  word.clicked = true;

  // Scoring check requested: +1 if word contains "hu" (case-insensitive), else -1.
  const hasHU = word.text.toLowerCase().includes("hu");
  const delta = hasHU ? 1 : -1;

  state.score += delta;
  updateHud();
  showDelta(word, delta);
  removeWord(wordId);
}

function spawnWord() {
  if (!state.running) return;

  const text = sampleWord();
  const now = performance.now();
  const wordId = state.nextWordId++;

  const el = document.createElement("button");
  el.type = "button";
  el.className = `word ${WORD_SKINS[Math.floor(Math.random() * WORD_SKINS.length)]}`;
  el.textContent = text;
  el.style.visibility = "hidden";
  el.addEventListener("pointerdown", () => onWordTap(wordId), {
    passive: true,
  });
  gameAreaEl.appendChild(el);

  const width = el.offsetWidth || 110;
  const x = pickSpawnX(width, now);
  const angle = Math.random() * 8 - 4;
  el.style.visibility = "visible";

  state.activeWords.set(wordId, {
    id: wordId,
    text,
    x,
    angle,
    width,
    spawnTs: now,
    clicked: false,
    expireTimeoutId: window.setTimeout(
      () => removeWord(wordId),
      CONFIG.wordLifetimeMs,
    ),
    el,
  });
}

function scheduleSpawn() {
  if (!state.running) return;

  spawnWord();

  // Spawn cadence starts around 500ms and ramps down slightly over the round.
  const elapsedSec = (performance.now() - state.roundStartTs) / 1000;
  const nextDelay = Math.max(
    CONFIG.spawnMinMs,
    CONFIG.spawnStartMs - elapsedSec * CONFIG.spawnRampMsPerSec,
  );

  state.spawnTimeoutId = window.setTimeout(scheduleSpawn, nextDelay);
}

function tick(timestamp) {
  if (!state.running) return;
  const areaHeight = gameAreaEl.clientHeight;
  const offscreenBuffer = 60;

  for (const word of state.activeWords.values()) {
    const age = timestamp - word.spawnTs;

    // Lifetime removal: each word disappears exactly after 3.0 seconds.
    if (age >= CONFIG.wordLifetimeMs) {
      removeWord(word.id);
      continue;
    }

    const progress = age / CONFIG.wordLifetimeMs;
    const y =
      -56 + (areaHeight + offscreenBuffer) * CONFIG.fallSpeedFactor * progress;
    word.el.style.transform = `translate3d(${word.x}px, ${y}px, 0) rotate(${word.angle}deg)`;

    if (progress > 0.72) {
      const fadeProgress = (progress - 0.72) / 0.28;
      word.el.style.opacity = `${1 - fadeProgress * 0.75}`;
    } else {
      word.el.style.opacity = "1";
    }
  }

  state.rafId = window.requestAnimationFrame(tick);
}

function clearActiveWords() {
  for (const word of state.activeWords.values()) {
    if (word.expireTimeoutId) {
      window.clearTimeout(word.expireTimeoutId);
    }
    word.el.remove();
  }
  state.activeWords.clear();

  const deltas = gameAreaEl.querySelectorAll(".delta");
  deltas.forEach((el) => el.remove());
}

function endGame() {
  if (!state.running) return;

  // Timer/end-state: stop spawning, stop animation, clear words, then show final score.
  state.running = false;
  if (state.spawnTimeoutId) window.clearTimeout(state.spawnTimeoutId);
  if (state.timerIntervalId) window.clearInterval(state.timerIntervalId);
  if (state.rafId) window.cancelAnimationFrame(state.rafId);

  state.spawnTimeoutId = null;
  state.timerIntervalId = null;
  state.rafId = null;
  state.timeLeft = 0;
  updateHud();

  clearActiveWords();

  finalScoreEl.textContent = `${formatScore(state.score)} PUNKT`;
  endScreenEl.classList.remove("hidden");
}

function startTimer() {
  state.timerIntervalId = window.setInterval(() => {
    if (!state.running) return;

    state.timeLeft -= 1;

    if (state.timeLeft <= 0) {
      endGame();
      return;
    }

    updateHud();
  }, 1000);
}

function startGame() {
  if (state.spawnTimeoutId) window.clearTimeout(state.spawnTimeoutId);
  if (state.timerIntervalId) window.clearInterval(state.timerIntervalId);
  if (state.rafId) window.cancelAnimationFrame(state.rafId);

  clearActiveWords();
  endScreenEl.classList.add("hidden");

  state.running = true;
  state.score = 0;
  state.timeLeft = CONFIG.roundDurationSec;
  state.roundStartTs = performance.now();
  state.nextWordId = 1;

  updateHud();

  scheduleSpawn();
  state.rafId = window.requestAnimationFrame(tick);
  startTimer();
}

playAgainBtn.addEventListener("click", startGame);
shareBtn.addEventListener("click", async () => {
  const text = `Ich habe ${state.score} Punkte in HU-Drop geschafft!`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "HU-Drop", text });
      return;
    } catch {
      // If sharing is canceled/unavailable, fall through to alert stub.
    }
  }

  window.alert(text);
});

startGame();
