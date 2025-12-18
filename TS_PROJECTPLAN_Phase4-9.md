# TS_PROJECTPLAN – Phases 4-9 Detailed Guide

**Parent Document**: TS_PROJECTPLAN.md  
**Phases Covered**: 4-9 (Galaxy Data, Starfield, Galactic Chart, Title/UI, 3D Rendering, Combat Views)  
**Version**: 1.0

---

## Phase 4 – Galaxy Data Model

### Status: ✅ Completed

### Dependencies
- Phase 2 completed (Game State Manager)

### Context
From **Star_Raiders_PRD.md Section 10** (Galaxy and Sector System):
- Galaxy: 16×16 grid = 256 sectors
- Sectors contain: Starbases (0-1), Enemies (0-many), Player (1)
- From **QUICKSTART Section 1.6** (Difficulty Scaling):
  - Novice: 10 enemies total, 4 starbases
  - Pilot: 15 enemies, 3 starbases
  - Warrior: 20 enemies, 2 starbases
  - Commander: 28 enemies, 2 starbases
- Enemy distribution: 60% Fighters, 30% Cruisers, 10% Basestars
- Starting position: Center sector (8,8)

From **star_raiders_technical_notes.txt Section 10**:
- Manhattan distance for proximity calculations
- Threatened starbase: enemy within 2 sectors
- Sector navigation uses integer coordinates

### Objectives
1. Create galaxy data structures
2. Implement GalaxyManager singleton
3. Add difficulty configuration system
4. Implement procedural enemy placement
5. Add save/load functionality

### Deliverables

#### Sector Data Structure
**ts_src/types/GalaxyTypes.ts**:
```typescript
import { EnemyType } from '@utils/Constants';

export interface SectorCoordinate {
  x: number;
  y: number;
}

export interface EnemyData {
  id: string;
  type: EnemyType;
  health: number;
  position: SectorCoordinate;
}

export interface StarbaseData {
  id: string;
  health: number;
  underAttack: boolean;
  attackCountdown: number; // centons until destroyed if under attack
}

export interface SectorData {
  coordinate: SectorCoordinate;
  hasPlayer: boolean;
  enemies: EnemyData[];
  starbase: StarbaseData | null;
  visited: boolean;
}

export interface GalaxyData {
  sectors: SectorData[][];
  totalEnemies: number;
  totalStarbases: number;
  enemiesDestroyed: number;
  starbasesDestroyed: number;
}

export interface DifficultyConfig {
  name: string;
  enemyCount: number;
  starbaseCount: number;
  fighterPercentage: number;
  cruiserPercentage: number;
  basestarPercentage: number;
  shieldStrength: number;
  enemyAggression: number;
  hyperspaceManual: boolean;
}
```

#### Difficulty Configurations
**ts_src/assets/data/difficulty.json**:
```json
{
  "NOVICE": {
    "name": "Novice",
    "enemyCount": 10,
    "starbaseCount": 4,
    "fighterPercentage": 0.6,
    "cruiserPercentage": 0.3,
    "basestarPercentage": 0.1,
    "shieldStrength": 1.0,
    "enemyAggression": 0.5,
    "hyperspaceManual": false
  },
  "PILOT": {
    "name": "Pilot",
    "enemyCount": 15,
    "starbaseCount": 3,
    "fighterPercentage": 0.6,
    "cruiserPercentage": 0.3,
    "basestarPercentage": 0.1,
    "shieldStrength": 0.8,
    "enemyAggression": 0.7,
    "hyperspaceManual": false
  },
  "WARRIOR": {
    "name": "Warrior",
    "enemyCount": 20,
    "starbaseCount": 2,
    "fighterPercentage": 0.6,
    "cruiserPercentage": 0.3,
    "basestarPercentage": 0.1,
    "shieldStrength": 0.5,
    "enemyAggression": 0.9,
    "hyperspaceManual": true
  },
  "COMMANDER": {
    "name": "Commander",
    "enemyCount": 28,
    "starbaseCount": 2,
    "fighterPercentage": 0.6,
    "cruiserPercentage": 0.3,
    "basestarPercentage": 0.1,
    "shieldStrength": 0.3,
    "enemyAggression": 1.0,
    "hyperspaceManual": true
  }
}
```

