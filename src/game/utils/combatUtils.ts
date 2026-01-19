/**
 * Combat System Utilities for Shadows of the 1920s
 * Based on Game Design Bible - Skill Check System
 *
 * Combat uses: 2d6 + attribute bonus dice
 * Each die >= DC counts as a success
 * Need at least 1 success to hit
 */

import { Player, Enemy, Item, SkillType, SkillCheckResult, getAllItems } from '../types';
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
 * Get attack dice count based on weapon (Hero Quest style)
 * Weapon DETERMINES dice count directly, not adds bonus
 * Unarmed: 1 die
 * Knife/Club: 2 dice
 * Revolver: 2 dice
 * Shotgun: 3 dice
 * Tommy Gun: 4 dice
 */
export function getAttackDice(player: Player): { attackDice: number; weaponName: string } {
  let attackDice = 1; // Unarmed
  let weaponName = 'Unarmed';

  const items = getAllItems(player.inventory);
  for (const item of items) {
    if (item.type === 'weapon' && item.bonus) {
      // Weapon bonus directly determines dice count
      // bonus 1 = 2 dice, bonus 2 = 3 dice, bonus 3 = 4 dice
      const weaponDice = 1 + item.bonus;
      if (weaponDice > attackDice) {
        attackDice = weaponDice;
        weaponName = item.name;
      }
    }
  }

  return { attackDice, weaponName };
}

/**
 * Legacy function for backwards compatibility
 */
export function getWeaponBonus(player: Player): { combatDice: number; damage: number } {
  const { attackDice } = getAttackDice(player);
  return { combatDice: attackDice - 1, damage: attackDice };
}

/**
 * Perform combat attack using Hero Quest dice system
 * Weapon DETERMINES attack dice count directly
 * Enemy rolls defense dice to block
 * Net damage = attack successes - defense successes
 */
