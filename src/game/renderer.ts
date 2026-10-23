import { Player, Platform, PowerUpCube, Enemy, Obstacle } from './types';
import { Particle } from './physics';

export class GameRenderer {
  public cameraX: number = 0;
  public cameraY: number = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: Player,
    platforms: Platform[],
    cubes: PowerUpCube[],
    enemies: Enemy[],
    obstacles: Obstacle[],
    particles: Particle[],
    screenShake: number,
    summitY: number
  ) {
    // 1. Camera tracking with smooth lerp
    const targetCamX = player.x + player.width / 2 - width * 0.45;
    const targetCamY = player.y + player.height / 2 - height * 0.55;

    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    // Apply screen shake
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (screenShake > 0) {
      shakeOffsetX = (Math.random() - 0.5) * screenShake;
      shakeOffsetY = (Math.random() - 0.5) * screenShake;
    }

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 2. Parallax Sky & Cyber City Backdrop
    this.drawParallaxBackground(ctx, width, height, player.altitudeMeters);

    // World transform
    ctx.translate(-this.cameraX + shakeOffsetX, -this.cameraY + shakeOffsetY);

    // 3. Draw Tower Background Structure & Altitude Markers
    this.drawTowerStructure(ctx, summitY);

    // 4. Draw Platforms
    for (const p of platforms) {
      this.drawPlatform(ctx, p);
    }

    // 5. Draw Power-Up Cubes (placed under platforms!)
    for (const cube of cubes) {
      this.drawPowerUpCube(ctx, cube);
    }

    // 6. Draw Moving Obstacles (Buzzsaws & Orbs)
    for (const obs of obstacles) {
      this.drawObstacle(ctx, obs);
    }

    // 7. Draw Enemies
    for (const enemy of enemies) {
      this.drawEnemy(ctx, enemy);
    }

    // 8. Draw Player Trails & Player
    this.drawPlayer(ctx, player);

    // 9. Draw Summit Finish Gate
    this.drawSummitGate(ctx, 1050, summitY, 250);

    // 10. Draw Particles
    for (const pt of particles) {
      const alpha = Math.max(0, 1 - pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  private drawParallaxBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    altitude: number
  ) {
    // Dynamic Sky Gradient based on altitude (night purple -> cosmic abyss at summit)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (altitude < 30) {
      skyGrad.addColorStop(0, '#090a16');
      skyGrad.addColorStop(0.5, '#13112c');
      skyGrad.addColorStop(1, '#241b44');
    } else {
      skyGrad.addColorStop(0, '#030014');
      skyGrad.addColorStop(0.6, '#080521');
      skyGrad.addColorStop(1, '#150c30');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant stars / cosmic particles
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 35; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 89.3 + this.cameraY * 0.05) % height + height) % height;
      const size = (i % 3) + 1;
      ctx.globalAlpha = 0.2 + (i % 5) * 0.12;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1.0;
  }

  private drawTowerStructure(ctx: CanvasRenderingContext2D, summitY: number) {
    // Vertical climb shaft guide rails and neon altitude markings
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 4;
    ctx.strokeRect(880, summitY, 590, 5000 - summitY);

    // Vertical cables
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 2;
    for (let x = 950; x <= 1400; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, summitY - 100);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }

    // Altitude neon ruler signs on wall
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    for (let y = 400; y >= summitY; y -= 400) {
      const meters = Math.floor((500 - y) / 50);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillText(`▲ ${meters}m`, 870, y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.moveTo(880, y);
      ctx.lineTo(910, y);
      ctx.stroke();
    }

    // Horizontal to vertical transition arrow banner
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬆ VERTICAL ASCENT TOWER · CLIMB UPWARDS ⬆', 1200, 150);
  }

  private drawPlatform(ctx: CanvasRenderingContext2D, p: Platform) {
    ctx.save();

    if (p.type === 'ground') {
      // Solid ground
      const groundGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      groundGrad.addColorStop(0, '#1e1b4b');
      groundGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Top glowing neon surface
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x, p.y, p.width, 4);
    } else if (p.type === 'vertical_lift') {
      // Vertical lift platform (elevators)
      // Cable / track
      if (p.minY !== undefined && p.maxY !== undefined) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p.x + p.width / 2, p.minY);
        ctx.lineTo(p.x + p.width / 2, p.maxY + p.height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Lift platform body
      ctx.fillStyle = '#332704';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.width, p.height);

      // Top glowing yellow rail
      ctx.fillStyle = '#facc15';
      ctx.fillRect(p.x, p.y, p.width, 4);

      // Elevator chevron indicator
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ LIFT ▲', p.x + p.width / 2, p.y + p.height - 6);
    } else if (p.type === 'moving_h') {
      // Horizontal moving platform
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.width, p.height);

      // Cyan / purple top stripe
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(p.x, p.y, p.width, 4);

      // Arrow indicator
      ctx.fillStyle = '#f3e8ff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('◀ ▶', p.x + p.width / 2, p.y + p.height - 6);
    } else if (p.type === 'finish') {
      // Finish platform at summit
      ctx.fillStyle = '#14532d';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(p.x, p.y, p.width, 6);
    } else {
      // Normal platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.y, p.width, p.height);

      // Glowing cyan top edge
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p.x, p.y, p.width, 3);
    }

    ctx.restore();
  }

  private drawPowerUpCube(ctx: CanvasRenderingContext2D, cube: PowerUpCube) {
    if (cube.broken) {
      // Broken frame remnant
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cube.x, cube.y, cube.width, cube.height);
      return;
    }

    ctx.save();
    // Hovering bob animation
    const time = Date.now() * 0.004;
    const hoverY = Math.sin(time + cube.x * 0.05) * 3;

    // Glowing outer aura
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;

    // Golden Box Body
    const grad = ctx.createLinearGradient(cube.x, cube.y + hoverY, cube.x, cube.y + cube.height + hoverY);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(cube.x, cube.y + hoverY, cube.width, cube.height);

    // Bevel borders
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 2;
    ctx.strokeRect(cube.x, cube.y + hoverY, cube.width, cube.height);

    // Underside arrow indicator (reminding player to jump from underneath!)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', cube.x + cube.width / 2, cube.y + cube.height / 2 + hoverY);

    // Bottom trigger highlight
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cube.x + 4, cube.y + cube.height - 4 + hoverY, cube.width - 8, 3);

    ctx.restore();
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.type === 'buzzsaw') {
      ctx.rotate(obs.angle || 0);

      // Glowing red teeth saw
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;

      // 8 Saw Teeth
      const teeth = 8;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = (i * 2 * Math.PI) / teeth;
        const a2 = ((i + 0.5) * 2 * Math.PI) / teeth;
        const rOuter = obs.radius + 4;
        const rInner = obs.radius - 4;
        ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
        ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
      }
      ctx.closePath();
      ctx.fill();

      // Inner disc
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(0, 0, obs.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Center silver rivet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'plasma_orb') {
      // Orbiting plasma sphere
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 14;

      const pGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, obs.radius);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.4, '#c084fc');
      pGrad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = pGrad;

      ctx.beginPath();
      ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    ctx.save();

    if (!enemy.alive) {
      // Squished state
      const squishRatio = Math.max(0.2, enemy.squishAnim / 0.35);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(
        enemy.x,
        enemy.y + enemy.height * (1 - squishRatio),
        enemy.width,
        enemy.height * squishRatio
      );
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('X X', enemy.x + enemy.width / 2, enemy.y + enemy.height - 4);
      ctx.restore();
      return;
    }

    if (enemy.type === 'flyer') {
      // Flying drone
      const bob = Math.sin(Date.now() * 0.008 + enemy.x) * 4;
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + bob);

      // Drone wings
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.6, -6);
      ctx.lineTo(enemy.width * 0.6, -6);
      ctx.stroke();

      // Body
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.width * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Visor eye
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(enemy.vx > 0 ? 2 : -8, -4, 6, 8);
    } else {
      // Patrol ground walker bot
      // Body
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Stompable head plate (distinct color showing vulnerable top!)
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(enemy.x + 2, enemy.y, enemy.width - 4, 6);

      // Glowing eye
      ctx.fillStyle = '#fef08a';
      const eyeX = enemy.vx > 0 ? enemy.x + enemy.width - 12 : enemy.x + 4;
      ctx.fillRect(eyeX, enemy.y + 10, 8, 8);

      // Legs walking cycle
      const legPhase = Math.sin(Date.now() * 0.012) * 4;
      ctx.fillStyle = '#881337';
      ctx.fillRect(enemy.x + 4, enemy.y + enemy.height - 4 + legPhase, 8, 6);
      ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + enemy.height - 4 - legPhase, 8, 6);
    }

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.save();

    // Invulnerability blink
    if (player.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Ghost trails
    for (const t of player.trail) {
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = t.alpha * 0.5;
      ctx.fillRect(t.x, t.y, player.width, player.height);
    }
    ctx.globalAlpha = player.invulnerableTimer > 0 ? 0.6 : 1.0;

    // Center of player for squash & stretch
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height;

    ctx.translate(cx, cy);
    ctx.scale(player.squashScaleX * player.facing, player.squashScaleY);

    // Double Jump Angelic Wings
    if (player.activePowerUp === 'DOUBLE_JUMP') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-player.width * 0.6, -player.height * 0.6);
      ctx.lineTo(-player.width * 1.3, -player.height * 0.9);
      ctx.lineTo(-player.width * 0.8, -player.height * 0.4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(player.width * 0.6, -player.height * 0.6);
      ctx.lineTo(player.width * 1.3, -player.height * 0.9);
      ctx.lineTo(player.width * 0.8, -player.height * 0.4);
      ctx.fill();
    }

    // Spring boots highlight
    if (player.activePowerUp === 'HIGH_JUMP') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-player.width / 2, -6, player.width, 6);
    }

    // Player Body
    const pGrad = ctx.createLinearGradient(0, -player.height, 0, 0);
    pGrad.addColorStop(0, '#38bdf8');
    pGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = pGrad;
    ctx.fillRect(-player.width / 2, -player.height, player.width, player.height);

    // Visor
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(2, -player.height + 6, player.width * 0.4, 8);

    // Cyber Scarf / Cape trailing behind
    ctx.fillStyle = '#f43f5e';
    const scarfFlap = Math.sin(Date.now() * 0.015) * 4;
    ctx.beginPath();
    ctx.moveTo(-player.width / 2, -player.height + 14);
    ctx.lineTo(-player.width / 2 - 14, -player.height + 18 + scarfFlap);
    ctx.lineTo(-player.width / 2, -player.height + 22);
    ctx.fill();

    // Shield Aura
    if (player.hasShield) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -player.height / 2, player.width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawSummitGate(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y - 70;

    // Glowing Summit Beacon
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 20;

    // Portal Ring
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating Core Star
    ctx.fillStyle = '#fef08a';
    const rot = Date.now() * 0.003;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillRect(-12, -12, 24, 24);
    ctx.restore();

    // Finish Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ SUMMIT GATE · GOAL ★', cx, y - 130);

    ctx.restore();
  }
}
