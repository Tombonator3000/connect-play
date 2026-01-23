/**
 * CONSTANTS INDEX
 *
 * This file re-exports all constants from their respective modules
 * for backward compatibility. New code should import directly from
 * the specific modules for better tree-shaking.
 *
 * MODULE STRUCTURE:
 * - bestiary.ts: Enemy definitions (BESTIARY)
 * - weapons.ts: Weapons and armor (HQ_WEAPONS, HQ_ARMOR)
 * - criticals.ts: Critical hit/miss system
 * - desperateMeasures.ts: Low HP/Sanity bonuses
 * - diceUtils.ts: Shared dice rolling utilities
 *
 * MIGRATION NOTE:
 * Most constants are still in the main constants.ts file.
 * This index provides a path for gradual migration.
 */

// Re-export from new modular files
export {
  BESTIARY,
  getBestiaryEntry,
  getEnemyAttackDice,
  getEnemyDefenseDice,
  getEnemyHorror
} from './bestiary';

export {
  HQ_WEAPONS,
  HQ_ARMOR,
  getWeaponById,
  getArmorById,
  getMeleeWeapons,
  getRangedWeapons,
  getWeaponsForLevel,
  getArmorForLevel
} from './weapons';

export {
  CRITICAL_BONUSES,
  CRITICAL_PENALTIES,
  getRandomCriticalBonuses,
  getRandomCriticalPenalty,
  getCriticalBonus,
  getCriticalPenalty
} from './criticals';

export {
  DESPERATE_MEASURES,
  getActiveDesperateMeasures,
  calculateDesperateBonuses,
  isDesperateActive,
  getDesperateMeasure
} from './desperateMeasures';

export {
  COMBAT_DC,
  DC_EASY,
  DC_MEDIUM,
  DC_HARD,
  DC_EXTREME,
  rollDice,
  countSuccesses,
  rollAndCount,
  formatDiceRolls,
  isCriticalHit,
  isCriticalMiss,
  calculateNetDamage,
  getDCDescription,
  calculateSuccessProbability
} from './diceUtils';
