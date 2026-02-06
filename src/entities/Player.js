// CLAWMAGEDDON - The Lobster Hero
import Phaser from 'phaser';
import { PLAYER, BULLET } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { renderSpriteSheet, renderPixelArt } from '../core/PixelRenderer.js';
import { PLAYER_RUN, PLAYER_JUMP, PLAYER_IDLE, PLAYER_FRAME } from '../sprites/player.js';
import { MUZZLE_FLASH, MUZZLE_FRAME } from '../sprites/projectiles.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.jumpsRemaining = PLAYER.MAX_JUMPS;
    this.lastFireTime = 0;
    this.isOnGround = true;
    
    // Create pixel art textures
    this.createTextures();
    
    // Create animations
    this.createAnimations();
    
    // Create sprite with physics
    this.sprite = scene.physics.add.sprite(PLAYER.X, PLAYER.GROUND_Y, 'lobster_run');
    this.sprite.setOrigin(0.5, 1);
    
    // Adjust physics body for pixel art dimensions (16x16 at 3x = 48x48)
    const spriteSize = PLAYER_FRAME.width * PLAYER_FRAME.scale;
    const bodyWidth = spriteSize * 0.5;
    const bodyHeight = spriteSize * 0.85;
    this.sprite.body.setSize(bodyWidth, bodyHeight);
    this.sprite.body.setOffset(
      (spriteSize - bodyWidth) / 2,
      spriteSize - bodyHeight
    );
    this.sprite.body.setCollideWorldBounds(true);
    
    // Start run animation
    this.sprite.play('lobster_run');
    
    // Create pixel art muzzle flash sprite (hidden by default)
    this.muzzleFlash = scene.add.sprite(0, 0, 'muzzle_flash');
    this.muzzleFlash.setOrigin(0.5, 0.5);
    this.muzzleFlash.setVisible(false);
  }

  createTextures() {
    // Render run cycle spritesheet
    renderSpriteSheet(this.scene, 'lobster_run', PLAYER_RUN, PLAYER_FRAME.scale);
    
    // Render jump pose
    renderPixelArt(this.scene, 'lobster_jump', PLAYER_JUMP, PLAYER_FRAME.scale);
    
    // Render idle pose
    renderPixelArt(this.scene, 'lobster_idle', PLAYER_IDLE, PLAYER_FRAME.scale);
    
    // Render muzzle flash
    renderPixelArt(this.scene, 'muzzle_flash', MUZZLE_FLASH, MUZZLE_FRAME.scale);
  }

  createAnimations() {
    // Run animation
    if (!this.scene.anims.exists('lobster_run')) {
      this.scene.anims.create({
        key: 'lobster_run',
        frames: this.scene.anims.generateFrameNumbers('lobster_run', { 
          start: 0, 
          end: PLAYER_RUN.length - 1 
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  update(inputAction, time) {
    const body = this.sprite.body;
    
    // Check if on ground
    const wasOnGround = this.isOnGround;
    this.isOnGround = body.blocked.down;
    
    // Reset jumps when landing
    if (!wasOnGround && this.isOnGround) {
      this.jumpsRemaining = PLAYER.MAX_JUMPS;
      this.sprite.play('lobster_run');
      eventBus.emit(Events.PLAYER_LAND);
    }
    
    // Handle input action (tap or spacebar)
    if (inputAction) {
      // If on ground: jump AND shoot
      if (this.isOnGround) {
        this.jump();
        this.shoot(time);
      } 
      // If in air: just shoot (can shoot multiple times)
      else {
        // Allow double jump
        if (this.jumpsRemaining > 0) {
          this.jump();
        }
        this.shoot(time);
      }
    }
    
    // Update sprite animation based on state
    if (!this.isOnGround) {
      this.sprite.setTexture('lobster_jump');
    }
    
    // Update muzzle flash position (at the claw)
    const spriteSize = PLAYER_FRAME.width * PLAYER_FRAME.scale;
    this.muzzleFlash.x = this.sprite.x + spriteSize * 0.4;
    this.muzzleFlash.y = this.sprite.y - spriteSize * 0.55;
  }

  jump() {
    if (this.jumpsRemaining > 0) {
      this.sprite.body.setVelocityY(PLAYER.JUMP_VELOCITY);
      this.jumpsRemaining--;
      gameState.jumpsUsed++;
      this.sprite.setTexture('lobster_jump');
      eventBus.emit(Events.PLAYER_JUMP, { 
        doubleJump: this.jumpsRemaining < PLAYER.MAX_JUMPS - 1 
      });
    }
  }

  shoot(time) {
    if (time - this.lastFireTime < BULLET.FIRE_RATE) return;
    
    this.lastFireTime = time;
    gameState.shotsFired++;
    
    // Emit bullet event - GameScene will spawn the bullet
    const spriteSize = PLAYER_FRAME.width * PLAYER_FRAME.scale;
    eventBus.emit(Events.PLAYER_SHOOT, {
      x: this.sprite.x + spriteSize * 0.45,
      y: this.sprite.y - spriteSize * 0.55,
    });
    
    // Show muzzle flash
    this.showMuzzleFlash();
    
    // Screen shake on shoot (tiny)
    this.scene.cameras.main.shake(30, 0.002);
  }

  showMuzzleFlash() {
    this.muzzleFlash.setVisible(true);
    this.muzzleFlash.setScale(0.8 + Math.random() * 0.4);
    this.muzzleFlash.setAngle(Math.random() * 30 - 15);
    
    this.scene.time.delayedCall(50, () => {
      this.muzzleFlash.setVisible(false);
    });
  }

  hit() {
    eventBus.emit(Events.PLAYER_HIT);
    eventBus.emit(Events.SCREEN_SHAKE, { intensity: 10, duration: 200 });
    
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
  }

  die() {
    eventBus.emit(Events.PLAYER_DIED);
    
    // Stop animation
    this.sprite.anims.stop();
    
    // Dramatic death - fly off screen
    this.sprite.body.setVelocity(-100, -400);
    this.sprite.body.setAngularVelocity(360);
  }

  reset() {
    this.sprite.setPosition(PLAYER.X, PLAYER.GROUND_Y);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setRotation(0);
    this.sprite.body.setAngularVelocity(0);
    this.jumpsRemaining = PLAYER.MAX_JUMPS;
    this.lastFireTime = 0;
    this.isOnGround = true;
    this.sprite.play('lobster_run');
  }

  destroy() {
    this.sprite.destroy();
    this.muzzleFlash.destroy();
  }
}
