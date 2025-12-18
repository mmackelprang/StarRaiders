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