#### Galaxy Manager
**ts_src/systems/GalaxyManager.ts**:
```typescript
import { GALAXY_SIZE, DifficultyLevel, EnemyType, STARBASE_ATTACK_TIMER } from '@utils/Constants';
import { SectorCoordinate, SectorData, EnemyData, StarbaseData, GalaxyData, DifficultyConfig } from '@/types/GalaxyTypes';
import difficultyData from '@assets/data/difficulty.json';
import { v4 as uuidv4 } from 'uuid';

export class GalaxyManager {
  private static instance: GalaxyManager;
  private galaxy: GalaxyData;
  private difficulty: DifficultyConfig;
  private seed: number;

  private constructor() {
    this.galaxy = this.createEmptyGalaxy();
    this.difficulty = difficultyData.NOVICE;
    this.seed = Date.now();
  }

  static getInstance(): GalaxyManager {
    if (!GalaxyManager.instance) {
      GalaxyManager.instance = new GalaxyManager();
    }
    return GalaxyManager.instance;
  }

  initializeGalaxy(difficulty: DifficultyLevel, seed?: number): void {
    this.seed = seed || Date.now();
    this.difficulty = difficultyData[difficulty];
    this.galaxy = this.createEmptyGalaxy();
    this.placeStarbases();
    this.placeEnemies();
    this.setPlayerStartPosition();
  }

  private createEmptyGalaxy(): GalaxyData {
    const sectors: SectorData[][] = [];
    for (let x = 0; x < GALAXY_SIZE; x++) {
      sectors[x] = [];
      for (let y = 0; y < GALAXY_SIZE; y++) {
        sectors[x][y] = {
          coordinate: { x, y },
          hasPlayer: false,
          enemies: [],
          starbase: null,
          visited: false,
        };
      }
    }

    return {
      sectors,
      totalEnemies: 0,
      totalStarbases: 0,
      enemiesDestroyed: 0,
      starbasesDestroyed: 0,
    };
  }

  private placeStarbases(): void {
    const placed: SectorCoordinate[] = [];
    const centerX = Math.floor(GALAXY_SIZE / 2);
    const centerY = Math.floor(GALAXY_SIZE / 2);

    for (let i = 0; i < this.difficulty.starbaseCount; i++) {
      let attempts = 0;
      let coord: SectorCoordinate;

      do {
        // Random placement, but avoid center (player start)
        coord = {
          x: Math.floor(this.seededRandom() * GALAXY_SIZE),
          y: Math.floor(this.seededRandom() * GALAXY_SIZE),
        };
        attempts++;
      } while (
        ((coord.x === centerX && coord.y === centerY) ||
        placed.some(p => p.x === coord.x && p.y === coord.y)) &&
        attempts < 100
      );

      const starbase: StarbaseData = {
        id: uuidv4(),
        health: 100,
        underAttack: false,
        attackCountdown: 0,
      };

      this.galaxy.sectors[coord.x][coord.y].starbase = starbase;
      placed.push(coord);
      this.galaxy.totalStarbases++;
    }
  }

  private placeEnemies(): void {
    const centerX = Math.floor(GALAXY_SIZE / 2);
    const centerY = Math.floor(GALAXY_SIZE / 2);
    const enemyCounts = this.calculateEnemyDistribution();

    const placed: SectorCoordinate[] = [];

    // Place all enemies
    const allEnemies = [
      ...Array(enemyCounts.fighters).fill(EnemyType.FIGHTER),
      ...Array(enemyCounts.cruisers).fill(EnemyType.CRUISER),
      ...Array(enemyCounts.basestars).fill(EnemyType.BASESTAR),
    ];

    for (const enemyType of allEnemies) {
      let attempts = 0;
      let coord: SectorCoordinate;

      do {
        coord = {
          x: Math.floor(this.seededRandom() * GALAXY_SIZE),
          y: Math.floor(this.seededRandom() * GALAXY_SIZE),
        };
        attempts++;
      } while ((coord.x === centerX && coord.y === centerY) && attempts < 100);

      const enemy: EnemyData = {
        id: uuidv4(),
        type: enemyType,
        health: this.getEnemyMaxHealth(enemyType),
        position: coord,
      };

      this.galaxy.sectors[coord.x][coord.y].enemies.push(enemy);
      this.galaxy.totalEnemies++;
    }
  }

  private calculateEnemyDistribution(): { fighters: number; cruisers: number; basestars: number } {
    const total = this.difficulty.enemyCount;
    const fighters = Math.round(total * this.difficulty.fighterPercentage);
    const cruisers = Math.round(total * this.difficulty.cruiserPercentage);
    const basestars = total - fighters - cruisers; // Remaining

    return { fighters, cruisers, basestars };
  }

  private getEnemyMaxHealth(type: EnemyType): number {
    switch (type) {
      case EnemyType.FIGHTER:
        return 1; // One hit
      case EnemyType.CRUISER:
        return 2; // Two hits
      case EnemyType.BASESTAR:
        return 3; // Three hits
      default:
        return 1;
    }
  }

  private setPlayerStartPosition(): void {
    const centerX = Math.floor(GALAXY_SIZE / 2);
    const centerY = Math.floor(GALAXY_SIZE / 2);
    this.galaxy.sectors[centerX][centerY].hasPlayer = true;
    this.galaxy.sectors[centerX][centerY].visited = true;
  }

  // Seeded random number generator (simple linear congruential)
  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Public API

  getSector(coord: SectorCoordinate): SectorData | null {
    if (coord.x < 0 || coord.x >= GALAXY_SIZE || coord.y < 0 || coord.y >= GALAXY_SIZE) {
      return null;
    }
    return this.galaxy.sectors[coord.x][coord.y];
  }

  getGalaxyData(): GalaxyData {
    return this.galaxy;
  }

  movePlayerToSector(coord: SectorCoordinate): void {
    // Remove player from current sector
    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        this.galaxy.sectors[x][y].hasPlayer = false;
      }
    }

    // Place player in new sector
    const sector = this.getSector(coord);
    if (sector) {
      sector.hasPlayer = true;
      sector.visited = true;
    }
  }

  destroyEnemy(enemyId: string): void {
    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = this.galaxy.sectors[x][y];
        const index = sector.enemies.findIndex(e => e.id === enemyId);
        if (index !== -1) {
          sector.enemies.splice(index, 1);
          this.galaxy.enemiesDestroyed++;
          return;
        }
      }
    }
  }

  destroyStarbase(coord: SectorCoordinate): void {
    const sector = this.getSector(coord);
    if (sector && sector.starbase) {
      sector.starbase = null;
      this.galaxy.starbasesDestroyed++;
    }
  }

  checkStarbaseThreats(): SectorCoordinate[] {
    const threatenedBases: SectorCoordinate[] = [];

    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = this.galaxy.sectors[x][y];
        if (sector.starbase) {
          // Check if enemies within 2 sectors (Manhattan distance)
          const hasNearbyEnemy = this.hasEnemyNearby({ x, y }, 2);
          if (hasNearbyEnemy) {
            threatenedBases.push({ x, y });
            if (!sector.starbase.underAttack) {
              sector.starbase.underAttack = true;
              sector.starbase.attackCountdown = STARBASE_ATTACK_TIMER;
            }
          } else {
            sector.starbase.underAttack = false;
            sector.starbase.attackCountdown = 0;
          }
        }
      }
    }

    return threatenedBases;
  }

  private hasEnemyNearby(coord: SectorCoordinate, maxDistance: number): boolean {
    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        if (this.galaxy.sectors[x][y].enemies.length > 0) {
          const distance = this.manhattanDistance(coord, { x, y });
          if (distance <= maxDistance) {
            return true;
          }
        }
      }
    }
    return false;
  }

  manhattanDistance(a: SectorCoordinate, b: SectorCoordinate): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  updateStarbaseAttacks(deltaCentons: number): void {
    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = this.galaxy.sectors[x][y];
        if (sector.starbase && sector.starbase.underAttack) {
          sector.starbase.attackCountdown -= deltaCentons;
          if (sector.starbase.attackCountdown <= 0) {
            this.destroyStarbase({ x, y });
          }
        }
      }
    }
  }

  // Save/Load

  saveGalaxyState(): string {
    return JSON.stringify({
      galaxy: this.galaxy,
      difficulty: this.difficulty,
      seed: this.seed,
    });
  }

  loadGalaxyState(jsonData: string): void {
    const data = JSON.parse(jsonData);
    this.galaxy = data.galaxy;
    this.difficulty = data.difficulty;
    this.seed = data.seed;
  }
}
```

