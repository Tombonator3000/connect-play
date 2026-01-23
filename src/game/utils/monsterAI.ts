/**
 * Monster AI System for Shadows of the 1920s
 * Enhanced AI with pathfinding, target prioritization, and special abilities
 * Version 4.0 - January 2026
 *
 * REFACTORED: Code split into modular components:
 * - monsterWeatherBehavior.ts: Weather effects on monster behavior
 * - monsterObstacles.ts: Obstacle passability logic
 * - monsterConstants.ts: Spawn tables, behaviors, personalities
 * - monsterMessages.ts: All localized monster messages
 * - monsterDecisionHelpers.ts: Decision-making helper functions
 */

import {
  Enemy, EnemyType, EnemyWithAI, Player, Tile, TileCategory,
  WeatherCondition, MonsterPersonality, MonsterSpecialAbility,
  MonsterAIState
} from '../types';
import { BESTIARY, weatherHidesEnemy } from '../constants';
import { hexDistance, findPath, getHexNeighbors, hasLineOfSight } from '../hexUtils';

// Import from decision helpers module
import {
  buildDecisionContext,
  tryFleeDecision,
  handleNoTargetBehavior,
  tryHesitationDecision,
  tryRangedAttackDecision,
  tryMeleeAttackDecision,
  trySpecialMovementDecision,
  tryDefensiveDecision,
  tryChaseDecision,
  tryBasicChaseDecision
} from './monsterDecisionHelpers';

// Import from messages module
import { getGenericWaitMessage } from './monsterMessages';

// Import from extracted modules
import type { WeatherMonsterModifiers } from './monsterWeatherBehavior';
import {
  getWeatherMonsterModifiers,
  monsterBenefitsFromWeather,
  applyWeatherToVision,
  getWeatherMonsterMessage
} from './monsterWeatherBehavior';

import type { PassabilityResult } from './monsterObstacles';
import {
  OBSTACLE_PASSABILITY,
  canEnemyPassTile
} from './monsterObstacles';

import type {
  MonsterBehavior,
  MonsterState,
  SpecialMovement,
  SpawnConfig,
  TargetPreferences,
  CombatStyleModifiers
} from './monsterConstants';
import {
  SPAWN_TABLES,
  MONSTER_BEHAVIORS,
  MONSTER_PERSONALITIES,
  ENEMY_TARGET_PREFERENCES,
  getCombatStyleModifiers,
  getMonsterBehavior,
  getMonsterPersonality,
  getTargetPreferences,
  selectRandomEnemy
} from './monsterConstants';

// Re-export types for backwards compatibility
export type {
  WeatherMonsterModifiers,
  MonsterBehavior,
  MonsterState,
  SpecialMovement,
  SpawnConfig
};

// Re-export values for backwards compatibility
export {
  getWeatherMonsterModifiers,
  monsterBenefitsFromWeather,
  applyWeatherToVision,
  OBSTACLE_PASSABILITY,
  canEnemyPassTile,
  SPAWN_TABLES,
  MONSTER_BEHAVIORS,
  MONSTER_PERSONALITIES,
  ENEMY_TARGET_PREFERENCES,
  getCombatStyleModifiers,
  getMonsterBehavior,
  getMonsterPersonality,
  selectRandomEnemy
};

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
 * Calculate target priority for a player
 */
