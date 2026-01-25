/**
 * Room Spawn Helper Functions
 *
 * Extracted from spawnRoom() in ShadowsGame.tsx for better modularity and testability.
 * These helpers handle:
 * - Category-based tile pool selection
 * - Floor type determination
 * - Fallback tile edge creation
 * - Fallback tile creation
 * - Quest item processing on new tiles
 * - Enemy spawning on new tiles
 */

import {
  Tile,
  TileCategory,
  ZoneLevel,
  FloorType,
  EdgeData,
  Item
} from '../types';
import {
  INDOOR_LOCATIONS,
  OUTDOOR_LOCATIONS,
  INDOOR_CONNECTORS,
  OUTDOOR_CONNECTORS,
  CATEGORY_ZONE_LEVELS,
  validateTileConnection
} from '../constants';

// ============================================================================
// TYPES
// ============================================================================

export interface FallbackTileConfig {
  startQ: number;
  startR: number;
  newCategory: TileCategory;
  roomName: string;
  roomId: string;
  boardMap: Map<string, Tile>;
}

export interface QuestItemSpawnResult {
  finalTile: Tile;
  updatedObjectiveSpawnState: any;
  logMessages: string[];
}

// ============================================================================
// CATEGORY TILE POOL SELECTION
// ============================================================================

/**
 * Get the location name pool for a given tile category.
 * Used when creating fallback tiles to get appropriate room names.
 *
 * @param category - The tile category
 * @param tileSet - Whether to use indoor or outdoor locations
 * @returns Array of location names appropriate for the category
 */
export function getCategoryTilePool(
  category: TileCategory,
  tileSet: 'indoor' | 'outdoor' | 'mixed'
): string[] {
  switch (category) {
    case 'nature':
      return OUTDOOR_LOCATIONS.filter((_, i) => i < 15);
    case 'urban':
      return OUTDOOR_LOCATIONS.filter((_, i) => i >= 15 && i < 35);
    case 'street':
      return OUTDOOR_CONNECTORS;
    case 'facade':
      return INDOOR_LOCATIONS.filter((_, i) => i < 14);
    case 'foyer':
      return INDOOR_LOCATIONS.filter((_, i) => i >= 14 && i < 24);
    case 'corridor':
      return INDOOR_CONNECTORS;
    case 'room':
      return INDOOR_LOCATIONS.filter((_, i) => i >= 24 && i < 49);
    case 'stairs':
      return INDOOR_LOCATIONS.filter((_, i) => i >= 49 && i < 59);
    case 'basement':
      return INDOOR_LOCATIONS.filter((_, i) => i >= 59 && i < 74);
    case 'crypt':
      return INDOOR_LOCATIONS.filter((_, i) => i >= 74);
    default:
      return tileSet === 'indoor' ? INDOOR_LOCATIONS : OUTDOOR_LOCATIONS;
  }
}

// ============================================================================
// FLOOR TYPE DETERMINATION
// ============================================================================

/**
 * Determine the appropriate floor type for a given tile category.
 * Uses game design bible guidelines for visual consistency.
 *
 * @param category - The tile category
 * @returns The floor type for the category
 */
export function getFloorTypeForCategory(category: TileCategory): FloorType {
  switch (category) {
    case 'nature':
      return Math.random() > 0.5 ? 'grass' : 'dirt';
    case 'urban':
    case 'street':
      return 'cobblestone';
    case 'facade':
    case 'foyer':
    case 'corridor':
    case 'room':
      return 'wood';
    case 'stairs':
      return 'stone';
    case 'basement':
      return 'stone';
    case 'crypt':
      return Math.random() > 0.7 ? 'ritual' : 'stone';
    default:
      return 'wood';
  }
}

// ============================================================================
// FALLBACK EDGE CREATION
// ============================================================================

/** Hex edge direction offsets (pointy-top orientation) */
const EDGE_DIRECTIONS = [
  { dq: 0, dr: -1 },   // 0: North
  { dq: 1, dr: -1 },   // 1: North-East
  { dq: 1, dr: 0 },    // 2: South-East
  { dq: 0, dr: 1 },    // 3: South
  { dq: -1, dr: 1 },   // 4: South-West
  { dq: -1, dr: 0 }    // 5: North-West
];

