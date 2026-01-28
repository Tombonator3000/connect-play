/**
 * Monster Constants
 * Extracted from monsterAI.ts for better modularity
 *
 * Contains static configuration data for monsters:
 * - Spawn tables by tile category
 * - Behavior definitions
 * - Personality configurations
 * - Target preferences
 */

import {
  EnemyType,
  TileCategory,
  MonsterPersonality,
  MonsterCombatStyle
} from '../types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MonsterBehavior = 'aggressive' | 'defensive' | 'ranged' | 'ambusher' | 'patrol' | 'swarm';
export type MonsterState = 'idle' | 'patrol' | 'alert' | 'hunting' | 'fleeing';
export type SpecialMovement = 'teleport' | 'phase' | 'burrow' | 'swim' | 'fly';

export interface SpawnConfig {
  type: EnemyType;
  weight: number;    // Higher = more likely
  minDoom: number;   // Minimum doom level to spawn
  maxDoom: number;   // Maximum doom level to spawn (255 = no limit)
}

export interface TargetPreferences {
  preferLowHp: boolean;
  preferLowSanity: boolean;
  preferIsolated: boolean;
  preferClass?: string[];
  avoidClass?: string[];
  preferWater?: boolean;
}

export interface CombatStyleModifiers {
  attackBonus: number;
  defenseBonus: number;
  retreatAfterAttack: boolean;
  prefersFlanking: boolean;
  staysAtRange: boolean;
}

// ============================================================================
// SPAWN TABLES BY TILE CATEGORY
// ============================================================================

export const SPAWN_TABLES: Record<TileCategory | 'default', SpawnConfig[]> = {
  nature: [
    { type: 'cultist', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'dark_young', weight: 5, minDoom: 0, maxDoom: 6 },
    // New monsters
    { type: 'zoog', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'gnoph_keh', weight: 5, minDoom: 0, maxDoom: 5 },
    { type: 'tcho_tcho', weight: 10, minDoom: 0, maxDoom: 255 },
  ],
  urban: [
    { type: 'cultist', weight: 35, minDoom: 0, maxDoom: 255 },
    { type: 'sniper', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'priest', weight: 10, minDoom: 0, maxDoom: 5 },
    // New monsters
    { type: 'tcho_tcho', weight: 10, minDoom: 0, maxDoom: 255 },
    { type: 'serpent_man', weight: 5, minDoom: 0, maxDoom: 6 },
  ],
  street: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'hound', weight: 10, minDoom: 0, maxDoom: 5 },
    // New monsters
    { type: 'rat_thing', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'dimensional_shambler', weight: 5, minDoom: 0, maxDoom: 4 },
  ],
  facade: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    // New monsters
    { type: 'serpent_man', weight: 10, minDoom: 0, maxDoom: 255 },
  ],
  foyer: [
    { type: 'cultist', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
    // New monsters
    { type: 'rat_thing', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'serpent_man', weight: 10, minDoom: 0, maxDoom: 6 },
  ],
  corridor: [
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'nightgaunt', weight: 10, minDoom: 0, maxDoom: 6 },
    // New monsters
    { type: 'rat_thing', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'dimensional_shambler', weight: 8, minDoom: 0, maxDoom: 5 },
  ],
  room: [
    { type: 'cultist', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'mi-go', weight: 10, minDoom: 0, maxDoom: 255 },
    // New monsters
    { type: 'rat_thing', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'serpent_man', weight: 10, minDoom: 0, maxDoom: 255 },
    { type: 'fire_vampire', weight: 5, minDoom: 0, maxDoom: 5 },
  ],
  stairs: [
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    // New monsters
    { type: 'ghast', weight: 15, minDoom: 0, maxDoom: 255 },
  ],
  basement: [
    { type: 'ghoul', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'formless_spawn', weight: 12, minDoom: 0, maxDoom: 5 },
    // New monsters
    { type: 'ghast', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'gug', weight: 5, minDoom: 0, maxDoom: 4 },
    { type: 'cthonian', weight: 8, minDoom: 0, maxDoom: 5 },
    { type: 'elder_thing', weight: 3, minDoom: 0, maxDoom: 3 },
  ],
  crypt: [
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'shoggoth', weight: 5, minDoom: 0, maxDoom: 4 },
    { type: 'star_spawn', weight: 2, minDoom: 0, maxDoom: 2 },
    // New monsters
    { type: 'ghast', weight: 18, minDoom: 0, maxDoom: 255 },
    { type: 'gug', weight: 8, minDoom: 0, maxDoom: 5 },
    { type: 'flying_polyp', weight: 3, minDoom: 0, maxDoom: 3 },
    { type: 'lloigor', weight: 2, minDoom: 0, maxDoom: 3 },
    { type: 'colour_out_of_space', weight: 1, minDoom: 0, maxDoom: 2 },
  ],
  default: [
    { type: 'cultist', weight: 35, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 18, minDoom: 0, maxDoom: 255 },
    { type: 'deepone', weight: 12, minDoom: 0, maxDoom: 255 },
    // New monsters
    { type: 'rat_thing', weight: 10, minDoom: 0, maxDoom: 255 },
    { type: 'ghast', weight: 8, minDoom: 0, maxDoom: 255 },
    { type: 'tcho_tcho', weight: 7, minDoom: 0, maxDoom: 255 },
  ]
};

