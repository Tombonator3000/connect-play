/**
 * OBJECTIVE SPAWNING SYSTEM
 *
 * This system ensures that scenario objectives actually spawn in the game world.
 * It places quest items on tiles, spawns NPCs, and creates exit tiles when appropriate.
 *
 * Without this system, objectives like "Find the Iron Key" are unwinnable because
 * the key never actually appears anywhere in the game.
 */

import { Scenario, ScenarioObjective, Tile, Item } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface QuestItem {
  id: string;
  objectiveId: string;
  type: 'key' | 'clue' | 'collectible' | 'artifact' | 'component';
  name: string;
  description: string;
  spawned: boolean;
  spawnedOnTileId?: string;
  collected: boolean;
}

export interface QuestTile {
  id: string;
  objectiveId: string;
  type: 'exit' | 'altar' | 'ritual_point' | 'npc_location' | 'boss_room';
  name: string;
  spawned: boolean;
  revealed: boolean;
  revealCondition?: 'objective_complete' | 'item_found' | 'doom_threshold';
  revealObjectiveId?: string;
}

export interface ObjectiveSpawnState {
  questItems: QuestItem[];
  questTiles: QuestTile[];
  tilesExplored: number;
  itemsCollected: number;
}

// ============================================================================
// QUEST ITEM DEFINITIONS
// ============================================================================

