// CLAWMAGEDDON - DARK Palette (Cyberpunk Night City Theme)
// Neon highlights against dark backgrounds

export const PALETTE = {
  // Transparent
  _: null,
  
  // Lobster Hero
  R: 0xdc143c,  // Shell - Crimson red
  r: 0x8b0000,  // Shell shadow - Dark red
  O: 0xff4500,  // Claw - Orange-red
  o: 0xcc3300,  // Claw shadow
  Y: 0xffff00,  // Eyes - Bright yellow
  y: 0xcccc00,  // Eye accent
  B: 0x00bfff,  // Bandana - Neon blue
  b: 0x0080aa,  // Bandana shadow
  L: 0xcd5c5c,  // Legs - Indian red
  l: 0x8b3a3a,  // Legs shadow
  W: 0xffffff,  // White highlight
  w: 0xcccccc,  // Light gray
  K: 0x000000,  // Black
  k: 0x222222,  // Dark gray
  
  // Enemies - Alien soldiers
  G: 0x00ff88,  // Grunt - Neon green
  g: 0x008844,  // Grunt shadow
  P: 0xff00ff,  // Runner - Magenta
  p: 0x880088,  // Runner shadow
  T: 0x4488aa,  // Tank - Steel blue
  t: 0x224455,  // Tank shadow
  F: 0xaa44ff,  // Flyer - Purple
  f: 0x551188,  // Flyer shadow
  E: 0xff0000,  // Enemy eyes - Red
  e: 0x880000,  // Enemy eyes dim
  
  // Projectiles
  C: 0x00ffff,  // Plasma cyan
  c: 0x0088aa,  // Plasma shadow
  M: 0xff6600,  // Muzzle/glow orange
  m: 0xaa3300,  // Glow dim
  
  // Effects
  X: 0xff3366,  // Explosion pink
  x: 0xaa1133,  // Explosion dim
};

// Color name lookup for debugging
export const COLOR_NAMES = {
  R: 'shell',
  r: 'shell_shadow',
  O: 'claw',
  o: 'claw_shadow',
  Y: 'eyes',
  B: 'bandana',
  b: 'bandana_shadow',
  L: 'legs',
  W: 'white',
  K: 'black',
  G: 'grunt',
  P: 'runner',
  T: 'tank',
  F: 'flyer',
  E: 'enemy_eyes',
  C: 'plasma',
  M: 'muzzle',
  X: 'explosion',
};
