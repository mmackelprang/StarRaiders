import Phaser from 'phaser';
import { GameStateManager, GameStateType } from './GameStateManager';

export enum InputAction {
  SPEED_0 = 'SPEED_0',
  SPEED_1 = 'SPEED_1',
  SPEED_2 = 'SPEED_2',
  SPEED_3 = 'SPEED_3',
  SPEED_4 = 'SPEED_4',
  SPEED_5 = 'SPEED_5',
  SPEED_6 = 'SPEED_6',
  SPEED_7 = 'SPEED_7',
  SPEED_8 = 'SPEED_8',
  SPEED_9 = 'SPEED_9',
  VIEW_FORE = 'VIEW_FORE',
  VIEW_AFT = 'VIEW_AFT',
  GALACTIC_CHART = 'GALACTIC_CHART',
  LONG_RANGE_SCAN = 'LONG_RANGE_SCAN',
  HYPERSPACE = 'HYPERSPACE',
  TOGGLE_COMPUTER = 'TOGGLE_COMPUTER',
  TOGGLE_SHIELDS = 'TOGGLE_SHIELDS',
  FIRE_TORPEDO = 'FIRE_TORPEDO',
  DOCK = 'DOCK',
  PAUSE = 'PAUSE',
  NAV_UP = 'NAV_UP',
  NAV_DOWN = 'NAV_DOWN',
  NAV_LEFT = 'NAV_LEFT',
  NAV_RIGHT = 'NAV_RIGHT',
}

