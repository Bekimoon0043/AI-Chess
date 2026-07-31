const Sound = (() => {
  let audioCtx = null;
  function init() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function play(freq, type, duration, vol = 0.2) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }
  return {
    init,
    move: () => play(600, 'sine', 0.1),
    capture: () => play(200, 'triangle', 0.2),
    check: () => { play(800, 'square', 0.15); setTimeout(() => play(800, 'square', 0.15), 150); },
    checkmate: () => play(100, 'sawtooth', 0.5),
    promotion: () => play(1000, 'sine', 0.3),
    castling: () => play(500, 'triangle', 0.3),
    gameStart: () => play(400, 'sine', 0.4),
    victory: () => {
      play(523, 'sine', 0.2);
      setTimeout(() => play(659, 'sine', 0.2), 200);
      setTimeout(() => play(784, 'sine', 0.3), 400);
    }
  };
})();
