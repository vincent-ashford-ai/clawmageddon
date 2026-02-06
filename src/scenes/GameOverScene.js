// CLAWMAGEDDON - Game Over Screen
import Phaser from 'phaser';
import { GAME, COLORS, UI, TRANSITION } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const stats = gameState.getStats();
    const isNewHighScore = stats.score >= stats.bestScore && stats.score > 0;
    
    // Dark red background
    this.createBackground();
    
    // Game Over title
    this.add.text(GAME.WIDTH / 2, 80, 'GAME OVER', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '48px',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    
    // New high score?
    if (isNewHighScore) {
      const newRecord = this.add.text(GAME.WIDTH / 2, 130, '★ NEW RECORD ★', {
        fontFamily: UI.FONT_FAMILY,
        fontSize: '24px',
        color: '#ffff00',
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: newRecord,
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }
    
    // Stats panel
    const panelY = 200;
    const lineHeight = 40;
    
    this.createStatLine('SCORE', stats.score.toString(), panelY);
    this.createStatLine('BEST', stats.bestScore.toString(), panelY + lineHeight);
    this.createStatLine('DISTANCE', `${stats.distance}m`, panelY + lineHeight * 2);
    this.createStatLine('KILLS', stats.enemiesKilled.toString(), panelY + lineHeight * 3);
    this.createStatLine('MAX COMBO', `${stats.maxCombo}x`, panelY + lineHeight * 4);
    this.createStatLine('ACCURACY', `${stats.accuracy}%`, panelY + lineHeight * 5);
    
    // Retry prompt
    const retryText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 120, '[ TAP TO RETRY ]', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    // Menu option
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 70, 'or press M for menu', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);
    
    // Input (delayed to prevent accidental restart)
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => this.retry());
      this.input.keyboard.once('keydown-SPACE', () => this.retry());
      this.input.keyboard.once('keydown-M', () => this.toMenu());
    });
  }

  createBackground() {
    const g = this.add.graphics();
    
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      const r = Phaser.Math.Interpolation.Linear([20, 40], ratio);
      g.fillStyle(Phaser.Display.Color.GetColor(r, 0, 0));
      g.fillRect(0, y, GAME.WIDTH, 1);
    }
    
    // Subtle static effect
    g.fillStyle(0x000000, 0.1);
    for (let i = 0; i < 100; i++) {
      g.fillRect(
        Math.random() * GAME.WIDTH,
        Math.random() * GAME.HEIGHT,
        2,
        2
      );
    }
  }

  createStatLine(label, value, y) {
    // Label (left aligned)
    this.add.text(80, y, label, {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '18px',
      color: '#888888',
    });
    
    // Value (right aligned)
    this.add.text(GAME.WIDTH - 80, y, value, {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0);
    
    // Divider line
    const g = this.add.graphics();
    g.lineStyle(1, 0x333333);
    g.lineBetween(80, y + 30, GAME.WIDTH - 80, y + 30);
  }

  retry() {
    this.cameras.main.fade(TRANSITION.FADE_DURATION, 0, 0, 0);
    this.time.delayedCall(TRANSITION.FADE_DURATION, () => {
      eventBus.emit(Events.GAME_RESTART);
      this.scene.start('GameScene');
    });
  }

  toMenu() {
    this.cameras.main.fade(TRANSITION.FADE_DURATION, 0, 0, 0);
    this.time.delayedCall(TRANSITION.FADE_DURATION, () => {
      this.scene.start('MenuScene');
    });
  }
}