export class InputManager {
  private static instance: InputManager;
  private scene: Phaser.Scene | null = null;
  private eventEmitter: Phaser.Events.EventEmitter;
  private keyBindings: Map<number, InputAction>;
  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  private constructor() {
    this.eventEmitter = new Phaser.Events.EventEmitter();
    this.keyBindings = new Map();
    this.setupDefaultKeyBindings();
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  initialize(scene: Phaser.Scene): void {
    // Clean up previous scene's keyboard listeners first
    this.cleanup();
    
    this.scene = scene;
    
    // DIAGNOSTIC: Log listener count before setup
    console.log(`[InputManager] Initializing for scene: ${scene.scene.key}`);
    console.log(`[InputManager] EventEmitter listener count BEFORE setup:`, this.eventEmitter.listenerCount('action'));
    
    this.setupKeyboardListeners();
    this.setupGamepadListeners();
    
    // DIAGNOSTIC: Log listener count after setup
    console.log(`[InputManager] EventEmitter listener count AFTER setup:`, this.eventEmitter.listenerCount('action'));
  }
  
  /**
   * Clean up keyboard listeners from previous scene
   */
  cleanup(): void {
    if (this.scene && this.scene.input.keyboard && this.keydownHandler) {
      console.log('[InputManager] Cleaning up keyboard listener from previous scene');
      this.scene.input.keyboard.off('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.cursors = null;
  }

  private setupDefaultKeyBindings(): void {
    // Speed controls (0-9)
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.ZERO, InputAction.SPEED_0);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.ONE, InputAction.SPEED_1);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.TWO, InputAction.SPEED_2);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.THREE, InputAction.SPEED_3);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.FOUR, InputAction.SPEED_4);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.FIVE, InputAction.SPEED_5);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.SIX, InputAction.SPEED_6);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.SEVEN, InputAction.SPEED_7);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.EIGHT, InputAction.SPEED_8);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.NINE, InputAction.SPEED_9);

    // View controls
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.F, InputAction.VIEW_FORE);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.A, InputAction.VIEW_AFT);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.G, InputAction.GALACTIC_CHART);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.L, InputAction.LONG_RANGE_SCAN);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.H, InputAction.HYPERSPACE);

    // System toggles
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.T, InputAction.TOGGLE_COMPUTER);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.S, InputAction.TOGGLE_SHIELDS);

    // Combat
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.SPACE, InputAction.FIRE_TORPEDO);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.D, InputAction.DOCK);

    // Menu
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.ESC, InputAction.PAUSE);

    // Navigation
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.UP, InputAction.NAV_UP);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.DOWN, InputAction.NAV_DOWN);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.LEFT, InputAction.NAV_LEFT);
    this.keyBindings.set(Phaser.Input.Keyboard.KeyCodes.RIGHT, InputAction.NAV_RIGHT);
  }

  private setupKeyboardListeners(): void {
    if (!this.scene || !this.scene.input.keyboard) return;

    // DIAGNOSTIC: Log keyboard listener count before cleanup
    const keyboardListenerCount = this.scene.input.keyboard.listenerCount('keydown');
    console.log(`[InputManager] Keyboard 'keydown' listeners BEFORE cleanup: ${keyboardListenerCount}`);

    // Remove any existing listeners from previous scene
    this.scene.input.keyboard.removeAllListeners('keydown');

    // Set up cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Create and store the keydown handler so we can remove it later
    this.keydownHandler = (event: KeyboardEvent) => {
      const action = this.keyBindings.get(event.keyCode);
      if (action) {
        this.handleAction(action);
      }
    };

    // Listen to all key down events
    this.scene.input.keyboard.on('keydown', this.keydownHandler);
    
    // DIAGNOSTIC: Log keyboard listener count after setup
    console.log(`[InputManager] Keyboard 'keydown' listeners AFTER setup: ${this.scene.input.keyboard.listenerCount('keydown')}`);
  }

  private setupGamepadListeners(): void {
    if (!this.scene || !this.scene.input.gamepad) return;

    this.scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
    });
  }

  update(): void {
    if (!this.scene) return;

    // Handle continuous navigation input (arrow keys)
    if (this.cursors) {
      const navX = this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0;
      const navY = this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0;

      if (navX !== 0 || navY !== 0) {
        this.eventEmitter.emit('navigation', navX, navY);
      }
    }

    // Handle gamepad input
    if (this.gamepad) {
      const leftStick = this.gamepad.leftStick;
      if (leftStick.x !== 0 || leftStick.y !== 0) {
        this.eventEmitter.emit('navigation', leftStick.x, -leftStick.y);
      }

      // Gamepad button mapping - will be implemented when needed
      // Button API varies by Phaser version, so we'll add this later
    }
  }

  private handleAction(action: InputAction): void {
    // Check if action is valid for current game state
    const gameState = GameStateManager.getInstance().getCurrentState();
    
    if (!this.isActionValidForState(action, gameState)) {
      return;
    }

    this.eventEmitter.emit('action', action);

    // Emit specific action event
    this.eventEmitter.emit(action);
  }

  private isActionValidForState(action: InputAction, state: GameStateType): boolean {
    // PAUSE is always valid
    if (action === InputAction.PAUSE) return true;

    // Most actions only valid during PLAYING
    if (state === GameStateType.PLAYING) return true;

    // Some actions valid in GALACTIC_CHART
    if (state === GameStateType.GALACTIC_CHART) {
      return [
        InputAction.GALACTIC_CHART, // to close
        InputAction.HYPERSPACE,
        InputAction.VIEW_FORE,
        InputAction.VIEW_AFT,
        InputAction.LONG_RANGE_SCAN,
        InputAction.NAV_UP,
        InputAction.NAV_DOWN,
        InputAction.NAV_LEFT,
        InputAction.NAV_RIGHT,
      ].includes(action);
    }

    return false;
  }

  on(event: string | InputAction, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
    
    // DIAGNOSTIC: Log total listener count
    const totalListeners = this.eventEmitter.eventNames().reduce((sum, name) => {
      return sum + this.eventEmitter.listenerCount(name as string);
    }, 0);
    console.log(`[InputManager] Total EventEmitter listeners after 'on': ${totalListeners}`);
  }

  off(event: string | InputAction, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
    
    // DIAGNOSTIC: Log total listener count
    const totalListeners = this.eventEmitter.eventNames().reduce((sum, name) => {
      return sum + this.eventEmitter.listenerCount(name as string);
    }, 0);
    console.log(`[InputManager] Total EventEmitter listeners after 'off': ${totalListeners}`);
  }
  
  /**
   * Remove all listeners for a specific event
   * Use this in scene shutdown to prevent memory leaks
   */
  removeAllListeners(event?: string | InputAction): void {
    if (event) {
      this.eventEmitter.removeAllListeners(event as string);
      console.log(`[InputManager] Removed all listeners for event: ${event}`);
    } else {
      this.eventEmitter.removeAllListeners();
      console.log('[InputManager] Removed ALL listeners from EventEmitter');
    }
    
    // DIAGNOSTIC: Log total listener count
    const totalListeners = this.eventEmitter.eventNames().reduce((sum, name) => {
      return sum + this.eventEmitter.listenerCount(name as string);
    }, 0);
    console.log(`[InputManager] Total EventEmitter listeners after removeAllListeners: ${totalListeners}`);
  }

  // For optional key rebinding feature
  rebindKey(action: InputAction, newKeyCode: number): void {
    // Remove old binding
    for (const [key, value] of this.keyBindings.entries()) {
      if (value === action) {
        this.keyBindings.delete(key);
        break;
      }
    }
    // Add new binding
    this.keyBindings.set(newKeyCode, action);
  }

  getKeyForAction(action: InputAction): number | undefined {
    for (const [key, value] of this.keyBindings.entries()) {
      if (value === action) {
        return key;
      }
    }
    return undefined;
  }
}
