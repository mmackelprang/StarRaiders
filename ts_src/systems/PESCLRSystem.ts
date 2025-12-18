import Phaser from 'phaser';
import { GameStateManager } from './GameStateManager';
import { SystemStatus, DifficultyLevel } from '@utils/Constants';
import { ShipSystems } from '@utils/Types';
import { Debug } from '@utils/Debug';

export interface DamageResult {
  systemDamaged: keyof ShipSystems | null;
  newStatus: SystemStatus | null;
  message: string;
}

export class PESCLRSystem {
  private gameStateManager: GameStateManager;
  private eventEmitter: Phaser.Events.EventEmitter;
  
  // Damage probabilities by difficulty
  private readonly damageProbability: Record<DifficultyLevel, number> = {
    [DifficultyLevel.NOVICE]: 0.15,    // 15% chance per hit
    [DifficultyLevel.PILOT]: 0.25,     // 25% chance per hit
    [DifficultyLevel.WARRIOR]: 0.35,   // 35% chance per hit
    [DifficultyLevel.COMMANDER]: 0.50, // 50% chance per hit
  };
  
  // System names for display
  private readonly systemNames: Record<keyof ShipSystems, string> = {
    photon: 'Photon Torpedoes',
    engines: 'Engines',
    shields: 'Shields',
    computer: 'Computer',
    longRange: 'Long-Range Scan',
    radio: 'Radio',
  };
  
  constructor() {
    this.gameStateManager = GameStateManager.getInstance();
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }
  
  /**
   * Apply damage when player is hit by enemy
   */
  applyDamage(): DamageResult {
    const gameState = this.gameStateManager.getGameState();
    const difficulty = gameState.difficulty;
    
    // Check if shields absorbed the hit
    if (this.shieldsAbsorbDamage()) {
      return {
        systemDamaged: null,
        newStatus: null,
        message: 'Shields absorbed hit',
      };
    }
    
    // Roll for damage
    const probability = this.damageProbability[difficulty];
    if (Math.random() > probability) {
      return {
        systemDamaged: null,
        newStatus: null,
        message: 'Hit - no system damage',
      };
    }
    
    // Select a random system to damage
    const systemToDamage = this.selectRandomSystem();
    const currentStatus = gameState.player.systems[systemToDamage];
    
    // Cannot damage a destroyed system further
    if (currentStatus === SystemStatus.DESTROYED) {
      return this.applyDamage(); // Try again with different system
    }
    
    // Apply damage progression
    let newStatus: SystemStatus;
    if (currentStatus === SystemStatus.OPERATIONAL) {
      newStatus = SystemStatus.DAMAGED;
    } else {
      newStatus = SystemStatus.DESTROYED;
    }
    
    gameState.player.systems[systemToDamage] = newStatus;
    
    const systemName = this.systemNames[systemToDamage];
    const statusText = newStatus === SystemStatus.DAMAGED ? 'DAMAGED' : 'DESTROYED';
    const message = `${systemName} ${statusText}!`;
    
    Debug.warn(message);
    
    // Emit event for visual/audio feedback
    this.eventEmitter.emit('systemDamaged', systemToDamage, newStatus);
    
    return {
      systemDamaged: systemToDamage,
      newStatus: newStatus,
      message: message,
    };
  }
  
  /**
   * Check if shields absorb the damage
   */
  private shieldsAbsorbDamage(): boolean {
    const gameState = this.gameStateManager.getGameState();
    
    // Shields must be active
    if (!gameState.player.shieldsActive) {
      return false;
    }
    
    // Check shield system status
    const shieldStatus = gameState.player.systems.shields;
    
    if (shieldStatus === SystemStatus.DESTROYED) {
      return false;
    }
    
    // Get shield effectiveness based on difficulty and status
    const effectiveness = this.getShieldEffectiveness(
      gameState.difficulty,
      shieldStatus
    );
    
    // Roll for absorption
    return Math.random() < effectiveness;
  }
  
  /**
   * Get shield effectiveness percentage
   */
  private getShieldEffectiveness(
    difficulty: DifficultyLevel,
    status: SystemStatus
  ): number {
    // Base effectiveness by difficulty
    const baseEffectiveness: Record<DifficultyLevel, number> = {
      [DifficultyLevel.NOVICE]: 1.0,    // 100% protection
      [DifficultyLevel.PILOT]: 0.5,     // 50% protection
      [DifficultyLevel.WARRIOR]: 0.25,  // 25% protection
      [DifficultyLevel.COMMANDER]: 0.1, // 10% protection
    };
    
    const base = baseEffectiveness[difficulty];
    
    // Reduce by 50% if damaged
    if (status === SystemStatus.DAMAGED) {
      return base * 0.5;
    }
    
    return base;
  }
  
  /**
   * Select a random system to damage
   */
  private selectRandomSystem(): keyof ShipSystems {
    const systems: (keyof ShipSystems)[] = [
      'photon',
      'engines',
      'shields',
      'computer',
      'longRange',
      'radio',
    ];
    
    return systems[Math.floor(Math.random() * systems.length)];
  }
  
  /**
   * Repair all systems (when docked at starbase)
   */
  repairAllSystems(): void {
    const gameState = this.gameStateManager.getGameState();
    
    gameState.player.systems.photon = SystemStatus.OPERATIONAL;
    gameState.player.systems.engines = SystemStatus.OPERATIONAL;
    gameState.player.systems.shields = SystemStatus.OPERATIONAL;
    gameState.player.systems.computer = SystemStatus.OPERATIONAL;
    gameState.player.systems.longRange = SystemStatus.OPERATIONAL;
    gameState.player.systems.radio = SystemStatus.OPERATIONAL;
    
    Debug.log('All systems repaired to operational status');
    
    this.eventEmitter.emit('systemsRepaired');
  }
  
