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
  attackRolls: number[];
  attackSuccesses: number;     // "Skulls" - successful attack dice
  defenseRolls: number[];
  defenseSuccesses: number;    // "Shields" - successful defense dice
  criticalHit: boolean;        // All attack dice succeeded
  criticalMiss: boolean;       // All attack dice failed
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
 * Get the equipped weapon's attack dice
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
  // Get weapon attack dice
  const weaponInfo = getWeaponAttackDice(player);
  let attackDice = weaponInfo.attackDice;

  // Auto-determine if ranged based on weapon
  const actuallyRanged = weaponInfo.isRanged;

  // Veteran gets +1 attack die with melee weapons
  if (player.specialAbility === 'combat_bonus' && !actuallyRanged) {
    attackDice += 1;
  }

  // Roll attack dice
  const attackRolls = rollDice(attackDice);
  const attackSuccesses = countSuccesses(attackRolls, COMBAT_DC);

  // Critical checks
  const criticalHit = attackSuccesses === attackDice && attackDice > 0;
  const criticalMiss = attackSuccesses === 0;

  // Calculate raw damage (skulls)
  let damage = attackSuccesses;

  // Critical hit doubles damage
  if (criticalHit) {
    damage *= 2;
  }

  // Enemy takes damage reduction from "massive" trait
  if (enemy.traits?.includes('massive') && damage > 0) {
    damage = Math.max(1, damage - 1);
  }

  // Build message
  let message = '';
  if (criticalHit) {
    message = `KRITISK TREFF! ${player.name} knuser ${enemy.name} med ${weaponInfo.weaponName}! (${damage} skade)`;
  } else if (criticalMiss) {
    message = `BOMMERT! ${player.name} treffer ikke ${enemy.name}.`;
  } else if (attackSuccesses > 0) {
    message = `TREFF! ${player.name} gjør ${damage} skade mot ${enemy.name} med ${weaponInfo.weaponName}.`;
  } else {
    message = `BOMMERT! ${player.name} treffer ikke ${enemy.name}.`;
  }

  return {
    hit: attackSuccesses > 0,
    damage,
    attackRolls,
    attackSuccesses,
    defenseRolls: [],
    defenseSuccesses: 0,
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
 * Cast an Occultist spell (Hero Quest Elf-style magic)
 */
export function castSpell(
  player: Player,
  spell: OccultistSpell,
  target?: Enemy
): SpellCastResult {
  // Check if player can cast spells
  if (!player.canCastSpells) {
    return {
      success: false,
      damage: 0,
      rolls: [],
      successes: 0,
      spellUsed: spell,
      message: `${player.name} kan ikke kaste trylleformler!`
    };
  }

  // Check spell uses
  if (spell.usesPerScenario !== -1 && (spell.currentUses || 0) >= spell.usesPerScenario) {
    return {
      success: false,
      damage: 0,
      rolls: [],
      successes: 0,
      spellUsed: spell,
      message: `${spell.name} er brukt opp for dette scenariet!`
    };
  }

  let rolls: number[] = [];
  let successes = 0;
  let damage = 0;

  // Handle different spell effects
  switch (spell.effect) {
    case 'attack':
    case 'attack_horror':
      // Attack spells: roll attackDice, count successes as damage
      rolls = rollDice(spell.attackDice);
      successes = countSuccesses(rolls, COMBAT_DC);
      damage = successes;

      // Add horror damage for attack_horror spells
      if (spell.effect === 'attack_horror' && spell.horrorDamage && target) {
        // This would reduce enemy morale/cause them to flee in future implementation
      }
      break;

    case 'banish':
      // Banish: Uses WIL check vs DC 5
      const wilDice = 2 + player.attributes.willpower;
      rolls = rollDice(wilDice);
      successes = countSuccesses(rolls, 5);
      // Banish instantly destroys weak enemies (HP <= 3)
      if (successes > 0 && target && target.hp <= 3) {
        damage = target.hp; // Instant kill
      }
      break;

    case 'defense':
      // Defense boost is handled separately in combat
      successes = 1; // Auto-success
      break;

    case 'utility':
      // Utility spells always succeed
      successes = 1;
      break;
  }

  const success = successes > 0 || spell.effect === 'defense' || spell.effect === 'utility';

  let message = '';
  if (success) {
    if (spell.effect === 'attack' || spell.effect === 'attack_horror') {
      message = `${player.name} kaster ${spell.name}! ${damage} skade${target ? ` mot ${target.name}` : ''}.`;
    } else if (spell.effect === 'banish') {
      if (damage > 0) {
        message = `${player.name} kaster ${spell.name}! ${target?.name} forsvinner i tomhet!`;
      } else {
        message = `${player.name} kaster ${spell.name}, men ${target?.name} motstår!`;
      }
    } else if (spell.effect === 'defense') {
      message = `${player.name} aktiverer ${spell.name}! +${spell.defenseBonus} forsvarsterninger denne runden.`;
    } else {
      message = `${player.name} kaster ${spell.name}!`;
    }
  } else {
    message = `${player.name} mislykkes med å kaste ${spell.name}!`;
  }

  return {
    success,
    damage,
    rolls,
    successes,
    spellUsed: spell,
    message
  };
}

/**
 * Calculate enemy attack damage
 * Enemy attacks are simplified - they just deal their damage value
 * Player can defend with defense rolls
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
    sanityDamage = enemy.damage;
    hpDamage = 0;
  } else if (enemy.attackType === 'doom') {
    sanityDamage = Math.ceil(enemy.damage / 2);
  }

  // Fast enemies get bonus damage
  if (enemy.traits?.includes('fast')) {
    hpDamage += 1;
  }

  const message = `${enemy.name} angriper ${player.name}! ${hpDamage} potensiell skade${sanityDamage > 0 ? `, ${sanityDamage} Sanity tap` : ''}.`;

  return { hpDamage, sanityDamage, message };
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
 * Get combat dice preview for UI
 * Hero Quest style: shows weapon dice and defense dice
 */
export function getCombatPreview(player: Player): {
  attackDice: number;
  defenseDice: number;
  weaponName: string;
  armorName: string;
  breakdown: string[];
} {
  const weaponInfo = getWeaponAttackDice(player);
  const defenseInfo = getDefenseDice(player);

  let attackDice = weaponInfo.attackDice;

  // Veteran melee bonus
  if (player.specialAbility === 'combat_bonus' && !weaponInfo.isRanged) {
    attackDice += 1;
  }

  const breakdown: string[] = [
    `Attack: ${attackDice}d6 (${weaponInfo.weaponName})`,
    `Defense: ${defenseInfo.defenseDice}d6 (Base ${player.baseDefenseDice || 2} + ${defenseInfo.armorName})`
  ];

  if (player.specialAbility === 'combat_bonus' && !weaponInfo.isRanged) {
    breakdown.push('Veteran bonus: +1 melee attack die');
  }

  return {
    attackDice,
    defenseDice: defenseInfo.defenseDice,
    weaponName: weaponInfo.weaponName,
    armorName: defenseInfo.armorName,
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
