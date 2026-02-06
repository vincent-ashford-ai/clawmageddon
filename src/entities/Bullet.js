// CLAWMAGEDDON - Bullet (Plasma claw projectile!)
import Phaser from 'phaser';
import { BULLET } from '../core/Constants.js';
import { renderPixelArt } from '../core/PixelRenderer.js';
import { BULLET_SPRITE, BULLET_FRAME } from '../sprites/projectiles.js';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create pixel art texture if it doesn't exist
    if (!scene.textures.exists('bullet')) {
      Bullet.createTexture(scene);
    }
    
    super(scene, x, y, 'bullet');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set physics body to match pixel art dimensions (8x4 at 3x = 24x12)
    const bodyWidth = BULLET_FRAME.width * BULLET_FRAME.scale;
    const bodyHeight = BULLET_FRAME.height * BULLET_FRAME.scale;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.allowGravity = false;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false; // Disable physics when pooled
  }

  static createTexture(scene) {
    renderPixelArt(scene, 'bullet', BULLET_SPRITE, BULLET_FRAME.scale);
  }

  fire(x, y, angleRadians = 0) {
    this.body.enable = true; // Re-enable physics on fire
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    // Calculate velocity from angle
    const vx = Math.cos(angleRadians) * BULLET.SPEED;
    const vy = Math.sin(angleRadians) * BULLET.SPEED;
    
    this.body.setVelocity(vx, vy);
    
    // Rotate bullet sprite to match trajectory
    this.setRotation(angleRadians);
  }

  update() {
    // Deactivate when off screen (any direction)
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    if (this.x > w + 50 || this.x < -50 || this.y < -50 || this.y > h + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.body.enable = false; // Disable physics when pooled
    }
  }
}

// Bullet pool manager
export class BulletPool {
  constructor(scene, maxSize = 30) {
    this.scene = scene;
    this.group = scene.physics.add.group({
      classType: Bullet,
      maxSize: maxSize,
      runChildUpdate: true,
      allowGravity: false,
    });
    
    // Pre-create bullets
    for (let i = 0; i < maxSize; i++) {
      const bullet = new Bullet(scene, -100, -100);
      this.group.add(bullet);
    }
  }

  fire(x, y, angleRadians = 0) {
    const bullet = this.group.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y, angleRadians);
      return bullet;
    }
    return null;
  }

  getGroup() {
    return this.group;
  }
}
