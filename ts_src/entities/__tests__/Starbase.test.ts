import { Starbase } from '../Starbase';
import { STARBASE_ATTACK_TIMER } from '@utils/Constants';

describe('Starbase Entity', () => {
  let starbase: Starbase;
  const testSector = { x: 5, y: 5 };
  const testPosition = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    starbase = new Starbase('test-id', testSector, testPosition);
  });

  describe('Initialization', () => {
    test('should initialize with correct properties', () => {
      expect(starbase.id).toBe('test-id');
      expect(starbase.sectorCoord).toEqual(testSector);
      expect(starbase.position).toEqual(testPosition);
      expect(starbase.health).toBe(100);
      expect(starbase.maxHealth).toBe(100);
      expect(starbase.underAttack).toBe(false);
      expect(starbase.attackCountdown).toBe(0);
      expect(starbase.destroyed).toBe(false);
    });

    test('should be operational on creation', () => {
      expect(starbase.isOperational()).toBe(true);
    });
  });

  describe('Attack Management', () => {
    test('should start attack with countdown', () => {
      starbase.startAttack();
      expect(starbase.underAttack).toBe(true);
      expect(starbase.attackCountdown).toBe(STARBASE_ATTACK_TIMER);
    });

    test('should not start attack if already destroyed', () => {
      starbase.destroy();
      starbase.startAttack();
      expect(starbase.underAttack).toBe(false);
      expect(starbase.attackCountdown).toBe(0);
    });

    test('should cancel attack', () => {
      starbase.startAttack();
      starbase.cancelAttack();
      expect(starbase.underAttack).toBe(false);
      expect(starbase.attackCountdown).toBe(0);
    });

    test('should update countdown and destroy when it reaches 0', () => {
      starbase.startAttack();
      const destroyed = starbase.updateAttackCountdown(STARBASE_ATTACK_TIMER + 10);
      
      expect(destroyed).toBe(true);
      expect(starbase.destroyed).toBe(true);
      expect(starbase.underAttack).toBe(false);
      expect(starbase.health).toBe(0);
    });

    test('should not be destroyed if countdown has time remaining', () => {
      starbase.startAttack();
      const destroyed = starbase.updateAttackCountdown(50);
      
      expect(destroyed).toBe(false);
      expect(starbase.destroyed).toBe(false);
      expect(starbase.attackCountdown).toBe(STARBASE_ATTACK_TIMER - 50);
    });

    test('should not update countdown when not under attack', () => {
      const destroyed = starbase.updateAttackCountdown(50);
      
      expect(destroyed).toBe(false);
      expect(starbase.attackCountdown).toBe(0);
    });
  });

  describe('Docking', () => {
    test('should allow docking when in range', () => {
      const playerPos = { x: 5, y: 0, z: 0 }; // 5 metrons away
      expect(starbase.isInDockingRange(playerPos)).toBe(true);
    });

    test('should not allow docking when out of range', () => {
      const playerPos = { x: 15, y: 0, z: 0 }; // 15 metrons away
      expect(starbase.isInDockingRange(playerPos)).toBe(false);
    });

    test('should not allow docking when destroyed', () => {
      starbase.destroy();
      const playerPos = { x: 0, y: 0, z: 0 }; // Same position
      expect(starbase.isInDockingRange(playerPos)).toBe(false);
    });

    test('should return correct docking result', () => {
      const result = starbase.dock();
      expect(result.repaired).toBe(true);
      expect(result.energyRestored).toBe(7000);
    });

    test('should not dock when destroyed', () => {
      starbase.destroy();
      const result = starbase.dock();
      expect(result.repaired).toBe(false);
      expect(result.energyRestored).toBe(0);
    });
  });

  describe('Distance Calculation', () => {
    test('should calculate correct distance', () => {
      const position = { x: 3, y: 4, z: 0 };
      const distance = starbase.getDistanceFrom(position);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should calculate 3D distance', () => {
      const position = { x: 1, y: 1, z: Math.sqrt(2) };
      const distance = starbase.getDistanceFrom(position);
      expect(distance).toBeCloseTo(2, 1);
    });
  });

  describe('Destruction', () => {
    test('should destroy starbase correctly', () => {
      starbase.startAttack();
      starbase.destroy();

      expect(starbase.destroyed).toBe(true);
      expect(starbase.underAttack).toBe(false);
      expect(starbase.attackCountdown).toBe(0);
      expect(starbase.health).toBe(0);
      expect(starbase.isOperational()).toBe(false);
    });
  });

  describe('Rendering Properties', () => {
    test('should return correct sprite size', () => {
      expect(starbase.getBaseSpriteSize()).toBe(40);
    });

    test('should return blue color when operational', () => {
      expect(starbase.getColor()).toBe(0x0088ff);
    });

    test('should return red color when under attack', () => {
      starbase.startAttack();
      expect(starbase.getColor()).toBe(0xff0000);
    });

    test('should return gray color when destroyed', () => {
      starbase.destroy();
      expect(starbase.getColor()).toBe(0x444444);
    });
  });
});
