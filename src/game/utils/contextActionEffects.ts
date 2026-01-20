/**
 * Context Action Effects - Pure functions for handling action effects
 *
 * This module extracts the effect handling logic from ShadowsGame.tsx's
 * handleContextActionEffect function. Each function is pure and returns
 * the new state rather than mutating it directly.
 *
 * REFACTORED from a 470-line switch statement into modular, testable functions.
 */

import type {
  Tile,
  EdgeData,
  DoorState,
  Item,
  Player,
  Scenario,
} from '../types';
import { equipItem } from '../types';
import type { ObjectiveSpawnState, SpawnedQuestItem } from './objectiveSpawner';
import { collectQuestItem } from './objectiveSpawner';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Context for action effect processing
 */
export interface ActionEffectContext {
  tileId: string;
  edgeIndex?: number;
  board: Tile[];
  players: Player[];
  activePlayerIndex: number;
  activeScenario: Scenario | null;
  objectiveSpawnState: ObjectiveSpawnState | null;
  questItemsCollected: string[];
}

/**
 * Result from processing an action effect
 */
export interface ActionEffectResult {
  board?: Tile[];
  players?: Player[];
  activeScenario?: Scenario | null;
  objectiveSpawnState?: ObjectiveSpawnState | null;
  questItemsCollected?: string[];
  logMessages?: string[];
  floatingText?: { q: number; r: number; text: string; colorClass: string };
}

/**
 * Adjacent hex offsets by edge index (0-5)
 */
const ADJACENT_OFFSETS: Record<number, { dq: number; dr: number }> = {
  0: { dq: 0, dr: -1 },  // North
  1: { dq: 1, dr: -1 },  // Northeast
  2: { dq: 1, dr: 0 },   // Southeast
  3: { dq: 0, dr: 1 },   // South
  4: { dq: -1, dr: 1 },  // Southwest
  5: { dq: -1, dr: 0 }   // Northwest
};

// ============================================================================
// BOARD UPDATE HELPERS - Pure functions for common board operations
// ============================================================================

/**
 * Updates a single tile in the board
 */
export function updateTile(
  board: Tile[],
  tileId: string,
  updater: (tile: Tile) => Tile
): Tile[] {
  return board.map(t => t.id === tileId ? updater(t) : t);
}

/**
 * Updates an edge on a specific tile
 */
export function updateTileEdge(
  board: Tile[],
  tileId: string,
  edgeIndex: number,
  edgeUpdater: (edge: EdgeData) => EdgeData
): Tile[] {
  return updateTile(board, tileId, tile => {
    const newEdges = [...tile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
    newEdges[edgeIndex] = edgeUpdater(newEdges[edgeIndex]);
    return { ...tile, edges: newEdges };
  });
}

/**
 * Sets the door state on a specific edge
 */
export function setDoorState(
  board: Tile[],
  tileId: string,
  edgeIndex: number,
  doorState: DoorState
): Tile[] {
  return updateTileEdge(board, tileId, edgeIndex, edge => ({
    ...edge,
    doorState
  }));
}

/**
 * Converts a blocked edge to an open edge
 */
export function clearBlockedEdge(
  board: Tile[],
  tileId: string,
  edgeIndex: number
): Tile[] {
  return updateTileEdge(board, tileId, edgeIndex, () => ({
    type: 'open'
  }));
}

/**
 * Removes an obstacle from a tile
 */
export function removeTileObstacle(board: Tile[], tileId: string): Tile[] {
  return updateTile(board, tileId, tile => ({
    ...tile,
    obstacle: undefined
  }));
}

/**
 * Removes an object from a tile
 */
export function removeTileObject(board: Tile[], tileId: string): Tile[] {
  return updateTile(board, tileId, tile => ({
    ...tile,
    object: undefined
  }));
}

/**
 * Gets the adjacent tile position through a specific edge
 */
export function getAdjacentPosition(
  tile: Tile,
  edgeIndex: number
): { q: number; r: number } | null {
  const offset = ADJACENT_OFFSETS[edgeIndex];
  if (!offset) return null;
  return {
    q: tile.q + offset.dq,
    r: tile.r + offset.dr
  };
}

// ============================================================================
// DOOR EFFECT HANDLERS
// ============================================================================

/**
 * Handles door opening effects (open_door, use_key, lockpick)
 */
export function handleOpenDoorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (ctx.edgeIndex === undefined) return {};

  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile) return {};

  const adjacentPos = getAdjacentPosition(tile, ctx.edgeIndex);

  return {
    board: setDoorState(ctx.board, ctx.tileId, ctx.edgeIndex, 'open'),
    // Note: fog reveal is handled separately via callback
  };
}

