import { Player, SkillType, SkillCheckResult, CharacterType } from '../types';
import { CHARACTERS } from '../constants';

/**
 * Performs a skill check according to the Game Design Bible rules:
 * - Roll 2d6 base + attribute bonus dice
 * - For each result >= DC, count 1 success
 * - Need at least 1 success to pass
 */
export function performSkillCheck(
  player: Player,
  skill: SkillType,
  dc: number
): SkillCheckResult {
  const character = CHARACTERS[player.id as CharacterType];
  const attributeValue = character.attributes[skill];
  
  // Base 2 dice + attribute value bonus dice
  const baseDice = 2;
  const bonusDice = attributeValue;
  
  // Character-specific bonuses
  let specialBonus = 0;
  if (skill === 'strength' && player.id === 'veteran') specialBonus = 1;
  if (skill === 'intellect' && player.id === 'detective') specialBonus = 1;
  
  const totalDice = baseDice + bonusDice + specialBonus;
  
  // Roll dice
  const dice = Array.from({ length: totalDice }, () => Math.floor(Math.random() * 6) + 1);
  
  // Count successes (dice >= DC)
  const successes = dice.filter(d => d >= dc).length;
  const passed = successes > 0;
  
  return {
    dice,
    successes,
    dc,
    passed,
    skill
  };
}

/**
 * Get the DC description
 */
export function getDCDescription(dc: number): string {
  switch (dc) {
    case 3: return 'Easy';
    case 4: return 'Medium';
    case 5: return 'Hard';
    case 6: return 'Extreme';
    default: return dc < 3 ? 'Trivial' : 'Impossible';
  }
}

/**
 * Get skill name for display
 */
export function getSkillName(skill: SkillType): string {
  const names: Record<SkillType, string> = {
    strength: 'Strength',
    agility: 'Agility',
    intellect: 'Intellect',
    willpower: 'Willpower'
  };
  return names[skill];
}

/**
 * Check if player has immunity to sanity loss from occult texts
 */
export function hasOccultImmunity(player: Player): boolean {
  return player.id === 'professor';
}

/**
 * Check if player has ritual mastery
 */
export function hasRitualMastery(player: Player): boolean {
  return player.id === 'occultist';
}

/**
 * Get heal amount for player (doctors heal 2 instead of 1)
 */
export function getHealAmount(player: Player): number {
  return player.id === 'doctor' ? 2 : 1;
}

/**
 * Get movement bonus for player
 */
export function getMovementBonus(player: Player): number {
  return player.id === 'journalist' ? 1 : 0;
}
