import { Enemy } from '@entities/Enemy';
import { Vector3D, SectorCoord } from '@utils/Types';
import { EnemyType, GALAXY_SIZE, DifficultyLevel } from '@utils/Constants';
import { GalaxyManager } from './GalaxyManager';
import { GameStateManager } from './GameStateManager';
import { Debug } from '@utils/Debug';

/**
 * Squadron Formation Type
 */
export enum FormationType {
  V_FORMATION = 'V_FORMATION',
  LINE_ABREAST = 'LINE_ABREAST',
  CLUSTER = 'CLUSTER',
  SCATTERED = 'SCATTERED',
}

/**
 * Squadron Objective
 */
export enum SquadronObjective {
  ATTACK_PLAYER = 'ATTACK_PLAYER',
  ATTACK_STARBASE = 'ATTACK_STARBASE',
  DEFEND_SECTOR = 'DEFEND_SECTOR',
  PATROL_ROUTE = 'PATROL_ROUTE',
}

/**
 * Squadron data structure
 */
export interface Squadron {
  id: string;
  leaderId: string;
  memberIds: string[];
  formation: FormationType;
  objective: SquadronObjective;
  targetSector: SectorCoord | null;
  cohesion: number; // 0.0 to 1.0 - how tightly grouped
  currentSector: SectorCoord;
}

/**
 * Squadron System
 * Manages group coordination and strategic movement
 * 
 * Phase 14 Implementation
 */
export class SquadronSystem {
  private galaxyManager: GalaxyManager;
  private gameStateManager: GameStateManager;
  private squadrons: Map<string, Squadron> = new Map();
  private nextSquadronId: number = 0;

  // Strategic parameters
  private readonly maxSquadronSize: number = 5;
  private readonly minSquadronSize: number = 2;
  private readonly starbaseAttackThreshold: number = 3; // Min squadrons to attack starbase

  constructor() {
    this.galaxyManager = GalaxyManager.getInstance();
    this.gameStateManager = GameStateManager.getInstance();
  }

  /**
   * Create a squadron from a group of enemies
   */
  createSquadron(
    enemies: Enemy[],
    formation: FormationType,
    objective: SquadronObjective
  ): Squadron | null {
    if (enemies.length < this.minSquadronSize || enemies.length > this.maxSquadronSize) {
      Debug.warn(`SquadronSystem: Invalid squadron size ${enemies.length}`);
      return null;
    }

    const squadronId = `squadron_${this.nextSquadronId++}`;
    const leaderId = enemies[0].id;
    const memberIds = enemies.map(e => e.id);

    // Determine current sector from leader position
    const leader = enemies[0];
    const currentSector: SectorCoord = {
      x: Math.floor(leader.position.x / 100),
      y: Math.floor(leader.position.y / 100),
    };

    const squadron: Squadron = {
      id: squadronId,
      leaderId,
      memberIds,
      formation,
      objective,
      targetSector: null,
      cohesion: this.getFormationCohesion(formation),
      currentSector,
    };

    this.squadrons.set(squadronId, squadron);
    Debug.log(`SquadronSystem: Created ${formation} squadron ${squadronId} with ${memberIds.length} members`);

    return squadron;
  }

  /**
   * Update all squadrons
   */
  update(deltaTime: number, enemies: Map<string, Enemy>): void {
    const deltaSeconds = deltaTime / 1000;

    for (const [squadronId, squadron] of this.squadrons) {
      // Check if squadron still valid
      if (!this.isSquadronValid(squadron, enemies)) {
        this.disbandSquadron(squadronId);
        continue;
      }

      // Update squadron objective based on galaxy state
      this.updateStrategicObjective(squadron);

      // Update formation positions
      this.updateFormationPositions(squadron, enemies);

      // Update current sector
      this.updateSquadronSector(squadron, enemies);
    }
  }

