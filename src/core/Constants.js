// CLAWMAGEDDON - Constants
// Vertical mobile-first endless runner

export const GAME = {
  WIDTH: 400,
  HEIGHT: 700,
  GRAVITY: 1200,
  SCROLL_SPEED: 250,
  DIFFICULTY_RAMP: 0.0005, // Speed increase per frame
  MAX_SCROLL_SPEED: 500,
};

export const PLAYER = {
  X: 100,
  GROUND_Y: 580,
  WIDTH: 48,
  HEIGHT: 64,
  JUMP_VELOCITY: -550,
  MAX_JUMPS: 2, // Double jump for that Contra feel
};

export const BULLET = {
  SPEED: 600,
  WIDTH: 16,
  HEIGHT: 8,
  FIRE_RATE: 150, // ms between shots
  COLOR: 0xffff00,
  GLOW_COLOR: 0xff6600,
};

export const ENEMY = {
  WIDTH: 40,
  HEIGHT: 48,
  SPAWN_INTERVAL: { MIN: 800, MAX: 2000 },
  TYPES: {
    GRUNT: { color: 0x8b0000, speed: 0, health: 1, score: 10 },
    RUNNER: { color: 0x4a0080, speed: 100, health: 1, score: 15 },
    TANK: { color: 0x2f4f4f, speed: 0, health: 3, score: 30 },
    FLYER: { color: 0x800080, speed: 50, health: 1, score: 20, flying: true },
  },
};

export const OBSTACLE = {
  SPAWN_INTERVAL: { MIN: 1500, MAX: 3500 },
  TYPES: {
    CRATE: { width: 50, height: 50, color: 0x8b4513, jumpable: true },
    BARREL: { width: 40, height: 55, color: 0x696969, explosive: true },
  },
};

export const LOBSTER = {
  // Color palette for our hero
  SHELL: 0xdc143c,       // Crimson red shell
  SHELL_DARK: 0x8b0000,  // Dark red for shading
  CLAW: 0xff4500,        // Orange-red claws
  EYES: 0xffff00,        // Yellow eyes
  BANDANA: 0x1e90ff,     // Cool blue bandana (Rambo style)
  LEGS: 0xcd5c5c,        // Indian red for legs
};

export const COLORS = {
  SKY_TOP: 0x0f0f23,     // Dark night sky
  SKY_BOTTOM: 0x1a1a3e,  // Slightly lighter at horizon
  GROUND: 0x2d2d2d,      // Dark industrial ground
  GROUND_LINE: 0x444444, // Ground detail lines
  UI_TEXT: '#ff4444',
  UI_SHADOW: '#000000',
  MENU_BG: 0x0f0f23,
  GAMEOVER_BG: 0x1a0000,
  BUTTON: 0xdc143c,
  BUTTON_HOVER: 0xff4444,
  EXPLOSION: 0xff6600,
  MUZZLE_FLASH: 0xffff00,
};

export const PARTICLES = {
  EXPLOSION: { count: 20, speed: 200, lifespan: 500 },
  SHELL_CASING: { count: 1, speed: 100, lifespan: 800 },
  DUST: { count: 5, speed: 50, lifespan: 300 },
  BLOOD: { count: 8, speed: 150, lifespan: 400 },
};

export const TRANSITION = {
  FADE_DURATION: 300,
  SCORE_POP_SCALE: 1.5,
  SCORE_POP_DURATION: 100,
  SCREEN_SHAKE: { intensity: 5, duration: 100 },
};

export const UI = {
  FONT_FAMILY: 'Courier New, monospace',
  TITLE_SIZE: '48px',
  SCORE_SIZE: '24px',
  BUTTON_SIZE: '28px',
};