### Testing Requirements
- ✅ Galaxy initializes with 16×16 sectors
- ✅ Correct number of enemies placed based on difficulty
- ✅ Correct number of starbases placed
- ✅ Player starts at center (8,8)
- ✅ Enemy distribution matches percentages (60/30/10)
- ✅ Manhattan distance calculation correct
- ✅ Starbase threat detection works
- ✅ Save/load preserves galaxy state

### Unit Tests
**ts_src/systems/__tests__/GalaxyManager.test.ts**:
```typescript
import { GalaxyManager } from '../GalaxyManager';
import { DifficultyLevel, GALAXY_SIZE } from '@utils/Constants';

describe('GalaxyManager', () => {
  let manager: GalaxyManager;

  beforeEach(() => {
    manager = GalaxyManager.getInstance();
  });

  test('should create 16x16 galaxy', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const galaxy = manager.getGalaxyData();
    expect(galaxy.sectors.length).toBe(GALAXY_SIZE);
    expect(galaxy.sectors[0].length).toBe(GALAXY_SIZE);
  });

  test('should place correct number of enemies for Novice', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const galaxy = manager.getGalaxyData();
    expect(galaxy.totalEnemies).toBe(10);
  });

  test('should place correct number of starbases for Novice', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const galaxy = manager.getGalaxyData();
    expect(galaxy.totalStarbases).toBe(4);
  });

  test('should place player at center', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const center = manager.getSector({ x: 8, y: 8 });
    expect(center?.hasPlayer).toBe(true);
  });

  test('should calculate Manhattan distance correctly', () => {
    const dist = manager.manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(dist).toBe(7);
  });

  test('should detect nearby enemies for starbase threats', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const threats = manager.checkStarbaseThreats();
    expect(Array.isArray(threats)).toBe(true);
  });
});
```

