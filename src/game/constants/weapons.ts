/**
 * WEAPONS AND ARMOR - Hero Quest Style Equipment
 *
 * In Hero Quest, the weapon DETERMINES your attack dice (not a bonus)
 * Weapon = Total attack dice. Higher tier weapons = more dice.
 * Defense dice = base defense + armor defense dice
 */

import { HQWeapon, HQArmor } from '../types';

// ============================================================================
// HERO QUEST STYLE WEAPONS
// ============================================================================

export const HQ_WEAPONS: HQWeapon[] = [
  // MELEE WEAPONS
  { id: 'unarmed', name: 'Unarmed', attackDice: 1, weaponType: 'melee', goldCost: 0, notes: 'Fists and feet' },
  { id: 'knife', name: 'Knife', attackDice: 2, weaponType: 'melee', goldCost: 50, silent: true, notes: 'Silent, concealable' },
  { id: 'club', name: 'Club / Pipe', attackDice: 2, weaponType: 'melee', goldCost: 30, notes: 'Improvised weapon' },
  { id: 'machete', name: 'Machete', attackDice: 3, weaponType: 'melee', goldCost: 150, notes: 'Heavy blade' },

  // RANGED WEAPONS
  { id: 'derringer', name: 'Derringer', attackDice: 2, weaponType: 'ranged', range: 2, ammo: 2, goldCost: 100, notes: 'Hidden, 2 shots' },
  { id: 'revolver', name: 'Revolver', attackDice: 3, weaponType: 'ranged', range: 3, ammo: 6, goldCost: 200, notes: 'Standard sidearm' },
  { id: 'shotgun', name: 'Shotgun', attackDice: 4, weaponType: 'ranged', range: 2, ammo: 2, goldCost: 400, notes: 'Devastating close range' },
  { id: 'rifle', name: 'Rifle', attackDice: 3, weaponType: 'ranged', range: 5, ammo: 5, goldCost: 350, notes: 'Long range precision' },
  { id: 'tommy_gun', name: 'Tommy Gun', attackDice: 5, weaponType: 'ranged', range: 1, ammo: 20, goldCost: 800, requiredLevel: 2, notes: 'Rare, devastating at close range only (neighbor tiles)' },

  // === NEW MELEE WEAPONS ===
  { id: 'brass_knuckles', name: 'Brass Knuckles', attackDice: 2, weaponType: 'melee', goldCost: 40, silent: true, notes: 'Concealable, +1 vs unarmored' },
  { id: 'fire_axe', name: 'Fire Axe', attackDice: 3, weaponType: 'melee', goldCost: 120, notes: 'Can break barricades easily' },
  { id: 'cavalry_saber', name: 'Cavalry Saber', attackDice: 3, weaponType: 'melee', goldCost: 180, notes: 'Elegant and deadly' },
  { id: 'sledgehammer', name: 'Sledgehammer', attackDice: 4, weaponType: 'melee', goldCost: 200, notes: 'Slow but devastating' },
  { id: 'ceremonial_dagger', name: 'Ceremonial Dagger', attackDice: 2, weaponType: 'melee', goldCost: 250, silent: true, notes: '+1 die vs cultists, occult origins' },
  { id: 'switchblade', name: 'Switchblade', attackDice: 1, weaponType: 'melee', goldCost: 25, silent: true, notes: 'Quick draw, easily hidden' },
  { id: 'war_trophy_club', name: 'War Trophy Club', attackDice: 3, weaponType: 'melee', goldCost: 100, notes: 'Carved bones from the Pacific Islands' },

  // === NEW RANGED WEAPONS ===
  { id: 'flare_gun', name: 'Flare Gun', attackDice: 2, weaponType: 'ranged', range: 3, ammo: 3, goldCost: 75, notes: 'Can illuminate dark areas, scares some creatures' },
  { id: 'crossbow', name: 'Crossbow', attackDice: 3, weaponType: 'ranged', range: 4, ammo: 1, goldCost: 250, silent: true, notes: 'Silent, slow reload' },
  { id: 'hunting_rifle', name: 'Hunting Rifle', attackDice: 4, weaponType: 'ranged', range: 6, ammo: 3, goldCost: 450, notes: 'Extreme range, powerful' },
  { id: 'sawed_off', name: 'Sawed-Off Shotgun', attackDice: 5, weaponType: 'ranged', range: 1, ammo: 2, goldCost: 350, notes: 'Devastating at point-blank' },
  { id: 'luger', name: 'Luger Pistol', attackDice: 3, weaponType: 'ranged', range: 3, ammo: 8, goldCost: 225, notes: 'German precision, quick reload' },
  { id: 'throwing_knives', name: 'Throwing Knives', attackDice: 2, weaponType: 'ranged', range: 2, ammo: 4, goldCost: 80, silent: true, notes: 'Silent, retrievable' }
];

