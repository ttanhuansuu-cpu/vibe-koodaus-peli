import { PowerUpType, Rank, LevelSummary, Rect } from './types';

export const POWER_UP_POOL: PowerUpType[] = [
  'DOUBLE_JUMP',
  'HIGH_JUMP',
  'SHIELD',
  'SUPER_DASH',
];

/**
 * Kuution rikkoutuminen:
 * - 2 osumaa riittää avaamaan pysyvän voiman (aikaisemman 3 sijasta).
 * - Ensimmäinen voima on AINA DOUBLE_JUMP (tuplahyppy).
 */
export function processCubeBreak(
  currentCubes: number,
  arg2?: number | PowerUpType,
  arg3?: PowerUpType
): {
  newCount: number;
  triggeredPowerUp: PowerUpType | null;
  newTotalPowerUps: number;
} {
  let totalPowerUpsAwarded = 0;
  let preferredPowerUp: PowerUpType | undefined;

  if (typeof arg2 === 'number') {
    totalPowerUpsAwarded = arg2;
    preferredPowerUp = arg3;
  } else if (typeof arg2 === 'string') {
    preferredPowerUp = arg2;
  }

  const nextCount = currentCubes + 1;
  if (nextCount >= 3) {
    let powerUp: PowerUpType;
    if (preferredPowerUp) {
      powerUp = preferredPowerUp;
    } else if (totalPowerUpsAwarded === 0) {
      // 1. powerup on aina tuplahyppy!
      powerUp = 'DOUBLE_JUMP';
    } else {
      const progressionPool: PowerUpType[] = ['DOUBLE_JUMP', 'HIGH_JUMP', 'SHIELD', 'SUPER_DASH'];
      powerUp = progressionPool[totalPowerUpsAwarded % progressionPool.length];
    }

    return {
      newCount: 0,
      triggeredPowerUp: powerUp,
      newTotalPowerUps: totalPowerUpsAwarded + 1,
    };
  }

  return {
    newCount: nextCount,
    triggeredPowerUp: null,
    newTotalPowerUps: totalPowerUpsAwarded,
  };
}

export function calculateDifficultyScaling(
  playerY: number,
  groundY: number = 500
): {
  altitudeMeters: number;
  speedMultiplier: number;
  tier: number;
} {
  const heightClimbed = Math.max(0, groundY - playerY);
  const altitudeMeters = Math.floor(heightClimbed / 50);
  const speedMultiplier = Number(Math.min(3.0, 1.0 + altitudeMeters * 0.02).toFixed(2));

  let tier = 1;
  if (altitudeMeters >= 60) tier = 4;
  else if (altitudeMeters >= 40) tier = 3;
  else if (altitudeMeters >= 20) tier = 2;

  return { altitudeMeters, speedMultiplier, tier };
}

export function checkUndersideCubeCollision(
  player: Rect,
  playerVy: number,
  cube: Rect
): boolean {
  if (playerVy > 80) return false;

  const horizontalOverlap =
    player.x + player.width > cube.x + 2 &&
    player.x < cube.x + cube.width - 2;

  if (!horizontalOverlap) return false;

  const cubeBottom = cube.y + cube.height;
  const playerTop = player.y;

  return playerTop <= cubeBottom + 12 && playerTop >= cube.y + 4;
}

export function checkEnemyCollision(
  player: Rect,
  playerVy: number,
  enemy: Rect
): { isStomp: boolean; isDamage: boolean } {
  const intersects =
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y;

  if (!intersects) {
    return { isStomp: false, isDamage: false };
  }

  const playerFeet = player.y + player.height;
  const enemyStompThreshold = enemy.y + enemy.height * 0.45;

  if (playerVy > -30 && playerFeet <= enemyStompThreshold + 12) {
    return { isStomp: true, isDamage: false };
  }

  return { isStomp: false, isDamage: true };
}

export function calculateLevelSummary(
  score: number,
  enemiesStomped: number,
  cubesBroken: number,
  maxAltitude: number,
  timeElapsed: number
): LevelSummary {
  const altitudeBonus = maxAltitude * 25;
  const enemyBonus = enemiesStomped * 200;
  const cubeBonus = cubesBroken * 150;
  const timeBonus = Math.max(0, Math.floor((180 - timeElapsed) * 15));

  const totalScore = score + altitudeBonus + enemyBonus + cubeBonus + timeBonus;

  let rank: Rank = 'C';
  let stars = 1;
  let rankFeedback = 'Taso läpäisty!';

  if (totalScore >= 6500 && cubesBroken >= 4 && enemiesStomped >= 3) {
    rank = 'S';
    stars = 3;
    rankFeedback = 'LEGENDAARISTA! Täydellinen nousu!';
  } else if (totalScore >= 4500 && cubesBroken >= 2) {
    rank = 'A';
    stars = 3;
    rankFeedback = 'LOISTAVAA! Erinomainen suoritus.';
  } else if (totalScore >= 2500) {
    rank = 'B';
    stars = 2;
    rankFeedback = 'HYVÄ RUN! Kokeile osua useampiin kuutioihin.';
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

export const POWER_UP_CONFIGS: Record<
  PowerUpType,
  { name: string; desc: string; duration: number; color: string; icon: string }
> = {
  DOUBLE_JUMP: {
    name: 'AERO TUPLAHYPPY',
    desc: 'Tuplahyppy aktivoitu pysyvästi! Voit hypätä ilmassa uudelleen.',
    duration: Infinity,
    color: '#06b6d4',
    icon: 'feather',
  },
  HIGH_JUMP: {
    name: 'JOUSIKENGÄT',
    desc: '+40% hyppykorkeus aktivoitu pysyvästi!',
    duration: Infinity,
    color: '#10b981',
    icon: 'chevrons-up',
  },
  SHIELD: {
    name: 'KINEETTINEN KILPI',
    desc: 'Kineettinen suojakenttä aktiivinen! Torjuu vihollisen iskut.',
    duration: Infinity,
    color: '#8b5cf6',
    icon: 'shield',
  },
  SUPER_DASH: {
    name: 'WARP-SYÖKSY',
    desc: 'Super-syöksy aktivoitu pysyvästi! Pidempi syöksy ja lyhyempi viive.',
    duration: Infinity,
    color: '#f59e0b',
    icon: 'zap',
  },
};