// ============================================================================
// MONSTER BEHAVIOR DEFINITIONS
// ============================================================================

export const MONSTER_BEHAVIORS: Record<EnemyType, MonsterBehavior> = {
  cultist: 'aggressive',
  deepone: 'aggressive',
  ghoul: 'ambusher',
  shoggoth: 'aggressive',
  boss: 'aggressive',
  sniper: 'ranged',
  priest: 'defensive',
  'mi-go': 'ranged',
  nightgaunt: 'ambusher',
  hound: 'aggressive',
  dark_young: 'aggressive',
  byakhee: 'aggressive',
  star_spawn: 'aggressive',
  formless_spawn: 'swarm',
  hunting_horror: 'aggressive',
  moon_beast: 'ranged',
  // New monsters (2026-01-22)
  ghast: 'ambusher',           // Hunts in darkness
  zoog: 'swarm',               // Attacks in groups
  rat_thing: 'ambusher',       // Sneaky and fast
  fire_vampire: 'ranged',      // Attacks from distance with fire
  dimensional_shambler: 'ambusher', // Teleports to ambush
  serpent_man: 'ranged',       // Uses hypnosis/ranged
  gug: 'aggressive',           // Direct attacker
  cthonian: 'ambusher',        // Burrows and ambushes
  tcho_tcho: 'aggressive',     // Fanatical attackers
  flying_polyp: 'aggressive',  // Devastating wind attacks
  lloigor: 'ranged',           // Uses telekinesis
  gnoph_keh: 'aggressive',     // Territorial hunter
  colour_out_of_space: 'defensive', // Drains slowly
  elder_thing: 'defensive'     // Ancient and cautious
};

// ============================================================================
// MONSTER PERSONALITY SYSTEM
// ============================================================================

