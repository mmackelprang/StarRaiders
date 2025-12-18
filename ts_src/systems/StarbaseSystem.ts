import Phaser from 'phaser';
import { Starbase } from '@/entities/Starbase';
import { GalaxyManager } from './GalaxyManager';
import { GameStateManager } from './GameStateManager';
import { SectorCoordinate } from '@/types/GalaxyTypes';
import { Vector3D } from '@utils/Types';
import { SystemStatus, MAX_ENERGY } from '@utils/Constants';

/**
 * StarbaseSystem - manages all starbase operations
 * - Docking procedures
 * - Attack countdown tracking
 * - Repair and refuel operations
 * - Victory/defeat condition checking
 */
export class StarbaseSystem {
  private static instance: StarbaseSystem;
  private eventEmitter: Phaser.Events.EventEmitter;
  private galaxyManager: GalaxyManager;
  private gameStateManager: GameStateManager;

  private constructor() {
    this.eventEmitter = new Phaser.Events.EventEmitter();
    this.galaxyManager = GalaxyManager.getInstance();
    this.gameStateManager = GameStateManager.getInstance();
  }

  static getInstance(): StarbaseSystem {
    if (!StarbaseSystem.instance) {
      StarbaseSystem.instance = new StarbaseSystem();
    }
    return StarbaseSystem.instance;
  }

  /**
   * Update all starbases - check attack countdowns
   * @param deltaCentons - Time elapsed in centons
   */
  update(deltaCentons: number): void {
    const galaxyData = this.galaxyManager.getGalaxyData();

    for (let x = 0; x < galaxyData.sectors.length; x++) {
      for (let y = 0; y < galaxyData.sectors[x].length; y++) {
        const sector = galaxyData.sectors[x][y];
        
        if (sector.starbase && !sector.starbase.destroyed) {
          // Update attack countdown
          if (sector.starbase.underAttack) {
            const destroyed = sector.starbase.updateAttackCountdown(deltaCentons);
            
            if (destroyed) {
              this.handleStarbaseDestroyed(sector.starbase);
            } else if (sector.starbase.attackCountdown <= 20) {
              // Warning when less than 20 centons remaining
              this.eventEmitter.emit('starbaseWarning', sector.starbase, sector.starbase.attackCountdown);
            }
          }

          // Check if starbase should be under attack
          this.checkStarbaseUnderAttack(sector.coordinate);
        }
      }
    }
  }

