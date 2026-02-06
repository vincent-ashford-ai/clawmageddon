// CLAWMAGEDDON - Enemies
import Phaser from 'phaser';
import { ENEMY } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { renderSpriteSheet } from '../core/PixelRenderer.js';
import { ENEMY_SPRITES, ENEMY_FRAME } from '../sprites/enemies.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'GRUNT') {
    const typeConfig = ENEMY.TYPES[type] || ENEMY.TYPES.GRUNT;
    const textureKey = `enemy_${type.toLowerCase()}`;
    
    // Create pixel art texture if needed
    if (!scene.textures.exists(textureKey)) {
      Enemy.createTexture(scene, textureKey, type);
    }
    
    // Create animation if needed
    Enemy.createAnimation(scene, type);
    
    super(scene, x, y, textureKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.typeConfig = typeConfig;
    this.type = type;
    this.health = typeConfig.health;
    this.scoreValue = typeConfig.score;
    this.isFlying = typeConfig.flying || false;
    
    // Adjust physics body for pixel art dimensions (16x16 at 3x = 48x48)
    const spriteSize = ENEMY_FRAME.width * ENEMY_FRAME.scale;
    const bodyWidth = spriteSize * 0.6;
    const bodyHeight = spriteSize * 0.8;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(
      (spriteSize - bodyWidth) / 2,
      spriteSize - bodyHeight
    );
    this.body.allowGravity = !this.isFlying;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false; // Disable physics when pooled
    
    // Flying enemies bob up and down
    this.flyOffset = 0;
    this.flyBaseY = y;
  }

  static createTexture(scene, key, type) {
    const spriteData = ENEMY_SPRITES[type];
    if (!spriteData || !spriteData.frames) return;
    
    // Render sprite sheet with animation frames
    renderSpriteSheet(scene, key, spriteData.frames, ENEMY_FRAME.scale);
  }

  static createAnimation(scene, type) {
    const animKey = `enemy_${type.toLowerCase()}_walk`;
    if (scene.anims.exists(animKey)) return;
    
    const spriteData = ENEMY_SPRITES[type];
    if (!spriteData || !spriteData.frames) return;
    
    // Different frame rates for different enemy types
    const frameRates = {
      GRUNT: 4,
      RUNNER: 10,
      TANK: 3,
      FLYER: 6,
    };
    
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(`enemy_${type.toLowerCase()}`, {
        start: 0,
        end: spriteData.frames.length - 1
      }),
      frameRate: frameRates[type] || 6,
      repeat: -1
    });
  }

  spawn(x, y, scrollSpeed) {
    this.body.enable = true; // Re-enable physics on spawn
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.health = this.typeConfig.health;
    this.flyBaseY = y;
    
    // Move left at scroll speed + own movement
    const moveSpeed = scrollSpeed + (this.typeConfig.speed || 0);
    this.body.setVelocityX(-moveSpeed);
    
    // Play walk animation
    const animKey = `enemy_${this.type.toLowerCase()}_walk`;
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey);
    }
    
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
      this.body.enable = false; // Disable physics when pooled
      this.anims.stop();
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
    // Capture position BEFORE deactivation
    const deathX = this.x;
    const deathY = this.y - (this.height * 0.3); // Center of visual sprite
    
    const score = gameState.addScore(this.scoreValue);
    gameState.enemiesKilled++;
    gameState.incrementCombo();
    
    eventBus.emit(Events.ENEMY_KILLED, { 
      x: deathX, 
      y: deathY, 
      type: this.type,
      score: score,
    });
    
    eventBus.emit(Events.SCORE_CHANGED, { 
      score: gameState.score, 
      delta: score 
    });
    
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false; // Disable physics when pooled
    this.anims.stop();
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
