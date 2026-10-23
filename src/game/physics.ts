import {
  Player,
  Platform,
  PowerUpCube,
  Enemy,
  Obstacle,
  PowerUpType,
  PowerUpNotification,
} from './types';
import {
  processCubeBreak,
  calculateDifficultyScaling,
  checkUndersideCubeCollision,
  checkEnemyCollision,
  POWER_UP_CONFIGS,
} from './rules';
import { soundFX } from './audio';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  dashPressed: boolean;
}

export function createInitialPlayer(spawnX: number, spawnY: number): Player {
  return {
    x: spawnX,
    y: spawnY,
    width: 28,
    height: 38,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpCount: 0,
    maxJumps: 1,
    jumpStrength: 450,
    activePowerUp: null,
    powerUpTimeRemaining: 0,
    hasShield: false,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    cubesBrokenCount: 0,
    totalCubesBroken: 0,
    enemiesStomped: 0,
    score: 0,
    lives: 3,
    maxLives: 3,
    invulnerableTimer: 0,
    altitudeMeters: 0,
    squashScaleX: 1,
    squashScaleY: 1,
    trail: [],
  };
}

export class PhysicsEngine {
  public particles: Particle[] = [];
  public currentNotification: PowerUpNotification | null = null;
  public notificationTimer: number = 0;
  public screenShake: number = 0;

