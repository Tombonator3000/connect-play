/**
 * Monster Obstacle Handling System
 * Extracted from monsterAI.ts for better modularity
 *
 * Handles how different monster types interact with obstacles:
 * - Flying creatures can pass over obstacles
 * - Aquatic creatures have water bonuses
 * - Ethereal creatures can phase through certain barriers
 * - Massive creatures can destroy some obstacles
 */

import { Enemy, Tile, TileObjectType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ObstaclePassability {
  blocking: boolean;
  flyingCanPass: boolean;
  aquaticCanPass: boolean;
  etherealCanPass: boolean;
  massiveCanDestroy: boolean;
  movementCost: number;  // Extra movement cost (0 = impassable if blocking)
}

export interface PassabilityResult {
  canPass: boolean;
  movementCost: number;
}

// ============================================================================
// OBSTACLE PASSABILITY TABLE
// ============================================================================

/**
 * Defines how different obstacle types interact with monster traits
 */
export const OBSTACLE_PASSABILITY: Record<TileObjectType, ObstaclePassability> = {
  locked_door: {
    blocking: true,
    flyingCanPass: false,
    aquaticCanPass: false,
    etherealCanPass: false,
    massiveCanDestroy: true,
    movementCost: 0
  },
  rubble: {
    blocking: true,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  fire: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 1
  },
  trap: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 0
  },
  fog_wall: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: true,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 1
  },
  gate: {
    blocking: true,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: false,
    massiveCanDestroy: true,
    movementCost: 0
  },
  barricade: {
    blocking: true,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  altar: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 0
  },
  bookshelf: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  crate: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  chest: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  cabinet: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  mirror: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  radio: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  switch: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 0
  },
  statue: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: false,
    etherealCanPass: true,
    massiveCanDestroy: true,
    movementCost: 0
  },
  exit_door: {
    blocking: false,
    flyingCanPass: true,
    aquaticCanPass: true,
    etherealCanPass: true,
    massiveCanDestroy: false,
    movementCost: 0
  },
  eldritch_portal: {
    blocking: false,        // Portals don't block movement
    flyingCanPass: true,
    aquaticCanPass: true,
    etherealCanPass: true,
    massiveCanDestroy: false, // Portals cannot be destroyed by massive creatures
    movementCost: 0
  },
};

// ============================================================================
// ETHEREAL CREATURE TYPES
// ============================================================================

/** Creature types that can phase through certain obstacles */
const ETHEREAL_CREATURES = ['nightgaunt', 'hunting_horror', 'formless_spawn'] as const;

function isEtherealCreature(type: string): boolean {
  return (ETHEREAL_CREATURES as readonly string[]).includes(type);
}

// ============================================================================
// PUBLIC FUNCTIONS
// ============================================================================

/**
 * Check if an enemy can pass through a tile based on obstacles and traits
 *
 * @param enemy - The enemy attempting to pass
 * @param tile - The tile to check passability for
 * @returns Object with canPass boolean and movementCost
 */
export function canEnemyPassTile(enemy: Enemy, tile: Tile): PassabilityResult {
  // Check main obstacle blocking flag
  if (tile.obstacle?.blocking) {
    return checkBlockingObstacle(enemy);
  }

  // Check tile object
  if (tile.object) {
    const result = checkTileObject(enemy, tile);
    if (result !== null) {
      return result;
    }
  }

  // Check water tiles
  if (tile.hasWater) {
    return checkWaterPassability(enemy);
  }

  return { canPass: true, movementCost: 0 };
}

/**
 * Check passability for a blocking obstacle
 */
function checkBlockingObstacle(enemy: Enemy): PassabilityResult {
  // Flying enemies can pass over most obstacles
  if (enemy.traits?.includes('flying')) {
    return { canPass: true, movementCost: 0 };
  }

  // Massive enemies need to destroy obstacles first
  if (enemy.traits?.includes('massive')) {
    return { canPass: false, movementCost: 0 };
  }

  return { canPass: false, movementCost: 0 };
}

/**
 * Check passability for tile objects using the passability table
 */
function checkTileObject(enemy: Enemy, tile: Tile): PassabilityResult | null {
  if (!tile.object) return null;

  const obstacleInfo = OBSTACLE_PASSABILITY[tile.object.type];
  if (!obstacleInfo) return null;

  // If object is explicitly marked as blocking
  if (tile.object.blocking) {
    // Check trait-based exceptions
    if (enemy.traits?.includes('flying') && obstacleInfo.flyingCanPass) {
      return { canPass: true, movementCost: 0 };
    }
    if (enemy.traits?.includes('aquatic') && obstacleInfo.aquaticCanPass) {
      return { canPass: true, movementCost: 0 };
    }
    if (isEtherealCreature(enemy.type) && obstacleInfo.etherealCanPass) {
      return { canPass: true, movementCost: 0 };
    }
    return { canPass: false, movementCost: 0 };
  }

  // Non-blocking obstacles may have movement cost
  return { canPass: true, movementCost: obstacleInfo.movementCost };
}

/**
 * Check passability for water tiles
 */
function checkWaterPassability(enemy: Enemy): PassabilityResult {
  // Aquatic enemies get bonus movement in water
  if (enemy.traits?.includes('aquatic')) {
    return { canPass: true, movementCost: -1 };
  }

  // Flying enemies unaffected by water
  if (enemy.traits?.includes('flying')) {
    return { canPass: true, movementCost: 0 };
  }

  // Ground-based enemies struggle in water
  return { canPass: true, movementCost: 1 };
}

/**
 * Check if a massive creature can destroy an obstacle
 */
export function canMassiveDestroy(obstacleType: TileObjectType): boolean {
  const info = OBSTACLE_PASSABILITY[obstacleType];
  return info?.massiveCanDestroy ?? false;
}

/**
 * Get movement cost modifier for a tile based on enemy traits
 */
export function getMovementCostModifier(enemy: Enemy, tile: Tile): number {
  const result = canEnemyPassTile(enemy, tile);
  return result.movementCost;
}
