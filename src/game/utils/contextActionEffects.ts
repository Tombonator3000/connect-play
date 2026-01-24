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
  Survivor,
  SpellParticle,
} from '../types';
import { equipItem } from '../types';
import type { ObjectiveSpawnState, QuestItem } from './objectiveSpawner';
import { collectQuestItem, spawnRevealedQuestTileImmediately } from './objectiveSpawner';
import {
  startFollowing,
  rescueSurvivor,
  useSurvivorAbility,
} from './survivorSystem';

// Alias for backward compatibility
type SpawnedQuestItem = QuestItem;

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
  survivors?: Survivor[];
  targetSurvivorId?: string;
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
  /** If true, move player through edge to adjacent tile after effect */
  movePlayerThroughEdge?: boolean;
  /** Updated survivors array */
  survivors?: Survivor[];
  /** Survivor rewards to apply */
  survivorRewards?: {
    insight?: number;
    sanity?: number;
    gold?: number;
    doomBonus?: number;
  };
  /** Spell/visual particle effect to spawn */
  spellParticle?: SpellParticle;
  /** Spawn a boss enemy - for final confrontation reveal */
  spawnBoss?: {
    type: string;
    message: string;
  };
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
 * Sets the door state on a specific edge AND the corresponding edge on the adjacent tile
 * This ensures doors stay in sync on both sides
 */
export function setDoorState(
  board: Tile[],
  tileId: string,
  edgeIndex: number,
  doorState: DoorState
): Tile[] {
  // First update the door on the source tile
  let updatedBoard = updateTileEdge(board, tileId, edgeIndex, edge => ({
    ...edge,
    doorState
  }));

  // Now find and update the adjacent tile's corresponding edge
  const tile = board.find(t => t.id === tileId);
  if (tile) {
    const adjacentPos = getAdjacentPosition(tile, edgeIndex);
    if (adjacentPos) {
      const adjacentTile = updatedBoard.find(t => t.q === adjacentPos.q && t.r === adjacentPos.r);
      if (adjacentTile) {
        // The opposite edge index (0 <-> 3, 1 <-> 4, 2 <-> 5)
        const oppositeEdgeIndex = (edgeIndex + 3) % 6;
        // Only update if the adjacent edge is also a door
        if (adjacentTile.edges?.[oppositeEdgeIndex]?.type === 'door') {
          updatedBoard = updateTileEdge(updatedBoard, adjacentTile.id, oppositeEdgeIndex, edge => ({
            ...edge,
            doorState
          }));
        }
      }
    }
  }

  return updatedBoard;
}

/**
 * Converts a blocked edge to an open edge AND the corresponding edge on the adjacent tile
 * This ensures edges stay in sync on both sides, preventing player from getting stuck
 */
