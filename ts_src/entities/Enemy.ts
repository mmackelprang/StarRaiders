import Phaser from 'phaser';
import { Vector3D } from '@utils/Types';
import { EnemyType } from '@utils/Constants';

export class Enemy {
  public id: string;
  public type: EnemyType;
  public position: Vector3D;
  public health: number;
  public maxHealth: number;
  public velocity: Vector3D;

  constructor(
    id: string,
    type: EnemyType,
    position: Vector3D,
    health: number
  ) {
    this.id = id;
    this.type = type;
    this.position = { ...position };
    this.health = health;
    this.maxHealth = health;
    this.velocity = { x: 0, y: 0, z: 0 };
  }

  /**
   * Update enemy position based on velocity
   */
  update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0; // Returns true if destroyed
  }

  /**
   * Get base sprite size for this enemy type
   */
  getBaseSpriteSize(): number {
    switch (this.type) {
      case EnemyType.FIGHTER:
        return 20;
      case EnemyType.CRUISER:
        return 30;
      case EnemyType.BASESTAR:
        return 40;
      default:
        return 20;
    }
  }

  /**
   * Get color for this enemy type
   */
  getColor(): number {
    switch (this.type) {
      case EnemyType.FIGHTER:
        return 0xff0000; // Red
      case EnemyType.CRUISER:
        return 0xff8800; // Orange
      case EnemyType.BASESTAR:
        return 0xffff00; // Yellow
      default:
        return 0xff0000;
    }
  }
}
