// ── Word lists ─────────────────────────────────────────────
const HU = [
  'Hund','Huhn','Hunger','Humor','Hut','Hupe','Humus','Husar',
  'Husky','Hummel','Hubschrauber','Huf','Huch','Human',
  'Schuh','Schuhe','Schule','Schutz','Schulter','Schulung',
  'Schuft','Schuster','Schuld','Schuldig'
];

const OTHER = [
  'Baum','Mond','Tier','Auto','Blatt','Buch','Kind','Zeit',
  'Ring','Ball','Wald','Berg','Meer','Sand','Wind','Feuer',
  'Wasser','Licht','Nacht','Tag','Sonne','Wolke','Fluss',
  'See','Land','Stadt','Regen','Eis','Stein','Rose','Blume',
  'Vogel','Fisch','Katze','Maus','Tisch','Dach','Bach',
  'Nuss','Gras','Feld','Turm','Kerze','Lampe','Boden',
  'Decke','Wand','Fenster','Tür','Stuhl','Brief','Gabel'
];

// ── Color palettes ─────────────────────────────────────────
const PALETTES = [
  { bg:'#1e1b4b', border:'#818cf8', text:'#e0e7ff' },
  { bg:'#1a103a', border:'#a78bfa', text:'#ede9fe' },
  { bg:'#172554', border:'#60a5fa', text:'#dbeafe' },
  { bg:'#1c2340', border:'#38bdf8', text:'#e0f2fe' },
  { bg:'#0f2922', border:'#34d399', text:'#d1fae5' },
  { bg:'#2a1a00', border:'#fbbf24', text:'#fef3c7' },
  { bg:'#2d1a1a', border:'#fb923c', text:'#ffedd5' },
  { bg:'#1f1f2e', border:'#9ca3af', text:'#f3f4f6' },
];

// ── State ──────────────────────────────────────────────────
let score    = 0;
let lives    = 3;
let level    = 1;
let active   = false;
let spawnMs  = 1300;   // ms between spawns
let fallMs   = 3000;   // ms to fall across screen
let spawnTid = null;
let levelTid = null;
let words    = [];

// ── DOM ────────────────────────────────────────────────────
const arena        = document.getElementById('arena');
const hudScore     = document.getElementById('hud-score');
const hudLives     = document.getElementById('hud-lives');
const levelBadge   = document.getElementById('level-badge');
const overlay      = document.getElementById('overlay');
const finalScore   = document.getElementById('final-score');
const btnPlay      = document.getElementById('btn-play');
const flash        = document.getElementById('flash');

// ── Helpers ────────────────────────────────────────────────
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function flashScreen(color, alpha) {
  flash.style.background = color;
  flash.style.opacity = alpha;
  setTimeout(() => { flash.style.opacity = 0; }, 180);
}

function bumpScore() {
  hudScore.classList.remove('bump');
  void hudScore.offsetWidth; // reflow
  hudScore.classList.add('bump');
  setTimeout(() => hudScore.classList.remove('bump'), 180);
}

function renderLives() {
  hudLives.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
}

