// CLAWMAGEDDON - Parallax Background System
import Phaser from 'phaser';
import { GAME, COLORS } from '../core/Constants.js';

export class Background {
  constructor(scene) {
    this.scene = scene;
    
    // Create layered parallax background
    this.createSkyGradient();
    this.createDistantBuildings();
    this.createMidgroundBuildings();
    this.createGround();
    this.createGroundDetails();
  }

  createSkyGradient() {
    const g = this.scene.add.graphics();
    
    // Night sky gradient
    for (let y = 0; y < GAME.HEIGHT * 0.8; y++) {
      const ratio = y / (GAME.HEIGHT * 0.8);
      const r = Phaser.Math.Interpolation.Linear([15, 26], ratio);
      const gVal = Phaser.Math.Interpolation.Linear([15, 26], ratio);
      const b = Phaser.Math.Interpolation.Linear([35, 62], ratio);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
      g.fillRect(0, y, GAME.WIDTH, 1);
    }
    
    // Stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * GAME.WIDTH;
      const y = Math.random() * GAME.HEIGHT * 0.5;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.3;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }
    
    g.setDepth(-100);
    this.sky = g;
  }

  createDistantBuildings() {
    // Far background - slow parallax
    this.distantLayer = this.scene.add.graphics();
    this.distantLayer.setDepth(-90);
    
    const g = this.distantLayer;
    g.fillStyle(0x1a1a2e);
    
    // Generate random distant cityscape
    let x = 0;
    while (x < GAME.WIDTH + 200) {
      const width = Phaser.Math.Between(40, 100);
      const height = Phaser.Math.Between(100, 250);
      g.fillRect(x, GAME.HEIGHT * 0.6 - height, width, height);
      
      // Small windows
      g.fillStyle(0x3a3a5e);
      for (let wy = GAME.HEIGHT * 0.6 - height + 10; wy < GAME.HEIGHT * 0.6 - 20; wy += 20) {
        for (let wx = x + 5; wx < x + width - 10; wx += 15) {
          if (Math.random() > 0.3) {
            g.fillRect(wx, wy, 6, 8);
          }
        }
      }
      g.fillStyle(0x1a1a2e);
      
      x += width + Phaser.Math.Between(10, 40);
    }
    
    // Store for scrolling
    this.distantOffset = 0;
  }

  createMidgroundBuildings() {
    // Midground - medium parallax
    this.midgroundLayer = this.scene.add.tileSprite(
      GAME.WIDTH / 2, 
      GAME.HEIGHT * 0.6, 
      GAME.WIDTH * 2, 
      200, 
      'midground'
    );
    
    // Generate midground texture
    const g = this.scene.add.graphics();
    g.fillStyle(0x252538);
    
    let x = 0;
    while (x < GAME.WIDTH * 2) {
      const width = Phaser.Math.Between(50, 120);
      const height = Phaser.Math.Between(80, 180);
      g.fillRect(x, 200 - height, width, height);
      
      // Windows (brighter)
      g.fillStyle(0x4a4a6e);
      for (let wy = 200 - height + 8; wy < 180; wy += 15) {
        for (let wx = x + 4; wx < x + width - 8; wx += 12) {
          if (Math.random() > 0.4) {
            const lit = Math.random() > 0.7 ? 0xffff88 : 0x4a4a6e;
            g.fillStyle(lit);
            g.fillRect(wx, wy, 5, 6);
          }
        }
      }
      g.fillStyle(0x252538);
      
      x += width + Phaser.Math.Between(5, 25);
    }
    
    g.generateTexture('midground', GAME.WIDTH * 2, 200);
    g.destroy();
    
    this.midgroundLayer.setOrigin(0.5, 1);
    this.midgroundLayer.setDepth(-80);
  }

  createGround() {
    // Main ground platform
    this.ground = this.scene.add.tileSprite(
      GAME.WIDTH / 2,
      GAME.HEIGHT - 50,
      GAME.WIDTH,
      100,
      'ground'
    );
    
    // Generate ground texture
    const g = this.scene.add.graphics();
    
    // Main ground color
    g.fillStyle(COLORS.GROUND);
    g.fillRect(0, 0, 100, 100);
    
    // Top edge highlight
    g.fillStyle(0x3d3d3d);
    g.fillRect(0, 0, 100, 4);
    
    // Random detail lines
    g.fillStyle(COLORS.GROUND_LINE);
    for (let i = 0; i < 5; i++) {
      const y = 10 + Math.random() * 80;
      g.fillRect(Math.random() * 80, y, 20 + Math.random() * 30, 2);
    }
    
    // Hazard stripes at top
    g.fillStyle(0xffcc00);
    for (let x = 0; x < 100; x += 20) {
      g.fillRect(x, 4, 10, 6);
    }
    g.fillStyle(0x222222);
    for (let x = 10; x < 100; x += 20) {
      g.fillRect(x, 4, 10, 6);
    }
    
    g.generateTexture('ground', 100, 100);
    g.destroy();
    
    this.ground.setDepth(-70);
    
    // Physics ground (invisible)
    this.groundCollider = this.scene.add.rectangle(
      GAME.WIDTH / 2, 
      GAME.HEIGHT - 20, 
      GAME.WIDTH * 2, 
      40
    );
    this.scene.physics.add.existing(this.groundCollider, true);
    this.groundCollider.setVisible(false);
  }

  createGroundDetails() {
    // Foreground debris layer - fast parallax
    this.foregroundLayer = this.scene.add.tileSprite(
      GAME.WIDTH / 2,
      GAME.HEIGHT - 100,
      GAME.WIDTH,
      30,
      'foreground'
    );
    
    // Generate foreground detail texture
    const g = this.scene.add.graphics();
    
    // Random debris
    g.fillStyle(0x1a1a1a);
    for (let x = 0; x < GAME.WIDTH; x += 40) {
      // Small boxes/debris
      if (Math.random() > 0.5) {
        const w = 8 + Math.random() * 15;
        const h = 5 + Math.random() * 10;
        g.fillRect(x + Math.random() * 20, 30 - h, w, h);
      }
    }
    
    g.generateTexture('foreground', GAME.WIDTH, 30);
    g.destroy();
    
    this.foregroundLayer.setDepth(-60);
  }

  update(scrollSpeed, delta) {
    const scrollDelta = scrollSpeed * (delta / 1000);
    
    // Parallax scrolling at different speeds
    if (this.midgroundLayer) {
      this.midgroundLayer.tilePositionX += scrollDelta * 0.3;
    }
    
    if (this.ground) {
      this.ground.tilePositionX += scrollDelta * 1.0;
    }
    
    if (this.foregroundLayer) {
      this.foregroundLayer.tilePositionX += scrollDelta * 1.2;
    }
  }

  getGroundCollider() {
    return this.groundCollider;
  }
}
