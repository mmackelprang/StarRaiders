import Phaser from 'phaser';
import { Torpedo, TorpedoDirection } from '@entities/Torpedo';
import { Enemy } from '@entities/Enemy';
import { Vector3D } from '@utils/Types';
import { GameStateManager } from './GameStateManager';
import { PESCLRSystem } from './PESCLRSystem';
import { SystemStatus, EnemyType } from '@utils/Constants';
import { Debug } from '@utils/Debug';

export interface LockStatus {
  hLock: boolean;
  vLock: boolean;
  rangeLock: boolean;
}

export class CombatSystem {
  private scene: Phaser.Scene;
  private torpedoes: Torpedo[] = [];
  private nextTorpedoId: number = 0;
  private gameStateManager: GameStateManager;
  private pesclrSystem: PESCLRSystem;
  
  // Lock indicator thresholds
  private readonly hLockThreshold: number = 5; // metrons horizontal tolerance
  private readonly vLockThreshold: number = 5; // metrons vertical tolerance
  private readonly rangeOptimalMin: number = 30; // metrons
  private readonly rangeOptimalMax: number = 70; // metrons
  
  // Combat constants
  private readonly torpedoEnergyCost: number = 5;
  private readonly torpedoCooldown: number = 0.25; // seconds between shots
  private lastFireTime: number = 0;
  
