# TS_PROJECTPLAN – Star Raiders (TypeScript, Phaser 3)

**Version:** 1.0  
**Date:** December 18, 2025  
**Framework:** Phaser 3 + TypeScript  
**Target Folder:** `/ts_src`

---

## Overview

This comprehensive project plan breaks down the Star Raiders recreation into 18 iterative phases, sized for efficient implementation by a coding assistant. All TypeScript code will be placed in the `/ts_src` folder. Each phase includes:

- **Phase Status**: Track completion state across sessions
- **Context**: Essential information from reference documents to prevent hallucinations
- **Prompt**: Clear, actionable coding instructions with explicit deliverables
- **Testing & Documentation**: Quality assurance requirements

---

## Document Navigation

### Reference Documents (Must Read)
- `README.md` - Project overview and navigation
- `Star_Raiders_PRD.md` - Complete product requirements (28 sections, 50+ pages)
- `QUICKSTART_DEVELOPER_GUIDE.md` - Quick reference tables and statistics
- `star_raiders_technical_notes.txt` - Technical architecture and algorithms
- `star_raiders_visual_mockups.txt` - Screen layouts and UI specifications
- `star_raiders_visual_reference.txt` - Visual design principles

### Key Measurements (from QUICKSTART)
- **Metron**: Distance unit
- **Centon**: Time unit (100 centons ≈ 1 minute)
- **Galaxy**: 16×16 sectors (256 total)
- **Speed Levels**: 0-9 (0-43 metrons/second)
- **Max Energy**: ~7000 units
- **Optimal Cruise Speed**: 6 (12 metrons/second, 8 energy/sec)

---

## Phase Summary Table

| Phase | Name | Status | Dependencies | Est. Time |
|-------|------|--------|--------------|-----------|
| 0 | Project Setup & Structure | ⬜ Not Started | None | 1-2 hours |
| 1 | Build System & Core Config | ⬜ Not Started | Phase 0 | 2-3 hours |
| 2 | Game Loop & State Machine | ⬜ Not Started | Phase 1 | 3-4 hours |
| 3 | Input System | ⬜ Not Started | Phase 2 | 2-3 hours |
| 4 | Galaxy Data Model | ⬜ Not Started | Phase 2 | 3-4 hours |
| 5 | Starfield & Basic Rendering | ⬜ Not Started | Phase 2 | 3-4 hours |
| 6 | Galactic Chart Screen | ⬜ Not Started | Phases 4, 5 | 4-5 hours |
| 7 | Title & UI Screens | ⬜ Not Started | Phases 3, 5 | 3-4 hours |
| 8 | 3D Vector Rendering | ⬜ Not Started | Phase 5 | 4-5 hours |
| 9 | Fore/Aft Combat Views | ⬜ Not Started | Phases 3, 8 | 4-5 hours |
| 10 | Combat System & Torpedoes | ⬜ Not Started | Phase 9 | 4-5 hours |
| 11 | PESCLR Damage System | ⬜ Not Started | Phase 10 | 3-4 hours |
| 12 | Energy Management | ⬜ Not Started | Phases 10, 11 | 2-3 hours |
| 13 | Enemy AI - Basic | ⬜ Not Started | Phases 4, 8 | 5-6 hours |
| 14 | Enemy AI - Advanced | ⬜ Not Started | Phase 13 | 4-5 hours |
| 15 | Hyperspace Navigation | ⬜ Not Started | Phases 4, 6 | 4-5 hours |
| 16 | Starbase System | ⬜ Not Started | Phases 4, 14 | 3-4 hours |
| 17 | Long-Range Scan & Ranking | ⬜ Not Started | Phases 4, 6 | 3-4 hours |
| 18 | Audio, Polish & Testing | ⬜ Not Started | All Phases | 5-6 hours |

**Total Estimated Time**: 60-75 hours (distributed across multiple sessions)

---

## Phase Status Legend

- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⚠️ Blocked/Issues
- 📝 Documentation Only

---

## Phase 0 – Project Setup & Structure

### Status: ⬜ Not Started

### Context
From **Star_Raiders_PRD.md Section 23** and **QUICKSTART Section 9**:
- Target: TypeScript + Phaser 3 (Community Edition, free)
- Architecture: Modular systems with clear separation
- All code in `/ts_src` folder
- Recommended structure: scenes, entities, systems, utils, types

