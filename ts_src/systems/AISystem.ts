import { Enemy } from '@entities/Enemy';
import { Vector3D, SectorCoord } from '@utils/Types';
import { EnemyType, GALAXY_SIZE } from '@utils/Constants';
import { GalaxyManager } from './GalaxyManager';
import { GameStateManager } from './GameStateManager';
import { Debug } from '@utils/Debug';

/**
 * AI Behavior State for enemies
 */
export enum AIBehaviorState {
  IDLE = 'IDLE',
  PATROL = 'PATROL',
  CHASE_PLAYER = 'CHASE_PLAYER',
  ATTACK_PLAYER = 'ATTACK_PLAYER',
  MOVE_TO_STARBASE = 'MOVE_TO_STARBASE',
  ATTACK_STARBASE = 'ATTACK_STARBASE',
  EVADE = 'EVADE',
}

/**
 * AI Behavior Controller for individual enemy
 */
export interface AIController {
  enemy: Enemy;
  state: AIBehaviorState;
  targetPosition: Vector3D | null;
  targetSector: SectorCoord | null;
  attackCooldown: number;
  aggressionLevel: number; // 0.0 to 1.0
  patrolPath: Vector3D[];
  patrolIndex: number;
}

/**
 * Enemy AI System
 * Manages AI behaviors for all enemy types
 * 
 * Phase 13 Implementation
 */
export class AISystem {
  private galaxyManager: GalaxyManager;
  private gameStateManager: GameStateManager;
  private controllers: Map<string, AIController> = new Map();

  // AI parameters
  private readonly fighterSpeed: number = 15; // metrons/second
  private readonly cruiserSpeed: number = 10; // metrons/second
  private readonly basestarSpeed: number = 5; // metrons/second

  private readonly fighterAttackRange: number = 50; // metrons
  private readonly cruiserAttackRange: number = 60; // metrons
  private readonly basestarAttackRange: number = 70; // metrons

  private readonly attackCooldownTime: number = 2.0; // seconds

  constructor() {
    this.galaxyManager = GalaxyManager.getInstance();
    this.gameStateManager = GameStateManager.getInstance();
  }

  /**
   * Register an enemy with the AI system
   */
  registerEnemy(enemy: Enemy, aggressionLevel: number = 0.7): void {
    const controller: AIController = {
      enemy,
      state: AIBehaviorState.IDLE,
      targetPosition: null,
      targetSector: null,
      attackCooldown: 0,
      aggressionLevel,
      patrolPath: [],
      patrolIndex: 0,
    };

    this.controllers.set(enemy.id, controller);

    // Initialize behavior based on enemy type
    this.initializeBehavior(controller);
  }

  /**
   * Unregister an enemy from AI system
   */
  unregisterEnemy(enemyId: string): void {
    this.controllers.delete(enemyId);
  }

  /**
   * Update all enemy AI
   */
  update(deltaTime: number, playerPosition: Vector3D, playerSector: SectorCoord): void {
    const deltaSeconds = deltaTime / 1000;

    for (const [enemyId, controller] of this.controllers) {
      // Update cooldowns
      if (controller.attackCooldown > 0) {
        controller.attackCooldown -= deltaSeconds;
      }

      // Update behavior based on state
      this.updateBehavior(controller, playerPosition, playerSector, deltaSeconds);

      // Apply movement
      this.applyMovement(controller, deltaSeconds);
    }
  }

  /**
   * Initialize behavior for enemy based on type
   */
  private initializeBehavior(controller: AIController): void {
    const enemy = controller.enemy;

    switch (enemy.type) {
      case EnemyType.FIGHTER:
        // Fighters are aggressive - immediately chase player
        controller.state = AIBehaviorState.CHASE_PLAYER;
        controller.aggressionLevel = Math.max(controller.aggressionLevel, 0.8);
        break;

      case EnemyType.CRUISER:
        // Cruisers patrol and defend
        controller.state = AIBehaviorState.PATROL;
        this.generatePatrolPath(controller);
        break;

      case EnemyType.BASESTAR:
        // Basestars target starbases
        controller.state = AIBehaviorState.MOVE_TO_STARBASE;
        this.findNearestStarbase(controller);
        break;
    }

    Debug.log(`AISystem: Initialized ${enemy.type} with behavior ${controller.state}`);
  }

