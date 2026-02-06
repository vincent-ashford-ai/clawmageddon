// CLAWMAGEDDON - Event Bus

export const Events = {
  // Game lifecycle
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',

  // Player actions
  PLAYER_JUMP: 'player:jump',
  PLAYER_SHOOT: 'player:shoot',
  PLAYER_HIT: 'player:hit',
  PLAYER_DIED: 'player:died',
  PLAYER_LAND: 'player:land',

  // Combat
  BULLET_FIRED: 'bullet:fired',
  BULLET_HIT: 'bullet:hit',
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_KILLED: 'enemy:killed',
  ENEMY_REACHED_PLAYER: 'enemy:reached',
  EXPLOSION: 'explosion',

  // Power-ups
  POWERUP_SPAWNED: 'powerup:spawned',
  POWERUP_COLLECTED: 'powerup:collected',
  POWERUP_EXPIRED: 'powerup:expired',

  // Obstacles
  OBSTACLE_HIT: 'obstacle:hit',

  // Score & Progress
  SCORE_CHANGED: 'score:changed',
  DISTANCE_CHANGED: 'distance:changed',
  COMBO_CHANGED: 'combo:changed',
  HIGHSCORE: 'highscore',

  // Visual effects
  PARTICLES_EMIT: 'particles:emit',
  SCREEN_SHAKE: 'screen:shake',
  MUZZLE_FLASH: 'muzzle:flash',

  // Audio
  AUDIO_INIT: 'audio:init',
  MUSIC_MENU: 'music:menu',
  MUSIC_GAMEPLAY: 'music:gameplay',
  MUSIC_GAMEOVER: 'music:gameover',
  MUSIC_STOP: 'music:stop',
  SFX_SHOOT: 'sfx:shoot',
  SFX_JUMP: 'sfx:jump',
  SFX_EXPLOSION: 'sfx:explosion',
  SFX_HIT: 'sfx:hit',
};

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, data) {
    if (!this.listeners[event]) return this;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`EventBus error in ${event}:`, err);
      }
    });
    return this;
  }

  removeAll() {
    this.listeners = {};
    return this;
  }
}

export const eventBus = new EventBus();