From **star_raiders_technical_notes.txt Section 23**:
- Scene-based architecture (Bootstrap → Game scenes)
- Feature systems in separate modules
- Data-driven design with JSON configs

### Objectives
1. Initialize TypeScript/Phaser 3 project structure
2. Configure build tooling (Webpack/Vite/Parcel)
3. Set up folder hierarchy
4. Create base type definitions
5. Configure linting and formatting

### Deliverables

#### Folder Structure
```
/ts_src
  /assets          # Game assets (images, sounds, data)
    /images        # Sprite sheets, UI elements
    /audio         # Sound effects, music
    /data          # JSON configs (galaxy, difficulty, ranks)
  /scenes          # Phaser scenes
    /Boot.ts       # Initial scene
    /Title.ts      # Title screen
    /Game.ts       # Main gameplay scene
    /GalacticChart.ts
    /Hyperspace.ts
    /GameOver.ts
    /Ranking.ts
  /entities        # Game objects
    /Player.ts
    /Enemy.ts
    /Starbase.ts
    /Torpedo.ts
  /systems         # Game systems
    /GalaxyManager.ts
    /InputManager.ts
    /AudioManager.ts
    /CombatSystem.ts
    /EnergySystem.ts
    /PESCLRSystem.ts
    /AISystem.ts
  /ui              # UI components
    /HUD.ts
    /LockIndicators.ts
    /StatusDisplay.ts
  /utils           # Utilities
    /Math.ts       # Distance calculations, etc.
    /Constants.ts  # Game constants
    /Types.ts      # TypeScript type definitions
  /config          # Configuration
    /GameConfig.ts # Phaser configuration
    /DifficultyConfig.ts
  index.html       # Entry HTML
  main.ts          # Application entry point
```

#### Required Files

**package.json** (minimum dependencies):
```json
{
  "name": "star-raiders-ts",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./ts_src"
  },
  "include": ["ts_src/**/*"],
  "exclude": ["node_modules"]
}
```

**ts_src/main.ts** (minimal bootstrap):
```typescript
import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

const game = new Phaser.Game(GameConfig);
```

**ts_src/config/GameConfig.ts**:
```typescript
import Phaser from 'phaser';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: []  // Will add scenes in later phases
};
```

**ts_src/utils/Constants.ts** (from QUICKSTART):
```typescript
// Galaxy
export const GALAXY_SIZE = 16; // 16x16 sectors
export const TOTAL_SECTORS = 256;

// Speed levels (metrons/second)
export const SPEED_TABLE = [0, 2, 4, 8, 10, 11, 12, 20, 30, 43];

// Energy costs (per second)
export const ENERGY_COST_TABLE = [0, 2, 2, 2, 5, 5, 8, 12, 18, 30];

// Game timing
export const CENTONS_PER_MINUTE = 100;
export const STARBASE_ATTACK_TIMER = 100; // centons

// Energy
export const MAX_ENERGY = 7000;
export const CRITICAL_ENERGY = 500;
export const LOW_ENERGY = 1000;

// Difficulty levels
export enum DifficultyLevel {
  NOVICE = 'NOVICE',
  PILOT = 'PILOT',
  WARRIOR = 'WARRIOR',
  COMMANDER = 'COMMANDER'
}

// System states (PESCLR)
export enum SystemStatus {
  OPERATIONAL = 'OPERATIONAL',
  DAMAGED = 'DAMAGED',
  DESTROYED = 'DESTROYED'
}

// Enemy types
export enum EnemyType {
  FIGHTER = 'FIGHTER',
  CRUISER = 'CRUISER',
  BASESTAR = 'BASESTAR'
}
```

**ts_src/utils/Types.ts** (core type definitions):
```typescript
import { DifficultyLevel, SystemStatus, EnemyType } from './Constants';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D extends Vector2D {
  z: number;
}

export interface SectorCoord {
  x: number;
  y: number;
}

export interface ShipSystems {
  photon: SystemStatus;
  engines: SystemStatus;
  shields: SystemStatus;
  computer: SystemStatus;
  longRange: SystemStatus;
  radio: SystemStatus;
}

// Note: Import SystemStatus and GALAXY_SIZE in GameStateManager for the implementation

export interface PlayerState {
  position: Vector3D;
  velocity: number;
  energy: number;
  kills: number;
  sector: SectorCoord;
  systems: ShipSystems;
  shieldsActive: boolean;
  computerActive: boolean;
}

export interface GameState {
  player: PlayerState;
  difficulty: DifficultyLevel;
  missionTime: number; // centons
  score: number;
  gameActive: boolean;
}
```

