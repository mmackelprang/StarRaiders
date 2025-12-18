import { EnemyType } from '@utils/Constants';
import { Starbase } from '@/entities/Starbase';

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
  starbase: Starbase | null;
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
