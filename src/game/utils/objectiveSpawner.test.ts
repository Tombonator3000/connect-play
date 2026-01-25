/**
 * Tests for Objective Spawner System
 *
 * These tests cover the quest item and tile spawning system including:
 * - Quest item initialization
 * - Spawn probability calculations
 * - Pity timer mechanics
 * - Quest tile placement
 * - Collection mechanics
 * - Guaranteed spawn system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  // Types
  QuestItem,
  QuestTile,
  ObjectiveSpawnState,

  // Lookup helpers
  getRoomSpawnBonus,
  getQuestTileTypeFromTargetId,
  getItemRoomScore,
  getQuestTileLocationScore,
  ROOM_SPAWN_BONUSES,
  QUEST_TILE_TYPE_LOOKUP,
  ITEM_ROOM_SCORES,
  QUEST_TILE_LOCATION_SCORES,

  // Quest item definitions
  QUEST_ITEM_NAMES,

  // Initialization
  initializeObjectiveSpawns,

  // Spawn probability
  SPAWN_PROBABILITY_CONFIG,
  getAdjustedSpawnConfig,
  shouldSpawnQuestItem,

  // Quest tile spawning
  shouldRevealQuestTile,
  shouldSpawnQuestTile,

  // Collection
  collectQuestItem,

  // Tile discovery
  onTileExplored,

  // Victory helpers
  canEscape,
  getObjectiveProgress,

  // Guaranteed spawns
  GUARANTEED_SPAWN_CONFIG,
  checkGuaranteedSpawns,
  findBestSpawnTile,
  findBestQuestTileLocation,
  executeGuaranteedSpawns,
  getSpawnStatus,

  // Immediate spawns
  spawnRevealedQuestTileImmediately
} from './objectiveSpawner';
import { Scenario, ScenarioObjective, Tile } from '../types';

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockObjective(overrides: Partial<ScenarioObjective> = {}): ScenarioObjective {
  return {
    id: 'obj_test_1',
    description: 'Test objective',
    shortDescription: 'Test',
    type: 'find_item',
    targetId: 'quest_key',
    isOptional: false,
    isHidden: false,
    completed: false,
    currentAmount: 0,
    ...overrides
  };
}

function createMockScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'test_scenario',
    title: 'Test Scenario',
    briefing: 'Test briefing',
    difficulty: 'Normal',
    startDoom: 12,
    doomOnDeath: -1,
    doomOnSurvivorRescue: 1,
    estimatedTime: '30 min',
    recommendedPlayers: { min: 1, max: 2 },
    victoryType: 'escape',
    theme: 'manor',
    objectives: [
      createMockObjective({ id: 'obj_key', type: 'find_item', targetId: 'quest_key' }),
      createMockObjective({ id: 'obj_escape', type: 'escape', isHidden: true, revealedBy: 'obj_key' })
    ],
    victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj_key', 'obj_escape'] }],
    defeatConditions: [{ type: 'all_dead', description: 'All dead' }],
    doomEvents: [],
    ...overrides
  };
}

function createMockTile(q: number, r: number, overrides: Partial<Tile> = {}): Tile {
  return {
    id: `tile_${q}_${r}`,
    q,
    r,
    name: 'Test Room',
    category: 'room',
    floorType: 'wood',
    explored: true,
    searchable: true,
    items: [],
    ...overrides
  };
}

function createMockSpawnState(overrides: Partial<ObjectiveSpawnState> = {}): ObjectiveSpawnState {
  return {
    questItems: [],
    questTiles: [],
    tilesExplored: 0,
    itemsCollected: 0,
    tilesSinceLastSpawn: 0,
    ...overrides
  };
}

// ============================================================================
// LOOKUP HELPER TESTS
// ============================================================================

describe('Lookup Helpers', () => {
  describe('getRoomSpawnBonus', () => {
    it('returns bonus for ritual room', () => {
      expect(getRoomSpawnBonus('Ritual Chamber')).toBe(0.25);
    });

    it('returns bonus for study', () => {
      expect(getRoomSpawnBonus('Private Study')).toBe(0.2);
    });

    it('returns bonus for cellar', () => {
      expect(getRoomSpawnBonus('Dark Cellar')).toBe(0.15);
    });

    it('returns 0 for unknown room', () => {
      expect(getRoomSpawnBonus('Generic Room')).toBe(0);
    });

    it('is case insensitive', () => {
      expect(getRoomSpawnBonus('RITUAL CHAMBER')).toBe(0.25);
    });
  });

  describe('getQuestTileTypeFromTargetId', () => {
    it('returns exit type for exit target', () => {
      const result = getQuestTileTypeFromTargetId('exit_door');
      expect(result.type).toBe('exit');
      expect(result.name).toBe('Exit');
    });

    it('returns altar type for ritual target', () => {
      const result = getQuestTileTypeFromTargetId('ritual_altar');
      expect(result.type).toBe('altar');
    });

    it('returns final_confrontation for confront target', () => {
      const result = getQuestTileTypeFromTargetId('final_confrontation');
      expect(result.type).toBe('final_confrontation');
    });

    it('returns default for unknown target', () => {
      const result = getQuestTileTypeFromTargetId('unknown_thing');
      expect(result.type).toBe('npc_location');
      expect(result.name).toBe('Special Location');
    });
  });

  describe('getItemRoomScore', () => {
    it('gives high score for key in study', () => {
      expect(getItemRoomScore('key', 'Private Study')).toBe(3);
    });

    it('gives high score for clue in library', () => {
      expect(getItemRoomScore('clue', 'Library')).toBe(3);
    });

    it('gives 0 for unknown item type', () => {
      expect(getItemRoomScore('unknown', 'Library')).toBe(0);
    });
  });

  describe('getQuestTileLocationScore', () => {
    it('gives high score for exit in foyer', () => {
      const tile = { category: 'foyer', name: 'Grand Foyer', zoneLevel: 1 };
      expect(getQuestTileLocationScore('exit', tile)).toBeGreaterThanOrEqual(5);
    });

    it('gives high score for altar in crypt', () => {
      const tile = { category: 'crypt', name: 'Dark Crypt', zoneLevel: -2 };
      expect(getQuestTileLocationScore('altar', tile)).toBeGreaterThanOrEqual(5);
    });

    it('gives score for pattern match', () => {
      const tile = { category: 'room', name: 'Ritual Chamber', zoneLevel: -1 };
      expect(getQuestTileLocationScore('altar', tile)).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// QUEST ITEM DEFINITIONS TESTS
// ============================================================================

describe('Quest Item Definitions', () => {
  it('has definitions for common keys', () => {
    expect(QUEST_ITEM_NAMES).toHaveProperty('iron_key');
    expect(QUEST_ITEM_NAMES).toHaveProperty('silver_key');
    expect(QUEST_ITEM_NAMES).toHaveProperty('quest_key');
  });

  it('has definitions for clues', () => {
    expect(QUEST_ITEM_NAMES).toHaveProperty('intel_clue');
    expect(QUEST_ITEM_NAMES).toHaveProperty('evidence_clue');
  });

  it('all definitions have name and description', () => {
    for (const [key, def] of Object.entries(QUEST_ITEM_NAMES)) {
      expect(def.name).toBeDefined();
      expect(def.description).toBeDefined();
      expect(def.name.length).toBeGreaterThan(0);
      expect(def.description.length).toBeGreaterThan(10);
    }
  });
});

// ============================================================================
// INITIALIZATION TESTS
// ============================================================================

describe('initializeObjectiveSpawns', () => {
  it('creates quest items for find_item objectives', () => {
    const scenario = createMockScenario({
      objectives: [createMockObjective({ type: 'find_item', targetId: 'quest_key' })]
    });

    const state = initializeObjectiveSpawns(scenario);

    expect(state.questItems.length).toBe(1);
    expect(state.questItems[0].type).toBe('key');
  });

  it('creates multiple items for collect objectives', () => {
    const scenario = createMockScenario({
      objectives: [createMockObjective({ type: 'collect', targetAmount: 3 })]
    });

    const state = initializeObjectiveSpawns(scenario);

    expect(state.questItems.length).toBe(3);
    state.questItems.forEach(item => {
      expect(item.type).toBe('collectible');
    });
  });

  it('creates quest tiles for escape objectives', () => {
    const scenario = createMockScenario({
      objectives: [createMockObjective({ type: 'escape', id: 'obj_exit' })]
    });

    const state = initializeObjectiveSpawns(scenario);

    expect(state.questTiles.length).toBe(1);
    expect(state.questTiles[0].type).toBe('exit');
  });

  it('initializes counters to zero', () => {
    const scenario = createMockScenario();
    const state = initializeObjectiveSpawns(scenario);

    expect(state.tilesExplored).toBe(0);
    expect(state.itemsCollected).toBe(0);
    expect(state.tilesSinceLastSpawn).toBe(0);
  });
});

// ============================================================================
// SPAWN PROBABILITY TESTS
// ============================================================================

describe('Spawn Probability Config', () => {
  it('has valid early game threshold', () => {
    expect(SPAWN_PROBABILITY_CONFIG.EARLY_GAME_THRESHOLD).toBeGreaterThan(0);
    expect(SPAWN_PROBABILITY_CONFIG.EARLY_GAME_THRESHOLD).toBeLessThan(1);
  });

  it('has increasing spawn chances', () => {
    expect(SPAWN_PROBABILITY_CONFIG.NORMAL_SPAWN_CHANCE).toBeGreaterThan(SPAWN_PROBABILITY_CONFIG.EARLY_SPAWN_CHANCE);
    expect(SPAWN_PROBABILITY_CONFIG.BEHIND_SCHEDULE_CHANCE).toBeGreaterThan(SPAWN_PROBABILITY_CONFIG.NORMAL_SPAWN_CHANCE);
  });

  it('has reasonable pity timer', () => {
    expect(SPAWN_PROBABILITY_CONFIG.PITY_TIMER_TILES).toBeGreaterThanOrEqual(2);
    expect(SPAWN_PROBABILITY_CONFIG.PITY_TIMER_TILES).toBeLessThanOrEqual(10);
  });
});

describe('getAdjustedSpawnConfig', () => {
  it('returns base config for few items', () => {
    const config = getAdjustedSpawnConfig(2);
    expect(config.NORMAL_SPAWN_CHANCE).toBe(SPAWN_PROBABILITY_CONFIG.NORMAL_SPAWN_CHANCE);
  });

  it('boosts spawn chance for collection missions', () => {
    const config = getAdjustedSpawnConfig(5);
    expect(config.NORMAL_SPAWN_CHANCE).toBeGreaterThan(SPAWN_PROBABILITY_CONFIG.NORMAL_SPAWN_CHANCE);
  });

  it('reduces pity timer for collection missions', () => {
    const config = getAdjustedSpawnConfig(6);
    expect(config.PITY_TIMER_TILES).toBeLessThanOrEqual(SPAWN_PROBABILITY_CONFIG.PITY_TIMER_TILES);
  });
});

describe('shouldSpawnQuestItem', () => {
  it('returns null for non-searchable tiles', () => {
    const state = createMockSpawnState({
      questItems: [{ id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: false, collected: false }]
    });
    const tile = createMockTile(0, 0, { searchable: false });
    const scenario = createMockScenario();

    expect(shouldSpawnQuestItem(state, tile, 1, scenario)).toBeNull();
  });

  it('returns null for corridor tiles', () => {
    const state = createMockSpawnState({
      questItems: [{ id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: false, collected: false }]
    });
    const tile = createMockTile(0, 0, { category: 'corridor' });
    const scenario = createMockScenario();

    expect(shouldSpawnQuestItem(state, tile, 1, scenario)).toBeNull();
  });

  it('returns null when all items spawned', () => {
    const state = createMockSpawnState({
      questItems: [{ id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: true, collected: false }]
    });
    const tile = createMockTile(0, 0);
    const scenario = createMockScenario();

    expect(shouldSpawnQuestItem(state, tile, 1, scenario)).toBeNull();
  });

  it('forces spawn when pity timer exceeded', () => {
    const questItem = { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key' as const, name: 'Key', description: 'A key', spawned: false, collected: false };
    const state = createMockSpawnState({
      questItems: [questItem],
      tilesSinceLastSpawn: 10 // Exceeds pity timer
    });
    const tile = createMockTile(0, 0);
    const scenario = createMockScenario();

    const result = shouldSpawnQuestItem(state, tile, 10, scenario);
    expect(result).not.toBeNull();
  });
});

// ============================================================================
// QUEST TILE REVEAL TESTS
// ============================================================================

describe('shouldRevealQuestTile', () => {
  it('returns true for already revealed tile', () => {
    const questTile: QuestTile = {
      id: 'qt1',
      objectiveId: 'obj1',
      type: 'exit',
      name: 'Exit',
      spawned: false,
      revealed: true
    };

    expect(shouldRevealQuestTile(questTile, [])).toBe(true);
  });

  it('returns true when reveal condition met', () => {
    const questTile: QuestTile = {
      id: 'qt1',
      objectiveId: 'obj_exit',
      type: 'exit',
      name: 'Exit',
      spawned: false,
      revealed: false,
      revealCondition: 'objective_complete',
      revealObjectiveId: 'obj_key'
    };

    expect(shouldRevealQuestTile(questTile, ['obj_key'])).toBe(true);
  });

  it('returns false when reveal condition not met', () => {
    const questTile: QuestTile = {
      id: 'qt1',
      objectiveId: 'obj_exit',
      type: 'exit',
      name: 'Exit',
      spawned: false,
      revealed: false,
      revealCondition: 'objective_complete',
      revealObjectiveId: 'obj_key'
    };

    expect(shouldRevealQuestTile(questTile, [])).toBe(false);
  });
});

// ============================================================================
// COLLECTION TESTS
// ============================================================================

describe('collectQuestItem', () => {
  it('marks item as collected', () => {
    const item: QuestItem = {
      id: 'q1',
      objectiveId: 'obj1',
      scenarioId: 's1',
      type: 'key',
      name: 'Key',
      description: 'A key',
      spawned: true,
      collected: false
    };
    const state = createMockSpawnState({ questItems: [item] });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1', type: 'find_item', targetAmount: 1 })]
    });

    const result = collectQuestItem(state, item, scenario);

    expect(result.updatedState.questItems[0].collected).toBe(true);
    expect(result.updatedState.itemsCollected).toBe(1);
  });

  it('updates objective progress', () => {
    const item: QuestItem = {
      id: 'q1',
      objectiveId: 'obj1',
      scenarioId: 's1',
      type: 'collectible',
      name: 'Fragment',
      description: 'A fragment',
      spawned: true,
      collected: false
    };
    const state = createMockSpawnState({ questItems: [item] });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1', type: 'collect', targetAmount: 3, currentAmount: 1 })]
    });

    const result = collectQuestItem(state, item, scenario);

    expect(result.updatedObjective).not.toBeNull();
    expect(result.updatedObjective!.currentAmount).toBe(2);
  });

  it('marks objective complete when target reached', () => {
    const item: QuestItem = {
      id: 'q1',
      objectiveId: 'obj1',
      scenarioId: 's1',
      type: 'key',
      name: 'Key',
      description: 'A key',
      spawned: true,
      collected: false
    };
    const state = createMockSpawnState({ questItems: [item] });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1', type: 'find_item', targetAmount: 1, currentAmount: 0 })]
    });

    const result = collectQuestItem(state, item, scenario);

    expect(result.objectiveCompleted).toBe(true);
  });
});

// ============================================================================
// TILE EXPLORATION TESTS
// ============================================================================

describe('onTileExplored', () => {
  it('increments tiles explored counter', () => {
    const state = createMockSpawnState({ tilesExplored: 5 });
    const tile = createMockTile(0, 0);
    const scenario = createMockScenario();

    const result = onTileExplored(state, tile, scenario, []);

    expect(result.updatedState.tilesExplored).toBe(6);
  });

  it('increments pity timer', () => {
    const state = createMockSpawnState({ tilesSinceLastSpawn: 2 });
    const tile = createMockTile(0, 0, { category: 'corridor' }); // Won't spawn item
    const scenario = createMockScenario();

    const result = onTileExplored(state, tile, scenario, []);

    expect(result.updatedState.tilesSinceLastSpawn).toBe(3);
  });

  it('resets pity timer on spawn', () => {
    const questItem = { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key' as const, name: 'Key', description: 'A key', spawned: false, collected: false };
    const state = createMockSpawnState({
      questItems: [questItem],
      tilesSinceLastSpawn: 10 // Will force spawn
    });
    const tile = createMockTile(0, 0);
    const scenario = createMockScenario();

    const result = onTileExplored(state, tile, scenario, []);

    if (result.spawnedItem) {
      expect(result.updatedState.tilesSinceLastSpawn).toBe(0);
    }
  });
});

// ============================================================================
// GUARANTEED SPAWN TESTS
// ============================================================================

describe('Guaranteed Spawn Config', () => {
  it('has valid doom thresholds', () => {
    expect(GUARANTEED_SPAWN_CONFIG.DOOM_CRITICAL).toBeGreaterThan(0);
    expect(GUARANTEED_SPAWN_CONFIG.DOOM_WARNING).toBeGreaterThan(GUARANTEED_SPAWN_CONFIG.DOOM_CRITICAL);
  });

  it('has valid exploration thresholds', () => {
    expect(GUARANTEED_SPAWN_CONFIG.EXPLORATION_FORCE).toBeGreaterThan(0);
    expect(GUARANTEED_SPAWN_CONFIG.EXPLORATION_FORCE).toBeLessThanOrEqual(1);
  });
});

describe('checkGuaranteedSpawns', () => {
  it('returns no forced spawns for healthy game state', () => {
    const state = createMockSpawnState({
      questItems: [{ id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: true, collected: false }],
      tilesExplored: 3,
      tilesSinceLastSpawn: 1
    });
    const scenario = createMockScenario();

    const result = checkGuaranteedSpawns(state, scenario, 12, [], []);

    expect(result.urgency).toBe('none');
    expect(result.forcedItems.length).toBe(0);
  });

  it('returns critical urgency when doom is very low', () => {
    const questItem = { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key' as const, name: 'Key', description: 'A key', spawned: false, collected: false };
    const state = createMockSpawnState({
      questItems: [questItem],
      tilesExplored: 5
    });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1' })]
    });

    const result = checkGuaranteedSpawns(state, scenario, 3, [], []);

    expect(result.urgency).toBe('critical');
    expect(result.forcedItems.length).toBeGreaterThan(0);
  });
});

describe('findBestSpawnTile', () => {
  it('finds searchable explored tile', () => {
    const item: QuestItem = { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: false, collected: false };
    const tiles = [
      createMockTile(0, 0, { explored: true, searchable: true, category: 'room' }),
      createMockTile(1, 0, { explored: true, searchable: true, category: 'corridor' })
    ];

    const result = findBestSpawnTile(item, tiles, new Set());

    expect(result).not.toBeNull();
    expect(result!.category).toBe('room');
  });

  it('excludes already used tiles', () => {
    const item: QuestItem = { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: false, collected: false };
    const tiles = [
      createMockTile(0, 0, { id: 'tile_0_0', explored: true, searchable: true }),
      createMockTile(1, 0, { id: 'tile_1_0', explored: true, searchable: true })
    ];

    const result = findBestSpawnTile(item, tiles, new Set(['tile_0_0']));

    expect(result).not.toBeNull();
    expect(result!.id).toBe('tile_1_0');
  });
});

// ============================================================================
// IMMEDIATE SPAWN TESTS
// ============================================================================

describe('spawnRevealedQuestTileImmediately', () => {
  it('spawns exit tile on best available tile', () => {
    const questTile: QuestTile = {
      id: 'qt1',
      objectiveId: 'obj_exit',
      type: 'exit',
      name: 'Exit',
      spawned: false,
      revealed: true
    };
    const state = createMockSpawnState({ questTiles: [questTile] });
    const tiles = [
      createMockTile(0, 0, { id: 't1', category: 'foyer', explored: true }),
      createMockTile(1, 0, { id: 't2', category: 'room', explored: true })
    ];

    const result = spawnRevealedQuestTileImmediately(state, questTile, tiles);

    expect(result.spawnedQuestTile).not.toBeNull();
    expect(result.targetTileId).toBeDefined();
    expect(result.tileModifications).not.toBeNull();
    expect(result.tileModifications!.isGate).toBe(true);
  });

  it('returns null for already spawned tile', () => {
    const questTile: QuestTile = {
      id: 'qt1',
      objectiveId: 'obj_exit',
      type: 'exit',
      name: 'Exit',
      spawned: true,
      revealed: true
    };
    const state = createMockSpawnState({ questTiles: [questTile] });

    const result = spawnRevealedQuestTileImmediately(state, questTile, []);

    expect(result.spawnedQuestTile).toBeNull();
  });
});

// ============================================================================
// SPAWN STATUS TESTS
// ============================================================================

describe('getSpawnStatus', () => {
  it('returns correct counts', () => {
    const state = createMockSpawnState({
      questItems: [
        { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Key', description: 'A key', spawned: true, collected: true },
        { id: 'q2', objectiveId: 'obj2', scenarioId: 's1', type: 'key', name: 'Key2', description: 'A key', spawned: true, collected: false },
        { id: 'q3', objectiveId: 'obj3', scenarioId: 's1', type: 'key', name: 'Key3', description: 'A key', spawned: false, collected: false }
      ],
      questTiles: [
        { id: 'qt1', objectiveId: 'obj4', type: 'exit', name: 'Exit', spawned: true, revealed: true }
      ]
    });
    const scenario = createMockScenario({
      objectives: [
        createMockObjective({ id: 'obj1' }),
        createMockObjective({ id: 'obj2' }),
        createMockObjective({ id: 'obj3' }),
        createMockObjective({ id: 'obj4', type: 'escape' })
      ]
    });

    const status = getSpawnStatus(state, scenario);

    expect(status.totalItems).toBe(3);
    expect(status.spawnedItems).toBe(2);
    expect(status.collectedItems).toBe(1);
    expect(status.totalTiles).toBe(1);
    expect(status.spawnedTiles).toBe(1);
  });

  it('identifies missing required items', () => {
    const state = createMockSpawnState({
      questItems: [
        { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'key', name: 'Important Key', description: 'A key', spawned: false, collected: false }
      ]
    });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1', isOptional: false })]
    });

    const status = getSpawnStatus(state, scenario);

    expect(status.missingRequired).toContain('Item: Important Key');
  });
});

// ============================================================================
// VICTORY HELPER TESTS
// ============================================================================

describe('canEscape', () => {
  it('returns true when player on exit tile', () => {
    const state = createMockSpawnState({
      questTiles: [{ id: 'qt1', objectiveId: 'obj1', type: 'exit', name: 'Exit', spawned: true, revealed: true }]
    });
    const tiles = [createMockTile(0, 0, { isGate: true, name: 'Exit Door' })];
    const playerPos = { q: 0, r: 0 };

    expect(canEscape(state, playerPos, tiles)).toBe(true);
  });

  it('returns false when no exit spawned', () => {
    const state = createMockSpawnState({
      questTiles: [{ id: 'qt1', objectiveId: 'obj1', type: 'exit', name: 'Exit', spawned: false, revealed: true }]
    });
    const tiles = [createMockTile(0, 0)];
    const playerPos = { q: 0, r: 0 };

    expect(canEscape(state, playerPos, tiles)).toBe(false);
  });

  it('returns false when player not on exit', () => {
    const state = createMockSpawnState({
      questTiles: [{ id: 'qt1', objectiveId: 'obj1', type: 'exit', name: 'Exit', spawned: true, revealed: true }]
    });
    const tiles = [createMockTile(0, 0, { isGate: true, name: 'Exit Door' })];
    const playerPos = { q: 5, r: 5 };

    expect(canEscape(state, playerPos, tiles)).toBe(false);
  });
});

describe('getObjectiveProgress', () => {
  it('returns progress for each objective', () => {
    const state = createMockSpawnState({
      questItems: [
        { id: 'q1', objectiveId: 'obj1', scenarioId: 's1', type: 'collectible', name: 'F1', description: 'D', spawned: true, collected: true },
        { id: 'q2', objectiveId: 'obj1', scenarioId: 's1', type: 'collectible', name: 'F2', description: 'D', spawned: true, collected: false }
      ]
    });
    const scenario = createMockScenario({
      objectives: [createMockObjective({ id: 'obj1', type: 'collect', targetAmount: 2 })]
    });

    const progress = getObjectiveProgress(state, scenario);

    expect(progress.length).toBe(1);
    expect(progress[0].progress).toBe('1/2');
    expect(progress[0].completed).toBe(false);
  });
});
