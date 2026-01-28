/**
 * Monster Decision Helper Functions
 * Extracted from getMonsterDecision() to improve maintainability and testability
 *
 * Each function handles a specific aspect of monster decision-making:
 * - Fleeing behavior
 * - No-target behavior (waiting, patrolling)
 * - Ranged attack decisions
 * - Melee attack decisions
 * - Chase/pursuit behavior
 * - Active searching behavior (2026-01-28)
 */

import { Enemy, EnemyWithAI, Player, Tile, WeatherCondition, MonsterAIState } from '../types';
import { hexDistance, findPath, getHexNeighbors } from '../hexUtils';
import { AIDecision, findSmartTarget, TargetPriority } from './monsterAI';
import { canEnemyPassTile } from './monsterObstacles';
import { getMonsterBehavior, getMonsterPersonality, getCombatStyleModifiers, CombatStyleModifiers } from './monsterConstants';
import type { MonsterPersonality } from '../types';
import { getWeatherMonsterModifiers, WeatherMonsterModifiers } from './monsterWeatherBehavior';
import {
  getWaitMessage,
  getPatrolMessage,
  getFleeMessage,
  getHesitationMessage,
  getDefensiveMessage,
  getRangedPositioningMessage,
  getRangedRetreatMessage,
  getRangedAttackMessage,
  getAttackMessageWithContext,
  getChaseMessage,
  getApproachMessage,
  getGenericWaitMessage,
  getSearchMessage
} from './monsterMessages';

