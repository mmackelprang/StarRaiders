import { Vector3D } from '@utils/Types';
import { SectorCoordinate } from '@/types/GalaxyTypes';
import { STARBASE_ATTACK_TIMER } from '@utils/Constants';

/**
 * Starbase entity - represents a friendly starbase in the galaxy
 * Provides repair, refuel, and serves as strategic objective
 */
export class Starbase {
  public id: string;
  public sectorCoord: SectorCoordinate;
  public position: Vector3D; // Position within sector (in 3D space)
  public health: number;
  public maxHealth: number;
  public underAttack: boolean;
  public attackCountdown: number; // centons until destroyed if under attack
  public destroyed: boolean;

  constructor(
    id: string,
    sectorCoord: SectorCoordinate,
    position: Vector3D = { x: 0, y: 0, z: 0 }
  ) {
    this.id = id;
    this.sectorCoord = { ...sectorCoord };
    this.position = { ...position };
    this.health = 100;
    this.maxHealth = 100;
    this.underAttack = false;
    this.attackCountdown = 0;
    this.destroyed = false;
  }

  /**
   * Start attack countdown
   */
  startAttack(): void {
    if (!this.destroyed) {
      this.underAttack = true;
      this.attackCountdown = STARBASE_ATTACK_TIMER; // 100 centons
    }
  }

  /**
   * Cancel attack countdown (when enemies destroyed or player arrives)
   */
  cancelAttack(): void {
    this.underAttack = false;
    this.attackCountdown = 0;
  }

  /**
   * Update attack countdown
   * @param deltaCentons - Time elapsed in centons
   * @returns true if starbase is destroyed
   */
  updateAttackCountdown(deltaCentons: number): boolean {
    if (!this.underAttack || this.destroyed) {
      return false;
    }

    this.attackCountdown -= deltaCentons;

    if (this.attackCountdown <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Destroy the starbase
   */
  destroy(): void {
    this.destroyed = true;
    this.underAttack = false;
    this.attackCountdown = 0;
    this.health = 0;
  }

  /**
   * Check if player is within docking range
   * @param playerPosition - Player's position in sector
   * @returns true if within 10 metrons
   */
  isInDockingRange(playerPosition: Vector3D): boolean {
    if (this.destroyed) {
      return false;
    }

    const dx = this.position.x - playerPosition.x;
    const dy = this.position.y - playerPosition.y;
    const dz = this.position.z - playerPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return distance <= 10; // 10 metrons docking range
  }

  /**
   * Get distance from a position
   */
  getDistanceFrom(position: Vector3D): number {
    const dx = this.position.x - position.x;
    const dy = this.position.y - position.y;
    const dz = this.position.z - position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Repair and refuel player (called on successful docking)
   * @returns Repair result object
   */
  dock(): { repaired: boolean; energyRestored: number } {
    if (this.destroyed) {
      return { repaired: false, energyRestored: 0 };
    }

    // All systems will be repaired and energy restored in the calling code
    return { repaired: true, energyRestored: 7000 };
  }

  /**
   * Check if starbase is operational
   */
  isOperational(): boolean {
    return !this.destroyed;
  }

  /**
   * Get base sprite size for rendering
   */
  getBaseSpriteSize(): number {
    return 40; // Larger than enemies
  }

  /**
   * Get color for rendering based on state
   */
  getColor(): number {
    if (this.destroyed) {
      return 0x444444; // Dark gray
    }
    if (this.underAttack) {
      return 0xff0000; // Red - under attack
    }
    return 0x0088ff; // Blue - operational
  }
}
