import { GameStateManager } from './GameStateManager';
import { PESCLRSystem } from './PESCLRSystem';
import {
  MAX_ENERGY,
  CRITICAL_ENERGY,
  LOW_ENERGY,
  ENERGY_COST_TABLE,
  TORPEDO_ENERGY_COST,
  SystemStatus,
} from '@utils/Constants';
import { Debug } from '@utils/Debug';

// Simple event emitter interface (avoiding Phaser dependency in tests)
interface EventEmitter {
  on(event: string, fn: Function, context?: any): this;
  off(event: string, fn?: Function, context?: any, once?: boolean): this;
  emit(event: string, ...args: any[]): boolean;
  removeAllListeners(event?: string): this;
}

/**
 * Energy Management System for Star Raiders
 * Tracks energy consumption, warnings, and game over conditions
 * 
 * Phase 12 Implementation
 */
export class EnergySystem {
  private gameStateManager: GameStateManager;
  private pesclrSystem: PESCLRSystem;
  private eventEmitter: EventEmitter;

  // Energy consumption rates (per second)
  private readonly shieldEnergyCost: number = 10; // energy/sec when shields active
  private readonly computerEnergyCost: number = 2; // energy/sec when computer active
  private readonly baseSystemsCost: number = 1; // energy/sec for life support, etc.

  // Warning states
  private isLowEnergyWarning: boolean = false;
  private isCriticalEnergyWarning: boolean = false;
  private energyDepleted: boolean = false;

  // Warning timers (for audio/visual pulsing)
  private lowEnergyTimer: number = 0;
  private criticalEnergyTimer: number = 0;
  private readonly warningInterval: number = 1.0; // seconds between warnings

  constructor(pesclrSystem: PESCLRSystem, eventEmitter?: EventEmitter) {
    this.gameStateManager = GameStateManager.getInstance();
    this.pesclrSystem = pesclrSystem;
    // Use provided event emitter or create a simple one
    this.eventEmitter = eventEmitter || this.createSimpleEventEmitter();
  }

