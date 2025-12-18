import { StarbaseSystem } from '../StarbaseSystem';
import { GalaxyManager } from '../GalaxyManager';
import { GameStateManager } from '../GameStateManager';
import { DifficultyLevel, SystemStatus } from '@utils/Constants';

describe('StarbaseSystem', () => {
  let starbaseSystem: StarbaseSystem;
  let galaxyManager: GalaxyManager;
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    starbaseSystem = StarbaseSystem.getInstance();
    galaxyManager = GalaxyManager.getInstance();
    gameStateManager = GameStateManager.getInstance();
    
    // Initialize galaxy with test data
    galaxyManager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = StarbaseSystem.getInstance();
      const instance2 = StarbaseSystem.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Starbase Count', () => {
    test('should return correct remaining starbase count', () => {
      const count = starbaseSystem.getRemainingStarbaseCount();
      const galaxyData = galaxyManager.getGalaxyData();
      expect(count).toBe(galaxyData.totalStarbases - galaxyData.starbasesDestroyed);
    });

    test('should have starbases for NOVICE difficulty', () => {
      const count = starbaseSystem.getRemainingStarbaseCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Operational Starbases', () => {
    test('should return all operational starbases', () => {
      const operational = starbaseSystem.getOperationalStarbases();
      expect(operational.length).toBeGreaterThan(0);
      operational.forEach(item => {
        expect(item.starbase.isOperational()).toBe(true);
        expect(item.coord).toBeDefined();
      });
    });

    test('should return starbases under attack', () => {
      const underAttack = starbaseSystem.getStarbasesUnderAttack();
      expect(Array.isArray(underAttack)).toBe(true);
    });
  });

  describe('Docking', () => {
    test('should fail docking when no starbase in sector', () => {
      const playerPos = { x: 0, y: 0, z: 0 };
      const emptySector = { x: 0, y: 0 }; // Assuming no starbase here
      
      const result = starbaseSystem.attemptDocking(playerPos, 0, emptySector);
      expect(result.success).toBe(false);
      expect(result.message).toContain('NO STARBASE');
    });

    test('should fail docking when velocity too high', () => {
      const operational = starbaseSystem.getOperationalStarbases();
      if (operational.length > 0) {
        const { coord } = operational[0];
        const playerPos = { x: 0, y: 0, z: 0 };
        
        const result = starbaseSystem.attemptDocking(playerPos, 5, coord);
        expect(result.success).toBe(false);
        expect(result.message).toContain('REDUCE SPEED');
      }
    });

    test('should fail docking when too far from starbase', () => {
      const operational = starbaseSystem.getOperationalStarbases();
      if (operational.length > 0) {
        const { coord } = operational[0];
        const playerPos = { x: 100, y: 100, z: 100 }; // Very far away
        
        const result = starbaseSystem.attemptDocking(playerPos, 0, coord);
        expect(result.success).toBe(false);
        expect(result.message).toContain('TOO FAR');
      }
    });

    test('should succeed docking when conditions are met', () => {
      const operational = starbaseSystem.getOperationalStarbases();
      if (operational.length > 0) {
        const { coord, starbase } = operational[0];
        const playerPos = { x: 0, y: 0, z: 0 }; // Same position as starbase
        const gameState = gameStateManager.getGameState();
        
        // Damage some systems first
        gameState.player.systems.shields = SystemStatus.DAMAGED;
        gameState.player.energy = 1000;
        
        const result = starbaseSystem.attemptDocking(playerPos, 1, coord);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('COMPLETE');
        
        // Check repairs were made
        expect(gameState.player.systems.shields).toBe(SystemStatus.OPERATIONAL);
        expect(gameState.player.energy).toBe(7000);
      }
    });
  });

  describe('Nearest Starbase', () => {
    test('should find nearest starbase', () => {
      const fromSector = { x: 0, y: 0 };
      const nearest = starbaseSystem.findNearestStarbase(fromSector);
      
      if (nearest) {
        expect(nearest.starbase).toBeDefined();
        expect(nearest.coord).toBeDefined();
        expect(nearest.distance).toBeGreaterThanOrEqual(0);
      }
    });

    test('should return null when no starbases exist', () => {
      // Destroy all starbases
      const galaxyData = galaxyManager.getGalaxyData();
      for (let x = 0; x < galaxyData.sectors.length; x++) {
        for (let y = 0; y < galaxyData.sectors[x].length; y++) {
          const sector = galaxyData.sectors[x][y];
          if (sector.starbase) {
            sector.starbase.destroy();
          }
        }
      }
      
      const nearest = starbaseSystem.findNearestStarbase({ x: 0, y: 0 });
      expect(nearest).toBeNull();
    });
  });

  describe('Update and Attack Countdown', () => {
    test('should update starbase attack countdown', () => {
      const operational = starbaseSystem.getOperationalStarbases();
      if (operational.length > 0) {
        const { starbase } = operational[0];
        starbase.startAttack();
        const initialCountdown = starbase.attackCountdown;
        
        starbaseSystem.update(10); // 10 centons
        
        expect(starbase.attackCountdown).toBeLessThan(initialCountdown);
      }
    });
  });

  describe('Event System', () => {
    test('should emit dockingComplete event', (done) => {
      const operational = starbaseSystem.getOperationalStarbases();
      if (operational.length > 0) {
        const { coord } = operational[0];
        
        starbaseSystem.on('dockingComplete', (starbase: any) => {
          expect(starbase).toBeDefined();
          done();
        });
        
        const playerPos = { x: 0, y: 0, z: 0 };
        starbaseSystem.attemptDocking(playerPos, 0, coord);
      } else {
        done(); // Skip test if no starbases
      }
    });
  });
});