export const QUEST_ITEM_NAMES: Record<string, { name: string; description: string }> = {
  // Keys
  iron_key: { name: 'Iron Key', description: 'A heavy iron key, cold to the touch. It seems to absorb light.' },
  silver_key: { name: 'Silver Key', description: 'An ornate silver key with strange symbols etched into the bow.' },
  cursed_key: { name: 'Cursed Key', description: 'This key feels wrong. Holding it makes your hands tremble.' },
  skeleton_key: { name: 'Skeleton Key', description: 'A master key made from what appears to be actual bone.' },
  quest_key: { name: 'Sealed Key', description: 'The key that will unlock the way out. It pulses with faint energy.' },

  // Clues and Intel
  intel_clue: { name: 'Cultist Note', description: 'A scrap of paper with cryptic writings about the cult\'s activities.' },
  evidence_clue: { name: 'Evidence', description: 'Damning evidence of what has been happening here.' },
  investigation_clue: { name: 'Investigation Clue', description: 'A piece of the puzzle falls into place.' },
  artifact_clue: { name: 'Ancient Inscription', description: 'Weathered text that hints at the location of something powerful.' },

  // Collectibles
  necro_page: { name: 'Necronomicon Page', description: 'A page torn from the dread book. The text writhes before your eyes.' },
  artifact_fragment: { name: 'Artifact Fragment', description: 'Part of something greater. It hums with residual power.' },
  seal_piece: { name: 'Seal Fragment', description: 'A piece of an ancient seal. Perhaps it can be reassembled.' },
  ritual_component: { name: 'Ritual Component', description: 'An ingredient for dark rituals. Handle with care.' },
  journal_page: { name: 'Journal Page', description: 'A page from someone\'s private journal. The handwriting grows more frantic.' },

  // Special Items
  elder_sign: { name: 'Elder Sign', description: 'An ancient symbol of protection against the outer dark.' },
  barricade_supply: { name: 'Barricade Supplies', description: 'Boards, nails, and tools. Useful for fortification.' },
  occult_item: { name: 'Occult Artifact', description: 'An item of dark power. Its purpose is unclear.' },
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the objective spawn state based on scenario objectives.
 * This should be called when a scenario starts.
 */
export function initializeObjectiveSpawns(scenario: Scenario): ObjectiveSpawnState {
  const questItems: QuestItem[] = [];
  const questTiles: QuestTile[] = [];

  for (const objective of scenario.objectives) {
    if (objective.isOptional && Math.random() > 0.7) {
      // 30% chance to skip optional objectives to reduce clutter
      continue;
    }

    switch (objective.type) {
      case 'find_item':
        // Single item to find (like a key)
        questItems.push(createQuestItem(objective, 'key'));
        break;

      case 'collect':
        // Multiple items to collect
        const amount = objective.targetAmount || 1;
        for (let i = 0; i < amount; i++) {
          questItems.push(createQuestItem(objective, 'collectible', i));
        }
        break;

      case 'find_tile':
        // Special tile to discover
        questTiles.push(createQuestTile(objective));
        break;

      case 'escape':
        // Exit tile - revealed after certain conditions
        questTiles.push({
          id: `quest_tile_${objective.id}`,
          objectiveId: objective.id,
          type: 'exit',
          name: 'Escape Exit',
          spawned: false,
          revealed: !objective.isHidden,
          revealCondition: objective.revealedBy ? 'objective_complete' : undefined,
          revealObjectiveId: objective.revealedBy,
        });
        break;

      case 'ritual':
      case 'interact':
        // Altar or interaction point
        if (objective.targetId?.includes('ritual') || objective.targetId?.includes('altar')) {
          questTiles.push({
            id: `quest_tile_${objective.id}`,
            objectiveId: objective.id,
            type: 'altar',
            name: 'Ritual Altar',
            spawned: false,
            revealed: !objective.isHidden,
            revealCondition: objective.revealedBy ? 'objective_complete' : undefined,
            revealObjectiveId: objective.revealedBy,
          });
        }
        break;
    }
  }

  return {
    questItems,
    questTiles,
    tilesExplored: 0,
    itemsCollected: 0,
  };
}

function createQuestItem(
  objective: ScenarioObjective,
  type: QuestItem['type'],
  index: number = 0
): QuestItem {
  const targetId = objective.targetId || 'quest_item';
  const itemDef = QUEST_ITEM_NAMES[targetId] || {
    name: 'Mysterious Item',
    description: 'An item of unknown purpose.'
  };

  return {
    id: `quest_item_${objective.id}_${index}`,
    objectiveId: objective.id,
    type,
    name: itemDef.name,
    description: itemDef.description,
    spawned: false,
    collected: false,
  };
}

function createQuestTile(objective: ScenarioObjective): QuestTile {
  const targetId = objective.targetId || '';
  let type: QuestTile['type'] = 'npc_location';
  let name = 'Special Location';

  if (targetId.includes('exit')) {
    type = 'exit';
    name = 'Exit';
  } else if (targetId.includes('altar') || targetId.includes('ritual')) {
    type = 'altar';
    name = 'Ritual Altar';
  } else if (targetId.includes('point')) {
    type = 'ritual_point';
    name = 'Ritual Point';
  } else if (targetId.includes('boss') || targetId.includes('sanctum')) {
    type = 'boss_room';
    name = 'Dark Sanctum';
  }

  return {
    id: `quest_tile_${objective.id}`,
    objectiveId: objective.id,
    type,
    name,
    spawned: false,
    revealed: !objective.isHidden,
    revealCondition: objective.revealedBy ? 'objective_complete' : undefined,
    revealObjectiveId: objective.revealedBy,
  };
}

// ============================================================================
// SPAWNING LOGIC
// ============================================================================

/**
 * Determines if a quest item should spawn on the given tile.
 * Items spawn progressively as players explore more tiles.
 */
export function shouldSpawnQuestItem(
  state: ObjectiveSpawnState,
  tile: Tile,
  totalTilesExplored: number,
  scenario: Scenario
): QuestItem | null {
  // Don't spawn on non-searchable tiles
  if (!tile.searchable) return null;

  // Don't spawn on corridors or streets
  if (tile.category === 'corridor' || tile.category === 'street') return null;

  // Find unspawned items
  const unspawnedItems = state.questItems.filter(item => !item.spawned);
  if (unspawnedItems.length === 0) return null;

  // Calculate spawn probability based on exploration progress
  // More tiles explored = higher chance items spawn
  const totalItemsNeeded = state.questItems.length;
  const estimatedTilesToExplore = scenario.startDoom * 1.5; // Rough estimate
  const explorationProgress = totalTilesExplored / estimatedTilesToExplore;

  // Items should start spawning after ~20% exploration
  // and all should be available by ~80% exploration
  const minProgress = 0.2;
  const maxProgress = 0.8;

  if (explorationProgress < minProgress) {
    // Too early - only 10% chance
    if (Math.random() > 0.1) return null;
  }

  // Calculate how many items should have spawned by now
  const progressInRange = Math.min(1, (explorationProgress - minProgress) / (maxProgress - minProgress));
  const targetSpawnedItems = Math.ceil(progressInRange * totalItemsNeeded);
  const currentSpawnedItems = state.questItems.filter(i => i.spawned).length;

  // If we're behind schedule, higher spawn chance
  const behindSchedule = currentSpawnedItems < targetSpawnedItems;
  const baseSpawnChance = behindSchedule ? 0.5 : 0.25;

  // Room type bonuses - some rooms are more likely to have items
  let roomBonus = 0;
  const roomName = tile.name.toLowerCase();
  if (roomName.includes('study') || roomName.includes('library') || roomName.includes('office')) {
    roomBonus = 0.2; // Books and papers here
  } else if (roomName.includes('cellar') || roomName.includes('basement') || roomName.includes('vault')) {
    roomBonus = 0.15; // Hidden things
  } else if (roomName.includes('ritual') || roomName.includes('altar') || roomName.includes('sanctum')) {
    roomBonus = 0.25; // Occult items
  } else if (roomName.includes('storage') || roomName.includes('cache') || roomName.includes('closet')) {
    roomBonus = 0.1; // Supplies
  }

  const finalChance = Math.min(0.8, baseSpawnChance + roomBonus);

  if (Math.random() < finalChance) {
    // Select which item to spawn
    // Prioritize non-optional items
    const requiredItems = unspawnedItems.filter(item => {
      const obj = scenario.objectives.find(o => o.id === item.objectiveId);
      return obj && !obj.isOptional;
    });

    const itemPool = requiredItems.length > 0 ? requiredItems : unspawnedItems;
    return itemPool[Math.floor(Math.random() * itemPool.length)];
  }

  return null;
}

/**
 * Determines if a quest tile (like exit or altar) should be revealed.
 */
export function shouldRevealQuestTile(
  questTile: QuestTile,
  completedObjectiveIds: string[]
): boolean {
  if (questTile.revealed) return true;

  if (questTile.revealCondition === 'objective_complete' && questTile.revealObjectiveId) {
    return completedObjectiveIds.includes(questTile.revealObjectiveId);
  }

  return false;
}

/**
 * Checks if the current tile should become a quest tile (exit, altar, etc).
 */
export function shouldSpawnQuestTile(
  state: ObjectiveSpawnState,
  tile: Tile,
  totalTilesExplored: number,
  completedObjectiveIds: string[]
): QuestTile | null {
  const unspawnedTiles = state.questTiles.filter(qt => !qt.spawned);
  if (unspawnedTiles.length === 0) return null;

  for (const questTile of unspawnedTiles) {
    // Check if this quest tile should be revealed first
    if (!shouldRevealQuestTile(questTile, completedObjectiveIds)) {
      continue;
    }

    // Check tile compatibility
    if (questTile.type === 'exit') {
      // Exit should spawn in foyer or facade area
      if (tile.category === 'foyer' || tile.category === 'facade') {
        if (Math.random() < 0.4 + (totalTilesExplored * 0.05)) {
          return questTile;
        }
      }
    } else if (questTile.type === 'altar' || questTile.type === 'ritual_point') {
      // Altars spawn in crypts, basements, or rooms
      if (tile.category === 'crypt' || tile.category === 'basement' || tile.category === 'room') {
        const roomName = tile.name.toLowerCase();
        if (roomName.includes('ritual') || roomName.includes('altar') || roomName.includes('chamber')) {
          return questTile; // Perfect match
        }
        if (Math.random() < 0.2) {
          return questTile;
        }
      }
    } else if (questTile.type === 'boss_room') {
      // Boss rooms spawn deep
      if (tile.category === 'crypt' || tile.zoneLevel <= -1) {
        if (Math.random() < 0.3) {
          return questTile;
        }
      }
    }
  }

  return null;
}

// ============================================================================
// ITEM COLLECTION
// ============================================================================

/**
 * Called when a player searches a tile and finds a quest item.
 * Returns updated objective progress.
 */
export function collectQuestItem(
  state: ObjectiveSpawnState,
  item: QuestItem,
  scenario: Scenario
): {
  updatedState: ObjectiveSpawnState;
  updatedObjective: ScenarioObjective | null;
  objectiveCompleted: boolean;
} {
  // Mark item as collected
  const updatedItems = state.questItems.map(qi =>
    qi.id === item.id ? { ...qi, collected: true } : qi
  );

  // Find the objective
  const objective = scenario.objectives.find(o => o.id === item.objectiveId);
  if (!objective) {
    return {
      updatedState: { ...state, questItems: updatedItems, itemsCollected: state.itemsCollected + 1 },
      updatedObjective: null,
      objectiveCompleted: false,
    };
  }

  // Update objective progress
  const newAmount = (objective.currentAmount || 0) + 1;
  const targetAmount = objective.targetAmount || 1;
  const completed = newAmount >= targetAmount;

  const updatedObjective: ScenarioObjective = {
    ...objective,
    currentAmount: newAmount,
    completed,
    shortDescription: objective.shortDescription.replace(
      /\(\d+\/\d+\)/,
      `(${newAmount}/${targetAmount})`
    ),
  };

  return {
    updatedState: { ...state, questItems: updatedItems, itemsCollected: state.itemsCollected + 1 },
    updatedObjective,
    objectiveCompleted: completed,
  };
}

// ============================================================================
// TILE DISCOVERY
// ============================================================================

/**
 * Called when a player explores a new tile.
 * Handles quest tile discovery and item spawning.
 */
export function onTileExplored(
  state: ObjectiveSpawnState,
  tile: Tile,
  scenario: Scenario,
  completedObjectiveIds: string[]
): {
  updatedState: ObjectiveSpawnState;
  spawnedItem: QuestItem | null;
  spawnedQuestTile: QuestTile | null;
  tileModifications?: Partial<Tile>;
} {
  const newTilesExplored = state.tilesExplored + 1;
  let updatedState = { ...state, tilesExplored: newTilesExplored };

  // Check for quest item spawn
  const spawnedItem = shouldSpawnQuestItem(updatedState, tile, newTilesExplored, scenario);
  if (spawnedItem) {
    updatedState = {
      ...updatedState,
      questItems: updatedState.questItems.map(qi =>
        qi.id === spawnedItem.id ? { ...qi, spawned: true, spawnedOnTileId: tile.id } : qi
      ),
    };
  }

  // Check for quest tile spawn
  const spawnedQuestTile = shouldSpawnQuestTile(updatedState, tile, newTilesExplored, completedObjectiveIds);
  if (spawnedQuestTile) {
    updatedState = {
      ...updatedState,
      questTiles: updatedState.questTiles.map(qt =>
        qt.id === spawnedQuestTile.id ? { ...qt, spawned: true } : qt
      ),
    };
  }

  // Tile modifications for quest tiles
  let tileModifications: Partial<Tile> | undefined;
  if (spawnedQuestTile) {
    if (spawnedQuestTile.type === 'exit') {
      tileModifications = {
        name: 'Exit Door',
        description: 'The way out! But can you make it in time?',
        isGate: true,
      };
    } else if (spawnedQuestTile.type === 'altar') {
      tileModifications = {
        name: 'Ritual Altar',
        description: 'An ancient altar for dark rituals. You can perform the ritual here.',
        floorType: 'ritual',
      };
    }
  }

  return {
    updatedState,
    spawnedItem,
    spawnedQuestTile,
    tileModifications,
  };
}

// ============================================================================
// VICTORY CHECK HELPERS
// ============================================================================

/**
 * Checks if escape victory conditions are met.
 */
export function canEscape(
  state: ObjectiveSpawnState,
  playerPosition: { q: number; r: number },
  tiles: Tile[]
): boolean {
  // Find exit tile
  const exitQuestTile = state.questTiles.find(qt => qt.type === 'exit' && qt.spawned);
  if (!exitQuestTile) return false;

  // Find the actual tile
  const exitTile = tiles.find(t => t.isGate && t.name === 'Exit Door');
  if (!exitTile) return false;

  // Player must be on exit tile
  return playerPosition.q === exitTile.q && playerPosition.r === exitTile.r;
}

/**
 * Gets the current progress summary for all objectives.
 */
export function getObjectiveProgress(
  state: ObjectiveSpawnState,
  scenario: Scenario
): { id: string; progress: string; completed: boolean }[] {
  return scenario.objectives.map(obj => {
    const relatedItems = state.questItems.filter(qi => qi.objectiveId === obj.id);
    const collected = relatedItems.filter(qi => qi.collected).length;
    const total = relatedItems.length || obj.targetAmount || 1;

    return {
      id: obj.id,
      progress: `${collected}/${total}`,
      completed: obj.completed || collected >= total,
    };
  });
}
