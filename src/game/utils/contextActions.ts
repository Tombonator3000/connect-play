/**
 * Context Actions System for Shadows of the 1920s
 *
 * When a player clicks on an obstacle, door, or special tile,
 * this system determines which actions are available.
 *
 * REFACTORED: Now uses declarative configuration from contextActionDefinitions.ts
 * and builder functions from contextActionBuilder.ts for cleaner, more maintainable code.
 */

import type {
  Player,
  Tile,
  EdgeData,
  Obstacle,
  TileObject,
  ContextAction,
  ContextActionTarget
} from '../types';
import { hasKey } from '../types';

// Import action definitions
import {
  DOOR_STATE_ACTIONS,
  LOCKED_DOOR_ACTIONS,
  BARRICADED_DOOR_ACTIONS,
  SEALED_DOOR_ACTIONS,
  BLOCKED_EDGE_ACTIONS,
  FIRE_EDGE_ACTIONS,
  LOCKED_GATE_EDGE_ACTIONS,
  SPIRIT_BARRIER_EDGE_ACTIONS,
  WARD_EDGE_ACTIONS,
  CHASM_WITH_ROPE_ACTIONS,
  OBSTACLE_ACTIONS,
  FIRE_OBSTACLE_ACTIONS,
  GAS_POISON_ACTIONS,
  DARKNESS_OBSTACLE_ACTIONS,
  SPIRIT_BARRIER_OBSTACLE_ACTIONS,
  TILE_OBJECT_ACTIONS,
  TRAP_ACTIONS,
  GATE_ACTIONS,
  WINDOW_EDGE_ACTIONS,
  CANCEL_ACTION
} from './contextActionDefinitions';

// Import action builders
import {
  createActionContext,
  buildStaticAction,
  buildActionsFromConfigs,
  buildLockedDoorActions,
  buildSealedDoorActions,
  buildBlockedEdgeActions,
  buildSearchableActions,
  buildBookshelfActions,
  buildStatueActions,
  withCancelAction
} from './contextActionBuilder';

// ============================================================================
// DOOR CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a door edge
 */
export function getDoorActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  if (edge.type !== 'door') {
    return [];
  }

  const doorState = edge.doorState || 'closed';
  const context = createActionContext(player, {
    lockType: edge.lockType,
    keyId: edge.keyId
  });

  let actions: ContextAction[] = [];

  switch (doorState) {
    case 'open':
    case 'closed':
    case 'puzzle':
    case 'broken':
      // Simple states - use static configs
      const staticConfigs = DOOR_STATE_ACTIONS[doorState];
      if (staticConfigs) {
        actions = staticConfigs.map(buildStaticAction);
      }
      break;

    case 'locked':
      actions = buildLockedDoorActions(context, LOCKED_DOOR_ACTIONS);
      break;

    case 'barricaded':
      actions = BARRICADED_DOOR_ACTIONS.map(buildStaticAction);
      break;

    case 'sealed':
      actions = buildSealedDoorActions(context, SEALED_DOOR_ACTIONS);
      break;
  }

  return withCancelAction(actions);
}

// ============================================================================
// BLOCKED EDGE CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a blocked edge (rubble, fire, collapsed, etc.)
 */
