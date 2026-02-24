"use strict";

// ═══════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════
const CONFIG = {
  roundSec:        20,    // total round length in seconds
  wordLifetimeMs:  3000,  // each word lives exactly 3 s
  spawnStartMs:    500,   // first spawn interval (ms)
  spawnMinMs:      250,   // fastest spawn interval after ramp
  spawnRampPerSec: 8,     // ms removed from interval per elapsed second
  huChance:        0.30,  // ~30 % of spawns are HU-words
  fallFactor:      0.78,  // fraction of game-area height covered per lifetime
  fadeStartFrac:   0.70,  // opacity starts dropping at 70 % of lifetime
};

// ═══════════════════════════════════════════════════════════════════
//  WORD POOLS
//  HU-words:      every entry satisfies text.toLowerCase().includes("hu")
//  Neutral words: no entry contains "hu" (case-insensitive)
//
//  Verify manually: "kuh" → k·u·h → substrings "ku","uh" → no "hu" ✓
//                   "schuh" → s·c·h·u·h → substring at [2..3] = "hu" ✓
// ═══════════════════════════════════════════════════════════════════
const HU_WORDS = [
  "Hupe", "Humor", "Hummel", "Husten", "HU",
  "Hut",  "Hund",  "Hula",   "Huhn",   "Huckepack", "Hula-Hoop",
  "Schuh", "Schuhe", "Schutz", "Schulter",
  "Sachunterricht", "Entschuldigung", "Behutsam",
];

const NEUTRAL_WORDS = [
  "Tisch",  "Wolke",  "Lampe",  "Karte",  "Regen",
  "Auto",   "Sonne",  "Birne",  "Apfel",  "Pinsel",
  "Stein",  "Sport",  "Pixel",  "Tasse",  "Fenster",
  "Blume",  "Stern",  "Gabel",  "Boden",  "Musik",
  "Tafel",  "Baum",   "Nacht",  "Licht",  "Wind",
  "Maus",   "Ring",   "Brief",  "Stift",
  "Kuh",    // "kuh".includes("hu") === false → scores −1 if clicked (fair trap)
];

const SKINS = ["skin-green","skin-pink","skin-purple","skin-orange","skin-cyan"];

// ═══════════════════════════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════════════════════════
const gameAreaEl   = document.getElementById("gameArea");
const scoreEl      = document.getElementById("scoreEl");
const timeEl       = document.getElementById("timeEl");
const endScreenEl  = document.getElementById("endScreen");
const finalScoreEl = document.getElementById("finalScoreEl");
const playAgainBtn = document.getElementById("playAgainBtn");
const shareBtn     = document.getElementById("shareBtn");
const splashEl     = document.getElementById("splash");
const startBtn     = document.getElementById("startBtn");

// ═══════════════════════════════════════════════════════════════════
//  GAME STATE — single object; fully reset on each new round
// ═══════════════════════════════════════════════════════════════════
const state = {
  running:        false,
  score:          0,
  timeLeft:       CONFIG.roundSec,
  roundStartTs:   0,           // performance.now() at round start
  nextId:         1,           // monotonic word ID counter
  activeWords:    new Map(),   // id → word object
  spawnTimer:     null,
  countdownTimer: null,
  rafId:          null,
};

// ═══════════════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════════════
const fmt = n => n > 0 ? `+${n}` : String(n);

function updateHud() {
  scoreEl.textContent = fmt(state.score);
  timeEl.textContent  = `${state.timeLeft}s`;
}

// ═══════════════════════════════════════════════════════════════════
//  SPAWN POSITION — tries up to 8 random X positions, avoiding
//  overlap with words that are still near the top (age < 600 ms).
// ═══════════════════════════════════════════════════════════════════
function pickX(wordW, nowTs) {
  const maxX = Math.max(0, gameAreaEl.clientWidth - wordW);
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * maxX;
    let ok = true;
    for (const w of state.activeWords.values()) {
      if (nowTs - w.spawnTs > 600) continue;
      if (Math.abs(x - w.x) < (wordW + w.width) / 2 + 8) { ok = false; break; }
    }
    if (ok) return x;
  }
  return Math.random() * maxX; // accept any position after 8 failed attempts
}

