import Phaser from 'phaser';
import { Vector3D } from '@utils/Types';

export enum TorpedoDirection {
  FORE = 'FORE',
  AFT = 'AFT',
}

export class Torpedo {
  public id: string;
  public position: Vector3D;
  public velocity: Vector3D;
  public direction: TorpedoDirection;
  public active: boolean = true;
  public distanceTraveled: number = 0;
  public readonly maxRange: number = 100; // metrons
  public readonly speed: number = 50; // metrons/second
  public readonly energyCost: number = 5; // energy per shot
  
  // Visual representation
  public graphics?: Phaser.GameObjects.Graphics;
  public line?: Phaser.GameObjects.Line;
  
  constructor(
    id: string,
    startPosition: Vector3D,
    direction: TorpedoDirection
  ) {
    this.id = id;
    this.position = { ...startPosition };
    this.direction = direction;
    
    // Set velocity based on direction
    const directionMultiplier = direction === TorpedoDirection.FORE ? 1 : -1;
    this.velocity = {
      x: 0,
      y: 0,
      z: this.speed * directionMultiplier,
    };
  }
  
  /**
   * Update torpedo position
   */
  update(deltaTime: number): void {
    if (!this.active) return;
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Track distance
    const distance = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.y * this.velocity.y +
      this.velocity.z * this.velocity.z
    ) * deltaTime;
    this.distanceTraveled += distance;
    
    // Deactivate if out of range
    if (this.distanceTraveled >= this.maxRange) {
      this.active = false;
    }
  }
  
  /**
   * Check collision with a target
   */
  checkCollision(targetPosition: Vector3D, hitboxRadius: number): boolean {
    if (!this.active) return false;
    
    const dx = this.position.x - targetPosition.x;
    const dy = this.position.y - targetPosition.y;
    const dz = this.position.z - targetPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance <= hitboxRadius;
  }
  
  /**
   * Destroy this torpedo
   */
  destroy(): void {
    this.active = false;
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = undefined;
    }
    if (this.line) {
      this.line.destroy();
      this.line = undefined;
    }
  }
  
  /**
   * Get visual length of torpedo based on distance from camera
   */
  getVisualLength(distance: number): number {
    // Base length is 50 pixels at standard distance
    const baseLength = 50;
    const standardDistance = 50;
    
    // Scale based on distance (closer = longer, farther = shorter)
    const scale = Math.max(0.1, standardDistance / Math.max(1, distance));
    return baseLength * scale;
  }
}
