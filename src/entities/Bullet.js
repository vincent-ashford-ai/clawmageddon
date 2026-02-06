// CLAWMAGEDDON - Bullet (Claw-shaped projectile!)
import Phaser from 'phaser';
import { BULLET } from '../core/Constants.js';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create texture if it doesn't exist
    if (!scene.textures.exists('bullet')) {
      Bullet.createTexture(scene);
    }
    
    super(scene, x, y, 'bullet');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setSize(BULLET.WIDTH, BULLET.HEIGHT);
    this.body.allowGravity = false;
    this.setActive(false);
    this.setVisible(false);
  }

  static createTexture(scene) {
    const g = scene.add.graphics();
    const w = BULLET.WIDTH;
    const h = BULLET.HEIGHT;
    
    // Glowing plasma claw shot
    g.fillStyle(BULLET.GLOW_COLOR, 0.3);
    g.fillEllipse(w/2, h/2, w + 4, h + 4);
    
    g.fillStyle(BULLET.COLOR, 0.7);
    g.fillEllipse(w/2, h/2, w, h);
    
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(w/2, h/2, w * 0.5, h * 0.5);
    
    // Claw shape trail
    g.fillStyle(BULLET.GLOW_COLOR, 0.5);
    g.beginPath();
    g.moveTo(0, h * 0.3);
    g.lineTo(w * 0.3, h * 0.5);
    g.lineTo(0, h * 0.7);
    g.closePath();
    g.fill();
    
    g.generateTexture('bullet', w + 4, h + 4);
    g.destroy();
  }

  fire(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocityX(BULLET.SPEED);
  }

  update() {
    // Deactivate when off screen
    if (this.x > this.scene.scale.width + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

// Bullet pool manager
export class BulletPool {
  constructor(scene, maxSize = 20) {
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

  fire(x, y) {
    const bullet = this.group.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y);
      return bullet;
    }
    return null;
  }

  getGroup() {
    return this.group;
  }
}