function spawnPop(x, y, text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.textContent = text;
  el.style.color = color;
  el.style.setProperty('--y', y + 'px');
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

// ── Spawn word ─────────────────────────────────────────────
function spawnWord() {
  if (!active) return;

  const isHu  = Math.random() < 0.38;
  const pool  = isHu ? HU : OTHER;
  const word  = pick(pool);
  const pal   = pick(PALETTES);

  const el = document.createElement('div');
  el.className = 'word';
  el.textContent = word;
  el.style.background  = pal.bg;
  el.style.borderColor = pal.border;
  el.style.color       = pal.text;
  el.style.boxShadow   = `0 0 12px ${pal.border}44`;

  // Horizontal position — keep element inset from edges
  const maxX = arena.clientWidth - 220;
  el.style.left = rand(16, Math.max(16, maxX)) + 'px';

  const dur = fallMs + rand(-200, 200);
  el.style.animationDuration = dur + 'ms';

  el.addEventListener('click', ev => onClick(ev, el, isHu));
  arena.appendChild(el);
  words.push(el);

  // Miss detection for hu-words
  const missTimeout = setTimeout(() => {
    if (!el.dataset.clicked && el.parentNode) {
      if (isHu) {
        const r = el.getBoundingClientRect();
        const ar = arena.getBoundingClientRect();
        const tag = document.createElement('div');
        tag.className = 'miss-tag';
        tag.textContent = 'verpasst!';
        tag.style.setProperty('--y', (r.top - ar.top) + 'px');
        tag.style.left = (r.left - ar.left + r.width / 2) + 'px';
        tag.style.top  = (r.top  - ar.top) + 'px';
        arena.appendChild(tag);
        setTimeout(() => tag.remove(), 600);
      }
      el.remove();
      words = words.filter(w => w !== el);
    }
  }, dur + 60);

  el.dataset.missTimeout = missTimeout;
}

// ── Click handler ──────────────────────────────────────────
function onClick(ev, el, isHu) {
  ev.stopPropagation();
  if (el.dataset.clicked) return;
  el.dataset.clicked = '1';
  clearTimeout(Number(el.dataset.missTimeout));

  const r  = el.getBoundingClientRect();
  const ar = arena.getBoundingClientRect();
  const cx = r.left - ar.left + r.width  / 2;
  const cy = r.top  - ar.top  + r.height / 2;

  if (isHu) {
    score++;
    el.classList.add('boom-good');
    spawnPop(cx, cy, '+1', '#4ade80');
    flashScreen('rgba(52,211,153,0.12)', 1);
  } else {
    score = Math.max(score - 1, score - 1); // allow negative
    score--;
    lives--;
    el.classList.add('boom-bad');
    spawnPop(cx, cy, '−1', '#f87171');
    flashScreen('rgba(239,68,68,0.22)', 1);
    renderLives();
    if (lives <= 0) {
      setTimeout(endGame, 420);
      return;
    }
  }

  hudScore.textContent = score;
  bumpScore();

  setTimeout(() => {
    el.remove();
    words = words.filter(w => w !== el);
  }, 360);
}

// ── Difficulty ramp ────────────────────────────────────────
function rampDifficulty() {
  if (!active) return;
  level++;
  spawnMs = Math.max(380, spawnMs - 120);
  fallMs  = Math.max(1600, fallMs  - 180);
  levelBadge.textContent = `LEVEL ${level}`;
  levelBadge.style.color = level > 5 ? '#ef4444' : level > 3 ? '#f97316' : '#6d28d9';

  clearInterval(spawnTid);
  spawnTid = setInterval(spawnWord, spawnMs);
}

// ── Game start ─────────────────────────────────────────────
function startGame() {
  score   = 0;
  lives   = 3;
  level   = 1;
  spawnMs = 1300;
  fallMs  = 3000;
  active  = true;

  hudScore.textContent = '0';
  levelBadge.textContent = 'LEVEL 1';
  levelBadge.style.color = '#6d28d9';
  renderLives();

  // Clear leftover words
  arena.innerHTML = '';
  words = [];

  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  setTimeout(() => overlay.style.display = 'none', 300);

  spawnTid = setInterval(spawnWord, spawnMs);
  levelTid = setInterval(rampDifficulty, 14000);
}

// ── Game end ───────────────────────────────────────────────
function endGame() {
  active = false;
  clearInterval(spawnTid);
  clearInterval(levelTid);

  // Freeze & fade remaining words
  words.forEach(w => {
    w.style.animationPlayState = 'paused';
    w.style.opacity = '0.2';
  });
  setTimeout(() => {
    arena.innerHTML = '';
    words = [];
  }, 500);

  const msg = score >= 20 ? '🏆 Mega!' : score >= 10 ? '🎉 Gut!' : score >= 0 ? '😅 OK!' : '💀 Outch!';
  finalScore.textContent = `${msg}  ${score} Punkte`;
  finalScore.style.display = 'block';
  btnPlay.textContent = 'NOCHMAL ▶';

  overlay.style.display = 'flex';
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  overlay.style.pointerEvents = 'auto';
}

// ── Controls ───────────────────────────────────────────────
btnPlay.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !active) {
    e.preventDefault();
    startGame();
  }
});
