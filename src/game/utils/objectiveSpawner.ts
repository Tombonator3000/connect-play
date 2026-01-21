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
// DATA-DRIVEN LOOKUP TABLES
// ============================================================================

/**
 * Room spawn bonus configuration.
 * Maps room name patterns to spawn probability bonuses.
 */
interface RoomSpawnBonus {
  patterns: string[];
  bonus: number;
}

export const ROOM_SPAWN_BONUSES: RoomSpawnBonus[] = [
  { patterns: ['ritual', 'altar', 'sanctum'], bonus: 0.25 },      // Occult items
  { patterns: ['study', 'library', 'office'], bonus: 0.2 },       // Books and papers
  { patterns: ['cellar', 'basement', 'vault'], bonus: 0.15 },     // Hidden things
  { patterns: ['storage', 'cache', 'closet'], bonus: 0.1 },       // Supplies
];

/**
 * Quest tile type lookup configuration.
 * Maps targetId patterns to tile type and name.
 */
interface QuestTileTypeLookup {
  patterns: string[];
  type: 'exit' | 'altar' | 'ritual_point' | 'boss_room' | 'npc_location';
  name: string;
}

export const QUEST_TILE_TYPE_LOOKUP: QuestTileTypeLookup[] = [
  { patterns: ['exit'], type: 'exit', name: 'Exit' },
  { patterns: ['altar', 'ritual'], type: 'altar', name: 'Ritual Altar' },
  { patterns: ['point'], type: 'ritual_point', name: 'Ritual Point' },
  { patterns: ['boss', 'sanctum'], type: 'boss_room', name: 'Dark Sanctum' },
];

/**
 * Item room scoring configuration.
 * Maps item types to room patterns and their scores.
 */
interface ItemRoomScoreEntry {
  patterns: string[];
  score: number;
}

interface ItemRoomScores {
  [itemType: string]: ItemRoomScoreEntry[];
}

export const ITEM_ROOM_SCORES: ItemRoomScores = {
  key: [
    { patterns: ['study', 'office'], score: 3 },
    { patterns: ['bedroom', 'guard'], score: 2 },
  ],
  clue: [
    { patterns: ['library', 'study'], score: 3 },
    { patterns: ['office', 'archive'], score: 2 },
  ],
  collectible: [
    { patterns: ['ritual', 'altar'], score: 3 },
    { patterns: ['vault', 'crypt'], score: 2 },
  ],
  artifact: [
    { patterns: ['ritual', 'altar'], score: 3 },
    { patterns: ['vault', 'crypt'], score: 2 },
  ],
};

/**
 * Quest tile location scoring configuration.
 * Maps quest tile types to scoring rules.
 */
interface TileScoreRule {
  category?: string;
  patterns?: string[];
  zoneLevel?: number | { min?: number; max?: number };
  score: number;
}

interface QuestTileLocationScores {
  [tileType: string]: TileScoreRule[];
}

export const QUEST_TILE_LOCATION_SCORES: QuestTileLocationScores = {
  exit: [
    { category: 'foyer', score: 5 },
    { category: 'facade', score: 4 },
    { patterns: ['entrance', 'door'], score: 3 },
    { zoneLevel: { min: 0, max: 1 }, score: 2 },
  ],
  altar: [
    { category: 'crypt', score: 5 },
    { patterns: ['ritual', 'altar'], score: 5 },
    { category: 'basement', score: 3 },
    { patterns: ['chamber', 'sanctum'], score: 3 },
    { zoneLevel: { max: -1 }, score: 2 },
  ],
  ritual_point: [
    { category: 'crypt', score: 5 },
    { patterns: ['ritual', 'altar'], score: 5 },
    { category: 'basement', score: 3 },
    { patterns: ['chamber', 'sanctum'], score: 3 },
    { zoneLevel: { max: -1 }, score: 2 },
  ],
  boss_room: [
    { category: 'crypt', score: 5 },
    { zoneLevel: { max: -1 }, score: 4 },
    { patterns: ['sanctum', 'throne'], score: 3 },
  ],
  npc_location: [
    { category: 'room', score: 3 },
    { patterns: ['cell', 'prison'], score: 2 },
  ],
};

// ============================================================================
// LOOKUP HELPER FUNCTIONS
// ============================================================================

/**
 * Finds the room spawn bonus for a given room name.
 */
export function getRoomSpawnBonus(roomName: string): number {
  const lowerName = roomName.toLowerCase();
  for (const entry of ROOM_SPAWN_BONUSES) {
    if (entry.patterns.some(pattern => lowerName.includes(pattern))) {
      return entry.bonus;
    }
  }
  return 0;
}

/**
 * Determines quest tile type and name from a target ID.
 */
