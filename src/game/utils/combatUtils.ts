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

import { Player, Enemy, Item, SkillType, SkillCheckResult, getAllItems, OccultistSpell, Tile, CharacterType, ExpandedCritResult, CriticalBonusType, CriticalPenaltyType } from '../types';
import { BESTIARY, CHARACTERS, calculateDesperateBonuses, getRandomCriticalBonuses, getRandomCriticalPenalty, CRITICAL_BONUSES, CRITICAL_PENALTIES } from '../constants';
import { hexDistance, hasLineOfSight } from '../hexUtils';

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
  // Expanded crits
  expandedCrit?: ExpandedCritResult;
  availableCritBonuses?: CriticalBonusType[];  // For UI to show choices
  appliedCritPenalty?: CriticalPenaltyType;    // Auto-applied penalty
  // Desperate measures
  desperateBonusesApplied?: {
    bonusAttackDice: number;
    bonusDamage: number;
  };
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
 * Check if a character class can use a specific weapon based on class restrictions
 * Returns true if the weapon is allowed, false if restricted
 *
 * WEAPON RESTRICTIONS BY CLASS:
 * - Veteran: Can use ALL weapons (no restrictions)
 * - Detective: Cannot use tommy_gun
 * - Professor: Can ONLY use derringer, knife (restricts: revolver, shotgun, tommy_gun, rifle, machete)
 * - Occultist: Can ONLY use knife, revolver (restricts: shotgun, tommy_gun, rifle, machete)
 * - Journalist: Cannot use shotgun, tommy_gun
 * - Doctor: Can ONLY use derringer, knife (same as Professor)
 *
 * This is the core implementation used by both canUseWeapon (for Player objects)
 * and directly by components that only have access to characterClass (e.g., MerchantShop)
 */
export function canCharacterClassUseWeapon(characterClass: CharacterType | string, weaponId: string): boolean {
  // Get character info
  const character = CHARACTERS[characterClass as keyof typeof CHARACTERS];
  if (!character) return true; // No restrictions if character not found

  const restrictions = character.weaponRestrictions || [];

  // Normalize weapon ID for comparison (handle both 'tommy' and 'tommy_gun')
  const normalizedId = weaponId.toLowerCase().replace(/_/g, '');
  const normalizedRestrictions = restrictions.map(r => r.toLowerCase().replace(/_/g, ''));

  return !normalizedRestrictions.some(r =>
    normalizedId.includes(r) || r.includes(normalizedId)
  );
}

/**
 * Check if a player can use a specific weapon based on class restrictions
 * Returns true if the weapon is allowed, false if restricted
 *
 * Convenience wrapper around canCharacterClassUseWeapon for use with Player objects
 */
export function canUseWeapon(player: Player, weaponId: string): boolean {
  return canCharacterClassUseWeapon(player.id, weaponId);
}

/**
 * Get the equipped weapon's attack dice with full info
 * Hero Quest style: weapon DETERMINES total dice (not bonus)
 *
 * IMPORTANT: This function respects class weapon restrictions.
 * If a player has a weapon they cannot use, they are treated as unarmed.
 */
