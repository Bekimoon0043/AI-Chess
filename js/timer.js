/**
 * js/timer.js
 * Simple chess clock. Server remains authoritative for competitive games
 * (clocks arrive in game:state); this module just renders countdowns
 * smoothly between server syncs and drives local low-time UI/haptics.
 */
const Timer = (() => {
  let whiteMs = 0, blackMs = 0;
  let activeColor = null;
  let tickHandle = null;
  let lastTick = 0;
  let onTick = null;
  let onFlag = null;
  let lowTimeWarned = { white: false, black: false };
  let inited = false;

  function parseTimeControl(tc) {
    // "10+0" -> { baseMs, incrementMs }
    const [base, inc] = String(tc || '10+0').split('+').map(Number);
    return { baseMs: (base || 10) * 60000, incrementMs: (inc || 0) * 1000 };
  }

  function init(timeControl, callbacks = {}) {
    stop();
    const { baseMs } = parseTimeControl(timeControl);
    whiteMs = baseMs;
    blackMs = baseMs;
    activeColor = null;
    lowTimeWarned = { white: false, black: false };
    onTick = callbacks.onTick || null;
    onFlag = callbacks.onFlag || null;
    inited = true;
    render();
  }

  // Sync with authoritative server clocks (seconds), called on every game:state.
  function sync(whiteSeconds, blackSeconds, turn) {
    whiteMs = Math.max(0, whiteSeconds * 1000);
    blackMs = Math.max(0, blackSeconds * 1000);
    setActive(turn);
    render();
  }

  function setActive(color) {
    activeColor = color;
    lastTick = Date.now();
    if (!tickHandle) tickHandle = setInterval(tick, 250);
  }

  function tick() {
    if (!activeColor) return;
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    if (activeColor === 'white') whiteMs = Math.max(0, whiteMs - delta);
    else blackMs = Math.max(0, blackMs - delta);

    checkLowTime('white', whiteMs);
    checkLowTime('black', blackMs);

    if (whiteMs === 0 || blackMs === 0) {
      stop();
      if (onFlag) onFlag(whiteMs === 0 ? 'white' : 'black');
    }
    render();
  }

  function checkLowTime(color, ms) {
    if (ms > 0 && ms <= 30000 && !lowTimeWarned[color]) {
      lowTimeWarned[color] = true;
      if (window.TG) TG.haptic('check');
    }
  }

  function stop() {
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
    activeColor = null;
    inited = false;
  }

  function format(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function render() {
    const wEl = document.getElementById('clock-white');
    const bEl = document.getElementById('clock-black');
    if (wEl) {
      wEl.textContent = format(whiteMs);
      wEl.classList.toggle('clock-active', activeColor === 'white');
      wEl.classList.toggle('clock-low', whiteMs <= 30000);
    }
    if (bEl) {
      bEl.textContent = format(blackMs);
      bEl.classList.toggle('clock-active', activeColor === 'black');
      bEl.classList.toggle('clock-low', blackMs <= 30000);
    }
    if (onTick) onTick({ whiteMs, blackMs, activeColor });
  }

  return { init, sync, setActive, stop, format, get whiteMs() { return whiteMs; }, get blackMs() { return blackMs; }, get isInited() { return inited; } };
})();
