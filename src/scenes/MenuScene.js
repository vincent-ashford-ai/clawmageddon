// CLAWMAGEDDON - Main Menu
import Phaser from 'phaser';
import { GAME, COLORS, LOBSTER, UI, TRANSITION } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Dark dramatic background
    this.createBackground();
    
    // Title
    this.createTitle();
    
    // Lobster silhouette
    this.createLobsterSilhouette();
    
    // Play button / tap prompt
    this.createPlayPrompt();
    
    // Best score
    if (gameState.bestScore > 0) {
      this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 80, `BEST: ${gameState.bestScore}`, {
        fontFamily: UI.FONT_FAMILY,
        fontSize: '18px',
        color: '#888888',
      }).setOrigin(0.5);
    }
    
    // Controls hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 40, 'TAP or SPACE to jump & shoot', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);
    
    // Input
    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  createBackground() {
    const g = this.add.graphics();
    
    // Dark gradient
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 15, g: 15, b: 35 },
        { r: 40, g: 10, b: 10 },
        100,
        ratio * 100
      );
      g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      g.fillRect(0, y, GAME.WIDTH, 1);
    }
    
    // Red accent lines
    g.lineStyle(2, 0x440000);
    for (let i = 0; i < 10; i++) {
      const y = 100 + i * 60;
      g.lineBetween(0, y, GAME.WIDTH, y);
    }
  }

  createTitle() {
    // "CLAW" in red
    const claw = this.add.text(GAME.WIDTH / 2, 120, 'CLAW', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '72px',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);
    
    // "MAGEDDON" below
    const mageddon = this.add.text(GAME.WIDTH / 2, 180, 'MAGEDDON', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '48px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    
    // Pulsing glow effect
    this.tweens.add({
      targets: claw,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  createLobsterSilhouette() {
    const g = this.add.graphics();
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2 + 40;
    
    // Dramatic red glow behind
    g.fillStyle(0x440000, 0.5);
    g.fillCircle(cx, cy, 120);
    g.fillStyle(0x660000, 0.3);
    g.fillCircle(cx, cy, 80);
    
    // Lobster silhouette
    g.fillStyle(0x000000);
    
    // Body
    g.fillEllipse(cx - 20, cy, 50, 70);
    g.fillEllipse(cx + 30, cy - 10, 60, 80);
    
    // Head
    g.fillEllipse(cx + 70, cy - 25, 40, 50);
    
    // Claws
    g.fillEllipse(cx + 100, cy - 40, 35, 20);
    g.fillEllipse(cx + 100, cy - 10, 30, 15);
    g.fillEllipse(cx - 40, cy + 20, 25, 15);
    
    // Glowing eye
    g.fillStyle(0xff0000);
    g.fillCircle(cx + 85, cy - 35, 5);
    
    // Eye glow pulse
    const eyeGlow = this.add.circle(cx + 85, cy - 35, 15, 0xff0000, 0.3);
    this.tweens.add({
      targets: eyeGlow,
      scale: 1.5,
      alpha: 0,
      duration: 1000,
      repeat: -1,
    });
  }

  createPlayPrompt() {
    const playText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 150, '[ TAP TO PLAY ]', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // Blinking effect
    this.tweens.add({
      targets: playText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  startGame() {
    this.cameras.main.fade(TRANSITION.FADE_DURATION, 0, 0, 0);
    this.time.delayedCall(TRANSITION.FADE_DURATION, () => {
      this.scene.start('GameScene');
    });
  }
}