/**
 * Handles door breaking effects (force_door, break_barricade)
 */
export function handleBreakDoorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (ctx.edgeIndex === undefined) return {};

  return {
    board: setDoorState(ctx.board, ctx.tileId, ctx.edgeIndex, 'broken')
  };
}

/**
 * Handles door closing effect
 */
export function handleCloseDoorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (ctx.edgeIndex === undefined) return {};

  return {
    board: setDoorState(ctx.board, ctx.tileId, ctx.edgeIndex, 'closed')
  };
}

// ============================================================================
// OBSTACLE/EDGE EFFECT HANDLERS
// ============================================================================

/**
 * Handles clearing tile obstacles (clear_rubble, extinguish)
 */
export function handleClearObstacleEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  return {
    board: removeTileObstacle(ctx.board, ctx.tileId)
  };
}

/**
 * Handles clearing blocked edges
 * Used for: clear_edge_rubble, break_edge_barricade, unlock_edge_gate, etc.
 */
export function handleClearEdgeEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (ctx.edgeIndex === undefined) return {};

  return {
    board: clearBlockedEdge(ctx.board, ctx.tileId, ctx.edgeIndex),
    logMessages: ['The passage is now clear.']
  };
}

/**
 * Handles breaking windows (converts to open edge)
 */
export function handleBreakWindowEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (ctx.edgeIndex === undefined) return {};

  return {
    board: clearBlockedEdge(ctx.board, ctx.tileId, ctx.edgeIndex),
    logMessages: ['The window shatters! You can now pass through.']
  };
}

/**
 * Handles removing tile objects (gate, trap, fog_wall)
 */
export function handleRemoveObjectEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  return {
    board: removeTileObject(ctx.board, ctx.tileId)
  };
}

// ============================================================================
// SEARCH EFFECT HANDLERS
// ============================================================================

/**
 * Handles search actions and quest item collection
 */
export function handleSearchEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile) return {};

  const logMessages: string[] = [];
  let updatedBoard = ctx.board;
  let updatedPlayers = ctx.players;
  let updatedObjectiveSpawnState = ctx.objectiveSpawnState;
  let updatedScenario = ctx.activeScenario;
  let updatedQuestItemsCollected = ctx.questItemsCollected;
  let floatingText: ActionEffectResult['floatingText'] | undefined;

  // Check for quest items on this tile
  const questItem = ctx.objectiveSpawnState?.questItems.find(
    qi => qi.spawned && qi.spawnedOnTileId === tile.id && !qi.collected
  );

  if (questItem && ctx.activeScenario && ctx.objectiveSpawnState) {
    // Collect the quest item
    const result = collectQuestItem(ctx.objectiveSpawnState, questItem, ctx.activeScenario);
    updatedObjectiveSpawnState = result.updatedState;

    if (result.updatedObjective) {
      updatedScenario = {
        ...ctx.activeScenario,
        objectives: ctx.activeScenario.objectives.map(o =>
          o.id === result.updatedObjective!.id ? result.updatedObjective! : o
        )
      };

      logMessages.push(`QUEST ITEM FOUND: ${questItem.name}`);
      logMessages.push(questItem.description);

      if (result.objectiveCompleted) {
        logMessages.push(`OBJECTIVE COMPLETE: ${result.updatedObjective.shortDescription}`);
      } else {
        logMessages.push(`Progress: ${result.updatedObjective.shortDescription}`);
      }
    }

    updatedQuestItemsCollected = [...ctx.questItemsCollected, questItem.id];

    // Add quest item to player's inventory
    const questItemForInventory = createQuestItemForInventory(questItem);
    const activePlayer = ctx.players[ctx.activePlayerIndex];

    if (activePlayer) {
      const equipResult = equipItem(activePlayer.inventory, questItemForInventory);
      if (equipResult.success) {
        updatedPlayers = ctx.players.map((p, idx) => {
          if (idx === ctx.activePlayerIndex) {
            return { ...p, inventory: equipResult.inventory };
          }
          return p;
        });
        logMessages.push(`${activePlayer.name} tar med seg ${questItem.name}.`);
        floatingText = {
          q: activePlayer.position.q,
          r: activePlayer.position.r,
          text: questItem.name,
          colorClass: 'text-yellow-400'
        };
      } else {
        logMessages.push(`Warning: Inventory full! Quest item ${questItem.name} is tracked but not stored.`);
      }
    }
  }

  // Update the tile as searched
  updatedBoard = updateTile(updatedBoard, ctx.tileId, t => {
    const updatedItems = questItem
      ? (t.items || []).filter(item => item.id !== questItem.id)
      : t.items;
    const hasRemainingQuestItems = updatedItems?.some(i => i.isQuestItem) || false;

    if (t.object) {
      return {
        ...t,
        searched: true,
        object: { ...t.object, searched: true },
        items: updatedItems,
        hasQuestItem: hasRemainingQuestItems
      };
    }
    return {
      ...t,
      searched: true,
      items: updatedItems,
      hasQuestItem: hasRemainingQuestItems
    };
  });

  return {
    board: updatedBoard,
    players: updatedPlayers,
    objectiveSpawnState: updatedObjectiveSpawnState,
    activeScenario: updatedScenario,
    questItemsCollected: updatedQuestItemsCollected,
    logMessages,
    floatingText
  };
}

