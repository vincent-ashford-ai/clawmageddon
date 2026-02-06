// CLAWMAGEDDON - Epic Title Screen Art
// Contra-style box art with lobster soldiers

export const TITLE_PALETTE = {
  '_': null,           // Transparent
  'R': '#dc143c',      // Crimson shell
  'r': '#8b0000',      // Dark red
  'O': '#ff4500',      // Orange claw
  'o': '#cc3300',      // Dark orange
  'Y': '#ffd700',      // Gold/yellow
  'y': '#daa520',      // Dark gold
  'B': '#1e90ff',      // Blue bandana
  'b': '#104e8b',      // Dark blue
  'K': '#222222',      // Black outline
  'W': '#ffffff',      // White highlight
  'w': '#cccccc',      // Gray
  'S': '#c0c0c0',      // Silver/metal
  's': '#808080',      // Dark silver
  'F': '#ff6600',      // Fire/muzzle flash
  'f': '#ff0000',      // Fire core
  'M': '#8b4513',      // Brown/mud
  'E': '#ffff00',      // Eye glow
};

// Epic hero lobster - 32x40, armed and dangerous
export const HERO_LOBSTER = [
  '________________________________',
  '___________KKKKKKKK____________',
  '__________KBBBBBBBBK___________',
  '_________KBBBBWWBBBK___________',
  '________KRRRRKKKKRRRRK_________',
  '_______KRRRRRRRRRRRRRRK________',
  '______KRRRRRRRRRRRRRRRRK_______',
  '_____KRRRRRWWRRRRWWRRRRRK______',
  '____KRRRRRRRRRRRRRRRRRRRRKssss_',
  '___KRRRRRORRRRRRRRRRORRRRKssssK',
  '__KRRRROOOORRRRRRRROOOORRKssssK',
  '__KRRROOOOOORRrrrrOOOOOORKssssK',
  '_KRRRoOOOOOORrrrrrrOOOOOoRKsssK',
  '_KRRROoOOOOORRrrrrOOOOOoORKssKF',
  '_KRRRROoooOORRRRRROOoooORRKsKFF',
  '__KRRRROoooRRRRRRRRoooORRRKKFFF',
  '__KRRRRROooRRRRRRRRooORRRRKFFFF',
  '___KRRRRROoRRrrrrRRoORRRRKFFfff',
  '____KRRRROORrrrrrrROORRRKFFffYY',
  '_____KRRRROORRrrRROORRRKFFfYYY_',
  '______KRRRROORRRROORRRKFFfYY___',
  '_______KRRRROOOOOORRRKFFfY_____',
  '________KRRRROOOORRRKFff_______',
  '_________KRRRRRRRRRKf__________',
  '__________KRRRRRRRKK___________',
  '___________KRRRRRKK____________',
  '____________KRRRK______________',
  '_____________KRK_______________',
  '______________K________________',
  '________________________________',
];

// Second soldier - smaller, background
export const SOLDIER_SMALL = [
  '________________',
  '______KKKK______',
  '_____KBBBBK_____',
  '____KRRRRRK_____',
  '___KRRRRRRK_____',
  '__KRRRORRRK_sss_',
  '__KRROOORRKsssK_',
  '_KRRoOOoRRKssKF_',
  '_KRROooORRKsKFF_',
  '__KRRooRRKKFFF__',
  '___KRRRRKFFff___',
  '____KRRK________',
  '_____KK_________',
];

// Explosion sprite
export const EXPLOSION = [
  '____FFFF____',
  '__FFffffFF__',
  '_FfffFFFfffF',
  'FffFFFFFFffF',
  'FfFFFFFFFFfF',
  'FffFFFFFFffF',
  '_FfffFFFfffF',
  '__FFffffFF__',
  '____FFFF____',
];

// Muzzle flash
export const MUZZLE_FLASH = [
  '___YY___',
  '__YffY__',
  '_YfFFfY_',
  'YfFFFFfY',
  '_YfFFfY_',
  '__YffY__',
  '___YY___',
];

// Shell casing
export const SHELL_CASING = [
  'YY',
  'yy',
  'YY',
];

// Helper function to render pixel art to Phaser texture
export function renderTitleArt(scene, key, artArray, palette, scale = 2) {
  const height = artArray.length;
  // Get max width (some rows might be shorter)
  const width = Math.max(...artArray.map(row => row.length));
  
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  
  // Clear with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let y = 0; y < height; y++) {
    const row = artArray[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  
  // Add texture to Phaser
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  scene.textures.addCanvas(key, canvas);
  
  return { width: canvas.width, height: canvas.height };
}

// Generate procedural pixel art lobster silhouette for menu
export function drawLobsterSilhouette(graphics, cx, cy, scale = 1) {
  const s = scale;
  
  // Main body (dark silhouette with red outline glow)
  graphics.fillStyle(0x000000);
  
  // Body segments
  graphics.fillEllipse(cx - 20 * s, cy, 50 * s, 70 * s);
  graphics.fillEllipse(cx + 30 * s, cy - 10 * s, 60 * s, 80 * s);
  
  // Head
  graphics.fillEllipse(cx + 70 * s, cy - 25 * s, 40 * s, 50 * s);
  
  // Claws (holding guns!)
  graphics.fillEllipse(cx + 100 * s, cy - 50 * s, 40 * s, 25 * s);
  graphics.fillEllipse(cx + 100 * s, cy + 10 * s, 35 * s, 20 * s);
  graphics.fillEllipse(cx - 40 * s, cy + 20 * s, 30 * s, 20 * s);
  
  // Gun barrels
  graphics.fillStyle(0x333333);
  graphics.fillRect(cx + 120 * s, cy - 55 * s, 60 * s, 8 * s);
  graphics.fillRect(cx + 110 * s, cy + 5 * s, 50 * s, 6 * s);
  
  // Antennae
  graphics.lineStyle(3, 0x000000);
  graphics.lineBetween(cx + 85 * s, cy - 60 * s, cx + 100 * s, cy - 90 * s);
  graphics.lineBetween(cx + 90 * s, cy - 55 * s, cx + 115 * s, cy - 80 * s);
  
  // Glowing eye
  graphics.fillStyle(0xff0000);
  graphics.fillCircle(cx + 85 * s, cy - 35 * s, 6 * s);
  
  // Eye white highlight
  graphics.fillStyle(0xffffff);
  graphics.fillCircle(cx + 83 * s, cy - 37 * s, 2 * s);
}

// Generate muzzle flash effect procedurally
export function drawMuzzleFlash(graphics, x, y, scale = 1) {
  const s = scale;
  const colors = [0xffffff, 0xffff00, 0xff6600, 0xff0000];
  
  for (let i = colors.length - 1; i >= 0; i--) {
    const r = (4 - i) * 8 * s;
    graphics.fillStyle(colors[i], 0.8 - i * 0.15);
    graphics.fillCircle(x, y, r);
  }
  
  // Rays
  graphics.lineStyle(3 * s, 0xffff00, 0.6);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const len = 25 * s + Math.random() * 15 * s;
    graphics.lineBetween(
      x, y,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len
    );
  }
}