  // Damage values
  private readonly baseDamage: number = 1;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();
    this.pesclrSystem = new PESCLRSystem();
  }
  
  /**
   * Update all torpedoes and check collisions
   */
  update(deltaTime: number, enemies: Enemy[]): void {
    // Update all active torpedoes
    for (let i = this.torpedoes.length - 1; i >= 0; i--) {
      const torpedo = this.torpedoes[i];
      
      if (!torpedo.active) {
        torpedo.destroy();
        this.torpedoes.splice(i, 1);
        continue;
      }
      
      torpedo.update(deltaTime);
      
      // Check collisions with enemies
      for (const enemy of enemies) {
        if (this.checkTorpedoHit(torpedo, enemy)) {
          this.handleTorpedoHit(torpedo, enemy);
          break; // Torpedo destroyed on hit
        }
      }
    }
  }
  
  /**
   * Fire a torpedo from player position
   */
  fireTorpedo(
    playerPosition: Vector3D,
    direction: TorpedoDirection,
    lockStatus: LockStatus
  ): Torpedo | null {
    const gameState = this.gameStateManager.getGameState();
    const currentTime = this.scene.time.now / 1000;
    
    // Check if photon system is operational
    if (gameState.player.systems.photon === SystemStatus.DESTROYED) {
      Debug.log('CombatSystem: Photon torpedoes destroyed, cannot fire');
      return null;
    }
    
    // Apply fire rate multiplier from PESCLR system
    const fireRateMultiplier = this.pesclrSystem.getFireRateMultiplier();
    const actualCooldown = this.torpedoCooldown / fireRateMultiplier;
    
    // Check cooldown
    if (currentTime - this.lastFireTime < actualCooldown) {
      Debug.log('CombatSystem: Torpedo on cooldown');
      return null;
    }
    
    // Check energy
    if (gameState.player.energy < this.torpedoEnergyCost) {
      Debug.log('CombatSystem: Insufficient energy to fire torpedo');
      return null;
    }
    
    // Consume energy
    gameState.player.energy -= this.torpedoEnergyCost;
    
    // Create torpedo
    const torpedoId = `torpedo_${this.nextTorpedoId++}`;
    const torpedo = new Torpedo(torpedoId, playerPosition, direction);
    
    // Add inaccuracy if photon system is damaged
    if (gameState.player.systems.photon === SystemStatus.DAMAGED) {
      this.addMisfireInaccuracy(torpedo);
    }
    
    // Add inaccuracy based on locks
    this.applyLockAccuracy(torpedo, lockStatus);
    
    this.torpedoes.push(torpedo);
    this.lastFireTime = currentTime;
    
    Debug.log(`CombatSystem: Fired torpedo ${torpedoId} in ${direction} direction`);
    
    // Emit event for sound/visual effects
    this.scene.events.emit('torpedoFired', torpedo);
    
    return torpedo;
  }
  
  /**
   * Calculate lock status for a target
   */
  calculateLockStatus(
    playerPosition: Vector3D,
    targetPosition: Vector3D
  ): LockStatus {
    const dx = targetPosition.x - playerPosition.x;
    const dy = targetPosition.y - playerPosition.y;
    const dz = targetPosition.z - playerPosition.z;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Horizontal lock: check X alignment
    const hLock = Math.abs(dx) <= this.hLockThreshold;
    
    // Vertical lock: check Y alignment
    const vLock = Math.abs(dy) <= this.vLockThreshold;
    
    // Range lock: check if in optimal range
    const rangeLock = distance >= this.rangeOptimalMin && distance <= this.rangeOptimalMax;
    
    return { hLock, vLock, rangeLock };
  }
  
  /**
   * Check if torpedo hit an enemy
   */
  private checkTorpedoHit(torpedo: Torpedo, enemy: Enemy): boolean {
    // Get enemy hitbox radius based on type
    const hitboxRadius = this.getEnemyHitboxRadius(enemy.type);
    return torpedo.checkCollision(enemy.position, hitboxRadius);
  }
  
  /**
   * Handle torpedo hitting an enemy
   */
  private handleTorpedoHit(torpedo: Torpedo, enemy: Enemy): void {
    // Calculate damage with PESCLR multiplier
    const damageMultiplier = this.pesclrSystem.getPhotonDamageMultiplier();
    const damage = this.baseDamage * damageMultiplier;
    
    // Apply damage
    const destroyed = enemy.takeDamage(damage);
    
    // Deactivate torpedo
    torpedo.active = false;
    
    Debug.log(`CombatSystem: Torpedo ${torpedo.id} hit enemy ${enemy.id}`);
    
    // Emit hit event for effects
    this.scene.events.emit('torpedoHit', torpedo, enemy);
    
    if (destroyed) {
      this.handleEnemyDestroyed(enemy);
    }
  }
  
  /**
   * Handle enemy being destroyed
   */
  private handleEnemyDestroyed(enemy: Enemy): void {
    const gameState = this.gameStateManager.getGameState();
    gameState.player.kills++;
    
    Debug.log(`CombatSystem: Enemy ${enemy.id} destroyed! Total kills: ${gameState.player.kills}`);
    
    // Emit destroyed event for effects
    this.scene.events.emit('enemyDestroyed', enemy);
  }
  
  /**
   * Add misfire inaccuracy when photon system is damaged
   */
  private addMisfireInaccuracy(torpedo: Torpedo): void {
    // Damaged photon system causes torpedo to veer off
    const inaccuracy = 5; // metrons of deviation
    torpedo.velocity.x += (Math.random() - 0.5) * inaccuracy;
    torpedo.velocity.y += (Math.random() - 0.5) * inaccuracy;
  }
  
  /**
   * Apply accuracy modifications based on lock status
   */
  private applyLockAccuracy(torpedo: Torpedo, lockStatus: LockStatus): void {
    // Count number of locks
    const locksActive = 
      (lockStatus.hLock ? 1 : 0) +
      (lockStatus.vLock ? 1 : 0) +
      (lockStatus.rangeLock ? 1 : 0);
    
    // 0 locks: high inaccuracy
    // 1-2 locks: medium inaccuracy
    // 3 locks: minimal inaccuracy
    
    const inaccuracyFactor = 3 - locksActive; // 3, 2, 1, or 0
    
    if (inaccuracyFactor > 0) {
      const deviation = inaccuracyFactor * 3; // 3, 6, or 9 metrons deviation
      torpedo.velocity.x += (Math.random() - 0.5) * deviation;
      torpedo.velocity.y += (Math.random() - 0.5) * deviation;
    }
  }
  
  /**
   * Get hitbox radius for enemy type
   */
  private getEnemyHitboxRadius(type: EnemyType): number {
    switch (type) {
      case EnemyType.FIGHTER:
        return 5; // Small hitbox
      case EnemyType.CRUISER:
        return 8; // Medium hitbox
      case EnemyType.BASESTAR:
        return 12; // Large hitbox
      default:
        return 5;
    }
  }
  
  /**
   * Get all active torpedoes
   */
  getTorpedoes(): Torpedo[] {
    return this.torpedoes.filter(t => t.active);
  }
  
  /**
   * Clear all torpedoes
   */
  clearTorpedoes(): void {
    for (const torpedo of this.torpedoes) {
      torpedo.destroy();
    }
    this.torpedoes = [];
  }
  
  /**
   * Handle player taking damage from enemy
   */
  handlePlayerDamage(): void {
    const damageResult = this.pesclrSystem.applyDamage();
    
    if (damageResult.systemDamaged) {
      // Emit event for visual/audio feedback
      this.scene.events.emit('playerDamaged', damageResult);
      Debug.warn(`Player Hit: ${damageResult.message}`);
    } else {
      Debug.log(`Player Hit: ${damageResult.message}`);
    }
  }
  
  /**
   * Get PESCLR system reference
   */
  getPESCLRSystem(): PESCLRSystem {
    return this.pesclrSystem;
  }
  
  /**
   * Clean up
   */
  destroy(): void {
    this.clearTorpedoes();
  }
}