/**
 * Creates an Item from a SpawnedQuestItem for inventory
 */
function createQuestItemForInventory(questItem: SpawnedQuestItem): Item {
  return {
    id: `quest_${questItem.id}`,
    name: questItem.name,
    description: questItem.description,
    type: 'quest_item',
    isQuestItem: true,
    questItemType: questItem.type as 'key' | 'clue' | 'collectible' | 'artifact' | 'component',
    objectiveId: questItem.objectiveId,
    slotType: 'bag',
    category: 'special'
  };
}

// ============================================================================
// OBJECTIVE EFFECT HANDLERS
// ============================================================================

/**
 * Handles objective completion effects (perform_ritual, seal_portal, flip_switch)
 */
export function handleObjectiveProgressEffect(
  ctx: ActionEffectContext,
  tile: Tile
): ActionEffectResult {
  if (!ctx.activeScenario) return {};

  const logMessages: string[] = [];
  let floatingText: ActionEffectResult['floatingText'] | undefined;

  // Find matching ritual or interact objective
  const interactObjective = ctx.activeScenario.objectives.find(
    obj => (obj.type === 'ritual' || obj.type === 'interact') && !obj.completed && !obj.isHidden
  );

  if (!interactObjective) return {};

  const newAmount = (interactObjective.currentAmount || 0) + 1;
  const targetAmount = interactObjective.targetAmount || 1;
  const isComplete = newAmount >= targetAmount;

  const updatedScenario = {
    ...ctx.activeScenario,
    objectives: ctx.activeScenario.objectives.map(obj => {
      if (obj.id === interactObjective.id) {
        const updatedObj = { ...obj, currentAmount: newAmount, completed: isComplete };
        // Update shortDescription with progress
        if (targetAmount > 1) {
          updatedObj.shortDescription = obj.shortDescription.replace(
            /\(\d+\/\d+\)/, `(${newAmount}/${targetAmount})`
          );
        }
        return updatedObj;
      }
      // Reveal hidden objectives when their prerequisite is completed
      if (obj.isHidden && obj.revealedBy === interactObjective.id && isComplete) {
        return { ...obj, isHidden: false };
      }
      return obj;
    })
  };

  if (isComplete) {
    logMessages.push(`OBJECTIVE COMPLETE: ${interactObjective.shortDescription}`);
    floatingText = { q: tile.q, r: tile.r, text: 'OBJECTIVE COMPLETE!', colorClass: 'text-purple-400' };
  } else {
    logMessages.push(`Objective progress: ${interactObjective.shortDescription} (${newAmount}/${targetAmount})`);
    floatingText = { q: tile.q, r: tile.r, text: `${newAmount}/${targetAmount}`, colorClass: 'text-yellow-400' };
  }

  return {
    activeScenario: updatedScenario,
    logMessages,
    floatingText
  };
}

/**
 * Handles escape action effect
 */
