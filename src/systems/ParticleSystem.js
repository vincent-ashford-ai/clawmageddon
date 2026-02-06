// CLAWMAGEDDON - Particle Effects System
import Phaser from 'phaser';
import { PARTICLES, COLORS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.createTextures();
    this.setupEventListeners();
  }

  createTextures() {
    // Explosion particle
    let g = this.scene.add.graphics();
    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle_explosion', 8, 8);
    g.destroy();

    // Blood/hit particle
    g = this.scene.add.graphics();
    g.fillStyle(0xff0000);
    g.fillCircle(3, 3, 3);
    g.generateTexture('particle_blood', 6, 6);
    g.destroy();

    // Dust particle
    g = this.scene.add.graphics();
    g.fillStyle(0x888888, 0.6);
    g.fillCircle(5, 5, 5);
    g.generateTexture('particle_dust', 10, 10);
    g.destroy();

    // Shell casing
    g = this.scene.add.graphics();
    g.fillStyle(0xffcc00);
    g.fillRect(0, 0, 4, 8);
    g.generateTexture('particle_shell', 4, 8);
    g.destroy();
  }

  setupEventListeners() {
    eventBus.on(Events.ENEMY_KILLED, (data) => this.spawnExplosion(data.x, data.y));
    eventBus.on(Events.PLAYER_SHOOT, (data) => this.spawnShellCasing(data.x, data.y));
    eventBus.on(Events.PLAYER_JUMP, () => this.spawnDust());
    eventBus.on(Events.PLAYER_LAND, () => this.spawnLandingDust());
    eventBus.on(Events.PLAYER_HIT, () => this.spawnBlood());
  }

  spawnExplosion(x, y) {
    const config = PARTICLES.EXPLOSION;
    
    // Fire colors
    const colors = [0xffffff, 0xffff00, 0xff6600, 0xff0000];
    
    for (let i = 0; i < config.count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_explosion');
      const angle = Math.random() * Math.PI * 2;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.setTint(color);
      particle.setScale(0.5 + Math.random() * 1);
      particle.setDepth(100);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * (config.lifespan / 1000),
        y: y + Math.sin(angle) * speed * (config.lifespan / 1000) + 50, // gravity
        alpha: 0,
        scale: 0.1,
        duration: config.lifespan,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
    
    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);
  }

  spawnShellCasing(x, y) {
    const shell = this.scene.add.image(x - 10, y - 10, 'particle_shell');
    shell.setDepth(50);
    
    const angle = -Math.PI * 0.6 + Math.random() * 0.4;
    const speed = PARTICLES.SHELL_CASING.speed;
    
    this.scene.tweens.add({
      targets: shell,
      x: x - 30 + Math.cos(angle) * speed,
      y: y + 50 + Math.sin(angle) * speed,
      angle: 180 + Math.random() * 360,
      alpha: 0.3,
      duration: PARTICLES.SHELL_CASING.lifespan,
      ease: 'Power1',
      onComplete: () => shell.destroy(),
    });
  }

  spawnDust() {
    const player = this.scene.player?.sprite;
    if (!player) return;
    
    const config = PARTICLES.DUST;
    
    for (let i = 0; i < config.count; i++) {
      const particle = this.scene.add.image(
        player.x + Phaser.Math.Between(-20, 20),
        player.y,
        'particle_dust'
      );
      
      particle.setAlpha(0.5);
      particle.setScale(0.3 + Math.random() * 0.3);
      particle.setDepth(5);
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + Phaser.Math.Between(-20, 10),
        x: particle.x - 30,
        alpha: 0,
        scale: 0.1,
        duration: config.lifespan,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  spawnLandingDust() {
    const player = this.scene.player?.sprite;
    if (!player) return;
    
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.image(
        player.x + Phaser.Math.Between(-15, 15),
        player.y,
        'particle_dust'
      );
      
      particle.setAlpha(0.6);
      particle.setScale(0.4);
      particle.setDepth(5);
      
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * 40,
        y: particle.y + Math.sin(angle) * 20,
        alpha: 0,
        scale: 0.1,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  spawnBlood() {
    const player = this.scene.player?.sprite;
    if (!player) return;
    
    const config = PARTICLES.BLOOD;
    
    for (let i = 0; i < config.count; i++) {
      const particle = this.scene.add.image(player.x, player.y - 30, 'particle_blood');
      const angle = Math.random() * Math.PI * 2;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      
      particle.setDepth(100);
      particle.setScale(0.5 + Math.random() * 0.5);
      
      this.scene.tweens.add({
        targets: particle,
        x: player.x + Math.cos(angle) * speed * (config.lifespan / 1000),
        y: player.y - 30 + Math.sin(angle) * speed * (config.lifespan / 1000) + 30,
        alpha: 0,
        duration: config.lifespan,
        onComplete: () => particle.destroy(),
      });
    }
  }

  destroy() {
    eventBus.off(Events.ENEMY_KILLED);
    eventBus.off(Events.PLAYER_SHOOT);
    eventBus.off(Events.PLAYER_JUMP);
    eventBus.off(Events.PLAYER_LAND);
    eventBus.off(Events.PLAYER_HIT);
  }
}