### Testing Requirements
- ✅ Project builds successfully with `npm run build`
- ✅ Dev server runs with `npm run dev`
- ✅ Browser opens and displays Phaser canvas (black screen expected)
- ✅ No TypeScript compilation errors
- ✅ All folders created in `/ts_src`

### Documentation
- Update README.md with:
  - Installation instructions (`npm install`)
  - Development server instructions (`npm run dev`)
  - Build instructions (`npm run build`)
  - Folder structure explanation

---

## Phase 1 – Build System & Core Configuration

### Status: ⬜ Not Started

### Dependencies
- Phase 0 completed

### Context
From **star_raiders_technical_notes.txt Section 22** and **Star_Raiders_PRD.md Section 24**:
- Build should produce single-page application
- Support for hot reload during development
- Production build should be optimized and minified
- Asset loading pipeline for images and audio
- Environment-specific configurations

### Objectives
1. Configure Vite build system
2. Set up asset loading
3. Add development utilities
4. Configure debugging tools
5. Set up testing framework

### Deliverables

#### Vite Configuration
**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './ts_src'),
      '@assets': path.resolve(__dirname, './ts_src/assets'),
      '@scenes': path.resolve(__dirname, './ts_src/scenes'),
      '@entities': path.resolve(__dirname, './ts_src/entities'),
      '@systems': path.resolve(__dirname, './ts_src/systems'),
      '@ui': path.resolve(__dirname, './ts_src/ui'),
      '@utils': path.resolve(__dirname, './ts_src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

#### Asset Loader
**ts_src/utils/AssetLoader.ts**:
```typescript
import Phaser from 'phaser';

export class AssetLoader {
  static preloadImages(scene: Phaser.Scene): void {
    // Placeholder - will add actual assets in later phases
    // Example: scene.load.image('player', 'assets/images/player.png');
  }

  static preloadAudio(scene: Phaser.Scene): void {
    // Placeholder - will add actual audio in Phase 18
    // Example: scene.load.audio('torpedo', 'assets/audio/torpedo.wav');
  }

  static preloadData(scene: Phaser.Scene): void {
    // Load JSON configuration files
    // Example: scene.load.json('difficulty', 'assets/data/difficulty.json');
  }
}
```

#### Debug Utilities
**ts_src/utils/Debug.ts**:
```typescript
export class Debug {
  private static enabled = process.env.NODE_ENV === 'development';

  static log(...args: any[]): void {
    if (this.enabled) {
      console.log('[StarRaiders]', ...args);
    }
  }

  static warn(...args: any[]): void {
    if (this.enabled) {
      console.warn('[StarRaiders]', ...args);
    }
  }

  static error(...args: any[]): void {
    console.error('[StarRaiders]', ...args);
  }

  static drawBounds(graphics: Phaser.GameObjects.Graphics, bounds: Phaser.Geom.Rectangle): void {
    if (this.enabled) {
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.strokeRectShape(bounds);
    }
  }
}
```

#### Environment Configuration
**ts_src/config/Environment.ts**:
```typescript
export const Environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  version: '1.0.0',
  targetFPS: 60,
  debugMode: process.env.NODE_ENV === 'development',
};
```

#### Testing Setup (Jest)
**package.json** (add to devDependencies):
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/ts_src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/ts_src/$1',
  },
};
```

### Testing Requirements
- ✅ Build produces optimized bundle in /dist
- ✅ Dev server has hot reload working
- ✅ Debug.log() messages appear in development console
- ✅ Jest test runner executes successfully
- ✅ Asset paths resolve correctly

### Documentation
- Add section to README explaining:
  - Build process
  - Development vs production modes
  - Debug utilities
  - Testing framework

---

## Phase 2 – Game Loop & State Machine

### Status: ⬜ Not Started

### Dependencies
- Phase 1 completed

### Context
From **Star_Raiders_PRD.md Section 6** and **star_raiders_technical_notes.txt Section 2**:

**Game States:**
- TITLE - Title screen with difficulty selection
- PLAYING - Active gameplay
- PAUSED - Game paused
- GALACTIC_CHART - Strategic overlay view
- HYPERSPACE - Warp travel animation
- GAME_OVER - Mission end screen
- RANKING - Score and rank display

**Timing System:**
- Target: 60 FPS (16.67ms per frame)
- Centon timer: 100 centons ≈ 1 minute game time
- Mission time tracking in centons

### Objectives
1. Implement game state machine
2. Create timing system (centons)
3. Set up scene management
4. Add pause/resume functionality
5. Create event system for state changes

### Deliverables

#### Game State Manager
**ts_src/systems/GameStateManager.ts**:
```typescript
import Phaser from 'phaser';
import { DifficultyLevel } from '@utils/Constants';
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
```

#### Centon Timer
**ts_src/systems/CentonTimer.ts**:
```typescript
import Phaser from 'phaser';
import { CENTONS_PER_MINUTE } from '@utils/Constants';