export function getQuestTileTypeFromTargetId(targetId: string): { type: QuestTile['type']; name: string } {
  for (const entry of QUEST_TILE_TYPE_LOOKUP) {
    if (entry.patterns.some(pattern => targetId.includes(pattern))) {
      return { type: entry.type, name: entry.name };
    }
  }
  return { type: 'npc_location', name: 'Special Location' };
}

/**
 * Calculates the room score for a quest item based on item type and room name.
 */
export function getItemRoomScore(itemType: string, roomName: string): number {
  const lowerName = roomName.toLowerCase();
  const scoreEntries = ITEM_ROOM_SCORES[itemType];
  if (!scoreEntries) return 0;

  let totalScore = 0;
  for (const entry of scoreEntries) {
    if (entry.patterns.some(pattern => lowerName.includes(pattern))) {
      totalScore += entry.score;
    }
  }
  return totalScore;
}

/**
 * Calculates the location score for a quest tile based on tile properties.
 */
export function getQuestTileLocationScore(
  questTileType: string,
  tile: { category?: string; name: string; zoneLevel?: number }
): number {
  const rules = QUEST_TILE_LOCATION_SCORES[questTileType];
  if (!rules) return 0;

  const lowerName = tile.name.toLowerCase();
  let totalScore = 0;

  for (const rule of rules) {
    // Check category match
    if (rule.category && tile.category === rule.category) {
      totalScore += rule.score;
      continue;
    }

    // Check pattern match
    if (rule.patterns && rule.patterns.some(pattern => lowerName.includes(pattern))) {
      totalScore += rule.score;
      continue;
    }

    // Check zone level match
    if (rule.zoneLevel !== undefined && tile.zoneLevel !== undefined) {
      const zoneMatch = typeof rule.zoneLevel === 'number'
        ? tile.zoneLevel === rule.zoneLevel
        : (rule.zoneLevel.min === undefined || tile.zoneLevel >= rule.zoneLevel.min) &&
          (rule.zoneLevel.max === undefined || tile.zoneLevel <= rule.zoneLevel.max);
      if (zoneMatch) {
        totalScore += rule.score;
      }
    }
  }

  return totalScore;
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
  const { type, name } = getQuestTileTypeFromTargetId(targetId);

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
  const roomBonus = getRoomSpawnBonus(tile.name);

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
        // CRITICAL: Set exit_door object type so player can use Escape action
        object: { type: 'exit_door', searched: false },
      };
    } else if (spawnedQuestTile.type === 'altar') {
      tileModifications = {
        name: 'Ritual Altar',
        description: 'An ancient altar for dark rituals. You can perform the ritual here.',
        floorType: 'ritual',
        // CRITICAL: Set altar object type so player can use Perform Ritual action
        object: { type: 'altar', searched: false },
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

// ============================================================================
// GUARANTEED SPAWN SYSTEM
// ============================================================================

/**
 * Configuration for guaranteed spawn thresholds.
 * These determine when the game forces items/tiles to spawn.
 */
export const GUARANTEED_SPAWN_CONFIG = {
  // Doom thresholds for guaranteed spawns
  DOOM_CRITICAL: 4,        // Force spawn all remaining items when doom is this low
  DOOM_WARNING: 7,         // Increase spawn chance significantly

  // Exploration thresholds
  EXPLORATION_FORCE: 0.85, // Force spawn after exploring 85% of estimated tiles

  // Per-round guarantees
  MIN_ITEMS_PER_10_TILES: 1, // At least 1 item should spawn per 10 explored tiles
};

/**
 * Result of a guaranteed spawn check.
 */
export interface GuaranteedSpawnResult {
  forcedItems: QuestItem[];      // Items that MUST spawn immediately
  forcedTiles: QuestTile[];      // Quest tiles that MUST be activated
  warnings: string[];            // Warnings about spawn status
  urgency: 'none' | 'warning' | 'critical';
}

/**
 * Checks if any quest items or tiles need to be force-spawned.
 * This prevents scenarios from becoming unwinnable due to bad RNG.
 *
 * Should be called:
 * - At the start of each round (Mythos phase)
 * - When doom changes
 * - When a tile is explored (in addition to normal spawn logic)
 */
export function checkGuaranteedSpawns(
  state: ObjectiveSpawnState,
  scenario: Scenario,
  currentDoom: number,
  availableTiles: Tile[],
  completedObjectiveIds: string[]
): GuaranteedSpawnResult {
  const result: GuaranteedSpawnResult = {
    forcedItems: [],
    forcedTiles: [],
    warnings: [],
    urgency: 'none',
  };

  // Get unspawned required items (non-optional objectives)
  const unspawnedRequiredItems = state.questItems.filter(item => {
    if (item.spawned) return false;
    const obj = scenario.objectives.find(o => o.id === item.objectiveId);
    return obj && !obj.isOptional;
  });

  // Get unspawned required tiles
  const unspawnedRequiredTiles = state.questTiles.filter(tile => {
    if (tile.spawned) return false;
    // Check if tile should be revealed now
    if (!shouldRevealQuestTile(tile, completedObjectiveIds)) return false;
    const obj = scenario.objectives.find(o => o.id === tile.objectiveId);
    return obj && !obj.isOptional;
  });

  // Calculate urgency based on doom
  const doomUrgency = currentDoom <= GUARANTEED_SPAWN_CONFIG.DOOM_CRITICAL ? 'critical'
    : currentDoom <= GUARANTEED_SPAWN_CONFIG.DOOM_WARNING ? 'warning'
    : 'none';

  // Calculate urgency based on exploration
  const estimatedTotalTiles = scenario.startDoom * 1.5;
  const explorationProgress = state.tilesExplored / estimatedTotalTiles;
  const explorationUrgency = explorationProgress >= GUARANTEED_SPAWN_CONFIG.EXPLORATION_FORCE ? 'critical'
    : explorationProgress >= 0.7 ? 'warning'
    : 'none';

  // Combined urgency (take the worst)
  result.urgency = doomUrgency === 'critical' || explorationUrgency === 'critical' ? 'critical'
    : doomUrgency === 'warning' || explorationUrgency === 'warning' ? 'warning'
    : 'none';

  // Check spawn rate - items should spawn at a reasonable pace
  const expectedItemsSpawned = Math.floor(state.tilesExplored / 10) * GUARANTEED_SPAWN_CONFIG.MIN_ITEMS_PER_10_TILES;
  const actualItemsSpawned = state.questItems.filter(i => i.spawned).length;
  const behindOnSpawns = actualItemsSpawned < expectedItemsSpawned;

  // CRITICAL: Force spawn everything
  if (result.urgency === 'critical') {
    result.forcedItems = [...unspawnedRequiredItems];
    result.forcedTiles = [...unspawnedRequiredTiles];

    if (unspawnedRequiredItems.length > 0) {
      result.warnings.push(`CRITICAL: ${unspawnedRequiredItems.length} required items have not spawned yet!`);
    }
    if (unspawnedRequiredTiles.length > 0) {
      result.warnings.push(`CRITICAL: ${unspawnedRequiredTiles.length} required locations have not appeared!`);
    }
  }
  // WARNING: Force spawn if behind schedule
  else if (result.urgency === 'warning' || behindOnSpawns) {
    // Force spawn at least half of remaining items
    const itemsToForce = Math.ceil(unspawnedRequiredItems.length / 2);
    result.forcedItems = unspawnedRequiredItems.slice(0, itemsToForce);

    // Force spawn tiles if any are pending
    if (unspawnedRequiredTiles.length > 0) {
      result.forcedTiles = [unspawnedRequiredTiles[0]]; // At least one tile
    }

    if (behindOnSpawns) {
      result.warnings.push(`Warning: Spawn rate behind schedule (${actualItemsSpawned}/${expectedItemsSpawned} expected)`);
    }
  }

  return result;
}

/**
 * Finds the best tile to spawn a quest item on.
 * Prioritizes appropriate room types.
 */
export function findBestSpawnTile(
  item: QuestItem,
  availableTiles: Tile[],
  alreadyUsedTileIds: Set<string>
): Tile | null {
  // Filter to valid tiles
  const validTiles = availableTiles.filter(tile =>
    tile.searchable &&
    tile.explored &&
    !alreadyUsedTileIds.has(tile.id) &&
    tile.category !== 'corridor' &&
    tile.category !== 'street'
  );

  if (validTiles.length === 0) return null;

  // Score tiles by appropriateness using data-driven lookup
  const scoredTiles = validTiles.map(tile => {
    // Base score + item-type-specific room bonus
    const score = 1 + getItemRoomScore(item.type, tile.name) + Math.random() * 0.5;
    return { tile, score };
  });

  // Sort by score descending and return best
  scoredTiles.sort((a, b) => b.score - a.score);
  return scoredTiles[0]?.tile || null;
}

/**
 * Finds the best tile to become a quest tile (exit, altar, etc).
 */
export function findBestQuestTileLocation(
  questTile: QuestTile,
  availableTiles: Tile[],
  alreadyUsedTileIds: Set<string>
): Tile | null {
  const validTiles = availableTiles.filter(tile =>
    tile.explored &&
    !alreadyUsedTileIds.has(tile.id)
  );

  if (validTiles.length === 0) return null;

  // Score tiles by type match using data-driven lookup
  const scoredTiles = validTiles.map(tile => {
    const score = getQuestTileLocationScore(questTile.type, tile) + Math.random() * 0.5;
    return { tile, score };
  });

  scoredTiles.sort((a, b) => b.score - a.score);
  return scoredTiles[0]?.tile || null;
}

/**
 * Force spawns items and tiles that need to appear immediately.
 * Returns the updated state and any tile modifications needed.
 */
export function executeGuaranteedSpawns(
  state: ObjectiveSpawnState,
  spawnResult: GuaranteedSpawnResult,
  availableTiles: Tile[]
): {
  updatedState: ObjectiveSpawnState;
  itemSpawnLocations: { item: QuestItem; tileId: string }[];
  tileModifications: { tileId: string; modifications: Partial<Tile>; questTile: QuestTile }[];
} {
  let updatedState = { ...state };
  const itemSpawnLocations: { item: QuestItem; tileId: string }[] = [];
  const tileModifications: { tileId: string; modifications: Partial<Tile>; questTile: QuestTile }[] = [];
  const usedTileIds = new Set<string>();

  // First, mark already used tiles
  state.questItems.filter(i => i.spawnedOnTileId).forEach(i => usedTileIds.add(i.spawnedOnTileId!));

  // Spawn forced items
  for (const item of spawnResult.forcedItems) {
    const targetTile = findBestSpawnTile(item, availableTiles, usedTileIds);
    if (targetTile) {
      usedTileIds.add(targetTile.id);
      itemSpawnLocations.push({ item, tileId: targetTile.id });

      // Update state
      updatedState = {
        ...updatedState,
        questItems: updatedState.questItems.map(qi =>
          qi.id === item.id ? { ...qi, spawned: true, spawnedOnTileId: targetTile.id } : qi
        ),
      };
    }
  }

  // Spawn forced quest tiles
  for (const questTile of spawnResult.forcedTiles) {
    const targetTile = findBestQuestTileLocation(questTile, availableTiles, usedTileIds);
    if (targetTile) {
      usedTileIds.add(targetTile.id);

      // Prepare tile modifications
      let modifications: Partial<Tile> = {};
      if (questTile.type === 'exit') {
        modifications = {
          name: 'Exit Door',
          description: 'The way out! But can you make it in time?',
          isGate: true,
          // CRITICAL: Set exit_door object type so player can use Escape action
          object: { type: 'exit_door', searched: false },
        };
      } else if (questTile.type === 'altar' || questTile.type === 'ritual_point') {
        modifications = {
          name: 'Ritual Altar',
          description: 'An ancient altar for dark rituals. You can perform the ritual here.',
          floorType: 'ritual',
          // CRITICAL: Set altar object type so player can use Perform Ritual action
          object: { type: 'altar', searched: false },
        };
      } else if (questTile.type === 'boss_room') {
        modifications = {
          name: 'Dark Sanctum',
          description: 'A place of terrible power. The final confrontation awaits.',
        };
      } else if (questTile.type === 'npc_location') {
        modifications = {
          name: 'Hidden Chamber',
          description: 'Someone or something important is here.',
        };
      }

      tileModifications.push({ tileId: targetTile.id, modifications, questTile });

      // Update state
      updatedState = {
        ...updatedState,
        questTiles: updatedState.questTiles.map(qt =>
          qt.id === questTile.id ? { ...qt, spawned: true } : qt
        ),
      };
    }
  }

  return { updatedState, itemSpawnLocations, tileModifications };
}

/**
 * Gets a summary of what still needs to spawn for debugging/UI.
 */
export function getSpawnStatus(
  state: ObjectiveSpawnState,
  scenario: Scenario
): {
  totalItems: number;
  spawnedItems: number;
  collectedItems: number;
  totalTiles: number;
  spawnedTiles: number;
  missingRequired: string[];
} {
  const spawnedItems = state.questItems.filter(i => i.spawned).length;
  const collectedItems = state.questItems.filter(i => i.collected).length;
  const spawnedTiles = state.questTiles.filter(t => t.spawned).length;

  const missingRequired: string[] = [];

  // Check for missing required items
  state.questItems.filter(item => !item.spawned).forEach(item => {
    const obj = scenario.objectives.find(o => o.id === item.objectiveId);
    if (obj && !obj.isOptional) {
      missingRequired.push(`Item: ${item.name}`);
    }
  });

  // Check for missing required tiles
  state.questTiles.filter(tile => !tile.spawned).forEach(tile => {
    const obj = scenario.objectives.find(o => o.id === tile.objectiveId);
    if (obj && !obj.isOptional) {
      missingRequired.push(`Location: ${tile.name}`);
    }
  });

  return {
    totalItems: state.questItems.length,
    spawnedItems,
    collectedItems,
    totalTiles: state.questTiles.length,
    spawnedTiles,
    missingRequired,
  };
}