// ═══════════════════════════════════════════════════════════════════
//  SCORE DELTA — floating "+1" / "−1" animation above clicked word
// ═══════════════════════════════════════════════════════════════════
function showDelta(wordEl, positive) {
  const ar = gameAreaEl.getBoundingClientRect();
  const wr = wordEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className   = `delta ${positive ? "delta-good" : "delta-bad"}`;
  el.textContent = positive ? "+1" : "−1";
  el.style.left  = `${wr.left - ar.left + wr.width * 0.2}px`;
  el.style.top   = `${wr.top  - ar.top}px`;
  gameAreaEl.appendChild(el);
  setTimeout(() => el.remove(), 720);
}

// ═══════════════════════════════════════════════════════════════════
//  WORD REMOVAL — idempotent: no-op if word is already gone
// ═══════════════════════════════════════════════════════════════════
function removeWord(id) {
  const w = state.activeWords.get(id);
  if (!w) return;
  clearTimeout(w.expireTimer);
  state.activeWords.delete(id);
  w.el.remove();
}

// ═══════════════════════════════════════════════════════════════════
//  CLICK / TAP HANDLER
//  Scoring check: +1 if word.toLowerCase().includes("hu"), else −1.
//  Missing a HU-word (no click before expiry) gives 0 — no penalty.
//  A word can only be scored once (w.clicked guard).
// ═══════════════════════════════════════════════════════════════════
function onWordTap(id) {
  if (!state.running) return;
  const w = state.activeWords.get(id);
  if (!w || w.clicked) return;
  w.clicked = true;

  const isHu  = w.text.toLowerCase().includes("hu");
  const delta = isHu ? 1 : -1;
  state.score += delta;
  updateHud();
  showDelta(w.el, isHu);
  removeWord(id);
}

// ═══════════════════════════════════════════════════════════════════
//  SPAWN WORD — creates one falling <button> and registers it
// ═══════════════════════════════════════════════════════════════════
function spawnWord() {
  if (!state.running) return;

  // Spawn selection: ~30 % HU-words, ~70 % neutral
  const isHu = Math.random() < CONFIG.huChance;
  const pool  = isHu ? HU_WORDS : NEUTRAL_WORDS;
  const text  = pool[Math.floor(Math.random() * pool.length)];
  const id    = state.nextId++;
  const now   = performance.now();

  const el = document.createElement("button");
  el.type        = "button";
  el.className   = `word ${SKINS[Math.floor(Math.random() * SKINS.length)]}`;
  el.textContent = text;
  el.style.visibility = "hidden"; // hide while measuring width
  el.addEventListener("pointerdown", () => onWordTap(id), { passive: true });
  gameAreaEl.appendChild(el);

  const width = el.offsetWidth || 100;
  const x     = pickX(width, now);
  const angle = (Math.random() * 8 - 4).toFixed(1); // gentle ±4° tilt

  el.style.transform  = `translate3d(${x}px, -60px, 0) rotate(${angle}deg)`;
  el.style.opacity    = "0"; // tick() will fade it in over 300 ms
  el.style.visibility = "";

  // Lifetime removal: auto-expire after exactly 3 s.
  // The rAF loop also catches this, but the timeout guarantees cleanup
  // even when the tab is backgrounded and rAF is throttled.
  const expireTimer = setTimeout(() => removeWord(id), CONFIG.wordLifetimeMs);

  state.activeWords.set(id, {
    id, text, el, x, width,
    angle:      parseFloat(angle),
    spawnTs:    now,
    clicked:    false,
    expireTimer,
  });
}

// ═══════════════════════════════════════════════════════════════════
//  SPAWN SCHEDULER — self-rescheduling timeout; cadence ramps up
// ═══════════════════════════════════════════════════════════════════
function scheduleSpawn() {
  if (!state.running) return;
  spawnWord();
  const elapsedSec = (performance.now() - state.roundStartTs) / 1000;
  const delay = Math.max(
    CONFIG.spawnMinMs,
    CONFIG.spawnStartMs - elapsedSec * CONFIG.spawnRampPerSec,
  );
  state.spawnTimer = setTimeout(scheduleSpawn, delay);
}

