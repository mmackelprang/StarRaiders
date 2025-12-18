import { GALAXY_SIZE, DifficultyLevel, EnemyType, STARBASE_ATTACK_TIMER } from '@utils/Constants';
import { SectorCoordinate, SectorData, EnemyData, StarbaseData, GalaxyData, DifficultyConfig } from '@/types/GalaxyTypes';
import { Starbase } from '@/entities/Starbase';
import difficultyData from '@assets/data/difficulty.json';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

      const starbase = new Starbase(
        generateUUID(),
        coord,
        { x: 0, y: 0, z: 0 } // Center of sector
      );

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
        id: generateUUID(),
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
