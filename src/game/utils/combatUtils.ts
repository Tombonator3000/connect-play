/**
 * Combat System Utilities for Shadows of the 1920s
 * Based on Game Design Bible - Skill Check System
 *
 * Combat uses: 2d6 + attribute bonus dice
 * Each die >= DC counts as a success
 * Need at least 1 success to hit
 */

import { Player, Enemy, Item, SkillType, SkillCheckResult } from '../types';
import { BESTIARY } from '../constants';

// Combat result interface
export interface CombatResult {
  hit: boolean;
  damage: number;
  rolls: number[];
  successes: number;
  criticalHit: boolean;  // All dice succeeded
  criticalMiss: boolean; // All dice failed
  horrorTriggered: boolean;
  sanityLoss: number;
  message: string;
}

// Horror check result
export interface HorrorCheckResult {
  resisted: boolean;
  sanityLoss: number;
  rolls: number[];
  successes: number;
  message: string;
}

// Dice rolling utility
export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

// Count successes against DC
export function countSuccesses(rolls: number[], dc: number): number {
  return rolls.filter(roll => roll >= dc).length;
}

/**
 * Perform a skill check
 * Base: 2d6 + attribute value dice
 * Each die >= DC is a success, need 1+ to pass
 */
export function performSkillCheck(
  player: Player,
  skill: SkillType,
  dc: number,
  bonusDice: number = 0
): SkillCheckResult {
  const baseDice = 2;
  const attributeValue = player.attributes[skill];
  const totalDice = baseDice + attributeValue + bonusDice;

  const dice = rollDice(totalDice);
  const successes = countSuccesses(dice, dc);

  return {
    dice,
    successes,
    dc,
    passed: successes >= 1,
    skill
  };
}

/**
 * Calculate weapon damage bonus
 */
export function getWeaponBonus(player: Player): { combatDice: number; damage: number } {
  let combatDice = 0;
  let damage = 1; // Base unarmed damage

  for (const item of player.inventory) {
    if (item.type === 'weapon' && item.bonus) {
      combatDice += item.bonus;
      // Weapon damage scales with bonus
      damage = Math.max(damage, item.bonus);
    }
  }

  return { combatDice, damage };
}

/**
 * Perform combat attack
 * Uses STR attribute + weapon bonuses
 * DC 4 for standard enemies
 */
export function performAttack(
  player: Player,
  enemy: Enemy,
  isRanged: boolean = false
): CombatResult {
  const dc = 4; // Standard combat DC
  const baseDice = 2;

  // Get attribute bonus (STR for melee, AGI for ranged)
  const attribute = isRanged ? player.attributes.agility : player.attributes.strength;

  // Weapon and class bonuses
  const weaponBonus = getWeaponBonus(player);
  const classBonusDice = player.specialAbility === 'combat_bonus' ? 1 : 0;

  const totalDice = baseDice + attribute + weaponBonus.combatDice + classBonusDice;
  const rolls = rollDice(totalDice);
  const successes = countSuccesses(rolls, dc);

  const criticalHit = successes === totalDice;
  const criticalMiss = successes === 0;

  // Calculate damage
  let damage = 0;
  if (successes > 0) {
    // Base damage is number of successes, minimum 1
    damage = Math.max(1, successes);
    // Add weapon damage bonus
    damage += weaponBonus.damage - 1; // -1 because base is already counted
    // Critical hit doubles damage
    if (criticalHit) {
      damage *= 2;
    }
  }

  // Check if enemy has damage reduction traits
  if (enemy.traits?.includes('massive') && damage > 0) {
    damage = Math.max(1, damage - 1); // Massive enemies take 1 less damage
  }

  let message = '';
  if (criticalHit) {
    message = `KRITISK TREFF! ${player.name} knuser ${enemy.name}!`;
  } else if (criticalMiss) {
    message = `KRITISK BOMMERT! Angrepet feiler totalt!`;
  } else if (successes > 0) {
    message = `TREFF! ${player.name} gjor ${damage} skade mot ${enemy.name}.`;
  } else {
    message = `BOMMERT! ${player.name} treffer ikke ${enemy.name}.`;
  }

  return {
    hit: successes > 0,
    damage,
    rolls,
    successes,
    criticalHit,
    criticalMiss,
    horrorTriggered: false,
    sanityLoss: 0,
    message
  };
}

/**
 * Perform horror check when first seeing an enemy
 * Uses WIL attribute
 * DC varies by enemy horror rating
 */