  /**
   * Check if starbase at given sector should be under attack
   * Based on number of enemy ships in surrounding sectors
   */
  private checkStarbaseUnderAttack(coord: SectorCoordinate): void {
    const sector = this.galaxyManager.getSector(coord);
    if (!sector || !sector.starbase || sector.starbase.destroyed) {
      return;
    }

    // Count enemies in surrounding sectors (Manhattan distance <= 2)
    let surroundingEnemies = 0;
    const galaxyData = this.galaxyManager.getGalaxyData();

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip starbase sector itself
        
        const neighborX = coord.x + dx;
        const neighborY = coord.y + dy;
        
        if (neighborX >= 0 && neighborX < galaxyData.sectors.length &&
            neighborY >= 0 && neighborY < galaxyData.sectors[0].length) {
          const neighborSector = galaxyData.sectors[neighborX][neighborY];
          surroundingEnemies += neighborSector.enemies.length;
        }
      }
    }

    // Starbase is under attack if 2+ enemy squadrons nearby
    const starbase = sector.starbase;
    const shouldBeUnderAttack = surroundingEnemies >= 2;

    if (shouldBeUnderAttack && !starbase.underAttack) {
      starbase.startAttack();
      this.eventEmitter.emit('starbaseAttackStarted', starbase, coord);
    } else if (!shouldBeUnderAttack && starbase.underAttack) {
      starbase.cancelAttack();
      this.eventEmitter.emit('starbaseAttackCancelled', starbase, coord);
    }
  }

  /**
   * Handle starbase destruction
   */
  private handleStarbaseDestroyed(starbase: Starbase): void {
    starbase.destroy();
    
    const galaxyData = this.galaxyManager.getGalaxyData();
    galaxyData.starbasesDestroyed++;

    this.eventEmitter.emit('starbaseDestroyed', starbase);

    // Check if all starbases destroyed (loss condition)
    const remainingStarbases = this.getRemainingStarbaseCount();
    if (remainingStarbases === 0) {
      this.eventEmitter.emit('allStarbasesDestroyed');
      this.gameStateManager.endGame(false); // Defeat
    }
  }

  /**
   * Get count of remaining operational starbases
   */
  getRemainingStarbaseCount(): number {
    const galaxyData = this.galaxyManager.getGalaxyData();
    return galaxyData.totalStarbases - galaxyData.starbasesDestroyed;
  }

  /**
   * Attempt to dock at starbase in current sector
   * @param playerPosition - Player's 3D position in sector
   * @param playerVelocity - Player's current velocity (speed level)
   * @param currentSector - Current sector coordinates
   * @returns Docking result
   */
  attemptDocking(
    playerPosition: Vector3D,
    playerVelocity: number,
    currentSector: SectorCoordinate
  ): { success: boolean; message: string } {
    const sector = this.galaxyManager.getSector(currentSector);
    
    if (!sector || !sector.starbase) {
      return { success: false, message: 'NO STARBASE IN THIS SECTOR' };
    }

    const starbase = sector.starbase;

    if (starbase.destroyed) {
      return { success: false, message: 'STARBASE DESTROYED' };
    }

    // Check velocity (must be 0-2)
    if (playerVelocity > 2) {
      return { success: false, message: 'REDUCE SPEED TO DOCK (MAX SPEED 2)' };
    }

    // Check distance (must be within 10 metrons)
    if (!starbase.isInDockingRange(playerPosition)) {
      const distance = Math.floor(starbase.getDistanceFrom(playerPosition));
      return { success: false, message: `TOO FAR FROM STARBASE (${distance} METRONS)` };
    }

    // Docking successful!
    this.performDocking(starbase);
    
    return { success: true, message: 'DOCKING COMPLETE - ALL SYSTEMS REPAIRED' };
  }

  /**
   * Perform docking operations - repair and refuel
   */
  private performDocking(starbase: Starbase): void {
    const gameState = this.gameStateManager.getGameState();

    // Repair all PESCLR systems to operational
    gameState.player.systems.photon = SystemStatus.OPERATIONAL;
    gameState.player.systems.engines = SystemStatus.OPERATIONAL;
    gameState.player.systems.shields = SystemStatus.OPERATIONAL;
    gameState.player.systems.computer = SystemStatus.OPERATIONAL;
    gameState.player.systems.longRange = SystemStatus.OPERATIONAL;
    gameState.player.systems.radio = SystemStatus.OPERATIONAL;

    // Restore energy to maximum
    gameState.player.energy = MAX_ENERGY;

    // Cancel any attack on this starbase (player is defending it)
    if (starbase.underAttack) {
      starbase.cancelAttack();
    }

    // Emit docking complete event
    this.eventEmitter.emit('dockingComplete', starbase);
  }

  /**
   * Get starbase in specific sector
   */
  getStarbaseInSector(coord: SectorCoordinate): Starbase | null {
    const sector = this.galaxyManager.getSector(coord);
    return sector?.starbase || null;
  }

  /**
   * Get all operational starbases
   */
  getOperationalStarbases(): Array<{ starbase: Starbase; coord: SectorCoordinate }> {
    const result: Array<{ starbase: Starbase; coord: SectorCoordinate }> = [];
    const galaxyData = this.galaxyManager.getGalaxyData();

    for (let x = 0; x < galaxyData.sectors.length; x++) {
      for (let y = 0; y < galaxyData.sectors[x].length; y++) {
        const sector = galaxyData.sectors[x][y];
        if (sector.starbase && !sector.starbase.destroyed) {
          result.push({
            starbase: sector.starbase,
            coord: sector.coordinate
          });
        }
      }
    }

    return result;
  }

  /**
   * Get starbases under attack
   */
  getStarbasesUnderAttack(): Array<{ starbase: Starbase; coord: SectorCoordinate }> {
    const operational = this.getOperationalStarbases();
    return operational.filter(item => item.starbase.underAttack);
  }

  /**
   * Find nearest operational starbase to given sector
   */
  findNearestStarbase(fromSector: SectorCoordinate): { starbase: Starbase; coord: SectorCoordinate; distance: number } | null {
    const operational = this.getOperationalStarbases();
    
    if (operational.length === 0) {
      return null;
    }

    let nearest: { starbase: Starbase; coord: SectorCoordinate; distance: number } | null = null;
    let minDistance = Infinity;

    for (const item of operational) {
      const distance = Math.abs(item.coord.x - fromSector.x) + Math.abs(item.coord.y - fromSector.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...item, distance };
      }
    }

    return nearest;
  }

  /**
   * Event subscription
   */
  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }

  off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }

  /**
   * Reset system (for new game)
   */
  reset(): void {
    this.eventEmitter.removeAllListeners();
  }
}
