import { DifficultyLevel } from './Constants';

export interface RankInfo {
  title: string;
  class?: number;
  minScore: number;
  maxScore?: number;
}

export const RANK_TABLE: RankInfo[] = [
  { title: 'GALACTIC COOK', minScore: -Infinity, maxScore: 47 },
  { title: 'GARBAGE SCOW CAPTAIN', minScore: -Infinity, maxScore: 47 },
  { title: 'ROOKIE', minScore: 48, maxScore: 79 },
  { title: 'NOVICE', minScore: 80, maxScore: 111 },
  { title: 'ENSIGN', minScore: 112, maxScore: 143 },
  { title: 'PILOT', minScore: 144, maxScore: 175 },
  { title: 'ACE', minScore: 176, maxScore: 207 },
  { title: 'LIEUTENANT', minScore: 208, maxScore: 239 },
  { title: 'WARRIOR', minScore: 240, maxScore: 271 },
  { title: 'CAPTAIN', minScore: 272, maxScore: 303 },
  { title: 'COMMANDER', minScore: 304, maxScore: 335 },
  { title: 'STAR COMMANDER', class: 1, minScore: 336, maxScore: 367 },
  { title: 'STAR COMMANDER', class: 2, minScore: 368, maxScore: 399 },
  { title: 'STAR COMMANDER', class: 3, minScore: 400, maxScore: 431 },
  { title: 'STAR COMMANDER', class: 4, minScore: 432, maxScore: Infinity },
];

export class RankingSystem {
  static calculateScore(
    enemiesDestroyed: number,
    totalEnemies: number,
    starbasesRemaining: number,
    totalStarbases: number,
    missionTime: number,
    energyRemaining: number,
    difficulty: DifficultyLevel
  ): number {
    // Base score: 10 points per enemy destroyed
    let score = enemiesDestroyed * 10;

    // Starbase bonus: 20 points per starbase saved
    score += starbasesRemaining * 20;

    // Time penalty: -1 point per 10 centons over 300
    if (missionTime > 300) {
      score -= Math.floor((missionTime - 300) / 10);
    }

    // Energy efficiency bonus
    if (energyRemaining > 4000) {
      score += 25;
    } else if (energyRemaining > 2000) {
      score += 10;
    }

    // Apply difficulty multiplier
    const multiplier = this.getDifficultyMultiplier(difficulty);
    score = Math.floor(score * multiplier);

    return score;
  }

  static getDifficultyMultiplier(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case DifficultyLevel.NOVICE:
        return 1.0;
      case DifficultyLevel.PILOT:
        return 1.5;
      case DifficultyLevel.WARRIOR:
        return 2.0;
      case DifficultyLevel.COMMANDER:
        return 3.0;
      default:
        return 1.0;
    }
  }

  static getRankForScore(score: number): RankInfo {
    // For low scores, randomly pick between the two humorous ranks
    if (score < 48) {
      return Math.random() < 0.5 ? RANK_TABLE[0] : RANK_TABLE[1];
    }

    // Find the appropriate rank
    for (let i = RANK_TABLE.length - 1; i >= 0; i--) {
      const rank = RANK_TABLE[i];
      if (score >= rank.minScore && (rank.maxScore === undefined || score <= rank.maxScore)) {
        return rank;
      }
    }

    // Default to rookie if no match (shouldn't happen)
    return RANK_TABLE[2];
  }

  static formatRankTitle(rank: RankInfo): string {
    if (rank.class) {
      return `${rank.title} - CLASS ${rank.class}`;
    }
    return rank.title;
  }
}
