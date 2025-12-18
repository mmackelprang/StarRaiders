import Phaser from 'phaser';
import { Star } from '@entities/Star';

interface StarfieldConfig {
  layer1Count: number;
  layer2Count: number;
  layer3Count: number;
  layer4Count: number;
}

export class StarfieldManager {
  private scene: Phaser.Scene;
  private stars: Star[] = [];
  private config: StarfieldConfig = {
    layer1Count: 20,
    layer2Count: 40,
    layer3Count: 60,
    layer4Count: 80,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createStars();
  }

  private createStars(): void {
    // Layer 1 (Foreground)
    for (let i = 0; i < this.config.layer1Count; i++) {
      const star = this.createStar(1, 3, 1.0);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 2 (Mid-range)
    for (let i = 0; i < this.config.layer2Count; i++) {
      const star = this.createStar(2, 2, 0.75);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 3 (Background)
    for (let i = 0; i < this.config.layer3Count; i++) {
      const star = this.createStar(3, 1, 0.5);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 4 (Deep space)
    for (let i = 0; i < this.config.layer4Count; i++) {
      const star = this.createStar(4, 1, 0.25);
      this.stars.push(star);
      this.scene.add.existing(star);
    }
  }

  private createStar(layer: number, size: number, brightness: number): Star {
    const x = Math.random() * this.scene.scale.width;
    const y = Math.random() * this.scene.scale.height;
    // Add random variation to brightness (±10%)
    const finalBrightness = brightness + (Math.random() * 0.2 - 0.1);
    return new Star(this.scene, x, y, size, finalBrightness, layer);
  }

  update(deltaTime: number, velocityX: number, velocityY: number): void {
    // Speed multiplier based on magnitude of velocity
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const speedMultiplier = speed / 10; // Adjust as needed

    for (const star of this.stars) {
      star.update(deltaTime, velocityX, velocityY, speedMultiplier);

      // Wrap stars around screen edges
      this.wrapStar(star);
    }
  }

  private wrapStar(star: Star): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    if (star.x < 0) {
      star.x = width;
    } else if (star.x > width) {
      star.x = 0;
    }

    if (star.y < 0) {
      star.y = height;
    } else if (star.y > height) {
      star.y = 0;
    }
  }

  destroy(): void {
    for (const star of this.stars) {
      star.destroy();
    }
    this.stars = [];
  }
}
