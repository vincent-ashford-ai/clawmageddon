// CLAWMAGEDDON - Main Game Scene
import Phaser from 'phaser';
import { GAME, PLAYER, ENEMY, COLORS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { Player } from '../entities/Player.js';
import { BulletPool } from '../entities/Bullet.js';
import { EnemyPool } from '../entities/Enemy.js';
import { Background } from '../systems/Background.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();
    gameState.scrollSpeed = GAME.SCROLL_SPEED;
    
    // Mobile detection
    this.isMobile = this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;

    // Systems
    this.background = new Background(this);
    this.particleSystem = new ParticleSystem(this);
    
    // Entities
    this.player = new Player(this);
    this.bullets = new BulletPool(this);
    this.enemies = new EnemyPool(this);
    
    // Collision: player with ground
    this.physics.add.collider(this.player.sprite, this.background.getGroundCollider());
    
    // Collision: bullets with enemies
    this.enemies.getAllGroups().forEach(group => {
      this.physics.add.overlap(
        this.bullets.getGroup(),
        group,
        this.onBulletHitEnemy,
        null,
        this
      );
      
      // Collision: enemies with player
      this.physics.add.overlap(
        this.player.sprite,
        group,
        this.onEnemyHitPlayer,
        null,
        this
      );
    });
    
    // Input
    this.setupInput();
    
    // Event listeners
    this.setupEvents();
    
    // Spawn timer
    this.nextEnemySpawn = 0;
    
    // Start UI scene
    this.scene.launch('UIScene');
    
    gameState.started = true;
    eventBus.emit(Events.GAME_START);
  }

  setupInput() {
    // Keyboard
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    
    // Track if action was just pressed this frame
    this.actionPressed = false;
    
    // Touch/click - anywhere on screen
    this.input.on('pointerdown', () => {
      this.actionPressed = true;
    });
  }

  setupEvents() {
    // Player shoots - spawn bullet
    eventBus.on(Events.PLAYER_SHOOT, (data) => {
      this.bullets.fire(data.x, data.y);
    });
    
    // Screen shake
    eventBus.on(Events.SCREEN_SHAKE, (data) => {
      this.cameras.main.shake(data.duration, data.intensity * 0.001);
    });
  }

  update(time, delta) {
    if (gameState.gameOver) return;
    
    // Check for action input
    const keyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                       Phaser.Input.Keyboard.JustDown(this.upKey) ||
                       Phaser.Input.Keyboard.JustDown(this.wKey);
    
    const action = keyPressed || this.actionPressed;
    this.actionPressed = false; // Reset for next frame
    
    // Update player
    this.player.update(action, time);
    
    // Update background parallax
    this.background.update(gameState.scrollSpeed, delta);
    
    // Update distance
    gameState.addDistance(gameState.scrollSpeed * (delta / 1000) * 0.1);
    eventBus.emit(Events.DISTANCE_CHANGED, { distance: gameState.distance });
    
    // Increase difficulty over time
    gameState.scrollSpeed = Math.min(
      GAME.SCROLL_SPEED + gameState.distance * GAME.DIFFICULTY_RAMP * 10,
      GAME.MAX_SCROLL_SPEED
    );
    
    // Spawn enemies
    this.spawnEnemies(time);
    
    // Update enemy velocities to match scroll speed
    this.enemies.getAllGroups().forEach(group => {
      group.getChildren().forEach(enemy => {
        if (enemy.active) {
          const baseSpeed = enemy.typeConfig?.speed || 0;
          enemy.body.setVelocityX(-(gameState.scrollSpeed + baseSpeed));
        }
      });
    });
    
    // Combo decay - reset if no kills for 2 seconds
    if (!this.lastKillTime) this.lastKillTime = time;
    if (time - this.lastKillTime > 2000 && gameState.combo > 0) {
      gameState.resetCombo();
      eventBus.emit(Events.COMBO_CHANGED, { combo: 0 });
    }
  }

  spawnEnemies(time) {
    if (time < this.nextEnemySpawn) return;
    
    // Pick random enemy type weighted by difficulty
    const types = Object.keys(ENEMY.TYPES);
    const weights = this.getEnemyWeights();
    const type = this.weightedRandom(types, weights);
    
    // Spawn position
    const x = GAME.WIDTH + 50;
    const typeConfig = ENEMY.TYPES[type];
    const y = typeConfig.flying 
      ? Phaser.Math.Between(200, 400)  // Flyers in upper area
      : PLAYER.GROUND_Y - ENEMY.HEIGHT / 2;  // Ground enemies
    
    this.enemies.spawn(x, y, type, gameState.scrollSpeed);
    
    // Next spawn time - gets faster as game progresses
    const spawnRange = ENEMY.SPAWN_INTERVAL;
    const difficultyFactor = Math.max(0.3, 1 - gameState.distance * 0.001);
    this.nextEnemySpawn = time + Phaser.Math.Between(
      spawnRange.MIN * difficultyFactor,
      spawnRange.MAX * difficultyFactor
    );
  }

  getEnemyWeights() {
    // Weights change based on distance/difficulty
    const distance = gameState.distance;
    
    if (distance < 50) {
      return [1, 0, 0, 0]; // Only grunts at start
    } else if (distance < 150) {
      return [0.6, 0.3, 0.05, 0.05]; // Mostly grunts, some runners
    } else if (distance < 300) {
      return [0.4, 0.3, 0.15, 0.15]; // Mix
    } else {
      return [0.25, 0.25, 0.25, 0.25]; // Equal mix
    }
  }

  weightedRandom(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    
    // Deactivate bullet
    bullet.setActive(false);
    bullet.setVisible(false);
    
    // Hit enemy
    const killed = enemy.hit();
    
    if (killed) {
      this.lastKillTime = this.time.now;
    }
    
    eventBus.emit(Events.BULLET_HIT, { x: enemy.x, y: enemy.y });
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active || gameState.gameOver) return;
    
    // Game over!
    this.triggerGameOver();
  }

  triggerGameOver() {
    if (gameState.gameOver) return;
    
    gameState.gameOver = true;
    this.player.die();
    
    // Dramatic pause
    this.time.delayedCall(500, () => {
      eventBus.emit(Events.GAME_OVER, { 
        score: gameState.score,
        stats: gameState.getStats(),
      });
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene');
    });
  }

  shutdown() {
    eventBus.off(Events.PLAYER_SHOOT);
    eventBus.off(Events.SCREEN_SHAKE);
    this.particleSystem.destroy();
  }
}