// Number of rounds a monster will actively search after losing sight
const SEARCH_ROUNDS_BY_AGGRESSION = {
  low: 2,     // aggression < 50
  medium: 4,  // aggression 50-79
  high: 6     // aggression >= 80
};

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionContext {
  enemy: Enemy;
  players: Player[];
  enemies: Enemy[];
  tiles: Tile[];
  weather: WeatherCondition | null;
  currentRound?: number;
  behavior: string;
  personality: MonsterPersonality;
  weatherMods: WeatherMonsterModifiers;
  combatStyle: CombatStyleModifiers;
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

/**
 * Build decision context from parameters
 * Centralizes the gathering of all context needed for decisions
 */
export function buildDecisionContext(
  enemy: Enemy,
  players: Player[],
  enemies: Enemy[],
  tiles: Tile[],
  weather?: WeatherCondition | null,
  currentRound?: number
): DecisionContext {
  return {
    enemy,
    players,
    enemies,
    tiles,
    weather: weather || null,
    currentRound,
    behavior: getMonsterBehavior(enemy.type),
    personality: getMonsterPersonality(enemy.type),
    weatherMods: getWeatherMonsterModifiers(weather || null),
    combatStyle: getCombatStyleModifiers(getMonsterPersonality(enemy.type).combatStyle)
  };
}

// ============================================================================
// FLEE BEHAVIOR
// ============================================================================

/**
 * Check if monster should flee and get flee decision
 * Returns null if monster should not flee
 */
export function tryFleeDecision(
  ctx: DecisionContext,
  findRetreatPosition: (enemy: Enemy, target: Player, tiles: Tile[], enemies: Enemy[]) => { q: number; r: number } | null
): AIDecision | null {
  const { enemy, players, tiles, enemies, personality } = ctx;

  // Check if HP is below cowardice threshold
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  if (hpPercent <= personality.cowardiceThreshold && personality.cowardiceThreshold > 0) {
    // Try to find a retreat position away from any alive player
    const alivePlayer = players.find(p => !p.isDead);
    if (alivePlayer) {
      const fleePos = findRetreatPosition(enemy, alivePlayer, tiles, enemies);
      if (fleePos) {
        return {
          action: 'move',
          targetPosition: fleePos,
          message: getFleeMessage(enemy)
        };
      }
    }
  }

  return null;
}

// ============================================================================
// NO-TARGET BEHAVIOR (Waiting, Patrolling, Special Movement, Searching)
// ============================================================================

/**
 * Get search rounds based on aggression level
 */
export function getSearchRoundsForAggression(aggressionLevel: number): number {
  if (aggressionLevel >= 80) return SEARCH_ROUNDS_BY_AGGRESSION.high;
  if (aggressionLevel >= 50) return SEARCH_ROUNDS_BY_AGGRESSION.medium;
  return SEARCH_ROUNDS_BY_AGGRESSION.low;
}

/**
 * Find path toward a target position for searching
 */
function findSearchPath(
  enemy: Enemy,
  targetPos: { q: number; r: number },
  tiles: Tile[],
  enemies: Enemy[]
): { q: number; r: number } | null {
  const isFlying = enemy.traits?.includes('flying') ?? false;
  const otherEnemyPositions = new Set(
    enemies
      .filter(e => e.id !== enemy.id)
      .map(e => `${e.position.q},${e.position.r}`)
  );

  const path = findPath(
    enemy.position,
    [targetPos],
    tiles,
    otherEnemyPositions,
    isFlying
  );

  if (path && path.length > 1) {
    // Move based on speed
    const moveIndex = Math.min(enemy.speed || 1, path.length - 1);
    return path[moveIndex];
  }
  return null;
}

/**
 * Handle behavior when no target is visible
 * Includes special movement, ambush waiting, searching, and patrolling
 *
 * IMPROVED (2026-01-28): Monsters now actively search for players:
 * 1. If they have a last known position, they move toward it
 * 2. After reaching that position, they search the area
 * 3. Aggressive monsters search for longer
 * 4. Only after search rounds expire do they resume patrolling
 */
export function handleNoTargetBehavior(
  ctx: DecisionContext,
  executeSpecialMovement: (enemy: Enemy, tiles: Tile[], players: Player[], enemies: Enemy[]) => { newPosition: { q: number; r: number }; message: string } | null,
  getPatrolDestination: (enemy: Enemy, tiles: Tile[], enemies: Enemy[]) => { q: number; r: number } | null
): AIDecision {
  const { enemy, players, tiles, enemies, behavior, personality } = ctx;

  // Cast to EnemyWithAI to access aiState
  const enemyWithAI = enemy as EnemyWithAI;
  const aiState = enemyWithAI.aiState;

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

  // ACTIVE SEARCHING: If we have a last known player position, search toward it
  if (aiState?.lastKnownPlayerPos && aiState.searchRoundsRemaining && aiState.searchRoundsRemaining > 0) {
    const distToLastKnown = hexDistance(enemy.position, aiState.lastKnownPlayerPos);

    // If we reached the last known position, search the area
    if (distToLastKnown <= 1) {
      // Search nearby tiles randomly
      const searchDest = getEnhancedPatrolDestination(enemy, tiles, enemies, aiState.lastKnownPlayerPos);
      if (searchDest) {
        return {
          action: 'move',
          targetPosition: searchDest,
          message: getSearchMessage(enemy)
        };
      }
    } else {
      // Move toward last known position
      const searchPath = findSearchPath(enemy, aiState.lastKnownPlayerPos, tiles, enemies);
      if (searchPath) {
        return {
          action: 'move',
          targetPosition: searchPath,
          message: getSearchMessage(enemy)
        };
      }
    }
  }

  // AGGRESSIVE ROAMING: High aggression monsters actively roam even without targets
  if (personality.aggressionLevel >= 70 && behavior !== 'ambusher') {
    const roamDest = getAggressiveRoamDestination(enemy, tiles, enemies, players);
    if (roamDest) {
      return {
        action: 'move',
        targetPosition: roamDest.pos,
        message: roamDest.message
      };
    }
  }

  // Ambushers wait in place (but only if not actively searching)
  if ((behavior === 'ambusher' || personality.combatStyle === 'ambush') &&
      (!aiState?.searchRoundsRemaining || aiState.searchRoundsRemaining <= 0)) {
    return {
      action: 'wait',
      message: getWaitMessage(enemy)
    };
  }

  // Others patrol
  const patrolDest = getPatrolDestination(enemy, tiles, enemies);
  if (patrolDest) {
    return {
      action: 'move',
      targetPosition: patrolDest,
      message: getPatrolMessage(enemy)
    };
  }

  return { action: 'wait', message: getGenericWaitMessage(enemy) };
}

/**
 * Enhanced patrol destination that prefers tiles near a search area
 */
function getEnhancedPatrolDestination(
  enemy: Enemy,
  tiles: Tile[],
  enemies: Enemy[],
  searchCenter: { q: number; r: number }
): { q: number; r: number } | null {
  const neighbors = getHexNeighbors(enemy.position);
  const occupiedPositions = new Set(enemies.map(e => `${e.position.q},${e.position.r}`));

  const validMoves: { pos: { q: number; r: number }; score: number }[] = [];

  for (const pos of neighbors) {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) continue;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile) continue;

    const passability = canEnemyPassTile(enemy, tile);
    if (!passability.canPass) continue;

    // Prefer tiles that keep us near the search center but explore new areas
    const distToCenter = hexDistance(pos, searchCenter);
    const score = 10 - distToCenter + Math.random() * 3; // Add randomness

    validMoves.push({ pos, score });
  }

  if (validMoves.length === 0) return null;

  // Pick weighted random based on score
  validMoves.sort((a, b) => b.score - a.score);

  // 70% chance to pick best, 30% chance for random
  if (Math.random() < 0.7) {
    return validMoves[0].pos;
  }
  return validMoves[Math.floor(Math.random() * validMoves.length)].pos;
}