// IMPROVED (2026-01-28): Increased aggression levels across the board
// Monsters are now more active hunters and less hesitant
export const MONSTER_PERSONALITIES: Record<EnemyType, MonsterPersonality> = {
  cultist: {
    aggressionLevel: 80, // Increased from 70
    cowardiceThreshold: 25, // Reduced from 30
    packMentality: true,
    territorialRange: 10, // Increased from 8
    preferredTerrain: ['crypt', 'room'],
    combatStyle: 'tactical',
    specialAbilities: ['charge'],
    callForHelpChance: 60
  },

  deepone: {
    aggressionLevel: 90, // Increased from 80
    cowardiceThreshold: 15, // Reduced from 20
    packMentality: true,
    territorialRange: 8, // Increased from 6
    preferredTerrain: ['basement', 'nature'],
    combatStyle: 'berserker',
    specialAbilities: ['drag_under'],
    callForHelpChance: 40
  },

  ghoul: {
    aggressionLevel: 65, // Increased from 50
    cowardiceThreshold: 30, // Reduced from 40
    packMentality: true,
    territorialRange: 6, // Increased from 4
    preferredTerrain: ['crypt', 'basement'],
    avoidsTerrain: ['urban', 'street'],
    combatStyle: 'ambush',
    specialAbilities: ['pack_tactics'],
    callForHelpChance: 80
  },

  shoggoth: {
    aggressionLevel: 100,
    cowardiceThreshold: 0,
    packMentality: false,
    territorialRange: 255,
    combatStyle: 'berserker',
    specialAbilities: ['enrage'],
    callForHelpChance: 0
  },

  boss: {
    aggressionLevel: 90,
    cowardiceThreshold: 0,
    packMentality: false,
    territorialRange: 255,
    combatStyle: 'berserker',
    specialAbilities: ['devour', 'cosmic_presence'],
    callForHelpChance: 30
  },

  sniper: {
    aggressionLevel: 55, // Increased from 40
    cowardiceThreshold: 40, // Reduced from 50
    packMentality: false,
    territorialRange: 12, // Increased from 10
    preferredTerrain: ['room', 'corridor'],
    combatStyle: 'siege',
    specialAbilities: ['snipe'],
    callForHelpChance: 70
  },

  priest: {
    aggressionLevel: 50, // Increased from 30
    cowardiceThreshold: 50, // Reduced from 60
    packMentality: false,
    territorialRange: 5, // Increased from 3
    preferredTerrain: ['crypt', 'room'],
    combatStyle: 'cautious',
    specialAbilities: ['summon', 'ritual'],
    callForHelpChance: 100
  },

  'mi-go': {
    aggressionLevel: 75, // Increased from 60
    cowardiceThreshold: 30, // Reduced from 40
    packMentality: true,
    territorialRange: 10, // Increased from 8
    preferredTerrain: ['nature', 'basement'],
    combatStyle: 'hit_and_run',
    specialAbilities: ['ranged_shot'],
    callForHelpChance: 50
  },

  nightgaunt: {
    aggressionLevel: 70, // Increased from 55
    cowardiceThreshold: 20, // Reduced from 25
    packMentality: false,
    territorialRange: 15, // Increased from 12
    combatStyle: 'ambush',
    specialAbilities: ['phasing', 'terrify'],
    callForHelpChance: 0
  },

  hound: {
    aggressionLevel: 95,
    cowardiceThreshold: 10,
    packMentality: false,
    territorialRange: 255,
    combatStyle: 'berserker',
    specialAbilities: ['teleport'],
    callForHelpChance: 0
  },

  dark_young: {
    aggressionLevel: 85,
    cowardiceThreshold: 15,
    packMentality: false,
    territorialRange: 6,
    preferredTerrain: ['nature', 'crypt'],
    combatStyle: 'berserker',
    specialAbilities: ['ritual'],
    callForHelpChance: 20
  },

  byakhee: {
    aggressionLevel: 75,
    cowardiceThreshold: 35,
    packMentality: true,
    territorialRange: 15,
    combatStyle: 'hit_and_run',
    specialAbilities: ['swoop'],
    callForHelpChance: 60
  },

  star_spawn: {
    aggressionLevel: 85,
    cowardiceThreshold: 5,
    packMentality: false,
    territorialRange: 10,
    preferredTerrain: ['crypt'],
    combatStyle: 'berserker',
    specialAbilities: ['cosmic_presence', 'terrify'],
    callForHelpChance: 0
  },

  formless_spawn: {
    aggressionLevel: 65,
    cowardiceThreshold: 0,
    packMentality: true,
    territorialRange: 5,
    preferredTerrain: ['basement', 'crypt'],
    combatStyle: 'swarm',
    specialAbilities: ['regenerate'],
    callForHelpChance: 100
  },

  hunting_horror: {
    aggressionLevel: 90,
    cowardiceThreshold: 20,
    packMentality: false,
    territorialRange: 20,
    combatStyle: 'hit_and_run',
    specialAbilities: ['terrify', 'swoop'],
    callForHelpChance: 0
  },

  moon_beast: {
    aggressionLevel: 50,
    cowardiceThreshold: 45,
    packMentality: true,
    territorialRange: 8,
    combatStyle: 'siege',
    specialAbilities: ['ranged_shot'],
    callForHelpChance: 70
  },

  // New monsters (2026-01-22) - Updated 2026-01-28 with increased aggression
  ghast: {
    aggressionLevel: 75, // Increased from 60
    cowardiceThreshold: 25, // Reduced from 30
    packMentality: true,
    territorialRange: 8, // Increased from 6
    preferredTerrain: ['crypt', 'basement'],
    avoidsTerrain: ['urban', 'street'],
    combatStyle: 'ambush',
    specialAbilities: ['pack_tactics'],
    callForHelpChance: 70
  },

  zoog: {
    aggressionLevel: 55, // Increased from 40
    cowardiceThreshold: 50, // Reduced from 60
    packMentality: true,
    territorialRange: 6, // Increased from 4
    preferredTerrain: ['nature'],
    combatStyle: 'swarm',
    specialAbilities: ['pack_tactics'],
    callForHelpChance: 90
  },

  rat_thing: {
    aggressionLevel: 70, // Increased from 55
    cowardiceThreshold: 40, // Reduced from 50
    packMentality: false,
    territorialRange: 10, // Increased from 8
    preferredTerrain: ['room', 'basement'],
    combatStyle: 'ambush',
    specialAbilities: ['phasing'],
    callForHelpChance: 30
  },

  fire_vampire: {
    aggressionLevel: 85, // Increased from 75
    cowardiceThreshold: 15, // Reduced from 20
    packMentality: true,
    territorialRange: 12, // Increased from 10
    combatStyle: 'siege',
    specialAbilities: ['ranged_shot', 'burn'],
    callForHelpChance: 60
  },

  dimensional_shambler: {
    aggressionLevel: 85, // Increased from 70
    cowardiceThreshold: 25, // Reduced from 35
    packMentality: false,
    territorialRange: 255,
    combatStyle: 'ambush',
    specialAbilities: ['teleport', 'terrify'],
    callForHelpChance: 0
  },

  serpent_man: {
    aggressionLevel: 60, // Increased from 45
    cowardiceThreshold: 45, // Reduced from 55
    packMentality: false,
    territorialRange: 8, // Increased from 6
    preferredTerrain: ['crypt', 'room'],
    combatStyle: 'cautious',
    specialAbilities: ['ranged_shot', 'hypnosis'],
    callForHelpChance: 50
  },

  gug: {
    aggressionLevel: 90, // Increased from 80
    cowardiceThreshold: 10, // Reduced from 15
    packMentality: false,
    territorialRange: 10, // Increased from 8
    preferredTerrain: ['crypt', 'basement'],
    avoidsTerrain: ['urban', 'street'],
    combatStyle: 'berserker',
    specialAbilities: ['charge'],
    callForHelpChance: 20
  },

  cthonian: {
    aggressionLevel: 80, // Increased from 65
    cowardiceThreshold: 20, // Reduced from 25
    packMentality: true,
    territorialRange: 12, // Increased from 10
    preferredTerrain: ['basement', 'crypt'],
    combatStyle: 'ambush',
    specialAbilities: ['burrow', 'terrify'],
    callForHelpChance: 40
  },

  tcho_tcho: {
    aggressionLevel: 90, // Increased from 80
    cowardiceThreshold: 15, // Reduced from 20
    packMentality: true,
    territorialRange: 8, // Increased from 6
    preferredTerrain: ['nature', 'crypt'],
    combatStyle: 'tactical',
    specialAbilities: ['ranged_shot', 'ritual'],
    callForHelpChance: 80
  },

  flying_polyp: {
    aggressionLevel: 95, // Increased from 85
    cowardiceThreshold: 5, // Reduced from 10
    packMentality: false,
    territorialRange: 18, // Increased from 15
    preferredTerrain: ['crypt', 'basement'],
    combatStyle: 'berserker',
    specialAbilities: ['wind_blast', 'phasing'],
    callForHelpChance: 0
  },

  lloigor: {
    aggressionLevel: 80, // Increased from 70
    cowardiceThreshold: 10, // Reduced from 15
    packMentality: false,
    territorialRange: 15, // Increased from 12
    combatStyle: 'siege',
    specialAbilities: ['telekinesis', 'terrify'],
    callForHelpChance: 0
  },

  gnoph_keh: {
    aggressionLevel: 95, // Increased from 90
    cowardiceThreshold: 5, // Reduced from 10
    packMentality: false,
    territorialRange: 12, // Increased from 10
    preferredTerrain: ['nature'],
    combatStyle: 'berserker',
    specialAbilities: ['charge', 'cold_aura'],
    callForHelpChance: 30
  },

  colour_out_of_space: {
    aggressionLevel: 65, // Increased from 50
    cowardiceThreshold: 0,
    packMentality: false,
    territorialRange: 7, // Increased from 5
    combatStyle: 'cautious',
    specialAbilities: ['drain', 'phasing'],
    callForHelpChance: 0
  },

  elder_thing: {
    aggressionLevel: 70, // Increased from 55
    cowardiceThreshold: 30, // Reduced from 40
    packMentality: true,
    territorialRange: 10, // Increased from 8
    preferredTerrain: ['basement', 'crypt'],
    combatStyle: 'tactical',
    specialAbilities: ['ranged_shot'],
    callForHelpChance: 60
  }
};

