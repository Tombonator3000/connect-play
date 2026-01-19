/**
 * Monster AI System for Shadows of the 1920s
 * Handles monster spawning, movement, and behavior
 */

import { Enemy, EnemyType, Player, Tile, TileCategory } from '../types';
import { BESTIARY } from '../constants';
import { hexDistance, findPath, getHexNeighbors } from '../hexUtils';

// Monster behavior types
export type MonsterBehavior = 'aggressive' | 'defensive' | 'ranged' | 'ambusher' | 'patrol' | 'swarm';

// Monster state
export type MonsterState = 'idle' | 'patrol' | 'alert' | 'hunting' | 'fleeing';

// AI decision result
export interface AIDecision {
  action: 'move' | 'attack' | 'wait' | 'special';
  targetPosition?: { q: number; r: number };
  targetPlayerId?: string;
  message?: string;
}

// Spawn configuration
export interface SpawnConfig {
  type: EnemyType;
  weight: number; // Higher = more likely
  minDoom: number; // Minimum doom level to spawn
  maxDoom: number; // Maximum doom level to spawn (255 = no limit)
}

// Spawn table by tile category
export const SPAWN_TABLES: Record<TileCategory | 'default', SpawnConfig[]> = {
  nature: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'dark_young', weight: 5, minDoom: 0, maxDoom: 6 },
  ],
  urban: [
    { type: 'cultist', weight: 40, minDoom: 0, maxDoom: 255 },
    { type: 'sniper', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'priest', weight: 10, minDoom: 0, maxDoom: 5 },
  ],
  street: [
    { type: 'cultist', weight: 35, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'hound', weight: 10, minDoom: 0, maxDoom: 5 },
  ],
  facade: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
  ],
  foyer: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
  ],
  corridor: [
    { type: 'ghoul', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'nightgaunt', weight: 10, minDoom: 0, maxDoom: 6 },
  ],
  room: [
    { type: 'cultist', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'mi-go', weight: 10, minDoom: 0, maxDoom: 255 },
  ],
  stairs: [
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
  ],
  basement: [
    { type: 'ghoul', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'formless_spawn', weight: 15, minDoom: 0, maxDoom: 5 },
  ],
  crypt: [
    { type: 'ghoul', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'shoggoth', weight: 5, minDoom: 0, maxDoom: 4 },
    { type: 'star_spawn', weight: 2, minDoom: 0, maxDoom: 2 },
  ],
  default: [
    { type: 'cultist', weight: 40, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'deepone', weight: 15, minDoom: 0, maxDoom: 255 },
  ]
};

// Monster behavior definitions
export const MONSTER_BEHAVIORS: Record<EnemyType, MonsterBehavior> = {
  cultist: 'aggressive',
  deepone: 'aggressive',
  ghoul: 'ambusher',
  shoggoth: 'aggressive',
  boss: 'aggressive',
  sniper: 'ranged',
  priest: 'defensive',
  'mi-go': 'ranged',
  nightgaunt: 'ambusher',
  hound: 'aggressive',
  dark_young: 'aggressive',
  byakhee: 'aggressive',
  star_spawn: 'aggressive',
  formless_spawn: 'swarm',
  hunting_horror: 'aggressive',
  moon_beast: 'ranged'
};

/**
 * Get behavior for an enemy type
 */
export function getMonsterBehavior(type: EnemyType): MonsterBehavior {
  return MONSTER_BEHAVIORS[type] || 'aggressive';
}

/**
 * Select random enemy type from spawn table
 */
export function selectRandomEnemy(
  category: TileCategory | undefined,
  currentDoom: number
): EnemyType | null {
  const table = SPAWN_TABLES[category || 'default'] || SPAWN_TABLES.default;

  // Filter by doom level
  const validSpawns = table.filter(
    config => currentDoom <= config.maxDoom && currentDoom >= config.minDoom
  );

  if (validSpawns.length === 0) return null;

  // Weighted random selection
  const totalWeight = validSpawns.reduce((sum, config) => sum + config.weight, 0);
  let random = Math.random() * totalWeight;

  for (const config of validSpawns) {
    random -= config.weight;
    if (random <= 0) {
      return config.type;
    }
  }

  return validSpawns[0].type;
}

/**
 * Check if a monster should spawn on entering a tile
 */
