// CLAWMAGEDDON - Obstacles
import Phaser from 'phaser';
import { GAME } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

// Obstacle types
export const OBSTACLE_TYPES = {
  SPIKES: {
    width: 40,
    height: 30,
    color: 0x888888,
    deadly: true,
  },
  BARREL: {
    width: 35,
    height: 45,
    color: 0x44aa44,
    deadly: true,
    label: '☢',
  },
  CRATE: {
    width: 45,
    height: 40,
    color: 0x8b4513,
    deadly: false, // Can land on top
  },
};

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'SPIKES') {
    const config = OBSTACLE_TYPES[type] || OBSTACLE_TYPES.SPIKES;
    const textureKey = `obstacle_${type.toLowerCase()}`;
    
    // Create texture if needed
    if (!scene.textures.exists(textureKey)) {
      Obstacle.createTexture(scene, textureKey, config, type);
    }
    
    super(scene, x, y, textureKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.config = config;
    this.type = type;
    this.isDeadly = config.deadly;
    
    this.body.setSize(config.width * 0.8, config.height * 0.9);
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.setActive(false);
    this.setVisible(false);
  }

  static createTexture(scene, key, config, type) {
    const g = scene.add.graphics();
    const w = config.width;
    const h = config.height;
    
    if (type === 'SPIKES') {
      // Draw spikes
      g.fillStyle(config.color);
      const spikeCount = 4;
      const spikeWidth = w / spikeCount;
      for (let i = 0; i < spikeCount; i++) {
        g.fillTriangle(
          i * spikeWidth, h,
          i * spikeWidth + spikeWidth / 2, 0,
          (i + 1) * spikeWidth, h
        );
      }
      // Base
      g.fillStyle(0x555555);
      g.fillRect(0, h - 8, w, 8);
    } else if (type === 'BARREL') {
      // Toxic barrel
      g.fillStyle(config.color);
      g.fillRoundedRect(2, 5, w - 4, h - 10, 5);
      // Bands
      g.fillStyle(0x333333);
      g.fillRect(0, 8, w, 4);
      g.fillRect(0, h - 15, w, 4);
      // Hazard symbol area
      g.fillStyle(0xffff00);
      g.fillCircle(w / 2, h / 2, 10);
      g.fillStyle(0x000000);
      g.fillCircle(w / 2, h / 2, 6);
    } else if (type === 'CRATE') {
      // Wooden crate
      g.fillStyle(config.color);
      g.fillRect(0, 0, w, h);
      // Wood grain lines
      g.lineStyle(2, 0x5a3010);
      g.lineBetween(0, h / 3, w, h / 3);
      g.lineBetween(0, 2 * h / 3, w, 2 * h / 3);
      g.lineBetween(w / 2, 0, w / 2, h);
      // Border
      g.lineStyle(3, 0x3a2010);
      g.strokeRect(1, 1, w - 2, h - 2);
    }
    
    g.generateTexture(key, w, h);
    g.destroy();
  }

  spawn(x, y, scrollSpeed) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocityX(-scrollSpeed);
  }

  update() {
    if (this.x < -100) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

// Obstacle pool
export class ObstaclePool {
  constructor(scene, maxSize = 10) {
    this.scene = scene;
    this.groups = {};
    
    Object.keys(OBSTACLE_TYPES).forEach(type => {
      this.groups[type] = scene.physics.add.group({
        classType: Obstacle,
        maxSize: maxSize,
        runChildUpdate: true,
      });
      
      for (let i = 0; i < 3; i++) {
        const obs = new Obstacle(scene, -200, -200, type);
        this.groups[type].add(obs);
      }
    });
  }

  spawn(x, y, type, scrollSpeed) {
    const group = this.groups[type];
    if (!group) return null;
    
    let obs = group.getFirstDead(false);
    if (!obs) {
      obs = new Obstacle(this.scene, x, y, type);
      group.add(obs);
    }
    
    obs.spawn(x, y, scrollSpeed);
    return obs;
  }

  getAllGroups() {
    return Object.values(this.groups);
  }

  getDeadlyGroups() {
    return Object.entries(this.groups)
      .filter(([type]) => OBSTACLE_TYPES[type].deadly)
      .map(([, group]) => group);
  }

  getLandableGroups() {
    return Object.entries(this.groups)
      .filter(([type]) => !OBSTACLE_TYPES[type].deadly)
      .map(([, group]) => group);
  }
}