export function handleEscapeEffect(
  ctx: ActionEffectContext,
  tile: Tile
): ActionEffectResult {
  if (!ctx.activeScenario) return {};

  const logMessages: string[] = [];
  let floatingText: ActionEffectResult['floatingText'] | undefined;

  const escapeObjective = ctx.activeScenario.objectives.find(
    obj => obj.type === 'escape' && !obj.completed
  );

  if (escapeObjective) {
    const updatedScenario = {
      ...ctx.activeScenario,
      objectives: ctx.activeScenario.objectives.map(obj =>
        obj.id === escapeObjective.id
          ? { ...obj, completed: true }
          : obj
      )
    };

    logMessages.push(`OBJECTIVE COMPLETE: ${escapeObjective.shortDescription}`);
    logMessages.push('You have escaped!');
    floatingText = { q: tile.q, r: tile.r, text: 'ESCAPED!', colorClass: 'text-green-400' };

    return {
      activeScenario: updatedScenario,
      logMessages,
      floatingText
    };
  }

  // No escape objective but still on exit
  logMessages.push('You have escaped the horrors within!');
  floatingText = { q: tile.q, r: tile.r, text: 'ESCAPED!', colorClass: 'text-green-400' };

  return { logMessages, floatingText };
}

// ============================================================================
// QUEST ITEM PICKUP HANDLER
// ============================================================================

/**
 * Handles picking up a visible quest item
 */
export function handleQuestItemPickupEffect(
  ctx: ActionEffectContext,
  itemIndex: number
): ActionEffectResult {
  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile || !ctx.activeScenario) return {};

  const questItems = tile.items?.filter(item => item.isQuestItem) || [];
  const questItemToPickup = questItems[itemIndex];

  if (!questItemToPickup) return {};

  const logMessages: string[] = [];
  let floatingText: ActionEffectResult['floatingText'] | undefined;
  let updatedBoard = ctx.board;
  let updatedPlayers = ctx.players;
  let updatedObjectiveSpawnState = ctx.objectiveSpawnState;
  let updatedScenario = ctx.activeScenario;
  let updatedQuestItemsCollected = ctx.questItemsCollected;

  // Find matching quest item in spawn state
  const spawnedQuestItem = ctx.objectiveSpawnState?.questItems.find(
    qi => qi.spawned && qi.spawnedOnTileId === tile.id && !qi.collected &&
          (qi.id === questItemToPickup.id || qi.name === questItemToPickup.name)
  );

  if (spawnedQuestItem && ctx.objectiveSpawnState) {
    // Collect via spawn state system
    const result = collectQuestItem(ctx.objectiveSpawnState, spawnedQuestItem, ctx.activeScenario);
    updatedObjectiveSpawnState = result.updatedState;

    if (result.updatedObjective) {
      updatedScenario = {
        ...ctx.activeScenario,
        objectives: ctx.activeScenario.objectives.map(o =>
          o.id === result.updatedObjective!.id ? result.updatedObjective! : o
        )
      };

      logMessages.push(`QUEST ITEM COLLECTED: ${spawnedQuestItem.name}`);

      if (result.objectiveCompleted) {
        logMessages.push(`OBJECTIVE COMPLETE: ${result.updatedObjective.shortDescription}`);
        floatingText = { q: tile.q, r: tile.r, text: 'OBJECTIVE COMPLETE!', colorClass: 'text-green-400' };
      } else {
        logMessages.push(`Progress: ${result.updatedObjective.shortDescription}`);
      }
    }

    updatedQuestItemsCollected = [...ctx.questItemsCollected, spawnedQuestItem.id];
  }

  // Add quest item to player's inventory
  const questItemForInventory: Item = {
    id: `quest_${questItemToPickup.id || Date.now()}`,
    name: questItemToPickup.name,
    description: questItemToPickup.description || '',
    type: 'quest_item',
    isQuestItem: true,
    questItemType: questItemToPickup.questItemType as 'key' | 'clue' | 'collectible' | 'artifact' | 'component',
    objectiveId: questItemToPickup.objectiveId,
    slotType: 'bag',
    category: 'special'
  };

  const activePlayer = ctx.players[ctx.activePlayerIndex];
  if (activePlayer) {
    const equipResult = equipItem(activePlayer.inventory, questItemForInventory);
    if (equipResult.success) {
      updatedPlayers = ctx.players.map((p, idx) => {
        if (idx === ctx.activePlayerIndex) {
          return { ...p, inventory: equipResult.inventory };
        }
        return p;
      });
      logMessages.push(`${activePlayer.name} tar med seg ${questItemToPickup.name}.`);
      floatingText = floatingText || {
        q: activePlayer.position.q,
        r: activePlayer.position.r,
        text: questItemToPickup.name,
        colorClass: 'text-yellow-400'
      };
    } else {
      logMessages.push(`Warning: Inventory full! Quest item ${questItemToPickup.name} is tracked but not stored.`);
    }
  }

  // Remove item from tile
  updatedBoard = updateTile(updatedBoard, ctx.tileId, t => {
    const updatedItems = (t.items || []).filter(item =>
      item.id !== questItemToPickup.id && item.name !== questItemToPickup.name
    );
    const hasRemainingQuestItems = updatedItems.some(i => i.isQuestItem);
    return {
      ...t,
      items: updatedItems,
      hasQuestItem: hasRemainingQuestItems
    };
  });

  return {
    board: updatedBoard,
    players: updatedPlayers,
    objectiveSpawnState: updatedObjectiveSpawnState,
    activeScenario: updatedScenario,
    questItemsCollected: updatedQuestItemsCollected,
    logMessages,
    floatingText
  };
}