export function shouldSpawnMonster(
  tile: Tile,
  currentDoom: number,
  existingEnemies: Enemy[],
  isFirstVisit: boolean
): boolean {
  // Higher chance on first visit
  const baseChance = isFirstVisit ? 0.35 : 0.15;

  // Increase chance as doom decreases (getting more dangerous)
  const doomModifier = (15 - currentDoom) * 0.02;

  // Decrease chance if many enemies already present
  const enemyCountPenalty = existingEnemies.length * 0.05;

  // Tile category modifiers
  let categoryModifier = 0;
  if (tile.category === 'crypt' || tile.category === 'basement') {
    categoryModifier = 0.15; // More dangerous areas
  } else if (tile.category === 'street' || tile.category === 'urban') {
    categoryModifier = -0.1; // Safer in public areas during day
  }

  const finalChance = Math.max(0.05, Math.min(0.8,
    baseChance + doomModifier - enemyCountPenalty + categoryModifier
  ));

  return Math.random() < finalChance;
}

/**
 * Create a new enemy at position
 */
export function createEnemy(
  type: EnemyType,
  position: { q: number; r: number }
): Enemy {
  const bestiary = BESTIARY[type];

  return {
    id: `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: bestiary.name,
    type,
    hp: bestiary.hp,
    maxHp: bestiary.hp,
    damage: bestiary.damage,
    horror: bestiary.horror,
    speed: getMonsterSpeed(type),
    position: { ...position },
    visionRange: getMonsterVisionRange(type),
    attackRange: getMonsterAttackRange(type),
    attackType: getMonsterAttackType(type),
    traits: bestiary.traits
  };
}

/**
 * Get monster speed based on type and traits
 */
function getMonsterSpeed(type: EnemyType): number {
  const bestiary = BESTIARY[type];
  let speed = 1;

  if (bestiary.traits?.includes('fast')) speed = 2;
  if (bestiary.traits?.includes('slow')) speed = 0; // Only moves every other turn
  if (bestiary.traits?.includes('flying')) speed = 2;

  return speed;
}

/**
 * Get monster vision range
 */
function getMonsterVisionRange(type: EnemyType): number {
  const behavior = getMonsterBehavior(type);

  switch (behavior) {
    case 'ranged': return 5;
    case 'ambusher': return 2;
    case 'swarm': return 3;
    default: return 4;
  }
}

/**
 * Get monster attack range
 */
function getMonsterAttackRange(type: EnemyType): number {
  const behavior = getMonsterBehavior(type);
  const bestiary = BESTIARY[type];

  if (bestiary.traits?.includes('ranged')) return 3;
  if (behavior === 'ranged') return 3;

  return 1; // Melee
}

/**
 * Get monster attack type
 */
function getMonsterAttackType(type: EnemyType): 'melee' | 'ranged' | 'sanity' | 'doom' {
  const bestiary = BESTIARY[type];

  if (bestiary.traits?.includes('ranged')) return 'ranged';
  if (type === 'nightgaunt' || type === 'hunting_horror') return 'sanity';
  if (type === 'priest' || type === 'star_spawn') return 'doom';

  return 'melee';
}

/**
 * Determine if monster can see player
 */
export function canSeePlayer(
  enemy: Enemy,
  player: Player,
  tiles: Tile[]
): boolean {
  const distance = hexDistance(enemy.position, player.position);

  if (distance > enemy.visionRange) return false;

  // TODO: Add line of sight checking through walls
  // For now, simple distance check
  return true;
}

/**
 * Find nearest visible player
 */
export function findNearestPlayer(
  enemy: Enemy,
  players: Player[],
  tiles: Tile[]
): Player | null {
  const alivePlayers = players.filter(p => !p.isDead);
  if (alivePlayers.length === 0) return null;

  let nearest: Player | null = null;
  let nearestDistance = Infinity;

  for (const player of alivePlayers) {
    if (canSeePlayer(enemy, player, tiles)) {
      const distance = hexDistance(enemy.position, player.position);
      if (distance < nearestDistance) {
        nearest = player;
        nearestDistance = distance;
      }
    }
  }

  return nearest;
}

/**
 * Get random patrol destination
 */
function getPatrolDestination(
  enemy: Enemy,
  tiles: Tile[],
  enemies: Enemy[]
): { q: number; r: number } | null {
  const neighbors = getHexNeighbors(enemy.position);
  const occupiedPositions = new Set(enemies.map(e => `${e.position.q},${e.position.r}`));

  // Find valid moves
  const validMoves = neighbors.filter(pos => {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) return false;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile) return false;
    if (tile.obstacle?.blocking) return false;

    return true;
  });

  if (validMoves.length === 0) return null;

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

/**
 * Main AI decision function for a monster
 */
export function getMonsterDecision(
  enemy: Enemy,
  players: Player[],
  enemies: Enemy[],
  tiles: Tile[]
): AIDecision {
  const behavior = getMonsterBehavior(enemy.type);
  const nearestPlayer = findNearestPlayer(enemy, players, tiles);

  // No visible players - patrol or wait
  if (!nearestPlayer) {
    // Ambushers wait in place
    if (behavior === 'ambusher') {
      return { action: 'wait', message: `${enemy.name} lurker i skyggen...` };
    }

    // Others patrol
    const patrolDest = getPatrolDestination(enemy, tiles, enemies);
    if (patrolDest) {
      return {
        action: 'move',
        targetPosition: patrolDest,
        message: `${enemy.name} patruljerer...`
      };
    }

    return { action: 'wait' };
  }

  // Player visible - decide action based on behavior
  const distanceToPlayer = hexDistance(enemy.position, nearestPlayer.position);

  // Can attack?
  if (distanceToPlayer <= enemy.attackRange) {
    return {
      action: 'attack',
      targetPlayerId: nearestPlayer.id,
      message: `${enemy.name} angriper ${nearestPlayer.name}!`
    };
  }

  // Ranged behavior - try to maintain distance
  if (behavior === 'ranged') {
    if (distanceToPlayer < 2) {
      // Too close, try to back away
      const awayDir = {
        q: enemy.position.q - nearestPlayer.position.q,
        r: enemy.position.r - nearestPlayer.position.r
      };
      const retreatPos = {
        q: enemy.position.q + Math.sign(awayDir.q),
        r: enemy.position.r + Math.sign(awayDir.r)
      };
      return {
        action: 'move',
        targetPosition: retreatPos,
        message: `${enemy.name} trekker seg tilbake for a sikte...`
      };
    }
  }

  // Defensive behavior - only chase if very close
  if (behavior === 'defensive' && distanceToPlayer > 3) {
    return { action: 'wait', message: `${enemy.name} vokter sin posisjon.` };
  }

  // Chase the player
  const otherEnemyPositions = new Set(
    enemies
      .filter(e => e.id !== enemy.id)
      .map(e => `${e.position.q},${e.position.r}`)
  );

  const path = findPath(
    enemy.position,
    [nearestPlayer.position],
    tiles,
    otherEnemyPositions,
    false
  );

  if (path && path.length > 1) {
    // Move towards player (up to speed)
    const moveIndex = Math.min(enemy.speed, path.length - 1);
    return {
      action: 'move',
      targetPosition: path[moveIndex],
      message: `${enemy.name} jakter pa ${nearestPlayer.name}!`
    };
  }

  return { action: 'wait' };
}

/**
 * Process all enemy AI decisions for a turn
 */
export function processEnemyTurn(
  enemies: Enemy[],
  players: Player[],
  tiles: Tile[]
): {
  updatedEnemies: Enemy[];
  attacks: Array<{ enemy: Enemy; targetPlayer: Player }>;
  messages: string[];
} {
  const updatedEnemies: Enemy[] = [...enemies];
  const attacks: Array<{ enemy: Enemy; targetPlayer: Player }> = [];
  const messages: string[] = [];

  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];

    // Skip dead enemies
    if (enemy.hp <= 0) continue;

    // Slow enemies only move every other turn
    if (enemy.traits?.includes('slow') && Math.random() < 0.5) {
      messages.push(`${enemy.name} beveger seg sakte...`);
      continue;
    }

    const decision = getMonsterDecision(enemy, players, updatedEnemies, tiles);

    switch (decision.action) {
      case 'move':
        if (decision.targetPosition) {
          updatedEnemies[i] = {
            ...enemy,
            position: decision.targetPosition
          };
        }
        break;

      case 'attack':
        const targetPlayer = players.find(p => p.id === decision.targetPlayerId);
        if (targetPlayer) {
          attacks.push({ enemy, targetPlayer });
        }
        break;
    }

    if (decision.message) {
      messages.push(decision.message);
    }
  }

  return { updatedEnemies, attacks, messages };
}

/**
 * Spawn multiple enemies for a wave event
 */
export function spawnWave(
  type: EnemyType,
  count: number,
  nearPosition: { q: number; r: number },
  tiles: Tile[],
  existingEnemies: Enemy[]
): Enemy[] {
  const newEnemies: Enemy[] = [];
  const occupiedPositions = new Set([
    ...existingEnemies.map(e => `${e.position.q},${e.position.r}`),
    `${nearPosition.q},${nearPosition.r}`
  ]);

  // Find spawn positions near the given position
  const candidates = getHexNeighbors(nearPosition);
  const spawnPositions: { q: number; r: number }[] = [];

  for (const pos of candidates) {
    const key = `${pos.q},${pos.r}`;
    if (!occupiedPositions.has(key)) {
      const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
      if (tile && !tile.obstacle?.blocking) {
        spawnPositions.push(pos);
        occupiedPositions.add(key);
      }
    }
    if (spawnPositions.length >= count) break;
  }

  // Create enemies at spawn positions
  for (let i = 0; i < Math.min(count, spawnPositions.length); i++) {
    newEnemies.push(createEnemy(type, spawnPositions[i]));
  }

  return newEnemies;
}
