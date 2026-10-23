/**
 * Core type definitions for 2D Platformer
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PlatformType =
  | 'ground'
  | 'normal'
  | 'vertical_lift'
  | 'moving_h'
  | 'crumble'
  | 'hazard_spikes'
  | 'finish';

export interface Platform extends Rect {
  id: string;
  type: PlatformType;
  color?: string;
  // Movement parameters
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  initialX?: number;
  initialY?: number;
  crumbleTimer?: number;
  crumbled?: boolean;
}

export interface PowerUpCube extends Rect {
  id: string;
  broken: boolean;
  hitAnim: number; // 0 to 1 for bounce/shatter animation
  respawnTime?: number;
}

export type EnemyType = 'patrol' | 'charger' | 'flyer';

export interface Enemy extends Rect {
  id: string;
  type: EnemyType;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  alive: boolean;
  squishAnim: number; // > 0 when stomped
  color?: string;
  speed: number;
}

export type ObstacleType = 'buzzsaw' | 'plasma_orb' | 'laser_beam';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  radius: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  angle?: number;
  rotationSpeed?: number;
}

export type PowerUpType = 'DOUBLE_JUMP' | 'HIGH_JUMP' | 'SHIELD' | 'SUPER_DASH';

export interface PowerUpNotification {
  type: PowerUpType;
  name: string;
  desc: string;
  duration: number;
  color: string;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
  coyoteTimer: number;
  jumpBufferTimer: number;
  jumpCount: number;
  maxJumps: number;
  jumpStrength: number;
  // Powerups
  activePowerUp: PowerUpType | null;
  powerUpTimeRemaining: number;
  hasShield: boolean;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  // Progression
  cubesBrokenCount: number; // 0 or 1, triggers powerup at 2 then resets to 0
  totalCubesBroken: number;
  enemiesStomped: number;
  score: number;
  lives: number;
  maxLives: number;
  invulnerableTimer: number;
  altitudeMeters: number;
  // Animation / Visual juice
  squashScaleX: number;
  squashScaleY: number;
  trail: { x: number; y: number; alpha: number }[];
}

export type Rank = 'S' | 'A' | 'B' | 'C';

export interface LevelSummary {
  score: number;
  enemiesStomped: number;
  cubesBroken: number;
  maxAltitude: number;
  timeElapsed: number;
  rank: Rank;
  stars: number;
  rankFeedback: string;
}

export type GameStatus = 'title' | 'playing' | 'paused' | 'summary' | 'gameover';
