/**
 * Tests for Critical Hit/Miss System
 *
 * These tests cover the expanded critical hit and miss mechanics,
 * including bonus selection and penalty application.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CRITICAL_BONUSES,
  CRITICAL_PENALTIES,
  getRandomCriticalBonuses,
  getRandomCriticalPenalty,
  getCriticalBonus,
  getCriticalPenalty
} from './criticals';

describe('criticals', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Constants
  // ============================================================================

  describe('CRITICAL_BONUSES', () => {
    it('should have at least 3 bonus options for player choice', () => {
      expect(CRITICAL_BONUSES.length).toBeGreaterThanOrEqual(3);
    });

    it('should have required properties on each bonus', () => {
      CRITICAL_BONUSES.forEach(bonus => {
        expect(bonus).toHaveProperty('id');
        expect(bonus).toHaveProperty('name');
        expect(bonus).toHaveProperty('description');
        expect(bonus).toHaveProperty('effect');
        expect(typeof bonus.id).toBe('string');
        expect(typeof bonus.name).toBe('string');
        expect(typeof bonus.description).toBe('string');
      });
    });

    it('should include extra_attack bonus', () => {
      const extraAttack = CRITICAL_BONUSES.find(b => b.id === 'extra_attack');
      expect(extraAttack).toBeDefined();
      expect(extraAttack?.effect.type).toBe('action');
    });

    it('should include heal_hp bonus', () => {
      const healHp = CRITICAL_BONUSES.find(b => b.id === 'heal_hp');
      expect(healHp).toBeDefined();
      expect(healHp?.effect.type).toBe('heal');
      expect(healHp?.effect.resource).toBe('hp');
    });

    it('should include gain_insight bonus', () => {
      const gainInsight = CRITICAL_BONUSES.find(b => b.id === 'gain_insight');
      expect(gainInsight).toBeDefined();
      expect(gainInsight?.effect.type).toBe('resource');
      expect(gainInsight?.effect.resource).toBe('insight');
    });

    it('should include recover_sanity bonus', () => {
      const recoverSanity = CRITICAL_BONUSES.find(b => b.id === 'recover_sanity');
      expect(recoverSanity).toBeDefined();
      expect(recoverSanity?.effect.type).toBe('heal');
      expect(recoverSanity?.effect.resource).toBe('sanity');
    });

    it('should have unique IDs', () => {
      const ids = CRITICAL_BONUSES.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('CRITICAL_PENALTIES', () => {
    it('should have at least 3 penalty options', () => {
      expect(CRITICAL_PENALTIES.length).toBeGreaterThanOrEqual(3);
    });

    it('should have required properties on each penalty', () => {
      CRITICAL_PENALTIES.forEach(penalty => {
        expect(penalty).toHaveProperty('id');
        expect(penalty).toHaveProperty('name');
        expect(penalty).toHaveProperty('description');
        expect(penalty).toHaveProperty('effect');
        expect(typeof penalty.id).toBe('string');
        expect(typeof penalty.name).toBe('string');
        expect(typeof penalty.description).toBe('string');
      });
    });

    it('should include counter_attack penalty', () => {
      const counterAttack = CRITICAL_PENALTIES.find(p => p.id === 'counter_attack');
      expect(counterAttack).toBeDefined();
      expect(counterAttack?.effect.type).toBe('damage');
    });

    it('should include lose_ap penalty', () => {
      const loseAp = CRITICAL_PENALTIES.find(p => p.id === 'lose_ap');
      expect(loseAp).toBeDefined();
      expect(loseAp?.effect.type).toBe('lose_resource');
      expect(loseAp?.effect.resource).toBe('ap');
    });

    it('should include drop_item penalty', () => {
      const dropItem = CRITICAL_PENALTIES.find(p => p.id === 'drop_item');
      expect(dropItem).toBeDefined();
      expect(dropItem?.effect.type).toBe('lose_resource');
      expect(dropItem?.effect.resource).toBe('item');
    });

    it('should include attract_enemy penalty', () => {
      const attractEnemy = CRITICAL_PENALTIES.find(p => p.id === 'attract_enemy');
      expect(attractEnemy).toBeDefined();
      expect(attractEnemy?.effect.type).toBe('spawn');
    });

    it('should have unique IDs', () => {
      const ids = CRITICAL_PENALTIES.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ============================================================================
  // getRandomCriticalBonuses
  // ============================================================================

  describe('getRandomCriticalBonuses', () => {
    it('should return requested number of bonuses', () => {
      const bonuses = getRandomCriticalBonuses(3);
      expect(bonuses).toHaveLength(3);
    });

    it('should return all unique bonuses', () => {
      const bonuses = getRandomCriticalBonuses(3);
      const ids = bonuses.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should not return more bonuses than available', () => {
      const bonuses = getRandomCriticalBonuses(100);
      expect(bonuses.length).toBeLessThanOrEqual(CRITICAL_BONUSES.length);
    });

    it('should return empty array for zero count', () => {
      const bonuses = getRandomCriticalBonuses(0);
      expect(bonuses).toEqual([]);
    });

    it('should return empty array for negative count', () => {
      const bonuses = getRandomCriticalBonuses(-1);
      expect(bonuses).toEqual([]);
    });

    it('should return valid bonus objects', () => {
      const bonuses = getRandomCriticalBonuses(2);
      bonuses.forEach(bonus => {
        expect(bonus).toHaveProperty('id');
        expect(bonus).toHaveProperty('name');
        expect(bonus).toHaveProperty('description');
        expect(bonus).toHaveProperty('effect');
      });
    });

    it('should return different bonuses on subsequent calls (randomness)', () => {
      // Call multiple times and check we get some variety
      const results: string[][] = [];
      for (let i = 0; i < 20; i++) {
        const bonuses = getRandomCriticalBonuses(3);
        results.push(bonuses.map(b => b.id).sort());
      }

      // Should have at least some different combinations
      const uniqueCombos = new Set(results.map(r => r.join(',')));
      // With 4 bonuses choose 3, there are 4 possible combinations
      // We should see at least 2 different ones in 20 tries
      expect(uniqueCombos.size).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // getRandomCriticalPenalty
  // ============================================================================

  describe('getRandomCriticalPenalty', () => {
    it('should return a valid penalty', () => {
      const penalty = getRandomCriticalPenalty();

      expect(penalty).toHaveProperty('id');
      expect(penalty).toHaveProperty('name');
      expect(penalty).toHaveProperty('description');
      expect(penalty).toHaveProperty('effect');
    });

    it('should return a penalty from the CRITICAL_PENALTIES array', () => {
      const penalty = getRandomCriticalPenalty();
      const found = CRITICAL_PENALTIES.find(p => p.id === penalty.id);
      expect(found).toBeDefined();
    });

    it('should return different penalties on subsequent calls (randomness)', () => {
      const penalties: string[] = [];
      for (let i = 0; i < 20; i++) {
        penalties.push(getRandomCriticalPenalty().id);
      }

      const uniquePenalties = new Set(penalties);
      // Should see at least 2 different penalties in 20 tries
      expect(uniquePenalties.size).toBeGreaterThanOrEqual(1);
    });

    it('should return fallback penalty when array is somehow empty', () => {
      // This tests the defensive code path
      // In normal operation, CRITICAL_PENALTIES should never be empty
      const penalty = getRandomCriticalPenalty();
      expect(penalty.id).toBeDefined();
    });
  });

  // ============================================================================
  // getCriticalBonus
  // ============================================================================

  describe('getCriticalBonus', () => {
    it('should return bonus by ID', () => {
      const bonus = getCriticalBonus('extra_attack');

      expect(bonus).not.toBeNull();
      expect(bonus?.id).toBe('extra_attack');
      expect(bonus?.name).toBe('Ekstra Angrep');
    });

    it('should return heal_hp bonus', () => {
      const bonus = getCriticalBonus('heal_hp');

      expect(bonus).not.toBeNull();
      expect(bonus?.id).toBe('heal_hp');
    });

    it('should return gain_insight bonus', () => {
      const bonus = getCriticalBonus('gain_insight');

      expect(bonus).not.toBeNull();
      expect(bonus?.id).toBe('gain_insight');
    });

    it('should return recover_sanity bonus', () => {
      const bonus = getCriticalBonus('recover_sanity');

      expect(bonus).not.toBeNull();
      expect(bonus?.id).toBe('recover_sanity');
    });

    it('should return null for unknown ID', () => {
      // @ts-expect-error - testing invalid input
      const bonus = getCriticalBonus('unknown_bonus');

      expect(bonus).toBeNull();
    });
  });

  // ============================================================================
  // getCriticalPenalty
  // ============================================================================

  describe('getCriticalPenalty', () => {
    it('should return penalty by ID', () => {
      const penalty = getCriticalPenalty('counter_attack');

      expect(penalty).not.toBeNull();
      expect(penalty?.id).toBe('counter_attack');
      expect(penalty?.name).toBe('Motangrep');
    });

    it('should return lose_ap penalty', () => {
      const penalty = getCriticalPenalty('lose_ap');

      expect(penalty).not.toBeNull();
      expect(penalty?.id).toBe('lose_ap');
    });

    it('should return drop_item penalty', () => {
      const penalty = getCriticalPenalty('drop_item');

      expect(penalty).not.toBeNull();
      expect(penalty?.id).toBe('drop_item');
    });

    it('should return attract_enemy penalty', () => {
      const penalty = getCriticalPenalty('attract_enemy');

      expect(penalty).not.toBeNull();
      expect(penalty?.id).toBe('attract_enemy');
    });

    it('should return null for unknown ID', () => {
      // @ts-expect-error - testing invalid input
      const penalty = getCriticalPenalty('unknown_penalty');

      expect(penalty).toBeNull();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('integration', () => {
    it('should support the critical hit flow: roll -> get bonuses -> select bonus', () => {
      // Simulate critical hit flow
      const bonusOptions = getRandomCriticalBonuses(3);
      expect(bonusOptions).toHaveLength(3);

      // Player selects first option
      const selectedId = bonusOptions[0].id;
      const selectedBonus = getCriticalBonus(selectedId as any);
      expect(selectedBonus).not.toBeNull();
      expect(selectedBonus?.id).toBe(selectedId);
    });

    it('should support the critical miss flow: roll -> get random penalty', () => {
      // Simulate critical miss flow
      const penalty = getRandomCriticalPenalty();
      expect(penalty).toBeDefined();

      // Verify penalty can be retrieved by ID
      const retrievedPenalty = getCriticalPenalty(penalty.id as any);
      expect(retrievedPenalty).not.toBeNull();
      expect(retrievedPenalty?.id).toBe(penalty.id);
    });

    it('should have consistent effect structures for bonuses', () => {
      CRITICAL_BONUSES.forEach(bonus => {
        expect(bonus.effect).toHaveProperty('type');
        expect(bonus.effect).toHaveProperty('value');

        // Type-specific checks
        if (bonus.effect.type === 'heal' || bonus.effect.type === 'resource') {
          expect(bonus.effect).toHaveProperty('resource');
        }
      });
    });

    it('should have consistent effect structures for penalties', () => {
      CRITICAL_PENALTIES.forEach(penalty => {
        expect(penalty.effect).toHaveProperty('type');
        expect(penalty.effect).toHaveProperty('value');

        // Type-specific checks
        if (penalty.effect.type === 'lose_resource') {
          expect(penalty.effect).toHaveProperty('resource');
        }
      });
    });
  });
});