/**
 * Aggressive roaming - moves toward areas likely to have players
 * Considers: unexplored areas, doors, and general player direction
 */
function getAggressiveRoamDestination(
  enemy: Enemy,
  tiles: Tile[],
  enemies: Enemy[],
  players: Player[]
): { pos: { q: number; r: number }; message: string } | null {
  const neighbors = getHexNeighbors(enemy.position);
  const occupiedPositions = new Set(enemies.map(e => `${e.position.q},${e.position.r}`));

  // Find average player position (even if we can't see them)
  const alivePlayers = players.filter(p => !p.isDead);
  let playerCentroid: { q: number; r: number } | null = null;

  if (alivePlayers.length > 0) {
    const avgQ = alivePlayers.reduce((sum, p) => sum + p.position.q, 0) / alivePlayers.length;
    const avgR = alivePlayers.reduce((sum, p) => sum + p.position.r, 0) / alivePlayers.length;
    playerCentroid = { q: Math.round(avgQ), r: Math.round(avgR) };
  }

  const validMoves: { pos: { q: number; r: number }; score: number }[] = [];

  for (const pos of neighbors) {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) continue;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile) continue;

    const passability = canEnemyPassTile(enemy, tile);
    if (!passability.canPass) continue;

    let score = Math.random() * 2; // Base randomness

    // Prefer moving toward player centroid
    if (playerCentroid) {
      const currentDist = hexDistance(enemy.position, playerCentroid);
      const newDist = hexDistance(pos, playerCentroid);
      if (newDist < currentDist) {
        score += 5; // Bonus for moving toward players
      }
    }

    // Prefer tiles with doors (more areas to explore)
    if (tile.edges?.some(e => e.type === 'door' || e.type === 'locked_door')) {
      score += 3;
    }

    // Prefer dark/dangerous areas based on monster type
    const personality = getMonsterPersonality(enemy.type);
    if (personality.preferredTerrain?.includes(tile.category)) {
      score += 2;
    }

    validMoves.push({ pos, score });
  }

  if (validMoves.length === 0) return null;

  // Sort by score and pick top option
  validMoves.sort((a, b) => b.score - a.score);

  // 80% best move, 20% random for unpredictability
  const selectedPos = Math.random() < 0.8
    ? validMoves[0].pos
    : validMoves[Math.floor(Math.random() * validMoves.length)].pos;

  return {
    pos: selectedPos,
    message: `${enemy.name} jakter rastløst...`
  };
}

