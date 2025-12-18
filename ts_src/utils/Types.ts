import { DifficultyLevel, SystemStatus } from './Constants';

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