export function calculateTargetPriority(
  enemy: Enemy,
  player: Player,
  allPlayers: Player[],
  tiles: Tile[]
): TargetPriority {
  const preferences = getTargetPreferences(enemy.type);

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
  // NOTE: Uses characterClass (e.g., 'professor', 'veteran') not player.id (UUID)
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



// ============================================================================
// SPECIAL ABILITY EXECUTION
// ============================================================================

/**
 * Result type for special ability execution
 */
export interface SpecialAbilityResult {
  damage?: number;
  sanityDamage?: number;
  doomIncrease?: number;
  healing?: number;
  spawnedEnemies?: EnemyType[];
  message: string;
  bonusAttackDice?: number;
}

/**
 * Configuration for simple abilities (no complex logic needed).
 * Message template uses {name} placeholder for enemy name.
 */
interface SimpleAbilityConfig {
  damage?: number;
  sanityDamage?: number;
  doomIncrease?: number;
  healing?: number;
  bonusAttackDice?: number;
  messageTemplate: string;
}

/**
 * Static configuration for abilities with simple, predictable effects.
 * Complex abilities (pack_tactics, drag_under, summon) are handled separately.
 */
const SIMPLE_ABILITY_EFFECTS: Partial<Record<MonsterSpecialAbility, SimpleAbilityConfig>> = {
  charge: {
    damage: 1,
    bonusAttackDice: 1,
    messageTemplate: '{name} stormer fremover med et vilt angrep!'
  },
  enrage: {
    bonusAttackDice: 2,
    messageTemplate: '{name} går BERSERK! Øynene gløder med raseri!'
  },
  snipe: {
    bonusAttackDice: 1,
    messageTemplate: '{name} tar nøye sikte...'
  },
  swoop: {
    bonusAttackDice: 1,
    messageTemplate: '{name} stuper ned fra luften!'
  },
  regenerate: {
    healing: 1,
    messageTemplate: '{name} regenererer skadet vev...'
  },
  terrify: {
    sanityDamage: 1,
    messageTemplate: '{name}s tilstedeværelse fyller deg med kosmisk redsel!'
  },
  ritual: {
    doomIncrease: 1,
    messageTemplate: '{name} utfører et mørkt ritual! Doom øker!'
  },
  cosmic_presence: {
    sanityDamage: 1,
    messageTemplate: '{name}s kosmiske tilstedeværelse tærer på sinnet ditt...'
  },
  devour: {
    damage: 3,
    messageTemplate: '{name} forsøker å SLUKE sitt bytte!'
  },
  ranged_shot: {
    messageTemplate: '{name} avfyrer et fremmed våpen!'
  },
  phasing: {
    messageTemplate: '{name} beveger seg gjennom dimensjonene...'
  },
  teleport: {
    messageTemplate: '{name} beveger seg gjennom dimensjonene...'
  }
};

/**
 * HP thresholds for ability usage.
 * Returns { canUse, requiresAbove?, requiresBelow? }
 */
const ABILITY_HP_THRESHOLDS: Partial<Record<MonsterSpecialAbility, { above?: number; below?: number }>> = {
  enrage: { below: 0.5 },   // Only when HP <= 50%
  charge: { above: 0.3 }    // Only when HP > 30%
};

/**
 * Check if monster can use a special ability this turn
 */
export function canUseSpecialAbility(
  enemy: EnemyWithAI,
  ability: MonsterSpecialAbility,
  currentRound: number
): boolean {
  // Check if ability was used recently
  if (enemy.aiState?.hasUsedSpecialAbility && enemy.aiState?.lastActionRound === currentRound) {
    return false;
  }

  // Check HP thresholds from config
  const threshold = ABILITY_HP_THRESHOLDS[ability];
  if (threshold) {
    const hpRatio = enemy.hp / enemy.maxHp;
    if (threshold.below !== undefined && hpRatio > threshold.below) return false;
    if (threshold.above !== undefined && hpRatio <= threshold.above) return false;
  }

  return true;
}

// ============================================================================
// COMPLEX ABILITY HANDLERS
// Abilities that require game state logic beyond simple config
// ============================================================================

/**
 * Handle pack_tactics: +1 attack die per adjacent ghoul
 */
function executePackTactics(enemy: EnemyWithAI, allEnemies: Enemy[]): SpecialAbilityResult {
  const adjacentGhouls = allEnemies.filter(e =>
    e.type === 'ghoul' &&
    e.id !== enemy.id &&
    hexDistance(e.position, enemy.position) <= 1
  ).length;

  return {
    bonusAttackDice: adjacentGhouls,
    message: adjacentGhouls > 0
      ? `${enemy.name} koordinerer med ${adjacentGhouls} andre ghouls!`
      : `${enemy.name} angriper alene...`
  };
}

/**
 * Handle drag_under: Pull player into water for bonus damage
 */
function executeDragUnder(enemy: EnemyWithAI, target: Player | null, tiles: Tile[]): SpecialAbilityResult {
  if (!target) {
    return { message: `${enemy.name} prøver å dra ned, men finner ikke vann.` };
  }

  const targetTile = tiles.find(t =>
    t.q === target.position.q && t.r === target.position.r
  );

  if (targetTile?.hasWater) {
    return {
      damage: 1,
      message: `${enemy.name} drar ${target.name} ned i vannet!`
    };
  }

  return { message: `${enemy.name} prøver å dra ned, men finner ikke vann.` };
}

/**
 * Handle summon: Spawn 1-2 cultists
 */
function executeSummon(enemy: EnemyWithAI): SpecialAbilityResult {
  const summonCount = Math.random() < 0.5 ? 1 : 2;
  return {
    spawnedEnemies: Array(summonCount).fill('cultist' as EnemyType),
    message: `${enemy.name} kaller på mørkets tjenere!`
  };
}

/**
 * Build result from simple config
 */
function buildSimpleAbilityResult(config: SimpleAbilityConfig, enemyName: string): SpecialAbilityResult {
  return {
    damage: config.damage,
    sanityDamage: config.sanityDamage,
    doomIncrease: config.doomIncrease,
    healing: config.healing,
    bonusAttackDice: config.bonusAttackDice,
    message: config.messageTemplate.replace('{name}', enemyName)
  };
}

/**
 * Execute a special ability.
 *
 * REFACTORED: Previously 105-line switch statement with repeated object literals.
 * Now uses:
 * - SIMPLE_ABILITY_EFFECTS config for 12 simple abilities
 * - Dedicated handler functions for 3 complex abilities (pack_tactics, drag_under, summon)
 * - Single lookup + fallback pattern for cleaner control flow
 *
 * @param enemy - The enemy using the ability
 * @param ability - Which ability to execute
 * @param target - Target player (if applicable)
 * @param allEnemies - All enemies (for pack_tactics)
 * @param tiles - Game tiles (for drag_under water check)
 * @returns Effect result with damage, healing, spawns, and message
 */
export function executeSpecialAbility(
  enemy: EnemyWithAI,
  ability: MonsterSpecialAbility,
  target: Player | null,
  allEnemies: Enemy[],
  tiles: Tile[]
): SpecialAbilityResult {
  // Handle complex abilities with dedicated handlers
  switch (ability) {
    case 'pack_tactics':
      return executePackTactics(enemy, allEnemies);
    case 'drag_under':
      return executeDragUnder(enemy, target, tiles);
    case 'summon':
      return executeSummon(enemy);
  }

  // Handle simple abilities from config
  const config = SIMPLE_ABILITY_EFFECTS[ability];
  if (config) {
    return buildSimpleAbilityResult(config, enemy.name);
  }

  // Unknown ability fallback
  return { message: `${enemy.name} bruker en ukjent evne.` };
}

/**
 * Check if monster should flee based on personality
 */
export function shouldMonsterFlee(enemy: EnemyWithAI): boolean {
  const personality = getMonsterPersonality(enemy.type);
  if (!personality) return false;

  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  return hpPercent <= personality.cowardiceThreshold;
}

/**
 * Check if monster should call for help
 */
export function shouldCallForHelp(enemy: EnemyWithAI, hasSeenPlayer: boolean): boolean {
  const personality = getMonsterPersonality(enemy.type);
  if (!personality) return false;

  if (!hasSeenPlayer) return false;

  return Math.random() * 100 < personality.callForHelpChance;
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
 * Create a new enemy with enhanced AI state and personality
 */
export function createEnemyWithAI(
  type: EnemyType,
  position: { q: number; r: number }
): EnemyWithAI {
  const baseEnemy = createEnemy(type, position);
  const personality = getMonsterPersonality(type);

  // Determine initial state based on personality
  let initialState: MonsterAIState['state'] = 'idle';
  if (personality.aggressionLevel >= 80) {
    initialState = 'hunting';
  } else if (personality.aggressionLevel >= 50) {
    initialState = 'patrol';
  }

  return {
    ...baseEnemy,
    personality,
    aiState: {
      state: initialState,
      alertLevel: personality.aggressionLevel > 70 ? 50 : 0,
      consecutivePatrolMoves: 0,
      hasUsedSpecialAbility: false
    }
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
 * Now includes weather effects on monster vision AND proper line-of-sight checks
 * Monsters cannot see through walls, closed doors, or blocking obstacles
 */
export function canSeePlayer(
  enemy: Enemy,
  player: Player,
  tiles: Tile[],
  weather?: WeatherCondition | null
): boolean {
  const distance = hexDistance(enemy.position, player.position);

  // Apply weather modifiers to vision range
  const effectiveVision = weather
    ? applyWeatherToVision(enemy.visionRange, weather, enemy.type)
    : enemy.visionRange;

  if (distance > effectiveVision) return false;

  // In certain weather, even visible players may be "hidden"
  if (weather && weatherHidesEnemy(weather, distance)) {
    // Monsters have similar issues seeing players in bad weather
    // But darkness-dwellers can still see
    if (!monsterBenefitsFromWeather(enemy.type, weather)) {
      return false;
    }
  }

  // CRITICAL FIX: Check actual line of sight through walls and doors
  // Monsters cannot see through:
  // - Walls
  // - Closed/locked doors
  // - Blocking obstacles
  // But they CAN see through:
  // - Open doors
  // - Windows
  // - Open edges
  if (!hasLineOfSight(enemy.position, player.position, tiles, effectiveVision)) {
    return false;
  }

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
 * Now includes weather effects on target selection
 */
export function findSmartTarget(
  enemy: Enemy,
  players: Player[],
  tiles: Tile[],
  weather?: WeatherCondition | null
): { target: Player | null; priority: TargetPriority | null } {
  const alivePlayers = players.filter(p => !p.isDead);
  if (alivePlayers.length === 0) return { target: null, priority: null };

  // Filter to visible players (with weather consideration)
  const visiblePlayers = alivePlayers.filter(p => canSeePlayer(enemy, p, tiles, weather));
  if (visiblePlayers.length === 0) return { target: null, priority: null };

  // Calculate priority for each player
  const priorities = visiblePlayers.map(p =>
    calculateTargetPriority(enemy, p, alivePlayers, tiles)
  );

  // Weather can affect aggression and targeting
  if (weather) {
    const modifiers = getWeatherMonsterModifiers(weather);

    // Boost priority scores based on weather aggression
    for (const priority of priorities) {
      priority.score = Math.floor(priority.score * modifiers.aggressionModifier);

      // Monsters benefiting from weather are more likely to attack
      if (monsterBenefitsFromWeather(enemy.type, weather)) {
        priority.score += 15;
      }
    }
  }

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
 * Enhanced with smart targeting, special abilities, ranged attack logic,
 * personality-based behavior, and weather modifications
 *
 * REFACTORED: This function now delegates to smaller helper functions
 * in monsterDecisionHelpers.ts for better maintainability and testability.
 * Each decision type (flee, ranged, melee, chase) is handled by its own function.
 */
export function getMonsterDecision(
  enemy: Enemy,
  players: Player[],
  enemies: Enemy[],
  tiles: Tile[],
  weather?: WeatherCondition | null,
  currentRound?: number
): AIDecision {
  // Build decision context once (centralizes all context gathering)
  const ctx = buildDecisionContext(enemy, players, enemies, tiles, weather, currentRound);

  // 1. FLEE CHECK - Monsters may flee when hurt
  const fleeDecision = tryFleeDecision(ctx, findRetreatPosition);
  if (fleeDecision) return fleeDecision;

  // 2. FIND TARGET - Use smart targeting with weather consideration
  const { target: targetPlayer, priority } = findSmartTarget(enemy, players, tiles, weather);

  // 3. NO TARGET - Handle waiting, patrolling, or special movement
  if (!targetPlayer) {
    return handleNoTargetBehavior(ctx, executeSpecialMovement, getPatrolDestination);
  }

  const distanceToPlayer = hexDistance(enemy.position, targetPlayer.position);

  // 4. AGGRESSION CHECK - Low aggression monsters may hesitate
  const hesitationDecision = tryHesitationDecision(ctx, distanceToPlayer);
  if (hesitationDecision) return hesitationDecision;

  // 5. RANGED ATTACK - Check if ranged attack is possible/preferred
  const rangedDecision = tryRangedAttackDecision(
    ctx,
    targetPlayer,
    distanceToPlayer,
    canMakeRangedAttack,
    findOptimalRangedPosition,
    findRetreatPosition
  );
  if (rangedDecision) return rangedDecision;

  // 6. MELEE ATTACK - Attack if in range
  const meleeDecision = tryMeleeAttackDecision(ctx, targetPlayer, distanceToPlayer, priority);
  if (meleeDecision) return meleeDecision;

  // 7. SPECIAL MOVEMENT - Hound teleportation, etc.
  const specialDecision = trySpecialMovementDecision(ctx, distanceToPlayer, executeSpecialMovement);
  if (specialDecision) return specialDecision;

  // 8. DEFENSIVE WAIT - Some monsters hold position
  const defensiveDecision = tryDefensiveDecision(ctx, distanceToPlayer);
  if (defensiveDecision) return defensiveDecision;

  // 9. CHASE - Use enhanced pathfinding to pursue target
  const chaseDecision = tryChaseDecision(ctx, targetPlayer, findEnhancedPath);
  if (chaseDecision) return chaseDecision;

  // 10. BASIC CHASE - Fallback to simple pathfinding
  const basicChaseDecision = tryBasicChaseDecision(ctx, targetPlayer);
  if (basicChaseDecision) return basicChaseDecision;

  // 11. WAIT - Default fallback
  return { action: 'wait', message: getGenericWaitMessage(enemy) };
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
  tiles: Tile[],
  weather?: WeatherCondition | null
): {
  updatedEnemies: Enemy[];
  attacks: Array<{
    enemy: Enemy;
    targetPlayer: Player;
    isRanged?: boolean;
    coverPenalty?: number;
    weatherHorrorBonus?: number;
  }>;
  messages: string[];
  specialEvents: Array<{
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }>;
  weatherEffects: {
    monstersEmpowered: boolean;
    horrorBonus: number;
    stealthAdvantage: boolean;
  };
} {
  const weatherMods = getWeatherMonsterModifiers(weather || null);
  const updatedEnemies: Enemy[] = [...enemies];
  const attacks: Array<{
    enemy: Enemy;
    targetPlayer: Player;
    isRanged?: boolean;
    coverPenalty?: number;
    weatherHorrorBonus?: number;
  }> = [];
  const messages: string[] = [];
  const specialEvents: Array<{
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }> = [];

  // Add weather-specific messages using extracted helper
  const weatherMessage = getWeatherMonsterMessage(weather || null);
  if (weatherMessage) {
    messages.push(weatherMessage);
  }

  // Process enemies in order (faster enemies might act first in future enhancement)
  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];

    // Skip dead enemies
    if (enemy.hp <= 0) continue;

    // Weather affects enemy speed
    const effectiveSpeed = Math.max(0, Math.floor(enemy.speed * weatherMods.speedModifier));

    // Slow enemies only move every other turn (modified by weather)
    if (enemy.traits?.includes('slow') && Math.random() < 0.5 / weatherMods.speedModifier) {
      messages.push(`${enemy.name} beveger seg sakte...`);
      continue;
    }

    // Monsters that benefit from current weather may get extra actions
    const isEmpowered = monsterBenefitsFromWeather(enemy.type, weather);
    if (isEmpowered && Math.random() < 0.1) {
      messages.push(`${enemy.name} styrkes av været!`);
    }

    const decision = getMonsterDecision(enemy, players, updatedEnemies, tiles, weather);

    switch (decision.action) {
      case 'move':
        if (decision.targetPosition) {
          updatedEnemies[i] = {
            ...enemy,
            position: decision.targetPosition
          };

          // CRITICAL FIX: After moving, check if monster can now attack a player
          // This allows monsters to move AND attack in the same turn (Hero Quest style)
          const movedEnemy = updatedEnemies[i];
          const alivePlayers = players.filter(p => !p.isDead);
          for (const player of alivePlayers) {
            const distanceAfterMove = hexDistance(movedEnemy.position, player.position);
            if (distanceAfterMove <= movedEnemy.attackRange) {
              // Check if monster can see the player from new position
              if (hasLineOfSight(movedEnemy.position, player.position, tiles, movedEnemy.visionRange)) {
                attacks.push({
                  enemy: movedEnemy,
                  targetPlayer: player,
                  weatherHorrorBonus: weatherMods.horrorBonus
                });
                messages.push(`${movedEnemy.name} angriper ${player.name}!`);
                break; // Only attack one player
              }
            }
          }
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
              coverPenalty: rangedCheck.coverPenalty,
              weatherHorrorBonus: weatherMods.horrorBonus
            });
          } else {
            attacks.push({
              enemy,
              targetPlayer,
              weatherHorrorBonus: weatherMods.horrorBonus
            });
          }
        }
        break;

      case 'special':
        // Handle special movement abilities
        if (decision.targetPosition) {
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

          // CRITICAL FIX: After special movement, check if monster can attack
          const specialMovedEnemy = updatedEnemies[i];
          const alivePlayersForSpecial = players.filter(p => !p.isDead);
          for (const player of alivePlayersForSpecial) {
            const distanceAfterSpecial = hexDistance(specialMovedEnemy.position, player.position);
            if (distanceAfterSpecial <= specialMovedEnemy.attackRange) {
              if (hasLineOfSight(specialMovedEnemy.position, player.position, tiles, specialMovedEnemy.visionRange)) {
                attacks.push({
                  enemy: specialMovedEnemy,
                  targetPlayer: player,
                  weatherHorrorBonus: weatherMods.horrorBonus
                });
                messages.push(`${specialMovedEnemy.name} angriper ${player.name}!`);
                break;
              }
            }
          }
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

  return {
    updatedEnemies,
    attacks,
    messages,
    specialEvents,
    weatherEffects: {
      monstersEmpowered: weatherMods.aggressionModifier > 1.2,
      horrorBonus: weatherMods.horrorBonus,
      stealthAdvantage: weatherMods.stealthBonus
    }
  };
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
