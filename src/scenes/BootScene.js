import Phaser from 'phaser';
import { initAudioBridge } from '../audio/AudioBridge.js';
import { audioManager } from '../audio/AudioManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    console.log('[BootScene] Starting...');
    
    // Initialize audio bridge (connects EventBus to audio system)
    initAudioBridge();
    
    // Pre-initialize audio manager (non-blocking - will fully activate on first user interaction)
    audioManager.init().catch(err => {
      console.warn('[BootScene] Audio init warning:', err.message);
    });
    
    console.log('[BootScene] Transitioning to MenuScene');
    this.scene.start('MenuScene');
  }
}