  /**
   * Update AI behavior based on current state
   */
  private updateBehavior(
    controller: AIController,
    playerPosition: Vector3D,
    playerSector: SectorCoord,
    deltaSeconds: number
  ): void {
    const enemy = controller.enemy;
    const distanceToPlayer = this.calculateDistance(enemy.position, playerPosition);

    switch (controller.state) {
      case AIBehaviorState.IDLE:
        // Check if should engage
        if (this.shouldEngagePlayer(controller, distanceToPlayer)) {
          this.transitionToState(controller, AIBehaviorState.CHASE_PLAYER);
        }
        break;

      case AIBehaviorState.PATROL:
        this.updatePatrolBehavior(controller, playerPosition, distanceToPlayer);
        break;

      case AIBehaviorState.CHASE_PLAYER:
        this.updateChaseBehavior(controller, playerPosition, distanceToPlayer);
        break;

      case AIBehaviorState.ATTACK_PLAYER:
        this.updateAttackBehavior(controller, playerPosition, distanceToPlayer);
        break;

      case AIBehaviorState.MOVE_TO_STARBASE:
        this.updateMoveToStarbaseBehavior(controller);
        break;

      case AIBehaviorState.ATTACK_STARBASE:
        this.updateAttackStarbaseBehavior(controller);
        break;

      case AIBehaviorState.EVADE:
        this.updateEvadeBehavior(controller, playerPosition);
        break;
    }
  }

  /**
   * Update patrol behavior
   */
  private updatePatrolBehavior(
    controller: AIController,
    playerPosition: Vector3D,
    distanceToPlayer: number
  ): void {
    // Cruisers patrol but will intercept nearby player
    if (this.shouldEngagePlayer(controller, distanceToPlayer)) {
      this.transitionToState(controller, AIBehaviorState.CHASE_PLAYER);
      return;
    }

    // Continue patrol
    if (controller.patrolPath.length > 0) {
      const targetPoint = controller.patrolPath[controller.patrolIndex];
      const distanceToTarget = this.calculateDistance(controller.enemy.position, targetPoint);

      if (distanceToTarget < 5) {
        // Reached patrol point, move to next
        controller.patrolIndex = (controller.patrolIndex + 1) % controller.patrolPath.length;
      } else {
        // Move toward current patrol point
        controller.targetPosition = targetPoint;
      }
    }
  }

  /**
   * Update chase behavior
   */
  private updateChaseBehavior(
    controller: AIController,
    playerPosition: Vector3D,
    distanceToPlayer: number
  ): void {
    const attackRange = this.getAttackRange(controller.enemy.type);

    if (distanceToPlayer <= attackRange) {
      // Within attack range
      this.transitionToState(controller, AIBehaviorState.ATTACK_PLAYER);
    } else if (distanceToPlayer > attackRange * 3) {
      // Lost player, return to default behavior
      this.initializeBehavior(controller);
    } else {
      // Continue chasing
      controller.targetPosition = { ...playerPosition };
    }
  }

  /**
   * Update attack behavior
   */
  private updateAttackBehavior(
    controller: AIController,
    playerPosition: Vector3D,
    distanceToPlayer: number
  ): void {
    const attackRange = this.getAttackRange(controller.enemy.type);

    if (distanceToPlayer > attackRange * 1.5) {
      // Player moved out of range, chase again
      this.transitionToState(controller, AIBehaviorState.CHASE_PLAYER);
      return;
    }

    // Maintain attack position
    controller.targetPosition = { ...playerPosition };

    // Fire if cooldown is ready
    if (controller.attackCooldown <= 0) {
      this.fireAtPlayer(controller, playerPosition);
      controller.attackCooldown = this.attackCooldownTime;
    }
  }

  /**
   * Update move to starbase behavior
   */
  private updateMoveToStarbaseBehavior(controller: AIController): void {
    if (!controller.targetSector) {
      this.findNearestStarbase(controller);
      return;
    }

    // Check if reached starbase sector
    const galaxy = this.galaxyManager.getGalaxyData();
    const targetSector = galaxy.sectors[controller.targetSector.x][controller.targetSector.y];

    if (targetSector.starbase) {
      // Reached starbase, start attack
      this.transitionToState(controller, AIBehaviorState.ATTACK_STARBASE);
    } else {
      // Starbase destroyed or moved, find new target
      this.findNearestStarbase(controller);
    }
  }

  /**
   * Update attack starbase behavior
   */
  private updateAttackStarbaseBehavior(controller: AIController): void {
    // Attack starbase if in same sector
    if (controller.attackCooldown <= 0) {
      // Fire at starbase
      controller.attackCooldown = this.attackCooldownTime;
      Debug.log(`AISystem: ${controller.enemy.type} attacking starbase`);
    }
  }

  /**
   * Update evade behavior
   */
  private updateEvadeBehavior(controller: AIController, playerPosition: Vector3D): void {
    // Move away from player
    const direction = this.calculateDirection(playerPosition, controller.enemy.position);
    const evadeTarget: Vector3D = {
      x: controller.enemy.position.x + direction.x * 50,
      y: controller.enemy.position.y + direction.y * 50,
      z: controller.enemy.position.z + direction.z * 50,
    };

    controller.targetPosition = evadeTarget;

    // Return to normal behavior after evading
    if (this.calculateDistance(controller.enemy.position, playerPosition) > 100) {
      this.initializeBehavior(controller);
    }
  }

