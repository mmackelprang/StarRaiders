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
    this.scene = scene;
    this.setupKeyboardListeners();
    this.setupGamepadListeners();
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

    // Set up cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Listen to all key down events
    this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      const action = this.keyBindings.get(event.keyCode);
      if (action) {
        this.handleAction(action);
      }
    });
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
  }

  off(event: string | InputAction, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
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