// ============================================================================
// AGGRESSION CHECK
// ============================================================================

/**
 * Check if monster hesitates due to low aggression
 * Returns hesitation decision or null if monster should proceed
 *
 * IMPROVED: Monsters with high aggression (70+) never hesitate.
 * Hesitation only occurs at distance 3+ for moderately aggressive monsters.
 * This ensures monsters are more threatening in combat.
 */
export function tryHesitationDecision(
  ctx: DecisionContext,
  distanceToPlayer: number
): AIDecision | null {
  const { enemy, personality } = ctx;

  // Highly aggressive monsters (70+) never hesitate
  if (personality.aggressionLevel >= 70) {
    return null;
  }

  // Only hesitate at distance 3 or more
  if (distanceToPlayer <= 2) {
    return null;
  }

  // Roll against aggression - higher aggression = less likely to hesitate
  const aggressionRoll = Math.random() * 100;
  // Add distance modifier - closer = less hesitation
  const distanceModifier = (distanceToPlayer - 2) * 10;
  const hesitationThreshold = personality.aggressionLevel + 20 - distanceModifier;

  if (aggressionRoll > hesitationThreshold) {
    return {
      action: 'wait',
      message: getHesitationMessage(enemy)
    };
  }

  return null;
}

// ============================================================================
// RANGED ATTACK BEHAVIOR
// ============================================================================

/**
 * Handle ranged attack decision-making
 * Returns decision or null if ranged attack is not applicable
 */
export function tryRangedAttackDecision(
  ctx: DecisionContext,
  targetPlayer: Player,
  distanceToPlayer: number,
  canMakeRangedAttack: (enemy: Enemy, player: Player, tiles: Tile[]) => { canAttack: boolean; blocked: boolean; coverPenalty: number },
  findOptimalRangedPosition: (enemy: Enemy, targetPlayer: Player, tiles: Tile[], enemies: Enemy[]) => { q: number; r: number } | null,
  findRetreatPosition: (enemy: Enemy, target: Player, tiles: Tile[], enemies: Enemy[]) => { q: number; r: number } | null
): AIDecision | null {
  const { enemy, tiles, enemies, behavior, personality, combatStyle } = ctx;

  const isRanged = behavior === 'ranged' || enemy.traits?.includes('ranged');

  // Only handle ranged behavior
  if ((!isRanged && !combatStyle.staysAtRange) || enemy.attackRange <= 1) {
    return null;
  }

  const rangedCheck = canMakeRangedAttack(enemy, targetPlayer, tiles);

  // Can make ranged attack?
  if (rangedCheck.canAttack && distanceToPlayer <= enemy.attackRange) {
    return {
      action: 'attack',
      targetPlayerId: targetPlayer.id,
      message: getRangedAttackMessage(enemy, targetPlayer, rangedCheck.coverPenalty > 0)
    };
  }

  // Find optimal position for ranged attack
  if (!rangedCheck.canAttack || distanceToPlayer > enemy.attackRange) {
    const optimalPos = findOptimalRangedPosition(enemy, targetPlayer, tiles, enemies);
    if (optimalPos) {
      return {
        action: 'move',
        targetPosition: optimalPos,
        message: getRangedPositioningMessage(enemy)
      };
    }
  }

  // Too close - retreat
  if (distanceToPlayer < 2 && (combatStyle.staysAtRange || personality.cowardiceThreshold > 30)) {
    const retreatPos = findRetreatPosition(enemy, targetPlayer, tiles, enemies);
    if (retreatPos) {
      return {
        action: 'move',
        targetPosition: retreatPos,
        message: getRangedRetreatMessage(enemy)
      };
    }
  }

  return null;
}