  /**
   * Check if squadron is still valid
   */
  private isSquadronValid(squadron: Squadron, enemies: Map<string, Enemy>): boolean {
    // Count how many members still exist
    let activeMembers = 0;
    for (const memberId of squadron.memberIds) {
      if (enemies.has(memberId)) {
        activeMembers++;
      }
    }

    // Disband if too few members remain
    if (activeMembers < this.minSquadronSize) {
      return false;
    }

    // Check if leader still exists
    if (!enemies.has(squadron.leaderId)) {
      // Promote new leader
      for (const memberId of squadron.memberIds) {
        if (enemies.has(memberId)) {
          squadron.leaderId = memberId;
          Debug.log(`SquadronSystem: Promoted new leader ${memberId} for ${squadron.id}`);
          break;
        }
      }
    }

    return true;
  }

  /**
   * Update strategic objective based on galaxy state
   */
  private updateStrategicObjective(squadron: Squadron): void {
    const galaxy = this.galaxyManager.getGalaxyData();
    const gameState = this.gameStateManager.getGameState();

    // Check for threatened starbases
    const threatenedStarbases = this.galaxyManager.checkStarbaseThreats();

    // Priority 1: Attack threatened starbases if nearby
    if (threatenedStarbases.length > 0 && squadron.objective !== SquadronObjective.ATTACK_STARBASE) {
      const nearestStarbase = this.findNearestStarbase(squadron.currentSector, threatenedStarbases);
      if (nearestStarbase) {
        const distance = this.galaxyManager.manhattanDistance(squadron.currentSector, nearestStarbase);
        if (distance <= 5) {
          squadron.objective = SquadronObjective.ATTACK_STARBASE;
          squadron.targetSector = nearestStarbase;
          Debug.log(`SquadronSystem: ${squadron.id} targeting starbase at (${nearestStarbase.x}, ${nearestStarbase.y})`);
          return;
        }
      }
    }

    // Priority 2: Attack player if nearby
    if (gameState.player.sector) {
      const distanceToPlayer = this.galaxyManager.manhattanDistance(
        squadron.currentSector,
        gameState.player.sector
      );

      if (distanceToPlayer <= 3) {
        squadron.objective = SquadronObjective.ATTACK_PLAYER;
        squadron.targetSector = gameState.player.sector;
        return;
      }
    }

    // Priority 3: Patrol or defend
    if (squadron.objective === SquadronObjective.ATTACK_PLAYER || 
        squadron.objective === SquadronObjective.ATTACK_STARBASE) {
      // Lost target, return to patrol
      squadron.objective = SquadronObjective.PATROL_ROUTE;
      squadron.targetSector = null;
    }
  }

  /**
   * Update formation positions for squadron members
   */
  private updateFormationPositions(squadron: Squadron, enemies: Map<string, Enemy>): void {
    const leader = enemies.get(squadron.leaderId);
    if (!leader) return;

    const formation = this.getFormationOffsets(squadron.formation, squadron.memberIds.length);
    let memberIndex = 0;

    for (const memberId of squadron.memberIds) {
      if (memberId === squadron.leaderId) continue;

      const member = enemies.get(memberId);
      if (!member) continue;

      const offset = formation[memberIndex % formation.length];
      const targetPos: Vector3D = {
        x: leader.position.x + offset.x * squadron.cohesion,
        y: leader.position.y + offset.y * squadron.cohesion,
        z: leader.position.z + offset.z * squadron.cohesion,
      };

      // Calculate direction to formation position
      const dx = targetPos.x - member.position.x;
      const dy = targetPos.y - member.position.y;
      const dz = targetPos.z - member.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Only adjust if too far from formation position
      if (distance > 10) {
        const speed = this.getEnemySpeed(member.type);
        member.velocity = {
          x: (dx / distance) * speed * 0.5, // Half speed for formation keeping
          y: (dy / distance) * speed * 0.5,
          z: (dz / distance) * speed * 0.5,
        };
      }

      memberIndex++;
    }
  }

  /**
   * Update squadron's current sector
   */
  private updateSquadronSector(squadron: Squadron, enemies: Map<string, Enemy>): void {
    const leader = enemies.get(squadron.leaderId);
    if (!leader) return;

    squadron.currentSector = {
      x: Math.floor(leader.position.x / 100),
      y: Math.floor(leader.position.y / 100),
    };
  }