export function getWeaponAttackDice(player: Player): {
  attackDice: number;
  weaponName: string;
  isRanged: boolean;
  range: number;
  isRestricted?: boolean;
  restrictedWeaponName?: string;
} {
  const items = getAllItems(player.inventory);

  // Find best USABLE weapon in hand slots (respecting class restrictions)
  let bestWeapon: Item | null = null;
  let restrictedWeapon: Item | null = null;

  for (const item of items) {
    if (item.type === 'weapon' && item.attackDice) {
      // Check if player can use this weapon
      if (canUseWeapon(player, item.id)) {
        if (!bestWeapon || (item.attackDice > (bestWeapon.attackDice || 0))) {
          bestWeapon = item;
        }
      } else {
        // Track restricted weapon for feedback
        restrictedWeapon = item;
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

  // No usable weapon = use base attack dice (unarmed)
  const baseAttack = player.baseAttackDice || 1;

  // If there's a restricted weapon, include that info for feedback
  if (restrictedWeapon) {
    return {
      attackDice: baseAttack,
      weaponName: 'Unarmed',
      isRanged: false,
      range: 1,
      isRestricted: true,
      restrictedWeaponName: restrictedWeapon.name
    };
  }

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
 * 2. Veteran gets +1 die with melee weapons ONLY (from REGELBOK.MD)
 * 3. Apply Desperate Measures bonuses if HP/Sanity is low
 * 4. Count "skulls" (4, 5, 6)
 * 5. Critical hit: All attack dice succeed = +1 bonus damage + choose bonus
 * 6. Critical miss: All attack dice fail = random penalty
 *
 * Enemy defense (if any) is handled separately
 */
export function performAttack(
  player: Player,
  enemy: Enemy,
  isRanged: boolean = false
): CombatResult {
  const dc = 4; // Standard Hero Quest DC (skulls)

  // Get weapon info including whether it's ranged
  const weaponInfo = getWeaponAttackDice(player);
  const attackDice = weaponInfo.attackDice;
  const weaponName = weaponInfo.weaponName;

  // Veteran class bonus: +1 attack die ONLY with melee weapons (REGELBOK.MD)
  // "Veteran: +1 angrepsterning med narkampvapen (melee)"
  const isVeteranWithMelee = player.specialAbility === 'combat_bonus' && !weaponInfo.isRanged;
  const classBonusDice = isVeteranWithMelee ? 1 : 0;

  // DESPERATE MEASURES: Check for bonuses from low HP/Sanity
  const desperateBonuses = calculateDesperateBonuses(player.hp, player.sanity);
  const desperateAttackBonus = desperateBonuses.bonusAttackDice;
  const desperateDamageBonus = desperateBonuses.bonusDamage;

  const totalAttackDice = attackDice + classBonusDice + desperateAttackBonus;

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

  // Add desperate damage bonus
  if (damage > 0 && desperateDamageBonus > 0) {
    damage += desperateDamageBonus;
  }

  // Critical hit: all attack dice succeeded AND more than defense
  const criticalHit = attackSuccesses === totalAttackDice && attackSuccesses > defenseSuccesses && totalAttackDice > 0;
  const criticalMiss = attackSuccesses === 0 && totalAttackDice > 0;

  // EXPANDED CRITS
  let expandedCrit: ExpandedCritResult | undefined;
  let availableCritBonuses: CriticalBonusType[] | undefined;
  let appliedCritPenalty: CriticalPenaltyType | undefined;

  // Critical hit bonus: +1 extra damage + player chooses additional bonus
  if (criticalHit && damage > 0) {
    damage += 1;
    // Get random bonus options for player to choose from
    const bonusOptions = getRandomCriticalBonuses(3);
    availableCritBonuses = bonusOptions.map(b => b.id);
    expandedCrit = {
      isCriticalHit: true,
      isCriticalMiss: false,
      bonusDamage: 1,
      message: 'KRITISK TREFF! Velg en bonus!'
    };
  }

  // Critical miss penalty: random penalty applied
  if (criticalMiss) {
    const penalty = getRandomCriticalPenalty();
    appliedCritPenalty = penalty.id;
    expandedCrit = {
      isCriticalHit: false,
      isCriticalMiss: true,
      bonusDamage: 0,
      penaltyApplied: penalty.id,
      message: `KRITISK BOM! ${penalty.name}: ${penalty.description}`
    };
  }

  // Build message with dice results
  const attackDiceStr = attackRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');
  const defenseDiceStr = defenseRolls.map(r => r >= dc ? `[${r}]` : `${r}`).join(' ');

  // Add desperate measures info to message if active
  const desperateInfo = desperateAttackBonus > 0 || desperateDamageBonus > 0
    ? ` [Desperat: +${desperateAttackBonus} terninger, +${desperateDamageBonus} skade]`
    : '';

  let message = '';
  if (criticalHit) {
    message = `KRITISK TREFF! ${player.name} (${weaponName}) knuser ${enemy.name}! ${damage} skade!${desperateInfo} (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
  } else if (criticalMiss) {
    const penaltyMsg = expandedCrit ? ` - ${expandedCrit.message}` : '';
    message = `BOMMERT! ${player.name} (${weaponName}) treffer ikke!${penaltyMsg} (${attackDiceStr})`;
  } else if (damage > 0) {
    message = `TREFF! ${player.name} (${weaponName}) gjor ${damage} skade mot ${enemy.name}.${desperateInfo} (Angrep: ${attackDiceStr} = ${attackSuccesses} | Forsvar: ${defenseDiceStr} = ${defenseSuccesses})`;
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
    message,
    // Expanded crits
    expandedCrit,
    availableCritBonuses,
    appliedCritPenalty,
    // Desperate measures
    desperateBonusesApplied: (desperateAttackBonus > 0 || desperateDamageBonus > 0) ? {
      bonusAttackDice: desperateAttackBonus,
      bonusDamage: desperateDamageBonus
    } : undefined
  };
}

/**
 * Perform player defense roll
 * Hero Quest style: Roll defense dice, each 4+ blocks 1 damage
 * Now includes Desperate Measures defense bonus
 */
export function performDefense(player: Player, incomingDamage: number): {
  damageBlocked: number;
  finalDamage: number;
  defenseRolls: number[];
  defenseSuccesses: number;
  message: string;
  desperateBonusApplied?: number;
} {
  const defenseInfo = getDefenseDice(player);

  // DESPERATE MEASURES: Check for defense bonus from low HP
  const desperateBonuses = calculateDesperateBonuses(player.hp, player.sanity);
  const totalDefenseDice = defenseInfo.defenseDice + desperateBonuses.bonusDefenseDice;

  const defenseRolls = rollDice(totalDefenseDice);
  const defenseSuccesses = countSuccesses(defenseRolls, COMBAT_DC);

  const damageBlocked = Math.min(defenseSuccesses, incomingDamage);
  const finalDamage = Math.max(0, incomingDamage - defenseSuccesses);

  const desperateInfo = desperateBonuses.bonusDefenseDice > 0
    ? ` [Overlevelsesinstinkt: +${desperateBonuses.bonusDefenseDice} terninger]`
    : '';

  let message = '';
  if (finalDamage === 0 && incomingDamage > 0) {
    message = `${player.name} blokkerer all skade!${desperateInfo} (${defenseSuccesses} shields)`;
  } else if (damageBlocked > 0) {
    message = `${player.name} blokkerer ${damageBlocked} skade.${desperateInfo} Tar ${finalDamage} skade.`;
  } else {
    message = `${player.name} tar ${finalDamage} skade!`;
  }

  return {
    damageBlocked,
    finalDamage,
    defenseRolls,
    defenseSuccesses,
    message,
    desperateBonusApplied: desperateBonuses.bonusDefenseDice > 0 ? desperateBonuses.bonusDefenseDice : undefined
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
 * @param globalEnemyAttackBonus - Bonus attack dice from event cards (buff_enemies effect)
 */
export function calculateEnemyDamage(enemy: Enemy, player: Player, globalEnemyAttackBonus: number = 0): {
  hpDamage: number;
  sanityDamage: number;
  attackRolls: number[];
  defenseRolls: number[];
  attackSuccesses: number;
  defenseSuccesses: number;
  message: string;
} {
  const dc = 4; // Standard Hero Quest DC (skulls)

  // Get attack dice from bestiary + global bonus from events
  const bestiaryEntry = BESTIARY[enemy.type];
  const baseAttackDice = bestiaryEntry?.attackDice || 1;
  const attackDice = baseAttackDice + globalEnemyAttackBonus;

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
 * Check if player can attack enemy (range check + weapon restrictions + line of sight)
 * Uses proper hex distance calculation for accurate range checking
 *
 * CHECKS PERFORMED:
 * 1. Weapon restrictions - class-based weapon limits
 * 2. Range check based on weapon type:
 *    - MELEE: Can only attack adjacent enemies (distance <= 1)
 *    - RANGED: Can attack enemies within weapon range
 * 3. Line of sight (for ranged weapons) - walls and closed doors block shots
 * 4. Distance is calculated using hex grid distance (not Manhattan)
 *
 * @param player - The attacking player
 * @param enemy - The target enemy
 * @param board - Optional board tiles for line-of-sight checking (required for ranged)
 */
export function canAttackEnemy(
  player: Player,
  enemy: Enemy,
  board?: Tile[]
): {
  canAttack: boolean;
  reason: string;
  isRestricted?: boolean;
} {
  // Use proper hex distance calculation
  const distance = hexDistance(player.position, enemy.position);

  const weaponInfo = getWeaponAttackDice(player);

  // Check if player has a restricted weapon (class cannot use it)
  if (weaponInfo.isRestricted) {
    return {
      canAttack: distance <= 1, // Can still attack if adjacent (unarmed)
      reason: distance <= 1
        ? `${weaponInfo.restrictedWeaponName} kan ikke brukes av denne klassen. Angriper ubevæpnet.`
        : `${weaponInfo.restrictedWeaponName} kan ikke brukes av denne klassen. Må være i naborute for ubevæpnet angrep.`,
      isRestricted: true
    };
  }

  // Melee weapons: can only attack adjacent enemies (distance <= 1)
  if (!weaponInfo.isRanged) {
    if (distance <= 1) {
      return { canAttack: true, reason: '' };
    }
    return {
      canAttack: false,
      reason: `For langt unna for nærkamp. ${weaponInfo.weaponName} kan bare angripe i samme eller nabo-rute.`
    };
  }

  // Ranged weapons: check weapon range first
  if (distance > weaponInfo.range) {
    return {
      canAttack: false,
      reason: `For langt unna. ${weaponInfo.weaponName} har rekkevidde ${weaponInfo.range} (avstand: ${Math.round(distance)}).`
    };
  }

  // For ranged weapons at distance > 1, check line of sight (if board is provided)
  if (board && distance > 1) {
    const hasLOS = hasLineOfSight(player.position, enemy.position, board, weaponInfo.range);
    if (!hasLOS) {
      return {
        canAttack: false,
        reason: `Ingen siktlinje til ${enemy.name}. Vegger eller lukkede dører blokkerer skuddet.`
      };
    }
  }

  // All checks passed
  return { canAttack: true, reason: '' };
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
 * Veteran only gets +1 die with melee weapons (per REGELBOK.MD)
 */
export function getCombatPreview(player: Player): {
  attackDice: number;
  defenseDice: number;
  weaponName: string;
  armorName: string;
  breakdown: string[];
  totalDice: number;
} {
  const weaponInfo = getWeaponAttackDice(player);
  const attackDice = weaponInfo.attackDice;
  const weaponName = weaponInfo.weaponName;
  const defenseDice = getPlayerDefenseDice(player);
  const items = getAllItems(player.inventory);
  const armor = items.find(item => item.type === 'armor');
  const armorName = armor?.name || 'Ingen rustning';

  // Veteran only gets +1 die with melee weapons (REGELBOK.MD)
  const isVeteranWithMelee = player.specialAbility === 'combat_bonus' && !weaponInfo.isRanged;
  const classBonusDice = isVeteranWithMelee ? 1 : 0;

  const breakdown: string[] = [
    `${weaponName}: ${attackDice}d6`
  ];

  if (classBonusDice > 0) {
    breakdown.push(`Veteran melee bonus: +1d6`);
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

// ============================================================================
// EXPANDED CRITS - Apply chosen bonuses and penalties
// ============================================================================

/**
 * Apply a critical hit bonus chosen by the player
 */
export function applyCriticalBonus(
  player: Player,
  bonusType: CriticalBonusType
): {
  newHp?: number;
  newSanity?: number;
  newInsight?: number;
  grantsFreeAttack: boolean;
  message: string;
} {
  const bonus = CRITICAL_BONUSES.find(b => b.id === bonusType);
  if (!bonus) {
    return { grantsFreeAttack: false, message: 'Ukjent bonus' };
  }

  switch (bonusType) {
    case 'extra_attack':
      return {
        grantsFreeAttack: true,
        message: `${player.name} får et gratis ekstra angrep!`
      };

    case 'heal_hp':
      const newHp = Math.min(player.maxHp, player.hp + 1);
      return {
        newHp,
        grantsFreeAttack: false,
        message: `${player.name} gjenoppretter 1 HP! (${player.hp} → ${newHp})`
      };

    case 'gain_insight':
      const newInsight = player.insight + 1;
      return {
        newInsight,
        grantsFreeAttack: false,
        message: `${player.name} får +1 Insight!`
      };

    case 'recover_sanity':
      const newSanity = Math.min(player.maxSanity, player.sanity + 1);
      return {
        newSanity,
        grantsFreeAttack: false,
        message: `${player.name} gjenoppretter 1 Sanity! (${player.sanity} → ${newSanity})`
      };

    default:
      return { grantsFreeAttack: false, message: 'Ukjent bonus' };
  }
}

/**
 * Apply a critical miss penalty
 */
export function applyCriticalPenalty(
  player: Player,
  penaltyType: CriticalPenaltyType,
  enemy?: Enemy
): {
  counterAttackDamage?: number;
  loseAPNextRound?: number;
  droppedItemId?: string;
  attractEnemy?: boolean;
  message: string;
} {
  const penalty = CRITICAL_PENALTIES.find(p => p.id === penaltyType);
  if (!penalty) {
    return { message: 'Ingen straff' };
  }

  switch (penaltyType) {
    case 'counter_attack':
      // Enemy gets a free counter attack
      if (enemy) {
        const bestiaryEntry = BESTIARY[enemy.type];
        const counterDamage = bestiaryEntry?.attackDice || 1;
        return {
          counterAttackDamage: counterDamage,
          message: `${enemy.name} utnytter åpningen og slår tilbake!`
        };
      }
      return { message: 'Fienden utnytter åpningen!' };

    case 'lose_ap':
      return {
        loseAPNextRound: 1,
        message: `${player.name} mister 1 AP neste runde fra ubalanse!`
      };

    case 'drop_item':
      // Find a random non-essential item to drop
      const items = getAllItems(player.inventory).filter(
        item => item.type !== 'quest_item' && !item.isQuestItem
      );
      if (items.length > 0) {
        const droppedItem = items[Math.floor(Math.random() * items.length)];
        return {
          droppedItemId: droppedItem.id,
          message: `${player.name} mister taket på ${droppedItem.name}!`
        };
      }
      return { message: `${player.name} snubler men holder fast på utstyret.` };

    case 'attract_enemy':
      return {
        attractEnemy: true,
        message: `Støyen tiltrekker oppmerksomhet... en fiende nærmer seg!`
      };

    default:
      return { message: 'Ingen straff' };
  }
}

// ============================================================================
// DESPERATE MEASURES - Get combat preview with desperate bonuses
// ============================================================================

/**
 * Get combat preview including desperate measures bonuses
 */
export function getCombatPreviewWithDesperate(player: Player): {
  attackDice: number;
  defenseDice: number;
  weaponName: string;
  armorName: string;
  breakdown: string[];
  totalDice: number;
  desperateBonuses: {
    bonusAP: number;
    bonusAttackDice: number;
    bonusDefenseDice: number;
    bonusDamage: number;
    autoFailSkills: string[];
  };
  isDesperateActive: boolean;
} {
  const weaponInfo = getWeaponAttackDice(player);
  const attackDice = weaponInfo.attackDice;
  const weaponName = weaponInfo.weaponName;
  const defenseDice = getPlayerDefenseDice(player);
  const items = getAllItems(player.inventory);
  const armor = items.find(item => item.type === 'armor');
  const armorName = armor?.name || 'Ingen rustning';

  // Get desperate bonuses
  const desperateBonuses = calculateDesperateBonuses(player.hp, player.sanity);

  // Veteran only gets +1 die with melee weapons (REGELBOK.MD)
  const isVeteranWithMelee = player.specialAbility === 'combat_bonus' && !weaponInfo.isRanged;
  const classBonusDice = isVeteranWithMelee ? 1 : 0;

  const breakdown: string[] = [
    `${weaponName}: ${attackDice}d6`
  ];

  if (classBonusDice > 0) {
    breakdown.push(`Veteran melee bonus: +1d6`);
  }

  if (desperateBonuses.bonusAttackDice > 0) {
    breakdown.push(`Desperat tiltak: +${desperateBonuses.bonusAttackDice}d6 angrep`);
  }

  if (desperateBonuses.bonusDamage > 0) {
    breakdown.push(`Siste Kamp: +${desperateBonuses.bonusDamage} skade`);
  }

  if (desperateBonuses.bonusDefenseDice > 0) {
    breakdown.push(`Overlevelsesinstinkt: +${desperateBonuses.bonusDefenseDice}d6 forsvar`);
  }

  if (desperateBonuses.autoFailSkills.length > 0) {
    breakdown.push(`⚠️ Auto-fail: ${desperateBonuses.autoFailSkills.join(', ')}`);
  }

  const isDesperateActive = desperateBonuses.bonusAP > 0 ||
    desperateBonuses.bonusAttackDice > 0 ||
    desperateBonuses.bonusDefenseDice > 0 ||
    desperateBonuses.bonusDamage > 0;

  return {
    attackDice,
    defenseDice,
    weaponName,
    armorName,
    totalDice: attackDice + classBonusDice + desperateBonuses.bonusAttackDice,
    breakdown,
    desperateBonuses,
    isDesperateActive
  };
}