export function getBlockedEdgeActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  if (edge.type !== 'blocked' || !edge.blockingType) {
    // Generic blocked message
    return withCancelAction([{
      id: 'examine_blocked',
      label: 'Examine',
      icon: 'search',
      apCost: 0,
      enabled: true,
      successMessage: 'The path is blocked. There is no way through.'
    }]);
  }

  const context = createActionContext(player, {
    blockingDC: edge.blockingDC,
    keyId: edge.blockingItemRequired
  });

  let actions: ContextAction[] = [];

  // Handle types with dynamic actions (item checks, variable DC)
  switch (edge.blockingType) {
    case 'fire':
      actions = buildBlockedEdgeActions(context, FIRE_EDGE_ACTIONS);
      break;

    case 'locked_gate':
      actions = buildBlockedEdgeActions(context, LOCKED_GATE_EDGE_ACTIONS);
      break;

    case 'spirit_barrier':
      actions = buildBlockedEdgeActions(context, SPIRIT_BARRIER_EDGE_ACTIONS);
      break;

    case 'ward':
      actions = buildBlockedEdgeActions(context, WARD_EDGE_ACTIONS);
      break;

    case 'chasm':
      // Chasm has static examine + dynamic rope action
      const chasmStatic = BLOCKED_EDGE_ACTIONS['chasm'];
      if (chasmStatic) {
        actions = buildActionsFromConfigs(chasmStatic, context);
      }
      actions = actions.concat(buildBlockedEdgeActions(context, CHASM_WITH_ROPE_ACTIONS));
      break;

    default:
      // Static blocked edge types
      const staticConfigs = BLOCKED_EDGE_ACTIONS[edge.blockingType];
      if (staticConfigs) {
        actions = buildActionsFromConfigs(staticConfigs, context);
      }
      break;
  }

  return withCancelAction(actions);
}

/**
 * Gets available actions for a window edge
 */
export function getWindowEdgeActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  const actions = WINDOW_EDGE_ACTIONS.map(buildStaticAction);
  return withCancelAction(actions);
}

// ============================================================================
// OBSTACLE CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for an obstacle
 */
export function getObstacleActions(
  player: Player,
  obstacle: Obstacle,
  tile: Tile
): ContextAction[] {
  const context = createActionContext(player, {
    searched: obstacle.searched
  });

  let actions: ContextAction[] = [];

  // Handle types with dynamic actions (item checks)
  switch (obstacle.type) {
    case 'fire':
      actions = buildBlockedEdgeActions(context, FIRE_OBSTACLE_ACTIONS);
      break;

    case 'gas_poison':
      actions = buildBlockedEdgeActions(context, GAS_POISON_ACTIONS);
      break;

    case 'darkness':
      actions = buildBlockedEdgeActions(context, DARKNESS_OBSTACLE_ACTIONS);
      break;

    case 'spirit_barrier':
      actions = buildBlockedEdgeActions(context, SPIRIT_BARRIER_OBSTACLE_ACTIONS);
      break;

    default:
      // Static obstacle types
      const staticConfigs = OBSTACLE_ACTIONS[obstacle.type];
      if (staticConfigs) {
        actions = buildActionsFromConfigs(staticConfigs, context);
      }
      break;
  }

  return withCancelAction(actions);
}

// ============================================================================
// TILE OBJECT CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a tile object
 */
export function getTileObjectActions(
  player: Player,
  object: TileObject,
  tile: Tile
): ContextAction[] {
  const context = createActionContext(player, {
    searched: object.searched
  });

  let actions: ContextAction[] = [];

  // First, add quest item pickup actions if there are visible quest items
  const hasVisibleQuestItems = tile.items && tile.items.length > 0 && tile.items.some(item => item.isQuestItem);
  if (hasVisibleQuestItems) {
    const questItems = tile.items?.filter(item => item.isQuestItem) || [];
    questItems.forEach((item, index) => {
      actions.push({
        id: `pickup_quest_item_${index}`,
        label: `Plukk opp: ${item.name}`,
        icon: 'interact',
        apCost: 0,
        enabled: true,
        successMessage: `Du plukket opp ${item.name}!`
      });
    });
  }

  switch (object.type) {
    case 'bookshelf':
      actions = [...actions, ...buildBookshelfActions(context)];
      break;

    case 'crate':
    case 'cabinet':
      actions = [...actions, ...buildSearchableActions(context, 3)];
      break;

    case 'chest':
      actions = [...actions, ...buildSearchableActions(context, 4)];
      break;

    case 'statue':
      actions = [...actions, ...buildStatueActions(context)];
      break;

    case 'trap':
      actions = [...actions, ...TRAP_ACTIONS.map(buildStaticAction)];
      break;

    case 'gate':
      actions = [...actions, ...buildBlockedEdgeActions(context, GATE_ACTIONS)];
      break;

    case 'locked_door':
      // Delegate to door actions - return empty, handled elsewhere
      break;

    default:
      // Static object types
      const staticConfigs = TILE_OBJECT_ACTIONS[object.type];
      if (staticConfigs) {
        actions = [...actions, ...buildActionsFromConfigs(staticConfigs, context)];
      }
      break;
  }

  return withCancelAction(actions);
}

