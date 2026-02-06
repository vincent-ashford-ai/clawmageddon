import Phaser from 'phaser';
import { GameConfig } from './core/GameConfig.js';
import { eventBus, Events } from './core/EventBus.js';
import { gameState } from './core/GameState.js';
import { initAudioBridge } from './audio/AudioBridge.js';
import { audioManager } from './audio/AudioManager.js';

// Initialize audio bridge (connects EventBus to audio system)
initAudioBridge();

// Initialize audio on first user interaction
const initAudio = async () => {
  await audioManager.init();
  document.removeEventListener('click', initAudio);
  document.removeEventListener('keydown', initAudio);
  document.removeEventListener('touchstart', initAudio);
};

document.addEventListener('click', initAudio);
document.addEventListener('keydown', initAudio);
document.addEventListener('touchstart', initAudio);

const game = new Phaser.Game(GameConfig);

// Expose for Playwright testing
window.__GAME__ = game;
window.__GAME_STATE__ = gameState;
window.__EVENT_BUS__ = eventBus;
window.__EVENTS__ = Events;
window.__AUDIO_MANAGER__ = audioManager;