// ============================================================================
// HERO QUEST STYLE ARMOR
// ============================================================================
// Roll defense dice, each 4+ blocks 1 damage (like shields in Hero Quest)

export const HQ_ARMOR: HQArmor[] = [
  { id: 'none', name: 'No Armor', defenseDice: 0, goldCost: 0 },
  { id: 'leather_jacket', name: 'Leather Jacket', defenseDice: 1, goldCost: 100, notes: 'Light protection' },
  { id: 'trench_coat', name: 'Trench Coat', defenseDice: 1, goldCost: 150, notes: 'Conceals weapons' },
  { id: 'armored_vest', name: 'Armored Vest', defenseDice: 2, goldCost: 500, requiredLevel: 2, notes: 'Military grade' },

  // === NEW ARMOR ===
  { id: 'wool_overcoat', name: 'Wool Overcoat', defenseDice: 1, goldCost: 80, notes: 'Warm, many pockets' },
  { id: 'police_vest', name: 'Police Vest', defenseDice: 2, goldCost: 400, notes: 'Standard issue protection' },
  { id: 'cultist_robes', name: 'Cultist Robes', defenseDice: 1, goldCost: 200, notes: 'Blends in with enemies, +1 vs horror' },
  { id: 'ritual_vestments', name: 'Ritual Vestments', defenseDice: 1, goldCost: 350, requiredLevel: 2, notes: '+1 die on occult checks' },
  { id: 'explorers_jacket', name: "Explorer's Jacket", defenseDice: 1, goldCost: 175, notes: 'Many pockets, +1 bag slot' },
  { id: 'sailors_coat', name: "Sailor's Oilskin", defenseDice: 1, goldCost: 125, notes: 'Waterproof, resists Deep One attacks' },
  { id: 'chain_mail_vest', name: 'Hidden Chain Mail', defenseDice: 2, goldCost: 600, requiredLevel: 3, notes: 'Ancient protection, concealed' },
  { id: 'elder_mantle', name: 'Elder Mantle', defenseDice: 2, goldCost: 800, requiredLevel: 3, notes: 'Woven with protective wards, +2 vs sanity loss' }
];

// ============================================================================
// UTILITY FUNCTIONS WITH ERROR HANDLING
// ============================================================================

/**
 * Get weapon by ID with error handling
 */
export function getWeaponById(weaponId: string): HQWeapon | null {
  const weapon = HQ_WEAPONS.find(w => w.id === weaponId);
  if (!weapon) {
    console.warn(`[Weapons] Unknown weapon ID: ${weaponId}`);
    return null;
  }
  return weapon;
}

/**
 * Get armor by ID with error handling
 */
export function getArmorById(armorId: string): HQArmor | null {
  const armor = HQ_ARMOR.find(a => a.id === armorId);
  if (!armor) {
    console.warn(`[Armor] Unknown armor ID: ${armorId}`);
    return null;
  }
  return armor;
}

/**
 * Get all melee weapons
 */
export function getMeleeWeapons(): HQWeapon[] {
  return HQ_WEAPONS.filter(w => w.weaponType === 'melee');
}

/**
 * Get all ranged weapons
 */
export function getRangedWeapons(): HQWeapon[] {
  return HQ_WEAPONS.filter(w => w.weaponType === 'ranged');
}

/**
 * Get weapons available at a specific level
 */
export function getWeaponsForLevel(level: number): HQWeapon[] {
  return HQ_WEAPONS.filter(w => !w.requiredLevel || w.requiredLevel <= level);
}

/**
 * Get armor available at a specific level
 */
export function getArmorForLevel(level: number): HQArmor[] {
  return HQ_ARMOR.filter(a => !a.requiredLevel || a.requiredLevel <= level);
}