// ============================================================================
// TARGET PREFERENCES
// ============================================================================

export const ENEMY_TARGET_PREFERENCES: Record<EnemyType, TargetPreferences> = {
  cultist: { preferLowHp: false, preferLowSanity: false, preferIsolated: true },
  deepone: { preferLowHp: false, preferLowSanity: false, preferIsolated: false, preferWater: true },
  ghoul: { preferLowHp: true, preferLowSanity: false, preferIsolated: true },
  shoggoth: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  boss: { preferLowHp: false, preferLowSanity: false, preferIsolated: false, preferClass: ['professor', 'occultist'] },
  sniper: { preferLowHp: false, preferLowSanity: false, preferIsolated: true, avoidClass: ['veteran'] },
  priest: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['occultist'] },
  'mi-go': { preferLowHp: false, preferLowSanity: false, preferIsolated: true, preferClass: ['professor'] },
  nightgaunt: { preferLowHp: false, preferLowSanity: true, preferIsolated: true },
  hound: { preferLowHp: true, preferLowSanity: false, preferIsolated: true },
  dark_young: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  byakhee: { preferLowHp: false, preferLowSanity: true, preferIsolated: true },
  star_spawn: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['professor', 'occultist'] },
  formless_spawn: { preferLowHp: true, preferLowSanity: false, preferIsolated: false },
  hunting_horror: { preferLowHp: false, preferLowSanity: true, preferIsolated: true },
  moon_beast: { preferLowHp: false, preferLowSanity: false, preferIsolated: true, avoidClass: ['veteran'] },
  // New monsters (2026-01-22)
  ghast: { preferLowHp: true, preferLowSanity: false, preferIsolated: true },
  zoog: { preferLowHp: true, preferLowSanity: false, preferIsolated: true },
  rat_thing: { preferLowHp: false, preferLowSanity: true, preferIsolated: true },
  fire_vampire: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  dimensional_shambler: { preferLowHp: false, preferLowSanity: true, preferIsolated: true },
  serpent_man: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['professor'] },
  gug: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  cthonian: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  tcho_tcho: { preferLowHp: false, preferLowSanity: false, preferIsolated: true, preferClass: ['occultist'] },
  flying_polyp: { preferLowHp: false, preferLowSanity: false, preferIsolated: false },
  lloigor: { preferLowHp: false, preferLowSanity: true, preferIsolated: false, preferClass: ['professor', 'occultist'] },
  gnoph_keh: { preferLowHp: true, preferLowSanity: false, preferIsolated: true },
  colour_out_of_space: { preferLowHp: true, preferLowSanity: false, preferIsolated: false },
  elder_thing: { preferLowHp: false, preferLowSanity: false, preferIsolated: false, preferClass: ['professor'] }
};

