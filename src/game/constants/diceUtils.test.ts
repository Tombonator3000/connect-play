/**
 * Tests for Dice Utilities
 *
 * These tests cover the core dice rolling functionality used throughout
 * the game's combat, skill checks, and other random mechanics.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  rollDice,
  countSuccesses,
  rollAndCount,
  formatDiceRolls,
  isCriticalHit,
  isCriticalMiss,
  calculateNetDamage,
  getDCDescription,
  calculateSuccessProbability,
  COMBAT_DC,
  DC_EASY,
  DC_MEDIUM,
  DC_HARD,
  DC_EXTREME
} from './diceUtils';

describe('diceUtils', () => {
  // ============================================================================
  // Constants
  // ============================================================================

  describe('constants', () => {
    it('should have correct combat DC (Hero Quest style)', () => {
      expect(COMBAT_DC).toBe(4);
    });

    it('should have correct difficulty class thresholds', () => {
      expect(DC_EASY).toBe(3);
      expect(DC_MEDIUM).toBe(4);
      expect(DC_HARD).toBe(5);
      expect(DC_EXTREME).toBe(6);
    });
  });

  // ============================================================================
  // rollDice
  // ============================================================================

  describe('rollDice', () => {
    it('should return correct number of dice', () => {
      const rolls = rollDice(5);
      expect(rolls).toHaveLength(5);
    });

    it('should return values between 1 and 6', () => {
      // Roll many dice to ensure we're getting valid d6 results
      const rolls = rollDice(100);
      rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });

    it('should return empty array for zero or negative dice count', () => {
      expect(rollDice(0)).toEqual([]);
      expect(rollDice(-1)).toEqual([]);
      expect(rollDice(-10)).toEqual([]);
    });

    it('should cap dice count at 100 to prevent memory issues', () => {
      const rolls = rollDice(150);
      expect(rolls).toHaveLength(100);
    });

    it('should return array of integers', () => {
      const rolls = rollDice(10);
      rolls.forEach(roll => {
        expect(Number.isInteger(roll)).toBe(true);
      });
    });
  });

  // ============================================================================
  // countSuccesses
  // ============================================================================

  describe('countSuccesses', () => {
    it('should count successes correctly with default DC (4)', () => {
      expect(countSuccesses([1, 2, 3, 4, 5, 6])).toBe(3); // 4, 5, 6 are successes
      expect(countSuccesses([4, 4, 4, 4])).toBe(4);
      expect(countSuccesses([1, 1, 1, 1])).toBe(0);
      expect(countSuccesses([6, 6, 6])).toBe(3);
    });

    it('should count successes with custom DC', () => {
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 5)).toBe(2); // 5, 6 are successes
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 6)).toBe(1); // Only 6 is success
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 3)).toBe(4); // 3, 4, 5, 6 are successes
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 1)).toBe(6); // All are successes
    });

    it('should return 0 for empty array', () => {
      expect(countSuccesses([])).toBe(0);
    });

    it('should handle invalid input gracefully', () => {
      // @ts-expect-error - testing invalid input
      expect(countSuccesses(null)).toBe(0);
      // @ts-expect-error - testing invalid input
      expect(countSuccesses(undefined)).toBe(0);
    });

    it('should handle edge case DCs', () => {
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 7)).toBe(0); // Nothing can succeed
      expect(countSuccesses([1, 2, 3, 4, 5, 6], 0)).toBe(6); // Everything succeeds
    });
  });

  // ============================================================================
  // rollAndCount
  // ============================================================================

  describe('rollAndCount', () => {
    it('should return rolls array and success count', () => {
      const result = rollAndCount(5);
      expect(result.rolls).toHaveLength(5);
      expect(typeof result.successes).toBe('number');
      expect(result.successes).toBeGreaterThanOrEqual(0);
      expect(result.successes).toBeLessThanOrEqual(5);
    });

    it('should correctly count successes in returned rolls', () => {
      // Use a fixed seed approach by mocking Math.random
      const mockRolls = [4, 2, 6, 1, 5]; // 3 successes with DC 4
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        const value = (mockRolls[callIndex % mockRolls.length] - 1) / 6;
        callIndex++;
        return value;
      });

      const result = rollAndCount(5);
      expect(result.rolls).toEqual([4, 2, 6, 1, 5]);
      expect(result.successes).toBe(3);

      vi.restoreAllMocks();
    });

    it('should use custom DC when provided', () => {
      vi.spyOn(Math, 'random').mockImplementation(() => 0.5); // Always roll 4

      const resultDC4 = rollAndCount(5, 4);
      expect(resultDC4.successes).toBe(5); // All 4s succeed at DC 4

      const resultDC5 = rollAndCount(5, 5);
      expect(resultDC5.successes).toBe(0); // All 4s fail at DC 5

      vi.restoreAllMocks();
    });
  });

  // ============================================================================
  // formatDiceRolls
  // ============================================================================

  describe('formatDiceRolls', () => {
    it('should bracket successes with default DC', () => {
      expect(formatDiceRolls([1, 4, 2, 5, 3, 6])).toBe('1 [4] 2 [5] 3 [6]');
    });

    it('should bracket successes with custom DC', () => {
      expect(formatDiceRolls([1, 4, 2, 5, 3, 6], 5)).toBe('1 4 2 [5] 3 [6]');
      expect(formatDiceRolls([1, 4, 2, 5, 3, 6], 6)).toBe('1 4 2 5 3 [6]');
    });

    it('should return dash for empty array', () => {
      expect(formatDiceRolls([])).toBe('-');
    });

    it('should handle invalid input gracefully', () => {
      // @ts-expect-error - testing invalid input
      expect(formatDiceRolls(null)).toBe('-');
      // @ts-expect-error - testing invalid input
      expect(formatDiceRolls(undefined)).toBe('-');
    });

    it('should handle all successes', () => {
      expect(formatDiceRolls([6, 6, 6])).toBe('[6] [6] [6]');
    });

    it('should handle all failures', () => {
      expect(formatDiceRolls([1, 1, 1])).toBe('1 1 1');
    });
  });

  // ============================================================================
  // isCriticalHit
  // ============================================================================

  describe('isCriticalHit', () => {
    it('should return true when all dice succeed', () => {
      expect(isCriticalHit([4, 5, 6])).toBe(true);
      expect(isCriticalHit([6, 6, 6])).toBe(true);
      expect(isCriticalHit([4, 4, 4, 4])).toBe(true);
    });

    it('should return false when any die fails', () => {
      expect(isCriticalHit([3, 4, 5, 6])).toBe(false);
      expect(isCriticalHit([1, 6, 6, 6])).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(isCriticalHit([])).toBe(false);
    });

    it('should handle custom DC', () => {
      expect(isCriticalHit([5, 5, 5], 5)).toBe(true);
      expect(isCriticalHit([4, 4, 4], 5)).toBe(false);
    });

    it('should handle invalid input gracefully', () => {
      // @ts-expect-error - testing invalid input
      expect(isCriticalHit(null)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isCriticalHit(undefined)).toBe(false);
    });

    it('should work with single die', () => {
      expect(isCriticalHit([6])).toBe(true);
      expect(isCriticalHit([1])).toBe(false);
    });
  });

  // ============================================================================
  // isCriticalMiss
  // ============================================================================

  describe('isCriticalMiss', () => {
    it('should return true when all dice fail', () => {
      expect(isCriticalMiss([1, 2, 3])).toBe(true);
      expect(isCriticalMiss([1, 1, 1])).toBe(true);
      expect(isCriticalMiss([3, 3, 3, 3])).toBe(true);
    });

    it('should return false when any die succeeds', () => {
      expect(isCriticalMiss([1, 2, 3, 4])).toBe(false);
      expect(isCriticalMiss([3, 3, 3, 6])).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(isCriticalMiss([])).toBe(false);
    });

    it('should handle custom DC', () => {
      expect(isCriticalMiss([4, 4, 4], 5)).toBe(true);
      expect(isCriticalMiss([5, 4, 4], 5)).toBe(false);
    });

    it('should handle invalid input gracefully', () => {
      // @ts-expect-error - testing invalid input
      expect(isCriticalMiss(null)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isCriticalMiss(undefined)).toBe(false);
    });

    it('should work with single die', () => {
      expect(isCriticalMiss([1])).toBe(true);
      expect(isCriticalMiss([6])).toBe(false);
    });
  });

  // ============================================================================
  // calculateNetDamage
  // ============================================================================

  describe('calculateNetDamage', () => {
    it('should calculate attack minus defense', () => {
      expect(calculateNetDamage(5, 2)).toBe(3);
      expect(calculateNetDamage(10, 3)).toBe(7);
    });

    it('should return 0 when defense equals or exceeds attack', () => {
      expect(calculateNetDamage(2, 2)).toBe(0);
      expect(calculateNetDamage(2, 5)).toBe(0);
      expect(calculateNetDamage(0, 3)).toBe(0);
    });

    it('should never return negative values', () => {
      expect(calculateNetDamage(1, 100)).toBe(0);
      expect(calculateNetDamage(-5, 5)).toBe(0);
    });

    it('should handle zero values', () => {
      expect(calculateNetDamage(0, 0)).toBe(0);
      expect(calculateNetDamage(5, 0)).toBe(5);
    });
  });

  // ============================================================================
  // getDCDescription
  // ============================================================================

  describe('getDCDescription', () => {
    it('should return correct descriptions for standard DCs', () => {
      expect(getDCDescription(DC_EASY)).toBe('Easy');
      expect(getDCDescription(DC_MEDIUM)).toBe('Medium');
      expect(getDCDescription(DC_HARD)).toBe('Hard');
      expect(getDCDescription(DC_EXTREME)).toBe('Extreme');
    });

    it('should return Trivial for DCs below Easy', () => {
      expect(getDCDescription(1)).toBe('Trivial');
      expect(getDCDescription(2)).toBe('Trivial');
    });

    it('should return Impossible for DCs above Extreme', () => {
      expect(getDCDescription(7)).toBe('Impossible');
      expect(getDCDescription(10)).toBe('Impossible');
    });
  });

  // ============================================================================
  // calculateSuccessProbability
  // ============================================================================

  describe('calculateSuccessProbability', () => {
    it('should return 0 for zero or negative dice count', () => {
      expect(calculateSuccessProbability(0)).toBe(0);
      expect(calculateSuccessProbability(-1)).toBe(0);
    });

    it('should return 0 for zero or negative required successes', () => {
      expect(calculateSuccessProbability(5, 4, 0)).toBe(0);
      expect(calculateSuccessProbability(5, 4, -1)).toBe(0);
    });

    it('should calculate correct probability for single die at DC 4', () => {
      // DC 4 means 4, 5, 6 succeed = 3/6 = 50%
      const prob = calculateSuccessProbability(1, 4, 1);
      expect(prob).toBeCloseTo(0.5, 2);
    });

    it('should calculate probability of at least 1 success with multiple dice', () => {
      // 2 dice at DC 4: P(at least 1) = 1 - P(all fail) = 1 - 0.5^2 = 0.75
      const prob2dice = calculateSuccessProbability(2, 4, 1);
      expect(prob2dice).toBeCloseTo(0.75, 2);

      // 3 dice at DC 4: P(at least 1) = 1 - 0.5^3 = 0.875
      const prob3dice = calculateSuccessProbability(3, 4, 1);
      expect(prob3dice).toBeCloseTo(0.875, 2);
    });

    it('should calculate probability for multiple required successes', () => {
      // 3 dice at DC 4, need 2 successes (binomial)
      // P(2 or 3 successes) = C(3,2)*(0.5)^3 + C(3,3)*(0.5)^3
      // = 3*0.125 + 1*0.125 = 0.375 + 0.125 = 0.5
      const prob = calculateSuccessProbability(3, 4, 2);
      expect(prob).toBeCloseTo(0.5, 2);
    });

    it('should handle different DCs correctly', () => {
      // DC 5 means 5, 6 succeed = 2/6 = 1/3 chance per die
      const probDC5 = calculateSuccessProbability(1, 5, 1);
      expect(probDC5).toBeCloseTo(1/3, 2);

      // DC 6 means only 6 succeeds = 1/6 chance per die
      const probDC6 = calculateSuccessProbability(1, 6, 1);
      expect(probDC6).toBeCloseTo(1/6, 2);
    });

    it('should return 1 when dice count greatly exceeds requirements', () => {
      // 10 dice at DC 4, need 1 success - almost certain
      const prob = calculateSuccessProbability(10, 4, 1);
      expect(prob).toBeGreaterThan(0.99);
    });

    it('should return low probability when requirements exceed expected successes', () => {
      // 2 dice at DC 4, need 2 successes = 0.5 * 0.5 = 0.25
      const prob = calculateSuccessProbability(2, 4, 2);
      expect(prob).toBeCloseTo(0.25, 2);
    });
  });
});
