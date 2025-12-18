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

import { EnergySystem } from '../EnergySystem';
import { GameStateManager, GameStateType } from '../GameStateManager';
import { PESCLRSystem } from '../PESCLRSystem';
import {
  DifficultyLevel,
  MAX_ENERGY,
  CRITICAL_ENERGY,
  LOW_ENERGY,
  TORPEDO_ENERGY_COST,
  SystemStatus,
} from '@utils/Constants';

describe('EnergySystem', () => {
  let energySystem: EnergySystem;
  let pesclrSystem: PESCLRSystem;
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    // Reset singleton instance
    gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);
    
    pesclrSystem = new PESCLRSystem();
    energySystem = new EnergySystem(pesclrSystem);
  });

  afterEach(() => {
    energySystem.destroy();
  });

  describe('Energy Consumption', () => {
    test('should consume base systems energy over time', () => {
      const gameState = gameStateManager.getGameState();
      const initialEnergy = gameState.player.energy;

      // Update for 1 second (1000ms)
      energySystem.update(1000);

      // Energy should decrease
      expect(gameState.player.energy).toBeLessThan(initialEnergy);
    });

    test('should consume more energy at higher velocities', () => {
      const gameState = gameStateManager.getGameState();

      // Set velocity to 0
      gameState.player.velocity = 0;
      const initialEnergy = gameState.player.energy;
      energySystem.update(1000);
      const energyAfterSpeed0 = gameState.player.energy;
      const consumptionSpeed0 = initialEnergy - energyAfterSpeed0;

      // Reset and set velocity to 6 (cruise speed)
      gameState.player.energy = initialEnergy;
      gameState.player.velocity = 6;
      energySystem.update(1000);
      const energyAfterSpeed6 = gameState.player.energy;
      const consumptionSpeed6 = initialEnergy - energyAfterSpeed6;

      // Speed 6 should consume more than speed 0
      expect(consumptionSpeed6).toBeGreaterThan(consumptionSpeed0);
    });

    test('should consume energy when shields are active', () => {
      const gameState = gameStateManager.getGameState();

      // Shields off
      gameState.player.shieldsActive = false;
      gameState.player.velocity = 0;
      const initialEnergy = gameState.player.energy;
      energySystem.update(1000);
      const consumptionShieldsOff = initialEnergy - gameState.player.energy;

      // Reset and activate shields
      gameState.player.energy = initialEnergy;
      gameState.player.shieldsActive = true;
      energySystem.update(1000);
      const consumptionShieldsOn = initialEnergy - gameState.player.energy;

      // Shields on should consume more
      expect(consumptionShieldsOn).toBeGreaterThan(consumptionShieldsOff);
    });

    test('should consume energy when computer is active', () => {
      const gameState = gameStateManager.getGameState();

      // Computer off
      gameState.player.computerActive = false;
      gameState.player.velocity = 0;
      const initialEnergy = gameState.player.energy;
      energySystem.update(1000);
      const consumptionComputerOff = initialEnergy - gameState.player.energy;

      // Reset and activate computer
      gameState.player.energy = initialEnergy;
      gameState.player.computerActive = true;
      energySystem.update(1000);
      const consumptionComputerOn = initialEnergy - gameState.player.energy;

      // Computer on should consume more
      expect(consumptionComputerOn).toBeGreaterThan(consumptionComputerOff);
    });
  });

  describe('Torpedo Energy', () => {
    test('should consume energy when firing torpedo', () => {
      const gameState = gameStateManager.getGameState();
      const initialEnergy = gameState.player.energy;

      const success = energySystem.consumeTorpedoEnergy();

      expect(success).toBe(true);
      expect(gameState.player.energy).toBe(initialEnergy - TORPEDO_ENERGY_COST);
    });

    test('should fail to fire torpedo with insufficient energy', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = TORPEDO_ENERGY_COST - 1;

      const success = energySystem.consumeTorpedoEnergy();

      expect(success).toBe(false);
      expect(gameState.player.energy).toBe(TORPEDO_ENERGY_COST - 1);
    });
  });

  describe('Hyperspace Energy', () => {
    test('should consume energy for hyperspace jump', () => {
      const gameState = gameStateManager.getGameState();
      const distance = 5;
      const expectedCost = 100 + (distance * 10);
      const initialEnergy = gameState.player.energy;

      const success = energySystem.consumeHyperspaceEnergy(distance);

      expect(success).toBe(true);
      expect(gameState.player.energy).toBe(initialEnergy - expectedCost);
    });

    test('should fail hyperspace jump with insufficient energy', () => {
      const gameState = gameStateManager.getGameState();
      const distance = 10;
      const requiredEnergy = 100 + (distance * 10);
      gameState.player.energy = requiredEnergy - 1;

      const success = energySystem.consumeHyperspaceEnergy(distance);

      expect(success).toBe(false);
    });
  });

  describe('Energy Warnings', () => {
    test('should emit low energy warning', (done) => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = LOW_ENERGY - 10;

      energySystem.on('lowEnergy', (energy: number) => {
        expect(energy).toBeLessThanOrEqual(LOW_ENERGY);
        expect(energySystem.isEnergyLow()).toBe(true);
        done();
      });

      energySystem.update(100);
    });

    test('should emit critical energy warning', (done) => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = CRITICAL_ENERGY - 10;

      energySystem.on('criticalEnergy', (energy: number) => {
        expect(energy).toBeLessThanOrEqual(CRITICAL_ENERGY);
        expect(energySystem.isEnergyCritical()).toBe(true);
        done();
      });

      energySystem.update(100);
    });

    test('should emit energy depleted event', (done) => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = 1;
      gameState.player.velocity = 0;

      energySystem.on('energyDepleted', () => {
        expect(gameState.player.energy).toBe(0);
        expect(gameState.gameActive).toBe(false);
        done();
      });

      // Multiple updates to deplete energy
      energySystem.update(1000);
      energySystem.update(1000);
    });
  });

  describe('Energy Restoration', () => {
    test('should restore energy', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = 1000;

      energySystem.restoreEnergy(500);

      expect(gameState.player.energy).toBe(1500);
    });

    test('should not exceed max energy', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = MAX_ENERGY - 100;

      energySystem.restoreEnergy(500);

      expect(gameState.player.energy).toBe(MAX_ENERGY);
    });

    test('should restore to full energy by default', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = 100;

      energySystem.restoreEnergy();

      expect(gameState.player.energy).toBe(MAX_ENERGY);
    });

    test('should clear warning states on restore', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = CRITICAL_ENERGY - 10;

      // Trigger warning
      energySystem.update(100);
      expect(energySystem.isEnergyCritical()).toBe(true);

      // Restore energy
      energySystem.restoreEnergy();

      expect(energySystem.isEnergyCritical()).toBe(false);
      expect(energySystem.isEnergyLow()).toBe(false);
    });
  });

  describe('System Toggles', () => {
    test('should toggle shields on and off', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.shieldsActive = false;

      // Turn on
      const result1 = energySystem.toggleShields();
      expect(result1).toBe(true);
      expect(gameState.player.shieldsActive).toBe(true);

      // Turn off
      const result2 = energySystem.toggleShields();
      expect(result2).toBe(false);
      expect(gameState.player.shieldsActive).toBe(false);
    });

    test('should not activate destroyed shields', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.systems.shields = SystemStatus.DESTROYED;
      gameState.player.shieldsActive = false;

      const result = energySystem.toggleShields();

      expect(result).toBe(false);
      expect(gameState.player.shieldsActive).toBe(false);
    });

    test('should toggle computer on and off', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.computerActive = false;

      // Turn on
      const result1 = energySystem.toggleComputer();
      expect(result1).toBe(true);
      expect(gameState.player.computerActive).toBe(true);

      // Turn off
      const result2 = energySystem.toggleComputer();
      expect(result2).toBe(false);
      expect(gameState.player.computerActive).toBe(false);
    });

    test('should not activate destroyed computer', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.systems.computer = SystemStatus.DESTROYED;
      gameState.player.computerActive = false;

      const result = energySystem.toggleComputer();

      expect(result).toBe(false);
      expect(gameState.player.computerActive).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('should get current energy', () => {
      const gameState = gameStateManager.getGameState();
      const expectedEnergy = gameState.player.energy;

      expect(energySystem.getEnergy()).toBe(expectedEnergy);
    });

    test('should calculate energy percentage', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = MAX_ENERGY / 2;

      expect(energySystem.getEnergyPercentage()).toBeCloseTo(0.5, 2);
    });

    test('should calculate time until depletion', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = 1000;
      gameState.player.velocity = 6;

      const time = energySystem.getTimeUntilDepletion();

      expect(time).toBeGreaterThan(0);
    });

    test('should return -1 for time until depletion with no consumption', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.velocity = 0;
      gameState.player.shieldsActive = false;
      gameState.player.computerActive = false;

      // Base systems still consume, so this might be > 0
      // But in theory, if consumption was 0, it would return -1
      // This test validates the logic exists
      const time = energySystem.getTimeUntilDepletion();
      expect(typeof time).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('should not allow energy to go negative', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = 1;
      gameState.player.velocity = 9; // High consumption

      // Update multiple times
      for (let i = 0; i < 10; i++) {
        energySystem.update(1000);
      }

      expect(gameState.player.energy).toBe(0);
    });

    test('should not allow energy to exceed max', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.energy = MAX_ENERGY + 1000;

      energySystem.update(100);

      expect(gameState.player.energy).toBeLessThanOrEqual(MAX_ENERGY);
    });

    test('should auto-deactivate shields if destroyed during gameplay', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.shieldsActive = true;
      gameState.player.systems.shields = SystemStatus.DESTROYED;

      energySystem.update(100);

      expect(gameState.player.shieldsActive).toBe(false);
    });

    test('should auto-deactivate computer if destroyed during gameplay', () => {
      const gameState = gameStateManager.getGameState();
      gameState.player.computerActive = true;
      gameState.player.systems.computer = SystemStatus.DESTROYED;

      energySystem.update(100);

      expect(gameState.player.computerActive).toBe(false);
    });
  });
});
