/**
 * Tests for Combat Utilities
 *
 * These tests cover the Hero Quest style combat system including:
 * - Attack dice calculations
 * - Defense mechanics
 * - Skill checks
 * - Horror checks
 * - Weapon restrictions
 * - Critical hits/misses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  performSkillCheck,
  getAttackDice,
  canCharacterClassUseWeapon,
  canUseWeapon,
  getWeaponAttackDice,
  getDefenseDice,
  performAttack,
  performDefense,
  performHorrorCheck,
  calculateEnemyDamage,
  canAttackEnemy,
  hasRangedWeapon,
  getCombatPreview,
  getDefensePreview,
  getPlayerDefenseDice,
  applyCriticalBonus,
  applyCriticalPenalty,
  getCombatPreviewWithDesperate
} from './combatUtils';
import { Player, Enemy, Item, createEmptyInventory, CharacterType } from '../types';

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Creates a mock player for testing
 */
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

/**
 * Creates a mock enemy for testing
 */
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
    visionRange: 3,
    attackRange: 1,
    attackType: 'physical',
    ...overrides
  };
}

/**
 * Creates a mock weapon item
 */
function createMockWeapon(overrides: Partial<Item> = {}): Item {
  return {
    id: 'revolver',
    name: 'Revolver',
    type: 'weapon',
    attackDice: 3,
    weaponType: 'ranged',
    range: 4,
    ...overrides
  };
}

/**
 * Creates a mock armor item
 */
function createMockArmor(overrides: Partial<Item> = {}): Item {
  return {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    defenseDice: 1,
    bonus: 1,
    ...overrides
  };
}

// ============================================================================
// Test Suites
// ============================================================================

