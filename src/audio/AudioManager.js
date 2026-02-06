// CLAWMAGEDDON - Audio Manager
// Handles audio lifecycle, muting, and coordination

import { initStrudel, startPlayback, stopPlayback, getPatterns } from './music.js';
import { initSFX, getSFX } from './sfx.js';

class AudioManager {
  constructor() {
    this.initialized = false;
    this.muted = false;
    this.musicMuted = false;
    this.sfxMuted = false;
    this.currentMusic = null;
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  async init() {
    if (this.initialized) return true;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();

      // Connect gain chain
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.masterGain.gain.value = 0.7;
      this.musicGain.gain.value = 0.5;
      this.sfxGain.gain.value = 0.8;

      // Initialize Strudel for music
      await initStrudel();

      // Initialize SFX system
      initSFX(this.audioContext, this.sfxGain);

      this.initialized = true;
      console.log('[AudioManager] Initialized successfully');
      return true;
    } catch (err) {
      console.error('[AudioManager] Failed to initialize:', err);
      return false;
    }
  }

  // Resume audio context if suspended (required after user interaction)
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Music control
  async playMusic(trackName) {
    if (!this.initialized || this.musicMuted) return;
    
    await this.resume();
    
    if (this.currentMusic === trackName) return;
    
    this.stopMusic();
    this.currentMusic = trackName;
    
    const patterns = getPatterns();
    if (patterns[trackName]) {
      await startPlayback(trackName);
      console.log(`[AudioManager] Playing music: ${trackName}`);
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      stopPlayback();
      console.log(`[AudioManager] Stopped music: ${this.currentMusic}`);
      this.currentMusic = null;
    }
  }

  // SFX control
  playSFX(name) {
    if (!this.initialized || this.sfxMuted) return;
    
    const sfx = getSFX();
    if (sfx[name]) {
      sfx[name]();
    }
  }

  // Mute controls
  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.7;
    }
  }

  setMusicMuted(muted) {
    this.musicMuted = muted;
    if (this.musicGain) {
      this.musicGain.gain.value = muted ? 0 : 0.5;
    }
    if (muted && this.currentMusic) {
      this.stopMusic();
    }
  }

  setSFXMuted(muted) {
    this.sfxMuted = muted;
    if (this.sfxGain) {
      this.sfxGain.gain.value = muted ? 0 : 0.8;
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Volume controls (0-1)
  setMasterVolume(vol) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  setMusicVolume(vol) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  setSFXVolume(vol) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  // Cleanup
  destroy() {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.initialized = false;
  }
}

// Singleton export
export const audioManager = new AudioManager();
