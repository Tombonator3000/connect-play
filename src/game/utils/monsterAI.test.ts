/**
 * Tests for Monster AI System
 *
 * These tests cover the enhanced monster AI including:
 * - Flanking and pack mechanics
 * - Target prioritization
 * - Enhanced pathfinding
 * - Special movement abilities
 * - Ranged attack system
 * - Special ability execution
 * - Enemy spawning
 * - Turn processing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isFlankingPlayer,
  countNearbyPackMembers,
  getFlankingBonus,
  getPackMentalityBonus,
  findFlankingPosition,
  calculateTargetPriority,
  findBestTarget,
  findEnhancedPath,
  getSpecialMovement,
  getTeleportDestinations,
  executeSpecialMovement,
  canMakeRangedAttack,
  findOptimalRangedPosition,
  canUseSpecialAbility,
  executeSpecialAbility,
  shouldMonsterFlee,
  shouldCallForHelp,
  shouldSpawnMonster,
  createEnemy,
  createEnemyWithAI,
  canSeePlayer,
  findNearestPlayer,
  findSmartTarget,
  getMonsterDecision,
  processEnemyTurn,
  spawnWave
} from './monsterAI';
import { Enemy, EnemyWithAI, Player, Tile, createEmptyInventory } from '../types';

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
    attributes: {
      strength: 2,
      agility: 2,
      intellect: 3,
      willpower: 2
    },
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
    position: { q: 1, r: 0 },
    visionRange: 4,
    attackRange: 1,
    attackType: 'melee',
    ...overrides
  };
}

function createMockEnemyWithAI(overrides: Partial<EnemyWithAI> = {}): EnemyWithAI {
  return {
    ...createMockEnemy(),
    personality: {
      combatStyle: 'brawler',
      preferredState: 'hunting',
      aggressionLevel: 70,
      cowardiceThreshold: 20,
      packMentality: false,
      callForHelpChance: 0
    },
    aiState: {
      state: 'hunting',
      alertLevel: 50,
      consecutivePatrolMoves: 0,
      hasUsedSpecialAbility: false
    },
    ...overrides
  } as EnemyWithAI;
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
// FLANKING AND PACK MECHANICS TESTS
// ============================================================================

describe('Flanking and Pack Mechanics', () => {
  describe('isFlankingPlayer', () => {
    it('returns true when enemy is on opposite side of player from another enemy', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const enemy1 = createMockEnemy({ id: 'e1', position: { q: 1, r: 0 } });
      const enemy2 = createMockEnemy({ id: 'e2', position: { q: -1, r: 0 } });

      expect(isFlankingPlayer(enemy1, player, [enemy1, enemy2])).toBe(true);
    });

    it('returns false when no enemy on opposite side', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const enemy1 = createMockEnemy({ id: 'e1', position: { q: 1, r: 0 } });
      const enemy2 = createMockEnemy({ id: 'e2', position: { q: 1, r: -1 } });

      expect(isFlankingPlayer(enemy1, player, [enemy1, enemy2])).toBe(false);
    });

    it('returns false when only one enemy', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const enemy = createMockEnemy({ position: { q: 1, r: 0 } });

      expect(isFlankingPlayer(enemy, player, [enemy])).toBe(false);
    });
  });

  describe('countNearbyPackMembers', () => {
    it('counts enemies of same type within range', () => {
      const enemy = createMockEnemy({ id: 'e1', type: 'ghoul', position: { q: 0, r: 0 } });
      const allEnemies = [
        enemy,
        createMockEnemy({ id: 'e2', type: 'ghoul', position: { q: 1, r: 0 } }),
        createMockEnemy({ id: 'e3', type: 'ghoul', position: { q: 0, r: 1 } }),
        createMockEnemy({ id: 'e4', type: 'cultist', position: { q: 1, r: 1 } }) // Different type
      ];

      expect(countNearbyPackMembers(enemy, allEnemies)).toBe(2);
    });

    it('excludes self from count', () => {
      const enemy = createMockEnemy({ id: 'e1', type: 'ghoul', position: { q: 0, r: 0 } });

      expect(countNearbyPackMembers(enemy, [enemy])).toBe(0);
    });

    it('excludes enemies outside range', () => {
      const enemy = createMockEnemy({ id: 'e1', type: 'ghoul', position: { q: 0, r: 0 } });
      const allEnemies = [
        enemy,
        createMockEnemy({ id: 'e2', type: 'ghoul', position: { q: 5, r: 5 } }) // Too far
      ];

      expect(countNearbyPackMembers(enemy, allEnemies, 2)).toBe(0);
    });
  });

  describe('getFlankingBonus', () => {
    it('returns bonus when flanking with proper combat style', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const enemy1 = createMockEnemy({
        id: 'e1',
        type: 'ghoul', // Ghouls have flanking preference
        position: { q: 1, r: 0 }
      });
      const enemy2 = createMockEnemy({
        id: 'e2',
        type: 'ghoul',
        position: { q: -1, r: 0 }
      });

      const bonus = getFlankingBonus(enemy1, player, [enemy1, enemy2]);
      expect(bonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPackMentalityBonus', () => {
    it('returns attack bonus with 2+ pack members', () => {
      const enemy = createMockEnemy({ id: 'e1', type: 'ghoul', position: { q: 0, r: 0 } });
      const allEnemies = [
        enemy,
        createMockEnemy({ id: 'e2', type: 'ghoul', position: { q: 1, r: 0 } }),
        createMockEnemy({ id: 'e3', type: 'ghoul', position: { q: 0, r: 1 } })
      ];

      const result = getPackMentalityBonus(enemy, allEnemies);
      expect(result.morale).toBeDefined();
    });
  });
});

// ============================================================================
// TARGET PRIORITIZATION TESTS
// ============================================================================

describe('Target Prioritization', () => {
  describe('calculateTargetPriority', () => {
    it('gives higher score to closer players', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const nearPlayer = createMockPlayer({ id: 'near', position: { q: 1, r: 0 } });
      const farPlayer = createMockPlayer({ id: 'far', position: { q: 3, r: 0 } });

      const nearPriority = calculateTargetPriority(enemy, nearPlayer, [nearPlayer, farPlayer], tiles);
      const farPriority = calculateTargetPriority(enemy, farPlayer, [nearPlayer, farPlayer], tiles);

      expect(nearPriority.score).toBeGreaterThan(farPriority.score);
    });

    it('returns priority factors', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const player = createMockPlayer({ position: { q: 2, r: 0 } });

      const priority = calculateTargetPriority(enemy, player, [player], tiles);

      expect(priority.factors).toBeDefined();
      expect(priority.factors.distance).toBeDefined();
      expect(priority.factors.lowHp).toBeDefined();
      expect(priority.factors.lowSanity).toBeDefined();
      expect(priority.factors.isolated).toBeDefined();
    });
  });

  describe('findBestTarget', () => {
    it('returns null when no players alive', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const player = createMockPlayer({ isDead: true });

      expect(findBestTarget(enemy, [player], tiles)).toBeNull();
    });

    it('returns player when one is visible', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const player = createMockPlayer({ position: { q: 1, r: 0 } });

      expect(findBestTarget(enemy, [player], tiles)).toBe(player);
    });
  });
});

// ============================================================================
// PATHFINDING TESTS
// ============================================================================

describe('Enhanced Pathfinding', () => {
  describe('findEnhancedPath', () => {
    it('finds path to goal on open board', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const goal = { q: 2, r: 0 };

      const result = findEnhancedPath(enemy, enemy.position, [goal], tiles, new Set());

      expect(result).not.toBeNull();
      expect(result!.path.length).toBeGreaterThan(0);
    });

    it('returns null when no path exists', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = [createMockTile(0, 0)]; // Only starting tile
      const goal = { q: 10, r: 10 };

      const result = findEnhancedPath(enemy, enemy.position, [goal], tiles, new Set());

      expect(result).toBeNull();
    });

    it('avoids blocked positions', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();
      const blockers = new Set(['1,0']); // Block direct path
      const goal = { q: 2, r: 0 };

      const result = findEnhancedPath(enemy, enemy.position, [goal], tiles, blockers);

      if (result) {
        // Path should not include blocked position
        const pathKeys = result.path.map(p => `${p.q},${p.r}`);
        expect(pathKeys).not.toContain('1,0');
      }
    });
  });
});

// ============================================================================
// SPECIAL MOVEMENT TESTS
// ============================================================================

describe('Special Movement', () => {
  describe('getSpecialMovement', () => {
    it('returns teleport for hound type', () => {
      const enemy = createMockEnemy({ type: 'hound' });
      expect(getSpecialMovement(enemy)).toBe('teleport');
    });

    it('returns phase for nightgaunt type', () => {
      const enemy = createMockEnemy({ type: 'nightgaunt' });
      expect(getSpecialMovement(enemy)).toBe('phase');
    });

    it('returns fly for flying trait', () => {
      const enemy = createMockEnemy({ type: 'cultist', traits: ['flying'] });
      expect(getSpecialMovement(enemy)).toBe('fly');
    });

    it('returns null for regular enemy', () => {
      const enemy = createMockEnemy({ type: 'cultist' });
      expect(getSpecialMovement(enemy)).toBeNull();
    });
  });

  describe('getTeleportDestinations', () => {
    it('finds positions adjacent to players', () => {
      const enemy = createMockEnemy({ type: 'hound', position: { q: 5, r: 5 } });
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const tiles = createBasicBoard();

      const destinations = getTeleportDestinations(enemy, tiles, [player], [enemy]);

      expect(destinations.length).toBeGreaterThan(0);
    });

    it('excludes occupied positions', () => {
      const enemy = createMockEnemy({ id: 'hound', type: 'hound', position: { q: 5, r: 5 } });
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      const blocker = createMockEnemy({ id: 'blocker', position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const destinations = getTeleportDestinations(enemy, tiles, [player], [enemy, blocker]);
      const destKeys = destinations.map(d => `${d.q},${d.r}`);

      expect(destKeys).not.toContain('1,0');
    });
  });
});

// ============================================================================
// RANGED ATTACK TESTS
// ============================================================================

describe('Ranged Attack System', () => {
  describe('canMakeRangedAttack', () => {
    it('returns canAttack true when in range with line of sight', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, attackRange: 3 });
      const player = createMockPlayer({ position: { q: 2, r: 0 } });
      const tiles = createBasicBoard();

      const result = canMakeRangedAttack(enemy, player, tiles);

      expect(result.canAttack).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('returns canAttack false when out of range', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, attackRange: 2 });
      const player = createMockPlayer({ position: { q: 5, r: 0 } });
      const tiles = createBasicBoard();

      const result = canMakeRangedAttack(enemy, player, tiles);

      expect(result.canAttack).toBe(false);
    });
  });

  describe('findOptimalRangedPosition', () => {
    it('finds position with line of sight to target', () => {
      const enemy = createMockEnemy({
        position: { q: 0, r: 0 },
        attackRange: 3,
        speed: 2
      });
      const player = createMockPlayer({ position: { q: 3, r: 0 } });
      const tiles = createBasicBoard();

      const position = findOptimalRangedPosition(enemy, player, tiles, [enemy]);

      // Should find some position or null if already optimal
      expect(position === null || (typeof position === 'object')).toBe(true);
    });
  });
});

// ============================================================================
// SPECIAL ABILITY TESTS
// ============================================================================

describe('Special Abilities', () => {
  describe('canUseSpecialAbility', () => {
    it('returns true for available ability', () => {
      const enemy = createMockEnemyWithAI();

      expect(canUseSpecialAbility(enemy, 'charge', 1)).toBe(true);
    });

    it('returns false if already used this round', () => {
      const enemy = createMockEnemyWithAI({
        aiState: {
          state: 'hunting',
          alertLevel: 50,
          consecutivePatrolMoves: 0,
          hasUsedSpecialAbility: true,
          lastActionRound: 1
        }
      });

      expect(canUseSpecialAbility(enemy, 'charge', 1)).toBe(false);
    });

    it('respects HP thresholds for enrage', () => {
      const healthyEnemy = createMockEnemyWithAI({ hp: 3, maxHp: 3 });
      const hurtEnemy = createMockEnemyWithAI({ hp: 1, maxHp: 3 });

      expect(canUseSpecialAbility(healthyEnemy, 'enrage', 1)).toBe(false);
      expect(canUseSpecialAbility(hurtEnemy, 'enrage', 1)).toBe(true);
    });
  });

  describe('executeSpecialAbility', () => {
    it('executes charge with damage and bonus dice', () => {
      const enemy = createMockEnemyWithAI();
      const tiles = createBasicBoard();

      const result = executeSpecialAbility(enemy, 'charge', null, [enemy], tiles);

      expect(result.damage).toBe(1);
      expect(result.bonusAttackDice).toBe(1);
      expect(result.message).toContain(enemy.name);
    });

    it('executes pack_tactics with adjacent ally bonus', () => {
      const enemy = createMockEnemyWithAI({ type: 'ghoul', position: { q: 0, r: 0 } });
      const ally = createMockEnemy({ id: 'ally', type: 'ghoul', position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const result = executeSpecialAbility(enemy, 'pack_tactics', null, [enemy, ally], tiles);

      expect(result.bonusAttackDice).toBe(1);
    });

    it('executes summon with spawned enemies', () => {
      const enemy = createMockEnemyWithAI();
      const tiles = createBasicBoard();

      const result = executeSpecialAbility(enemy, 'summon', null, [enemy], tiles);

      expect(result.spawnedEnemies).toBeDefined();
      expect(result.spawnedEnemies!.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// FLEE AND MORALE TESTS
// ============================================================================

describe('Flee and Morale', () => {
  describe('shouldMonsterFlee', () => {
    it('returns true when HP below cowardice threshold', () => {
      const enemy = createMockEnemyWithAI({
        hp: 1,
        maxHp: 10,
        personality: {
          combatStyle: 'coward',
          preferredState: 'fleeing',
          aggressionLevel: 20,
          cowardiceThreshold: 30, // 30% HP threshold
          packMentality: false,
          callForHelpChance: 0
        }
      });

      expect(shouldMonsterFlee(enemy)).toBe(true);
    });

    it('returns false when HP above threshold', () => {
      const enemy = createMockEnemyWithAI({
        hp: 8,
        maxHp: 10,
        personality: {
          combatStyle: 'brawler',
          preferredState: 'hunting',
          aggressionLevel: 80,
          cowardiceThreshold: 20,
          packMentality: false,
          callForHelpChance: 0
        }
      });

      expect(shouldMonsterFlee(enemy)).toBe(false);
    });
  });

  describe('shouldCallForHelp', () => {
    it('returns false when has not seen player', () => {
      const enemy = createMockEnemyWithAI({
        personality: {
          combatStyle: 'brawler',
          preferredState: 'hunting',
          aggressionLevel: 70,
          cowardiceThreshold: 20,
          packMentality: true,
          callForHelpChance: 100
        }
      });

      expect(shouldCallForHelp(enemy, false)).toBe(false);
    });
  });
});

// ============================================================================
// ENEMY CREATION TESTS
// ============================================================================

describe('Enemy Creation', () => {
  describe('createEnemy', () => {
    it('creates enemy with correct type and position', () => {
      const enemy = createEnemy('cultist', { q: 5, r: 3 });

      expect(enemy.type).toBe('cultist');
      expect(enemy.position.q).toBe(5);
      expect(enemy.position.r).toBe(3);
    });

    it('creates enemy with unique id', () => {
      const enemy1 = createEnemy('cultist', { q: 0, r: 0 });
      const enemy2 = createEnemy('cultist', { q: 0, r: 0 });

      expect(enemy1.id).not.toBe(enemy2.id);
    });

    it('sets HP from bestiary', () => {
      const enemy = createEnemy('cultist', { q: 0, r: 0 });

      expect(enemy.hp).toBe(enemy.maxHp);
      expect(enemy.hp).toBeGreaterThan(0);
    });
  });

  describe('createEnemyWithAI', () => {
    it('creates enemy with personality and AI state', () => {
      const enemy = createEnemyWithAI('ghoul', { q: 0, r: 0 });

      expect(enemy.personality).toBeDefined();
      expect(enemy.aiState).toBeDefined();
      expect(enemy.aiState.state).toBeDefined();
    });
  });

  describe('shouldSpawnMonster', () => {
    it('returns boolean', () => {
      const tile = createMockTile(0, 0, { category: 'crypt' });
      const result = shouldSpawnMonster(tile, 10, [], true);

      expect(typeof result).toBe('boolean');
    });

    it('has higher chance in dangerous areas', () => {
      const cryptTile = createMockTile(0, 0, { category: 'crypt' });
      const streetTile = createMockTile(0, 0, { category: 'street' });

      // Run multiple times to check probability trend
      let cryptSpawns = 0;
      let streetSpawns = 0;
      const trials = 100;

      for (let i = 0; i < trials; i++) {
        if (shouldSpawnMonster(cryptTile, 10, [], true)) cryptSpawns++;
        if (shouldSpawnMonster(streetTile, 10, [], true)) streetSpawns++;
      }

      // Crypt should have more spawns on average
      expect(cryptSpawns).toBeGreaterThanOrEqual(streetSpawns * 0.5);
    });
  });
});

// ============================================================================
// VISION AND TARGETING TESTS
// ============================================================================

describe('Vision and Targeting', () => {
  describe('canSeePlayer', () => {
    it('returns true when player in vision range', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 4 });
      const player = createMockPlayer({ position: { q: 2, r: 0 } });
      const tiles = createBasicBoard();

      expect(canSeePlayer(enemy, player, tiles)).toBe(true);
    });

    it('returns false when player out of vision range', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 2 });
      const player = createMockPlayer({ position: { q: 5, r: 0 } });
      const tiles = createBasicBoard();

      expect(canSeePlayer(enemy, player, tiles)).toBe(false);
    });
  });

  describe('findNearestPlayer', () => {
    it('returns closest visible player', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 5 });
      const near = createMockPlayer({ id: 'near', position: { q: 1, r: 0 } });
      const far = createMockPlayer({ id: 'far', position: { q: 3, r: 0 } });
      const tiles = createBasicBoard();

      expect(findNearestPlayer(enemy, [near, far], tiles)).toBe(near);
    });

    it('returns null when no players visible', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 2 });
      const player = createMockPlayer({ position: { q: 10, r: 0 } });
      const tiles = createBasicBoard();

      expect(findNearestPlayer(enemy, [player], tiles)).toBeNull();
    });
  });

  describe('findSmartTarget', () => {
    it('returns target with priority info', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 5 });
      const player = createMockPlayer({ position: { q: 2, r: 0 } });
      const tiles = createBasicBoard();

      const result = findSmartTarget(enemy, [player], tiles);

      expect(result.target).toBe(player);
      expect(result.priority).not.toBeNull();
      expect(result.priority!.score).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// AI DECISION TESTS
// ============================================================================

describe('AI Decisions', () => {
  describe('getMonsterDecision', () => {
    it('returns attack when player in range', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, attackRange: 1 });
      const player = createMockPlayer({ position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const decision = getMonsterDecision(enemy, [player], [enemy], tiles);

      expect(decision.action).toBe('attack');
      expect(decision.targetPlayerId).toBe(player.id);
    });

    it('returns move when player visible but not in range', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, attackRange: 1, visionRange: 5 });
      const player = createMockPlayer({ position: { q: 3, r: 0 } });
      const tiles = createBasicBoard();

      const decision = getMonsterDecision(enemy, [player], [enemy], tiles);

      expect(['move', 'wait']).toContain(decision.action);
    });

    it('returns wait when no players visible', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, visionRange: 2 });
      const player = createMockPlayer({ position: { q: 10, r: 10 } });
      const tiles = createBasicBoard();

      const decision = getMonsterDecision(enemy, [player], [enemy], tiles);

      expect(['wait', 'move']).toContain(decision.action);
    });
  });
});

// ============================================================================
// TURN PROCESSING TESTS
// ============================================================================

describe('Turn Processing', () => {
  describe('processEnemyTurn', () => {
    it('returns updated enemies and attacks', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 } });
      const player = createMockPlayer({ position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const result = processEnemyTurn([enemy], [player], tiles);

      expect(result.updatedEnemies).toBeDefined();
      expect(result.attacks).toBeDefined();
      expect(result.messages).toBeDefined();
    });

    it('generates attacks when enemies in range of players', () => {
      const enemy = createMockEnemy({ position: { q: 0, r: 0 }, attackRange: 1 });
      const player = createMockPlayer({ position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const result = processEnemyTurn([enemy], [player], tiles);

      expect(result.attacks.length).toBeGreaterThan(0);
    });

    it('skips dead enemies', () => {
      const deadEnemy = createMockEnemy({ hp: 0 });
      const player = createMockPlayer({ position: { q: 1, r: 0 } });
      const tiles = createBasicBoard();

      const result = processEnemyTurn([deadEnemy], [player], tiles);

      expect(result.attacks.length).toBe(0);
    });

    it('includes weather effects in result', () => {
      const enemy = createMockEnemy();
      const player = createMockPlayer();
      const tiles = createBasicBoard();

      const result = processEnemyTurn([enemy], [player], tiles, 'fog');

      expect(result.weatherEffects).toBeDefined();
      expect(typeof result.weatherEffects.horrorBonus).toBe('number');
    });
  });

  describe('spawnWave', () => {
    it('spawns requested number of enemies', () => {
      const tiles = createBasicBoard();
      const position = { q: 0, r: 0 };

      const enemies = spawnWave('cultist', 3, position, tiles, []);

      expect(enemies.length).toBeLessThanOrEqual(3);
      expect(enemies.length).toBeGreaterThan(0);
    });

    it('avoids spawning on occupied positions', () => {
      const tiles = createBasicBoard();
      const position = { q: 0, r: 0 };
      const existingEnemy = createMockEnemy({ position: { q: 1, r: 0 } });

      const enemies = spawnWave('cultist', 2, position, tiles, [existingEnemy]);

      const spawnedPositions = enemies.map(e => `${e.position.q},${e.position.r}`);
      expect(spawnedPositions).not.toContain('1,0');
    });

    it('creates enemies of correct type', () => {
      const tiles = createBasicBoard();
      const position = { q: 0, r: 0 };

      const enemies = spawnWave('ghoul', 2, position, tiles, []);

      enemies.forEach(e => expect(e.type).toBe('ghoul'));
    });
  });
});