  /**
   * Create a simple event emitter for testing (without Phaser dependency)
   */
  private createSimpleEventEmitter(): EventEmitter {
    const listeners: Map<string, Function[]> = new Map();

    return {
      on(event: string, fn: Function, context?: any): EventEmitter {
        if (!listeners.has(event)) {
          listeners.set(event, []);
        }
        listeners.get(event)!.push(context ? fn.bind(context) : fn);
        return this;
      },
      off(event: string, fn?: Function, context?: any): EventEmitter {
        if (!fn) {
          listeners.delete(event);
        } else {
          const eventListeners = listeners.get(event);
          if (eventListeners) {
            const index = eventListeners.indexOf(fn);
            if (index > -1) {
              eventListeners.splice(index, 1);
            }
          }
        }
        return this;
      },
      emit(event: string, ...args: any[]): boolean {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          eventListeners.forEach(fn => fn(...args));
          return true;
        }
        return false;
      },
      removeAllListeners(event?: string): EventEmitter {
        if (event) {
          listeners.delete(event);
        } else {
          listeners.clear();
        }
        return this;
      }
    };
  }

  /**
   * Update energy consumption based on current game state
   * Should be called every frame with delta time
   */
  update(deltaTime: number): void {
    const gameState = this.gameStateManager.getGameState();
    
    if (!gameState.gameActive) {
      return;
    }

    const deltaSeconds = deltaTime / 1000;

    // Calculate total energy consumption
    let energyConsumption = this.calculateEnergyConsumption(deltaSeconds);

    // Consume energy
    gameState.player.energy -= energyConsumption;

    // Clamp energy to valid range
    if (gameState.player.energy < 0) {
      gameState.player.energy = 0;
    }
    if (gameState.player.energy > MAX_ENERGY) {
      gameState.player.energy = MAX_ENERGY;
    }

    // Check energy levels and emit warnings
    this.checkEnergyWarnings(deltaSeconds);

    // Check for game over condition
    if (gameState.player.energy <= 0 && !this.energyDepleted) {
      this.handleEnergyDepletion();
    }

    // Emit energy update event for UI
    this.eventEmitter.emit('energyUpdate', gameState.player.energy);
  }

  /**
   * Calculate total energy consumption based on current state
   */
  private calculateEnergyConsumption(deltaSeconds: number): number {
    const gameState = this.gameStateManager.getGameState();
    let totalCost = 0;

    // 1. Base systems cost (life support, etc.)
    totalCost += this.baseSystemsCost * deltaSeconds;

    // 2. Velocity-based energy cost
    const velocityLevel = Math.floor(gameState.player.velocity);
    if (velocityLevel >= 0 && velocityLevel < ENERGY_COST_TABLE.length) {
      let velocityCost = ENERGY_COST_TABLE[velocityLevel] * deltaSeconds;

      // Apply engine damage multiplier from PESCLR
      const engineMultiplier = this.pesclrSystem.getEngineEnergyMultiplier();
      velocityCost *= engineMultiplier; // Damaged engines = higher cost

      totalCost += velocityCost;
    }

    // 3. Shield energy cost (if active)
    if (gameState.player.shieldsActive) {
      // Check if shields are operational
      if (gameState.player.systems.shields !== SystemStatus.DESTROYED) {
        let shieldCost = this.shieldEnergyCost * deltaSeconds;

        // Damaged shields consume more energy
        if (gameState.player.systems.shields === SystemStatus.DAMAGED) {
          shieldCost *= 1.5;
        }

        totalCost += shieldCost;
      } else {
        // Shields destroyed, auto-deactivate
        gameState.player.shieldsActive = false;
        this.eventEmitter.emit('shieldsDeactivated', 'destroyed');
      }
    }

    // 4. Computer energy cost (if active)
    if (gameState.player.computerActive) {
      if (gameState.player.systems.computer !== SystemStatus.DESTROYED) {
        let computerCost = this.computerEnergyCost * deltaSeconds;

        // Damaged computer uses more energy
        if (gameState.player.systems.computer === SystemStatus.DAMAGED) {
          computerCost *= 1.5;
        }

        totalCost += computerCost;
      } else {
        // Computer destroyed, auto-deactivate
        gameState.player.computerActive = false;
        this.eventEmitter.emit('computerDeactivated', 'destroyed');
      }
    }

    return totalCost;
  }

  /**
   * Consume energy for firing a torpedo
   */
  consumeTorpedoEnergy(): boolean {
    const gameState = this.gameStateManager.getGameState();

    if (gameState.player.energy < TORPEDO_ENERGY_COST) {
      Debug.warn('EnergySystem: Insufficient energy to fire torpedo');
      this.eventEmitter.emit('insufficientEnergy', 'torpedo');
      return false;
    }

    gameState.player.energy -= TORPEDO_ENERGY_COST;
    Debug.log(`EnergySystem: Torpedo fired, consumed ${TORPEDO_ENERGY_COST} energy`);
    return true;
  }

  /**
   * Consume energy for hyperspace jump
   * Energy cost: 100 + (distance × 10)
   */
  consumeHyperspaceEnergy(distance: number): boolean {
    const gameState = this.gameStateManager.getGameState();
    const energyCost = 100 + (distance * 10);

    if (gameState.player.energy < energyCost) {
      Debug.warn(`EnergySystem: Insufficient energy for hyperspace (need ${energyCost})`);
      this.eventEmitter.emit('insufficientEnergy', 'hyperspace', energyCost);
      return false;
    }

    gameState.player.energy -= energyCost;
    Debug.log(`EnergySystem: Hyperspace jump, consumed ${energyCost} energy`);
    return true;
  }

  /**
   * Restore energy (at starbase)
   */
  restoreEnergy(amount?: number): void {
    const gameState = this.gameStateManager.getGameState();
    const restoreAmount = amount || MAX_ENERGY;

    const previousEnergy = gameState.player.energy;
    gameState.player.energy = Math.min(gameState.player.energy + restoreAmount, MAX_ENERGY);
    const actualRestore = gameState.player.energy - previousEnergy;

    Debug.log(`EnergySystem: Restored ${actualRestore} energy`);
    this.eventEmitter.emit('energyRestored', actualRestore);

    // Clear warning states
    this.isLowEnergyWarning = false;
    this.isCriticalEnergyWarning = false;
    this.energyDepleted = false;
  }

  /**
   * Check energy levels and emit appropriate warnings
   */
  private checkEnergyWarnings(deltaSeconds: number): void {
    const gameState = this.gameStateManager.getGameState();
    const energy = gameState.player.energy;

    // Update warning timers
    this.lowEnergyTimer += deltaSeconds;
    this.criticalEnergyTimer += deltaSeconds;

    // Critical energy warning (< 500)
    if (energy <= CRITICAL_ENERGY && energy > 0) {
      if (!this.isCriticalEnergyWarning) {
        this.isCriticalEnergyWarning = true;
        this.isLowEnergyWarning = false; // Upgrade to critical
        Debug.warn(`EnergySystem: CRITICAL ENERGY WARNING (${energy})`);
        this.eventEmitter.emit('criticalEnergy', energy);
      }

      // Emit periodic critical warning for pulsing effect
      if (this.criticalEnergyTimer >= this.warningInterval) {
        this.criticalEnergyTimer = 0;
        this.eventEmitter.emit('criticalEnergyPulse', energy);
      }
    }
    // Low energy warning (< 1000)
    else if (energy <= LOW_ENERGY && energy > CRITICAL_ENERGY) {
      if (!this.isLowEnergyWarning) {
        this.isLowEnergyWarning = true;
        this.isCriticalEnergyWarning = false;
        Debug.warn(`EnergySystem: Low Energy Warning (${energy})`);
        this.eventEmitter.emit('lowEnergy', energy);
      }

      // Emit periodic low energy warning
      if (this.lowEnergyTimer >= this.warningInterval * 2) {
        this.lowEnergyTimer = 0;
        this.eventEmitter.emit('lowEnergyPulse', energy);
      }
    }
    // Energy restored above warning levels
    else if (energy > LOW_ENERGY) {
      if (this.isLowEnergyWarning || this.isCriticalEnergyWarning) {
        this.isLowEnergyWarning = false;
        this.isCriticalEnergyWarning = false;
        this.eventEmitter.emit('energyNormal', energy);
      }
    }
  }

  /**
   * Handle energy depletion (game over condition)
   */
  private handleEnergyDepletion(): void {
    this.energyDepleted = true;
    Debug.error('EnergySystem: Energy depleted! Game Over');
    
    // End game first (sets gameActive to false)
    this.gameStateManager.endGame(false);
    
    // Then emit event (listeners can check gameState)
    this.eventEmitter.emit('energyDepleted');
  }

  /**
   * Toggle shields on/off
   */
  toggleShields(): boolean {
    const gameState = this.gameStateManager.getGameState();

    if (gameState.player.systems.shields === SystemStatus.DESTROYED) {
      Debug.warn('EnergySystem: Cannot activate shields - system destroyed');
      this.eventEmitter.emit('systemUnavailable', 'shields');
      return false;
    }

    gameState.player.shieldsActive = !gameState.player.shieldsActive;
    
    if (gameState.player.shieldsActive) {
      Debug.log('EnergySystem: Shields activated');
      this.eventEmitter.emit('shieldsActivated');
    } else {
      Debug.log('EnergySystem: Shields deactivated');
      this.eventEmitter.emit('shieldsDeactivated', 'manual');
    }

    return gameState.player.shieldsActive;
  }

  /**
   * Toggle computer on/off
   */
  toggleComputer(): boolean {
    const gameState = this.gameStateManager.getGameState();

    if (gameState.player.systems.computer === SystemStatus.DESTROYED) {
      Debug.warn('EnergySystem: Cannot activate computer - system destroyed');
      this.eventEmitter.emit('systemUnavailable', 'computer');
      return false;
    }

    gameState.player.computerActive = !gameState.player.computerActive;
    
    if (gameState.player.computerActive) {
      Debug.log('EnergySystem: Computer activated');
      this.eventEmitter.emit('computerActivated');
    } else {
      Debug.log('EnergySystem: Computer deactivated');
      this.eventEmitter.emit('computerDeactivated', 'manual');
    }

    return gameState.player.computerActive;
  }

  /**
   * Get current energy level
   */
  getEnergy(): number {
    const gameState = this.gameStateManager.getGameState();
    return gameState.player.energy;
  }

  /**
   * Get energy percentage (0-1)
   */
  getEnergyPercentage(): number {
    return this.getEnergy() / MAX_ENERGY;
  }

  /**
   * Check if energy is in warning state
   */
  isEnergyLow(): boolean {
    return this.isLowEnergyWarning;
  }

  /**
   * Check if energy is in critical state
   */
  isEnergyCritical(): boolean {
    return this.isCriticalEnergyWarning;
  }

  /**
   * Get estimated time until energy depleted (in seconds)
   * Returns -1 if energy is increasing or static
   */
  getTimeUntilDepletion(): number {
    const gameState = this.gameStateManager.getGameState();
    const currentEnergy = gameState.player.energy;
    
    // Calculate current consumption rate per second
    const consumptionRate = this.calculateEnergyConsumption(1.0);
    
    if (consumptionRate <= 0) {
      return -1; // Not depleting
    }

    return currentEnergy / consumptionRate;
  }

  /**
   * Event listener registration
   */
  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.eventEmitter.removeAllListeners();
  }
}