  /**
   * Get maximum speed based on engine status
   */
  getMaxSpeed(): number {
    const gameState = this.gameStateManager.getGameState();
    const engineStatus = gameState.player.systems.engines;
    
    switch (engineStatus) {
      case SystemStatus.OPERATIONAL:
        return 9; // Full speed range
      case SystemStatus.DAMAGED:
        return 6; // Reduced to level 6
      case SystemStatus.DESTROYED:
        return 3; // Limited to level 3
      default:
        return 9;
    }
  }
  
  /**
   * Get fire rate multiplier based on photon system status
   */
  getFireRateMultiplier(): number {
    const gameState = this.gameStateManager.getGameState();
    const photonStatus = gameState.player.systems.photon;
    
    switch (photonStatus) {
      case SystemStatus.OPERATIONAL:
        return 1.0; // Normal rate
      case SystemStatus.DAMAGED:
        return 0.5; // 50% rate
      case SystemStatus.DESTROYED:
        return 0.0; // Cannot fire
      default:
        return 1.0;
    }
  }
  
  /**
   * Get damage multiplier for photon torpedoes
   */
  getPhotonDamageMultiplier(): number {
    const gameState = this.gameStateManager.getGameState();
    const photonStatus = gameState.player.systems.photon;
    
    switch (photonStatus) {
      case SystemStatus.OPERATIONAL:
        return 1.0; // Full damage
      case SystemStatus.DAMAGED:
        return 0.8; // 80% damage
      case SystemStatus.DESTROYED:
        return 0.0; // No damage
      default:
        return 1.0;
    }
  }
  
  /**
   * Get energy consumption multiplier based on engine status
   */
  getEngineEnergyMultiplier(): number {
    const gameState = this.gameStateManager.getGameState();
    const engineStatus = gameState.player.systems.engines;
    
    switch (engineStatus) {
      case SystemStatus.OPERATIONAL:
        return 1.0; // Normal consumption
      case SystemStatus.DAMAGED:
        return 1.5; // +50% consumption
      case SystemStatus.DESTROYED:
        return 2.0; // +100% consumption
      default:
        return 1.0;
    }
  }
  
  /**
   * Check if computer can provide tracking
   */
  canProvideTracking(): boolean {
    const gameState = this.gameStateManager.getGameState();
    const computerStatus = gameState.player.systems.computer;
    
    return computerStatus !== SystemStatus.DESTROYED;
  }
  
  /**
   * Get range accuracy (for computer)
   */
  getRangeAccuracy(): number {
    const gameState = this.gameStateManager.getGameState();
    const computerStatus = gameState.player.systems.computer;
    
    switch (computerStatus) {
      case SystemStatus.OPERATIONAL:
        return 1.0; // 100% accurate
      case SystemStatus.DAMAGED:
        return 0.8; // ±20% error
      case SystemStatus.DESTROYED:
        return 0.0; // No range info
      default:
        return 1.0;
    }
  }
  
  /**
   * Check if long-range scan has false echoes
   */
  hasFalseEchoes(): boolean {
    const gameState = this.gameStateManager.getGameState();
    const longRangeStatus = gameState.player.systems.longRange;
    
    return longRangeStatus === SystemStatus.DAMAGED;
  }
  
  /**
   * Check if long-range scan is usable
   */
  canUseLongRangeScan(): boolean {
    const gameState = this.gameStateManager.getGameState();
    const longRangeStatus = gameState.player.systems.longRange;
    
    return longRangeStatus !== SystemStatus.DESTROYED;
  }
  
  /**
   * Check if radio can receive alerts
   */
  canReceiveAlerts(): boolean {
    const gameState = this.gameStateManager.getGameState();
    const radioStatus = gameState.player.systems.radio;
    
    return radioStatus !== SystemStatus.DESTROYED;
  }
  
  /**
   * Get alert delay (for damaged radio)
   */
  getAlertDelay(): number {
    const gameState = this.gameStateManager.getGameState();
    const radioStatus = gameState.player.systems.radio;
    
    switch (radioStatus) {
      case SystemStatus.OPERATIONAL:
        return 0; // Immediate
      case SystemStatus.DAMAGED:
        return 5; // 5 second delay
      case SystemStatus.DESTROYED:
        return Infinity; // No alerts
      default:
        return 0;
    }
  }
  
  /**
   * Get system status color for HUD display
   */
  getSystemColor(status: SystemStatus): string {
    switch (status) {
      case SystemStatus.OPERATIONAL:
        return '#00FFFF'; // Cyan
      case SystemStatus.DAMAGED:
        return '#FFFF00'; // Yellow
      case SystemStatus.DESTROYED:
        return '#FF0000'; // Red
      default:
        return '#FFFFFF'; // White
    }
  }
  
  /**
   * Get all system statuses for HUD
   */
  getSystemStatuses(): { [key: string]: SystemStatus } {
    const gameState = this.gameStateManager.getGameState();
    return {
      P: gameState.player.systems.photon,
      E: gameState.player.systems.engines,
      S: gameState.player.systems.shields,
      C: gameState.player.systems.computer,
      L: gameState.player.systems.longRange,
      R: gameState.player.systems.radio,
    };
  }
  
  /**
   * Event listener registration
   */
  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }
  
  /**
   * Event listener removal
   */
  off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }
}
