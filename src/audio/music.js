// CLAWMAGEDDON - Music System
// Strudel.cc patterns for retro chiptune music

import { initAudioOnFirstClick, controls, repl } from '@strudel/web';

let strudelReady = false;
let currentRepl = null;

// Initialize Strudel audio system
export async function initStrudel() {
  if (strudelReady) return;
  
  try {
    await initAudioOnFirstClick();
    strudelReady = true;
    console.log('[Music] Strudel initialized');
  } catch (err) {
    console.error('[Music] Strudel init failed:', err);
  }
}

// Music patterns - retro chiptune style
const patterns = {
  menu: `
    // Chill menu music - mysterious underwater vibe
    stack(
      // Lead melody - eerie lobster theme
      "c4 e4 g4 e4 c4 a3 g3 ~"
        .slow(2)
        .sound("square")
        .gain(0.3)
        .lpf(800)
        .delay(0.2),
      
      // Bass line - deep ocean pulse
      "c2 ~ c2 c2 g2 ~ g2 g2"
        .slow(2)
        .sound("sawtooth")
        .gain(0.25)
        .lpf(400),
      
      // Arpeggios - bubbles rising
      "[c3 e3 g3 c4]*2"
        .fast(2)
        .slow(2)
        .sound("triangle")
        .gain(0.15)
        .lpf(1200)
        .pan(sine.range(0.3, 0.7))
    )
  `,

  gameplay: `
    // Intense action music - Contra-style
    stack(
      // Driving bass - relentless pursuit
      "c2 c2 c3 c2 g2 g2 g3 g2 a2 a2 a3 a2 f2 f2 g2 g2"
        .fast(2)
        .sound("sawtooth")
        .gain(0.3)
        .lpf(500)
        .distort(0.3),
      
      // Lead riff - heroic lobster theme
      "[c4 e4 g4 c5] [g4 b4 d5 g5] [a4 c5 e5 a5] [f4 a4 c5 f5]"
        .slow(2)
        .sound("square")
        .gain(0.25)
        .lpf(2000)
        .delay(0.1),
      
      // Percussion simulation - 8-bit drums
      "[c6 ~ c6 ~]*4"
        .sound("square")
        .decay(0.02)
        .sustain(0)
        .gain(0.2),
      
      // Hi-hat pattern
      "c7*16"
        .sound("triangle")
        .decay(0.01)
        .sustain(0)
        .gain(0.1)
    )
  `,

  gameover: `
    // Game over - melancholic but short
    stack(
      // Sad descending melody
      "g4 f4 e4 d4 c4 ~ ~ ~"
        .slow(4)
        .sound("square")
        .gain(0.3)
        .lpf(600)
        .delay(0.3),
      
      // Low drone
      "c2 ~ ~ ~ ~ ~ ~ ~"
        .slow(4)
        .sound("sawtooth")
        .gain(0.2)
        .lpf(300)
    )
  `
};

// Pattern getter
export function getPatterns() {
  return patterns;
}

// Start playback of a pattern
export async function startPlayback(trackName) {
  if (!strudelReady) {
    console.warn('[Music] Strudel not ready');
    return;
  }

  if (!patterns[trackName]) {
    console.warn(`[Music] Unknown track: ${trackName}`);
    return;
  }

  try {
    // Stop current playback first
    stopPlayback();
    
    // Create new repl and start playing
    currentRepl = repl({
      defaultOutput: controls({}),
      onError: (err) => console.error('[Music] Pattern error:', err)
    });
    
    await currentRepl.evaluate(patterns[trackName]);
    currentRepl.start();
    
    console.log(`[Music] Started: ${trackName}`);
  } catch (err) {
    console.error('[Music] Playback failed:', err);
  }
}

// Stop current playback
export function stopPlayback() {
  if (currentRepl) {
    try {
      currentRepl.stop();
    } catch (err) {
      // Ignore stop errors
    }
    currentRepl = null;
  }
}