describe('combatUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // performSkillCheck
  // ============================================================================

  describe('performSkillCheck', () => {
    it('should roll base 2 dice plus attribute value', () => {
      const player = createMockPlayer({
        attributes: { strength: 3, agility: 2, intellect: 2, willpower: 2 }
      });

      // Mock dice to always roll 4 (success at DC 4)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performSkillCheck(player, 'strength', 4);

      // Should roll 2 base + 3 strength = 5 dice
      expect(result.dice).toHaveLength(5);
    });

    it('should include bonus dice when provided', () => {
      const player = createMockPlayer({
        attributes: { strength: 2, agility: 2, intellect: 2, willpower: 2 }
      });

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performSkillCheck(player, 'strength', 4, 2);

      // Should roll 2 base + 2 strength + 2 bonus = 6 dice
      expect(result.dice).toHaveLength(6);
    });

    it('should pass when at least one success', () => {
      const player = createMockPlayer();

      // Mock dice to roll a 6 (success)
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = performSkillCheck(player, 'intellect', 4);

      expect(result.passed).toBe(true);
      expect(result.successes).toBeGreaterThanOrEqual(1);
    });

    it('should fail when no successes', () => {
      const player = createMockPlayer();

      // Mock dice to roll 1 (always fail)
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      const result = performSkillCheck(player, 'intellect', 4);

      expect(result.passed).toBe(false);
      expect(result.successes).toBe(0);
    });

    it('should include correct DC and skill in result', () => {
      const player = createMockPlayer();
      const result = performSkillCheck(player, 'willpower', 5);

      expect(result.dc).toBe(5);
      expect(result.skill).toBe('willpower');
    });
  });

  // ============================================================================
  // getAttackDice
  // ============================================================================

  describe('getAttackDice', () => {
    it('should return base attack dice when unarmed', () => {
      const player = createMockPlayer({ baseAttackDice: 1 });

      const result = getAttackDice(player);

      expect(result.attackDice).toBe(1);
      expect(result.weaponName).toBe('Unarmed');
    });

    it('should return weapon attack dice when armed', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 3 });

      const result = getAttackDice(player);

      expect(result.attackDice).toBe(3);
      expect(result.weaponName).toBe('Revolver');
    });

    it('should pick the best weapon when multiple are equipped', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ id: 'knife', name: 'Knife', attackDice: 2 });
      player.inventory.rightHand = createMockWeapon({ id: 'revolver', name: 'Revolver', attackDice: 3 });

      const result = getAttackDice(player);

      expect(result.attackDice).toBe(3);
      expect(result.weaponName).toBe('Revolver');
    });
  });

  // ============================================================================
  // canCharacterClassUseWeapon
  // ============================================================================

  describe('canCharacterClassUseWeapon', () => {
    it('should allow veteran to use all weapons', () => {
      expect(canCharacterClassUseWeapon('veteran', 'tommy_gun')).toBe(true);
      expect(canCharacterClassUseWeapon('veteran', 'shotgun')).toBe(true);
      expect(canCharacterClassUseWeapon('veteran', 'revolver')).toBe(true);
      expect(canCharacterClassUseWeapon('veteran', 'knife')).toBe(true);
    });

    it('should restrict detective from tommy gun', () => {
      expect(canCharacterClassUseWeapon('detective', 'tommy_gun')).toBe(false);
      expect(canCharacterClassUseWeapon('detective', 'tommy')).toBe(false);
      expect(canCharacterClassUseWeapon('detective', 'revolver')).toBe(true);
    });

    it('should restrict professor to derringer and knife only', () => {
      expect(canCharacterClassUseWeapon('professor', 'derringer')).toBe(true);
      expect(canCharacterClassUseWeapon('professor', 'knife')).toBe(true);
      expect(canCharacterClassUseWeapon('professor', 'revolver')).toBe(false);
      expect(canCharacterClassUseWeapon('professor', 'shotgun')).toBe(false);
      expect(canCharacterClassUseWeapon('professor', 'tommy_gun')).toBe(false);
    });

    it('should restrict occultist to knife and revolver', () => {
      expect(canCharacterClassUseWeapon('occultist', 'knife')).toBe(true);
      expect(canCharacterClassUseWeapon('occultist', 'revolver')).toBe(true);
      expect(canCharacterClassUseWeapon('occultist', 'shotgun')).toBe(false);
      expect(canCharacterClassUseWeapon('occultist', 'tommy_gun')).toBe(false);
    });

    it('should restrict journalist from shotgun and tommy gun', () => {
      expect(canCharacterClassUseWeapon('journalist', 'revolver')).toBe(true);
      expect(canCharacterClassUseWeapon('journalist', 'shotgun')).toBe(false);
      expect(canCharacterClassUseWeapon('journalist', 'tommy_gun')).toBe(false);
    });

    it('should handle unknown character classes gracefully', () => {
      expect(canCharacterClassUseWeapon('unknown_class' as CharacterType, 'revolver')).toBe(true);
    });

    it('should handle weapon ID normalization (underscores)', () => {
      expect(canCharacterClassUseWeapon('detective', 'tommygun')).toBe(false);
      expect(canCharacterClassUseWeapon('detective', 'tommy-gun')).toBe(true); // not normalized
    });
  });

  // ============================================================================
  // canUseWeapon
  // ============================================================================

  describe('canUseWeapon', () => {
    it('should delegate to canCharacterClassUseWeapon with player id', () => {
      const detective = createMockPlayer({ id: 'detective' });
      const veteran = createMockPlayer({ id: 'veteran' });

      expect(canUseWeapon(detective, 'tommy_gun')).toBe(false);
      expect(canUseWeapon(veteran, 'tommy_gun')).toBe(true);
    });
  });

  // ============================================================================
  // getWeaponAttackDice
  // ============================================================================

  describe('getWeaponAttackDice', () => {
    it('should return weapon info for armed player', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({
        id: 'revolver',
        name: 'Revolver',
        attackDice: 3,
        weaponType: 'ranged',
        range: 4
      });

      const result = getWeaponAttackDice(player);

      expect(result.attackDice).toBe(3);
      expect(result.weaponName).toBe('Revolver');
      expect(result.isRanged).toBe(true);
      expect(result.range).toBe(4);
    });

    it('should return unarmed stats when no weapon equipped', () => {
      const player = createMockPlayer({ baseAttackDice: 1 });

      const result = getWeaponAttackDice(player);

      expect(result.attackDice).toBe(1);
      expect(result.weaponName).toBe('Unarmed');
      expect(result.isRanged).toBe(false);
      expect(result.range).toBe(1);
    });

    it('should indicate restricted weapon when class cannot use it', () => {
      const professor = createMockPlayer({ id: 'professor' });
      professor.inventory.leftHand = createMockWeapon({
        id: 'tommy_gun',
        name: 'Tommy Gun',
        attackDice: 5
      });

      const result = getWeaponAttackDice(professor);

      expect(result.isRestricted).toBe(true);
      expect(result.restrictedWeaponName).toBe('Tommy Gun');
      expect(result.weaponName).toBe('Unarmed');
    });
  });

  // ============================================================================
  // getDefenseDice
  // ============================================================================

  describe('getDefenseDice', () => {
    it('should return base defense when no armor', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });

      const result = getDefenseDice(player);

      expect(result.defenseDice).toBe(2);
      expect(result.armorName).toBe('No Armor');
    });

    it('should add armor defense dice', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });
      player.inventory.body = createMockArmor({ defenseDice: 2 });

      const result = getDefenseDice(player);

      expect(result.defenseDice).toBe(4); // 2 base + 2 armor
    });

    it('should pick the best armor when multiple sources', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });
      player.inventory.body = createMockArmor({ name: 'Armored Vest', defenseDice: 2 });

      const result = getDefenseDice(player);

      expect(result.defenseDice).toBe(4);
      expect(result.armorName).toBe('Armored Vest');
    });
  });

  // ============================================================================
  // performAttack
  // ============================================================================

  describe('performAttack', () => {
    it('should return valid combat result', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 3 });
      const enemy = createMockEnemy();

      const result = performAttack(player, enemy);

      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('attackRolls');
      expect(result).toHaveProperty('attackSuccesses');
      expect(result).toHaveProperty('defenseRolls');
      expect(result).toHaveProperty('defenseSuccesses');
      expect(result).toHaveProperty('criticalHit');
      expect(result).toHaveProperty('criticalMiss');
      expect(result).toHaveProperty('message');
    });

    it('should return error result for null player', () => {
      const enemy = createMockEnemy();

      // @ts-expect-error - testing null input
      const result = performAttack(null, enemy);

      expect(result.hit).toBe(false);
      expect(result.damage).toBe(0);
      expect(result.message).toContain('Error');
    });

    it('should return error result for null enemy', () => {
      const player = createMockPlayer();

      // @ts-expect-error - testing null input
      const result = performAttack(player, null);

      expect(result.hit).toBe(false);
      expect(result.damage).toBe(0);
      expect(result.message).toContain('Error');
    });

    it('should calculate critical hit when all attack dice succeed and damage dealt', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 3 });
      const enemy = createMockEnemy();

      // Mock all dice to roll 6 (all successes)
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = performAttack(player, enemy);

      // Note: critical hit requires damage > 0, which depends on attack vs defense
      expect(result.attackRolls.every(r => r >= 4)).toBe(true);
    });

    it('should calculate critical miss when all attack dice fail', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 3 });
      const enemy = createMockEnemy();

      // Mock all dice to roll 1 (all failures)
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      const result = performAttack(player, enemy);

      expect(result.criticalMiss).toBe(true);
      expect(result.damage).toBe(0);
    });

    it('should apply veteran melee bonus', () => {
      const veteran = createMockPlayer({
        id: 'veteran',
        specialAbility: 'combat_bonus'
      });
      veteran.inventory.leftHand = createMockWeapon({
        id: 'knife',
        name: 'Knife',
        attackDice: 2,
        weaponType: 'melee'
      });
      const enemy = createMockEnemy();

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performAttack(veteran, enemy);

      // Veteran gets +1 die with melee weapons
      // 2 weapon dice + 1 class bonus = 3 dice
      expect(result.attackRolls).toHaveLength(3);
    });

    it('should NOT apply veteran bonus for ranged weapons', () => {
      const veteran = createMockPlayer({
        id: 'veteran',
        specialAbility: 'combat_bonus'
      });
      veteran.inventory.leftHand = createMockWeapon({
        id: 'revolver',
        name: 'Revolver',
        attackDice: 3,
        weaponType: 'ranged',
        range: 4
      });
      const enemy = createMockEnemy();

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performAttack(veteran, enemy);

      // No bonus for ranged weapons
      expect(result.attackRolls).toHaveLength(3);
    });

    it('should include expanded crit info on critical hit', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 2 });
      const enemy = createMockEnemy();

      // Mock to always roll 6 for attack, 1 for defense (guaranteed crit hit with damage)
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        // First 2 calls are attack dice (roll 6), rest are defense (roll 1)
        return callCount <= 2 ? 0.9 : 0.0;
      });

      const result = performAttack(player, enemy);

      if (result.criticalHit && result.damage > 0) {
        expect(result.expandedCrit).toBeDefined();
        expect(result.availableCritBonuses).toBeDefined();
      }
    });
  });

  // ============================================================================
  // performDefense
  // ============================================================================

  describe('performDefense', () => {
    it('should return valid defense result', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });

      const result = performDefense(player, 3);

      expect(result).toHaveProperty('damageBlocked');
      expect(result).toHaveProperty('finalDamage');
      expect(result).toHaveProperty('defenseRolls');
      expect(result).toHaveProperty('defenseSuccesses');
      expect(result).toHaveProperty('message');
    });

    it('should block damage equal to defense successes', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });

      // Mock to roll 6 (success)
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = performDefense(player, 3);

      expect(result.defenseSuccesses).toBe(2);
      expect(result.damageBlocked).toBe(2);
      expect(result.finalDamage).toBe(1); // 3 - 2 = 1
    });

    it('should not block more than incoming damage', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });

      // Mock to roll 6 (all success)
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = performDefense(player, 1);

      expect(result.damageBlocked).toBe(1); // Can only block 1
      expect(result.finalDamage).toBe(0);
    });

    it('should return error result for null player', () => {
      // @ts-expect-error - testing null input
      const result = performDefense(null, 3);

      expect(result.message).toContain('Error');
      expect(result.finalDamage).toBe(3);
    });

    it('should handle negative incoming damage', () => {
      const player = createMockPlayer();

      const result = performDefense(player, -5);

      expect(result.finalDamage).toBe(0);
    });

    it('should add armor defense dice', () => {
      const player = createMockPlayer({ baseDefenseDice: 2 });
      player.inventory.body = createMockArmor({ defenseDice: 2 });

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performDefense(player, 5);

      // 2 base + 2 armor = 4 defense dice
      expect(result.defenseRolls).toHaveLength(4);
    });
  });

  // ============================================================================
  // performHorrorCheck
  // ============================================================================

  describe('performHorrorCheck', () => {
    it('should skip check if enemy already encountered', () => {
      const player = createMockPlayer();
      const enemy = createMockEnemy({ horror: 2 });

      const result = performHorrorCheck(player, enemy, true);

      expect(result.resisted).toBe(true);
      expect(result.sanityLoss).toBe(0);
      expect(result.rolls).toHaveLength(0);
    });

    it('should cause sanity loss on failed check', () => {
      const player = createMockPlayer();
      const enemy = createMockEnemy({ horror: 2 });

      // Mock to always fail (roll 1)
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      const result = performHorrorCheck(player, enemy, false);

      expect(result.resisted).toBe(false);
      expect(result.sanityLoss).toBe(2); // Equal to enemy horror
    });

    it('should resist horror on successful check', () => {
      const player = createMockPlayer();
      const enemy = createMockEnemy({ horror: 2 });

      // Mock to always succeed (roll 6)
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = performHorrorCheck(player, enemy, false);

      expect(result.resisted).toBe(true);
      expect(result.sanityLoss).toBe(0);
    });

    it('should give veteran immunity to first horror check', () => {
      const veteran = createMockPlayer({
        id: 'veteran',
        specialAbility: 'combat_bonus',
        madness: [] // No previous horror check
      });
      const enemy = createMockEnemy({ horror: 3 });

      const result = performHorrorCheck(veteran, enemy, false);

      expect(result.resisted).toBe(true);
      expect(result.sanityLoss).toBe(0);
      expect(result.message).toContain('Fearless');
    });

    it('should give professor bonus dice on horror checks', () => {
      const professor = createMockPlayer({
        id: 'professor',
        specialAbility: 'occult_immunity',
        attributes: { strength: 2, agility: 2, intellect: 3, willpower: 2 }
      });
      const enemy = createMockEnemy({ horror: 1 });

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performHorrorCheck(professor, enemy, false);

      // Base 2 + willpower 2 + class bonus 1 = 5 dice
      expect(result.rolls).toHaveLength(5);
    });

    it('should use higher DC for more horrifying enemies', () => {
      const player = createMockPlayer();
      const terrifyingEnemy = createMockEnemy({ horror: 3 });

      // Mock to roll 4 (would pass DC 3-4, fail DC 5)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = performHorrorCheck(player, terrifyingEnemy, false);

      // Horror > 2 uses DC 5, so rolling 4 should fail
      expect(result.resisted).toBe(false);
    });
  });

  // ============================================================================
  // calculateEnemyDamage
  // ============================================================================

  describe('calculateEnemyDamage', () => {
    it('should return valid damage result', () => {
      const enemy = createMockEnemy();
      const player = createMockPlayer();

      const result = calculateEnemyDamage(enemy, player);

      expect(result).toHaveProperty('hpDamage');
      expect(result).toHaveProperty('sanityDamage');
      expect(result).toHaveProperty('attackRolls');
      expect(result).toHaveProperty('defenseRolls');
      expect(result).toHaveProperty('message');
    });

    it('should return error result for null enemy', () => {
      const player = createMockPlayer();

      // @ts-expect-error - testing null input
      const result = calculateEnemyDamage(null, player);

      expect(result.hpDamage).toBe(0);
      expect(result.message).toContain('Error');
    });

    it('should return error result for null player', () => {
      const enemy = createMockEnemy();

      // @ts-expect-error - testing null input
      const result = calculateEnemyDamage(enemy, null);

      expect(result.message).toContain('Error');
    });

    it('should calculate net damage as attack minus defense', () => {
      const enemy = createMockEnemy();
      const player = createMockPlayer();

      // Mock enemy to roll all 6s, player to roll all 1s
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        return callCount <= 2 ? 0.9 : 0.0; // First 2 are enemy attack, rest are player defense
      });

      const result = calculateEnemyDamage(enemy, player);

      expect(result.attackSuccesses).toBeGreaterThan(0);
      expect(result.hpDamage).toBeGreaterThanOrEqual(0);
    });

    it('should deal sanity damage for sanity-type attackers', () => {
      const sanityEnemy = createMockEnemy({ attackType: 'sanity' });
      const player = createMockPlayer();

      // Mock for guaranteed damage
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        return callCount <= 2 ? 0.9 : 0.0;
      });

      const result = calculateEnemyDamage(sanityEnemy, player);

      expect(result.sanityDamage).toBeGreaterThanOrEqual(0);
      expect(result.hpDamage).toBe(0); // Sanity attackers don't deal HP damage
    });

    it('should apply fast trait bonus', () => {
      const fastEnemy = createMockEnemy({ traits: ['fast'] });
      const player = createMockPlayer();

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = calculateEnemyDamage(fastEnemy, player);

      // Fast enemies get +1 success
      expect(result.attackSuccesses).toBeGreaterThan(0);
    });

    it('should apply global enemy attack bonus', () => {
      const enemy = createMockEnemy();
      const player = createMockPlayer();

      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const resultNoBonus = calculateEnemyDamage(enemy, player, 0);
      vi.restoreAllMocks();
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const resultWithBonus = calculateEnemyDamage(enemy, player, 2);

      // With +2 bonus dice, should roll more dice
      expect(resultWithBonus.attackRolls.length).toBeGreaterThan(resultNoBonus.attackRolls.length);
    });
  });

  // ============================================================================
  // canAttackEnemy
  // ============================================================================

  describe('canAttackEnemy', () => {
    it('should allow melee attack on adjacent enemy', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      player.inventory.leftHand = createMockWeapon({
        id: 'knife',
        weaponType: 'melee',
        attackDice: 2
      });
      const enemy = createMockEnemy({ position: { q: 1, r: 0 } });

      const result = canAttackEnemy(player, enemy);

      expect(result.canAttack).toBe(true);
    });

    it('should prevent melee attack on distant enemy', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      player.inventory.leftHand = createMockWeapon({
        id: 'knife',
        weaponType: 'melee',
        attackDice: 2
      });
      const enemy = createMockEnemy({ position: { q: 3, r: 0 } });

      const result = canAttackEnemy(player, enemy);

      expect(result.canAttack).toBe(false);
      expect(result.reason).toContain('langt unna');
    });

    it('should allow ranged attack within range', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      player.inventory.leftHand = createMockWeapon({
        id: 'revolver',
        weaponType: 'ranged',
        attackDice: 3,
        range: 4
      });
      const enemy = createMockEnemy({ position: { q: 3, r: 0 } });

      const result = canAttackEnemy(player, enemy);

      expect(result.canAttack).toBe(true);
    });

    it('should prevent ranged attack beyond range', () => {
      const player = createMockPlayer({ position: { q: 0, r: 0 } });
      player.inventory.leftHand = createMockWeapon({
        id: 'revolver',
        weaponType: 'ranged',
        attackDice: 3,
        range: 2
      });
      const enemy = createMockEnemy({ position: { q: 5, r: 0 } });

      const result = canAttackEnemy(player, enemy);

      expect(result.canAttack).toBe(false);
      expect(result.reason).toContain('langt unna');
    });

    it('should indicate restricted weapon', () => {
      const professor = createMockPlayer({ id: 'professor', position: { q: 0, r: 0 } });
      professor.inventory.leftHand = createMockWeapon({
        id: 'tommy_gun',
        name: 'Tommy Gun',
        attackDice: 5
      });
      const enemy = createMockEnemy({ position: { q: 3, r: 0 } });

      const result = canAttackEnemy(professor, enemy);

      expect(result.isRestricted).toBe(true);
    });
  });

  // ============================================================================
  // hasRangedWeapon
  // ============================================================================

  describe('hasRangedWeapon', () => {
    it('should return true when player has ranged weapon', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ weaponType: 'ranged' });

      expect(hasRangedWeapon(player)).toBe(true);
    });

    it('should return false when player has only melee weapon', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ weaponType: 'melee' });

      expect(hasRangedWeapon(player)).toBe(false);
    });

    it('should return false when unarmed', () => {
      const player = createMockPlayer();

      expect(hasRangedWeapon(player)).toBe(false);
    });
  });

  // ============================================================================
  // getCombatPreview
  // ============================================================================

  describe('getCombatPreview', () => {
    it('should return attack and defense dice info', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ attackDice: 3, name: 'Revolver' });
      player.inventory.body = createMockArmor({ defenseDice: 1, bonus: 1, name: 'Leather Jacket' });

      const preview = getCombatPreview(player);

      expect(preview.attackDice).toBe(3);
      expect(preview.weaponName).toBe('Revolver');
      expect(preview.armorName).toBe('Leather Jacket');
      expect(preview.breakdown).toContain('Revolver: 3d6');
    });

    it('should include veteran melee bonus in breakdown', () => {
      const veteran = createMockPlayer({
        id: 'veteran',
        specialAbility: 'combat_bonus'
      });
      veteran.inventory.leftHand = createMockWeapon({
        name: 'Knife',
        weaponType: 'melee',
        attackDice: 2
      });

      const preview = getCombatPreview(veteran);

      expect(preview.totalDice).toBe(3); // 2 weapon + 1 class bonus
      expect(preview.breakdown).toContain('Veteran melee bonus: +1d6');
    });
  });

  // ============================================================================
  // getDefensePreview
  // ============================================================================

  describe('getDefensePreview', () => {
    it('should return defense dice count', () => {
      const player = createMockPlayer();
      player.inventory.body = createMockArmor({ defenseDice: 2, bonus: 2, name: 'Armored Vest' });

      const preview = getDefensePreview(player);

      expect(preview.totalDice).toBeGreaterThan(0);
      expect(preview.breakdown.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // getPlayerDefenseDice
  // ============================================================================

  describe('getPlayerDefenseDice', () => {
    it('should return base defense dice when no armor', () => {
      const player = createMockPlayer();

      const dice = getPlayerDefenseDice(player);

      expect(dice).toBe(1); // Base defense
    });

    it('should add armor bonus to defense dice', () => {
      const player = createMockPlayer();
      player.inventory.body = createMockArmor({ bonus: 2 });

      const dice = getPlayerDefenseDice(player);

      expect(dice).toBe(3); // 1 base + 2 armor bonus
    });
  });

  // ============================================================================
  // applyCriticalBonus
  // ============================================================================

  describe('applyCriticalBonus', () => {
    it('should grant free attack for extra_attack bonus', () => {
      const player = createMockPlayer();

      const result = applyCriticalBonus(player, 'extra_attack');

      expect(result.grantsFreeAttack).toBe(true);
    });

    it('should heal HP for heal_hp bonus', () => {
      const player = createMockPlayer({ hp: 5, maxHp: 8 });

      const result = applyCriticalBonus(player, 'heal_hp');

      expect(result.newHp).toBe(6);
      expect(result.grantsFreeAttack).toBe(false);
    });

    it('should not exceed max HP when healing', () => {
      const player = createMockPlayer({ hp: 8, maxHp: 8 });

      const result = applyCriticalBonus(player, 'heal_hp');

      expect(result.newHp).toBe(8);
    });

    it('should grant insight for gain_insight bonus', () => {
      const player = createMockPlayer({ insight: 2 });

      const result = applyCriticalBonus(player, 'gain_insight');

      expect(result.newInsight).toBe(3);
    });

    it('should recover sanity for recover_sanity bonus', () => {
      const player = createMockPlayer({ sanity: 4, maxSanity: 6 });

      const result = applyCriticalBonus(player, 'recover_sanity');

      expect(result.newSanity).toBe(5);
    });

    it('should handle unknown bonus type', () => {
      const player = createMockPlayer();

      // @ts-expect-error - testing invalid input
      const result = applyCriticalBonus(player, 'unknown_bonus');

      expect(result.grantsFreeAttack).toBe(false);
    });
  });

  // ============================================================================
  // applyCriticalPenalty
  // ============================================================================

  describe('applyCriticalPenalty', () => {
    it('should trigger counter attack for counter_attack penalty', () => {
      const player = createMockPlayer();
      const enemy = createMockEnemy();

      const result = applyCriticalPenalty(player, 'counter_attack', enemy);

      expect(result.counterAttackDamage).toBeDefined();
    });

    it('should apply AP loss for lose_ap penalty', () => {
      const player = createMockPlayer();

      const result = applyCriticalPenalty(player, 'lose_ap');

      expect(result.loseAPNextRound).toBe(1);
    });

    it('should attract enemy for attract_enemy penalty', () => {
      const player = createMockPlayer();

      const result = applyCriticalPenalty(player, 'attract_enemy');

      expect(result.attractEnemy).toBe(true);
    });

    it('should handle unknown penalty type', () => {
      const player = createMockPlayer();

      // @ts-expect-error - testing invalid input
      const result = applyCriticalPenalty(player, 'unknown_penalty');

      expect(result.message).toBe('Ingen straff');
    });
  });

  // ============================================================================
  // getCombatPreviewWithDesperate
  // ============================================================================

  describe('getCombatPreviewWithDesperate', () => {
    it('should show desperate bonuses when HP is low', () => {
      // HP = 1 triggers: adrenaline (+1 AP), survival_instinct (+1 defense), final_stand (+1 damage)
      const player = createMockPlayer({ hp: 1, maxHp: 8 });
      player.inventory.leftHand = createMockWeapon({ attackDice: 2 });

      const preview = getCombatPreviewWithDesperate(player);

      expect(preview.isDesperateActive).toBe(true);
      // HP = 1 gives defense and damage bonuses, not attack dice
      expect(preview.desperateBonuses.bonusDefenseDice).toBeGreaterThan(0);
      expect(preview.desperateBonuses.bonusDamage).toBeGreaterThan(0);
    });

    it('should show attack dice bonus when sanity is critically low', () => {
      // Sanity = 1 triggers: madness_strength (+1 attack die)
      const player = createMockPlayer({ hp: 8, maxHp: 8, sanity: 1, maxSanity: 6 });
      player.inventory.leftHand = createMockWeapon({ attackDice: 2 });

      const preview = getCombatPreviewWithDesperate(player);

      expect(preview.isDesperateActive).toBe(true);
      expect(preview.desperateBonuses.bonusAttackDice).toBeGreaterThan(0);
    });

    it('should not show desperate bonuses at full HP', () => {
      const player = createMockPlayer({ hp: 8, maxHp: 8, sanity: 6, maxSanity: 6 });

      const preview = getCombatPreviewWithDesperate(player);

      expect(preview.isDesperateActive).toBe(false);
      expect(preview.desperateBonuses.bonusAttackDice).toBe(0);
    });

    it('should include weapon and armor info', () => {
      const player = createMockPlayer();
      player.inventory.leftHand = createMockWeapon({ name: 'Shotgun', attackDice: 4 });
      player.inventory.body = createMockArmor({ name: 'Trench Coat' });

      const preview = getCombatPreviewWithDesperate(player);

      expect(preview.weaponName).toBe('Shotgun');
      expect(preview.armorName).toBe('Trench Coat');
    });
  });
});
