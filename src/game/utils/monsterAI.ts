/**
 * Monster AI System for Shadows of the 1920s
 * Enhanced AI with pathfinding, target prioritization, and special abilities
 * Version 2.0 - January 2026
 */

import { Enemy, EnemyType, Player, Tile, TileCategory, TileObjectType } from '../types';
import { BESTIARY } from '../constants';
import { hexDistance, findPath, getHexNeighbors, hasLineOfSight } from '../hexUtils';

// ============================================================================
// OBSTACLE HANDLING SYSTEM
// ============================================================================

/**
 * Obstacle types and how different monsters can interact with them
 */
export const OBSTACLE_PASSABILITY: Record<TileObjectType, {
  blocking: boolean;
  flyingCanPass: boolean;
  aquaticCanPass: boolean;
  etherealCanPass: boolean; // For creatures like nightgaunts
  massiveCanDestroy: boolean;
  movementCost: number; // Extra movement cost to traverse (0 = impassable)
}> = {
  locked_door: { blocking: true, flyingCanPass: false, aquaticCanPass: false, etherealCanPass: false, massiveCanDestroy: true, movementCost: 0 },
  rubble: { blocking: true, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  fire: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: false, movementCost: 1 },
  trap: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: false, movementCost: 0 },
  fog_wall: { blocking: false, flyingCanPass: true, aquaticCanPass: true, etherealCanPass: true, massiveCanDestroy: false, movementCost: 1 },
  gate: { blocking: true, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: false, massiveCanDestroy: true, movementCost: 0 },
  barricade: { blocking: true, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  altar: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: false, movementCost: 0 },
  bookshelf: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  crate: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  chest: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  cabinet: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  mirror: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  radio: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  switch: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: false, movementCost: 0 },
  statue: { blocking: false, flyingCanPass: true, aquaticCanPass: false, etherealCanPass: true, massiveCanDestroy: true, movementCost: 0 },
  exit_door: { blocking: false, flyingCanPass: true, aquaticCanPass: true, etherealCanPass: true, massiveCanDestroy: false, movementCost: 0 },
};

/**
 * Check if an enemy can pass through a tile based on obstacles and traits
 */
export function canEnemyPassTile(enemy: Enemy, tile: Tile): { canPass: boolean; movementCost: number } {
  // Check main obstacle
  if (tile.obstacle?.blocking) {
    // Flying enemies can pass over most obstacles
    if (enemy.traits?.includes('flying')) {
      return { canPass: true, movementCost: 0 };
    }
    // Massive enemies can sometimes destroy obstacles
    if (enemy.traits?.includes('massive')) {
      return { canPass: false, movementCost: 0 }; // Will need to destroy first
    }
    return { canPass: false, movementCost: 0 };
  }

  // Check tile object
  if (tile.object) {
    const obstacleInfo = OBSTACLE_PASSABILITY[tile.object.type];
    if (obstacleInfo) {
      // Check explicit blocking flag on the object
      if (tile.object.blocking) {
        if (enemy.traits?.includes('flying') && obstacleInfo.flyingCanPass) {
          return { canPass: true, movementCost: 0 };
        }
        if (enemy.traits?.includes('aquatic') && obstacleInfo.aquaticCanPass) {
          return { canPass: true, movementCost: 0 };
        }
        if ((enemy.type === 'nightgaunt' || enemy.type === 'hunting_horror') && obstacleInfo.etherealCanPass) {
          return { canPass: true, movementCost: 0 };
        }
        return { canPass: false, movementCost: 0 };
      }

      // Non-blocking obstacles may have movement cost
      return { canPass: true, movementCost: obstacleInfo.movementCost };
    }
  }

  // Water tiles - aquatic enemies get bonus, others may struggle
  if (tile.hasWater) {
    if (enemy.traits?.includes('aquatic')) {
      return { canPass: true, movementCost: -1 }; // Bonus movement in water!
    }
    if (enemy.traits?.includes('flying')) {
      return { canPass: true, movementCost: 0 };
    }
    // Ground-based enemies struggle in water
    return { canPass: true, movementCost: 1 };
  }

  return { canPass: true, movementCost: 0 };
}

// ============================================================================
// TARGET PRIORITIZATION SYSTEM
// ============================================================================