  /**
   * Apply movement to enemy based on target position
   */
  private applyMovement(controller: AIController, deltaSeconds: number): void {
    if (!controller.targetPosition) {
      controller.enemy.velocity = { x: 0, y: 0, z: 0 };
      return;
    }

    const direction = this.calculateDirection(controller.enemy.position, controller.targetPosition);
    const speed = this.getSpeed(controller.enemy.type);

    controller.enemy.velocity = {
      x: direction.x * speed,
      y: direction.y * speed,
      z: direction.z * speed,
    };

    // Update enemy position
    controller.enemy.update(deltaSeconds);
  }

  /**
   * Check if enemy should engage player
   */
  private shouldEngagePlayer(controller: AIController, distanceToPlayer: number): boolean {
    const engageDistance = this.getAttackRange(controller.enemy.type) * 2;
    return distanceToPlayer <= engageDistance && controller.aggressionLevel > 0.5;
  }

  /**
   * Fire at player
   */
  private fireAtPlayer(controller: AIController, playerPosition: Vector3D): void {
    // Emit event for combat system to handle
    Debug.log(`AISystem: ${controller.enemy.type} firing at player from ${Math.floor(this.calculateDistance(controller.enemy.position, playerPosition))}m`);
    // Event will be handled by combat system in integration
  }

  /**
   * Find nearest starbase for enemy to target
   */
  private findNearestStarbase(controller: AIController): void {
    const galaxy = this.galaxyManager.getGalaxyData();
    let nearestDistance = Infinity;
    let nearestSector: SectorCoord | null = null;

    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = galaxy.sectors[x][y];
        if (sector.starbase && !sector.starbase.underAttack) {
          const distance = this.galaxyManager.manhattanDistance(
            { x, y },
            { x: Math.floor(controller.enemy.position.x / 100), y: Math.floor(controller.enemy.position.y / 100) }
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestSector = { x, y };
          }
        }
      }
    }

    controller.targetSector = nearestSector;
    if (nearestSector) {
      Debug.log(`AISystem: ${controller.enemy.type} targeting starbase at (${nearestSector.x}, ${nearestSector.y})`);
    }
  }

  /**
   * Generate patrol path for enemy
   */
  private generatePatrolPath(controller: AIController): void {
    const center = controller.enemy.position;
    const radius = 30;

    // Generate simple circular patrol path
    controller.patrolPath = [
      { x: center.x + radius, y: center.y, z: center.z },
      { x: center.x, y: center.y + radius, z: center.z },
      { x: center.x - radius, y: center.y, z: center.z },
      { x: center.x, y: center.y - radius, z: center.z },
    ];

    controller.patrolIndex = 0;
  }

  /**
   * Transition to new AI state
   */
  private transitionToState(controller: AIController, newState: AIBehaviorState): void {
    if (controller.state !== newState) {
      Debug.log(`AISystem: ${controller.enemy.type} ${controller.state} -> ${newState}`);
      controller.state = newState;
    }
  }

  /**
   * Calculate distance between two 3D points
   */
  private calculateDistance(pos1: Vector3D, pos2: Vector3D): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate normalized direction vector from pos1 to pos2
   */
  private calculateDirection(pos1: Vector3D, pos2: Vector3D): Vector3D {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: dx / distance,
      y: dy / distance,
      z: dz / distance,
    };
  }

  /**
   * Get speed for enemy type
   */
  private getSpeed(type: EnemyType): number {
    switch (type) {
      case EnemyType.FIGHTER:
        return this.fighterSpeed;
      case EnemyType.CRUISER:
        return this.cruiserSpeed;
      case EnemyType.BASESTAR:
        return this.basestarSpeed;
      default:
        return this.cruiserSpeed;
    }
  }

  /**
   * Get attack range for enemy type
   */
  private getAttackRange(type: EnemyType): number {
    switch (type) {
      case EnemyType.FIGHTER:
        return this.fighterAttackRange;
      case EnemyType.CRUISER:
        return this.cruiserAttackRange;
      case EnemyType.BASESTAR:
        return this.basestarAttackRange;
      default:
        return this.cruiserAttackRange;
    }
  }

  /**
   * Get all registered enemies
   */
  getEnemies(): Enemy[] {
    return Array.from(this.controllers.values()).map(c => c.enemy);
  }

  /**
   * Get AI controller for enemy
   */
  getController(enemyId: string): AIController | undefined {
    return this.controllers.get(enemyId);
  }

  /**
   * Clear all AI controllers
   */
  clear(): void {
    this.controllers.clear();
  }
}
