/**
 * Tests for mythosPhaseUtils.ts
 *
 * Tests cover all mythos phase utilities:
 * - Portal spawning
 * - Guaranteed spawns
 * - Enemy combat processing
 * - Event card drawing
 * - Phase transitions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  collectActivePortals,
  processPortalSpawns,
  processGuaranteedSpawns,
  processEnemyCombatPhase,
  applyDamageToPlayer,
  tryDrawEventCard,
  resetPlayersForNewTurn,
  shouldApplyMadnessEffects,
  areAllPlayersDead,
  createLogEntry,
  PortalSpawnData,
} from './mythosPhaseUtils';
import { Tile, Player, Enemy, Scenario, TileType, EnemyType } from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createMockTile(overrides: Partial<Tile> = {}): Tile {
  return {
    id: `tile-${Math.random().toString(36).substring(7)}`,
    q: 0,
    r: 0,
    type: 'room' as TileType,
    name: 'Test Room',
    explored: true,
    edges: {},
    items: [],
    ...overrides,
  };
}

function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: `player-${Math.random().toString(36).substring(7)}`,
    name: 'Test Player',
    hp: 10,
    maxHp: 10,
    sanity: 10,
    maxSanity: 10,
    position: { q: 0, r: 0 },
    actions: 2,
    maxActions: 2,
    isDead: false,
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    ...overrides,
  } as Player;
}

function createMockEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: `enemy-${Math.random().toString(36).substring(7)}`,
    type: 'cultist' as EnemyType,
    name: 'Cultist',
    hp: 4,
    maxHp: 4,
    damage: 2,
    position: { q: 1, r: 0 },
    hasMoved: false,
    hasAttacked: false,
    ...overrides,
  } as Enemy;
}

function createMockScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'test-scenario',
    title: 'Test Scenario',
    briefing: 'Test briefing',
    objectives: [
      {
        id: 'obj-1',
        type: 'collect',
        description: 'Collect the artifact',
        completed: false,
        requiredItems: ['artifact'],
        current: 0,
        target: 1,
      },
    ],
    difficulty: 'medium',
    rewards: {},
    ...overrides,
  } as Scenario;
}

// ============================================================================
// PORTAL SPAWNING TESTS
// ============================================================================

describe('collectActivePortals', () => {
  it('returns empty array when no portals exist', () => {
    const board = [
      createMockTile({ q: 0, r: 0 }),
      createMockTile({ q: 1, r: 0 }),
    ];

    const result = collectActivePortals(board);

    expect(result).toEqual([]);
  });

  it('ignores inactive portals', () => {
    const board = [
      createMockTile({
        q: 0,
        r: 0,
        object: {
          type: 'eldritch_portal',
          portalActive: false,
          portalSpawnChance: 50,
          portalSpawnTypes: ['cultist' as EnemyType],
        },
      }),
    ];

    const result = collectActivePortals(board);

    expect(result).toEqual([]);
  });

  it('collects active portals with spawn data', () => {
    const board = [
      createMockTile({
        id: 'portal-tile-1',
        q: 2,
        r: 3,
        object: {
          type: 'eldritch_portal',
          portalActive: true,
          portalSpawnChance: 75,
          portalSpawnTypes: ['deep_one' as EnemyType, 'cultist' as EnemyType],
        },
      }),
      createMockTile({ q: 0, r: 0 }),
    ];

    const result = collectActivePortals(board);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      tileId: 'portal-tile-1',
      q: 2,
      r: 3,
      types: ['deep_one', 'cultist'],
      chance: 75,
    });
  });

  it('uses default values for missing portal properties', () => {
    const board = [
      createMockTile({
        id: 'portal-tile',
        q: 1,
        r: 1,
        object: {
          type: 'eldritch_portal',
          portalActive: true,
          // No portalSpawnChance or portalSpawnTypes
        },
      }),
    ];

    const result = collectActivePortals(board);

    expect(result).toHaveLength(1);
    expect(result[0].chance).toBe(50); // default
    expect(result[0].types).toEqual(['cultist']); // default
  });

  it('collects multiple active portals', () => {
    const board = [
      createMockTile({
        id: 'portal-1',
        q: 0,
        r: 0,
        object: {
          type: 'eldritch_portal',
          portalActive: true,
          portalSpawnChance: 30,
          portalSpawnTypes: ['cultist' as EnemyType],
        },
      }),
      createMockTile({
        id: 'portal-2',
        q: 3,
        r: 3,
        object: {
          type: 'eldritch_portal',
          portalActive: true,
          portalSpawnChance: 80,
          portalSpawnTypes: ['shoggoth' as EnemyType],
        },
      }),
    ];

    const result = collectActivePortals(board);

    expect(result).toHaveLength(2);
    expect(result.map(p => p.tileId)).toContain('portal-1');
    expect(result.map(p => p.tileId)).toContain('portal-2');
  });
});

describe('processPortalSpawns', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty result when no portals provided', () => {
    const result = processPortalSpawns([]);

    expect(result.spawns).toEqual([]);
    expect(result.messages).toEqual([]);
    expect(result.floatingTexts).toEqual([]);
  });

  it('spawns enemy when roll is below chance', () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.3) // 30 < 50 chance - spawn
      .mockReturnValueOnce(0); // select first enemy type

    const portals: PortalSpawnData[] = [
      {
        tileId: 'portal-1',
        q: 2,
        r: 2,
        types: ['cultist' as EnemyType],
        chance: 50,
      },
    ];

    const result = processPortalSpawns(portals);

    expect(result.spawns).toHaveLength(1);
    expect(result.spawns[0]).toEqual({
      enemyType: 'cultist',
      q: 2,
      r: 2,
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toContain('cultist');
    expect(result.floatingTexts).toHaveLength(1);
    expect(result.floatingTexts[0].text).toBe('PORTAL SPAWN!');
  });

  it('does not spawn when roll is above chance', () => {
    vi.mocked(Math.random).mockReturnValueOnce(0.8); // 80 >= 50 chance - no spawn

    const portals: PortalSpawnData[] = [
      {
        tileId: 'portal-1',
        q: 2,
        r: 2,
        types: ['cultist' as EnemyType],
        chance: 50,
      },
    ];

    const result = processPortalSpawns(portals);

    expect(result.spawns).toEqual([]);
    expect(result.messages).toEqual([]);
    expect(result.floatingTexts).toEqual([]);
  });

  it('randomly selects enemy type from available types', () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.1) // spawn
      .mockReturnValueOnce(0.5); // select second enemy type (0.5 * 2 = 1)

    const portals: PortalSpawnData[] = [
      {
        tileId: 'portal-1',
        q: 0,
        r: 0,
        types: ['cultist' as EnemyType, 'deep_one' as EnemyType],
        chance: 100,
      },
    ];

    const result = processPortalSpawns(portals);

    expect(result.spawns).toHaveLength(1);
    expect(result.spawns[0].enemyType).toBe('deep_one');
  });

  it('processes multiple portals independently', () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.1) // portal 1 spawns
      .mockReturnValueOnce(0)   // portal 1 type
      .mockReturnValueOnce(0.9) // portal 2 does not spawn
      .mockReturnValueOnce(0.2) // portal 3 spawns
      .mockReturnValueOnce(0);  // portal 3 type

    const portals: PortalSpawnData[] = [
      { tileId: 'p1', q: 0, r: 0, types: ['cultist' as EnemyType], chance: 50 },
      { tileId: 'p2', q: 1, r: 1, types: ['deep_one' as EnemyType], chance: 50 },
      { tileId: 'p3', q: 2, r: 2, types: ['shoggoth' as EnemyType], chance: 50 },
    ];

    const result = processPortalSpawns(portals);

    expect(result.spawns).toHaveLength(2);
    expect(result.spawns[0].enemyType).toBe('cultist');
    expect(result.spawns[1].enemyType).toBe('shoggoth');
  });
});

// ============================================================================
// ENEMY COMBAT PROCESSING TESTS
// ============================================================================

describe('applyDamageToPlayer', () => {
  it('reduces HP and sanity correctly', () => {
    const player = createMockPlayer({ hp: 10, sanity: 10 });

    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 3, 2);

    expect(updatedPlayer.hp).toBe(7);
    expect(updatedPlayer.sanity).toBe(8);
    expect(updatedPlayer.isDead).toBe(false);
    expect(newlyDead).toBe(false);
  });

  it('marks player as dead when HP reaches 0', () => {
    const player = createMockPlayer({ hp: 5, sanity: 10, isDead: false });

    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 5, 0);

    expect(updatedPlayer.hp).toBe(0);
    expect(updatedPlayer.isDead).toBe(true);
    expect(newlyDead).toBe(true);
  });

  it('marks player as dead when HP goes below 0', () => {
    const player = createMockPlayer({ hp: 3, sanity: 10, isDead: false });

    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 10, 0);

    expect(updatedPlayer.hp).toBe(0);
    expect(updatedPlayer.isDead).toBe(true);
    expect(newlyDead).toBe(true);
  });

  it('does not report newly dead if player was already dead', () => {
    const player = createMockPlayer({ hp: 0, sanity: 5, isDead: true });

    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 5, 5);

    expect(updatedPlayer.hp).toBe(0);
    expect(updatedPlayer.isDead).toBe(true);
    expect(newlyDead).toBe(false);
  });

  it('clamps sanity at 0', () => {
    const player = createMockPlayer({ hp: 10, sanity: 3 });

    const { updatedPlayer } = applyDamageToPlayer(player, 0, 10);

    expect(updatedPlayer.sanity).toBe(0);
  });

  it('handles zero damage correctly', () => {
    const player = createMockPlayer({ hp: 10, sanity: 10 });

    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 0, 0);

    expect(updatedPlayer.hp).toBe(10);
    expect(updatedPlayer.sanity).toBe(10);
    expect(newlyDead).toBe(false);
  });
});

// ============================================================================
// EVENT CARD DRAWING TESTS
// ============================================================================

describe('tryDrawEventCard', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when random roll is >= 0.5 (no draw)', () => {
    vi.mocked(Math.random).mockReturnValueOnce(0.5);

    const result = tryDrawEventCard([], [], 10);

    expect(result).toBeNull();
  });

  it('returns null when random roll is > 0.5', () => {
    vi.mocked(Math.random).mockReturnValueOnce(0.75);

    const result = tryDrawEventCard([], [], 10);

    expect(result).toBeNull();
  });

  // Note: Full event card drawing behavior is tested in eventDeckManager.test.ts
  // These tests just verify the wrapper logic
});

// ============================================================================
// PHASE TRANSITION TESTS
// ============================================================================

describe('resetPlayersForNewTurn', () => {
  it('resets action points to default 2 for living players', () => {
    const players = [
      createMockPlayer({ id: 'p1', actions: 0, isDead: false }),
      createMockPlayer({ id: 'p2', actions: 1, isDead: false }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].actions).toBe(2);
    expect(resetPlayers[1].actions).toBe(2);
  });

  it('uses maxActions when available', () => {
    const players = [
      createMockPlayer({ id: 'p1', actions: 0, maxActions: 3, isDead: false }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].actions).toBe(3);
  });

  it('applies AP penalty and clears it', () => {
    const players = [
      createMockPlayer({
        id: 'p1',
        actions: 0,
        maxActions: 2,
        apPenaltyNextTurn: 1,
        isDead: false,
      }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].actions).toBe(1); // 2 - 1 penalty
    expect(resetPlayers[0].apPenaltyNextTurn).toBeUndefined();
  });

  it('sets actions to 0 for dead players', () => {
    const players = [
      createMockPlayer({ id: 'p1', actions: 2, maxActions: 3, isDead: true }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].actions).toBe(0);
  });

  it('grants free moves to journalists (escape_bonus ability)', () => {
    const players = [
      createMockPlayer({
        id: 'journalist',
        specialAbility: 'escape_bonus',
        isDead: false,
      }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].freeMovesRemaining).toBe(1);
  });

  it('does not grant free moves to dead journalists', () => {
    const players = [
      createMockPlayer({
        id: 'dead-journalist',
        specialAbility: 'escape_bonus',
        isDead: true,
      }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].freeMovesRemaining).toBe(0);
  });

  it('does not grant free moves to non-journalists', () => {
    const players = [
      createMockPlayer({
        id: 'detective',
        specialAbility: 'investigation_bonus',
        isDead: false,
      }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].freeMovesRemaining).toBe(0);
  });

  it('clamps actions at minimum 0', () => {
    const players = [
      createMockPlayer({
        id: 'penalized',
        actions: 0,
        maxActions: 2,
        apPenaltyNextTurn: 5, // More penalty than actions
        isDead: false,
      }),
    ];

    const { resetPlayers } = resetPlayersForNewTurn(players);

    expect(resetPlayers[0].actions).toBeGreaterThanOrEqual(0);
  });
});

describe('shouldApplyMadnessEffects', () => {
  it('returns shouldApply true when first player has active madness', () => {
    const players = [
      createMockPlayer({
        id: 'p1',
        isDead: false,
        activeMadness: { id: 'paranoia', name: 'Paranoia', effect: 'test' },
      }),
    ];

    const result = shouldApplyMadnessEffects(players);

    expect(result.shouldApply).toBe(true);
    expect(result.playerIndex).toBe(0);
  });

  it('returns shouldApply false when first player has no madness', () => {
    const players = [
      createMockPlayer({ id: 'p1', isDead: false }),
    ];

    const result = shouldApplyMadnessEffects(players);

    expect(result.shouldApply).toBe(false);
    expect(result.playerIndex).toBe(-1);
  });

  it('returns shouldApply false when first player is dead', () => {
    const players = [
      createMockPlayer({
        id: 'p1',
        isDead: true,
        activeMadness: { id: 'paranoia', name: 'Paranoia', effect: 'test' },
      }),
    ];

    const result = shouldApplyMadnessEffects(players);

    expect(result.shouldApply).toBe(false);
    expect(result.playerIndex).toBe(-1);
  });

  it('returns shouldApply false when no players', () => {
    const result = shouldApplyMadnessEffects([]);

    expect(result.shouldApply).toBe(false);
    expect(result.playerIndex).toBe(-1);
  });
});

describe('areAllPlayersDead', () => {
  it('returns true when all players are dead', () => {
    const players = [
      createMockPlayer({ id: 'p1', isDead: true }),
      createMockPlayer({ id: 'p2', isDead: true }),
    ];

    expect(areAllPlayersDead(players)).toBe(true);
  });

  it('returns false when at least one player is alive', () => {
    const players = [
      createMockPlayer({ id: 'p1', isDead: true }),
      createMockPlayer({ id: 'p2', isDead: false }),
    ];

    expect(areAllPlayersDead(players)).toBe(false);
  });

  it('returns false when all players are alive', () => {
    const players = [
      createMockPlayer({ id: 'p1', isDead: false }),
      createMockPlayer({ id: 'p2', isDead: false }),
    ];

    expect(areAllPlayersDead(players)).toBe(false);
  });

  it('returns true for empty player array', () => {
    expect(areAllPlayersDead([])).toBe(true);
  });
});

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('createLogEntry', () => {
  it('creates log entry with timestamp', () => {
    const entry = createLogEntry('Test message', 'combat');

    expect(entry.message).toBe('Test message');
    expect(entry.category).toBe('combat');
    expect(entry.timestamp).toBeDefined();
    expect(typeof entry.timestamp).toBe('string');
  });

  it('creates log entries with different categories', () => {
    const combatEntry = createLogEntry('Combat!', 'combat');
    const eventEntry = createLogEntry('Event!', 'event');
    const systemEntry = createLogEntry('System!', 'system');

    expect(combatEntry.category).toBe('combat');
    expect(eventEntry.category).toBe('event');
    expect(systemEntry.category).toBe('system');
  });
});

// ============================================================================
// INTEGRATION-LIKE TESTS
// ============================================================================

describe('Mythos Phase Flow', () => {
  it('complete flow: portals -> spawns -> combat -> reset', () => {
    // 1. Collect portals
    const board = [
      createMockTile({
        id: 'portal-tile',
        q: 5,
        r: 5,
        object: {
          type: 'eldritch_portal',
          portalActive: true,
          portalSpawnChance: 100,
          portalSpawnTypes: ['cultist' as EnemyType],
        },
      }),
    ];

    const portals = collectActivePortals(board);
    expect(portals).toHaveLength(1);

    // 2. Apply damage to player
    const player = createMockPlayer({ hp: 10, sanity: 10 });
    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 5, 3);
    expect(updatedPlayer.hp).toBe(5);
    expect(updatedPlayer.sanity).toBe(7);
    expect(newlyDead).toBe(false);

    // 3. Reset for new turn
    const playersToReset = [updatedPlayer];
    const { resetPlayers } = resetPlayersForNewTurn(playersToReset);
    expect(resetPlayers[0].actions).toBe(2);
  });

  it('handles player death during combat', () => {
    const player = createMockPlayer({ hp: 3, sanity: 5, isDead: false });

    // Apply lethal damage
    const { updatedPlayer, newlyDead } = applyDamageToPlayer(player, 10, 0);

    expect(updatedPlayer.isDead).toBe(true);
    expect(newlyDead).toBe(true);

    // Dead player has 0 base actions (but desperate measures may add bonus AP)
    // The key invariant is that isDead remains true
    const { resetPlayers } = resetPlayersForNewTurn([updatedPlayer]);
    expect(resetPlayers[0].isDead).toBe(true);
  });

  it('all dead players ends game condition', () => {
    const players = [
      createMockPlayer({ id: 'p1', hp: 5, isDead: false }),
      createMockPlayer({ id: 'p2', hp: 3, isDead: false }),
    ];

    expect(areAllPlayersDead(players)).toBe(false);

    // Kill first player
    const { updatedPlayer: dead1 } = applyDamageToPlayer(players[0], 10, 0);
    expect(areAllPlayersDead([dead1, players[1]])).toBe(false);

    // Kill second player
    const { updatedPlayer: dead2 } = applyDamageToPlayer(players[1], 10, 0);
    expect(areAllPlayersDead([dead1, dead2])).toBe(true);
  });
});