/**
 * Target priority factors with weights
 */
export interface TargetPriority {
  player: Player;
  score: number;
  factors: {
    distance: number;
    lowHp: number;
    lowSanity: number;
    isolated: number;
    carriesItem: number;
    typePreference: number;
  };
}

/**
 * Enemy type-specific target preferences
 */
export const ENEMY_TARGET_PREFERENCES: Record<EnemyType, {
  preferLowHp: boolean;      // Targets wounded players
  preferLowSanity: boolean;  // Targets mentally weak players
  preferIsolated: boolean;   // Targets players alone
  preferClass?: string[];    // Specific character classes to target
  avoidClass?: string[];     // Classes to avoid
  preferWater?: boolean;     // Prefers targets near water
}> = {
  cultist: { preferLowHp: false, preferLowSanity: false, preferIsolated: true },
  deepone: { preferLowHp: false, preferLowSanity: false, preferIsolated: false, preferWater: true },
  ghoul: { preferLowHp: true, preferLowSanity: false, preferIsolated: true }, // Scavengers target wounded
  shoggoth: { preferLowHp: false, preferLowSanity: false, preferIsolated: false }, // Targets everything equally
  boss: { preferLowHp: false, preferLowSanity: false, preferIsolated: false, preferClass: ['professor', 'occultist'] }, // Targets magic users
  sniper: { preferLowHp: false, preferLowSanity: false, preferIsolated: true, avoidClass: ['veteran'] }, // Avoids tough targets
  priest: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['occultist'] }, // Targets mentally weak
  'mi-go': { preferLowHp: false, preferLowSanity: false, preferIsolated: true, preferClass: ['professor'] }, // Wants brains
  nightgaunt: { preferLowHp: false, preferLowSanity: true, preferIsolated: true }, // Psychological terror
  hound: { preferLowHp: true, preferLowSanity: false, preferIsolated: true }, // Hunter instinct
  dark_young: { preferLowHp: false, preferLowSanity: false, preferIsolated: false }, // Rampages through all
  byakhee: { preferLowHp: false, preferLowSanity: true, preferIsolated: true }, // Swoops down on weak minds
  star_spawn: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['professor', 'occultist'] },
  formless_spawn: { preferLowHp: true, preferLowSanity: false, preferIsolated: false }, // Engulfs wounded
  hunting_horror: { preferLowHp: false, preferLowSanity: true, preferIsolated: true }, // Hunts the terrified
  moon_beast: { preferLowHp: false, preferLowSanity: false, preferIsolated: true, avoidClass: ['veteran'] }, // Ranged, avoids melee fighters
};

/**
 * Calculate target priority for a player
 */
export function calculateTargetPriority(
  enemy: Enemy,
  player: Player,
  allPlayers: Player[],
  tiles: Tile[]
): TargetPriority {
  const preferences = ENEMY_TARGET_PREFERENCES[enemy.type] || {
    preferLowHp: false,
    preferLowSanity: false,
    preferIsolated: false
  };

  const distance = hexDistance(enemy.position, player.position);

  // Base score (closer = higher priority)
  const maxDistance = 10;
  const distanceScore = Math.max(0, (maxDistance - distance) * 10);

  // Low HP bonus (0-30 points)
  const hpPercent = player.hp / player.maxHp;
  const lowHpScore = preferences.preferLowHp ? Math.round((1 - hpPercent) * 30) : 0;

  // Low Sanity bonus (0-25 points)
  const sanityPercent = player.sanity / player.maxSanity;
  const lowSanityScore = preferences.preferLowSanity ? Math.round((1 - sanityPercent) * 25) : 0;

  // Isolation bonus (0-20 points)
  const nearbyAllies = allPlayers.filter(p =>
    p.id !== player.id &&
    !p.isDead &&
    hexDistance(p.position, player.position) <= 2
  ).length;
  const isolatedScore = preferences.preferIsolated ? (nearbyAllies === 0 ? 20 : 0) : 0;

  // Type preference bonus (0-15 points)
  let typePreferenceScore = 0;
  if (preferences.preferClass?.includes(player.characterClass)) {
    typePreferenceScore = 15;
  }
  if (preferences.avoidClass?.includes(player.characterClass)) {
    typePreferenceScore = -20; // Penalty for avoided classes
  }

  // Water preference (for deep ones)
  if (preferences.preferWater) {
    const playerTile = tiles.find(t => t.q === player.position.q && t.r === player.position.r);
    if (playerTile?.hasWater) {
      typePreferenceScore += 15;
    }
  }

  // Items bonus - target players with specific items (for quest scenarios)
  const carriesItemScore = 0; // Could be extended to check for quest items

  const totalScore = distanceScore + lowHpScore + lowSanityScore + isolatedScore + typePreferenceScore + carriesItemScore;

  return {
    player,
    score: totalScore,
    factors: {
      distance: distanceScore,
      lowHp: lowHpScore,
      lowSanity: lowSanityScore,
      isolated: isolatedScore,
      carriesItem: carriesItemScore,
      typePreference: typePreferenceScore
    }
  };
}

