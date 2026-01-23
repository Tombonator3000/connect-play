/**
 * SKILL CHECK UTILITIES
 *
 * Character-specific skill check helpers and utilities.
 *
 * NOTE: The main performSkillCheck function is in combatUtils.ts
 * This file contains helper functions for character-specific behaviors.
 */

import { Player, SkillType } from '../types';

// Re-export getDCDescription from diceUtils for convenience
export { getDCDescription } from '../constants/diceUtils';

/**
 * Get human-readable skill name for display
 */
export function getSkillName(skill: SkillType): string {
  const names: Record<SkillType, string> = {
    strength: 'Strength',
    agility: 'Agility',
    intellect: 'Intellect',
    willpower: 'Willpower'
  };
  return names[skill] ?? skill;
}

/**
 * Check if player has immunity to sanity loss from occult texts
 * Professor special ability
 */
export function hasOccultImmunity(player: Player): boolean {
  if (!player || !player.id) {
    console.warn('[SkillCheck] Invalid player in hasOccultImmunity');
    return false;
  }
  return player.id === 'professor';
}

/**
 * Check if player has ritual mastery
 * Occultist special ability
 */
export function hasRitualMastery(player: Player): boolean {
  if (!player || !player.id) {
    console.warn('[SkillCheck] Invalid player in hasRitualMastery');
    return false;
  }
  return player.id === 'occultist';
}

/**
 * Get heal amount for player
 * Doctors heal 2 instead of 1 (special ability)
 */
export function getHealAmount(player: Player): number {
  if (!player || !player.id) {
    console.warn('[SkillCheck] Invalid player in getHealAmount');
    return 1;
  }
  return player.id === 'doctor' ? 2 : 1;
}

/**
 * Get movement bonus for player
 * Journalist gets +1 movement (special ability)
 */
export function getMovementBonus(player: Player): number {
  if (!player || !player.id) {
    console.warn('[SkillCheck] Invalid player in getMovementBonus');
    return 0;
  }
  return player.id === 'journalist' ? 1 : 0;
}

/**
 * Get character-specific skill bonus
 * - Veteran: +1 to Strength checks
 * - Detective: +1 to Intellect checks
 */
export function getCharacterSkillBonus(player: Player, skill: SkillType): number {
  if (!player || !player.id) {
    return 0;
  }

  if (skill === 'strength' && player.id === 'veteran') {
    return 1;
  }
  if (skill === 'intellect' && player.id === 'detective') {
    return 1;
  }

  return 0;
}