// ============================================================================
// COMBAT STYLE MODIFIERS
// ============================================================================

export function getCombatStyleModifiers(style: MonsterCombatStyle): CombatStyleModifiers {
  const COMBAT_STYLE_MAP: Record<MonsterCombatStyle, CombatStyleModifiers> = {
    berserker: {
      attackBonus: 1,
      defenseBonus: -1,
      retreatAfterAttack: false,
      prefersFlanking: false,
      staysAtRange: false
    },
    cautious: {
      attackBonus: 0,
      defenseBonus: 1,
      retreatAfterAttack: false,
      prefersFlanking: false,
      staysAtRange: false
    },
    tactical: {
      attackBonus: 0,
      defenseBonus: 0,
      retreatAfterAttack: false,
      prefersFlanking: true,
      staysAtRange: false
    },
    hit_and_run: {
      attackBonus: 0,
      defenseBonus: 0,
      retreatAfterAttack: true,
      prefersFlanking: false,
      staysAtRange: false
    },
    siege: {
      attackBonus: 0,
      defenseBonus: 0,
      retreatAfterAttack: false,
      prefersFlanking: false,
      staysAtRange: true
    },
    swarm: {
      attackBonus: 0,
      defenseBonus: 0,
      retreatAfterAttack: false,
      prefersFlanking: true,
      staysAtRange: false
    },
    ambush: {
      attackBonus: 2,
      defenseBonus: 0,
      retreatAfterAttack: true,
      prefersFlanking: false,
      staysAtRange: false
    }
  };

  return COMBAT_STYLE_MAP[style] || {
    attackBonus: 0,
    defenseBonus: 0,
    retreatAfterAttack: false,
    prefersFlanking: false,
    staysAtRange: false
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get behavior for an enemy type
 */
export function getMonsterBehavior(type: EnemyType): MonsterBehavior {
  return MONSTER_BEHAVIORS[type] || 'aggressive';
}

/**
 * Get personality for an enemy type
 */
export function getMonsterPersonality(type: EnemyType): MonsterPersonality {
  return MONSTER_PERSONALITIES[type];
}

/**
 * Get target preferences for an enemy type
 */
export function getTargetPreferences(type: EnemyType): TargetPreferences {
  return ENEMY_TARGET_PREFERENCES[type] || {
    preferLowHp: false,
    preferLowSanity: false,
    preferIsolated: false
  };
}

/**
 * Select random enemy type from spawn table
 * IMPROVED (2026-01-28): Added variety bonus and round-based scaling
 */
export function selectRandomEnemy(
  category: TileCategory | undefined,
  currentDoom: number,
  currentRound?: number,
  recentlySpawnedTypes?: Set<EnemyType>
): EnemyType | null {
  const table = SPAWN_TABLES[category || 'default'] || SPAWN_TABLES.default;

  // Filter by doom level
  const validSpawns = table.filter(
    config => currentDoom <= config.maxDoom && currentDoom >= config.minDoom
  );

  if (validSpawns.length === 0) return null;

  // Apply variety bonus and round scaling
  const adjustedSpawns = validSpawns.map(config => {
    let adjustedWeight = config.weight;

    // Variety bonus: Increase weight for monsters not recently spawned
    if (recentlySpawnedTypes && !recentlySpawnedTypes.has(config.type)) {
      adjustedWeight *= 1.5; // 50% bonus for variety
    }

    // Round-based scaling: Stronger monsters more common in later rounds
    if (currentRound && currentRound > 5) {
      const isStrongerMonster = ['shoggoth', 'star_spawn', 'gug', 'flying_polyp',
        'gnoph_keh', 'dark_young', 'hunting_horror', 'cthonian', 'lloigor',
        'colour_out_of_space', 'elder_thing'].includes(config.type);

      if (isStrongerMonster) {
        // Scale up stronger monsters after round 5
        const roundBonus = Math.min(2.5, 1 + (currentRound - 5) * 0.15);
        adjustedWeight *= roundBonus;
      }
    }

    // Doom-based scaling: Even more variety at low doom
    if (currentDoom <= 5) {
      adjustedWeight *= 1.2; // More elite spawns at low doom
    }

    return { ...config, adjustedWeight };
  });

  // Weighted random selection with adjusted weights
  const totalWeight = adjustedSpawns.reduce((sum, config) => sum + config.adjustedWeight, 0);
  let random = Math.random() * totalWeight;

  for (const config of adjustedSpawns) {
    random -= config.adjustedWeight;
    if (random <= 0) {
      return config.type;
    }
  }

  return validSpawns[0].type;
}

/**
 * Get a varied selection of enemies for a spawn event
 * Ensures variety by tracking recently spawned types
 */
export function selectVariedEnemies(
  category: TileCategory | undefined,
  currentDoom: number,
  count: number,
  currentRound?: number
): EnemyType[] {
  const result: EnemyType[] = [];
  const recentlySpawned = new Set<EnemyType>();

  for (let i = 0; i < count; i++) {
    const enemy = selectRandomEnemy(category, currentDoom, currentRound, recentlySpawned);
    if (enemy) {
      result.push(enemy);
      recentlySpawned.add(enemy);
    }
  }

  return result;
}
