// CLAWMAGEDDON - Projectile Sprite Data
// Plasma claw shots and effects

// Legend:
// C/c = plasma cyan, M/m = muzzle orange, W = white core, Y = yellow, _ = transparent

// Plasma claw bullet - 8x4 pixels at 3x scale = 24x12 display
export const BULLET_SPRITE = [
  '_cCCCCc_',
  'cCCWWCCc',
  'cCCWWCCc',
  '_cCCCCc_',
];

// Muzzle flash effect - 8x8 pixels at 3x scale = 24x24 display
export const MUZZLE_FLASH = [
  '___WW___',
  '__MWWM__',
  '_MWWWWM_',
  'MWWWWWWM',
  'MWWWWWWM',
  '_MWWWWM_',
  '__MWWM__',
  '___WW___',
];

// Small explosion particle - 4x4 pixels
export const EXPLOSION_PARTICLE = [
  '_Mm_',
  'MYYm',
  'MYYm',
  '_mM_',
];

// Frame dimensions (pre-scale)
export const BULLET_FRAME = {
  width: 8,
  height: 4,
  scale: 3,
};

export const MUZZLE_FRAME = {
  width: 8,
  height: 8,
  scale: 3,
};

export const EXPLOSION_FRAME = {
  width: 4,
  height: 4,
  scale: 3,
};
