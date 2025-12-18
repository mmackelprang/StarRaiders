// Mock Phaser before importing
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
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        F: 70,
        A: 65,
        G: 71,
        L: 76,
        H: 72,
        T: 84,
        S: 83,
        SPACE: 32,
        ESC: 27,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
      }
    }
  }
}));

import { InputManager, InputAction } from '../InputManager';

describe('InputManager', () => {
  let manager: InputManager;

  beforeEach(() => {
    manager = InputManager.getInstance();
  });

  test('should be singleton', () => {
    const manager2 = InputManager.getInstance();
    expect(manager).toBe(manager2);
  });

  test('should emit action events', (done) => {
    // First set game state to PLAYING so action is valid
    const GameStateManager = require('../GameStateManager').GameStateManager;
    const GameStateType = require('../GameStateManager').GameStateType;
    const gsm = GameStateManager.getInstance();
    gsm.setState(GameStateType.PLAYING);
    
    manager.on(InputAction.FIRE_TORPEDO, () => {
      done();
    });
    // Simulate action directly (access private method for testing)
    (manager as any).handleAction(InputAction.FIRE_TORPEDO);
  });

  test('should map speed keys correctly', () => {
    const speedKeys = [
      InputAction.SPEED_0,
      InputAction.SPEED_1,
      InputAction.SPEED_2,
      InputAction.SPEED_3,
      InputAction.SPEED_4,
      InputAction.SPEED_5,
      InputAction.SPEED_6,
      InputAction.SPEED_7,
      InputAction.SPEED_8,
      InputAction.SPEED_9,
    ];
    speedKeys.forEach(action => {
      const keyCode = manager.getKeyForAction(action);
      expect(keyCode).toBeDefined();
    });
  });

  test('should rebind keys', () => {
    const originalKey = manager.getKeyForAction(InputAction.FIRE_TORPEDO);
    const newKeyCode = 999;
    
    manager.rebindKey(InputAction.FIRE_TORPEDO, newKeyCode);
    
    const updatedKey = manager.getKeyForAction(InputAction.FIRE_TORPEDO);
    expect(updatedKey).toBe(newKeyCode);
    expect(updatedKey).not.toBe(originalKey);
  });

  test('should have key bindings for all view controls', () => {
    expect(manager.getKeyForAction(InputAction.VIEW_FORE)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.VIEW_AFT)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.GALACTIC_CHART)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.LONG_RANGE_SCAN)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.HYPERSPACE)).toBeDefined();
  });

  test('should have key bindings for system toggles', () => {
    expect(manager.getKeyForAction(InputAction.TOGGLE_COMPUTER)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.TOGGLE_SHIELDS)).toBeDefined();
  });

  test('should have navigation key bindings', () => {
    expect(manager.getKeyForAction(InputAction.NAV_UP)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.NAV_DOWN)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.NAV_LEFT)).toBeDefined();
    expect(manager.getKeyForAction(InputAction.NAV_RIGHT)).toBeDefined();
  });
});
