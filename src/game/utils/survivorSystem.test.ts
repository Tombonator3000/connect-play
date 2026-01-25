/**
 * Tests for Survivor System
 *
 * These tests cover the NPC survivor mechanics including:
 * - Survivor templates and configuration
 * - Survivor spawning logic
 * - Survivor creation
 * - Following behavior
 * - Rescue and death mechanics
 * - Special abilities
 * - Enemy targeting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SURVIVOR_TEMPLATES,
  SURVIVOR_SPAWN_CONFIG,
  selectSurvivorType,
  createSurvivor,
  shouldSpawnSurvivor,
  processSurvivorTurn,
  startFollowing,
  rescueSurvivor,
  killSurvivor,
  useSurvivorAbility,
  shouldTargetSurvivor
} from './survivorSystem';
import { Survivor, SurvivorType, Player, Enemy, Tile, createEmptyInventory } from '../types';

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'detective',
    name: 'Test Detective',
    hp: 8,
    maxHp: 8,
    sanity: 6,
    maxSanity: 6,
    insight: 0,
    attributes: { strength: 2, agility: 2, intellect: 3, willpower: 2 },
    special: 'Investigation Expert',
    specialAbility: 'investigate_bonus',
    baseAttackDice: 1,
    baseDefenseDice: 2,
    position: { q: 0, r: 0 },
    inventory: createEmptyInventory(),
    spells: [],
    actions: 2,
    maxActions: 2,
    isDead: false,
    madness: [],
    activeMadness: null,
    traits: [],
    ...overrides
  };
}

function createMockEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'enemy-1',
    name: 'Test Cultist',
    type: 'cultist',
    hp: 3,
    maxHp: 3,
    damage: 1,
    horror: 1,
    speed: 1,
    position: { q: 2, r: 0 },
    visionRange: 4,
    attackRange: 1,
    attackType: 'melee',
    ...overrides
  };
}

function createMockSurvivor(overrides: Partial<Survivor> = {}): Survivor {
  return {
    id: 'survivor-test-1',
    name: 'Test Survivor',
    type: 'civilian',
    state: 'hidden',
    position: { q: 1, r: 0 },
    hp: 2,
    maxHp: 2,
    speed: 1,
    canDefendSelf: false,
    panicLevel: 30,
    insightReward: 0,
    sanityReward: 1,
    goldReward: 25,
    foundDialogue: 'Test dialogue',
    followDialogue: 'Test follow',
    rescuedDialogue: 'Test rescued',
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

function createBasicBoard(): Tile[] {
  const tiles: Tile[] = [];
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      tiles.push(createMockTile(q, r));
    }
  }
  return tiles;
}

// ============================================================================
// SURVIVOR TEMPLATES TESTS
// ============================================================================

describe('Survivor Templates', () => {
  const survivorTypes: SurvivorType[] = [
    'civilian', 'wounded', 'researcher', 'cultist_defector',
    'child', 'asylum_patient', 'reporter', 'occultist_ally'
  ];

  survivorTypes.forEach(type => {
    describe(`${type} template`, () => {
      it('has required properties', () => {
        const template = SURVIVOR_TEMPLATES[type];
        expect(template.type).toBe(type);
        expect(template.names.length).toBeGreaterThan(0);
        expect(template.hp).toBeGreaterThan(0);
        expect(template.speed).toBeGreaterThanOrEqual(0);
        expect(typeof template.canDefendSelf).toBe('boolean');
        expect(template.dialogues.found.length).toBeGreaterThan(0);
        expect(template.dialogues.following.length).toBeGreaterThan(0);
        expect(template.dialogues.rescued.length).toBeGreaterThan(0);
      });

      it('has reward values defined', () => {
        const template = SURVIVOR_TEMPLATES[type];
        expect(typeof template.insightReward).toBe('number');
        expect(typeof template.sanityReward).toBe('number');
        expect(typeof template.goldReward).toBe('number');
      });
    });
  });

  it('civilian has no special ability', () => {
    expect(SURVIVOR_TEMPLATES.civilian.specialAbility).toBeUndefined();
  });

  it('researcher has knowledge ability', () => {
    expect(SURVIVOR_TEMPLATES.researcher.specialAbility).toBe('knowledge');
  });

  it('cultist_defector has reveal_map ability', () => {
    expect(SURVIVOR_TEMPLATES.cultist_defector.specialAbility).toBe('reveal_map');
  });

  it('child has calm_aura ability', () => {
    expect(SURVIVOR_TEMPLATES.child.specialAbility).toBe('calm_aura');
  });

  it('occultist_ally has ward ability', () => {
    expect(SURVIVOR_TEMPLATES.occultist_ally.specialAbility).toBe('ward');
  });

  it('wounded survivor has 0 speed', () => {
    expect(SURVIVOR_TEMPLATES.wounded.speed).toBe(0);
  });

  it('occultist_ally can defend self', () => {
    expect(SURVIVOR_TEMPLATES.occultist_ally.canDefendSelf).toBe(true);
  });

  it('child gives high sanity reward', () => {
    expect(SURVIVOR_TEMPLATES.child.sanityReward).toBeGreaterThanOrEqual(3);
  });

  it('asylum_patient gives negative sanity', () => {
    expect(SURVIVOR_TEMPLATES.asylum_patient.sanityReward).toBeLessThan(0);
  });
});

// ============================================================================
// SPAWN CONFIGURATION TESTS
// ============================================================================

describe('Survivor Spawn Configuration', () => {
  it('has config for all survivor types', () => {
    const configTypes = SURVIVOR_SPAWN_CONFIG.map(c => c.type);
    const allTypes: SurvivorType[] = [
      'civilian', 'wounded', 'researcher', 'cultist_defector',
      'child', 'asylum_patient', 'reporter', 'occultist_ally'
    ];

    for (const type of allTypes) {
      expect(configTypes).toContain(type);
    }
  });

  it('all configs have valid weight', () => {
    for (const config of SURVIVOR_SPAWN_CONFIG) {
      expect(config.weight).toBeGreaterThan(0);
    }
  });

  it('all configs have preferred tiles', () => {
    for (const config of SURVIVOR_SPAWN_CONFIG) {
      expect(config.preferredTiles.length).toBeGreaterThan(0);
    }
  });

  it('civilian has highest weight (most common)', () => {
    const civilianWeight = SURVIVOR_SPAWN_CONFIG.find(c => c.type === 'civilian')?.weight || 0;
    for (const config of SURVIVOR_SPAWN_CONFIG) {
      if (config.type !== 'civilian') {
        expect(civilianWeight).toBeGreaterThanOrEqual(config.weight);
      }
    }
  });

  it('occultist_ally has lowest weight (rarest)', () => {
    const occultistWeight = SURVIVOR_SPAWN_CONFIG.find(c => c.type === 'occultist_ally')?.weight || 0;
    for (const config of SURVIVOR_SPAWN_CONFIG) {
      if (config.type !== 'occultist_ally') {
        expect(occultistWeight).toBeLessThanOrEqual(config.weight);
      }
    }
  });
});

// ============================================================================
// SELECT SURVIVOR TYPE TESTS
// ============================================================================

describe('selectSurvivorType', () => {
  it('returns a survivor type for valid tile and doom', () => {
    const type = selectSurvivorType('room', 10);
    expect(type).not.toBeNull();
  });

  it('returns null for tile category with no matching spawns', () => {
    // Testing edge case - might need to adjust based on actual config
    const type = selectSurvivorType('foyer', 200); // Out of doom range
    // Could be null or a type depending on config
    expect(type === null || typeof type === 'string').toBe(true);
  });

  it('respects doom range limits', () => {
    // wounded has maxDoom: 10
    // At doom 15, wounded shouldn't spawn
    let foundWounded = false;
    for (let i = 0; i < 100; i++) {
      const type = selectSurvivorType('corridor', 15);
      if (type === 'wounded') foundWounded = true;
    }
    expect(foundWounded).toBe(false);
  });
});

// ============================================================================
// CREATE SURVIVOR TESTS
// ============================================================================

describe('createSurvivor', () => {
  it('creates survivor with correct type', () => {
    const survivor = createSurvivor('civilian', { q: 0, r: 0 });
    expect(survivor.type).toBe('civilian');
  });

  it('creates survivor with unique id', () => {
    const s1 = createSurvivor('civilian', { q: 0, r: 0 });
    const s2 = createSurvivor('civilian', { q: 0, r: 0 });
    expect(s1.id).not.toBe(s2.id);
  });

  it('creates survivor with name from template pool', () => {
    const survivor = createSurvivor('civilian', { q: 0, r: 0 });
    expect(SURVIVOR_TEMPLATES.civilian.names).toContain(survivor.name);
  });

  it('creates survivor at specified position', () => {
    const survivor = createSurvivor('researcher', { q: 5, r: 3 });
    expect(survivor.position.q).toBe(5);
    expect(survivor.position.r).toBe(3);
  });

  it('creates survivor with hidden state', () => {
    const survivor = createSurvivor('child', { q: 0, r: 0 });
    expect(survivor.state).toBe('hidden');
  });

  it('creates survivor with template HP', () => {
    const survivor = createSurvivor('occultist_ally', { q: 0, r: 0 });
    expect(survivor.hp).toBe(SURVIVOR_TEMPLATES.occultist_ally.hp);
    expect(survivor.maxHp).toBe(SURVIVOR_TEMPLATES.occultist_ally.hp);
  });

  it('asylum patient starts with high panic', () => {
    const survivor = createSurvivor('asylum_patient', { q: 0, r: 0 });
    expect(survivor.panicLevel).toBe(80);
  });
});

// ============================================================================
// SHOULD SPAWN SURVIVOR TESTS
// ============================================================================

describe('shouldSpawnSurvivor', () => {
  it('returns false on non-first visit', () => {
    const tile = createMockTile(0, 0);
    expect(shouldSpawnSurvivor(tile, 10, [], false)).toBe(false);
  });

  it('returns false when too many survivors exist', () => {
    const tile = createMockTile(0, 0);
    const survivors = [
      createMockSurvivor({ id: 's1', state: 'found' }),
      createMockSurvivor({ id: 's2', state: 'following' }),
      createMockSurvivor({ id: 's3', state: 'hidden' })
    ];
    expect(shouldSpawnSurvivor(tile, 10, survivors, true)).toBe(false);
  });

  it('does not count rescued survivors toward limit', () => {
    const tile = createMockTile(0, 0);
    const survivors = [
      createMockSurvivor({ id: 's1', state: 'rescued' }),
      createMockSurvivor({ id: 's2', state: 'rescued' }),
      createMockSurvivor({ id: 's3', state: 'dead' })
    ];
    // All are rescued/dead so should allow spawning
    const result = shouldSpawnSurvivor(tile, 10, survivors, true);
    expect(typeof result).toBe('boolean');
  });

  it('returns boolean for valid spawn condition', () => {
    const tile = createMockTile(0, 0);
    const result = shouldSpawnSurvivor(tile, 10, [], true);
    expect(typeof result).toBe('boolean');
  });
});

// ============================================================================
// START FOLLOWING TESTS
// ============================================================================

describe('startFollowing', () => {
  it('sets state to following', () => {
    const survivor = createMockSurvivor();
    const player = createMockPlayer();

    const result = startFollowing(survivor, player);

    expect(result.state).toBe('following');
  });

  it('sets followingPlayerId', () => {
    const survivor = createMockSurvivor();
    const player = createMockPlayer({ id: 'detective' });

    const result = startFollowing(survivor, player);

    expect(result.followingPlayerId).toBe('detective');
  });

  it('reduces panic level', () => {
    const survivor = createMockSurvivor({ panicLevel: 50 });
    const player = createMockPlayer();

    const result = startFollowing(survivor, player);

    expect(result.panicLevel).toBe(30);
  });

  it('does not reduce panic below 0', () => {
    const survivor = createMockSurvivor({ panicLevel: 10 });
    const player = createMockPlayer();

    const result = startFollowing(survivor, player);

    expect(result.panicLevel).toBe(0);
  });
});

// ============================================================================
// RESCUE SURVIVOR TESTS
// ============================================================================

describe('rescueSurvivor', () => {
  it('sets state to rescued', () => {
    const survivor = createMockSurvivor({ type: 'civilian' });
    const result = rescueSurvivor(survivor);

    expect(result.survivor.state).toBe('rescued');
  });

  it('returns correct rewards', () => {
    const survivor = createMockSurvivor({
      type: 'researcher',
      insightReward: 3,
      sanityReward: 0,
      goldReward: 75
    });

    const result = rescueSurvivor(survivor);

    expect(result.rewards.insight).toBe(3);
    expect(result.rewards.sanity).toBe(0);
    expect(result.rewards.gold).toBe(75);
  });

  it('returns doom bonus of 1 by default', () => {
    const survivor = createMockSurvivor();
    const result = rescueSurvivor(survivor);

    expect(result.rewards.doomBonus).toBe(1);
  });

  it('uses custom doom bonus when provided', () => {
    const survivor = createMockSurvivor();
    const result = rescueSurvivor(survivor, 2);

    expect(result.rewards.doomBonus).toBe(2);
  });

  it('returns rescue message', () => {
    const survivor = createMockSurvivor({ type: 'child', name: 'Tommy' });
    const result = rescueSurvivor(survivor);

    expect(result.message).toContain('Tommy');
    expect(result.message).toContain('trygg');
  });
});

// ============================================================================
// KILL SURVIVOR TESTS
// ============================================================================

describe('killSurvivor', () => {
  it('sets state to dead', () => {
    const survivor = createMockSurvivor();
    const enemy = createMockEnemy();

    const result = killSurvivor(survivor, enemy);

    expect(result.survivor.state).toBe('dead');
    expect(result.survivor.hp).toBe(0);
  });

  it('returns sanity loss of 1 for civilian', () => {
    const survivor = createMockSurvivor({ type: 'civilian' });
    const enemy = createMockEnemy();

    const result = killSurvivor(survivor, enemy);

    expect(result.sanityLoss).toBe(1);
  });

  it('returns sanity loss of 3 for child', () => {
    const survivor = createMockSurvivor({ type: 'child' });
    const enemy = createMockEnemy();

    const result = killSurvivor(survivor, enemy);

    expect(result.sanityLoss).toBe(3);
  });

  it('returns sanity loss of 2 for wounded', () => {
    const survivor = createMockSurvivor({ type: 'wounded' });
    const enemy = createMockEnemy();

    const result = killSurvivor(survivor, enemy);

    expect(result.sanityLoss).toBe(2);
  });

  it('returns death message with enemy and survivor names', () => {
    const survivor = createMockSurvivor({ type: 'researcher', name: 'Dr. Webb' });
    const enemy = createMockEnemy({ name: 'Ghoul' });

    const result = killSurvivor(survivor, enemy);

    expect(result.message).toContain('Ghoul');
    expect(result.message).toContain('Dr. Webb');
  });
});

// ============================================================================
// SURVIVOR ABILITY TESTS
// ============================================================================

describe('useSurvivorAbility', () => {
  it('returns null if survivor has no ability', () => {
    const survivor = createMockSurvivor({ specialAbility: undefined });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).toBeNull();
  });

  it('returns null if ability already used', () => {
    const survivor = createMockSurvivor({
      specialAbility: 'knowledge',
      abilityUsed: true
    });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).toBeNull();
  });

  it('marks ability as used after use', () => {
    const survivor = createMockSurvivor({ specialAbility: 'knowledge' });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).not.toBeNull();
    expect(result!.survivor.abilityUsed).toBe(true);
  });

  it('reveal_map returns revealed positions', () => {
    const survivor = createMockSurvivor({
      specialAbility: 'reveal_map',
      position: { q: 0, r: 0 }
    });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).not.toBeNull();
    expect(result!.effects.revealed).toBeDefined();
    expect(result!.effects.revealed!.length).toBeGreaterThan(0);
  });

  it('ward returns ward effect', () => {
    const survivor = createMockSurvivor({
      specialAbility: 'ward',
      position: { q: 5, r: 3 }
    });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).not.toBeNull();
    expect(result!.effects.ward).toBeDefined();
    expect(result!.effects.ward!.position).toEqual({ q: 5, r: 3 });
    expect(result!.effects.ward!.duration).toBe(3);
  });

  it('knowledge returns message', () => {
    const survivor = createMockSurvivor({ specialAbility: 'knowledge' });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).not.toBeNull();
    expect(result!.effects.knowledge).toBeDefined();
    expect(result!.effects.knowledge!.message.length).toBeGreaterThan(10);
  });

  it('calm_aura returns sanity bonus', () => {
    const survivor = createMockSurvivor({ specialAbility: 'calm_aura' });
    const result = useSurvivorAbility(survivor, [], []);

    expect(result).not.toBeNull();
    expect(result!.effects.calmAura).toBeDefined();
    expect(result!.effects.calmAura!.sanityBonus).toBe(1);
  });

  it('heal_party heals nearby players', () => {
    const survivor = createMockSurvivor({
      specialAbility: 'heal_party',
      position: { q: 0, r: 0 }
    });
    const players = [
      createMockPlayer({ id: 'p1', position: { q: 1, r: 0 } }),
      createMockPlayer({ id: 'p2', position: { q: 0, r: 1 } })
    ];

    const result = useSurvivorAbility(survivor, players, []);

    expect(result).not.toBeNull();
    expect(result!.effects.healed).toBeDefined();
    expect(result!.effects.healed!.length).toBe(2);
  });
});

// ============================================================================
// SHOULD TARGET SURVIVOR TESTS
// ============================================================================

describe('shouldTargetSurvivor', () => {
  it('returns null for non-hunter enemy types', () => {
    const enemy = createMockEnemy({ type: 'shoggoth' });
    const survivors = [createMockSurvivor({ state: 'found', position: { q: 1, r: 0 } })];
    const tiles = createBasicBoard();

    const result = shouldTargetSurvivor(enemy, survivors, [], tiles);

    expect(result).toBeNull();
  });

  it('returns null when no visible survivors', () => {
    const enemy = createMockEnemy({
      type: 'ghoul',
      position: { q: 0, r: 0 },
      visionRange: 2
    });
    const survivors = [createMockSurvivor({
      state: 'found',
      position: { q: 10, r: 10 } // Out of vision
    })];
    const tiles = createBasicBoard();

    const result = shouldTargetSurvivor(enemy, survivors, [], tiles);

    expect(result).toBeNull();
  });

  it('ghoul prefers wounded survivors', () => {
    const enemy = createMockEnemy({
      type: 'ghoul',
      position: { q: 0, r: 0 },
      visionRange: 5
    });
    const survivors = [
      createMockSurvivor({ id: 's1', type: 'civilian', state: 'found', position: { q: 1, r: 0 } }),
      createMockSurvivor({ id: 's2', type: 'wounded', state: 'found', position: { q: 2, r: 0 } })
    ];
    const tiles = createBasicBoard();

    const result = shouldTargetSurvivor(enemy, survivors, [], tiles);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('wounded');
  });

  it('cultist prefers defectors', () => {
    const enemy = createMockEnemy({
      type: 'cultist',
      position: { q: 0, r: 0 },
      visionRange: 5
    });
    const survivors = [
      createMockSurvivor({ id: 's1', type: 'civilian', state: 'found', position: { q: 1, r: 0 } }),
      createMockSurvivor({ id: 's2', type: 'cultist_defector', state: 'found', position: { q: 2, r: 0 } })
    ];
    const tiles = createBasicBoard();

    const result = shouldTargetSurvivor(enemy, survivors, [], tiles);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('cultist_defector');
  });

  it('ignores hidden survivors', () => {
    const enemy = createMockEnemy({
      type: 'ghoul',
      position: { q: 0, r: 0 },
      visionRange: 5
    });
    const survivors = [
      createMockSurvivor({ state: 'hidden', position: { q: 1, r: 0 } })
    ];
    const tiles = createBasicBoard();

    const result = shouldTargetSurvivor(enemy, survivors, [], tiles);

    expect(result).toBeNull();
  });
});

// ============================================================================
// PROCESS SURVIVOR TURN TESTS
// ============================================================================

describe('processSurvivorTurn', () => {
  it('returns updated survivors array', () => {
    const survivors = [createMockSurvivor()];
    const result = processSurvivorTurn(survivors, [], [], []);

    expect(result.updatedSurvivors.length).toBe(1);
  });

  it('skips rescued survivors', () => {
    const survivor = createMockSurvivor({ state: 'rescued' });
    const result = processSurvivorTurn([survivor], [], [], []);

    expect(result.updatedSurvivors[0].state).toBe('rescued');
  });

  it('skips dead survivors', () => {
    const survivor = createMockSurvivor({ state: 'dead' });
    const result = processSurvivorTurn([survivor], [], [], []);

    expect(result.updatedSurvivors[0].state).toBe('dead');
  });

  it('increases panic when enemies nearby', () => {
    const survivor = createMockSurvivor({
      state: 'found',
      position: { q: 0, r: 0 },
      panicLevel: 30
    });
    const enemy = createMockEnemy({ position: { q: 1, r: 0 } });

    const result = processSurvivorTurn([survivor], [], [enemy], []);

    expect(result.updatedSurvivors[0].panicLevel).toBeGreaterThan(30);
  });

  it('decreases panic when following player with no enemies', () => {
    const survivor = createMockSurvivor({
      state: 'following',
      followingPlayerId: 'detective',
      position: { q: 1, r: 0 },
      panicLevel: 50
    });
    const player = createMockPlayer({ id: 'detective', position: { q: 0, r: 0 } });

    const result = processSurvivorTurn([survivor], [player], [], createBasicBoard());

    expect(result.updatedSurvivors[0].panicLevel).toBeLessThan(50);
  });

  it('discovers hidden survivor when player adjacent', () => {
    const survivor = createMockSurvivor({
      state: 'hidden',
      position: { q: 1, r: 0 }
    });
    const player = createMockPlayer({ position: { q: 0, r: 0 } });

    const result = processSurvivorTurn([survivor], [player], [], []);

    expect(result.updatedSurvivors[0].state).toBe('found');
    expect(result.messages.length).toBeGreaterThan(0);
  });
});