export function clearBlockedEdge(
  board: Tile[],
  tileId: string,
  edgeIndex: number
): Tile[] {
  // First update the edge on the source tile
  let updatedBoard = updateTileEdge(board, tileId, edgeIndex, () => ({
    type: 'open'
  }));

  // Now find and update the adjacent tile's corresponding edge
  const tile = board.find(t => t.id === tileId);
  if (tile) {
    const adjacentPos = getAdjacentPosition(tile, edgeIndex);
    if (adjacentPos) {
      const adjacentTile = updatedBoard.find(t => t.q === adjacentPos.q && t.r === adjacentPos.r);
      if (adjacentTile) {
        // The opposite edge index (0 <-> 3, 1 <-> 4, 2 <-> 5)
        const oppositeEdgeIndex = (edgeIndex + 3) % 6;
        const oppositeEdge = adjacentTile.edges?.[oppositeEdgeIndex];
        // Update the opposite edge if it's blocked, wall, or any non-passable type
        if (oppositeEdge && (oppositeEdge.type === 'blocked' || oppositeEdge.type === 'wall')) {
          updatedBoard = updateTileEdge(updatedBoard, adjacentTile.id, oppositeEdgeIndex, () => ({
            type: 'open'
          }));
        }
      }
    }
  }

  return updatedBoard;
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
  let spellParticle: SpellParticle | undefined;
  let bossToSpawn: { type: string; message: string } | undefined;

  // Check for quest items on this tile
  const questItem = ctx.objectiveSpawnState?.questItems.find(
    qi => qi.spawned && qi.spawnedOnTileId === tile.id && !qi.collected
  );

  if (questItem && ctx.activeScenario && ctx.objectiveSpawnState) {
    // Collect the quest item
    const result = collectQuestItem(ctx.objectiveSpawnState, questItem, ctx.activeScenario);
    updatedObjectiveSpawnState = result.updatedState;

    if (result.updatedObjective) {
      // First, update the objective that received progress
      let updatedObjectives = ctx.activeScenario.objectives.map(o =>
        o.id === result.updatedObjective!.id ? result.updatedObjective! : o
      );

      logMessages.push(`QUEST ITEM FOUND: ${questItem.name}`);
      logMessages.push(questItem.description);

      if (result.objectiveCompleted) {
        logMessages.push(`OBJECTIVE COMPLETE: ${result.updatedObjective.shortDescription}`);

        // CRITICAL: Reveal any hidden objectives that depend on this completed objective
        const completedObjectiveId = result.updatedObjective.id;
        updatedObjectives = updatedObjectives.map(obj => {
          if (obj.isHidden && obj.revealedBy === completedObjectiveId) {
            logMessages.push(`NEW OBJECTIVE REVEALED: ${obj.shortDescription}`);

            // Also reveal AND SPAWN the corresponding quest tile
            if (updatedObjectiveSpawnState) {
              const questTile = updatedObjectiveSpawnState.questTiles.find(
                qt => qt.objectiveId === obj.id && !qt.revealed
              );
              if (questTile) {
                // If this is a final_confrontation tile, spawn the boss!
                if (questTile.type === 'final_confrontation') {
                  updatedObjectiveSpawnState = {
                    ...updatedObjectiveSpawnState,
                    questTiles: updatedObjectiveSpawnState.questTiles.map(qt =>
                      qt.id === questTile.id ? { ...qt, revealed: true } : qt
                    )
                  };
                  const bossType = questTile.bossType || 'shoggoth';
                  bossToSpawn = {
                    type: bossType,
                    message: `THE FINAL CONFRONTATION: A ${bossType.toUpperCase()} emerges from the shadows!`
                  };
                  logMessages.push(`The truth reveals itself! A ${bossType} appears!`);
                } else {
                  // IMMEDIATE SPAWN: Spawn exit doors, altars, etc. immediately when revealed
                  // This is CRITICAL - without this, exit doors only spawn when exploring NEW tiles
                  // which may never happen after the key is found
                  const spawnResult = spawnRevealedQuestTileImmediately(
                    updatedObjectiveSpawnState,
                    questTile,
                    updatedBoard.filter(t => t.explored)
                  );

                  updatedObjectiveSpawnState = spawnResult.updatedState;

                  // Apply tile modifications to the board
                  if (spawnResult.targetTileId && spawnResult.tileModifications) {
                    updatedBoard = updatedBoard.map(t =>
                      t.id === spawnResult.targetTileId
                        ? { ...t, ...spawnResult.tileModifications }
                        : t
                    );
                    if (spawnResult.message) {
                      logMessages.push(spawnResult.message);
                    }
                  } else if (spawnResult.message) {
                    // No tile found, but we have a message (will spawn on next exploration)
                    logMessages.push(spawnResult.message);
                  }
                }
              }
            }

            return { ...obj, isHidden: false };
          }
          return obj;
        });
      } else {
        logMessages.push(`Progress: ${result.updatedObjective.shortDescription}`);
      }

      updatedScenario = {
        ...ctx.activeScenario,
        objectives: updatedObjectives
      };
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
            return { ...p, inventory: equipResult.newInventory };
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
        // Create item collection particle effect
        spellParticle = {
          id: `item_collect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'item_collect',
          startQ: tile.q,
          startR: tile.r,
          startTime: Date.now(),
          duration: 1000,
          color: 'amber',
          size: 'md',
          count: 8,
          animation: 'float'
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
    floatingText,
    spellParticle,
    spawnBoss: bossToSpawn
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
    scenarioId: questItem.scenarioId,
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
 *
 * CRITICAL: This completes ALL escape-related objectives to trigger victory:
 * 1. Any find_tile objective targeting exit_door (player found the exit)
 * 2. The escape objective itself (player escaped)
 *
 * Without this, victory won't trigger because find_tile objectives only
 * auto-complete when SPAWNING a new tile, not when an existing tile is
 * transformed into an exit door.
 */
export function handleEscapeEffect(
  ctx: ActionEffectContext,
  tile: Tile
): ActionEffectResult {
  if (!ctx.activeScenario) return {};

  const logMessages: string[] = [];
  let floatingText: ActionEffectResult['floatingText'] | undefined;

  // Start with current objectives
  let updatedObjectives = [...ctx.activeScenario.objectives];

  // 1. Complete any find_tile objectives targeting exit_door
  // This is needed because the player is ON the exit tile, so they've "found" it
  const findExitObjective = updatedObjectives.find(
    obj => obj.type === 'find_tile' &&
           (obj.targetId === 'exit_door' || obj.targetId?.toLowerCase().includes('exit')) &&
           !obj.completed
  );

  if (findExitObjective) {
    updatedObjectives = updatedObjectives.map(obj =>
      obj.id === findExitObjective.id
        ? { ...obj, completed: true, isHidden: false }
        : obj
    );
    logMessages.push(`OBJECTIVE COMPLETE: ${findExitObjective.shortDescription}`);
  }

  // 2. Reveal any hidden objectives that depend on findExitObjective
  if (findExitObjective) {
    updatedObjectives = updatedObjectives.map(obj => {
      if (obj.isHidden && obj.revealedBy === findExitObjective.id) {
        return { ...obj, isHidden: false };
      }
      return obj;
    });
  }

  // 3. Complete the escape objective
  const escapeObjective = updatedObjectives.find(
    obj => obj.type === 'escape' && !obj.completed
  );

  if (escapeObjective) {
    updatedObjectives = updatedObjectives.map(obj =>
      obj.id === escapeObjective.id
        ? { ...obj, completed: true, isHidden: false }
        : obj
    );
    logMessages.push(`OBJECTIVE COMPLETE: ${escapeObjective.shortDescription}`);
  }

  // Create updated scenario
  const updatedScenario = {
    ...ctx.activeScenario,
    objectives: updatedObjectives
  };

  logMessages.push('🎉 VICTORY! You have escaped the horrors within!');
  floatingText = { q: tile.q, r: tile.r, text: 'ESCAPED!', colorClass: 'text-green-400' };

  return {
    activeScenario: updatedScenario,
    logMessages,
    floatingText
  };
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
  let spellParticle: SpellParticle | undefined;
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
    scenarioId: questItemToPickup.scenarioId || spawnedQuestItem?.scenarioId,
    slotType: 'bag',
    category: 'special'
  };

  const activePlayer = ctx.players[ctx.activePlayerIndex];
  if (activePlayer) {
    const equipResult = equipItem(activePlayer.inventory, questItemForInventory);
    if (equipResult.success) {
      updatedPlayers = ctx.players.map((p, idx) => {
        if (idx === ctx.activePlayerIndex) {
          return { ...p, inventory: equipResult.newInventory };
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
      // Create item collection particle effect
      spellParticle = {
        id: `item_collect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'item_collect',
        startQ: tile.q,
        startR: tile.r,
        startTime: Date.now(),
        duration: 1000,
        color: 'amber',
        size: 'md',
        count: 8,
        animation: 'float'
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
    floatingText,
    spellParticle
  };
}

/**
 * Handles picking up loot items (non-quest items) from the ground
 */
export function handleLootPickupEffect(
  ctx: ActionEffectContext,
  lootIndex: number
): ActionEffectResult {
  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile) return {};

  // Get non-quest items (loot)
  const lootItems = (tile.items || []).filter(item => !item.isQuestItem);
  const lootItem = lootItems[lootIndex];

  if (!lootItem) return {};

  const logMessages: string[] = [];
  let floatingText: ActionEffectResult['floatingText'] | undefined;
  let spellParticle: SpellParticle | undefined;
  let updatedBoard = ctx.board;
  let updatedPlayers = ctx.players;

  const activePlayer = ctx.players[ctx.activePlayerIndex];
  if (!activePlayer) return {};

  // Try to add item to player's inventory
  const equipResult = equipItem(activePlayer.inventory, lootItem);

  if (equipResult.success) {
    // Update player inventory
    updatedPlayers = ctx.players.map((p, idx) => {
      if (idx === ctx.activePlayerIndex) {
        return { ...p, inventory: equipResult.newInventory };
      }
      return p;
    });

    logMessages.push(`${activePlayer.name} plukket opp ${lootItem.name}.`);
    floatingText = {
      q: activePlayer.position.q,
      r: activePlayer.position.r,
      text: lootItem.name.toUpperCase(),
      colorClass: 'text-amber-400'
    };

    // Create item collection particle effect
    spellParticle = {
      id: `loot_collect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'item_collect',
      startQ: tile.q,
      startR: tile.r,
      startTime: Date.now(),
      duration: 1000,
      color: 'amber',
      size: 'md',
      count: 8,
      animation: 'float'
    };

    // Remove item from tile
    updatedBoard = updateTile(updatedBoard, ctx.tileId, t => ({
      ...t,
      items: (t.items || []).filter(item =>
        item.id !== lootItem.id || item.name !== lootItem.name
      )
    }));
  } else {
    logMessages.push(`Inventory full! Could not pick up ${lootItem.name}.`);
    floatingText = {
      q: activePlayer.position.q,
      r: activePlayer.position.r,
      text: 'INVENTORY FULL',
      colorClass: 'text-red-400'
    };
  }

  return {
    board: updatedBoard,
    players: updatedPlayers,
    logMessages,
    floatingText,
    spellParticle
  };
}

// ============================================================================
// SURVIVOR EFFECT HANDLERS
// ============================================================================

/**
 * Survivor action IDs
 */
const SURVIVOR_ACTIONS = [
  'find_survivor',
  'recruit_survivor',
  'use_survivor_ability',
  'dismiss_survivor',
  'rescue_survivor'
];

/**
 * Handles finding a hidden survivor
 */
export function handleFindSurvivorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (!ctx.survivors || !ctx.targetSurvivorId) return {};

  const survivor = ctx.survivors.find(s => s.id === ctx.targetSurvivorId);
  if (!survivor || survivor.state !== 'hidden') return {};

  const updatedSurvivors = ctx.survivors.map(s =>
    s.id === ctx.targetSurvivorId
      ? { ...s, state: 'found' as const }
      : s
  );

  return {
    survivors: updatedSurvivors,
    logMessages: [
      `Du finner ${survivor.name} som gjemmer seg!`,
      `"${survivor.foundDialogue}"`
    ],
    floatingText: {
      q: survivor.position.q,
      r: survivor.position.r,
      text: `Funnet: ${survivor.name}`,
      colorClass: 'text-green-400'
    }
  };
}

/**
 * Handles recruiting a survivor to follow the player
 */
export function handleRecruitSurvivorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (!ctx.survivors || !ctx.targetSurvivorId) return {};

  const survivor = ctx.survivors.find(s => s.id === ctx.targetSurvivorId);
  if (!survivor || survivor.state !== 'found') return {};

  const activePlayer = ctx.players[ctx.activePlayerIndex];
  if (!activePlayer) return {};

  const updatedSurvivor = startFollowing(survivor, activePlayer);

  const updatedSurvivors = ctx.survivors.map(s =>
    s.id === ctx.targetSurvivorId ? updatedSurvivor : s
  );

  return {
    survivors: updatedSurvivors,
    logMessages: [
      `${survivor.name} følger nå ${activePlayer.name}!`,
      `"${survivor.followDialogue}"`
    ],
    floatingText: {
      q: survivor.position.q,
      r: survivor.position.r,
      text: 'Rekruttert!',
      colorClass: 'text-blue-400'
    }
  };
}

/**
 * Handles using a survivor's special ability
 */
export function handleUseSurvivorAbilityEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (!ctx.survivors || !ctx.targetSurvivorId) return {};

  const survivor = ctx.survivors.find(s => s.id === ctx.targetSurvivorId);
  if (!survivor || survivor.state !== 'following') return {};

  const tile = ctx.board.find(t => t.id === ctx.tileId);
  if (!tile) return {};

  const abilityResult = useSurvivorAbility(survivor, ctx.players, ctx.board);
  if (!abilityResult) {
    return {
      logMessages: [`${survivor.name} har ingen tilgjengelig evne.`]
    };
  }

  const updatedSurvivors = ctx.survivors.map(s =>
    s.id === ctx.targetSurvivorId ? abilityResult.survivor : s
  );

  // Apply ability effects to players
  let updatedPlayers = ctx.players;
  if (abilityResult.effects.healed) {
    updatedPlayers = ctx.players.map(p => {
      const heal = abilityResult.effects.healed?.find(h => h.playerId === p.id);
      if (heal) {
        return { ...p, hp: Math.min(p.maxHp, p.hp + heal.amount) };
      }
      return p;
    });
  }
  if (abilityResult.effects.calmAura) {
    updatedPlayers = updatedPlayers.map(p => ({
      ...p,
      sanity: Math.min(p.maxSanity, p.sanity + (abilityResult.effects.calmAura?.sanityBonus || 0))
    }));
  }

  return {
    survivors: updatedSurvivors,
    players: updatedPlayers,
    logMessages: [abilityResult.message],
    floatingText: {
      q: survivor.position.q,
      r: survivor.position.r,
      text: 'Evne brukt!',
      colorClass: 'text-purple-400'
    }
  };
}

/**
 * Handles dismissing a following survivor
 */
export function handleDismissSurvivorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (!ctx.survivors || !ctx.targetSurvivorId) return {};

  const survivor = ctx.survivors.find(s => s.id === ctx.targetSurvivorId);
  if (!survivor || survivor.state !== 'following') return {};

  const updatedSurvivors = ctx.survivors.map(s =>
    s.id === ctx.targetSurvivorId
      ? { ...s, state: 'found' as const, followingPlayerId: undefined }
      : s
  );

  return {
    survivors: updatedSurvivors,
    logMessages: [`${survivor.name} forsvinner inn i skyggene.`]
  };
}

/**
 * Handles rescuing a survivor at exit
 */
export function handleRescueSurvivorEffect(
  ctx: ActionEffectContext
): ActionEffectResult {
  if (!ctx.survivors || !ctx.targetSurvivorId) return {};

  const survivor = ctx.survivors.find(s => s.id === ctx.targetSurvivorId);
  if (!survivor || survivor.state !== 'following') return {};

  const scenarioDoomBonus = ctx.activeScenario?.doomOnSurvivorRescue ?? 1;
  const rescueResult = rescueSurvivor(survivor, scenarioDoomBonus);

  const updatedSurvivors = ctx.survivors.map(s =>
    s.id === ctx.targetSurvivorId ? rescueResult.survivor : s
  );

  // Check if this completes an escort objective
  let updatedScenario = ctx.activeScenario;
  if (ctx.activeScenario) {
    const escortObjective = ctx.activeScenario.objectives.find(
      obj => obj.type === 'escort' && !obj.completed
    );
    if (escortObjective) {
      const newAmount = (escortObjective.currentAmount || 0) + 1;
      const targetAmount = escortObjective.targetAmount || 1;
      const isComplete = newAmount >= targetAmount;

      updatedScenario = {
        ...ctx.activeScenario,
        objectives: ctx.activeScenario.objectives.map(obj =>
          obj.id === escortObjective.id
            ? { ...obj, currentAmount: newAmount, completed: isComplete }
            : obj
        )
      };
    }
  }

  const logMessages = [
    rescueResult.message,
    `"${survivor.rescuedDialogue}"`
  ];

  if (rescueResult.rewards.insight > 0) {
    logMessages.push(`+${rescueResult.rewards.insight} Insight`);
  }
  if (rescueResult.rewards.sanity !== 0) {
    const sign = rescueResult.rewards.sanity > 0 ? '+' : '';
    logMessages.push(`${sign}${rescueResult.rewards.sanity} Sanity`);
  }
  if (rescueResult.rewards.gold > 0) {
    logMessages.push(`+${rescueResult.rewards.gold} Gold`);
  }
  if (rescueResult.rewards.doomBonus > 0) {
    logMessages.push(`+${rescueResult.rewards.doomBonus} Doom (håp gjenopprettet!)`);
  }

  return {
    survivors: updatedSurvivors,
    activeScenario: updatedScenario,
    survivorRewards: rescueResult.rewards,
    logMessages,
    floatingText: {
      q: survivor.position.q,
      r: survivor.position.r,
      text: 'REDDET!',
      colorClass: 'text-green-500'
    }
  };
}

/**
 * Dispatches survivor action effects based on action ID
 */
export function handleSurvivorActionEffect(
  ctx: ActionEffectContext,
  actionId: string
): ActionEffectResult {
  switch (actionId) {
    case 'find_survivor':
      return handleFindSurvivorEffect(ctx);
    case 'recruit_survivor':
      return handleRecruitSurvivorEffect(ctx);
    case 'use_survivor_ability':
      return handleUseSurvivorAbilityEffect(ctx);
    case 'dismiss_survivor':
      return handleDismissSurvivorEffect(ctx);
    case 'rescue_survivor':
      return handleRescueSurvivorEffect(ctx);
    default:
      return {};
  }
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

  // Handle loot pickup (non-quest items dropped on ground)
  if (actionId.startsWith('pickup_loot_')) {
    const lootIndex = parseInt(actionId.replace('pickup_loot_', ''), 10);
    return handleLootPickupEffect(ctx, lootIndex);
  }

  // Pass through actions (climbing windows, wading through water, stairs, etc.)
  // These move the player to the adjacent tile after the action succeeds
  const PASS_THROUGH_ACTIONS = [
    'climb_through_window',
    'wade_through',
    'wade_through_edge',
    'swim_across',
    'jump_through_edge_fire',
    'jump_fire',
    'force_through_edge_spirits',
    'force_through',
    'cross_ward',
    'cross_edge_ward',
    'use_rope_chasm',
    'pass_through_fog',
    'use_stairs_up',
    'use_stairs_down'
  ];

  if (PASS_THROUGH_ACTIONS.includes(actionId)) {
    return {
      movePlayerThroughEdge: true,
      logMessages: []
    };
  }

  // Survivor actions
  if (SURVIVOR_ACTIONS.includes(actionId)) {
    return handleSurvivorActionEffect(ctx, actionId);
  }

  // Unknown action - no effect
  return {};
}