export class CentonTimer {
  private centons: number = 0;
  private lastUpdateTime: number = 0;
  private running: boolean = false;
  private eventEmitter: Phaser.Events.EventEmitter;

  constructor() {
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  start(): void {
    this.running = true;
    this.lastUpdateTime = Date.now();
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.centons = 0;
    this.lastUpdateTime = Date.now();
  }

  update(): void {
    if (!this.running) return;

    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // 100 centons per minute = 100 centons per 60 seconds
    const deltaCentons = deltaSeconds * (CENTONS_PER_MINUTE / 60);
    this.centons += deltaCentons;

    this.eventEmitter.emit('centonUpdate', this.centons);
  }

  getCentons(): number {
    return Math.floor(this.centons);
  }

  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }
}
```

#### Boot Scene (Initial scene)
**ts_src/scenes/Boot.ts**:
```typescript
import Phaser from 'phaser';
import { GameStateManager } from '@systems/GameStateManager';
import { AssetLoader } from '@utils/AssetLoader';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Load essential assets
    AssetLoader.preloadImages(this);
    AssetLoader.preloadAudio(this);
    AssetLoader.preloadData(this);
  }

  create(): void {
    // Initialize game state manager
    const gameStateManager = GameStateManager.getInstance();
    
    // Transition to title screen
    this.scene.start('Title');
  }
}
```

#### Update GameConfig
**ts_src/config/GameConfig.ts** (update with scenes):
```typescript
import Phaser from 'phaser';
import { BootScene } from '@scenes/Boot';
// More scenes will be added in later phases

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: [BootScene] // Will add more scenes
};
```

### Testing Requirements
- ✅ Game initializes and shows Boot scene
- ✅ GameStateManager is singleton (same instance everywhere)
- ✅ State transitions emit events correctly
- ✅ CentonTimer counts at correct rate (100 centons per minute)
- ✅ Pause/Resume stops and starts timer correctly

### Unit Tests
**ts_src/systems/__tests__/GameStateManager.test.ts**:
```typescript
import { GameStateManager, GameStateType } from '../GameStateManager';
import { DifficultyLevel } from '@utils/Constants';

describe('GameStateManager', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    manager = GameStateManager.getInstance();
  });

  test('should start in TITLE state', () => {
    expect(manager.getCurrentState()).toBe(GameStateType.TITLE);
  });

  test('should transition to PLAYING when starting new game', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    expect(manager.getCurrentState()).toBe(GameStateType.PLAYING);
  });

  test('should emit stateChange event', (done) => {
    manager.on('stateChange', (oldState: GameStateType, newState: GameStateType) => {
      expect(oldState).toBe(GameStateType.TITLE);
      expect(newState).toBe(GameStateType.PLAYING);
      done();
    });
    manager.startNewGame(DifficultyLevel.NOVICE);
  });

  test('should pause and resume game', () => {
    manager.startNewGame(DifficultyLevel.NOVICE);
    manager.pauseGame();
    expect(manager.getCurrentState()).toBe(GameStateType.PAUSED);
    manager.resumeGame();
    expect(manager.getCurrentState()).toBe(GameStateType.PLAYING);
  });
});
```

### Documentation
- Add section to README explaining:
  - Game state flow diagram
  - Centon timing system
  - Event system usage
  - How to add new game states

---

## Phase 3 – Input System

### Status: ⬜ Not Started

### Dependencies
- Phase 2 completed

### Context
From **Star_Raiders_PRD.md Section 19** and **QUICKSTART Section 2** (Controls):

**Primary Controls:**
- **0-9**: Set velocity (speed levels)
- **F**: Fore view
- **A**: Aft view
- **G**: Galactic chart
- **L**: Long-range scan
- **H**: Hyperspace
- **T**: Toggle tracking computer
- **S**: Toggle shields
- **FIRE** (Space): Photon torpedoes
- **Arrow Keys/Joystick**: Navigation
- **ESC**: Pause/Menu

**Requirements:**
- Keyboard support (primary)
- Gamepad support (secondary)
- Rebindable keys (optional but recommended)
- Input queuing for rapid commands
- State-aware (different inputs active in different game states)

### Objectives
1. Create input manager system
2. Map all control keys
3. Add gamepad support
4. Implement input event system
5. Add rebinding capability (optional UI in later phase)

### Deliverables

#### Input Manager
**ts_src/systems/InputManager.ts**:
```typescript
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

