/**
 * Combat System Utilities for Shadows of the 1920s
 * HERO QUEST STYLE - Simplified combat system
 *
 * ATTACK:
 * 1. Roll [Weapon Dice] (weapon determines dice, not attribute + bonus)
 * 2. Count skulls (4, 5, 6 on d6) = Damage dealt
 *
 * DEFEND:
 * 1. Roll [Base Defense + Armor Dice]
 * 2. Count shields (4, 5, 6 on d6) = Damage blocked
 *
 * RESULT:
 * Final Damage = Skulls - Shields (minimum 0)
 */

import { Player, Enemy, Item, SkillType, SkillCheckResult, getAllItems, OccultistSpell } from '../types';
import { BESTIARY, CHARACTERS } from '../constants';

// Combat result interface
export interface CombatResult {
  hit: boolean;
  damage: number;
  rolls: number[];             // Attack rolls for display (alias for attackRolls)
  attackRolls: number[];
  attackSuccesses: number;     // "Skulls" - successful attack dice
  defenseRolls: number[];
  defenseSuccesses: number;    // "Shields" - successful defense dice
  criticalHit: boolean;        // All attack dice succeeded
  criticalMiss: boolean;       // All attack dice failed
  horrorTriggered: boolean;
  sanityLoss: number;
  message: string;
  successes: number;           // Alias for attackSuccesses for compatibility
}

// Horror check result
export interface HorrorCheckResult {
  resisted: boolean;
  sanityLoss: number;
  rolls: number[];
  successes: number;
  message: string;
}

// Spell cast result
export interface SpellCastResult {
  success: boolean;
  damage: number;
  rolls: number[];
  successes: number;
  spellUsed: OccultistSpell;
  message: string;
}

// DC for combat - roll this or higher to score a hit/block
const COMBAT_DC = 4; // 4, 5, 6 on d6 = success (50% chance per die)

// Dice rolling utility
export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

// Count successes against DC (skulls/shields)
export function countSuccesses(rolls: number[], dc: number = COMBAT_DC): number {
  return rolls.filter(roll => roll >= dc).length;
}

/**
 * Perform a skill check (non-combat)
 * Still uses: Base 2d6 + attribute value dice
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
 * Revolver/Derringer: 2-3 dice
 * Shotgun: 4 dice
 * Tommy Gun: 5 dice
 */
export function getAttackDice(player: Player): { attackDice: number; weaponName: string } {
  const items = getAllItems(player.inventory);

  // Find best weapon by attackDice
  let bestWeapon: Item | null = null;

  for (const item of items) {
    if (item.type === 'weapon' && item.attackDice) {
      if (!bestWeapon || (item.attackDice > (bestWeapon.attackDice || 0))) {
        bestWeapon = item;
      }
    }
  }

  if (bestWeapon && bestWeapon.attackDice) {
    return {
      attackDice: bestWeapon.attackDice,
      weaponName: bestWeapon.name
    };
  }

  // No weapon = use base attack dice (unarmed)
  const baseAttack = player.baseAttackDice || 1;
  return {
    attackDice: baseAttack,
    weaponName: 'Unarmed'
  };
}

/**
 * Get the equipped weapon's attack dice with full info
 * Hero Quest style: weapon DETERMINES total dice (not bonus)
 */
export function getWeaponAttackDice(player: Player): { attackDice: number; weaponName: string; isRanged: boolean; range: number } {
  const items = getAllItems(player.inventory);

  // Find best weapon in hand slots
  let bestWeapon: Item | null = null;

  for (const item of items) {
    if (item.type === 'weapon' && item.attackDice) {
      if (!bestWeapon || (item.attackDice > (bestWeapon.attackDice || 0))) {
        bestWeapon = item;
      }
    }
  }

  if (bestWeapon && bestWeapon.attackDice) {
    return {
      attackDice: bestWeapon.attackDice,
      weaponName: bestWeapon.name,
      isRanged: bestWeapon.weaponType === 'ranged',
      range: bestWeapon.range || 1
    };
  }

  // No weapon = use base attack dice (unarmed)
  const baseAttack = player.baseAttackDice || 1;
  return {
    attackDice: baseAttack,
    weaponName: 'Unarmed',
    isRanged: false,
    range: 1
  };
}

/**
 * Get total defense dice (base + armor)
 * Hero Quest style: base defense + armor defense dice
 */
export function getDefenseDice(player: Player): { defenseDice: number; armorName: string } {
  // Base defense from character class
  const baseDefense = player.baseDefenseDice || 2;

  // Get armor defense dice
  const items = getAllItems(player.inventory);
  let armorDefense = 0;
  let armorName = 'No Armor';

  for (const item of items) {
    if (item.type === 'armor' && item.defenseDice) {
      armorDefense = Math.max(armorDefense, item.defenseDice);
      armorName = item.name;
    }
  }

  return {
    defenseDice: baseDefense + armorDefense,
    armorName
  };
}

