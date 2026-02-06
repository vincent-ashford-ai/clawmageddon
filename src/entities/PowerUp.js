// CLAWMAGEDDON - Power-ups
import Phaser from 'phaser';
import { GAME } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

export const POWERUP_TYPES = {
  TRIPLE_SHOT: {
    width: 30,
    height: 30,
    color: 0x00ffff,
    duration: 8000, // 8 seconds
    icon: '⚡',
  },
  RAPID_FIRE: {
    width: 30,
    height: 30,
    color: 0xff6600,
    duration: 6000,
    icon: '🔥',
  },
  SHIELD: {
    width: 30,
    height: 30,
    color: 0x00ff00,
    duration: 5000,
    icon: '🛡️',
  },
};

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'TRIPLE_SHOT') {
    const config = POWERUP_TYPES[type] || POWERUP_TYPES.TRIPLE_SHOT;
    const textureKey = `powerup_${type.toLowerCase()}`;
    
    if (!scene.textures.exists(textureKey)) {
      PowerUp.createTexture(scene, textureKey, config);
    }
    
    super(scene, x, y, textureKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.config = config;
    this.type = type;
    
    this.body.setSize(config.width * 0.8, config.height * 0.8);
    this.body.allowGravity = false;
    this.setActive(false);
    this.setVisible(false);
    
    // Floating animation
    this.bobOffset = 0;
    this.baseY = y;
  }

  static createTexture(scene, key, config) {
    const g = scene.add.graphics();
    const w = config.width;
    const h = config.height;
    
    // Glow
    g.fillStyle(config.color, 0.3);
    g.fillCircle(w / 2, h / 2, w / 2 + 5);
    
    // Outer ring
    g.fillStyle(config.color, 0.8);
    g.fillCircle(w / 2, h / 2, w / 2);
    
    // Inner circle
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(w / 2, h / 2, w / 3);
    
    // Center highlight
    g.fillStyle(config.color);
    g.fillCircle(w / 2, h / 2, w / 5);
    
    g.generateTexture(key, w + 10, h + 10);
    g.destroy();
  }

  spawn(x, y, scrollSpeed) {
    this.setPosition(x, y);
    this.baseY = y;
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocityX(-scrollSpeed);
    this.setAlpha(1);
    this.setScale(1);
  }

  update(time) {
    if (!this.active) return;
    
    // Floating bob
    this.bobOffset = Math.sin(time * 0.005) * 8;
    this.y = this.baseY + this.bobOffset;
    
    // Pulse scale
    const pulse = 1 + Math.sin(time * 0.008) * 0.1;
    this.setScale(pulse);
    
    if (this.x < -50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  collect() {
    // Sparkle effect
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setActive(false);
        this.setVisible(false);
      },
    });
    
    eventBus.emit(Events.POWERUP_COLLECTED, {
      type: this.type,
      duration: this.config.duration,
    });
    
    return {
      type: this.type,
      duration: this.config.duration,
    };
  }
}

export class PowerUpPool {
  constructor(scene, maxSize = 5) {
    this.scene = scene;
    this.groups = {};
    
    Object.keys(POWERUP_TYPES).forEach(type => {
      this.groups[type] = scene.physics.add.group({
        classType: PowerUp,
        maxSize: maxSize,
        runChildUpdate: true,
      });
      
      for (let i = 0; i < 2; i++) {
        const pu = new PowerUp(scene, -100, -100, type);
        this.groups[type].add(pu);
      }
    });
  }

  spawn(x, y, type, scrollSpeed) {
    const group = this.groups[type];
    if (!group) return null;
    
    let pu = group.getFirstDead(false);
    if (!pu) {
      pu = new PowerUp(this.scene, x, y, type);
      group.add(pu);
    }
    
    pu.spawn(x, y, scrollSpeed);
    return pu;
  }

  getAllGroups() {
    return Object.values(this.groups);
  }
}