// ============================================================================
// MELEE ATTACK BEHAVIOR
// ============================================================================

/**
 * Handle melee attack decision-making
 * Returns decision or null if melee attack is not applicable
 */
export function tryMeleeAttackDecision(
  ctx: DecisionContext,
  targetPlayer: Player,
  distanceToPlayer: number,
  priority: TargetPriority | null
): AIDecision | null {
  const { enemy } = ctx;

  // Can attack if in range
  if (distanceToPlayer <= enemy.attackRange) {
    return {
      action: 'attack',
      targetPlayerId: targetPlayer.id,
      message: getAttackMessageWithContext(enemy, targetPlayer, priority)
    };
  }

  return null;
}

// ============================================================================
// SPECIAL MOVEMENT BEHAVIOR
// ============================================================================

/**
 * Handle special movement (e.g., Hound teleportation)
 * Returns decision or null if special movement is not applicable
 */
export function trySpecialMovementDecision(
  ctx: DecisionContext,
  distanceToPlayer: number,
  executeSpecialMovement: (enemy: Enemy, tiles: Tile[], players: Player[], enemies: Enemy[]) => { newPosition: { q: number; r: number }; message: string } | null
): AIDecision | null {
  const { enemy, tiles, players, enemies } = ctx;

  // Hound teleportation when far from target
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

  return null;
}

// ============================================================================
// DEFENSIVE BEHAVIOR
// ============================================================================

/**
 * Check if monster should hold position defensively
 * Returns decision or null if not applicable
 */
export function tryDefensiveDecision(
  ctx: DecisionContext,
  distanceToPlayer: number
): AIDecision | null {
  const { enemy, behavior, personality } = ctx;

  if ((behavior === 'defensive' || personality.combatStyle === 'cautious') && distanceToPlayer > 3) {
    return {
      action: 'wait',
      message: getDefensiveMessage(enemy)
    };
  }

  return null;
}

// ============================================================================
// CHASE BEHAVIOR
// ============================================================================

/**
 * Handle chase/pursuit behavior using enhanced pathfinding
 * Returns decision or null if chase is not possible
 */
export function tryChaseDecision(
  ctx: DecisionContext,
  targetPlayer: Player,
  findEnhancedPath: (enemy: Enemy, start: { q: number; r: number }, goals: { q: number; r: number }[], tiles: Tile[], blockers: Set<string>, maxDepth?: number) => { path: { q: number; r: number }[]; totalCost: number } | null
): AIDecision | null {
  const { enemy, enemies, tiles } = ctx;

  const otherEnemyPositions = new Set(
    enemies
      .filter(e => e.id !== enemy.id)
      .map(e => `${e.position.q},${e.position.r}`)
  );

  // Use enhanced pathfinding
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
      // Check if destination tile has water for message
      const destTile = tiles.find(t =>
        t.q === pathResult.path[moveIndex].q && t.r === pathResult.path[moveIndex].r
      );
      const isInWater = destTile?.hasWater ?? false;

      return {
        action: 'move',
        targetPosition: pathResult.path[moveIndex],
        message: getChaseMessage(enemy, targetPlayer, isInWater)
      };
    }
  }

  return null;
}

/**
 * Fallback chase using basic pathfinding
 * Returns decision or null if chase is not possible
 */
export function tryBasicChaseDecision(
  ctx: DecisionContext,
  targetPlayer: Player
): AIDecision | null {
  const { enemy, enemies, tiles } = ctx;
  const isFlying = enemy.traits?.includes('flying') ?? false;

  const otherEnemyPositions = new Set(
    enemies
      .filter(e => e.id !== enemy.id)
      .map(e => `${e.position.q},${e.position.r}`)
  );

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
      message: getApproachMessage(enemy, targetPlayer)
    };
  }

  return null;
}
