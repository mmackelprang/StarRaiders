// Mock Phaser before importing
jest.mock('phaser', () => ({
  Scene: class {
    scene = {
      start: jest.fn(),
      stop: jest.fn(),
    };
    scale = {
      width: 1920,
      height: 1080,
    };
    add = {
      graphics: jest.fn(() => ({
        clear: jest.fn(),
        lineStyle: jest.fn(),
        strokeCircle: jest.fn(),
        fillStyle: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        lineBetween: jest.fn(),
      })),
      line: jest.fn(() => ({
        setOrigin: jest.fn(),
        setTo: jest.fn(),
        geom: { x1: 0, y1: 0, x2: 0, y2: 0 },
      })),
      text: jest.fn(() => ({
        setText: jest.fn(),
      })),
    };
    input = {
      keyboard: {
        createCursorKeys: jest.fn(() => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false },
        })),
      },
    };
  },
  Math: {
    Clamp: (value: number, min: number, max: number) => {
      return Math.max(min, Math.min(max, value));
    },
  },
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

import { HyperspaceScene } from '../Hyperspace';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { GalaxyManager } from '@systems/GalaxyManager';
import { DifficultyLevel } from '@utils/Constants';

describe('HyperspaceScene', () => {
  let scene: HyperspaceScene;
  let gameStateManager: GameStateManager;
  let galaxyManager: GalaxyManager;

  beforeEach(() => {
    gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);
    
    galaxyManager = GalaxyManager.getInstance();
    galaxyManager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    
    scene = new HyperspaceScene();
  });

  describe('Initialization', () => {
    test('should initialize with target sector', () => {
      const targetSector = { x: 5, y: 5 };
      
      expect(() => {
        scene.init({ targetSector });
      }).not.toThrow();
    });

    test('should determine auto-pilot mode for Novice difficulty', () => {
      const targetSector = { x: 5, y: 5 };
      gameStateManager.startNewGame(DifficultyLevel.NOVICE);
      
      scene.init({ targetSector });
      
      // Should use auto-pilot (not manual) for Novice
      expect((scene as any).isManualMode).toBe(false);
    });

    test('should determine manual mode for Warrior difficulty', () => {
      const targetSector = { x: 5, y: 5 };
      gameStateManager.startNewGame(DifficultyLevel.WARRIOR);
      
      scene.init({ targetSector });
      
      // Should use manual mode for Warrior
      expect((scene as any).isManualMode).toBe(true);
    });
  });

  describe('Distance Calculation', () => {
    test('should calculate Manhattan distance between sectors', () => {
      const targetSector = { x: 10, y: 12 };
      scene.init({ targetSector });
      
      const distance = (scene as any).calculateDistance();
      
      // From center (8,8) to (10,12) = |10-8| + |12-8| = 2 + 4 = 6
      expect(distance).toBe(6);
    });
  });

  describe('Manual Mode', () => {
    test('should initialize drift at zero', () => {
      const targetSector = { x: 5, y: 5 };
      gameStateManager.startNewGame(DifficultyLevel.WARRIOR);
      
      scene.init({ targetSector });
      
      expect((scene as any).driftX).toBe(0);
      expect((scene as any).driftY).toBe(0);
    });
  });

  describe('Auto-Pilot Mode', () => {
    test('should have fixed travel time for auto-pilot', () => {
      const targetSector = { x: 5, y: 5 };
      gameStateManager.startNewGame(DifficultyLevel.NOVICE);
      
      scene.init({ targetSector });
      
      expect((scene as any).travelTime).toBe(3.0);
    });
  });
});