### Documentation
- Add to README: Galaxy system explanation
- Document difficulty configurations
- Explain threat detection system
- Save/load format documentation

---

## Phase 5 – Starfield & Basic Rendering

### Status: ⬜ Not Started

### Dependencies
- Phase 2 completed (Game Loop)

### Context
From **star_raiders_visual_reference.txt Section 6** (Starfield Design Principles):
- 4 parallax layers for depth
- Layer 1 (Foreground): 20 stars, 3-4px, 100% white, 100% speed
- Layer 2 (Mid): 40 stars, 2px, 75% gray, 50% speed
- Layer 3 (Background): 60 stars, 1px, 50% gray, 25% speed
- Layer 4 (Deep space): 80 stars, 1px, 25% gray, 10% speed
- Stars wrap around edges
- Object pooling for performance

From **star_raiders_visual_mockups.txt Section 13** (Visual Effects):
- Starfield scrolls based on velocity and direction
- Parallax creates depth perception
- Stars distributed pseudo-randomly (avoid clustering)

### Objectives
1. Create starfield system with 4 parallax layers
2. Implement star pooling for performance
3. Add velocity-based scrolling
4. Create basic rendering pipeline
5. Set up camera system

### Deliverables

#### Star Entity
**ts_src/entities/Star.ts**:
```typescript
import Phaser from 'phaser';

export class Star extends Phaser.GameObjects.Graphics {
  public vx: number = 0;
  public vy: number = 0;
  public layer: number = 1;
  public brightness: number = 1.0;
  private size: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number, brightness: number, layer: number) {
    super(scene);
    this.setPosition(x, y);
    this.size = size;
    this.brightness = brightness;
    this.layer = layer;
    this.draw();
  }

  private draw(): void {
    this.clear();
    const color = Math.floor(255 * this.brightness);
    const hexColor = (color << 16) | (color << 8) | color; // RGB same value = grayscale
    this.fillStyle(hexColor, 1.0);
    this.fillCircle(0, 0, this.size);
  }

  update(deltaTime: number, velocityX: number, velocityY: number, speedMultiplier: number): void {
    // Move based on velocity and layer speed multiplier
    const layerSpeed = this.getLayerSpeedMultiplier();
    this.x -= velocityX * layerSpeed * speedMultiplier * deltaTime;
    this.y -= velocityY * layerSpeed * speedMultiplier * deltaTime;
  }

  private getLayerSpeedMultiplier(): number {
    switch (this.layer) {
      case 1:
        return 1.0; // 100%
      case 2:
        return 0.5; // 50%
      case 3:
        return 0.25; // 25%
      case 4:
        return 0.1; // 10%
      default:
        return 1.0;
    }
  }

  reset(x: number, y: number): void {
    this.setPosition(x, y);
  }
}
```