// ═══════════════════════════════════════════════════════════════════
//  ANIMATION LOOP (requestAnimationFrame)
//  Moves every active word downward and fades it near end of life.
// ═══════════════════════════════════════════════════════════════════
function tick(ts) {
  if (!state.running) return;

  const areaH  = gameAreaEl.clientHeight;
  const travel = areaH * CONFIG.fallFactor; // total px to fall per lifetime

  for (const w of state.activeWords.values()) {
    const age = ts - w.spawnTs;
    if (age >= CONFIG.wordLifetimeMs) { removeWord(w.id); continue; }

    const frac = age / CONFIG.wordLifetimeMs;

    // Fall: starts 60 px above visible area, descends over lifetime
    const y = -60 + travel * frac;
    w.el.style.transform = `translate3d(${w.x}px, ${y}px, 0) rotate(${w.angle}deg)`;

    // Fade in over first 300 ms, hold, then fade out during last 30 %
    const FADE_IN_MS = 300;
    if (age < FADE_IN_MS) {
      w.el.style.opacity = (age / FADE_IN_MS).toFixed(3);
    } else if (frac > CONFIG.fadeStartFrac) {
      const f = (frac - CONFIG.fadeStartFrac) / (1 - CONFIG.fadeStartFrac);
      w.el.style.opacity = (1 - f * 0.78).toFixed(3);
    } else {
      w.el.style.opacity = "1";
    }
  }

  state.rafId = requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════════════════════════
//  CLEAR ALL WORDS + lingering delta labels
// ═══════════════════════════════════════════════════════════════════
function clearAllWords() {
  for (const w of state.activeWords.values()) {
    clearTimeout(w.expireTimer);
    w.el.remove();
  }
  state.activeWords.clear();
  gameAreaEl.querySelectorAll(".delta").forEach(el => el.remove());
}

// ═══════════════════════════════════════════════════════════════════
//  COUNTDOWN — ticks every 1 s; triggers end-state when it hits 0
// ═══════════════════════════════════════════════════════════════════
function startCountdown() {
  state.countdownTimer = setInterval(() => {
    if (!state.running) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateHud();
    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════════
//  END GAME — stops all timers, clears words, shows final score
// ═══════════════════════════════════════════════════════════════════
function endGame() {
  if (!state.running) return;
  state.running = false;

  clearTimeout(state.spawnTimer);
  clearInterval(state.countdownTimer);
  cancelAnimationFrame(state.rafId);
  state.spawnTimer = state.countdownTimer = state.rafId = null;

  state.timeLeft = 0;
  updateHud();
  clearAllWords();

  const s = state.score;
  finalScoreEl.textContent = `${fmt(s)} Punkt${Math.abs(s) !== 1 ? "e" : ""}`;
  endScreenEl.classList.remove("hidden");
}

// ═══════════════════════════════════════════════════════════════════
//  START / RESTART — resets all state, kicks off a fresh round
// ═══════════════════════════════════════════════════════════════════
function startGame() {
  clearTimeout(state.spawnTimer);
  clearInterval(state.countdownTimer);
  cancelAnimationFrame(state.rafId);
  clearAllWords();

  endScreenEl.classList.add("hidden");
  splashEl.classList.add("hidden");

  Object.assign(state, {
    running:        true,
    score:          0,
    timeLeft:       CONFIG.roundSec,
    roundStartTs:   performance.now(),
    nextId:         1,
    spawnTimer:     null,
    countdownTimer: null,
    rafId:          null,
  });

  updateHud();
  scheduleSpawn();
  state.rafId = requestAnimationFrame(tick);
  startCountdown();
}

// ═══════════════════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════════════════
startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

shareBtn.addEventListener("click", async () => {
  const msg = `Ich habe ${fmt(state.score)} Punkte in HU-Drop geschafft! 🎮`;
  if (navigator.share) {
    try { await navigator.share({ title: "HU-Drop", text: msg }); return; }
    catch { /* cancelled or unavailable */ }
  }
  alert(msg); // desktop / unsupported browser stub
});

// ═══════════════════════════════════════════════════════════════════
//  BOOT — show start screen; game begins only on button press
// ═══════════════════════════════════════════════════════════════════
updateHud();