/**
 * Perform HERO QUEST STYLE attack
 *
 * ATTACK FLOW:
 * 1. Roll weapon dice (determined by weapon, not attribute)
 * 2. Veteran gets +1 die with melee weapons
 * 3. Count "skulls" (4, 5, 6)
 *
 * Enemy defense (if any) is handled separately
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
    attackRolls,
    attackSuccesses,
    defenseRolls,
    defenseSuccesses,
    successes: attackSuccesses,
    criticalHit,
    criticalMiss,
    horrorTriggered: false,
    sanityLoss: 0,
    message
  };
}

/**
 * Perform player defense roll
 * Hero Quest style: Roll defense dice, each 4+ blocks 1 damage
 */
export function performDefense(player: Player, incomingDamage: number): {
  damageBlocked: number;
  finalDamage: number;
  defenseRolls: number[];
  defenseSuccesses: number;
  message: string;
} {
  const defenseInfo = getDefenseDice(player);
  const defenseRolls = rollDice(defenseInfo.defenseDice);
  const defenseSuccesses = countSuccesses(defenseRolls, COMBAT_DC);

  const damageBlocked = Math.min(defenseSuccesses, incomingDamage);
  const finalDamage = Math.max(0, incomingDamage - defenseSuccesses);

  let message = '';
  if (finalDamage === 0 && incomingDamage > 0) {
    message = `${player.name} blokkerer all skade! (${defenseSuccesses} shields)`;
  } else if (damageBlocked > 0) {
    message = `${player.name} blokkerer ${damageBlocked} skade. Tar ${finalDamage} skade.`;
  } else {
    message = `${player.name} tar ${finalDamage} skade!`;
  }

  return {
    damageBlocked,
    finalDamage,
    defenseRolls,
    defenseSuccesses,
    message
  };
}

/**
 * Perform horror check when first seeing an enemy
 * Uses WIL attribute (still uses old skill check system for horror)
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

  // Veteran is immune to first horror check (Fearless ability)
  if (player.specialAbility === 'combat_bonus' && !player.madness.includes('first_horror_check')) {
    return {
      resisted: true,
      sanityLoss: 0,
      rolls: [],
      successes: 0,
      message: `${player.name} holder fatningen (Fearless).`
    };
  }

  // Professor gets +1 die on horror checks
  const classBonusDice = player.specialAbility === 'occult_immunity' ? 1 : 0;

  // DC based on enemy horror level
  const dc = enemy.horror <= 1 ? 3 : enemy.horror <= 2 ? 4 : 5;

  const baseDice = 2;
  const willpower = player.attributes.willpower;
  const totalDice = baseDice + willpower + classBonusDice;

  const rolls = rollDice(totalDice);
  const successes = countSuccesses(rolls, dc);
  const resisted = successes >= 1;

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
 * Check if player can attack enemy (range check)
 */
export function canAttackEnemy(player: Player, enemy: Enemy): {
  canAttack: boolean;
  reason: string;
} {
  const distance = Math.abs(player.position.q - enemy.position.q) +
                   Math.abs(player.position.r - enemy.position.r);

  const weaponInfo = getWeaponAttackDice(player);

  // Melee range check
  if (distance <= 1) {
    return { canAttack: true, reason: '' };
  }

  // Ranged weapon check
  if (weaponInfo.isRanged && distance <= weaponInfo.range) {
    return { canAttack: true, reason: '' };
  }

  if (distance > 1 && !weaponInfo.isRanged) {
    return { canAttack: false, reason: 'For langt unna for nærkamp. Trenger skytevåpen.' };
  }

  if (distance > weaponInfo.range) {
    return { canAttack: false, reason: `For langt unna. ${weaponInfo.weaponName} har rekkevidde ${weaponInfo.range}.` };
  }

  return { canAttack: false, reason: 'Kan ikke angripe fienden.' };
}

/**
 * Check if player has a ranged weapon
 */
export function hasRangedWeapon(player: Player): boolean {
  const weaponInfo = getWeaponAttackDice(player);
  return weaponInfo.isRanged;
}

/**
 * Get combat dice preview for UI (Hero Quest style)
 * Shows attack dice based on weapon + any class bonus
 */
export function getCombatPreview(player: Player): {
  attackDice: number;
  defenseDice: number;
  weaponName: string;
  armorName: string;
  breakdown: string[];
  totalDice: number;
} {
  const { attackDice, weaponName } = getAttackDice(player);
  const defenseDice = getPlayerDefenseDice(player);
  const items = getAllItems(player.inventory);
  const armor = items.find(item => item.type === 'armor');
  const armorName = armor?.name || 'Ingen rustning';
  const classBonusDice = player.specialAbility === 'combat_bonus' ? 1 : 0;

  const breakdown: string[] = [
    `${weaponName}: ${attackDice}d6`
  ];

  if (classBonusDice > 0) {
    breakdown.push(`Veteran bonus: +1d6`);
  }

  return {
    attackDice,
    defenseDice,
    weaponName,
    armorName,
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

// ============================================================================
// LEGACY COMPATIBILITY - Keep old function signatures working
// ============================================================================

/**
 * Legacy: Get weapon bonus (for old code that expects bonus system)
 * Returns attackDice as combatDice for backward compatibility
 */
export function getWeaponBonus(player: Player): { combatDice: number; damage: number } {
  const weaponInfo = getWeaponAttackDice(player);
  return {
    combatDice: weaponInfo.attackDice,
    damage: weaponInfo.attackDice // In Hero Quest style, more dice = more potential damage
  };
}
