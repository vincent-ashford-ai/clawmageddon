// CLAWMAGEDDON - Audio Bridge
// Connects EventBus events to audio triggers

import { eventBus, Events } from '../core/EventBus.js';
import { audioManager } from './AudioManager.js';

class AudioBridge {
  constructor() {
    this.connected = false;
  }

  connect() {
    if (this.connected) return;

    // Audio initialization
    eventBus.on(Events.AUDIO_INIT, async () => {
      await audioManager.init();
    });

    // Music events
    eventBus.on(Events.MUSIC_MENU, () => {
      audioManager.playMusic('menu');
    });

    eventBus.on(Events.MUSIC_GAMEPLAY, () => {
      audioManager.playMusic('gameplay');
    });

    eventBus.on(Events.MUSIC_GAMEOVER, () => {
      audioManager.playMusic('gameover');
    });

    eventBus.on(Events.MUSIC_STOP, () => {
      audioManager.stopMusic();
    });

    // SFX events - direct triggers
    eventBus.on(Events.SFX_SHOOT, () => {
      audioManager.playSFX('shoot');
    });

    eventBus.on(Events.SFX_JUMP, () => {
      audioManager.playSFX('jump');
    });

    eventBus.on(Events.SFX_EXPLOSION, () => {
      audioManager.playSFX('explosion');
    });

    eventBus.on(Events.SFX_HIT, () => {
      audioManager.playSFX('hit');
    });

    // Game action → SFX mappings
    eventBus.on(Events.PLAYER_JUMP, () => {
      audioManager.playSFX('jump');
    });

    eventBus.on(Events.PLAYER_SHOOT, () => {
      audioManager.playSFX('shoot');
    });

    eventBus.on(Events.BULLET_FIRED, () => {
      audioManager.playSFX('shoot');
    });

    eventBus.on(Events.PLAYER_HIT, () => {
      audioManager.playSFX('hit');
    });

    eventBus.on(Events.PLAYER_LAND, () => {
      audioManager.playSFX('land');
    });

    eventBus.on(Events.ENEMY_KILLED, () => {
      audioManager.playSFX('enemyDeath');
    });

    eventBus.on(Events.EXPLOSION, () => {
      audioManager.playSFX('explosion');
    });

    // Game lifecycle → Music
    eventBus.on(Events.GAME_START, () => {
      audioManager.playMusic('gameplay');
    });

    eventBus.on(Events.GAME_OVER, () => {
      audioManager.playMusic('gameover');
    });

    eventBus.on(Events.GAME_RESTART, () => {
      audioManager.playMusic('gameplay');
    });

    this.connected = true;
    console.log('[AudioBridge] Connected to EventBus');
  }

  disconnect() {
    // Note: EventBus doesn't support removing all listeners for a specific subscriber
    // In practice, the bridge stays connected for the lifetime of the game
    this.connected = false;
  }
}

// Singleton export
export const audioBridge = new AudioBridge();

// Initialize function for easy import
export function initAudioBridge() {
  audioBridge.connect();
  return audioBridge;
}