// ============================================================================
// ACTION EFFECT DISPATCHER
// ============================================================================

/**
 * Action IDs grouped by their effect handler
 */
const OPEN_DOOR_ACTIONS = ['open_door', 'use_key', 'lockpick'];
const BREAK_DOOR_ACTIONS = ['force_door', 'break_barricade'];
const CLEAR_OBSTACLE_ACTIONS = ['clear_rubble', 'extinguish'];
const SEARCH_ACTIONS = [
  'search_tile', 'search_books', 'search_container',
  'search_rubble', 'search_water', 'search_statue'
];
const REMOVE_OBJECT_ACTIONS = [
  'open_gate', 'force_gate', 'disarm_trap', 'trigger_trap', 'dispel_fog'
];
const CLEAR_EDGE_ACTIONS = [
  'clear_edge_rubble', 'clear_edge_heavy_rubble', 'break_edge_barricade',
  'unlock_edge_gate', 'lockpick_edge_gate', 'force_edge_gate',
  'extinguish_edge_fire', 'dispel_edge_ward', 'banish_edge_spirits'
];
const OBJECTIVE_PROGRESS_ACTIONS = ['perform_ritual', 'seal_portal', 'flip_switch'];

/**
 * Processes an action effect and returns the state updates
 *
 * @param actionId - The ID of the action being processed
 * @param ctx - The context containing current state and target info
 * @returns The state updates to apply
 */
export function processActionEffect(
  actionId: string,
  ctx: ActionEffectContext
): ActionEffectResult {
  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile) return {};

  // Door effects
  if (OPEN_DOOR_ACTIONS.includes(actionId)) {
    return handleOpenDoorEffect(ctx);
  }
  if (BREAK_DOOR_ACTIONS.includes(actionId)) {
    return handleBreakDoorEffect(ctx);
  }
  if (actionId === 'close_door') {
    return handleCloseDoorEffect(ctx);
  }

  // Obstacle effects
  if (CLEAR_OBSTACLE_ACTIONS.includes(actionId)) {
    return handleClearObstacleEffect(ctx);
  }

  // Search effects
  if (SEARCH_ACTIONS.includes(actionId)) {
    return handleSearchEffect(ctx);
  }

  // Object removal effects
  if (REMOVE_OBJECT_ACTIONS.includes(actionId)) {
    return handleRemoveObjectEffect(ctx);
  }

  // Edge clearing effects
  if (CLEAR_EDGE_ACTIONS.includes(actionId)) {
    return handleClearEdgeEffect(ctx);
  }

  // Window breaking
  if (actionId === 'break_window') {
    return handleBreakWindowEffect(ctx);
  }

  // Edge search (no state change, just log)
  if (actionId === 'search_edge_rubble' || actionId === 'search_edge_water') {
    return {
      logMessages: ['You search carefully but find nothing of value.']
    };
  }

  // Objective progress
  if (OBJECTIVE_PROGRESS_ACTIONS.includes(actionId)) {
    return handleObjectiveProgressEffect(ctx, tile);
  }

  // Escape
  if (actionId === 'escape') {
    return handleEscapeEffect(ctx, tile);
  }

  // Quest item pickup
  if (actionId.startsWith('pickup_quest_item_')) {
    const itemIndex = parseInt(actionId.replace('pickup_quest_item_', ''), 10);
    return handleQuestItemPickupEffect(ctx, itemIndex);
  }

  // Unknown action - no effect
  return {};
}
