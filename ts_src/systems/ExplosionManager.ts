import Phaser from 'phaser';
import { Vector3D } from '@utils/Types';

export interface Explosion {
  position: Vector3D;
  screenPosition: { x: number; y: number };
  startTime: number;
  duration: number;
  maxRadius: number;
  active: boolean;
}

export class ExplosionManager {
  private scene: Phaser.Scene;
  private explosions: Explosion[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  
  // Explosion timing
  private readonly explosionDuration: number = 1.0; // seconds
  private readonly maxExplosionRadius: number = 30; // pixels
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100); // Render on top
  }
  
  /**
   * Create a new explosion at the given position
   */
  createExplosion(position: Vector3D, screenPosition: { x: number; y: number }): void {
    const explosion: Explosion = {
      position: { ...position },
      screenPosition: { ...screenPosition },
      startTime: this.scene.time.now / 1000,
      duration: this.explosionDuration,
      maxRadius: this.maxExplosionRadius,
      active: true,
    };
    
    this.explosions.push(explosion);
  }
  
  /**
   * Update and render all active explosions
   */
  update(): void {
    const currentTime = this.scene.time.now / 1000;
    this.graphics.clear();
    
    // Update and render each explosion
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      const elapsedTime = currentTime - explosion.startTime;
      
      // Remove completed explosions
      if (elapsedTime >= explosion.duration) {
        explosion.active = false;
        this.explosions.splice(i, 1);
        continue;
      }
      
      // Calculate explosion progress (0 to 1)
      const progress = elapsedTime / explosion.duration;
      
      // Render explosion
      this.renderExplosion(explosion, progress);
    }
  }
  
  /**
   * Render a single explosion
   */
  private renderExplosion(explosion: Explosion, progress: number): void {
    const { x, y } = explosion.screenPosition;
    
    // Explosion sequence:
    // 0.0 - 0.1: Bright white flash
    // 0.1 - 0.4: Orange circle expands
    // 0.4 - 0.7: Red circle expands with debris
    // 0.7 - 1.0: Debris spreads, fading out
    
    if (progress < 0.1) {
      // Phase 1: Bright white flash
      const flashRadius = explosion.maxRadius * 0.5;
      const flashAlpha = 1.0 - (progress / 0.1);
      
      this.graphics.fillStyle(0xffffff, flashAlpha);
      this.graphics.fillCircle(x, y, flashRadius);
    } else if (progress < 0.4) {
      // Phase 2: Orange circle expands
      const phaseProgress = (progress - 0.1) / 0.3;
      const radius = explosion.maxRadius * 0.7 * phaseProgress;
      const alpha = 0.9;
      
      this.graphics.fillStyle(0xff8800, alpha);
      this.graphics.fillCircle(x, y, radius);
      
      // Add bright core
      this.graphics.fillStyle(0xffff00, alpha);
      this.graphics.fillCircle(x, y, radius * 0.5);
    } else if (progress < 0.7) {
      // Phase 3: Red circle expands with debris
      const phaseProgress = (progress - 0.4) / 0.3;
      const radius = explosion.maxRadius * (0.7 + 0.3 * phaseProgress);
      const alpha = 0.8 - (phaseProgress * 0.3);
      
      this.graphics.fillStyle(0xff0000, alpha);
      this.graphics.fillCircle(x, y, radius);
      
      // Add debris particles
      this.renderDebris(x, y, radius, phaseProgress, alpha);
    } else {
      // Phase 4: Debris spreads, fading out
      const phaseProgress = (progress - 0.7) / 0.3;
      const radius = explosion.maxRadius * (1.0 + 0.2 * phaseProgress);
      const alpha = 0.5 * (1.0 - phaseProgress);
      
      // Fading circle
      this.graphics.fillStyle(0x880000, alpha);
      this.graphics.fillCircle(x, y, radius * 0.5);
      
      // Spreading debris
      this.renderDebris(x, y, radius, 1.0 + phaseProgress, alpha);
    }
  }
  
  /**
   * Render debris particles
   */
  private renderDebris(
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    alpha: number
  ): void {
    const debrisCount = 12;
    const debrisSize = 2;
    
    for (let i = 0; i < debrisCount; i++) {
      const angle = (Math.PI * 2 * i) / debrisCount;
      const distance = radius * progress;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Randomize debris color slightly
      const color = i % 3 === 0 ? 0xff8800 : (i % 3 === 1 ? 0xff0000 : 0x880000);
      
      this.graphics.fillStyle(color, alpha);
      this.graphics.fillCircle(x, y, debrisSize);
    }
  }
  
  /**
   * Create a muzzle flash effect
   */
  createMuzzleFlash(screenPosition: { x: number; y: number }): void {
    const flash = this.scene.add.circle(
      screenPosition.x,
      screenPosition.y,
      15,
      0xffffff,
      1.0
    );
    flash.setDepth(100);
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 100,
      onComplete: () => {
        flash.destroy();
      },
    });
  }
  
  /**
   * Clear all explosions
   */
  clear(): void {
    this.explosions = [];
    this.graphics.clear();
  }
  
  /**
   * Destroy the manager
   */
  destroy(): void {
    this.clear();
    this.graphics.destroy();
  }
}
