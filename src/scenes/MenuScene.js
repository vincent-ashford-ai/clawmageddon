// CLAWMAGEDDON - Main Menu
// Epic Contra-style title screen with lobster soldiers
import Phaser from 'phaser';
import { GAME, COLORS, UI } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { audioManager } from '../audio/AudioManager.js';
import { 
  renderTitleArt, 
  HERO_LOBSTER, 
  SOLDIER_SMALL,
  EXPLOSION,
  MUZZLE_FLASH,
  TITLE_PALETTE,
  drawLobsterSilhouette,
} from '../sprites/titleArt.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Epic dramatic background
    this.createEpicBackground();
    
    // Create pixel art textures
    this.createTitleArt();
    
    // Title with glow effects  
    this.createEpicTitle();
    
    // Hero lobster with guns
    this.createHeroLobster();
    
    // Animated effects
    this.createAnimatedEffects();
    
    // Play button / tap prompt
    this.createPlayPrompt();
    
    // Tagline
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 140, '🔥 ONE CRUSTACEAN ARMY 🔥', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '14px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    // Best score
    if (gameState.bestScore > 0) {
      this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 110, `HIGH SCORE: ${gameState.bestScore}`, {
        fontFamily: UI.FONT_FAMILY,
        fontSize: '16px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }
    
    // Controls hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 35, 'TAP or SPACE to ENGAGE', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);
    
    // Mute button
    this.createMuteButton();
    
    // Start menu music
    eventBus.emit(Events.MUSIC_MENU);
    
    // Input
    this.input.once('pointerdown', (pointer) => {
      if (pointer.x > GAME.WIDTH - 60 && pointer.y < 60) return;
      this.startGame();
    });
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  createTitleArt() {
    // Render pixel art textures
    try {
      renderTitleArt(this, 'hero_lobster', HERO_LOBSTER, TITLE_PALETTE, 4);
      renderTitleArt(this, 'soldier_small', SOLDIER_SMALL, TITLE_PALETTE, 3);
      renderTitleArt(this, 'explosion_sprite', EXPLOSION, TITLE_PALETTE, 5);
      renderTitleArt(this, 'muzzle_sprite', MUZZLE_FLASH, TITLE_PALETTE, 6);
    } catch (err) {
      console.error('Title art render error:', err);
    }
  }

  createEpicBackground() {
    const g = this.add.graphics();
    
    // Dramatic red-black gradient - war zone feel
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      let r, gVal, b;
      
      if (ratio < 0.35) {
        // Top - dark night sky with hint of red
        r = Math.floor(15 + ratio * 60);
        gVal = Math.floor(5 + ratio * 15);
        b = Math.floor(25 + ratio * 10);
      } else if (ratio < 0.65) {
        // Middle - fiery red zone (explosions in distance)
        const midRatio = (ratio - 0.35) / 0.3;
        r = Math.floor(45 + midRatio * 90);
        gVal = Math.floor(20 + midRatio * 25);
        b = Math.floor(30 - midRatio * 25);
      } else {
        // Bottom - dark ground
        const botRatio = (ratio - 0.65) / 0.35;
        r = Math.floor(135 - botRatio * 115);
        gVal = Math.floor(45 - botRatio * 40);
        b = Math.floor(5 + botRatio * 15);
      }
      g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
      g.fillRect(0, y, GAME.WIDTH, 1);
    }
    
    // Destroyed city silhouette
    this.drawCitySilhouette(g);
    
    // Red sky streaks (bullet tracers)
    g.lineStyle(2, 0xff3300, 0.3);
    for (let i = 0; i < 6; i++) {
      const x1 = Math.random() * GAME.WIDTH * 0.5;
      const y1 = 80 + Math.random() * 150;
      const x2 = x1 + 150 + Math.random() * 200;
      const y2 = y1 + (Math.random() - 0.5) * 80;
      g.lineBetween(x1, y1, x2, y2);
    }
    
    g.setDepth(-100);
  }

  drawCitySilhouette(g) {
    g.fillStyle(0x000000);
    
    let x = 0;
    while (x < GAME.WIDTH + 50) {
      const width = 25 + Math.random() * 50;
      const height = 60 + Math.random() * 140;
      const baseY = GAME.HEIGHT - 60;
      
      // Jagged destroyed building tops
      g.beginPath();
      g.moveTo(x, baseY);
      g.lineTo(x, baseY - height + Math.random() * 25);
      
      for (let topX = x; topX < x + width; topX += 10) {
        g.lineTo(topX, baseY - height + Math.random() * 30);
      }
      
      g.lineTo(x + width, baseY);
      g.closePath();
      g.fillPath();
      
      x += width + Math.random() * 25;
    }
    
    // Ground
    g.fillRect(0, GAME.HEIGHT - 60, GAME.WIDTH, 60);
    
    // Rubble
    g.fillStyle(0x1a1a1a);
    for (let i = 0; i < 15; i++) {
      const rx = Math.random() * GAME.WIDTH;
      const ry = GAME.HEIGHT - 55 + Math.random() * 50;
      g.fillRect(rx, ry, 5 + Math.random() * 15, 3 + Math.random() * 8);
    }
  }

  createEpicTitle() {
    // Main title: "CLAW" - huge and fiery
    const claw = this.add.text(GAME.WIDTH / 2, 75, 'CLAW', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '80px',
      color: '#ff2200',
      stroke: '#000000',
      strokeThickness: 12,
    }).setOrigin(0.5);
    
    // Glow layer
    const clawGlow = this.add.text(GAME.WIDTH / 2, 75, 'CLAW', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '80px',
      color: '#ffff00',
      stroke: '#ff6600',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0.6);
    
    // "MAGEDDON" 
    const mageddon = this.add.text(GAME.WIDTH / 2, 140, 'MAGEDDON', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '48px',
      color: '#ff4400',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);
    
    // Pulsing glow
    this.tweens.add({
      targets: clawGlow,
      alpha: { from: 0.4, to: 0.8 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    
    // Slight shake
    this.tweens.add({
      targets: [claw, clawGlow, mageddon],
      y: '+=1',
      duration: 80,
      yoyo: true,
      repeat: -1,
    });
  }

  createHeroLobster() {
    const heroY = 400;
    
    // Red backlight glow
    const backGlow = this.add.circle(GAME.WIDTH / 2, heroY, 130, 0xff0000, 0.12);
    backGlow.setDepth(9);
    
    this.tweens.add({
      targets: backGlow,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.08, to: 0.18 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
    
    // Draw hero silhouette using graphics
    const heroGraphics = this.add.graphics();
    heroGraphics.setDepth(10);
    drawLobsterSilhouette(heroGraphics, GAME.WIDTH / 2 - 30, heroY, 1.3);
    
    // Pixel art hero overlay (if texture loaded)
    if (this.textures.exists('hero_lobster')) {
      this.heroSprite = this.add.image(GAME.WIDTH / 2, heroY - 20, 'hero_lobster');
      this.heroSprite.setOrigin(0.5);
      this.heroSprite.setDepth(11);
    }
    
    // Muzzle flashes
    this.muzzleFlash1 = this.add.image(GAME.WIDTH / 2 + 85, heroY - 65, 'muzzle_sprite');
    this.muzzleFlash1.setOrigin(0.5).setDepth(12).setAlpha(0);
    
    this.muzzleFlash2 = this.add.image(GAME.WIDTH / 2 + 75, heroY - 25, 'muzzle_sprite');
    this.muzzleFlash2.setOrigin(0.5).setDepth(12).setScale(0.7).setAlpha(0);
    
    // Animate muzzle flashes
    this.time.addEvent({
      delay: 120,
      callback: () => this.flashMuzzle(),
      loop: true,
    });
    
    // Secondary soldier in background
    if (this.textures.exists('soldier_small')) {
      const soldier = this.add.image(80, 450, 'soldier_small');
      soldier.setOrigin(0.5).setDepth(8).setAlpha(0.7);
      
      // Subtle breathing
      this.tweens.add({
        targets: soldier,
        y: '+=3',
        duration: 1200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  flashMuzzle() {
    const flash = Math.random() > 0.5 ? this.muzzleFlash1 : this.muzzleFlash2;
    if (!flash) return;
    
    flash.setAlpha(1);
    flash.setScale(0.5 + Math.random() * 0.4);
    flash.setAngle(Math.random() * 360);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 0.2,
      duration: 60,
    });
  }

  createAnimatedEffects() {
    // Shell casings
    this.time.addEvent({
      delay: 200,
      callback: () => this.spawnShellCasing(),
      loop: true,
    });
    
    // Background explosions
    this.time.addEvent({
      delay: 1800,
      callback: () => this.spawnBackgroundExplosion(),
      loop: true,
    });
    
    // Bullet tracers
    this.time.addEvent({
      delay: 400,
      callback: () => this.spawnBulletTracer(),
      loop: true,
    });
  }

  spawnShellCasing() {
    const shell = this.add.rectangle(
      GAME.WIDTH / 2 + 70 + Math.random() * 30,
      340,
      4, 8,
      0xdaa520
    );
    shell.setDepth(13);
    
    this.tweens.add({
      targets: shell,
      x: shell.x - 25 - Math.random() * 25,
      y: GAME.HEIGHT,
      angle: 360 + Math.random() * 360,
      duration: 900,
      ease: 'Quad.in',
      onComplete: () => shell.destroy(),
    });
  }

  spawnBackgroundExplosion() {
    const x = 60 + Math.random() * (GAME.WIDTH - 120);
    const y = 180 + Math.random() * 180;
    
    // Explosion image or fallback circle
    let exp;
    if (this.textures.exists('explosion_sprite')) {
      exp = this.add.image(x, y, 'explosion_sprite');
      exp.setScale(0.4);
    } else {
      exp = this.add.circle(x, y, 25, 0xff6600);
    }
    exp.setDepth(-40).setAlpha(0.5);
    
    this.tweens.add({
      targets: exp,
      scale: 2.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => exp.destroy(),
    });
    
    // Flash
    const flash = this.add.circle(x, y, 20, 0xffff00, 0.4);
    flash.setDepth(-41);
    
    this.tweens.add({
      targets: flash,
      scale: 4,
      alpha: 0,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }

  spawnBulletTracer() {
    const startX = GAME.WIDTH / 2 + 130;
    const startY = 350 + Math.random() * 100;
    const angle = (Math.random() - 0.5) * 0.5;
    
    const tracer = this.add.rectangle(startX, startY, 25, 3, 0xffff00);
    tracer.setOrigin(0, 0.5);
    tracer.setRotation(angle);
    tracer.setDepth(7);
    
    this.tweens.add({
      targets: tracer,
      x: GAME.WIDTH + 100,
      duration: 250,
      onComplete: () => tracer.destroy(),
    });
  }

  createPlayPrompt() {
    const playText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 180, '⚔ TAP TO PLAY ⚔', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#ff0000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: playText,
      alpha: { from: 1, to: 0.3 },
      scale: { from: 1, to: 1.04 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  createMuteButton() {
    const x = GAME.WIDTH - 35;
    const y = 35;
    
    this.muteBtn = this.add.circle(x, y, 25, 0x333333, 0.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(100)
      .on('pointerover', () => this.muteBtn.setFillStyle(0x555555, 0.9))
      .on('pointerout', () => this.muteBtn.setFillStyle(0x333333, 0.8))
      .on('pointerdown', () => this.toggleMute());
    
    this.muteIcon = this.add.text(x, y, '🔊', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(101);
    
    this.updateMuteIcon();
  }

  toggleMute() {
    audioManager.toggleMute();
    this.updateMuteIcon();
  }

  updateMuteIcon() {
    const isMuted = audioManager.isMuted?.() ?? false;
    this.muteIcon.setText(isMuted ? '🔇' : '🔊');
  }

  startGame() {
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }
}