export function performHorrorCheck(
  player: Player,
  enemy: Enemy,
  alreadyEncountered: boolean
): HorrorCheckResult {
  // No horror check if already encountered this enemy type
  if (alreadyEncountered) {
    return {
      resisted: true,
      sanityLoss: 0,
      rolls: [],
      successes: 0,
      message: ''
    };
  }

  // Professor is immune to horror from reading occult texts, but not from seeing monsters
  // However, they get a bonus
  const classBonusDice = player.specialAbility === 'occult_immunity' ? 1 : 0;

  // DC is based on enemy horror level
  // Minor (1 horror) = DC 3, Moderate (2) = DC 4, Major (3+) = DC 5
  const dc = enemy.horror <= 1 ? 3 : enemy.horror <= 2 ? 4 : 5;

  const baseDice = 2;
  const willpower = player.attributes.willpower;
  const totalDice = baseDice + willpower + classBonusDice;

  const rolls = rollDice(totalDice);
  const successes = countSuccesses(rolls, dc);
  const resisted = successes >= 1;

  // Sanity loss based on enemy horror rating
  const sanityLoss = resisted ? 0 : enemy.horror;

  let message = '';
  if (resisted) {
    message = `${player.name} holder fatningen mot synet av ${enemy.name}.`;
  } else {
    message = `${player.name} skjelver av redsel! -${sanityLoss} Sanity.`;
  }

  return {
    resisted,
    sanityLoss,
    rolls,
    successes,
    message
  };
}

/**
 * Calculate enemy attack damage
 */
export function calculateEnemyDamage(enemy: Enemy, player: Player): {
  hpDamage: number;
  sanityDamage: number;
  message: string;
} {
  let hpDamage = enemy.damage;
  let sanityDamage = 0;

  // Check enemy attack type
  if (enemy.attackType === 'sanity') {
    // Sanity attackers deal sanity damage instead of HP
    sanityDamage = enemy.damage;
    hpDamage = 0;
  } else if (enemy.attackType === 'doom') {
    // Doom attackers also cause sanity damage
    sanityDamage = Math.ceil(enemy.damage / 2);
  }

  // Check player armor
  for (const item of player.inventory) {
    if (item.type === 'armor' && item.bonus) {
      hpDamage = Math.max(0, hpDamage - item.bonus);
    }
  }

  // Fast enemies get bonus damage on first hit
  if (enemy.traits?.includes('fast')) {
    hpDamage += 1;
  }

  const message = `${enemy.name} angriper ${player.name}! -${hpDamage} HP${sanityDamage > 0 ? `, -${sanityDamage} Sanity` : ''}`;

  return { hpDamage, sanityDamage, message };
}

/**
 * Check if player can attack enemy
 */
export function canAttackEnemy(player: Player, enemy: Enemy, hasRangedWeapon: boolean): {
  canAttack: boolean;
  reason: string;
} {
  const distance = Math.abs(player.position.q - enemy.position.q) +
                   Math.abs(player.position.r - enemy.position.r);

  // Melee range is 1
  if (distance <= 1) {
    return { canAttack: true, reason: '' };
  }

  // Check for ranged weapon
  if (hasRangedWeapon && distance <= 3) {
    return { canAttack: true, reason: '' };
  }

  if (distance > 1 && !hasRangedWeapon) {
    return { canAttack: false, reason: 'For langt unna for naerkamp. Trenger skytevapen.' };
  }

  if (distance > 3) {
    return { canAttack: false, reason: 'For langt unna selv med skytevapen.' };
  }

  return { canAttack: false, reason: 'Kan ikke angripe fienden.' };
}

/**
 * Check if player has a ranged weapon
 */
export function hasRangedWeapon(player: Player): boolean {
  return player.inventory.some(item =>
    item.type === 'weapon' &&
    (item.name.toLowerCase().includes('pistol') ||
     item.name.toLowerCase().includes('revolver') ||
     item.name.toLowerCase().includes('shotgun') ||
     item.name.toLowerCase().includes('rifle') ||
     item.name.toLowerCase().includes('tommy'))
  );
}

/**
 * Get combat dice preview for UI
 */
export function getCombatPreview(player: Player, isRanged: boolean = false): {
  totalDice: number;
  breakdown: string[];
} {
  const baseDice = 2;
  const attribute = isRanged ? player.attributes.agility : player.attributes.strength;
  const weaponBonus = getWeaponBonus(player);
  const classBonusDice = player.specialAbility === 'combat_bonus' ? 1 : 0;

  const breakdown: string[] = [
    `Base: 2d6`,
    `${isRanged ? 'AGI' : 'STR'}: +${attribute}d6`
  ];

  if (weaponBonus.combatDice > 0) {
    breakdown.push(`Vapen: +${weaponBonus.combatDice}d6`);
  }

  if (classBonusDice > 0) {
    breakdown.push(`Veteran bonus: +1d6`);
  }

  return {
    totalDice: baseDice + attribute + weaponBonus.combatDice + classBonusDice,
    breakdown
  };
}
