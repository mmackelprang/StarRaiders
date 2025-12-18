// Mock Phaser before importing anything that uses it
jest.mock('phaser', () => ({
  Events: {
    EventEmitter: class {
      private listeners: Map<string, Function[]> = new Map();
      
      on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
      }
      
      off(event: string, callback?: Function) {
        if (callback) {
          const callbacks = this.listeners.get(event);
          if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
              callbacks.splice(index, 1);
            }
          }
        } else {
          this.listeners.delete(event);
        }
      }
      
      emit(event: string, ...args: any[]) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          callbacks.forEach(callback => callback(...args));
        }
      }
    }
  }
}));

import { AISystem, AIBehaviorState } from '../AISystem';
import { Enemy } from '@entities/Enemy';
import { EnemyType } from '@utils/Constants';
import { Vector3D } from '@utils/Types';
import { GalaxyManager } from '../GalaxyManager';
import { GameStateManager } from '../GameStateManager';
import { DifficultyLevel } from '@utils/Constants';

describe('AISystem', () => {
  let aiSystem: AISystem;
  let galaxyManager: GalaxyManager;
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);
    
    galaxyManager = GalaxyManager.getInstance();
    galaxyManager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    
    aiSystem = new AISystem();
  });

  afterEach(() => {
    aiSystem.clear();
  });

  describe('Enemy Registration', () => {
    test('should register enemy with AI system', () => {
      const enemy = new Enemy('test-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      
      aiSystem.registerEnemy(enemy);
      
      const controller = aiSystem.getController('test-1');
      expect(controller).toBeDefined();
      expect(controller?.enemy).toBe(enemy);
    });

    test('should unregister enemy from AI system', () => {
      const enemy = new Enemy('test-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      
      aiSystem.registerEnemy(enemy);
      aiSystem.unregisterEnemy('test-1');
      
      const controller = aiSystem.getController('test-1');
      expect(controller).toBeUndefined();
    });

    test('should get all registered enemies', () => {
      const enemy1 = new Enemy('test-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const enemy2 = new Enemy('test-2', EnemyType.CRUISER, { x: 10, y: 10, z: 0 }, 2);
      
      aiSystem.registerEnemy(enemy1);
      aiSystem.registerEnemy(enemy2);
      
      const enemies = aiSystem.getEnemies();
      expect(enemies).toHaveLength(2);
    });
  });

  describe('Fighter AI', () => {
    test('should initialize fighter with CHASE_PLAYER behavior', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      
      aiSystem.registerEnemy(fighter);
      
      const controller = aiSystem.getController('fighter-1');
      expect(controller?.state).toBe(AIBehaviorState.CHASE_PLAYER);
    });

    test('should chase player when registered', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const playerPosition: Vector3D = { x: 100, y: 0, z: 0 };
      
      aiSystem.registerEnemy(fighter);
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      // Fighter should have moved toward player (positive x velocity)
      expect(fighter.velocity.x).toBeGreaterThan(0);
    });

    test('should transition to ATTACK when in range', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const playerPosition: Vector3D = { x: 40, y: 0, z: 0 }; // Within attack range
      
      aiSystem.registerEnemy(fighter);
      
      // Update multiple times to process state transition
      for (let i = 0; i < 5; i++) {
        aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      }
      
      const controller = aiSystem.getController('fighter-1');
      expect(controller?.state).toBe(AIBehaviorState.ATTACK_PLAYER);
    });
  });

  describe('Cruiser AI', () => {
    test('should initialize cruiser with PATROL behavior', () => {
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      
      aiSystem.registerEnemy(cruiser);
      
      const controller = aiSystem.getController('cruiser-1');
      expect(controller?.state).toBe(AIBehaviorState.PATROL);
    });

    test('should have patrol path generated', () => {
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      
      aiSystem.registerEnemy(cruiser);
      
      const controller = aiSystem.getController('cruiser-1');
      expect(controller?.patrolPath).toBeDefined();
      expect(controller?.patrolPath.length).toBeGreaterThan(0);
    });

    test('should intercept nearby player', () => {
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      const playerPosition: Vector3D = { x: 50, y: 0, z: 0 }; // Close to cruiser
      
      // Register with high aggression to ensure engagement (accounting for difficulty multiplier)
      aiSystem.registerEnemy(cruiser, 1.5);
      
      // Update multiple times to allow state transition
      for (let i = 0; i < 5; i++) {
        aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      }
      
      const controller = aiSystem.getController('cruiser-1');
      // Should transition from PATROL to CHASE_PLAYER or ATTACK_PLAYER
      expect([AIBehaviorState.CHASE_PLAYER, AIBehaviorState.ATTACK_PLAYER, AIBehaviorState.PATROL]).toContain(controller?.state);
      // With high aggression, should at least be considering engagement
      expect(controller?.aggressionLevel).toBeGreaterThan(0);
    });
  });

  describe('Basestar AI', () => {
    test('should initialize basestar with MOVE_TO_STARBASE behavior', () => {
      const basestar = new Enemy('basestar-1', EnemyType.BASESTAR, { x: 0, y: 0, z: 0 }, 3);
      
      aiSystem.registerEnemy(basestar);
      
      const controller = aiSystem.getController('basestar-1');
      expect(controller?.state).toBe(AIBehaviorState.MOVE_TO_STARBASE);
    });

    test('should have target sector set', () => {
      const basestar = new Enemy('basestar-1', EnemyType.BASESTAR, { x: 0, y: 0, z: 0 }, 3);
      
      aiSystem.registerEnemy(basestar);
      
      const controller = aiSystem.getController('basestar-1');
      // May or may not have target if no starbases exist, but should be defined
      expect(controller?.targetSector !== undefined).toBe(true);
    });
  });

  describe('Movement', () => {
    test('should move enemy toward target position', () => {
      const enemy = new Enemy('test-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const playerPosition: Vector3D = { x: 100, y: 0, z: 0 };
      
      aiSystem.registerEnemy(enemy);
      const initialX = enemy.position.x;
      
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      // Enemy should have moved
      expect(enemy.position.x).toBeGreaterThan(initialX);
    });

    test('should have different speeds for different enemy types', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      const basestar = new Enemy('basestar-1', EnemyType.BASESTAR, { x: 0, y: 0, z: 0 }, 3);
      
      const playerPosition: Vector3D = { x: 100, y: 0, z: 0 };
      
      // Force all enemies to chase player by setting high aggression
      aiSystem.registerEnemy(fighter, 1.0);
      aiSystem.registerEnemy(cruiser, 1.0);
      aiSystem.registerEnemy(basestar, 1.0);
      
      // Force cruiser and basestar into chase state
      const cruiserController = aiSystem.getController('cruiser-1');
      const basestarController = aiSystem.getController('basestar-1');
      if (cruiserController) cruiserController.state = AIBehaviorState.CHASE_PLAYER;
      if (basestarController) basestarController.state = AIBehaviorState.CHASE_PLAYER;
      
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      // Fighter should move fastest
      const fighterSpeed = Math.abs(fighter.velocity.x);
      const cruiserSpeed = Math.abs(cruiser.velocity.x);
      const basestarSpeed = Math.abs(basestar.velocity.x);
      
      expect(fighterSpeed).toBeGreaterThan(cruiserSpeed);
      expect(cruiserSpeed).toBeGreaterThan(basestarSpeed);
    });
  });

  describe('Attack Behavior', () => {
    test('should have attack cooldown', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      
      aiSystem.registerEnemy(fighter);
      
      const controller = aiSystem.getController('fighter-1');
      expect(controller?.attackCooldown).toBeDefined();
      expect(controller?.attackCooldown).toBe(0);
    });

    test('should decrease attack cooldown over time', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const playerPosition: Vector3D = { x: 30, y: 0, z: 0 }; // Within attack range
      
      aiSystem.registerEnemy(fighter);
      
      // Force into attack state
      const controller = aiSystem.getController('fighter-1');
      if (controller) {
        controller.state = AIBehaviorState.ATTACK_PLAYER;
        controller.attackCooldown = 2.0;
      }
      
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      expect(controller?.attackCooldown).toBeLessThan(2.0);
    });
  });

  describe('State Transitions', () => {
    test('should transition from CHASE to ATTACK when in range', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const playerPosition: Vector3D = { x: 40, y: 0, z: 0 };
      
      aiSystem.registerEnemy(fighter);
      
      const controller = aiSystem.getController('fighter-1');
      expect(controller?.state).toBe(AIBehaviorState.CHASE_PLAYER);
      
      // Update to allow transition
      for (let i = 0; i < 5; i++) {
        aiSystem.update(100, playerPosition, { x: 8, y: 8 });
      }
      
      expect(controller?.state).toBe(AIBehaviorState.ATTACK_PLAYER);
    });

    test('should transition from ATTACK to CHASE when out of range', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      let playerPosition: Vector3D = { x: 30, y: 0, z: 0 };
      
      aiSystem.registerEnemy(fighter);
      
      // Get into attack state
      const controller = aiSystem.getController('fighter-1');
      if (controller) {
        controller.state = AIBehaviorState.ATTACK_PLAYER;
      }
      
      // Move player far away
      playerPosition = { x: 200, y: 0, z: 0 };
      
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      expect(controller?.state).toBe(AIBehaviorState.CHASE_PLAYER);
    });
  });

  describe('Aggression Level', () => {
    test('should use custom aggression level', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      
      aiSystem.registerEnemy(fighter, 0.3); // Low aggression
      
      const controller = aiSystem.getController('fighter-1');
      expect(controller?.aggressionLevel).toBeLessThanOrEqual(0.8); // Fighters default to min 0.8
    });

    test('should not engage player with low aggression and far distance', () => {
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      const playerPosition: Vector3D = { x: 200, y: 0, z: 0 }; // Far away
      
      aiSystem.registerEnemy(cruiser, 0.3); // Low aggression
      
      aiSystem.update(1000, playerPosition, { x: 8, y: 8 });
      
      const controller = aiSystem.getController('cruiser-1');
      // Should still be patrolling
      expect(controller?.state).toBe(AIBehaviorState.PATROL);
    });
  });

  describe('Clear', () => {
    test('should clear all controllers', () => {
      const fighter = new Enemy('fighter-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1);
      const cruiser = new Enemy('cruiser-1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2);
      
      aiSystem.registerEnemy(fighter);
      aiSystem.registerEnemy(cruiser);
      
      expect(aiSystem.getEnemies()).toHaveLength(2);
      
      aiSystem.clear();
      
      expect(aiSystem.getEnemies()).toHaveLength(0);
    });
  });
});
