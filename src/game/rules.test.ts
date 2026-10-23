import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processCubeBreak,
  calculateDifficultyScaling,
  checkUndersideCubeCollision,
  checkEnemyCollision,
  calculateLevelSummary,
} from './rules';

test('Power-up Cube mechanism: breaking 1 cube increments count, 2 cubes triggers power-up and resets to 0', () => {
  // 1st cube broken: count becomes 1, no power-up yet
  const firstBreak = processCubeBreak(0, 'DOUBLE_JUMP');
  assert.equal(firstBreak.newCount, 1);
  assert.equal(firstBreak.triggeredPowerUp, null);

  // 2nd cube broken: count resets to 0, power-up triggered!
  const secondBreak = processCubeBreak(1, 'DOUBLE_JUMP');
  assert.equal(secondBreak.newCount, 0);
  assert.equal(secondBreak.triggeredPowerUp, 'DOUBLE_JUMP');

  // Next cube starts cycle over again
  const thirdBreak = processCubeBreak(secondBreak.newCount, 'SHIELD');
  assert.equal(thirdBreak.newCount, 1);
  assert.equal(thirdBreak.triggeredPowerUp, null);
});

test('Difficulty scaling: altitude increases obstacle speed multiplier and tier', () => {
  // At ground (Y=500), altitude is 0, base speed 1.0x
  const ground = calculateDifficultyScaling(500, 500);
  assert.equal(ground.altitudeMeters, 0);
  assert.equal(ground.speedMultiplier, 1.0);
  assert.equal(ground.tier, 1);

  // Climbed 1000px higher (Y=-500), altitude = 20m, speed scales up
  const midClimb = calculateDifficultyScaling(-500, 500);
  assert.equal(midClimb.altitudeMeters, 20);
  assert.ok(midClimb.speedMultiplier > 1.2);
  assert.equal(midClimb.tier, 2);

  // High altitude summit (Y=-2500), altitude = 60m, speed scales to ~2.2x or higher
  const highAltitude = calculateDifficultyScaling(-2500, 500);
  assert.equal(highAltitude.altitudeMeters, 60);
  assert.ok(highAltitude.speedMultiplier >= 2.0);
  assert.equal(highAltitude.tier, 4);
});

test('Underside cube collision: triggers only when player hits from below moving upward', () => {
  const cube = { x: 200, y: 150, width: 40, height: 40 };

  // Case 1: Player jumping upwards directly into bottom of cube
  const jumpingPlayer = { x: 205, y: 190, width: 30, height: 36 };
  const hit = checkUndersideCubeCollision(jumpingPlayer, -200, cube);
  assert.equal(hit, true);

  // Case 2: Player falling downwards onto top of cube (not underside)
  const fallingPlayer = { x: 205, y: 110, width: 30, height: 36 };
  const topHit = checkUndersideCubeCollision(fallingPlayer, 200, cube);
  assert.equal(topHit, false);

  // Case 3: Player far to the right
  const farPlayer = { x: 400, y: 190, width: 30, height: 36 };
  const miss = checkUndersideCubeCollision(farPlayer, -200, cube);
  assert.equal(miss, false);
});

test('Enemy collision: stomp on top defeats enemy; side/bottom collision hurts player', () => {
  const enemy = { x: 300, y: 400, width: 40, height: 30 };

  // Case 1: Player falling onto top of enemy (stomp)
  const stompingPlayer = { x: 305, y: 370, width: 30, height: 36 }; // feet at y=406
  const stompResult = checkEnemyCollision(stompingPlayer, 150, enemy);
  assert.equal(stompResult.isStomp, true);
  assert.equal(stompResult.isDamage, false);

  // Case 2: Player walking horizontally into enemy side (damage)
  const walkingPlayer = { x: 290, y: 395, width: 30, height: 36 }; // feet at y=431
  const damageResult = checkEnemyCollision(walkingPlayer, 0, enemy);
  assert.equal(damageResult.isStomp, false);
  assert.equal(damageResult.isDamage, true);
});

test('Level summary & rank evaluation: assigns S, A, B, or C with appropriate feedback', () => {
  // Legendary run: high score, 4 cubes, 3 enemies
  const sSummary = calculateLevelSummary(4000, 4, 4, 80, 45);
  assert.equal(sSummary.rank, 'S');
  assert.equal(sSummary.stars, 3);

  // Standard run
  const bSummary = calculateLevelSummary(500, 1, 1, 30, 80);
  assert.ok(['B', 'C'].includes(bSummary.rank));
});
