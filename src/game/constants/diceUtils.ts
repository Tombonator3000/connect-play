/**
 * DICE UTILITIES - Shared dice rolling functions
 *
 * This module provides the core dice rolling functionality used throughout
 * the game, eliminating code duplication between combat, skill checks, and other systems.
 *
 * Hero Quest Style:
 * - Combat DC = 4 (4, 5, 6 on d6 = success, 50% chance per die)
 * - Successes are called "skulls" (attack) or "shields" (defense)
 */

// Standard DC for combat (Hero Quest style)
export const COMBAT_DC = 4;

// Standard DC thresholds for skill checks
export const DC_EASY = 3;
export const DC_MEDIUM = 4;
export const DC_HARD = 5;
export const DC_EXTREME = 6;

/**
 * Roll multiple d6 dice
 * @param count Number of dice to roll
 * @returns Array of dice results (1-6)
 */
export function rollDice(count: number): number[] {
  if (count <= 0) {
    console.warn(`[Dice] Invalid dice count: ${count}, returning empty array`);
    return [];
  }

  // Cap at reasonable maximum to prevent memory issues
  const safeCount = Math.min(count, 100);
  if (count > 100) {
    console.warn(`[Dice] Dice count capped at 100 (requested: ${count})`);
  }

  return Array.from({ length: safeCount }, () => Math.floor(Math.random() * 6) + 1);
}

/**
 * Count successes (dice that meet or exceed the DC)
 * @param rolls Array of dice roll results
 * @param dc Difficulty class (default: COMBAT_DC = 4)
 * @returns Number of successes
 */
export function countSuccesses(rolls: number[], dc: number = COMBAT_DC): number {
  if (!Array.isArray(rolls)) {
    console.warn(`[Dice] Invalid rolls input, expected array`);
    return 0;
  }
  return rolls.filter(roll => roll >= dc).length;
}

/**
 * Roll dice and count successes in one operation
 * @param count Number of dice to roll
 * @param dc Difficulty class (default: COMBAT_DC = 4)
 * @returns Object with rolls array and success count
 */
export function rollAndCount(count: number, dc: number = COMBAT_DC): {
  rolls: number[];
  successes: number;
} {
  const rolls = rollDice(count);
  const successes = countSuccesses(rolls, dc);
  return { rolls, successes };
}

/**
 * Format dice rolls for display with successes highlighted
 * @param rolls Array of dice roll results
 * @param dc Difficulty class for highlighting
 * @returns Formatted string like "2 [4] [5] 1 [6]"
 */
export function formatDiceRolls(rolls: number[], dc: number = COMBAT_DC): string {
  if (!Array.isArray(rolls) || rolls.length === 0) {
    return '-';
  }
  return rolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');
}

/**
 * Check if all dice succeeded (critical hit condition)
 * @param rolls Array of dice roll results
 * @param dc Difficulty class
 * @returns True if all dice are successes
 */
export function isCriticalHit(rolls: number[], dc: number = COMBAT_DC): boolean {
  if (!Array.isArray(rolls) || rolls.length === 0) {
    return false;
  }
  return rolls.every(roll => roll >= dc);
}

/**
 * Check if all dice failed (critical miss condition)
 * @param rolls Array of dice roll results
 * @param dc Difficulty class
 * @returns True if all dice are failures
 */
export function isCriticalMiss(rolls: number[], dc: number = COMBAT_DC): boolean {
  if (!Array.isArray(rolls) || rolls.length === 0) {
    return false;
  }
  return rolls.every(roll => roll < dc);
}

/**
 * Calculate net damage (attack successes - defense successes)
 * @param attackSuccesses Number of attack successes (skulls)
 * @param defenseSuccesses Number of defense successes (shields)
 * @returns Net damage (minimum 0)
 */
export function calculateNetDamage(attackSuccesses: number, defenseSuccesses: number): number {
  return Math.max(0, attackSuccesses - defenseSuccesses);
}

/**
 * Get human-readable DC description
 * @param dc Difficulty class value
 * @returns Description string
 */
export function getDCDescription(dc: number): string {
  switch (dc) {
    case DC_EASY:
      return 'Easy';
    case DC_MEDIUM:
      return 'Medium';
    case DC_HARD:
      return 'Hard';
    case DC_EXTREME:
      return 'Extreme';
    default:
      return dc < DC_EASY ? 'Trivial' : 'Impossible';
  }
}

/**
 * Calculate success probability for a given number of dice and DC
 * @param diceCount Number of dice
 * @param dc Difficulty class
 * @param requiredSuccesses Minimum successes needed (default: 1)
 * @returns Probability as a decimal (0-1)
 */
export function calculateSuccessProbability(
  diceCount: number,
  dc: number = COMBAT_DC,
  requiredSuccesses: number = 1
): number {
  if (diceCount <= 0 || requiredSuccesses <= 0) {
    return 0;
  }

  // Probability of single die success
  const p = (7 - dc) / 6;

  // For at least 1 success: 1 - P(all fail)
  if (requiredSuccesses === 1) {
    return 1 - Math.pow(1 - p, diceCount);
  }

  // For multiple required successes, use binomial calculation
  // This is a simplified approximation
  let probability = 0;
  for (let k = requiredSuccesses; k <= diceCount; k++) {
    const combinations = binomialCoefficient(diceCount, k);
    probability += combinations * Math.pow(p, k) * Math.pow(1 - p, diceCount - k);
  }

  return probability;
}

/**
 * Calculate binomial coefficient (n choose k)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}