/**
 * Find best target using priority system
 */
export function findBestTarget(
  enemy: Enemy,
  players: Player[],
  tiles: Tile[]
): Player | null {
  const alivePlayers = players.filter(p => !p.isDead);
  if (alivePlayers.length === 0) return null;

  // Filter to visible players
  const visiblePlayers = alivePlayers.filter(p => canSeePlayer(enemy, p, tiles));
  if (visiblePlayers.length === 0) return null;

  // Calculate priority for each player
  const priorities = visiblePlayers.map(p =>
    calculateTargetPriority(enemy, p, alivePlayers, tiles)
  );

  // Sort by score (highest first)
  priorities.sort((a, b) => b.score - a.score);

  return priorities[0].player;
}

// Monster behavior types
export type MonsterBehavior = 'aggressive' | 'defensive' | 'ranged' | 'ambusher' | 'patrol' | 'swarm';

// Monster state
export type MonsterState = 'idle' | 'patrol' | 'alert' | 'hunting' | 'fleeing';

// Special movement types
export type SpecialMovement = 'teleport' | 'phase' | 'burrow' | 'swim' | 'fly';

// ============================================================================
// ENHANCED PATHFINDING SYSTEM
// ============================================================================

/**
 * Enhanced pathfinding that considers monster abilities and obstacle types
 * This is a weighted A* algorithm that accounts for movement costs
 */
