import Phaser from 'phaser';
import { DifficultyLevel, SystemStatus, GALAXY_SIZE } from '@utils/Constants';
import { GameState, PlayerState } from '@utils/Types';

export enum GameStateType {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GALACTIC_CHART = 'GALACTIC_CHART',
  HYPERSPACE = 'HYPERSPACE',
  GAME_OVER = 'GAME_OVER',
  RANKING = 'RANKING',
}

export class GameStateManager {
  private static instance: GameStateManager;
  private currentState: GameStateType;
  private gameState: GameState;
  private eventEmitter: Phaser.Events.EventEmitter;

  private constructor() {
    this.currentState = GameStateType.TITLE;
    this.eventEmitter = new Phaser.Events.EventEmitter();
    this.gameState = this.createInitialGameState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  getCurrentState(): GameStateType {
    return this.currentState;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  setState(newState: GameStateType): void {
    const oldState = this.currentState;
    this.currentState = newState;
    this.eventEmitter.emit('stateChange', oldState, newState);
  }

  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }

  off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }

  startNewGame(difficulty: DifficultyLevel): void {
    this.gameState = this.createInitialGameState();
    this.gameState.difficulty = difficulty;
    this.gameState.gameActive = true;
    this.setState(GameStateType.PLAYING);
    this.eventEmitter.emit('gameStart', difficulty);
  }

  pauseGame(): void {
    if (this.currentState === GameStateType.PLAYING) {
      this.setState(GameStateType.PAUSED);
    }
  }

  resumeGame(): void {
    if (this.currentState === GameStateType.PAUSED) {
      this.setState(GameStateType.PLAYING);
    }
  }

  endGame(victory: boolean): void {
    this.gameState.gameActive = false;
    this.setState(GameStateType.GAME_OVER);
    this.eventEmitter.emit('gameEnd', victory);
  }

  private createInitialGameState(): GameState {
    return {
      player: this.createInitialPlayerState(),
      difficulty: DifficultyLevel.NOVICE,
      missionTime: 0,
      score: 0,
      gameActive: false,
    };
  }

  private createInitialPlayerState(): PlayerState {
    const centerX = Math.floor(GALAXY_SIZE / 2);
    const centerY = Math.floor(GALAXY_SIZE / 2);
    return {
      position: { x: 0, y: 0, z: 0 },
      velocity: 0,
      energy: 7000,
      kills: 0,
      sector: { x: centerX, y: centerY },
      systems: {
        photon: SystemStatus.OPERATIONAL,
        engines: SystemStatus.OPERATIONAL,
        shields: SystemStatus.OPERATIONAL,
        computer: SystemStatus.OPERATIONAL,
        longRange: SystemStatus.OPERATIONAL,
        radio: SystemStatus.OPERATIONAL,
      },
      shieldsActive: false,
      computerActive: false,
    };
  }
}