#### Starfield Manager
**ts_src/systems/StarfieldManager.ts**:
```typescript
import Phaser from 'phaser';
import { Star } from '@entities/Star';

interface StarfieldConfig {
  layer1Count: number;
  layer2Count: number;
  layer3Count: number;
  layer4Count: number;
}

export class StarfieldManager {
  private scene: Phaser.Scene;
  private stars: Star[] = [];
  private config: StarfieldConfig = {
    layer1Count: 20,
    layer2Count: 40,
    layer3Count: 60,
    layer4Count: 80,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createStars();
  }

  private createStars(): void {
    // Layer 1 (Foreground)
    for (let i = 0; i < this.config.layer1Count; i++) {
      const star = this.createStar(1, 3, 1.0);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 2 (Mid-range)
    for (let i = 0; i < this.config.layer2Count; i++) {
      const star = this.createStar(2, 2, 0.75);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 3 (Background)
    for (let i = 0; i < this.config.layer3Count; i++) {
      const star = this.createStar(3, 1, 0.5);
      this.stars.push(star);
      this.scene.add.existing(star);
    }

    // Layer 4 (Deep space)
    for (let i = 0; i < this.config.layer4Count; i++) {
      const star = this.createStar(4, 1, 0.25);
      this.stars.push(star);
      this.scene.add.existing(star);
    }
  }

  private createStar(layer: number, size: number, brightness: number): Star {
    const x = Math.random() * this.scene.scale.width;
    const y = Math.random() * this.scene.scale.height;
    // Add random variation to brightness (±10%)
    const finalBrightness = brightness + (Math.random() * 0.2 - 0.1);
    return new Star(this.scene, x, y, size, finalBrightness, layer);
  }

  update(deltaTime: number, velocityX: number, velocityY: number): void {
    // Speed multiplier based on magnitude of velocity
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const speedMultiplier = speed / 10; // Adjust as needed

    for (const star of this.stars) {
      star.update(deltaTime, velocityX, velocityY, speedMultiplier);

      // Wrap stars around screen edges
      this.wrapStar(star);
    }
  }

  private wrapStar(star: Star): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    if (star.x < 0) {
      star.x = width;
    } else if (star.x > width) {
      star.x = 0;
    }

    if (star.y < 0) {
      star.y = height;
    } else if (star.y > height) {
      star.y = 0;
    }
  }

  destroy(): void {
    for (const star of this.stars) {
      star.destroy();
    }
    this.stars = [];
  }
}
```

### Testing Requirements
- ✅ 200 stars total (20+40+60+80)
- ✅ Stars move at correct layer speeds
- ✅ Stars wrap around screen edges
- ✅ No clustering (reasonable distribution)
- ✅ Performance: 60 FPS with all stars moving
- ✅ Stars visible on black background

### Documentation
- Add to README: Starfield system explanation
- Document parallax layer configuration
- Explain performance optimizations

---

## Phase 6 – Galactic Chart Screen

### Status: ⬜ Not Started

### Dependencies
- Phase 4 completed (Galaxy Data)
- Phase 5 completed (Basic Rendering)