export function findEnhancedPath(
  enemy: Enemy,
  start: { q: number; r: number },
  goals: { q: number; r: number }[],
  tiles: Tile[],
  blockers: Set<string>,
  maxDepth: number = 12
): { path: { q: number; r: number }[]; totalCost: number } | null {
  // Priority queue with movement cost consideration
  const openSet: {
    pos: { q: number; r: number };
    path: { q: number; r: number }[];
    gCost: number; // Movement cost so far
    fCost: number; // gCost + heuristic
  }[] = [];

  const closedSet = new Set<string>();
  const gCosts = new Map<string, number>();

  // Calculate heuristic (distance to nearest goal)
  const heuristic = (pos: { q: number; r: number }): number => {
    return Math.min(...goals.map(g => hexDistance(pos, g)));
  };

  // Start node
  const startKey = `${start.q},${start.r}`;
  gCosts.set(startKey, 0);
  openSet.push({
    pos: start,
    path: [],
    gCost: 0,
    fCost: heuristic(start)
  });

  while (openSet.length > 0) {
    // Sort by fCost and get lowest
    openSet.sort((a, b) => a.fCost - b.fCost);
    const current = openSet.shift()!;

    // Check if we reached a goal
    for (const goal of goals) {
      if (current.pos.q === goal.q && current.pos.r === goal.r) {
        return {
          path: [...current.path, current.pos],
          totalCost: current.gCost
        };
      }
    }

    // Path too long
    if (current.path.length >= maxDepth) continue;

    const currentKey = `${current.pos.q},${current.pos.r}`;
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    // Get neighbors
    const neighbors = getHexNeighbors(current.pos);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.q},${neighbor.r}`;
      if (closedSet.has(neighborKey)) continue;

      // Find tile
      const tile = tiles.find(t => t.q === neighbor.q && t.r === neighbor.r);
      if (!tile) continue;

      // Check if enemy can pass this tile
      const passability = canEnemyPassTile(enemy, tile);
      if (!passability.canPass) continue;

      // Check for other blockers (other enemies)
      const isGoal = goals.some(g => g.q === neighbor.q && g.r === neighbor.r);
      if (!isGoal && blockers.has(neighborKey)) continue;

      // Calculate movement cost (base 1 + any obstacle costs)
      const movementCost = 1 + Math.max(0, passability.movementCost);
      const newGCost = current.gCost + movementCost;

      // Check if this is a better path
      const existingGCost = gCosts.get(neighborKey);
      if (existingGCost !== undefined && newGCost >= existingGCost) continue;

      gCosts.set(neighborKey, newGCost);
      openSet.push({
        pos: neighbor,
        path: [...current.path, neighbor],
        gCost: newGCost,
        fCost: newGCost + heuristic(neighbor)
      });
    }
  }

  return null;
}

// ============================================================================
// SPECIAL MOVEMENT ABILITIES
// ============================================================================

/**
 * Check if enemy has a special movement ability
 */
export function getSpecialMovement(enemy: Enemy): SpecialMovement | null {
  if (enemy.traits?.includes('flying')) return 'fly';
  if (enemy.traits?.includes('aquatic')) return 'swim';

  // Type-specific special movements
  switch (enemy.type) {
    case 'nightgaunt':
      return 'phase'; // Can phase through some obstacles
    case 'hound':
      return 'teleport'; // Hounds of Tindalos teleport through angles
    case 'formless_spawn':
      return 'phase'; // Can squeeze through gaps
    default:
      return null;
  }
}

/**
 * Get teleport destinations for Hounds of Tindalos
 * They teleport through "angles" - corners of rooms
 */
export function getTeleportDestinations(
  enemy: Enemy,
  tiles: Tile[],
  players: Player[],
  enemies: Enemy[]
): { q: number; r: number }[] {
  const destinations: { q: number; r: number }[] = [];
  const occupiedPositions = new Set([
    ...enemies.map(e => `${e.position.q},${e.position.r}`),
    ...players.map(p => `${p.position.q},${p.position.r}`)
  ]);

  // For Hounds, find tiles near players (they teleport to hunt)
  for (const player of players) {
    if (player.isDead) continue;

    const neighbors = getHexNeighbors(player.position);
    for (const pos of neighbors) {
      const key = `${pos.q},${pos.r}`;
      if (occupiedPositions.has(key)) continue;

      const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
      if (tile && !tile.obstacle?.blocking) {
        destinations.push(pos);
        occupiedPositions.add(key); // Don't suggest same position twice
      }
    }
  }

  return destinations;
}

/**
 * Execute special movement ability
 */
export function executeSpecialMovement(
  enemy: Enemy,
  tiles: Tile[],
  players: Player[],
  enemies: Enemy[]
): { newPosition: { q: number; r: number }; message: string } | null {
  const specialMove = getSpecialMovement(enemy);
  if (!specialMove) return null;

  switch (specialMove) {
    case 'teleport': {
      // Hound of Tindalos teleportation
      const destinations = getTeleportDestinations(enemy, tiles, players, enemies);
      if (destinations.length === 0) return null;

      // Teleport near lowest-sanity player (they sense fear)
      const targetPlayer = players
        .filter(p => !p.isDead)
        .sort((a, b) => a.sanity - b.sanity)[0];

      if (!targetPlayer) return null;

      // Find destination nearest to target
      const bestDest = destinations
        .map(d => ({ pos: d, dist: hexDistance(d, targetPlayer.position) }))
        .sort((a, b) => a.dist - b.dist)[0];

      if (bestDest && bestDest.dist <= 1) {
        return {
          newPosition: bestDest.pos,
          message: `${enemy.name} materialiserer seg gjennom vinklene!`
        };
      }
      return null;
    }

    case 'phase': {
      // Phasing through obstacles - handled in pathfinding
      return null;
    }

    case 'fly': {
      // Flight is handled in pathfinding obstacle checks
      return null;
    }

    case 'swim': {
      // Swimming bonus handled in pathfinding
      return null;
    }

    default:
      return null;
  }
}

// ============================================================================
// RANGED ATTACK SYSTEM
// ============================================================================

/**
 * Check if enemy can make a ranged attack against a player
 */
export function canMakeRangedAttack(
  enemy: Enemy,
  player: Player,
  tiles: Tile[]
): { canAttack: boolean; blocked: boolean; coverPenalty: number } {
  const distance = hexDistance(enemy.position, player.position);

  // Check range
  if (distance > enemy.attackRange) {
    return { canAttack: false, blocked: false, coverPenalty: 0 };
  }

  // Check line of sight
  if (!hasLineOfSight(enemy.position, player.position, tiles, enemy.attackRange)) {
    return { canAttack: false, blocked: true, coverPenalty: 0 };
  }

  // Check for cover along the line
  let coverPenalty = 0;
  const line = getHexLineForCover(enemy.position, player.position);

  for (let i = 1; i < line.length - 1; i++) {
    const pos = line[i];
    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (tile?.object) {
      // Partial cover from furniture/obstacles
      if (['crate', 'bookshelf', 'statue', 'cabinet'].includes(tile.object.type)) {
        coverPenalty += 1;
      }
    }
  }

  return { canAttack: true, blocked: false, coverPenalty };
}

/**
 * Get hex line for cover calculation (simplified version)
 */
function getHexLineForCover(
  start: { q: number; r: number },
  end: { q: number; r: number }
): { q: number; r: number }[] {
  const dist = hexDistance(start, end);
  if (dist === 0) return [start];

  const results: { q: number; r: number }[] = [];
  for (let i = 0; i <= dist; i++) {
    const t = dist === 0 ? 0 : i / dist;
    const q = Math.round(start.q + (end.q - start.q) * t);
    const r = Math.round(start.r + (end.r - start.r) * t);
    results.push({ q, r });
  }
  return results;
}

/**
 * Find optimal ranged attack position
 * Ranged enemies want to maintain distance while having line of sight
 */
export function findOptimalRangedPosition(
  enemy: Enemy,
  targetPlayer: Player,
  tiles: Tile[],
  enemies: Enemy[]
): { q: number; r: number } | null {
  const occupiedPositions = new Set(
    enemies.filter(e => e.id !== enemy.id).map(e => `${e.position.q},${e.position.r}`)
  );

  const optimalRange = 2; // Ideal distance for ranged attackers
  const candidates: { pos: { q: number; r: number }; score: number }[] = [];

  // Search in expanding rings around current position
  for (let ring = 0; ring <= enemy.speed; ring++) {
    const ringPositions = getHexRing(enemy.position, ring);

    for (const pos of ringPositions) {
      const key = `${pos.q},${pos.r}`;
      if (occupiedPositions.has(key)) continue;

      const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
      if (!tile) continue;

      const passability = canEnemyPassTile(enemy, tile);
      if (!passability.canPass) continue;

      const distanceToTarget = hexDistance(pos, targetPlayer.position);

      // Check if we can attack from here
      const rangedCheck = canMakeRangedAttack(
        { ...enemy, position: pos } as Enemy,
        targetPlayer,
        tiles
      );

      if (rangedCheck.canAttack) {
        // Score based on how close to optimal range
        const distanceScore = 10 - Math.abs(distanceToTarget - optimalRange) * 3;
        const coverScore = -rangedCheck.coverPenalty * 2;
        candidates.push({ pos, score: distanceScore + coverScore });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Return position with best score
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].pos;
}

/**
 * Get all hexes in a ring at a certain distance
 */
function getHexRing(center: { q: number; r: number }, radius: number): { q: number; r: number }[] {
  if (radius === 0) return [center];

  const results: { q: number; r: number }[] = [];
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  // Start at one corner
  let pos = { q: center.q - radius, r: center.r + radius };

  for (const dir of directions) {
    for (let i = 0; i < radius; i++) {
      results.push({ ...pos });
      pos = { q: pos.q + dir.q, r: pos.r + dir.r };
    }
  }

  return results;
}

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
 * Find nearest visible player (legacy function - use findBestTarget for smarter targeting)
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
 * Find best target using advanced priority system
 * This replaces findNearestPlayer for smarter AI decisions
 */
export function findSmartTarget(
  enemy: Enemy,
  players: Player[],
  tiles: Tile[]
): { target: Player | null; priority: TargetPriority | null } {
  const alivePlayers = players.filter(p => !p.isDead);
  if (alivePlayers.length === 0) return { target: null, priority: null };

  // Filter to visible players
  const visiblePlayers = alivePlayers.filter(p => canSeePlayer(enemy, p, tiles));
  if (visiblePlayers.length === 0) return { target: null, priority: null };

  // Calculate priority for each player
  const priorities = visiblePlayers.map(p =>
    calculateTargetPriority(enemy, p, alivePlayers, tiles)
  );

  // Sort by score (highest first)
  priorities.sort((a, b) => b.score - a.score);

  return { target: priorities[0].player, priority: priorities[0] };
}

/**
 * Get random patrol destination
 * Enhanced to consider enemy abilities and obstacle types
 */
function getPatrolDestination(
  enemy: Enemy,
  tiles: Tile[],
  enemies: Enemy[]
): { q: number; r: number } | null {
  const neighbors = getHexNeighbors(enemy.position);
  const occupiedPositions = new Set(enemies.map(e => `${e.position.q},${e.position.r}`));

  // Find valid moves considering enemy abilities
  const validMoves: { pos: { q: number; r: number }; preference: number }[] = [];

  for (const pos of neighbors) {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) continue;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile) continue;

    // Use enhanced passability check
    const passability = canEnemyPassTile(enemy, tile);
    if (!passability.canPass) continue;

    // Calculate preference based on enemy type
    let preference = 1;

    // Aquatic enemies prefer water
    if (enemy.traits?.includes('aquatic') && tile.hasWater) {
      preference += 3;
    }

    // Ghouls prefer dark areas (crypts, basements)
    if (enemy.type === 'ghoul' && (tile.category === 'crypt' || tile.category === 'basement')) {
      preference += 2;
    }

    // Deep ones prefer areas near water
    if (enemy.type === 'deepone' && tile.hasWater) {
      preference += 3;
    }

    // Flying enemies may prefer open areas
    if (enemy.traits?.includes('flying') && (tile.category === 'nature' || tile.category === 'urban')) {
      preference += 1;
    }

    // Avoid tiles with traps (unless flying)
    if (tile.object?.type === 'trap' && !enemy.traits?.includes('flying')) {
      preference -= 2;
    }

    // Avoid fire (unless immune - future enhancement)
    if (tile.object?.type === 'fire') {
      preference -= 3;
    }

    validMoves.push({ pos, preference });
  }

  if (validMoves.length === 0) return null;

  // Weighted random selection based on preference
  const totalWeight = validMoves.reduce((sum, m) => sum + Math.max(1, m.preference), 0);
  let random = Math.random() * totalWeight;

  for (const move of validMoves) {
    random -= Math.max(1, move.preference);
    if (random <= 0) {
      return move.pos;
    }
  }

  return validMoves[0].pos;
}

/**
 * Main AI decision function for a monster
 * Enhanced with smart targeting, special abilities, and ranged attack logic
 */
export function getMonsterDecision(
  enemy: Enemy,
  players: Player[],
  enemies: Enemy[],
  tiles: Tile[]
): AIDecision {
  const behavior = getMonsterBehavior(enemy.type);

  // Use smart targeting to find best target
  const { target: targetPlayer, priority } = findSmartTarget(enemy, players, tiles);

  // No visible players - patrol or wait
  if (!targetPlayer) {
    // Check for special movement (Hound teleport to find prey)
    if (enemy.type === 'hound') {
      const teleportResult = executeSpecialMovement(enemy, tiles, players, enemies);
      if (teleportResult) {
        return {
          action: 'special',
          targetPosition: teleportResult.newPosition,
          message: teleportResult.message
        };
      }
    }

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

  const distanceToPlayer = hexDistance(enemy.position, targetPlayer.position);
  const isFlying = enemy.traits?.includes('flying') ?? false;
  const isRanged = behavior === 'ranged' || enemy.traits?.includes('ranged');

  // RANGED ATTACKERS - check line of sight and optimal positioning
  if (isRanged && enemy.attackRange > 1) {
    const rangedCheck = canMakeRangedAttack(enemy, targetPlayer, tiles);

    // Can make ranged attack?
    if (rangedCheck.canAttack && distanceToPlayer <= enemy.attackRange) {
      // Generate message based on cover
      const coverMsg = rangedCheck.coverPenalty > 0 ? ' (mot dekning)' : '';
      return {
        action: 'attack',
        targetPlayerId: targetPlayer.id,
        message: `${enemy.name} avfyrer mot ${targetPlayer.name}${coverMsg}!`
      };
    }

    // Find optimal position for ranged attack
    if (!rangedCheck.canAttack || distanceToPlayer > enemy.attackRange) {
      const optimalPos = findOptimalRangedPosition(enemy, targetPlayer, tiles, enemies);
      if (optimalPos) {
        return {
          action: 'move',
          targetPosition: optimalPos,
          message: `${enemy.name} tar stilling for a skyte...`
        };
      }
    }

    // Too close - retreat
    if (distanceToPlayer < 2) {
      const retreatPos = findRetreatPosition(enemy, targetPlayer, tiles, enemies);
      if (retreatPos) {
        return {
          action: 'move',
          targetPosition: retreatPos,
          message: `${enemy.name} trekker seg tilbake for a sikte...`
        };
      }
    }
  }

  // MELEE ATTACKERS - can attack if in range
  if (distanceToPlayer <= enemy.attackRange) {
    // Generate message based on priority factors
    let attackMsg = `${enemy.name} angriper ${targetPlayer.name}!`;
    if (priority) {
      if (priority.factors.lowHp > 15) {
        attackMsg = `${enemy.name} sanser svakhet og angriper ${targetPlayer.name}!`;
      } else if (priority.factors.isolated > 0) {
        attackMsg = `${enemy.name} gar løs pa den isolerte ${targetPlayer.name}!`;
      } else if (priority.factors.lowSanity > 10) {
        attackMsg = `${enemy.name} jakter pa den redde ${targetPlayer.name}!`;
      }
    }

    return {
      action: 'attack',
      targetPlayerId: targetPlayer.id,
      message: attackMsg
    };
  }

  // SPECIAL MOVEMENT - Hound teleportation
  if (enemy.type === 'hound' && distanceToPlayer > 3) {
    const teleportResult = executeSpecialMovement(enemy, tiles, players, enemies);
    if (teleportResult) {
      return {
        action: 'special',
        targetPosition: teleportResult.newPosition,
        message: teleportResult.message
      };
    }
  }

  // Defensive behavior - only chase if very close
  if (behavior === 'defensive' && distanceToPlayer > 3) {
    return { action: 'wait', message: `${enemy.name} vokter sin posisjon.` };
  }

  // CHASE - use enhanced pathfinding
  const otherEnemyPositions = new Set(
    enemies
      .filter(e => e.id !== enemy.id)
      .map(e => `${e.position.q},${e.position.r}`)
  );

  // Use enhanced pathfinding that considers obstacles and enemy abilities
  const pathResult = findEnhancedPath(
    enemy,
    enemy.position,
    [targetPlayer.position],
    tiles,
    otherEnemyPositions
  );

  if (pathResult && pathResult.path.length > 1) {
    // Calculate how far we can move based on speed and path cost
    let movementBudget = enemy.speed;
    let moveIndex = 0;

    for (let i = 1; i < pathResult.path.length && movementBudget > 0; i++) {
      const tile = tiles.find(t => t.q === pathResult.path[i].q && t.r === pathResult.path[i].r);
      if (tile) {
        const cost = canEnemyPassTile(enemy, tile);
        const tileCost = 1 + Math.max(0, cost.movementCost);
        if (movementBudget >= tileCost) {
          movementBudget -= tileCost;
          moveIndex = i;
        } else {
          break;
        }
      }
    }

    if (moveIndex > 0) {
      // Generate chase message based on movement type
      let chaseMsg = `${enemy.name} jakter pa ${targetPlayer.name}!`;
      if (isFlying) {
        chaseMsg = `${enemy.name} daler ned mot ${targetPlayer.name}!`;
      } else if (enemy.traits?.includes('aquatic')) {
        const targetTile = tiles.find(t =>
          t.q === pathResult.path[moveIndex].q && t.r === pathResult.path[moveIndex].r
        );
        if (targetTile?.hasWater) {
          chaseMsg = `${enemy.name} glir gjennom vannet mot ${targetPlayer.name}!`;
        }
      }

      return {
        action: 'move',
        targetPosition: pathResult.path[moveIndex],
        message: chaseMsg
      };
    }
  }

  // Fallback to basic pathfinding if enhanced fails
  const basicPath = findPath(
    enemy.position,
    [targetPlayer.position],
    tiles,
    otherEnemyPositions,
    isFlying
  );

  if (basicPath && basicPath.length > 1) {
    const moveIndex = Math.min(enemy.speed, basicPath.length - 1);
    return {
      action: 'move',
      targetPosition: basicPath[moveIndex],
      message: `${enemy.name} nærmer seg ${targetPlayer.name}...`
    };
  }

  return { action: 'wait', message: `${enemy.name} venter...` };
}

/**
 * Find a retreat position for ranged enemies
 */
function findRetreatPosition(
  enemy: Enemy,
  target: Player,
  tiles: Tile[],
  enemies: Enemy[]
): { q: number; r: number } | null {
  const occupiedPositions = new Set(
    enemies.filter(e => e.id !== enemy.id).map(e => `${e.position.q},${e.position.r}`)
  );

  // Direction away from target
  const dx = enemy.position.q - target.position.q;
  const dr = enemy.position.r - target.position.r;

  // Try moving directly away first
  const directRetreat = {
    q: enemy.position.q + Math.sign(dx),
    r: enemy.position.r + Math.sign(dr)
  };

  const directKey = `${directRetreat.q},${directRetreat.r}`;
  const directTile = tiles.find(t => t.q === directRetreat.q && t.r === directRetreat.r);
  if (directTile && !occupiedPositions.has(directKey)) {
    const passability = canEnemyPassTile(enemy, directTile);
    if (passability.canPass) {
      return directRetreat;
    }
  }

  // Try neighbors that increase distance
  const neighbors = getHexNeighbors(enemy.position);
  const currentDistance = hexDistance(enemy.position, target.position);

  for (const pos of neighbors) {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) continue;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile) continue;

    const passability = canEnemyPassTile(enemy, tile);
    if (!passability.canPass) continue;

    const newDistance = hexDistance(pos, target.position);
    if (newDistance > currentDistance) {
      return pos;
    }
  }

  return null;
}

/**
 * Process all enemy AI decisions for a turn
 * Enhanced to handle special movements, ranged attacks, and smart targeting
 */
export function processEnemyTurn(
  enemies: Enemy[],
  players: Player[],
  tiles: Tile[]
): {
  updatedEnemies: Enemy[];
  attacks: Array<{
    enemy: Enemy;
    targetPlayer: Player;
    isRanged?: boolean;
    coverPenalty?: number;
  }>;
  messages: string[];
  specialEvents: Array<{
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }>;
} {
  const updatedEnemies: Enemy[] = [...enemies];
  const attacks: Array<{
    enemy: Enemy;
    targetPlayer: Player;
    isRanged?: boolean;
    coverPenalty?: number;
  }> = [];
  const messages: string[] = [];
  const specialEvents: Array<{
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }> = [];

  // Process enemies in order (faster enemies might act first in future enhancement)
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
          // Check if this is a ranged attack
          const isRanged = enemy.attackRange > 1 &&
            hexDistance(enemy.position, targetPlayer.position) > 1;

          if (isRanged) {
            // Calculate cover penalty for ranged attacks
            const rangedCheck = canMakeRangedAttack(enemy, targetPlayer, tiles);
            attacks.push({
              enemy,
              targetPlayer,
              isRanged: true,
              coverPenalty: rangedCheck.coverPenalty
            });
          } else {
            attacks.push({ enemy, targetPlayer });
          }
        }
        break;

      case 'special':
        // Handle special movement abilities
        if (decision.targetPosition) {
          const oldPos = { ...enemy.position };
          updatedEnemies[i] = {
            ...enemy,
            position: decision.targetPosition
          };

          // Track special event for visual effects
          specialEvents.push({
            type: enemy.type === 'hound' ? 'teleport' : 'phase',
            enemy: updatedEnemies[i],
            description: decision.message || `${enemy.name} bruker sin spesielle evne!`
          });
        }
        break;

      case 'wait':
        // Enemy waits - no action needed
        break;
    }

    if (decision.message) {
      messages.push(decision.message);
    }
  }

  return { updatedEnemies, attacks, messages, specialEvents };
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
