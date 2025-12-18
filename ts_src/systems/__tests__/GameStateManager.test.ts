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

import { GameStateManager, GameStateType } from '../GameStateManager';
import { DifficultyLevel } from '@utils/Constants';

describe('GameStateManager', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    manager = GameStateManager.getInstance();
    // Reset to TITLE state for each test
    manager.setState(GameStateType.TITLE);
  });

  test('should be singleton', () => {
    const manager2 = GameStateManager.getInstance();
    expect(manager).toBe(manager2);
  });

  test('should transition to PLAYING when starting new game', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    expect(manager.getCurrentState()).toBe(GameStateType.PLAYING);
  });

  test('should emit stateChange event', (done) => {
    const callback = (oldState: GameStateType, newState: GameStateType) => {
      expect(oldState).toBe(GameStateType.TITLE);
      expect(newState).toBe(GameStateType.PLAYING);
      manager.off('stateChange', callback);
      done();
    };
    manager.on('stateChange', callback);
    manager.startNewGame(DifficultyLevel.NOVICE);
  });

  test('should pause and resume game', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    manager.pauseGame();
    expect(manager.getCurrentState()).toBe(GameStateType.PAUSED);
    manager.resumeGame();
    expect(manager.getCurrentState()).toBe(GameStateType.PLAYING);
  });

  test('should initialize game state with correct values', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    const gameState = manager.getGameState();
    expect(gameState.player.energy).toBe(7000);
    expect(gameState.player.kills).toBe(0);
    expect(gameState.player.sector.x).toBe(8);
    expect(gameState.player.sector.y).toBe(8);
    expect(gameState.gameActive).toBe(true);
  });

  test('should end game and transition to GAME_OVER', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    manager.endGame(true);
    expect(manager.getCurrentState()).toBe(GameStateType.GAME_OVER);
    expect(manager.getGameState().gameActive).toBe(false);
  });
});