  // Particle emitter helper
  public spawnParticles(
    x: number,
    y: number,
    count: number,
    colors: string[],
    speed: number = 180,
    size: number = 4
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * size + 2,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.3,
      });
    }
  }

  public update(
    player: Player,
    platforms: Platform[],
    cubes: PowerUpCube[],
    enemies: Enemy[],
    obstacles: Obstacle[],
    input: InputState,
    dt: number,
    groundY: number
  ): { stageCompleted: boolean; playerDied: boolean } {
    // Clamp frame dt
    const safeDt = Math.min(dt, 0.05);

    // 1. Difficulty scaling based on altitude
    const scaling = calculateDifficultyScaling(player.y, groundY);
    player.altitudeMeters = scaling.altitudeMeters;

    // 2. Timers decay
    if (player.invulnerableTimer > 0) {
      player.invulnerableTimer = Math.max(0, player.invulnerableTimer - safeDt);
    }
    if (player.dashCooldown > 0) {
      player.dashCooldown = Math.max(0, player.dashCooldown - safeDt);
    }
    if (this.notificationTimer > 0) {
      this.notificationTimer = Math.max(0, this.notificationTimer - safeDt);
      if (this.notificationTimer === 0) {
        this.currentNotification = null;
      }
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - safeDt * 30);
    }

    // Squash & stretch damping back to 1.0
    player.squashScaleX += (1 - player.squashScaleX) * Math.min(1, safeDt * 12);
    player.squashScaleY += (1 - player.squashScaleY) * Math.min(1, safeDt * 12);

    // 3. Power-Up active timer
    if (player.activePowerUp && player.powerUpTimeRemaining > 0) {
      player.powerUpTimeRemaining = Math.max(0, player.powerUpTimeRemaining - safeDt);
      if (player.powerUpTimeRemaining === 0) {
        // Expired
        if (player.activePowerUp === 'DOUBLE_JUMP') player.maxJumps = 1;
        if (player.activePowerUp === 'HIGH_JUMP') player.jumpStrength = 450;
        if (player.activePowerUp === 'SHIELD') player.hasShield = false;
        player.activePowerUp = null;
      }
    }

    // 4. Update Platforms (Moving horizontal & vertical lifts)
    let standingPlatform: Platform | null = null;
    for (const p of platforms) {
      if (p.type === 'moving_h' && p.vx !== undefined && p.minX !== undefined && p.maxX !== undefined) {
        p.x += p.vx * safeDt;
        if (p.x >= p.maxX) {
          p.x = p.maxX;
          p.vx = -Math.abs(p.vx);
        } else if (p.x <= p.minX) {
          p.x = p.minX;
          p.vx = Math.abs(p.vx);
        }
      } else if (p.type === 'vertical_lift' && p.vy !== undefined && p.minY !== undefined && p.maxY !== undefined) {
        // Lifts scale speed slightly with altitude
        const liftSpeed = p.vy * (1 + scaling.speedMultiplier * 0.15);
        p.y += liftSpeed * safeDt;
        if (p.y <= p.minY) {
          p.y = p.minY;
          p.vy = Math.abs(p.vy);
        } else if (p.y >= p.maxY) {
          p.y = p.maxY;
          p.vy = -Math.abs(p.vy);
        }
      }
    }

    // 5. Update Obstacles with altitude speed scaling!
    for (const obs of obstacles) {
      const speedMult = scaling.speedMultiplier;
      obs.vx = (obs.baseVx >= 0 ? 1 : -1) * Math.abs(obs.baseVx) * speedMult;
      obs.x += obs.vx * safeDt;
      if (obs.maxX !== undefined && obs.x >= obs.maxX) {
        obs.x = obs.maxX;
        obs.baseVx = -Math.abs(obs.baseVx);
      } else if (obs.minX !== undefined && obs.x <= obs.minX) {
        obs.x = obs.minX;
        obs.baseVx = Math.abs(obs.baseVx);
      }
      if (obs.rotationSpeed) {
        obs.angle = (obs.angle || 0) + obs.rotationSpeed * speedMult * safeDt;
      }
    }

    // 6. Update Enemies
    for (const enemy of enemies) {
      if (!enemy.alive) {
        if (enemy.squishAnim > 0) {
          enemy.squishAnim = Math.max(0, enemy.squishAnim - safeDt);
        }
        continue;
      }

      // Patrol movement
      enemy.x += enemy.vx * safeDt;
      if (enemy.x <= enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.speed);
      } else if (enemy.x + enemy.width >= enemy.maxX) {
        enemy.x = enemy.maxX - enemy.width;
        enemy.vx = -Math.abs(enemy.speed);
      }
    }

    // 7. Player Dash handling
    if (input.dashPressed && player.dashCooldown === 0) {
      const hasSuperDash = player.activePowerUp === 'SUPER_DASH';
      player.isDashing = true;
      player.dashTimer = hasSuperDash ? 0.28 : 0.18;
      player.dashCooldown = hasSuperDash ? 0.45 : 0.75;
      player.invulnerableTimer = player.dashTimer;
      player.vx = player.facing * (hasSuperDash ? 720 : 540);
      player.vy = -40; // slight upward anti-gravity glide
      soundFX.playDash();
      this.spawnParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        14,
        ['#38bdf8', '#818cf8', '#ffffff']
      );
    }

    if (player.isDashing) {
      player.dashTimer -= safeDt;
      if (player.dashTimer <= 0) {
        player.isDashing = false;
      }
    }

    // 8. Player Horizontal Movement
    if (!player.isDashing) {
      const targetSpeed = 240;
      const accel = player.grounded ? 1800 : 1200;
      const friction = player.grounded ? 1400 : 600;

      if (input.left && !input.right) {
        player.vx = Math.max(-targetSpeed, player.vx - accel * safeDt);
        player.facing = -1;
      } else if (input.right && !input.left) {
        player.vx = Math.min(targetSpeed, player.vx + accel * safeDt);
        player.facing = 1;
      } else {
        // Decelerate
        if (player.vx > 0) {
          player.vx = Math.max(0, player.vx - friction * safeDt);
        } else if (player.vx < 0) {
          player.vx = Math.min(0, player.vx + friction * safeDt);
        }
      }
    }

    // 9. Jump Input & Mechanics (Coyote Time + Jump Buffer + Double Jump)
    if (input.jumpPressed) {
      player.jumpBufferTimer = 0.12; // Buffer window
    } else if (player.jumpBufferTimer > 0) {
      player.jumpBufferTimer -= safeDt;
    }

    if (player.grounded) {
      player.coyoteTimer = 0.1;
      player.jumpCount = 0;
    } else {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - safeDt);
    }

    // Process Jump
    if (player.jumpBufferTimer > 0) {
      const canGroundJump = player.grounded || player.coyoteTimer > 0;
      const canAirJump =
        !canGroundJump &&
        player.activePowerUp === 'DOUBLE_JUMP' &&
        player.jumpCount < player.maxJumps;

      if (canGroundJump) {
        // Standard Jump
        player.vy = -player.jumpStrength;
        player.grounded = false;
        player.coyoteTimer = 0;
        player.jumpBufferTimer = 0;
        player.jumpCount = 1;
        player.squashScaleX = 0.8;
        player.squashScaleY = 1.25;
        soundFX.playJump();
        this.spawnParticles(
          player.x + player.width / 2,
          player.y + player.height,
          8,
          ['#94a3b8', '#cbd5e1']
        );
      } else if (canAirJump) {
        // Double Jump
        player.vy = -player.jumpStrength * 0.95;
        player.jumpBufferTimer = 0;
        player.jumpCount++;
        player.squashScaleX = 0.75;
        player.squashScaleY = 1.3;
        soundFX.playDoubleJump();
        // Wing burst particles
        this.spawnParticles(
          player.x + player.width / 2,
          player.y + player.height,
          16,
          ['#06b6d4', '#67e8f9', '#ffffff'],
          220
        );
      }
    }

    // Variable jump cut: release jump while ascending cuts ascent
    if (!input.jumpHeld && player.vy < -60) {
      player.vy *= 0.52;
    }

    // 10. Gravity
    const gravity = player.isDashing ? 0 : 960;
    player.vy += gravity * safeDt;
    if (player.vy > 750) player.vy = 750; // Terminal velocity

    // Move player by velocity
    player.x += player.vx * safeDt;
    player.y += player.vy * safeDt;

    // Record trail for dashing/speed
    if (player.isDashing || player.activePowerUp === 'DOUBLE_JUMP') {
      player.trail.push({ x: player.x, y: player.y, alpha: 0.6 });
    }
    for (const t of player.trail) {
      t.alpha -= safeDt * 3;
    }
    player.trail = player.trail.filter((t) => t.alpha > 0);

    // 11. Platform Collisions
    player.grounded = false;

    for (const p of platforms) {
      // Horizontal AABB check
      const overlapsX =
        player.x + player.width > p.x &&
        player.x < p.x + p.width;

      if (!overlapsX) continue;

      // Check landing on top (moving down or near top surface)
      const prevY = player.y - player.vy * safeDt;
      const isAboveTop = prevY + player.height <= p.y + 14;
      const intersectsTop =
        player.y + player.height >= p.y &&
        player.y + player.height <= p.y + p.height + 10;

      if (isAboveTop && intersectsTop && player.vy >= 0) {
        // Landing on platform!
        player.y = p.y - player.height;
        player.vy = 0;
        player.grounded = true;
        standingPlatform = p;

        // Check if finished stage!
        if (p.type === 'finish') {
          soundFX.playVictory();
          return { stageCompleted: true, playerDied: false };
        }
      }
    }

    // Carry player on moving platform
    if (player.grounded && standingPlatform) {
      if (standingPlatform.vx) {
        player.x += standingPlatform.vx * safeDt;
      }
      if (standingPlatform.vy) {
        player.y += standingPlatform.vy * safeDt;
      }
    }

    // 12. Underside Power-Up Cube Collision
    for (const cube of cubes) {
      if (cube.broken) continue;

      if (checkUndersideCubeCollision(player, player.vy, cube)) {
        // Smashed cube from underneath!
        cube.broken = true;
        cube.hitAnim = 1.0;
        player.vy = Math.max(60, -player.vy * 0.2); // bounce player down
        this.screenShake = 12;
        soundFX.playCubeHit();

        // 8-piece cube shatter particles
        this.spawnParticles(
          cube.x + cube.width / 2,
          cube.y + cube.height / 2,
          24,
          ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'],
          260,
          6
        );

        player.totalCubesBroken++;
        player.score += 200;

        // Core Rule: 2 cubes trigger a powerup!
        const result = processCubeBreak(player.cubesBrokenCount);
        player.cubesBrokenCount = result.newCount;

        if (result.triggeredPowerUp) {
          // POWER UP UNLOCKED!
          player.activePowerUp = result.triggeredPowerUp;
          const config = POWER_UP_CONFIGS[result.triggeredPowerUp];
          player.powerUpTimeRemaining = config.duration;

          // Apply specific power-up perks
          if (result.triggeredPowerUp === 'DOUBLE_JUMP') {
            player.maxJumps = 2;
          } else if (result.triggeredPowerUp === 'HIGH_JUMP') {
            player.jumpStrength = 630; // 40% jump boost
          } else if (result.triggeredPowerUp === 'SHIELD') {
            player.hasShield = true;
          }

          soundFX.playPowerUpChime();
          this.currentNotification = {
            type: result.triggeredPowerUp,
            name: config.name,
            desc: config.desc,
            duration: 3.5,
            color: config.color,
          };
          this.notificationTimer = 3.5;
        }
      }
    }

    // 13. Enemy Stomp & Damage Collision
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const coll = checkEnemyCollision(player, player.vy, enemy);

      if (coll.isStomp) {
        // STOMP VICTORY!
        enemy.alive = false;
        enemy.squishAnim = 0.35;
        player.vy = -430; // Bounce upward off enemy!
        player.enemiesStomped++;
        player.score += 350;
        soundFX.playStomp();
        this.screenShake = 8;
        player.squashScaleX = 1.35;
        player.squashScaleY = 0.7;

        this.spawnParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          18,
          ['#ec4899', '#f43f5e', '#ffffff']
        );
      } else if (coll.isDamage) {
        // Player takes hit
        if (player.invulnerableTimer === 0 && !player.isDashing) {
          if (player.hasShield) {
            // Shield absorbs damage!
            player.hasShield = false;
            player.activePowerUp = null;
            player.invulnerableTimer = 1.6;
            this.screenShake = 14;
            soundFX.playHurt();
            this.spawnParticles(
              player.x + player.width / 2,
              player.y + player.height / 2,
              20,
              ['#8b5cf6', '#a78bfa', '#ffffff']
            );
          } else {
            // Deduct life
            player.lives--;
            player.invulnerableTimer = 2.0;
            player.vy = -280;
            player.vx = -player.facing * 180;
            this.screenShake = 18;
            soundFX.playHurt();
            this.spawnParticles(
              player.x + player.width / 2,
              player.y + player.height / 2,
              22,
              ['#ef4444', '#f87171', '#ffffff']
            );

            if (player.lives <= 0) {
              return { stageCompleted: false, playerDied: true };
            }
          }
        }
      }
    }

    // 14. Obstacle Hazard Collisions (Buzz saws & Plasma orbs)
    for (const obs of obstacles) {
      // Circle vs Box collision
      const closestX = Math.max(player.x, Math.min(obs.x, player.x + player.width));
      const closestY = Math.max(player.y, Math.min(obs.y, player.y + player.height));
      const distX = obs.x - closestX;
      const distY = obs.y - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq < obs.radius * obs.radius) {
        // Hazard hit!
        if (player.invulnerableTimer === 0 && !player.isDashing) {
          if (player.hasShield) {
            player.hasShield = false;
            player.activePowerUp = null;
            player.invulnerableTimer = 1.6;
            this.screenShake = 16;
            soundFX.playHurt();
          } else {
            player.lives--;
            player.invulnerableTimer = 2.0;
            player.vy = -280;
            player.vx = -player.facing * 200;
            this.screenShake = 20;
            soundFX.playHurt();

            if (player.lives <= 0) {
              return { stageCompleted: false, playerDied: true };
            }
          }
        }
      }
    }

    // 15. Fall-off pit check
    if (player.y > groundY + 280) {
      player.lives = 0;
      return { stageCompleted: false, playerDied: true };
    }

    // 16. Update Particles
    for (const p of this.particles) {
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
      p.vy += 240 * safeDt; // slight gravity on debris
      p.life += safeDt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);

    return { stageCompleted: false, playerDied: false };
  }
}
