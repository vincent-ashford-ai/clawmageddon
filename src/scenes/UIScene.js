// CLAWMAGEDDON - UI Overlay Scene
import Phaser from 'phaser';
import { GAME, COLORS, UI, TRANSITION } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { audioManager } from '../audio/AudioManager.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Score display (top right)
    this.scoreText = this.add.text(GAME.WIDTH - 20, 20, '0', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: UI.SCORE_SIZE,
      color: COLORS.UI_TEXT,
      stroke: COLORS.UI_SHADOW,
      strokeThickness: 4,
      align: 'right',
    }).setOrigin(1, 0).setDepth(1000);

    // Score label
    this.add.text(GAME.WIDTH - 20, 8, 'SCORE', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(1, 0).setDepth(1000);

    // Distance display (top left)
    this.distanceText = this.add.text(20, 20, '0m', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '18px',
      color: '#88ff88',
      stroke: COLORS.UI_SHADOW,
      strokeThickness: 3,
    }).setDepth(1000);

    // Distance label
    this.add.text(20, 8, 'DISTANCE', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '12px',
      color: '#888888',
    }).setDepth(1000);

    // Combo display (center, appears when combo > 0)
    this.comboText = this.add.text(GAME.WIDTH / 2, 100, '', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '32px',
      color: '#ffff00',
      stroke: '#ff6600',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setDepth(1000).setAlpha(0);

    // Kill notification (floating text)
    this.killTexts = [];

    // Event listeners
    eventBus.on(Events.SCORE_CHANGED, this.onScoreChanged, this);
    eventBus.on(Events.DISTANCE_CHANGED, this.onDistanceChanged, this);
    eventBus.on(Events.COMBO_CHANGED, this.onComboChanged, this);
    eventBus.on(Events.ENEMY_KILLED, this.onEnemyKilled, this);
    
    // Power-up indicator
    this.powerUpText = this.add.text(GAME.WIDTH / 2, 60, '', {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '16px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1000).setAlpha(0);
    
    eventBus.on(Events.POWERUP_COLLECTED, this.onPowerUp, this);
    eventBus.on(Events.POWERUP_EXPIRED, this.onPowerUpExpired, this);
    
    // Mute button (top center-right, avoiding score)
    this.createMuteButton();
  }

  createMuteButton() {
    const x = GAME.WIDTH - 35;
    const y = 60;
    
    this.muteBtn = this.add.circle(x, y, 20, 0x333333, 0.6)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001)
      .on('pointerdown', () => this.toggleMute());
    
    this.muteIcon = this.add.text(x, y, '🔊', {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(1001);
    
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

  onPowerUp(data) {
    this.powerUpText.setText(`⚡ ${data.type.toUpperCase()} ⚡`);
    this.powerUpText.setAlpha(1);
    
    this.tweens.add({
      targets: this.powerUpText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
    });
  }

  onPowerUpExpired() {
    this.tweens.add({
      targets: this.powerUpText,
      alpha: 0,
      duration: 300,
    });
  }

  onScoreChanged(data) {
    this.scoreText.setText(data.score.toString());
    
    // Pop animation
    this.tweens.add({
      targets: this.scoreText,
      scale: TRANSITION.SCORE_POP_SCALE,
      duration: TRANSITION.SCORE_POP_DURATION,
      yoyo: true,
      ease: 'Back.out',
    });
  }

  onDistanceChanged(data) {
    this.distanceText.setText(`${Math.floor(data.distance)}m`);
  }

  onComboChanged(data) {
    if (data.combo > 1) {
      this.comboText.setText(`${data.combo}x COMBO!`);
      this.comboText.setAlpha(1);
      
      // Scale pop
      this.tweens.add({
        targets: this.comboText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
      });
    } else {
      this.tweens.add({
        targets: this.comboText,
        alpha: 0,
        duration: 200,
      });
    }
  }

  onEnemyKilled(data) {
    // Show floating score text
    const scoreText = this.add.text(data.x, data.y - 20, `+${data.score}`, {
      fontFamily: UI.FONT_FAMILY,
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1001);

    this.tweens.add({
      targets: scoreText,
      y: data.y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 600,
      ease: 'Power2',
      onComplete: () => scoreText.destroy(),
    });

    // Update combo display
    if (gameState.combo > 1) {
      eventBus.emit(Events.COMBO_CHANGED, { combo: gameState.combo });
    }
  }

  shutdown() {
    eventBus.off(Events.SCORE_CHANGED, this.onScoreChanged, this);
    eventBus.off(Events.DISTANCE_CHANGED, this.onDistanceChanged, this);
    eventBus.off(Events.COMBO_CHANGED, this.onComboChanged, this);
    eventBus.off(Events.ENEMY_KILLED, this.onEnemyKilled, this);
  }
}
