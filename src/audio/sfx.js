// CLAWMAGEDDON - Sound Effects
// Web Audio API procedural SFX - snappy arcade sounds

let audioContext = null;
let outputNode = null;

export function initSFX(ctx, output) {
  audioContext = ctx;
  outputNode = output;
  console.log('[SFX] Initialized');
}

// Utility: Create envelope
function createEnvelope(gainNode, attack, decay, sustain, release, duration) {
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + attack);
  gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
  gainNode.gain.linearRampToValueAtTime(0, now + duration - release);
}

// Utility: Play noise burst
function playNoise(duration, filter, filterFreq, gain = 0.3) {
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  const filterNode = audioContext.createBiquadFilter();
  filterNode.type = filter;
  filterNode.frequency.value = filterFreq;
  
  noise.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(outputNode);
  
  noise.start();
  noise.stop(audioContext.currentTime + duration);
}

// SFX: Shoot - classic 8-bit laser pew
function sfxShoot() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}

// SFX: Jump - springy boing
function sfxJump() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0.25, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);
}

// SFX: Explosion - big boom
function sfxExplosion() {
  // Low rumble
  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
  
  oscGain.gain.setValueAtTime(0.4, audioContext.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
  
  osc.connect(oscGain);
  oscGain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);
  
  // Noise burst
  playNoise(0.25, 'lowpass', 800, 0.5);
}

// SFX: Hit - player takes damage
function sfxHit() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, audioContext.currentTime);
  osc.frequency.setValueAtTime(100, audioContext.currentTime + 0.05);
  osc.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
  osc.frequency.setValueAtTime(100, audioContext.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0.35, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.2);
}

// SFX: Enemy death - satisfying pop
function sfxEnemyDeath() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);
  
  // Add a little pop noise
  playNoise(0.08, 'highpass', 2000, 0.2);
}

// SFX: Land - thump when landing
function sfxLand() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.08);
  
  gain.gain.setValueAtTime(0.25, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.08);
}

// SFX: Menu select - blip
function sfxSelect() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}

// Export SFX map
export function getSFX() {
  return {
    shoot: sfxShoot,
    jump: sfxJump,
    explosion: sfxExplosion,
    hit: sfxHit,
    enemyDeath: sfxEnemyDeath,
    land: sfxLand,
    select: sfxSelect
  };
}
