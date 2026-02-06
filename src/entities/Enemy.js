// CLAWMAGEDDON - Enemies
import Phaser from 'phaser';
import { ENEMY, GAME } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'GRUNT') {
    const typeConfig = ENEMY.TYPES[type] || ENEMY.TYPES.GRUNT;
    const textureKey = `enemy_${type.toLowerCase()}`;
    
    // Create texture if needed
    if (!scene.textures.exists(textureKey)) {
      Enemy.createTexture(scene, textureKey, typeConfig);
    }
    
    super(scene, x, y, textureKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.typeConfig = typeConfig;
    this.type = type;
    this.health = typeConfig.health;
    this.scoreValue = typeConfig.score;
    this.isFlying = typeConfig.flying || false;
    
    this.body.setSize(ENEMY.WIDTH * 0.8, ENEMY.HEIGHT * 0.9);
    this.body.allowGravity = !this.isFlying;
    this.setActive(false);
    this.setVisible(false);
    
    // Flying enemies bob up and down
    this.flyOffset = 0;
    this.flyBaseY = y;
  }

  static createTexture(scene, key, config) {
    const g = scene.add.graphics();
    const w = ENEMY.WIDTH;
    const h = ENEMY.HEIGHT;
    
    // Evil alien soldier
    g.fillStyle(config.color);
    
    // Body
    g.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.5);
    
    // Head
    g.fillEllipse(w * 0.5, h * 0.2, w * 0.5, h * 0.35);
    
    // Evil eyes
    g.fillStyle(0xff0000);
    g.fillCircle(w * 0.35, h * 0.18, 4);
    g.fillCircle(w * 0.65, h * 0.18, 4);
    
    // Legs
    g.fillStyle(config.color);
    g.fillRect(w * 0.25, h * 0.75, 8, 15);
    g.fillRect(w * 0.55, h * 0.75, 8, 15);
    
    // Arms
    g.fillRect(w * 0.05, h * 0.4, 10, 6);
    g.fillRect(w * 0.75, h * 0.4, 10, 6);
    
    // Add spikes for TANK type
    if (config.health > 1) {
      g.fillStyle(0x555555);
      g.fillTriangle(w * 0.3, h * 0.05, w * 0.35, h * 0.2, w * 0.4, h * 0.05);
      g.fillTriangle(w * 0.6, h * 0.05, w * 0.65, h * 0.2, w * 0.7, h * 0.05);
    }
    
    // Wings for FLYER type
    if (config.flying) {
      g.fillStyle(0x9932cc, 0.7);
      g.fillEllipse(w * 0.1, h * 0.35, 15, 25);
      g.fillEllipse(w * 0.9, h * 0.35, 15, 25);
    }
    
    g.generateTexture(key, w, h);
    g.destroy();
  }

  spawn(x, y, scrollSpeed) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.health = this.typeConfig.health;
    this.flyBaseY = y;
    
    // Move left at scroll speed + own movement
    const moveSpeed = scrollSpeed + (this.typeConfig.speed || 0);
    this.body.setVelocityX(-moveSpeed);
    
    eventBus.emit(Events.ENEMY_SPAWNED, { type: this.type });
  }

  update(time) {
    // Flying enemies bob
    if (this.isFlying && this.active) {
      this.flyOffset = Math.sin(time * 0.005) * 30;
      this.y = this.flyBaseY + this.flyOffset;
    }
    
    // Deactivate when off screen left
    if (this.x < -50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  hit() {
    this.health--;
    
    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });
    
    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    const score = gameState.addScore(this.scoreValue);
    gameState.enemiesKilled++;
    gameState.incrementCombo();
    
    eventBus.emit(Events.ENEMY_KILLED, { 
      x: this.x, 
      y: this.y, 
      type: this.type,
      score: score,
    });
    
    eventBus.emit(Events.SCORE_CHANGED, { 
      score: gameState.score, 
      delta: score 
    });
    
    this.setActive(false);
    this.setVisible(false);
  }
}

// Enemy pool manager
export class EnemyPool {
  constructor(scene, maxSize = 15) {
    this.scene = scene;
    this.groups = {};
    
    // Create a pool for each enemy type
    Object.keys(ENEMY.TYPES).forEach(type => {
      this.groups[type] = scene.physics.add.group({
        classType: Enemy,
        maxSize: maxSize,
        runChildUpdate: true,
      });
      
      // Pre-create enemies
      for (let i = 0; i < 5; i++) {
        const enemy = new Enemy(scene, -100, -100, type);
        this.groups[type].add(enemy);
      }
    });
  }

  spawn(x, y, type, scrollSpeed) {
    const group = this.groups[type];
    if (!group) return null;
    
    let enemy = group.getFirstDead(false);
    if (!enemy) {
      enemy = new Enemy(this.scene, x, y, type);
      group.add(enemy);
    }
    
    enemy.spawn(x, y, scrollSpeed);
    return enemy;
  }

  getAllGroups() {
    return Object.values(this.groups);
  }

  getGroup(type) {
    return this.groups[type];
  }
}
