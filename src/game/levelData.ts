import { Platform, PowerUpCube, Enemy, Obstacle } from './types';

export interface LevelData {
  id: string;
  name: string;
  description: string;
  groundY: number;
  spawnPoint: { x: number; y: number };
  summitY: number;
  platforms: Platform[];
  cubes: PowerUpCube[];
  enemies: Enemy[];
  obstacles: Obstacle[];
}

export function createStage1(): LevelData {
  const groundY = 500;
  const summitY = -3500;

  // 1. Platforms
  const platforms: Platform[] = [
    // --- SECTION 1: HORIZONTAL SPRINT (x: 0 to 1250, y ~ 500) ---
    // Starting ground
    { id: 'ground-1', x: -100, y: groundY, width: 600, height: 60, type: 'ground' },
    { id: 'ground-pit-bridge', x: 550, y: groundY, width: 650, height: 60, type: 'ground' },

    // Horizontal introductory platforms with cubes underneath
    { id: 'p-intro-1', x: 240, y: 380, width: 150, height: 24, type: 'normal' },
    { id: 'p-intro-2', x: 450, y: 340, width: 140, height: 24, type: 'normal' },
    { id: 'p-intro-3', x: 670, y: 360, width: 160, height: 24, type: 'normal' },

    // Moving horizontal platform across small chasm
    {
      id: 'p-move-h1',
      x: 880,
      y: 330,
      width: 120,
      height: 22,
      type: 'moving_h',
      initialX: 880,
      minX: 860,
      maxX: 1060,
      vx: 80,
    },

    // Stepping stones transitioning into the vertical tower shaft
    { id: 'p-trans-1', x: 1120, y: 410, width: 110, height: 24, type: 'normal' },
    { id: 'p-trans-2', x: 1240, y: 310, width: 110, height: 24, type: 'normal' },
    { id: 'p-trans-3', x: 1140, y: 200, width: 130, height: 24, type: 'normal' },
    { id: 'p-trans-4', x: 1020, y: 90, width: 150, height: 24, type: 'normal' },

    // --- SECTION 2: VERTICAL CLIMB TOWER (x: 850..1450, y: 50 to -3500) ---
    // Left & right shaft decorative walls/ledges
    { id: 'wall-left-base', x: 860, y: -3600, width: 30, height: 4200, type: 'normal' },
    { id: 'wall-right-base', x: 1460, y: -3600, width: 30, height: 4200, type: 'normal' },

    // --- TIER 1: The Ascent Begins (y: 0 to -800) ---
    // Vertical moving lift 1
    {
      id: 'lift-1',
      x: 1200,
      y: 0,
      width: 110,
      height: 22,
      type: 'vertical_lift',
      initialY: 0,
      minY: -220,
      maxY: 30,
      vy: -70,
    },
    { id: 'p-tier1-1', x: 920, y: -240, width: 160, height: 24, type: 'normal' },
    { id: 'p-tier1-2', x: 1220, y: -360, width: 170, height: 24, type: 'normal' },
    { id: 'p-tier1-3', x: 980, y: -480, width: 150, height: 24, type: 'normal' },

    // Moving horizontal platform
    {
      id: 'p-tier1-h-move',
      x: 1050,
      y: -600,
      width: 120,
      height: 22,
      type: 'moving_h',
      initialX: 1050,
      minX: 960,
      maxX: 1340,
      vx: 90,
    },
    { id: 'p-tier1-4', x: 1240, y: -720, width: 160, height: 24, type: 'normal' },

    // --- TIER 2: Escalating Height & Speed (y: -800 to -1700) ---
    // Vertical lift 2 (taller range)
    {
      id: 'lift-2',
      x: 960,
      y: -820,
      width: 110,
      height: 22,
      type: 'vertical_lift',
      initialY: -820,
      minY: -1100,
      maxY: -800,
      vy: -90,
    },
    { id: 'p-tier2-1', x: 1180, y: -1120, width: 150, height: 24, type: 'normal' },
    { id: 'p-tier2-2', x: 940, y: -1260, width: 140, height: 24, type: 'normal' },

    // Fast moving horizontal platform
    {
      id: 'p-tier2-h-move',
      x: 1150,
      y: -1380,
      width: 100,
      height: 22,
      type: 'moving_h',
      initialX: 1150,
      minX: 970,
      maxX: 1350,
      vx: 110,
    },
    { id: 'p-tier2-3', x: 930, y: -1520, width: 150, height: 24, type: 'normal' },
    { id: 'p-tier2-4', x: 1250, y: -1640, width: 150, height: 24, type: 'normal' },

    // --- TIER 3: High-Altitude Hazard Zone (y: -1700 to -2600) ---
    {
      id: 'lift-3',
      x: 1080,
      y: -1760,
      width: 100,
      height: 22,
      type: 'vertical_lift',
      initialY: -1760,
      minY: -2060,
      maxY: -1740,
      vy: -110,
    },
    { id: 'p-tier3-1', x: 1260, y: -2080, width: 130, height: 24, type: 'normal' },
    { id: 'p-tier3-2', x: 940, y: -2220, width: 140, height: 24, type: 'normal' },
    { id: 'p-tier3-3', x: 1190, y: -2360, width: 130, height: 24, type: 'normal' },
    {
      id: 'p-tier3-h-move',
      x: 1020,
      y: -2480,
      width: 95,
      height: 22,
      type: 'moving_h',
      initialX: 1020,
      minX: 950,
      maxX: 1360,
      vx: 130,
    },
    { id: 'p-tier3-4', x: 1220, y: -2620, width: 150, height: 24, type: 'normal' },

    // --- TIER 4: The Apex & Summit Approach (y: -2700 to -3550) ---
    {
      id: 'lift-4',
      x: 980,
      y: -2740,
      width: 95,
      height: 22,
      type: 'vertical_lift',
      initialY: -2740,
      minY: -3050,
      maxY: -2720,
      vy: -130,
    },
    { id: 'p-tier4-1', x: 1200, y: -3080, width: 120, height: 24, type: 'normal' },
    { id: 'p-tier4-2', x: 960, y: -3220, width: 120, height: 24, type: 'normal' },
    {
      id: 'p-tier4-h-move',
      x: 1150,
      y: -3340,
      width: 90,
      height: 22,
      type: 'moving_h',
      initialX: 1150,
      minX: 980,
      maxX: 1350,
      vx: 140,
    },
    { id: 'p-tier4-3', x: 970, y: -3460, width: 140, height: 24, type: 'normal' },

    // Summit Finish Platform
    { id: 'p-summit-gate', x: 1050, y: summitY, width: 250, height: 32, type: 'finish' },
  ];

  // 2. Power-Up Cubes (Strategically placed UNDER platforms to be broken from below!)
  const cubes: PowerUpCube[] = [
    // Horizontal stage cubes (hit 2 to get power-up early in the climb!)
    { id: 'cube-intro-1', x: 290, y: 404, width: 38, height: 38, broken: false, hitAnim: 0 },
    { id: 'cube-intro-2', x: 720, y: 384, width: 38, height: 38, broken: false, hitAnim: 0 },

    // Tier 1 vertical climb cubes
    { id: 'cube-tier1-1', x: 970, y: -216, width: 38, height: 38, broken: false, hitAnim: 0 },
    { id: 'cube-tier1-2', x: 1270, y: -336, width: 38, height: 38, broken: false, hitAnim: 0 },

    // Tier 2 vertical climb cubes
    { id: 'cube-tier2-1', x: 1220, y: -1096, width: 38, height: 38, broken: false, hitAnim: 0 },
    { id: 'cube-tier2-2', x: 980, y: -1236, width: 38, height: 38, broken: false, hitAnim: 0 },

    // Tier 3 high-altitude cubes
    { id: 'cube-tier3-1', x: 1290, y: -2056, width: 38, height: 38, broken: false, hitAnim: 0 },
    { id: 'cube-tier3-2', x: 980, y: -2196, width: 38, height: 38, broken: false, hitAnim: 0 },

    // Tier 4 apex cubes
    { id: 'cube-tier4-1', x: 1230, y: -3056, width: 38, height: 38, broken: false, hitAnim: 0 },
    { id: 'cube-tier4-2', x: 1010, y: -3436, width: 38, height: 38, broken: false, hitAnim: 0 },
  ];

  // 3. Stompable Patrol & Flying Enemies
  const enemies: Enemy[] = [
    // Ground enemies (horizontal section)
    {
      id: 'e-patrol-1',
      type: 'patrol',
      x: 480,
      y: groundY - 32,
      width: 36,
      height: 32,
      vx: 60,
      vy: 0,
      minX: 420,
      maxX: 540,
      alive: true,
      squishAnim: 0,
      speed: 60,
    },
    {
      id: 'e-patrol-2',
      type: 'patrol',
      x: 750,
      y: groundY - 32,
      width: 36,
      height: 32,
      vx: -60,
      vy: 0,
      minX: 680,
      maxX: 840,
      alive: true,
      squishAnim: 0,
      speed: 60,
    },

    // Tier 1 enemies
    {
      id: 'e-tier1-1',
      type: 'patrol',
      x: 950,
      y: -240 - 32,
      width: 36,
      height: 32,
      vx: 55,
      vy: 0,
      minX: 925,
      maxX: 1055,
      alive: true,
      squishAnim: 0,
      speed: 55,
    },
    {
      id: 'e-tier1-2',
      type: 'flyer',
      x: 1020,
      y: -480 - 32,
      width: 34,
      height: 30,
      vx: 70,
      vy: 0,
      minX: 990,
      maxX: 1110,
      alive: true,
      squishAnim: 0,
      speed: 70,
    },

    // Tier 2 enemies
    {
      id: 'e-tier2-1',
      type: 'patrol',
      x: 1200,
      y: -1120 - 32,
      width: 36,
      height: 32,
      vx: -75,
      vy: 0,
      minX: 1185,
      maxX: 1310,
      alive: true,
      squishAnim: 0,
      speed: 75,
    },
    {
      id: 'e-tier2-2',
      type: 'flyer',
      x: 960,
      y: -1520 - 32,
      width: 34,
      height: 30,
      vx: 80,
      vy: 0,
      minX: 940,
      maxX: 1060,
      alive: true,
      squishAnim: 0,
      speed: 80,
    },

    // Tier 3 enemies
    {
      id: 'e-tier3-1',
      type: 'patrol',
      x: 960,
      y: -2220 - 32,
      width: 36,
      height: 32,
      vx: 85,
      vy: 0,
      minX: 945,
      maxX: 1060,
      alive: true,
      squishAnim: 0,
      speed: 85,
    },
    {
      id: 'e-tier3-2',
      type: 'flyer',
      x: 1210,
      y: -2360 - 32,
      width: 34,
      height: 30,
      vx: -90,
      vy: 0,
      minX: 1200,
      maxX: 1300,
      alive: true,
      squishAnim: 0,
      speed: 90,
    },

    // Tier 4 enemies
    {
      id: 'e-tier4-1',
      type: 'flyer',
      x: 990,
      y: -3220 - 32,
      width: 34,
      height: 30,
      vx: 100,
      vy: 0,
      minX: 970,
      maxX: 1060,
      alive: true,
      squishAnim: 0,
      speed: 100,
    },
  ];

  // 4. Moving Obstacles (Speed and frequency scale up with altitude!)
  const obstacles: Obstacle[] = [
    // Tier 1 Buzzsaw (slow, wide opening)
    {
      id: 'obs-saw-1',
      type: 'buzzsaw',
      x: 1100,
      y: -300,
      radius: 18,
      baseVx: 60,
      baseVy: 0,
      vx: 60,
      vy: 0,
      minX: 1000,
      maxX: 1240,
      rotationSpeed: 8,
    },

    // Tier 2 Plasma Orbs (moving faster as altitude scales)
    {
      id: 'obs-orb-1',
      type: 'plasma_orb',
      x: 1120,
      y: -1200,
      radius: 20,
      baseVx: 80,
      baseVy: 0,
      vx: 80,
      vy: 0,
      minX: 1020,
      maxX: 1280,
      rotationSpeed: 10,
    },
    {
      id: 'obs-saw-2',
      type: 'buzzsaw',
      x: 1080,
      y: -1450,
      radius: 22,
      baseVx: -95,
      baseVy: 0,
      vx: -95,
      vy: 0,
      minX: 980,
      maxX: 1300,
      rotationSpeed: 12,
    },

    // Tier 3 Fast Moving Obstacles (tight timing)
    {
      id: 'obs-saw-3',
      type: 'buzzsaw',
      x: 1050,
      y: -2150,
      radius: 22,
      baseVx: 110,
      baseVy: 0,
      vx: 110,
      vy: 0,
      minX: 970,
      maxX: 1330,
      rotationSpeed: 14,
    },
    {
      id: 'obs-orb-2',
      type: 'plasma_orb',
      x: 1230,
      y: -2420,
      radius: 22,
      baseVx: -120,
      baseVy: 0,
      vx: -120,
      vy: 0,
      minX: 1000,
      maxX: 1340,
      rotationSpeed: 15,
    },

    // Tier 4 High-Altitude Apex Obstacles (Fast, high difficulty)
    {
      id: 'obs-saw-4',
      type: 'buzzsaw',
      x: 1120,
      y: -3150,
      radius: 24,
      baseVx: 130,
      baseVy: 0,
      vx: 130,
      vy: 0,
      minX: 990,
      maxX: 1330,
      rotationSpeed: 16,
    },
    {
      id: 'obs-saw-5',
      type: 'buzzsaw',
      x: 1150,
      y: -3400,
      radius: 24,
      baseVx: -140,
      baseVy: 0,
      vx: -140,
      vy: 0,
      minX: 990,
      maxX: 1340,
      rotationSpeed: 18,
    },
  ];

  return {
    id: 'stage-1',
    name: 'Sector 01: Neon Foothills & The Spire Ascent',
    description: 'Sprint horizontally across neon terrain, then ascend the towering vertical cyber spire.',
    groundY,
    spawnPoint: { x: 50, y: groundY - 45 },
    summitY,
    platforms,
    cubes,
    enemies,
    obstacles,
  };
}