/**
 * Create appropriate edges for a fallback tile based on neighboring tiles.
 * Validates connections between categories and adds doors where required.
 *
 * @param startQ - Tile Q coordinate
 * @param startR - Tile R coordinate
 * @param newCategory - Category of the new tile
 * @param boardMap - Map of existing tiles for neighbor lookup
 * @returns Array of 6 EdgeData objects for the hex edges
 */
export function createFallbackEdges(
  startQ: number,
  startR: number,
  newCategory: TileCategory,
  boardMap: Map<string, Tile>
): [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] {
  const edges: EdgeData[] = [];

  for (let i = 0; i < 6; i++) {
    const neighborQ = startQ + EDGE_DIRECTIONS[i].dq;
    const neighborR = startR + EDGE_DIRECTIONS[i].dr;
    const neighborTile = boardMap.get(`${neighborQ},${neighborR}`);

    if (neighborTile && neighborTile.category) {
      const edgeValidation = validateTileConnection(
        newCategory,
        neighborTile.category as TileCategory,
        false
      );

      if (edgeValidation.requiresDoor) {
        edges.push({ type: 'door', doorState: 'closed' });
      } else if (!edgeValidation.isValid) {
        edges.push({ type: 'wall' });
      } else {
        edges.push({ type: 'open' });
      }
    } else {
      // No neighbor - default to open edge
      edges.push({ type: 'open' });
    }
  }

  return edges as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
}

// ============================================================================
// FALLBACK TILE CREATION
// ============================================================================

/**
 * Create a complete fallback tile when no template matches.
 * Used as a legacy fallback system for procedural generation.
 *
 * @param config - Configuration for the fallback tile
 * @returns A complete Tile object ready to be added to the board
 */
export function createFallbackTile(config: FallbackTileConfig): Tile {
  const { startQ, startR, newCategory, roomName, roomId, boardMap } = config;

  const fallbackEdges = createFallbackEdges(startQ, startR, newCategory, boardMap);
  const exitCount = fallbackEdges.filter(e => e.type !== 'wall' && e.type !== 'blocked').length;

  const fallbackTile: Tile = {
    id: `tile-${Date.now()}-${Math.random()}`,
    q: startQ,
    r: startR,
    name: roomName,
    type: 'room',
    category: newCategory,
    zoneLevel: (CATEGORY_ZONE_LEVELS[newCategory] || 0) as ZoneLevel,
    floorType: getFloorTypeForCategory(newCategory),
    visibility: 'visible',
    edges: fallbackEdges,
    roomId,
    explored: true,
    searchable: !['facade', 'street', 'nature', 'corridor'].includes(newCategory),
    searched: false,
    isDeadEnd: exitCount <= 1
  };

  return fallbackTile;
}

// ============================================================================
// RANDOM ROOM NAME SELECTION
// ============================================================================

/**
 * Select a random room name from the appropriate category pool.
 *
 * @param category - The tile category
 * @param tileSet - Whether to use indoor or outdoor locations
 * @returns A room name appropriate for the category
 */
export function selectRandomRoomName(
  category: TileCategory,
  tileSet: 'indoor' | 'outdoor' | 'mixed'
): string {
  const pool = getCategoryTilePool(category, tileSet);
  return pool[Math.floor(Math.random() * pool.length)] || 'Unknown Chamber';
}

// ============================================================================
// TILE SET FILTERING
// ============================================================================

/** Indoor tile categories */
const INDOOR_CATEGORIES: TileCategory[] = [
  'foyer', 'corridor', 'room', 'stairs', 'basement', 'crypt', 'facade'
];

/** Outdoor tile categories */
const OUTDOOR_CATEGORIES: TileCategory[] = [
  'nature', 'urban', 'street'
];

/**
 * Check if a tile category matches the requested tile set.
 *
 * @param category - The tile category to check
 * @param tileSet - The requested tile set filter
 * @returns True if the category matches the tile set
 */
export function categoryMatchesTileSet(
  category: TileCategory,
  tileSet: 'indoor' | 'outdoor' | 'mixed'
): boolean {
  if (tileSet === 'mixed') return true;
  if (tileSet === 'indoor') return INDOOR_CATEGORIES.includes(category);
  return OUTDOOR_CATEGORIES.includes(category);
}