// ============================================================================
// MAIN CONTEXT ACTION FUNCTION
// ============================================================================

/**
 * Gets all available context actions for a target
 */
export function getContextActions(
  player: Player,
  target: ContextActionTarget,
  tile: Tile
): ContextAction[] {
  switch (target.type) {
    case 'edge':
      if (target.edge) {
        // Route to appropriate edge action handler based on edge type
        if (target.edge.type === 'blocked') {
          return getBlockedEdgeActions(player, target.edge, tile);
        }
        if (target.edge.type === 'window') {
          return getWindowEdgeActions(player, target.edge, tile);
        }
        // Default to door actions for door type edges
        return getDoorActions(player, target.edge, tile);
      }
      break;

    case 'obstacle':
      if (target.obstacle) {
        return getObstacleActions(player, target.obstacle, tile);
      }
      break;

    case 'object':
      if (target.object) {
        return getTileObjectActions(player, target.object, tile);
      }
      break;

    case 'tile':
      // General tile actions (search, pick up items, etc.)
      const actions: ContextAction[] = [];

      // Check if tile has visible quest items that can be picked up
      const hasVisibleQuestItems = tile.items && tile.items.length > 0 && tile.items.some(item => item.isQuestItem);
      if (hasVisibleQuestItems) {
        // Add pick up action for each visible quest item
        const questItems = tile.items?.filter(item => item.isQuestItem) || [];
        questItems.forEach((item, index) => {
          actions.push({
            id: `pickup_quest_item_${index}`,
            label: `Plukk opp: ${item.name}`,
            icon: 'interact',
            apCost: 0, // Free action to pick up visible items
            enabled: true,
            successMessage: `Du plukket opp ${item.name}!`
          });
        });
      }

      // Standard search action for searchable tiles
      if (tile.searchable && !tile.searched) {
        actions.push({
          id: 'search_tile',
          label: 'Search Area (Int 3)',
          icon: 'search',
          skillCheck: { skill: 'intellect', dc: 3 },
          apCost: 1,
          enabled: true,
          successMessage: 'You find something!',
          failureMessage: 'Nothing here.'
        });
      }
      return withCancelAction(actions);
  }

  return [buildStaticAction(CANCEL_ACTION)];
}

/**
 * Gets actions specifically for when player clicks on a secret door (once discovered)
 */
export function getSecretDoorActions(
  player: Player,
  isDiscovered: boolean
): ContextAction[] {
  if (!isDiscovered) {
    return [{
      id: 'investigate',
      label: 'Investigate (Int 5)',
      icon: 'search',
      skillCheck: { skill: 'intellect', dc: 5 },
      apCost: 1,
      enabled: true,
      successMessage: 'You discover a hidden passage!',
      failureMessage: 'You find nothing unusual.',
      consequences: {
        success: { type: 'reveal_secret' }
      }
    }, buildStaticAction(CANCEL_ACTION)];
  }

  return [{
    id: 'use_secret_door',
    label: 'Use Secret Passage',
    icon: 'interact',
    apCost: 1,
    enabled: true,
    successMessage: 'You slip through the secret passage.'
  }, buildStaticAction(CANCEL_ACTION)];
}

// ============================================================================
// RE-EXPORTS FOR BACKWARDS COMPATIBILITY
// ============================================================================

// Re-export types and definitions for consumers who may need them
export type {
  ActionConfig,
  DynamicActionConfig,
  ActionContext,
  ActionConsequence
} from './contextActionDefinitions';

export {
  createActionContext,
  buildStaticAction,
  buildActionsFromConfigs,
  withCancelAction
} from './contextActionBuilder';
