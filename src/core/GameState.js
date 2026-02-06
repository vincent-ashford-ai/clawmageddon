// CLAWMAGEDDON - Game State

class GameState {
  constructor() {
    this.bestScore = 0;
    this.bestDistance = 0;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.enemiesKilled = 0;
    this.shotsFired = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.jumpsUsed = 0;
    this.started = false;
    this.gameOver = false;
    this.scrollSpeed = 250;
  }

  addScore(points = 1) {
    // Apply combo multiplier
    const multiplier = Math.min(1 + (this.combo * 0.1), 3); // Max 3x multiplier
    const actualPoints = Math.floor(points * multiplier);
    this.score += actualPoints;
    
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
    
    return actualPoints;
  }

  incrementCombo() {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  resetCombo() {
    this.combo = 0;
  }

  addDistance(delta) {
    this.distance += delta;
    if (this.distance > this.bestDistance) {
      this.bestDistance = this.distance;
    }
  }

  getStats() {
    return {
      score: this.score,
      bestScore: this.bestScore,
      distance: Math.floor(this.distance),
      bestDistance: Math.floor(this.bestDistance),
      enemiesKilled: this.enemiesKilled,
      shotsFired: this.shotsFired,
      maxCombo: this.maxCombo,
      accuracy: this.shotsFired > 0 
        ? Math.floor((this.enemiesKilled / this.shotsFired) * 100) 
        : 0,
    };
  }
}

export const gameState = new GameState();
