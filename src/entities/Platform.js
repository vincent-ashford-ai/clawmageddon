// CLAWMAGEDDON - Floating Platforms
import Phaser from 'phaser';
import { GAME } from '../core/Constants.js';

export const PLATFORM_TYPES = {
  METAL: {
    width: 80,
    height: 20,
    color: 0x555577,
    highlightColor: 0x7777aa,
  },
  NEON: {
    width: 100,
    height: 15,
    color: 0x00aaaa,
    highlightColor: 0x00ffff,
    glow: true,
  },
};

export class Platform extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'METAL') {
    const config = PLATFORM_TYPES[type] || PLATFORM_TYPES.METAL;
    const textureKey = `platform_${type.toLowerCase()}`;
    
    if (!scene.textures.exists(textureKey)) {
      Platform.createTexture(scene, textureKey, config);
    }
    
    super(scene, x, y, textureKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.config = config;
    this.type = type;
    
    this.body.setSize(config.width, config.height * 0.5);
    this.body.setOffset(0, 0);
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;
    this.setActive(false);
    this.setVisible(false);
  }

  static createTexture(scene, key, config) {
    const g = scene.add.graphics();
    const w = config.width;
    const h = config.height;
    
    // Glow effect for neon
    if (config.glow) {
      g.fillStyle(config.color, 0.3);
      g.fillRoundedRect(-4, -4, w + 8, h + 8, 6);
    }
    
    // Main platform
    g.fillStyle(config.color);
    g.fillRoundedRect(0, 0, w, h, 4);
    
    // Top highlight
    g.fillStyle(config.highlightColor);
    g.fillRoundedRect(2, 2, w - 4, 4, 2);
    
    // Edge details
    g.fillStyle(0x333333);
    g.fillRect(0, h - 3, w, 3);
    
    const texW = config.glow ? w + 8 : w;
    const texH = config.glow ? h + 8 : h;
    g.generateTexture(key, texW, texH);
    g.destroy();
  }

  spawn(x, y, scrollSpeed) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocityX(-scrollSpeed);
  }

  update() {
    if (this.x < -150) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

export class PlatformPool {
  constructor(scene, maxSize = 8) {
    this.scene = scene;
    this.groups = {};
    
    Object.keys(PLATFORM_TYPES).forEach(type => {
      this.groups[type] = scene.physics.add.group({
        classType: Platform,
        maxSize: maxSize,
        runChildUpdate: true,
      });
      
      for (let i = 0; i < 3; i++) {
        const plat = new Platform(scene, -200, -200, type);
        this.groups[type].add(plat);
      }
    });
  }

  spawn(x, y, type, scrollSpeed) {
    const group = this.groups[type];
    if (!group) return null;
    
    let plat = group.getFirstDead(false);
    if (!plat) {
      plat = new Platform(this.scene, x, y, type);
      group.add(plat);
    }
    
    plat.spawn(x, y, scrollSpeed);
    return plat;
  }

  getAllGroups() {
    return Object.values(this.groups);
  }
}