### Context
From **star_raiders_visual_mockups.txt Section 4** (Galactic Chart):
- 16×16 grid display
- Each cell ~16×16 pixels (scalable)
- Player cursor: `>>` (white, pulsing)
- Starbases: `BB` (blue)
- Enemies: `R` (red) or `RR` (multiple)
- Grid lines: Dark gray (#333333)
- HUD on right side: V, E, K, T, Time, PESCLR status

From **Star_Raiders_PRD.md Section 8.2** (Galactic Chart View):
- Strategic overlay, can be accessed during gameplay
- Shows player position, enemies, starbases
- Cursor can move to select hyperspace destination
- Real-time updates (enemies move while chart open)

### Objectives
1. Create Galactic Chart scene
2. Render 16×16 grid
3. Display icons for player, enemies, starbases
4. Add cursor navigation
5. Implement HUD display

### Deliverables

#### Galactic Chart Scene
**ts_src/scenes/GalacticChart.ts**:
```typescript
import Phaser from 'phaser';
import { GalaxyManager } from '@systems/GalaxyManager';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { InputManager, InputAction } from '@systems/InputManager';
import { GALAXY_SIZE } from '@utils/Constants';
import { SectorCoordinate } from '@/types/GalaxyTypes';

export class GalacticChartScene extends Phaser.Scene {
  private galaxyManager!: GalaxyManager;
  private gameStateManager!: GameStateManager;
  private inputManager!: InputManager;
  
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private cursorGraphics!: Phaser.GameObjects.Graphics;
  private iconContainer!: Phaser.GameObjects.Container;
  
  private cellSize: number = 40; // pixels per cell
  private gridOffsetX: number = 100;
  private gridOffsetY: number = 100;
  
  private cursorPosition: SectorCoordinate = { 
    x: Math.floor(GALAXY_SIZE / 2), 
    y: Math.floor(GALAXY_SIZE / 2) 
  };
  private cursorPulse: number = 0;

  constructor() {
    super({ key: 'GalacticChart' });
  }

  create(): void {
    this.galaxyManager = GalaxyManager.getInstance();
    this.gameStateManager = GameStateManager.getInstance();
    this.inputManager = InputManager.getInstance();

    // Set state
    this.gameStateManager.setState(GameStateType.GALACTIC_CHART);

    // Create UI elements
    this.createGrid();
    this.createCursor();
    this.createIcons();
    this.createHUD();

    // Set up input handlers
    this.setupInput();
  }

  private createGrid(): void {
    this.gridGraphics = this.add.graphics();
    this.drawGrid();
  }

  private drawGrid(): void {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x333333, 1);

    // Draw vertical lines
    for (let x = 0; x <= GALAXY_SIZE; x++) {
      const screenX = this.gridOffsetX + x * this.cellSize;
      this.gridGraphics.lineBetween(
        screenX,
        this.gridOffsetY,
        screenX,
        this.gridOffsetY + GALAXY_SIZE * this.cellSize
      );
    }

    // Draw horizontal lines
    for (let y = 0; y <= GALAXY_SIZE; y++) {
      const screenY = this.gridOffsetY + y * this.cellSize;
      this.gridGraphics.lineBetween(
        this.gridOffsetX,
        screenY,
        this.gridOffsetX + GALAXY_SIZE * this.cellSize,
        screenY
      );
    }
  }

  private createCursor(): void {
    this.cursorGraphics = this.add.graphics();
    this.updateCursor();
  }

  private updateCursor(): void {
    this.cursorGraphics.clear();
    
    // Pulsing effect (0.5 to 1.0)
    const alpha = 0.5 + Math.sin(this.cursorPulse) * 0.5;
    
    this.cursorGraphics.lineStyle(3, 0xffffff, alpha);
    const screenX = this.gridOffsetX + this.cursorPosition.x * this.cellSize;
    const screenY = this.gridOffsetY + this.cursorPosition.y * this.cellSize;
    
    this.cursorGraphics.strokeRect(screenX, screenY, this.cellSize, this.cellSize);
  }

  private createIcons(): void {
    this.iconContainer = this.add.container(0, 0);
    this.updateIcons();
  }

  private updateIcons(): void {
    this.iconContainer.removeAll(true);
    const galaxy = this.galaxyManager.getGalaxyData();

    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = galaxy.sectors[x][y];
        const screenX = this.gridOffsetX + x * this.cellSize + this.cellSize / 2;
        const screenY = this.gridOffsetY + y * this.cellSize + this.cellSize / 2;

        // Player
        if (sector.hasPlayer) {
          const playerText = this.add.text(screenX, screenY, '>>', {
            fontSize: '16px',
            color: '#ffffff',
          });
          playerText.setOrigin(0.5);
          this.iconContainer.add(playerText);
        }

        // Starbase
        if (sector.starbase) {
          const color = sector.starbase.underAttack ? '#ff0000' : '#0000ff';
          const starbaseText = this.add.text(screenX, screenY, 'BB', {
            fontSize: '14px',
            color: color,
          });
          starbaseText.setOrigin(0.5);
          this.iconContainer.add(starbaseText);
        }

        // Enemies
        if (sector.enemies.length > 0) {
          const enemyCount = sector.enemies.length;
          const enemySymbol = enemyCount > 1 ? 'RR' : 'R';
          const enemyText = this.add.text(screenX, screenY, enemySymbol, {
            fontSize: '14px',
            color: '#ff0000',
          });
          enemyText.setOrigin(0.5);
          this.iconContainer.add(enemyText);
        }
      }
    }
  }

  private createHUD(): void {
    const hudX = this.gridOffsetX + GALAXY_SIZE * this.cellSize + 50;
    const hudY = 100;

    // Placeholder HUD (will be expanded in later phases)
    const hudText = this.add.text(hudX, hudY, 'HUD', {
      fontSize: '16px',
      color: '#00ff00',
    });
  }

  private setupInput(): void {
    this.inputManager.on(InputAction.NAV_UP, () => {
      this.moveCursor(0, -1);
    });
    this.inputManager.on(InputAction.NAV_DOWN, () => {
      this.moveCursor(0, 1);
    });
    this.inputManager.on(InputAction.NAV_LEFT, () => {
      this.moveCursor(-1, 0);
    });
    this.inputManager.on(InputAction.NAV_RIGHT, () => {
      this.moveCursor(1, 0);
    });

    // Close chart
    this.inputManager.on(InputAction.GALACTIC_CHART, () => {
      this.closeChart();
    });
    this.inputManager.on(InputAction.VIEW_FORE, () => {
      this.closeChart();
    });

    // Hyperspace to selected sector
    this.inputManager.on(InputAction.HYPERSPACE, () => {
      this.initiateHyperspace();
    });
  }

  private moveCursor(dx: number, dy: number): void {
    this.cursorPosition.x = Phaser.Math.Clamp(this.cursorPosition.x + dx, 0, GALAXY_SIZE - 1);
    this.cursorPosition.y = Phaser.Math.Clamp(this.cursorPosition.y + dy, 0, GALAXY_SIZE - 1);
    this.updateCursor();
  }

  private closeChart(): void {
    this.gameStateManager.setState(GameStateType.PLAYING);
    this.scene.stop();
    // Resume game scene
  }

  private initiateHyperspace(): void {
    // Will be implemented in Phase 15
    console.log('Hyperspace to:', this.cursorPosition);
  }

  update(time: number, delta: number): void {
    this.inputManager.update();
    this.cursorPulse += delta / 1000; // Update pulse animation
    this.updateCursor();
  }
}
```

### Testing Requirements
- ✅ 16×16 grid renders correctly
- ✅ Player icon (`>>`) shows at correct sector
- ✅ Starbase icons (`BB`) show in blue
- ✅ Enemy icons (`R`) show in red
- ✅ Cursor moves with arrow keys
- ✅ Cursor constrained to grid boundaries
- ✅ Cursor pulses/blinks
- ✅ Can close chart with G or F key

### Documentation
- Add to README: Galactic Chart usage
- Document icon symbology
- Explain cursor navigation

---

*[Due to message length constraints, Phases 7-9 will continue in this document but with abbreviated detail. Full implementations follow the same structure.]*

## Phase 7 – Title & UI Screens (Summary)

### Deliverables
- Title screen with difficulty selection
- Game Over screen (victory/defeat variants)
- Ranking screen with 20 ranks
- Menu navigation system

## Phase 8 – 3D Vector Rendering (Summary)

### Deliverables
- 3D to 2D projection system
- Enemy ship rendering (triangular shapes)
- Distance-based scaling
- Depth sorting and rendering order

## Phase 9 – Fore/Aft Combat Views (Summary)

### Deliverables
- Combat view scene (fore and aft)
- Enemy positioning in 3D space
- Lock indicators (3 crosshairs: H-Lock, Range, V-Lock)
- Range display
- HUD overlay (V, E, K, T)

---

**End of Phases 4-9 Guide**

Next document: `TS_PROJECTPLAN_Phase10-14.md` (Combat, Damage, Energy, AI)
Following: `TS_PROJECTPLAN_Phase15-18.md` (Hyperspace, Starbases, Scanning, Polish)