interface KeyBinding {
  action: InputAction;
  keyCode: number;
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

      // Gamepad button mapping (example)
      if (this.gamepad.A && Phaser.Input.Gamepad.Button.justDown(this.gamepad.A)) {
        this.handleAction(InputAction.FIRE_TORPEDO);
      }
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
```

#### Input Constants
**ts_src/utils/InputConstants.ts**:
```typescript
export const DEFAULT_KEY_NAMES: { [key: number]: string } = {
  [Phaser.Input.Keyboard.KeyCodes.ZERO]: '0',
  [Phaser.Input.Keyboard.KeyCodes.ONE]: '1',
  [Phaser.Input.Keyboard.KeyCodes.TWO]: '2',
  [Phaser.Input.Keyboard.KeyCodes.THREE]: '3',
  [Phaser.Input.Keyboard.KeyCodes.FOUR]: '4',
  [Phaser.Input.Keyboard.KeyCodes.FIVE]: '5',
  [Phaser.Input.Keyboard.KeyCodes.SIX]: '6',
  [Phaser.Input.Keyboard.KeyCodes.SEVEN]: '7',
  [Phaser.Input.Keyboard.KeyCodes.EIGHT]: '8',
  [Phaser.Input.Keyboard.KeyCodes.NINE]: '9',
  [Phaser.Input.Keyboard.KeyCodes.F]: 'F',
  [Phaser.Input.Keyboard.KeyCodes.A]: 'A',
  [Phaser.Input.Keyboard.KeyCodes.G]: 'G',
  [Phaser.Input.Keyboard.KeyCodes.L]: 'L',
  [Phaser.Input.Keyboard.KeyCodes.H]: 'H',
  [Phaser.Input.Keyboard.KeyCodes.T]: 'T',
  [Phaser.Input.Keyboard.KeyCodes.S]: 'S',
  [Phaser.Input.Keyboard.KeyCodes.SPACE]: 'SPACE',
  [Phaser.Input.Keyboard.KeyCodes.ESC]: 'ESC',
  [Phaser.Input.Keyboard.KeyCodes.UP]: '↑',
  [Phaser.Input.Keyboard.KeyCodes.DOWN]: '↓',
  [Phaser.Input.Keyboard.KeyCodes.LEFT]: '←',
  [Phaser.Input.Keyboard.KeyCodes.RIGHT]: '→',
};
```

### Testing Requirements
- ✅ All 20+ key bindings registered correctly
- ✅ InputManager is singleton
- ✅ Events emitted for each action
- ✅ Navigation (arrow keys) provides continuous input
- ✅ Gamepad detection and mapping works
- ✅ State-aware: invalid actions filtered based on game state
- ✅ Key rebinding changes bindings correctly

### Unit Tests
**ts_src/systems/__tests__/InputManager.test.ts**:
```typescript
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
    manager.on(InputAction.FIRE_TORPEDO, () => {
      done();
    });
    // Simulate action (in real test, would trigger key event)
    manager['handleAction'](InputAction.FIRE_TORPEDO);
  });

  test('should map speed keys correctly', () => {
    const speedKeys = [
      InputAction.SPEED_0,
      InputAction.SPEED_1,
      InputAction.SPEED_2,
      // ... etc
    ];
    speedKeys.forEach(action => {
      const keyCode = manager.getKeyForAction(action);
      expect(keyCode).toBeDefined();
    });
  });
});
```

### Documentation
- Update README with:
  - Complete key binding list
  - Gamepad button mapping
  - How to listen for input events
  - Key rebinding instructions

---

*[Phases 4-18 will be detailed in subsequent sections. Each phase follows the same structure: Status, Dependencies, Context, Objectives, Deliverables, Testing Requirements, and Documentation.]*

---

## Phases 4-18 Overview (Brief Summary)

### Phase 4 – Galaxy Data Model
- GalaxyManager with 16×16 sector grid
- Difficulty configurations (enemy counts, starbase counts)
- Sector types and entity management
- Save/load JSON serialization

### Phase 5 – Starfield & Basic Rendering
- 4-layer parallax starfield
- Basic Phaser rendering pipeline
- Camera system
- Sprite management

### Phase 6 – Galactic Chart Screen
- 16×16 grid display
- Player cursor with sector highlighting
- Enemy and starbase icons
- Time and statistics HUD

### Phase 7 – Title & UI Screens
- Title screen with difficulty selection
- Game Over screen
- Ranking screen with 20 ranks
- Menu navigation

### Phase 8 – 3D Vector Rendering
- Enemy ship rendering (triangular shapes)
- Distance-based scaling
- Depth sorting
- 3D to 2D projection math

### Phase 9 – Fore/Aft Combat Views
- Combat view scene
- Enemy positioning in 3D space
- Lock indicators (3 crosshairs)
- Range display

### Phase 10 – Combat System & Torpedoes
- Torpedo firing and physics
- Collision detection
- Damage calculation
- Explosion effects

### Phase 11 – PESCLR Damage System
- 6 ship systems (Photon, Engines, Shields, Computer, Long-range, Radio)
- 3 states per system (Operational, Damaged, Destroyed)
- Damage probability and effects
- System degradation

### Phase 12 – Energy Management
- Energy consumption by system
- Energy depletion mechanics
- Critical energy warnings
- Velocity-based energy costs

### Phase 13 – Enemy AI - Basic
- Enemy ship entity classes
- Basic movement and positioning
- Formation patterns
- Sector-to-sector navigation

### Phase 14 – Enemy AI - Advanced
- Strategic galaxy-level AI
- Starbase targeting and attack coordination
- Group behavior
- Difficulty scaling

### Phase 15 – Hyperspace Navigation
- Hyperspace screen and animation
- Auto-pilot (Novice/Pilot)
- Manual navigation (Warrior/Commander)
- Energy cost calculation

### Phase 16 – Starbase System
- Starbase entities
- Docking mechanics
- Repair and refuel
- Attack countdown system

### Phase 17 – Long-Range Scan & Ranking
- Long-Range Scan screen (radar view)
- Score calculation
- 20-rank progression system
- Mission completion logic

### Phase 18 – Audio, Polish & Testing
- Sound effect implementation
- Background music
- Visual polish (particles, effects)
- Comprehensive testing suite
- Performance optimization

---

## Development Guidelines

### Code Quality Standards
1. **TypeScript Strict Mode**: All code must compile with strict type checking
2. **ESLint**: Follow Airbnb TypeScript style guide
3. **Documentation**: JSDoc comments for all public APIs
4. **Testing**: Minimum 70% code coverage
5. **Performance**: Maintain 60 FPS on target hardware

### Git Workflow
1. **Commits**: Small, focused commits with clear messages
2. **Branches**: Feature branches for each phase
3. **Pull Requests**: Code review before merging
4. **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)

### Asset Management
1. **Images**: PNG format, power-of-2 dimensions when possible
2. **Audio**: OGG format for web compatibility
3. **Data**: JSON for all configuration files
4. **Naming**: lowercase-with-dashes.ext

### Performance Targets (from QUICKSTART Section 9)
- **Frame Rate**: 60 FPS minimum
- **Memory**: < 512MB RAM
- **Load Time**: < 3 seconds initial load
- **Input Latency**: < 16ms

---

## Testing Strategy

### Unit Tests (Jest)
- Test all systems independently
- Mock Phaser dependencies
- Aim for 70%+ coverage
- Run with `npm test`

### Integration Tests
- Test scene transitions
- Test system interactions
- Test complete gameplay loops
- Run in headless browser

### Manual Testing Checklist (Per Phase)
- ✅ Visual inspection in browser
- ✅ Test all controls
- ✅ Check performance (FPS counter)
- ✅ Test on different resolutions
- ✅ Verify against PRD specifications

### End-to-End Testing (Phase 18)
- Complete missions on all 4 difficulty levels
- Verify all 20 ranks achievable
- Test all 8 screens
- Performance profiling
- Cross-browser testing

---

## Success Criteria

### Phase Completion Criteria
Each phase is considered complete when:
1. ✅ All deliverables implemented
2. ✅ Unit tests passing (if applicable)
3. ✅ Manual testing successful
4. ✅ Code reviewed and documented
5. ✅ No critical bugs
6. ✅ Performance targets met

### Project Completion Criteria
Project is complete when:
1. ✅ All 18 phases completed
2. ✅ 100% feature parity with original game
3. ✅ All 4 difficulty levels working correctly
4. ✅ Complete mission on Commander difficulty possible
5. ✅ All 20 ranks achievable
6. ✅ Performance targets met
7. ✅ Comprehensive documentation
8. ✅ Test coverage > 70%

---

## Risk Management

### Technical Risks
1. **Phaser 3 Performance**: Mitigate with object pooling and culling
2. **AI Complexity**: Break into phases, test incrementally
3. **3D Rendering in 2D Engine**: Use proven projection algorithms
4. **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge

### Schedule Risks
1. **Scope Creep**: Stick to PRD, no feature additions
2. **Phase Dependencies**: Can't skip phases, must complete in order
3. **Bug Discovery**: Allocate 20% time buffer for fixes

### Quality Risks
1. **Authenticity**: Constant reference to original game
2. **Balance**: Test difficulty scaling extensively
3. **Performance**: Profile early and often

---

## FAQ for Coding Assistant

### Q: What if I encounter Phaser-specific issues?
**A:** Consult Phaser 3 official documentation (https://photonstorm.github.io/phaser3-docs/) and examples (https://phaser.io/examples). Phaser has extensive community support.

### Q: Should I implement features not in the PRD?
**A:** No. Stick strictly to the specifications in the PRD documents. All original features must be implemented; no new features should be added.

### Q: What if a phase seems too large?
**A:** Break it into sub-tasks but keep the overall phase structure. Complete all sub-tasks before marking phase complete.

### Q: How do I handle save/load persistence?
**A:** Use browser LocalStorage for web builds. Serialize game state to JSON. See Phase 4 for data structures.

### Q: What about mobile support?
**A:** Initial focus is desktop/web. Mobile touch controls can be added as post-release enhancement.

### Q: How faithful should the AI be to the original?
**A:** 100% behavioral fidelity. Enemy movement, attack patterns, and difficulty scaling must match the original precisely. Reference the technical notes for algorithms.

---

## Appendix A: Quick Reference Links

### Context Documents
- [README.md](README.md) - Project overview
- [Star_Raiders_PRD.md](Star_Raiders_PRD.md) - Complete specifications
- [QUICKSTART_DEVELOPER_GUIDE.md](QUICKSTART_DEVELOPER_GUIDE.md) - Quick reference
- [star_raiders_technical_notes.txt](star_raiders_technical_notes.txt) - Algorithms
- [star_raiders_visual_mockups.txt](star_raiders_visual_mockups.txt) - UI layouts
- [star_raiders_visual_reference.txt](star_raiders_visual_reference.txt) - Visual design

### External Resources
- Phaser 3 Docs: https://photonstorm.github.io/phaser3-docs/
- Phaser 3 Examples: https://phaser.io/examples
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Vite Guide: https://vitejs.dev/guide/

---

## Appendix B: Glossary

- **Metron**: Unit of distance in Star Raiders
- **Centon**: Unit of time (100 centons ≈ 1 minute)
- **PESCLR**: Ship systems acronym (Photon, Engines, Shields, Computer, Long-range, Radio)
- **Zylon**: Enemy faction in Star Raiders
- **Sector**: One cell in the 16×16 galaxy grid
- **Squadron**: Group of enemy ships moving together

---

## Document Maintenance

This document should be updated:
- When a phase is completed (update status)
- When deliverables change
- When new risks are identified
- When testing reveals missing requirements

**Last Updated**: December 18, 2025  
**Version**: 1.0  
**Status**: Initial Release

---

**🚀 Ready to begin? Start with Phase 0 to set up the project structure!**