// ============================================================================
// QUEST ITEM PROCESSING
// ============================================================================

/**
 * Process quest item spawning on a newly created tile.
 * Handles objective spawn state updates and tile modifications.
 *
 * @param newTile - The newly created tile
 * @param objectiveSpawnState - Current objective spawn state
 * @param activeScenario - The active scenario
 * @param onTileExploredFn - Function to call for tile exploration handling
 * @returns Result containing updated tile, spawn state, and log messages
 */
export function processQuestItemOnNewTile(
  newTile: Tile,
  objectiveSpawnState: any,
  activeScenario: any,
  onTileExploredFn: (state: any, tile: Tile, scenario: any, completedIds: string[]) => any
): QuestItemSpawnResult {
  const logMessages: string[] = [];
  let finalTile = newTile;
  let updatedObjectiveSpawnState = objectiveSpawnState;

  if (!objectiveSpawnState || !activeScenario) {
    return { finalTile, updatedObjectiveSpawnState, logMessages };
  }

  const completedObjectiveIds = activeScenario.objectives
    .filter((o: any) => o.completed)
    .map((o: any) => o.id);

  const exploreResult = onTileExploredFn(
    objectiveSpawnState,
    newTile,
    activeScenario,
    completedObjectiveIds
  );

  updatedObjectiveSpawnState = exploreResult.updatedState;

  // If a quest item spawned, add it to the tile
  if (exploreResult.spawnedItem) {
    const questItem: Item = {
      id: exploreResult.spawnedItem.id,
      name: exploreResult.spawnedItem.name,
      description: exploreResult.spawnedItem.description,
      type: 'quest_item',
      category: 'special',
      isQuestItem: true,
      questItemType: exploreResult.spawnedItem.type,
      objectiveId: exploreResult.spawnedItem.objectiveId,
    };
    finalTile = {
      ...finalTile,
      items: [...(finalTile.items || []), questItem],
      hasQuestItem: true,
    };
    logMessages.push(`📦 Noe viktig er gjemt i ${newTile.name}... Søk nøye!`);
  }

  // If a quest tile spawned, modify the tile
  if (exploreResult.spawnedQuestTile && exploreResult.tileModifications) {
    finalTile = { ...finalTile, ...exploreResult.tileModifications };
    logMessages.push(`⭐ VIKTIG LOKASJON: ${exploreResult.spawnedQuestTile.name} funnet!`);
  }

  return { finalTile, updatedObjectiveSpawnState, logMessages };
}

// ============================================================================
// ENEMY SPAWN POSITION
// ============================================================================

/**
 * Calculate a random spawn position near a tile.
 * Offsets the position slightly from the source tile.
 *
 * @param sourceQ - Source tile Q coordinate
 * @param sourceR - Source tile R coordinate
 * @returns Object with q and r coordinates for enemy spawn
 */
export function calculateEnemySpawnPosition(
  sourceQ: number,
  sourceR: number
): { q: number; r: number } {
  return {
    q: sourceQ + (Math.random() > 0.5 ? 1 : -1),
    r: sourceR + (Math.random() > 0.5 ? 1 : 0)
  };
}

// ============================================================================
// FALLBACK TILE SPAWN RESULT
// ============================================================================

/**
 * Result of spawning a fallback tile.
 * Contains all data needed to update game state and log messages.
 */
export interface FallbackTileSpawnResult {
  /** The created fallback tile */
  tile: Tile;
  /** The category of the new tile */
  category: TileCategory;
  /** The name of the new room */
  roomName: string;
  /** Log messages to display */
  logMessages: string[];
}

/**
 * Configuration for creating a fallback tile spawn result.
 * ENHANCED (2026-01-25): Added optional theme parameter for theme-aware category selection.
 */
