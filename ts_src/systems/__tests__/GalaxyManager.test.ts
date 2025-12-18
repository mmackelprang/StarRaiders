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

  test('should place correct number of enemies for Commander', () => {
    manager.initializeGalaxy(DifficultyLevel.COMMANDER, 12345);
    const galaxy = manager.getGalaxyData();
    expect(galaxy.totalEnemies).toBe(28);
  });

  test('should place player at center', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const center = manager.getSector({ x: 8, y: 8 });
    expect(center?.hasPlayer).toBe(true);
    expect(center?.visited).toBe(true);
  });

  test('should calculate Manhattan distance correctly', () => {
    const dist = manager.manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(dist).toBe(7);
  });

  test('should calculate Manhattan distance for adjacent sectors', () => {
    const dist = manager.manhattanDistance({ x: 5, y: 5 }, { x: 5, y: 6 });
    expect(dist).toBe(1);
  });

  test('should detect nearby enemies for starbase threats', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const threats = manager.checkStarbaseThreats();
    expect(Array.isArray(threats)).toBe(true);
  });

  test('should return null for out-of-bounds sector', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const sector = manager.getSector({ x: -1, y: 0 });
    expect(sector).toBeNull();
  });

  test('should return null for out-of-bounds sector (high)', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const sector = manager.getSector({ x: 16, y: 0 });
    expect(sector).toBeNull();
  });

  test('should move player to new sector', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    manager.movePlayerToSector({ x: 5, y: 5 });
    
    const newSector = manager.getSector({ x: 5, y: 5 });
    const oldSector = manager.getSector({ x: 8, y: 8 });
    
    expect(newSector?.hasPlayer).toBe(true);
    expect(newSector?.visited).toBe(true);
    expect(oldSector?.hasPlayer).toBe(false);
  });

  test('should save and load galaxy state', () => {
    manager.initializeGalaxy(DifficultyLevel.WARRIOR, 12345);
    const savedState = manager.saveGalaxyState();
    
    // Create a new state
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 54321);
    
    // Load the saved state
    manager.loadGalaxyState(savedState);
    
    const galaxy = manager.getGalaxyData();
    expect(galaxy.totalEnemies).toBe(20); // Warrior difficulty
  });

  test('should destroy enemy correctly', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const galaxy = manager.getGalaxyData();
    
    // Find first enemy
    let enemyId: string | null = null;
    for (let x = 0; x < GALAXY_SIZE && !enemyId; x++) {
      for (let y = 0; y < GALAXY_SIZE && !enemyId; y++) {
        if (galaxy.sectors[x][y].enemies.length > 0) {
          enemyId = galaxy.sectors[x][y].enemies[0].id;
        }
      }
    }
    
    if (enemyId) {
      const initialDestroyed = galaxy.enemiesDestroyed;
      manager.destroyEnemy(enemyId);
      expect(galaxy.enemiesDestroyed).toBe(initialDestroyed + 1);
    }
  });

  test('should destroy starbase correctly', () => {
    manager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    const galaxy = manager.getGalaxyData();
    
    // Find first starbase
    let starbaseCoord: { x: number; y: number } | null = null;
    for (let x = 0; x < GALAXY_SIZE && !starbaseCoord; x++) {
      for (let y = 0; y < GALAXY_SIZE && !starbaseCoord; y++) {
        if (galaxy.sectors[x][y].starbase) {
          starbaseCoord = { x, y };
        }
      }
    }
    
    if (starbaseCoord) {
      const initialDestroyed = galaxy.starbasesDestroyed;
      manager.destroyStarbase(starbaseCoord);
      expect(galaxy.starbasesDestroyed).toBe(initialDestroyed + 1);
      expect(galaxy.sectors[starbaseCoord.x][starbaseCoord.y].starbase).toBeNull();
    }
  });
});
