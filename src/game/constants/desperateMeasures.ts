/**
 * DESPERATE MEASURES - Low HP/Sanity Bonuses
 *
 * When players are in dire straits (low HP or Sanity),
 * they gain desperate bonuses that can turn the tide.
 */

import { DesperateMeasure, SkillType } from '../types';

// ============================================================================
// DESPERATE MEASURES DEFINITIONS
// ============================================================================

export const DESPERATE_MEASURES: DesperateMeasure[] = [
  {
    id: 'adrenaline',
    name: 'Adrenalin',
    description: '+1 AP denne runden når HP = 1',
    triggerCondition: { type: 'low_hp', threshold: 1 },
    effect: { type: 'bonus_ap', value: 1, duration: 'round' }
  },
  {
    id: 'madness_strength',
    name: 'Galskaps Styrke',
    description: '+1 attack die når Sanity = 1, men auto-fail Willpower',
    triggerCondition: { type: 'low_sanity', threshold: 1 },
    effect: { type: 'bonus_attack', value: 1, duration: 'round' },
    drawback: { type: 'auto_fail_check', skillType: 'willpower' }
  },
  {
    id: 'survival_instinct',
    name: 'Overlevelsesinstinkt',
    description: '+1 defense die når HP <= 2',
    triggerCondition: { type: 'low_hp', threshold: 2 },
    effect: { type: 'bonus_defense', value: 1, duration: 'round' }
  },
  {
    id: 'desperate_focus',
    name: 'Desperat Fokus',
    description: '+2 attack dice når HP = 1 OG Sanity = 1',
    triggerCondition: { type: 'both', threshold: 1 },
    effect: { type: 'bonus_attack', value: 2, duration: 'round' }
  },
  {
    id: 'final_stand',
    name: 'Siste Kamp',
    description: '+1 damage på alle angrep når HP = 1',
    triggerCondition: { type: 'low_hp', threshold: 1 },
    effect: { type: 'bonus_damage', value: 1, duration: 'round' }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check which desperate measures are active for a player
 * @param hp Current HP
 * @param sanity Current Sanity
 * @returns Array of active desperate measures
 */
export function getActiveDesperateMeasures(hp: number, sanity: number): DesperateMeasure[] {
  if (hp < 0 || sanity < 0) {
    console.warn(`[DesperateMeasures] Invalid HP (${hp}) or Sanity (${sanity})`);
    return [];
  }

  return DESPERATE_MEASURES.filter(measure => {
    const { triggerCondition } = measure;
    switch (triggerCondition.type) {
      case 'low_hp':
        return hp <= triggerCondition.threshold;
      case 'low_sanity':
        return sanity <= triggerCondition.threshold;
      case 'both':
        return hp <= triggerCondition.threshold && sanity <= triggerCondition.threshold;
      default:
        console.warn(`[DesperateMeasures] Unknown trigger type: ${triggerCondition.type}`);
        return false;
    }
  });
}

/**
 * Calculate total bonuses from desperate measures
 * @param hp Current HP
 * @param sanity Current Sanity
 * @returns Object with all calculated bonuses and drawbacks
 */
export function calculateDesperateBonuses(hp: number, sanity: number): {
  bonusAP: number;
  bonusAttackDice: number;
  bonusDefenseDice: number;
  bonusDamage: number;
  autoFailSkills: SkillType[];
} {
  const activeMeasures = getActiveDesperateMeasures(hp, sanity);

  const result = {
    bonusAP: 0,
    bonusAttackDice: 0,
    bonusDefenseDice: 0,
    bonusDamage: 0,
    autoFailSkills: [] as SkillType[]
  };

  for (const measure of activeMeasures) {
    switch (measure.effect.type) {
      case 'bonus_ap':
        result.bonusAP += measure.effect.value;
        break;
      case 'bonus_attack':
        result.bonusAttackDice += measure.effect.value;
        break;
      case 'bonus_defense':
        result.bonusDefenseDice += measure.effect.value;
        break;
      case 'bonus_damage':
        result.bonusDamage += measure.effect.value;
        break;
      default:
        console.warn(`[DesperateMeasures] Unknown effect type: ${measure.effect.type}`);
    }

    if (measure.drawback?.type === 'auto_fail_check' && measure.drawback.skillType) {
      result.autoFailSkills.push(measure.drawback.skillType as SkillType);
    }
  }

  return result;
}

/**
 * Check if any desperate measure is active
 * @param hp Current HP
 * @param sanity Current Sanity
 * @returns True if any desperate measure is triggered
 */
export function isDesperateActive(hp: number, sanity: number): boolean {
  const bonuses = calculateDesperateBonuses(hp, sanity);
  return (
    bonuses.bonusAP > 0 ||
    bonuses.bonusAttackDice > 0 ||
    bonuses.bonusDefenseDice > 0 ||
    bonuses.bonusDamage > 0
  );
}

/**
 * Get desperate measure by ID
 * @param id Measure ID
 * @returns Desperate measure or null if not found
 */
export function getDesperateMeasure(id: string): DesperateMeasure | null {
  const measure = DESPERATE_MEASURES.find(m => m.id === id);
  if (!measure) {
    console.warn(`[DesperateMeasures] Unknown measure ID: ${id}`);
    return null;
  }
  return measure;
}
