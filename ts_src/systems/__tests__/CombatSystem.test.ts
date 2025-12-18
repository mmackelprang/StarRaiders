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

import { CombatSystem } from '../CombatSystem';
import { Enemy } from '@entities/Enemy';
import { TorpedoDirection } from '@entities/Torpedo';
import { EnemyType, SystemStatus } from '@utils/Constants';
import { GameStateManager } from '../GameStateManager';

// Mock Phaser scene
const mockScene = {
  time: {
    now: 0,
  },
  events: {
    emit: jest.fn(),
  },
} as any;

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    combatSystem = new CombatSystem(mockScene);
    gameStateManager = GameStateManager.getInstance();
    
    // Reset game state
    const gameState = gameStateManager.getGameState();
    gameState.player.energy = 7000;
    gameState.player.systems.photon = SystemStatus.OPERATIONAL;
    
    // Set time to 1000ms (1 second) to avoid cooldown issues
    mockScene.time.now = 1000;
  });

  describe('fireTorpedo', () => {
    test('should create torpedo when conditions are met', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };

      const torpedo = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );

      expect(torpedo).not.toBeNull();
      expect(torpedo?.active).toBe(true);
      expect(torpedo?.direction).toBe(TorpedoDirection.FORE);
    });

    test('should consume energy when firing', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };
      const initialEnergy = gameStateManager.getGameState().player.energy;

      combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );

      const finalEnergy = gameStateManager.getGameState().player.energy;
      expect(finalEnergy).toBe(initialEnergy - 5);
    });

    test('should not fire when energy is insufficient', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };
      
      // Set energy below cost
      gameStateManager.getGameState().player.energy = 3;

      const torpedo = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );

      expect(torpedo).toBeNull();
    });

    test('should not fire when photon system is destroyed', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };
      
      gameStateManager.getGameState().player.systems.photon = SystemStatus.DESTROYED;

      const torpedo = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );

      expect(torpedo).toBeNull();
    });

    test('should respect cooldown', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };

      // Fire first torpedo
      const torpedo1 = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );
      expect(torpedo1).not.toBeNull();

      // Try to fire immediately (should fail)
      const torpedo2 = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );
      expect(torpedo2).toBeNull();

      // Wait for cooldown (0.25 seconds = 250ms, so add 300ms to be safe)
      mockScene.time.now += 300;

      // Should succeed now
      const torpedo3 = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );
      expect(torpedo3).not.toBeNull();
    });
  });

  describe('calculateLockStatus', () => {
    test('should detect all locks when perfectly aligned in optimal range', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const targetPosition = { x: 0, y: 0, z: 50 }; // Optimal range

      const lockStatus = combatSystem.calculateLockStatus(playerPosition, targetPosition);

      expect(lockStatus.hLock).toBe(true);
      expect(lockStatus.vLock).toBe(true);
      expect(lockStatus.rangeLock).toBe(true);
    });

    test('should not have h-lock when horizontally misaligned', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const targetPosition = { x: 10, y: 0, z: 50 }; // Misaligned horizontally

      const lockStatus = combatSystem.calculateLockStatus(playerPosition, targetPosition);

      expect(lockStatus.hLock).toBe(false);
      expect(lockStatus.vLock).toBe(true);
    });

    test('should not have v-lock when vertically misaligned', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const targetPosition = { x: 0, y: 10, z: 50 }; // Misaligned vertically

      const lockStatus = combatSystem.calculateLockStatus(playerPosition, targetPosition);

      expect(lockStatus.hLock).toBe(true);
      expect(lockStatus.vLock).toBe(false);
    });

    test('should not have range-lock when too close', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const targetPosition = { x: 0, y: 0, z: 20 }; // Too close

      const lockStatus = combatSystem.calculateLockStatus(playerPosition, targetPosition);

      expect(lockStatus.rangeLock).toBe(false);
    });

    test('should not have range-lock when too far', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const targetPosition = { x: 0, y: 0, z: 80 }; // Too far

      const lockStatus = combatSystem.calculateLockStatus(playerPosition, targetPosition);

      expect(lockStatus.rangeLock).toBe(false);
    });
  });

  describe('update', () => {
    test('should update torpedoes and detect collisions', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };
      
      // Create enemy at position that will be hit
      const enemy = new Enemy('test-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 10 }, 1);
      const enemies = [enemy];

      // Fire torpedo
      combatSystem.fireTorpedo(playerPosition, TorpedoDirection.FORE, lockStatus);

      // Update for enough time to reach enemy
      combatSystem.update(0.2, enemies); // Torpedo travels 10 metrons in 0.2s

      // Check that event was emitted
      expect(mockScene.events.emit).toHaveBeenCalledWith(
        'torpedoHit',
        expect.anything(),
        expect.anything()
      );
    });

    test('should deactivate torpedoes beyond max range', () => {
      const playerPosition = { x: 0, y: 0, z: 0 };
      const lockStatus = { hLock: true, vLock: true, rangeLock: true };

      // Fire torpedo
      const torpedo = combatSystem.fireTorpedo(
        playerPosition,
        TorpedoDirection.FORE,
        lockStatus
      );

      expect(torpedo?.active).toBe(true);

      // Update for long enough to exceed range
      combatSystem.update(3.0, []); // 150 metrons traveled (beyond 100 max)

      expect(torpedo?.active).toBe(false);
    });
  });
});
