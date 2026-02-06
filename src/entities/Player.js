// CLAWMAGEDDON - The Lobster Hero
import Phaser from 'phaser';
import { PLAYER, LOBSTER, BULLET } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.jumpsRemaining = PLAYER.MAX_JUMPS;
    this.lastFireTime = 0;
    this.isOnGround = true;
    
    // Create the lobster sprite using graphics
    this.createLobsterTexture();
    
    // Create sprite with physics
    this.sprite = scene.physics.add.sprite(PLAYER.X, PLAYER.GROUND_Y, 'lobster');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.body.setSize(PLAYER.WIDTH * 0.7, PLAYER.HEIGHT * 0.9);
    this.sprite.body.setOffset(PLAYER.WIDTH * 0.15, PLAYER.HEIGHT * 0.1);
    this.sprite.body.setCollideWorldBounds(true);
    
    // Muzzle flash graphics (hidden by default)
    this.muzzleFlash = scene.add.graphics();
    this.muzzleFlash.setVisible(false);
    
    // Running animation bob
    this.bobOffset = 0;
  }

  createLobsterTexture() {
    const g = this.scene.add.graphics();
    const w = PLAYER.WIDTH;
    const h = PLAYER.HEIGHT;
    
    // === LEGS (back, running pose) ===
    g.fillStyle(LOBSTER.LEGS);
    // Back legs
    g.fillRect(w * 0.2, h * 0.75, 6, 18);
    g.fillRect(w * 0.35, h * 0.78, 6, 15);
    // Front legs
    g.fillRect(w * 0.55, h * 0.78, 6, 15);
    g.fillRect(w * 0.7, h * 0.75, 6, 18);
    
    // === BODY/TAIL ===
    g.fillStyle(LOBSTER.SHELL);
    // Tail segments
    g.fillEllipse(w * 0.15, h * 0.5, 14, 20);
    g.fillEllipse(w * 0.25, h * 0.48, 16, 22);
    // Main body
    g.fillEllipse(w * 0.45, h * 0.42, 28, 32);
    
    // Body shading
    g.fillStyle(LOBSTER.SHELL_DARK);
    g.fillEllipse(w * 0.15, h * 0.55, 10, 12);
    g.fillEllipse(w * 0.45, h * 0.5, 20, 18);
    
    // === HEAD ===
    g.fillStyle(LOBSTER.SHELL);
    g.fillEllipse(w * 0.7, h * 0.35, 22, 26);
    
    // Antennae
    g.lineStyle(2, LOBSTER.CLAW);
    g.beginPath();
    g.moveTo(w * 0.75, h * 0.2);
    g.lineTo(w * 0.85, h * 0.05);
    g.lineTo(w * 0.95, h * 0.02);
    g.stroke();
    g.beginPath();
    g.moveTo(w * 0.72, h * 0.22);
    g.lineTo(w * 0.78, h * 0.08);
    g.lineTo(w * 0.88, h * 0.06);
    g.stroke();
    
    // Eyes (on stalks!)
    g.fillStyle(LOBSTER.SHELL);
    g.fillRect(w * 0.65, h * 0.18, 4, 10);
    g.fillRect(w * 0.75, h * 0.16, 4, 12);
    g.fillStyle(LOBSTER.EYES);
    g.fillCircle(w * 0.67, h * 0.15, 5);
    g.fillCircle(w * 0.77, h * 0.12, 5);
    // Pupils
    g.fillStyle(0x000000);
    g.fillCircle(w * 0.69, h * 0.14, 2);
    g.fillCircle(w * 0.79, h * 0.11, 2);
    
    // === BANDANA (Rambo style!) ===
    g.fillStyle(LOBSTER.BANDANA);
    g.fillRect(w * 0.58, h * 0.28, 26, 8);
    // Bandana tail flowing behind
    g.beginPath();
    g.moveTo(w * 0.58, h * 0.28);
    g.lineTo(w * 0.4, h * 0.22);
    g.lineTo(w * 0.38, h * 0.32);
    g.lineTo(w * 0.58, h * 0.36);
    g.closePath();
    g.fill();
    
    // === CLAWS (the money shot!) ===
    g.fillStyle(LOBSTER.CLAW);
    
    // Back claw (smaller, behind body)
    g.fillEllipse(w * 0.35, h * 0.55, 12, 8);
    
    // Front claw (BIG, holding position) - this is the shooting claw!
    // Upper pincer
    g.fillEllipse(w * 0.9, h * 0.45, 18, 10);
    g.beginPath();
    g.moveTo(w * 0.92, h * 0.4);
    g.lineTo(w * 1.05, h * 0.35);
    g.lineTo(w * 1.02, h * 0.42);
    g.lineTo(w * 0.92, h * 0.45);
    g.closePath();
    g.fill();
    
    // Lower pincer
    g.fillEllipse(w * 0.88, h * 0.52, 16, 8);
    g.beginPath();
    g.moveTo(w * 0.9, h * 0.52);
    g.lineTo(w * 1.0, h * 0.55);
    g.lineTo(w * 0.98, h * 0.6);
    g.lineTo(w * 0.88, h * 0.56);
    g.closePath();
    g.fill();
    
    // Arm connecting claw to body
    g.fillStyle(LOBSTER.SHELL);
    g.fillRect(w * 0.7, h * 0.42, 18, 10);
    
    // Generate texture
    g.generateTexture('lobster', w, h);
    g.destroy();
  }

  update(inputAction, time) {
    const body = this.sprite.body;
    
    // Check if on ground
    const wasOnGround = this.isOnGround;
    this.isOnGround = body.blocked.down;
    
    // Reset jumps when landing
    if (!wasOnGround && this.isOnGround) {
      this.jumpsRemaining = PLAYER.MAX_JUMPS;
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
    
    // Running bob animation - only scale, don't touch position (physics controls it)
    if (this.isOnGround) {
      this.bobOffset = Math.sin(time * 0.015) * 0.03;
      this.sprite.setScale(1, 1 + this.bobOffset);
    } else {
      this.sprite.setScale(1, 1);
    }
    
    // Update muzzle flash position
    this.muzzleFlash.x = this.sprite.x + PLAYER.WIDTH * 0.5;
    this.muzzleFlash.y = this.sprite.y - PLAYER.HEIGHT * 0.5;
  }

  jump() {
    if (this.jumpsRemaining > 0) {
      this.sprite.body.setVelocityY(PLAYER.JUMP_VELOCITY);
      this.jumpsRemaining--;
      gameState.jumpsUsed++;
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
    eventBus.emit(Events.PLAYER_SHOOT, {
      x: this.sprite.x + PLAYER.WIDTH * 0.6,
      y: this.sprite.y - PLAYER.HEIGHT * 0.5,
    });
    
    // Show muzzle flash
    this.showMuzzleFlash();
    
    // Screen shake on shoot (tiny)
    this.scene.cameras.main.shake(30, 0.002);
  }

  showMuzzleFlash() {
    const flash = this.muzzleFlash;
    flash.clear();
    flash.fillStyle(0xffffff, 1);
    flash.fillCircle(0, 0, 8);
    flash.fillStyle(0xffff00, 0.8);
    flash.fillCircle(0, 0, 12);
    flash.fillStyle(0xff6600, 0.5);
    flash.fillCircle(0, 0, 16);
    flash.setVisible(true);
    
    this.scene.time.delayedCall(50, () => {
      flash.setVisible(false);
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
  }

  destroy() {
    this.sprite.destroy();
    this.muzzleFlash.destroy();
  }
}
