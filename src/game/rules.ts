import { PowerUpType, Rank, LevelSummary, Rect } from './types';

/**
 * Rules and mechanics for the 2D Platformer
 */

export const POWER_UP_POOL: PowerUpType[] = [
  'DOUBLE_JUMP',
  'HIGH_JUMP',
  'SHIELD',
  'SUPER_DASH',
];

/**
 * Evaluates cube break progress.
 * Core rule: Breaking 2 cubes triggers a power-up and resets the counter.
 */
export function processCubeBreak(
  currentCubes: number,
  preferredPowerUp?: PowerUpType
): {
  newCount: number;
  triggeredPowerUp: PowerUpType | null;
} {
  const nextCount = currentCubes + 1;
  if (nextCount >= 2) {
    // 2 cubes broken! Award powerup and reset count to 0
    const powerUp = preferredPowerUp ?? POWER_UP_POOL[Math.floor(Math.random() * POWER_UP_POOL.length)];
    return {
      newCount: 0,
      triggeredPowerUp: powerUp,
    };
  }
  return {
    newCount: nextCount,
    triggeredPowerUp: null,
  };
}

/**
 * Calculates difficulty scaling based on vertical climb height.
 * As altitude increases (player moves higher up, Y is negative in canvas coordinates):
 * - Obstacle speed scales up (from 1.0x at ground up to 2.5x+ at high altitude).
 * - Tighter timing requirements.
 */
export function calculateDifficultyScaling(
  playerY: number,
  groundY: number = 500
): {
  altitudeMeters: number;
  speedMultiplier: number;
  tier: number;
} {
  // Height climbed above ground level
  const heightClimbed = Math.max(0, groundY - playerY);
  // 50 pixels = 1 meter
  const altitudeMeters = Math.floor(heightClimbed / 50);

  // Difficulty scales linearly with climb
  // Base 1.0x, adds +0.02x per meter climbed, capped at 3.0x
  const speedMultiplier = Number(Math.min(3.0, 1.0 + altitudeMeters * 0.02).toFixed(2));

  let tier = 1;
  if (altitudeMeters >= 60) tier = 4;
  else if (altitudeMeters >= 40) tier = 3;
  else if (altitudeMeters >= 20) tier = 2;

  return { altitudeMeters, speedMultiplier, tier };
}

/**
 * Collision check: Player jumping into a Power-Up Cube from underneath.
 * The player's top edge hits the cube's bottom edge while moving upward (vy < 0).
 */
export function checkUndersideCubeCollision(
  player: Rect,
  playerVy: number,
  cube: Rect
): boolean {
  // Player must be moving upwards or starting jump
  if (playerVy > 80) return false;

  // Horizontal overlap
  const horizontalOverlap =
    player.x + player.width > cube.x + 2 &&
    player.x < cube.x + cube.width - 2;

  if (!horizontalOverlap) return false;

  // Player's head is hitting the bottom half of the cube
  const cubeBottom = cube.y + cube.height;
  const playerTop = player.y;

  const verticalHit =
    playerTop <= cubeBottom + 12 &&
    playerTop >= cube.y + 4;

  return verticalHit;
}

/**
 * Collision check: Player stomping/bouncing on top of an enemy.
 * Returns whether it was a stomp (player descending, lands on enemy head)
 * or a damage hit (player hits side/bottom of enemy).
 */
export function checkEnemyCollision(
  player: Rect,
  playerVy: number,
  enemy: Rect
): { isStomp: boolean; isDamage: boolean } {
  // AABB intersection
  const intersects =
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y;

  if (!intersects) {
    return { isStomp: false, isDamage: false };
  }

  // Stomp condition: player is falling (vy > -50) and player's feet are within the top 35% of enemy
  const playerFeet = player.y + player.height;
  const enemyTop = enemy.y;
  const enemyStompThreshold = enemy.y + enemy.height * 0.45;

  if (playerVy > -30 && playerFeet <= enemyStompThreshold + 12) {
    return { isStomp: true, isDamage: false };
  }

  // Otherwise, it's a damage collision
  return { isStomp: false, isDamage: true };
}

/**
 * Calculates Level Summary and Rank (S, A, B, C) based on performance
 */
export function calculateLevelSummary(
  score: number,
  enemiesStomped: number,
  cubesBroken: number,
  maxAltitude: number,
  timeElapsed: number
): LevelSummary {
  // Bonus score calculation
  const altitudeBonus = maxAltitude * 25;
  const enemyBonus = enemiesStomped * 200;
  const cubeBonus = cubesBroken * 150;
  const timeBonus = Math.max(0, Math.floor((180 - timeElapsed) * 15));

  const totalScore = score + altitudeBonus + enemyBonus + cubeBonus + timeBonus;

  // Grade calculation
  let rank: Rank = 'C';
  let stars = 1;
  let rankFeedback = 'Stage cleared! Keep practicing to climb faster.';

  if (totalScore >= 6500 && cubesBroken >= 4 && enemiesStomped >= 3) {
    rank = 'S';
    stars = 3;
    rankFeedback = 'LEGENDARY! Flawless ascent and peak mastery.';
  } else if (totalScore >= 4500 && cubesBroken >= 2) {
    rank = 'A';
    stars = 3;
    rankFeedback = 'EXCELLENT! Great cube combos and vertical agility.';
  } else if (totalScore >= 2500) {
    rank = 'B';
    stars = 2;
    rankFeedback = 'GOOD RUN! Try hitting more cubes for higher rank.';
  }

  return {
    score: totalScore,
    enemiesStomped,
    cubesBroken,
    maxAltitude,
    timeElapsed: Math.round(timeElapsed),
    rank,
    stars,
    rankFeedback,
  };
}

/**
 * Power-up metadata and definitions
 */
export const POWER_UP_CONFIGS: Record<
  PowerUpType,
  { name: string; desc: string; duration: number; color: string; icon: string }
> = {
  DOUBLE_JUMP: {
    name: 'AERO DOUBLE JUMP',
    desc: 'Jump mid-air to reach higher platforms',
    duration: 18,
    color: '#06b6d4',
    icon: 'feather',
  },
  HIGH_JUMP: {
    name: 'SPRING BOOTS',
    desc: 'Increases jump height by 40%',
    duration: 15,
    color: '#10b981',
    icon: 'chevrons-up',
  },
  SHIELD: {
    name: 'KINETIC SHIELD',
    desc: 'Protects from 1 hazard or enemy hit',
    duration: 25,
    color: '#8b5cf6',
    icon: 'shield',
  },
  SUPER_DASH: {
    name: 'WARP DASH',
    desc: 'Press Dash [B] to thrust forward with invulnerability',
    duration: 15,
    color: '#f59e0b',
    icon: 'zap',
  },
};