  /**
   * Get formation offsets for different formation types
   */
  private getFormationOffsets(formation: FormationType, memberCount: number): Vector3D[] {
    switch (formation) {
      case FormationType.V_FORMATION:
        // V shape with leader at front
        return [
          { x: -20, y: -10, z: 0 },
          { x: 20, y: -10, z: 0 },
          { x: -30, y: -20, z: 0 },
          { x: 30, y: -20, z: 0 },
        ];

      case FormationType.LINE_ABREAST:
        // Horizontal line
        return [
          { x: -25, y: 0, z: 0 },
          { x: 25, y: 0, z: 0 },
          { x: -50, y: 0, z: 0 },
          { x: 50, y: 0, z: 0 },
        ];

      case FormationType.CLUSTER:
        // Tight cluster around leader
        return [
          { x: -15, y: -15, z: 0 },
          { x: 15, y: -15, z: 0 },
          { x: -15, y: 15, z: 0 },
          { x: 15, y: 15, z: 0 },
        ];

      case FormationType.SCATTERED:
        // Wide spread
        return [
          { x: -40, y: -30, z: 0 },
          { x: 40, y: 30, z: 0 },
          { x: -30, y: 40, z: 0 },
          { x: 30, y: -40, z: 0 },
        ];

      default:
        return [{ x: 0, y: 0, z: 0 }];
    }
  }

  /**
   * Get cohesion value for formation type
   */
  private getFormationCohesion(formation: FormationType): number {
    switch (formation) {
      case FormationType.V_FORMATION:
        return 1.5; // Fast fighters
      case FormationType.LINE_ABREAST:
        return 1.0; // Standard
      case FormationType.CLUSTER:
        return 0.5; // Tight around basestar
      case FormationType.SCATTERED:
        return 2.0; // Wide patrol
      default:
        return 1.0;
    }
  }

  /**
   * Find nearest starbase from given position
   */
  private findNearestStarbase(from: SectorCoord, candidates: SectorCoord[]): SectorCoord | null {
    let nearest: SectorCoord | null = null;
    let minDistance = Infinity;

    for (const starbase of candidates) {
      const distance = this.galaxyManager.manhattanDistance(from, starbase);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = starbase;
      }
    }

    return nearest;
  }

  /**
   * Get enemy speed based on type
   */
  private getEnemySpeed(type: EnemyType): number {
    switch (type) {
      case EnemyType.FIGHTER:
        return 15;
      case EnemyType.CRUISER:
        return 10;
      case EnemyType.BASESTAR:
        return 5;
      default:
        return 10;
    }
  }

  /**
   * Disband a squadron
   */
  private disbandSquadron(squadronId: string): void {
    this.squadrons.delete(squadronId);
    Debug.log(`SquadronSystem: Disbanded ${squadronId}`);
  }

  /**
   * Get squadron for an enemy
   */
  getSquadronForEnemy(enemyId: string): Squadron | null {
    for (const squadron of this.squadrons.values()) {
      if (squadron.memberIds.includes(enemyId)) {
        return squadron;
      }
    }
    return null;
  }

  /**
   * Get all squadrons
   */
  getSquadrons(): Squadron[] {
    return Array.from(this.squadrons.values());
  }

  /**
   * Get squadron by id
   */
  getSquadron(squadronId: string): Squadron | undefined {
    return this.squadrons.get(squadronId);
  }

  /**
   * Check if enough squadrons are attacking a starbase
   */
  canLaunchStarbaseAttack(starbaseSector: SectorCoord): boolean {
    let attackingSquadrons = 0;

    for (const squadron of this.squadrons.values()) {
      if (squadron.objective === SquadronObjective.ATTACK_STARBASE &&
          squadron.targetSector?.x === starbaseSector.x &&
          squadron.targetSector?.y === starbaseSector.y) {
        attackingSquadrons++;
      }
    }

    return attackingSquadrons >= this.starbaseAttackThreshold;
  }

  /**
   * Clear all squadrons
   */
  clear(): void {
    this.squadrons.clear();
  }
}
