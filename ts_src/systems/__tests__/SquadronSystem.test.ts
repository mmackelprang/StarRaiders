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

import { SquadronSystem, FormationType, SquadronObjective } from '../SquadronSystem';
import { Enemy } from '@entities/Enemy';
import { EnemyType, DifficultyLevel } from '@utils/Constants';
import { GalaxyManager } from '../GalaxyManager';
import { GameStateManager } from '../GameStateManager';

describe('SquadronSystem', () => {
  let squadronSystem: SquadronSystem;
  let galaxyManager: GalaxyManager;
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);
    
    galaxyManager = GalaxyManager.getInstance();
    galaxyManager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    
    squadronSystem = new SquadronSystem();
  });

  afterEach(() => {
    squadronSystem.clear();
  });

  describe('Squadron Creation', () => {
    test('should create squadron with valid size', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
        new Enemy('f3', EnemyType.FIGHTER, { x: 20, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadron).toBeDefined();
      expect(squadron?.memberIds).toHaveLength(3);
      expect(squadron?.formation).toBe(FormationType.V_FORMATION);
      expect(squadron?.objective).toBe(SquadronObjective.ATTACK_PLAYER);
    });

    test('should not create squadron with too few members', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadron).toBeNull();
    });

    test('should set leader as first enemy', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadron?.leaderId).toBe('f1');
    });

    test('should calculate current sector from leader position', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 250, y: 350, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 260, y: 360, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadron?.currentSector).toEqual({ x: 2, y: 3 });
    });
  });

  describe('Squadron Management', () => {
    test('should track multiple squadrons', () => {
      const squadron1Enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      const squadron2Enemies = [
        new Enemy('c1', EnemyType.CRUISER, { x: 100, y: 100, z: 0 }, 2),
        new Enemy('c2', EnemyType.CRUISER, { x: 110, y: 100, z: 0 }, 2),
      ];

      squadronSystem.createSquadron(squadron1Enemies, FormationType.V_FORMATION, SquadronObjective.ATTACK_PLAYER);
      squadronSystem.createSquadron(squadron2Enemies, FormationType.LINE_ABREAST, SquadronObjective.PATROL_ROUTE);

      const squadrons = squadronSystem.getSquadrons();
      expect(squadrons).toHaveLength(2);
    });

    test('should find squadron for enemy', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      const foundSquadron = squadronSystem.getSquadronForEnemy('f2');
      expect(foundSquadron?.id).toBe(squadron?.id);
    });

    test('should return null for enemy not in squadron', () => {
      const foundSquadron = squadronSystem.getSquadronForEnemy('nonexistent');
      expect(foundSquadron).toBeNull();
    });
  });

  describe('Squadron Updates', () => {
    test('should update squadron with valid enemies', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      const enemyMap = new Map<string, Enemy>();
      enemies.forEach(e => enemyMap.set(e.id, e));

      // Should not throw
      expect(() => {
        squadronSystem.update(1000, enemyMap);
      }).not.toThrow();

      const squadrons = squadronSystem.getSquadrons();
      expect(squadrons).toHaveLength(1);
    });

    test('should disband squadron when too few members remain', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      // Remove most enemies from map
      const enemyMap = new Map<string, Enemy>();
      enemyMap.set('f1', enemies[0]);
      // f2 is missing - squadron should disband

      squadronSystem.update(1000, enemyMap);

      const squadrons = squadronSystem.getSquadrons();
      expect(squadrons).toHaveLength(0);
    });

    test('should promote new leader when current leader destroyed', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
        new Enemy('f3', EnemyType.FIGHTER, { x: 20, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      // Remove leader from map
      const enemyMap = new Map<string, Enemy>();
      enemyMap.set('f2', enemies[1]);
      enemyMap.set('f3', enemies[2]);

      squadronSystem.update(1000, enemyMap);

      const updatedSquadron = squadronSystem.getSquadron(squadron!.id);
      expect(updatedSquadron?.leaderId).toBe('f2');
    });
  });

  describe('Formation Types', () => {
    test('should create V_FORMATION squadron', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadron?.formation).toBe(FormationType.V_FORMATION);
      expect(squadron?.cohesion).toBeGreaterThan(1.0); // V formation is fast
    });

    test('should create LINE_ABREAST squadron', () => {
      const enemies = [
        new Enemy('c1', EnemyType.CRUISER, { x: 0, y: 0, z: 0 }, 2),
        new Enemy('c2', EnemyType.CRUISER, { x: 10, y: 0, z: 0 }, 2),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.LINE_ABREAST,
        SquadronObjective.PATROL_ROUTE
      );

      expect(squadron?.formation).toBe(FormationType.LINE_ABREAST);
      expect(squadron?.cohesion).toBe(1.0); // Standard
    });

    test('should create CLUSTER squadron', () => {
      const enemies = [
        new Enemy('b1', EnemyType.BASESTAR, { x: 0, y: 0, z: 0 }, 3),
        new Enemy('b2', EnemyType.BASESTAR, { x: 10, y: 0, z: 0 }, 3),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.CLUSTER,
        SquadronObjective.ATTACK_STARBASE
      );

      expect(squadron?.formation).toBe(FormationType.CLUSTER);
      expect(squadron?.cohesion).toBeLessThan(1.0); // Tight formation
    });
  });

  describe('Strategic Objectives', () => {
    test('should check if can launch starbase attack', () => {
      const starbaseSector = { x: 5, y: 5 };

      // Create multiple squadrons targeting same starbase
      for (let i = 0; i < 3; i++) {
        const enemies = [
          new Enemy(`b${i}a`, EnemyType.BASESTAR, { x: i * 100, y: 0, z: 0 }, 3),
          new Enemy(`b${i}b`, EnemyType.BASESTAR, { x: i * 100 + 10, y: 0, z: 0 }, 3),
        ];

        const squadron = squadronSystem.createSquadron(
          enemies,
          FormationType.CLUSTER,
          SquadronObjective.ATTACK_STARBASE
        );

        if (squadron) {
          squadron.targetSector = starbaseSector;
        }
      }

      const canAttack = squadronSystem.canLaunchStarbaseAttack(starbaseSector);
      expect(canAttack).toBe(true);
    });

    test('should not allow starbase attack with too few squadrons', () => {
      const starbaseSector = { x: 5, y: 5 };

      // Create only 1 squadron
      const enemies = [
        new Enemy('b1', EnemyType.BASESTAR, { x: 0, y: 0, z: 0 }, 3),
        new Enemy('b2', EnemyType.BASESTAR, { x: 10, y: 0, z: 0 }, 3),
      ];

      const squadron = squadronSystem.createSquadron(
        enemies,
        FormationType.CLUSTER,
        SquadronObjective.ATTACK_STARBASE
      );

      if (squadron) {
        squadron.targetSector = starbaseSector;
      }

      const canAttack = squadronSystem.canLaunchStarbaseAttack(starbaseSector);
      expect(canAttack).toBe(false);
    });
  });

  describe('Clear', () => {
    test('should clear all squadrons', () => {
      const enemies = [
        new Enemy('f1', EnemyType.FIGHTER, { x: 0, y: 0, z: 0 }, 1),
        new Enemy('f2', EnemyType.FIGHTER, { x: 10, y: 0, z: 0 }, 1),
      ];

      squadronSystem.createSquadron(
        enemies,
        FormationType.V_FORMATION,
        SquadronObjective.ATTACK_PLAYER
      );

      expect(squadronSystem.getSquadrons()).toHaveLength(1);

      squadronSystem.clear();

      expect(squadronSystem.getSquadrons()).toHaveLength(0);
    });
  });
});