export function performAttack(
  player: Player,
  enemy: Enemy,
  isRanged: boolean = false
): CombatResult {
  const dc = 4; // Standard Hero Quest DC (skulls)

  // Get attack dice from weapon (Hero Quest style - weapon determines dice count)
  const { attackDice, weaponName } = getAttackDice(player);

  // Veteran class bonus: +1 attack die
  const classBonusDice = player.specialAbility === 'combat_bonus' ? 1 : 0;
  const totalAttackDice = attackDice + classBonusDice;

  // Roll player's attack dice
  const attackRolls = rollDice(totalAttackDice);
  const attackSuccesses = countSuccesses(attackRolls, dc);

  // Get enemy defense dice from bestiary
  const bestiaryEntry = BESTIARY[enemy.type];
  const defenseDice = bestiaryEntry?.defenseDice || 1;

  // Roll enemy's defense dice
  const defenseRolls = rollDice(defenseDice);
  const defenseSuccesses = countSuccesses(defenseRolls, dc);

  // Calculate net damage
  let damage = Math.max(0, attackSuccesses - defenseSuccesses);

  // Critical hit: all attack dice succeeded AND more than defense
  const criticalHit = attackSuccesses === totalAttackDice && attackSuccesses > defenseSuccesses;
  const criticalMiss = attackSuccesses === 0;

  // Critical hit bonus: +1 extra damage
  if (criticalHit && damage > 0) {
    damage += 1;
  }

  // Build message with dice results
  const attackDiceStr = attackRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');
  const defenseDiceStr = defenseRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');

  let message = '';
  if (criticalHit) {
    message = `KRITISK TREFF! ${player.name} (${weaponName}) knuser ${enemy.name}! ${damage} skade! (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  } else if (criticalMiss) {
    message = `BOMMERT! ${player.name} (${weaponName}) treffer ikke! (${attackDiceStr})`;
  } else if (damage > 0) {
    message = `TREFF! ${player.name} (${weaponName}) gjor ${damage} skade mot ${enemy.name}. (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  } else if (attackSuccesses > 0) {
    message = `${enemy.name} blokkerer angrepet! (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  } else {
    message = `BOMMERT! ${player.name} (${weaponName}) treffer ikke ${enemy.name}. (${attackDiceStr})`;
  }

  return {
    hit: damage > 0,
    damage,
    rolls: attackRolls,
    successes: attackSuccesses,
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
 * Get player's defense dice count based on armor
 * Hero Quest style: armor DETERMINES defense dice directly
 */
export function getPlayerDefenseDice(player: Player): number {
  let defenseDice = 1; // Base defense (dodging)

  const items = getAllItems(player.inventory);
  for (const item of items) {
    if (item.type === 'armor' && item.bonus) {
      // Armor bonus directly sets defense dice (not adds)
      // Leather Jacket (1) = 2 dice, Trench Coat (1) = 2 dice, Armored Vest (2) = 3 dice
      defenseDice = Math.max(defenseDice, 1 + item.bonus);
    }
  }

  return defenseDice;
}

/**
 * Calculate enemy attack damage using Hero Quest dice system
 * Monster rolls attackDice, player rolls defenseDice
 * Each die showing 4+ is a success (skull/shield)
 * Net damage = attack successes - defense successes (minimum 0)
 */
export function calculateEnemyDamage(enemy: Enemy, player: Player): {
  hpDamage: number;
  sanityDamage: number;
  attackRolls: number[];
  defenseRolls: number[];
  attackSuccesses: number;
  defenseSuccesses: number;
  message: string;
} {
  const dc = 4; // Standard Hero Quest DC (skulls)

  // Get attack dice from bestiary
  const bestiaryEntry = BESTIARY[enemy.type];
  const attackDice = bestiaryEntry?.attackDice || 1;

  // Roll attack dice
  const attackRolls = rollDice(attackDice);
  let attackSuccesses = countSuccesses(attackRolls, dc);

  // Fast enemies get +1 success on attack
  if (enemy.traits?.includes('fast')) {
    attackSuccesses += 1;
  }

  // Get player defense dice
  const defenseDice = getPlayerDefenseDice(player);
  const defenseRolls = rollDice(defenseDice);
  const defenseSuccesses = countSuccesses(defenseRolls, dc);

  // Calculate net damage
  let hpDamage = Math.max(0, attackSuccesses - defenseSuccesses);
  let sanityDamage = 0;

  // Check enemy attack type
  if (enemy.attackType === 'sanity') {
    // Sanity attackers deal sanity damage instead of HP
    sanityDamage = hpDamage;
    hpDamage = 0;
  } else if (enemy.attackType === 'doom') {
    // Doom attackers also cause sanity damage
    sanityDamage = Math.ceil(hpDamage / 2);
  }

  // Build message with dice results
  const attackDiceStr = attackRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');
  const defenseDiceStr = defenseRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');

  let message = '';
  if (attackSuccesses === 0) {
    message = `${enemy.name} angriper ${player.name} men bommer! (${attackDiceStr})`;
  } else if (hpDamage === 0 && sanityDamage === 0) {
    message = `${enemy.name} angriper! ${player.name} blokkerer alt! (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  } else {
    const damageStr = sanityDamage > 0
      ? `-${hpDamage} HP, -${sanityDamage} Sanity`
      : `-${hpDamage} HP`;
    message = `${enemy.name} angriper ${player.name}! ${damageStr} (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  }

  return {
    hpDamage,
    sanityDamage,
    attackRolls,
    defenseRolls,
    attackSuccesses,
    defenseSuccesses,
    message
  };
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
  const items = getAllItems(player.inventory);
  return items.some(item =>
    item.type === 'weapon' &&
    (item.name.toLowerCase().includes('pistol') ||
     item.name.toLowerCase().includes('revolver') ||
     item.name.toLowerCase().includes('shotgun') ||
     item.name.toLowerCase().includes('rifle') ||
     item.name.toLowerCase().includes('tommy'))
  );
}

/**
 * Get combat dice preview for UI (Hero Quest style)
 * Shows attack dice based on weapon + any class bonus
 */
export function getCombatPreview(player: Player, isRanged: boolean = false): {
  totalDice: number;
  breakdown: string[];
} {
  const { attackDice, weaponName } = getAttackDice(player);
  const classBonusDice = player.specialAbility === 'combat_bonus' ? 1 : 0;

  const breakdown: string[] = [
    `${weaponName}: ${attackDice}d6`
  ];

  if (classBonusDice > 0) {
    breakdown.push(`Veteran bonus: +1d6`);
  }

  return {
    totalDice: attackDice + classBonusDice,
    breakdown
  };
}

/**
 * Get defense dice preview for UI (Hero Quest style)
 */
export function getDefensePreview(player: Player): {
  totalDice: number;
  breakdown: string[];
} {
  const defenseDice = getPlayerDefenseDice(player);
  const items = getAllItems(player.inventory);
  const armor = items.find(item => item.type === 'armor');

  const breakdown: string[] = [];
  if (armor) {
    breakdown.push(`${armor.name}: ${defenseDice}d6`);
  } else {
    breakdown.push(`Unna: ${defenseDice}d6`);
  }

  return {
    totalDice: defenseDice,
    breakdown
  };
}
