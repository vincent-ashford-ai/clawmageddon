// CLAWMAGEDDON - Main Game Scene
import Phaser from 'phaser';
import { GAME, PLAYER, ENEMY, COLORS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { Player } from '../entities/Player.js';
import { BulletPool } from '../entities/Bullet.js';
import { EnemyPool } from '../entities/Enemy.js';
import { ObstaclePool, OBSTACLE_TYPES } from '../entities/Obstacle.js';
import { PlatformPool, PLATFORM_TYPES } from '../entities/Platform.js';
import { PowerUpPool, POWERUP_TYPES } from '../entities/PowerUp.js';
import { Background } from '../systems/Background.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();
    gameState.scrollSpeed = GAME.SCROLL_SPEED;
    
    // Power-up state
    this.activePowerUp = null;
    this.powerUpTimer = null;
    
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
    this.obstacles = new ObstaclePool(this);
    this.platforms = new PlatformPool(this);
    this.powerUps = new PowerUpPool(this);
    
    // Collision: player with ground
    this.physics.add.collider(this.player.sprite, this.background.getGroundCollider());
    
    // Collision: player with platforms (land on top)
    this.platforms.getAllGroups().forEach(group => {
      this.physics.add.collider(this.player.sprite, group);
    });
    
    // Collision: player with landable obstacles (crates)
    this.obstacles.getLandableGroups().forEach(group => {
      this.physics.add.collider(this.player.sprite, group);
    });
    
    // Collision: player with deadly obstacles
    this.obstacles.getDeadlyGroups().forEach(group => {
      this.physics.add.overlap(
        this.player.sprite,
        group,
        this.onObstacleHitPlayer,
        null,
        this
      );
    });
    
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
    
    // Collision: player with power-ups
    this.powerUps.getAllGroups().forEach(group => {
      this.physics.add.overlap(
        this.player.sprite,
        group,
        this.onPowerUpCollected,
        null,
        this
      );
    });
    
    // Input
    this.setupInput();
    
    // Event listeners
    this.setupEvents();
    
    // Spawn timers
    this.nextEnemySpawn = 0;
    this.nextObstacleSpawn = 2000;
    this.nextPlatformSpawn = 3000;
    this.nextPowerUpSpawn = 10000;
    
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
    
    this.actionPressed = false;
    
    this.input.on('pointerdown', (pointer) => {
      // Ignore mute button area
      if (pointer.x > GAME.WIDTH - 60 && pointer.y < 80) return;
      this.actionPressed = true;
    });
  }

  setupEvents() {
    eventBus.on(Events.PLAYER_SHOOT, (data) => {
      this.fireWeapon(data.x, data.y);
    });
    
    eventBus.on(Events.SCREEN_SHAKE, (data) => {
      this.cameras.main.shake(data.duration, data.intensity * 0.001);
    });
  }

  fireWeapon(x, y) {
    if (this.activePowerUp === 'TRIPLE_SHOT') {
      // Fire three bullets in spread pattern
      this.bullets.fire(x, y);
      this.bullets.fire(x, y - 30); // Up-diagonal
      this.bullets.fire(x, y + 30); // Down-diagonal
    } else {
      this.bullets.fire(x, y);
    }
  }

  update(time, delta) {
    if (gameState.gameOver) return;
    
    // Check for action input
    const keyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                       Phaser.Input.Keyboard.JustDown(this.upKey) ||
                       Phaser.Input.Keyboard.JustDown(this.wKey);
    
    const action = keyPressed || this.actionPressed;
    this.actionPressed = false;
    
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
    
    // Spawn obstacles
    this.spawnObstacles(time);
    
    // Spawn platforms
    this.spawnPlatforms(time);
    
    // Spawn power-ups
    this.spawnPowerUps(time);
    
    // Update enemy velocities to match scroll speed
    this.enemies.getAllGroups().forEach(group => {
      group.getChildren().forEach(enemy => {
        if (enemy.active) {
          const baseSpeed = enemy.typeConfig?.speed || 0;
          enemy.body.setVelocityX(-(gameState.scrollSpeed + baseSpeed));
        }
      });
    });
    
    // Update obstacle/platform velocities
    [...this.obstacles.getAllGroups(), ...this.platforms.getAllGroups()].forEach(group => {
      group.getChildren().forEach(obj => {
        if (obj.active) {
          obj.body.setVelocityX(-gameState.scrollSpeed);
        }
      });
    });
    
    // Update power-up velocities
    this.powerUps.getAllGroups().forEach(group => {
      group.getChildren().forEach(pu => {
        if (pu.active) {
          pu.body.setVelocityX(-gameState.scrollSpeed * 0.8);
        }
      });
    });
    
    // Combo decay
    if (!this.lastKillTime) this.lastKillTime = time;
    if (time - this.lastKillTime > 2000 && gameState.combo > 0) {
      gameState.resetCombo();
      eventBus.emit(Events.COMBO_CHANGED, { combo: 0 });
    }
  }

  spawnEnemies(time) {
    if (time < this.nextEnemySpawn) return;
    
    const types = Object.keys(ENEMY.TYPES);
    const weights = this.getEnemyWeights();
    const type = this.weightedRandom(types, weights);
    
    const x = GAME.WIDTH + 50;
    const typeConfig = ENEMY.TYPES[type];
    const y = typeConfig.flying 
      ? Phaser.Math.Between(200, 400)
      : PLAYER.GROUND_Y - ENEMY.HEIGHT / 2;
    
    this.enemies.spawn(x, y, type, gameState.scrollSpeed);
    
    const spawnRange = ENEMY.SPAWN_INTERVAL;
    const difficultyFactor = Math.max(0.3, 1 - gameState.distance * 0.001);
    this.nextEnemySpawn = time + Phaser.Math.Between(
      spawnRange.MIN * difficultyFactor,
      spawnRange.MAX * difficultyFactor
    );
  }

  spawnObstacles(time) {
    if (time < this.nextObstacleSpawn) return;
    if (gameState.distance < 30) return; // Don't spawn too early
    
    const types = Object.keys(OBSTACLE_TYPES);
    const type = Phaser.Utils.Array.GetRandom(types);
    const config = OBSTACLE_TYPES[type];
    
    const x = GAME.WIDTH + 50;
    const y = PLAYER.GROUND_Y - config.height / 2;
    
    this.obstacles.spawn(x, y, type, gameState.scrollSpeed);
    
    const difficultyFactor = Math.max(0.5, 1 - gameState.distance * 0.0005);
    this.nextObstacleSpawn = time + Phaser.Math.Between(2500, 5000) * difficultyFactor;
  }

  spawnPlatforms(time) {
    if (time < this.nextPlatformSpawn) return;
    if (gameState.distance < 50) return;
    
    const types = Object.keys(PLATFORM_TYPES);
    const type = Phaser.Utils.Array.GetRandom(types);
    
    const x = GAME.WIDTH + 100;
    const y = Phaser.Math.Between(350, 500); // Mid-height platforms
    
    this.platforms.spawn(x, y, type, gameState.scrollSpeed);
    
    this.nextPlatformSpawn = time + Phaser.Math.Between(4000, 8000);
  }

  spawnPowerUps(time) {
    if (time < this.nextPowerUpSpawn) return;
    if (gameState.distance < 80) return;
    
    // Only spawn TRIPLE_SHOT for now
    const type = 'TRIPLE_SHOT';
    
    const x = GAME.WIDTH + 50;
    const y = Phaser.Math.Between(400, 550);
    
    this.powerUps.spawn(x, y, type, gameState.scrollSpeed);
    
    this.nextPowerUpSpawn = time + Phaser.Math.Between(15000, 25000);
  }

  getEnemyWeights() {
    const distance = gameState.distance;
    
    if (distance < 50) {
      return [1, 0, 0, 0];
    } else if (distance < 150) {
      return [0.6, 0.3, 0.05, 0.05];
    } else if (distance < 300) {
      return [0.4, 0.3, 0.15, 0.15];
    } else {
      return [0.25, 0.25, 0.25, 0.25];
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
    
    bullet.setActive(false);
    bullet.setVisible(false);
    
    const killed = enemy.hit();
    
    if (killed) {
      this.lastKillTime = this.time.now;
    }
    
    eventBus.emit(Events.BULLET_HIT, { x: enemy.x, y: enemy.y });
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active || gameState.gameOver) return;
    if (this.activePowerUp === 'SHIELD') {
      enemy.die();
      return;
    }
    this.triggerGameOver();
  }

  onObstacleHitPlayer(player, obstacle) {
    if (!obstacle.active || gameState.gameOver) return;
    if (!obstacle.isDeadly) return;
    if (this.activePowerUp === 'SHIELD') return;
    this.triggerGameOver();
  }

  onPowerUpCollected(player, powerUp) {
    if (!powerUp.active) return;
    
    const data = powerUp.collect();
    this.activatePowerUp(data.type, data.duration);
  }

  activatePowerUp(type, duration) {
    // Clear existing power-up timer
    if (this.powerUpTimer) {
      this.powerUpTimer.remove();
    }
    
    this.activePowerUp = type;
    
    // Set expiration timer
    this.powerUpTimer = this.time.delayedCall(duration, () => {
      this.activePowerUp = null;
      eventBus.emit(Events.POWERUP_EXPIRED);
    });
  }

  triggerGameOver() {
    if (gameState.gameOver) return;
    
    gameState.gameOver = true;
    this.player.die();
    
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
    if (this.powerUpTimer) {
      this.powerUpTimer.remove();
    }
  }
}