export interface CreateFallbackSpawnConfig {
  /** Starting Q coordinate */
  startQ: number;
  /** Starting R coordinate */
  startR: number;
  /** The source category (where player is coming from) */
  sourceCategory: TileCategory;
  /** The tile set preference */
  tileSet: 'indoor' | 'outdoor' | 'mixed';
  /** Room ID for the new tile */
  roomId: string;
  /** Map of existing tiles for edge creation */
  boardMap: Map<string, Tile>;
  /** Location descriptions lookup for logging */
  locationDescriptions: Record<string, string>;
  /** Function to select a random connectable category */
  selectCategoryFn: (fromCategory: TileCategory, preferIndoor: boolean) => TileCategory;
  /** Optional scenario theme for theme-aware fallback (NEW) */
  scenarioTheme?: string;
  /** Optional theme preferences for biasing category selection (NEW) */
  themePreferences?: {
    preferredCategories: string[];
    avoidCategories: string[];
  };
}

/**
 * Select category with theme preference bias.
 * If theme preferences are provided, tries to select a preferred category
 * while avoiding penalized categories.
 *
 * ADDED (2026-01-25): Theme-aware category selection for fallback tiles.
 *
 * @param sourceCategory - The source category (where player is coming from)
 * @param preferIndoor - Whether to prefer indoor categories
 * @param selectCategoryFn - Base category selection function
 * @param themePreferences - Optional theme preferences for biasing selection
 * @returns Selected category with theme bias applied
 */
function selectCategoryWithThemeBias(
  sourceCategory: TileCategory,
  preferIndoor: boolean,
  selectCategoryFn: (fromCategory: TileCategory, preferIndoor: boolean) => TileCategory,
  themePreferences?: { preferredCategories: string[]; avoidCategories: string[] }
): TileCategory {
  // If no theme preferences, use default selection
  if (!themePreferences) {
    return selectCategoryFn(sourceCategory, preferIndoor);
  }

  // Try up to 5 times to get a theme-appropriate category
  for (let attempt = 0; attempt < 5; attempt++) {
    const category = selectCategoryFn(sourceCategory, preferIndoor);

    // Check if this category is strongly avoided
    const isAvoided = themePreferences.avoidCategories.includes(category);

    // Accept if not avoided, or if it's a preferred category
    const isPreferred = themePreferences.preferredCategories.includes(category);
    if (isPreferred || !isAvoided) {
      return category;
    }

    // On later attempts, be more lenient
    if (attempt >= 3 && !isAvoided) {
      return category;
    }
  }

  // Fallback: just use the default selection
  return selectCategoryFn(sourceCategory, preferIndoor);
}

/**
 * Creates a complete fallback tile spawn result.
 *
 * This function consolidates the repeated fallback logic that was duplicated
 * in spawnRoom(). It handles:
 * - Category selection based on source tile
 * - Room name selection based on category
 * - Tile creation with proper edges
 * - Log message generation
 *
 * ENHANCED (2026-01-25): Now supports theme-aware category selection to ensure
 * fallback tiles match the scenario theme better.
 *
 * The caller is responsible for:
 * - Synchronizing edges with neighbors
 * - Updating game state
 * - Calling addToLog with the messages
 *
 * @param config - Configuration for fallback tile creation
 * @returns FallbackTileSpawnResult with tile and log messages
 */
export function createFallbackSpawnResult(
  config: CreateFallbackSpawnConfig
): FallbackTileSpawnResult {
  const {
    startQ,
    startR,
    sourceCategory,
    tileSet,
    roomId,
    boardMap,
    locationDescriptions,
    selectCategoryFn,
    themePreferences
  } = config;

  // Select category based on source with theme bias (NEW)
  const newCategory = selectCategoryWithThemeBias(
    sourceCategory,
    tileSet === 'indoor',
    selectCategoryFn,
    themePreferences
  );

  // Select room name based on category
  const roomName = selectRandomRoomName(newCategory, tileSet);

  // Create the fallback tile
  const tile = createFallbackTile({
    startQ,
    startR,
    newCategory,
    roomName,
    roomId,
    boardMap
  });

  // Build log messages
  const logMessages: string[] = [
    `UTFORSKET: ${roomName}. [${newCategory.toUpperCase()}]`
  ];

  // Add location description if available
  const locationDescription = locationDescriptions[roomName];
  if (locationDescription) {
    logMessages.push(locationDescription);
  }

  return {
    tile,
    category: newCategory,
    roomName,
    logMessages
  };
}
