// CLAWMAGEDDON - Pixel Art Renderer
// Renders pixel matrices to Phaser textures with optional scaling

import { PALETTE } from '../sprites/palette.js';

/**
 * Parse a pixel matrix (array of strings) into a 2D array of color values
 * @param {string[]} matrix - Array of strings where each char is a palette key
 * @param {object} palette - Color palette object
 * @returns {Array<Array<number|null>>} 2D array of hex colors
 */
function parseMatrix(matrix, palette = PALETTE) {
  return matrix.map(row => 
    [...row].map(char => palette[char] ?? null)
  );
}

/**
 * Render a pixel art matrix to a Phaser texture
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {string} key - Texture key name
 * @param {string[]} matrix - Pixel art matrix (array of strings)
 * @param {number} scale - Pixel scale (default 2 for retro look)
 * @param {object} palette - Color palette (default PALETTE)
 */
export function renderPixelArt(scene, key, matrix, scale = 2, palette = PALETTE) {
  // Skip if texture already exists
  if (scene.textures.exists(key)) {
    return;
  }
  
  const pixels = parseMatrix(matrix, palette);
  const height = pixels.length;
  const width = pixels[0]?.length || 0;
  
  const g = scene.add.graphics();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixels[y][x];
      if (color !== null) {
        g.fillStyle(color, 1);
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  
  g.generateTexture(key, width * scale, height * scale);
  g.destroy();
}

/**
 * Render multiple frames into a sprite sheet texture
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {string} key - Texture key name
 * @param {Array<string[]>} frames - Array of pixel art matrices
 * @param {number} scale - Pixel scale
 * @param {object} palette - Color palette
 * @returns {{frameWidth: number, frameHeight: number}} Frame dimensions for animation
 */
export function renderSpriteSheet(scene, key, frames, scale = 2, palette = PALETTE) {
  // Skip if texture already exists
  if (scene.textures.exists(key)) {
    const texture = scene.textures.get(key);
    const frame = texture.get(0);
    return { 
      frameWidth: frame.width, 
      frameHeight: frame.height 
    };
  }
  
  if (!frames.length) return { frameWidth: 0, frameHeight: 0 };
  
  const firstFrame = parseMatrix(frames[0], palette);
  const frameHeight = firstFrame.length;
  const frameWidth = firstFrame[0]?.length || 0;
  const totalWidth = frameWidth * frames.length;
  
  const g = scene.add.graphics();
  
  frames.forEach((matrix, frameIndex) => {
    const pixels = parseMatrix(matrix, palette);
    const offsetX = frameIndex * frameWidth * scale;
    
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < (pixels[y]?.length || 0); x++) {
        const color = pixels[y][x];
        if (color !== null) {
          g.fillStyle(color, 1);
          g.fillRect(offsetX + x * scale, y * scale, scale, scale);
        }
      }
    }
  });
  
  g.generateTexture(key, totalWidth * scale, frameHeight * scale);
  g.destroy();
  
  // Add frames to the texture for animation
  const texture = scene.textures.get(key);
  const scaledFrameWidth = frameWidth * scale;
  const scaledFrameHeight = frameHeight * scale;
  
  frames.forEach((_, index) => {
    texture.add(index, 0, index * scaledFrameWidth, 0, scaledFrameWidth, scaledFrameHeight);
  });
  
  return { frameWidth: scaledFrameWidth, frameHeight: scaledFrameHeight };
}
