/**
 * CRITICAL HIT/MISS SYSTEM - Expanded Crits
 *
 * On critical hit: Player chooses from 3 random bonuses
 * On critical miss: Random penalty is applied
 */

import { CriticalBonus, CriticalPenalty, CriticalBonusType, CriticalPenaltyType } from '../types';

// ============================================================================
// CRITICAL BONUSES (Player chooses on crit hit)
// ============================================================================

export const CRITICAL_BONUSES: CriticalBonus[] = [
  {
    id: 'extra_attack',
    name: 'Ekstra Angrep',
    description: 'Få et gratis ekstra angrep',
    icon: '⚔️',
    effect: { type: 'action', value: 1 }
  },
  {
    id: 'heal_hp',
    name: 'Helbredelse',
    description: 'Gjenopprett 1 HP',
    icon: '❤️',
    effect: { type: 'heal', value: 1, resource: 'hp' }
  },
  {
    id: 'gain_insight',
    name: 'Innsikt',
    description: 'Få +1 Insight',
    icon: '💡',
    effect: { type: 'resource', value: 1, resource: 'insight' }
  },
  {
    id: 'recover_sanity',
    name: 'Mental Styrke',
    description: 'Gjenopprett 1 Sanity',
    icon: '🧠',
    effect: { type: 'heal', value: 1, resource: 'sanity' }
  }
];

// ============================================================================
// CRITICAL PENALTIES (Auto-applied on crit miss)
// ============================================================================

export const CRITICAL_PENALTIES: CriticalPenalty[] = [
  {
    id: 'counter_attack',
    name: 'Motangrep',
    description: 'Fienden får et gratis angrep',
    effect: { type: 'damage', value: 1 }
  },
  {
    id: 'lose_ap',
    name: 'Mist AP',
    description: 'Mist 1 AP neste runde',
    effect: { type: 'lose_resource', value: 1, resource: 'ap' }
  },
  {
    id: 'drop_item',
    name: 'Mist Utstyr',
    description: 'Drop et tilfeldig item på bakken',
    effect: { type: 'lose_resource', value: 1, resource: 'item' }
  },
  {
    id: 'attract_enemy',
    name: 'Tiltrekk Fiende',
    description: 'Støy tiltrekker en fiende nærmere',
    effect: { type: 'spawn', value: 1 }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get random critical bonuses for player to choose from
 * @param count Number of bonus options (default: 3)
 * @returns Array of random critical bonuses
 */
export function getRandomCriticalBonuses(count: number = 3): CriticalBonus[] {
  if (count <= 0) {
    console.warn('[Criticals] Invalid bonus count, returning empty array');
    return [];
  }

  const shuffled = [...CRITICAL_BONUSES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CRITICAL_BONUSES.length));
}

/**
 * Get a random critical penalty
 * @returns Random critical penalty
 */
export function getRandomCriticalPenalty(): CriticalPenalty {
  if (CRITICAL_PENALTIES.length === 0) {
    console.error('[Criticals] No critical penalties defined');
    return {
      id: 'none',
      name: 'Ingen straff',
      description: 'Ingen straff',
      effect: { type: 'damage', value: 0 }
    } as CriticalPenalty;
  }

  const index = Math.floor(Math.random() * CRITICAL_PENALTIES.length);
  return CRITICAL_PENALTIES[index];
}

/**
 * Get critical bonus by ID
 * @param id Bonus ID
 * @returns Critical bonus or null if not found
 */
export function getCriticalBonus(id: CriticalBonusType): CriticalBonus | null {
  const bonus = CRITICAL_BONUSES.find(b => b.id === id);
  if (!bonus) {
    console.warn(`[Criticals] Unknown bonus ID: ${id}`);
    return null;
  }
  return bonus;
}

/**
 * Get critical penalty by ID
 * @param id Penalty ID
 * @returns Critical penalty or null if not found
 */
export function getCriticalPenalty(id: CriticalPenaltyType): CriticalPenalty | null {
  const penalty = CRITICAL_PENALTIES.find(p => p.id === id);
  if (!penalty) {
    console.warn(`[Criticals] Unknown penalty ID: ${id}`);
    return null;
  }
  return penalty;
}
