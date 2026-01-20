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
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'dark_young', weight: 5, minDoom: 0, maxDoom: 6 },
  ],
  urban: [
    { type: 'cultist', weight: 40, minDoom: 0, maxDoom: 255 },
    { type: 'sniper', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'priest', weight: 10, minDoom: 0, maxDoom: 5 },
  ],
  street: [
    { type: 'cultist', weight: 35, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
    { type: 'hound', weight: 10, minDoom: 0, maxDoom: 5 },
  ],
  facade: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
  ],
  foyer: [
    { type: 'cultist', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 15, minDoom: 0, maxDoom: 255 },
  ],
  corridor: [
    { type: 'ghoul', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'nightgaunt', weight: 10, minDoom: 0, maxDoom: 6 },
  ],
  room: [
    { type: 'cultist', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'mi-go', weight: 10, minDoom: 0, maxDoom: 255 },
  ],
  stairs: [
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
  ],
  basement: [
    { type: 'ghoul', weight: 30, minDoom: 0, maxDoom: 255 },
    { type: 'formless_spawn', weight: 15, minDoom: 0, maxDoom: 5 },
  ],
  crypt: [
    { type: 'ghoul', weight: 25, minDoom: 0, maxDoom: 255 },
    { type: 'shoggoth', weight: 5, minDoom: 0, maxDoom: 4 },
    { type: 'star_spawn', weight: 2, minDoom: 0, maxDoom: 2 },
  ],
  default: [
    { type: 'cultist', weight: 40, minDoom: 0, maxDoom: 255 },
    { type: 'ghoul', weight: 20, minDoom: 0, maxDoom: 255 },
    { type: 'deepone', weight: 15, minDoom: 0, maxDoom: 255 },
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
  moon_beast: 'ranged'
};

// ============================================================================
// MONSTER PERSONALITY SYSTEM
// ============================================================================

export const MONSTER_PERSONALITIES: Record<EnemyType, MonsterPersonality> = {
  cultist: {
    aggressionLevel: 70,
    cowardiceThreshold: 30,
    packMentality: true,
    territorialRange: 8,
    preferredTerrain: ['crypt', 'room'],
    combatStyle: 'tactical',
    specialAbilities: ['charge'],
    callForHelpChance: 60
  },

  deepone: {
    aggressionLevel: 80,
    cowardiceThreshold: 20,
    packMentality: true,
    territorialRange: 6,
    preferredTerrain: ['basement', 'nature'],
    combatStyle: 'berserker',
    specialAbilities: ['drag_under'],
    callForHelpChance: 40
  },

  ghoul: {
    aggressionLevel: 50,
    cowardiceThreshold: 40,
    packMentality: true,
    territorialRange: 4,
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
    aggressionLevel: 40,
    cowardiceThreshold: 50,
    packMentality: false,
    territorialRange: 10,
    preferredTerrain: ['room', 'corridor'],
    combatStyle: 'siege',
    specialAbilities: ['snipe'],
    callForHelpChance: 70
  },

  priest: {
    aggressionLevel: 30,
    cowardiceThreshold: 60,
    packMentality: false,
    territorialRange: 3,
    preferredTerrain: ['crypt', 'room'],
    combatStyle: 'cautious',
    specialAbilities: ['summon', 'ritual'],
    callForHelpChance: 100
  },

  'mi-go': {
    aggressionLevel: 60,
    cowardiceThreshold: 40,
    packMentality: true,
    territorialRange: 8,
    preferredTerrain: ['nature', 'basement'],
    combatStyle: 'hit_and_run',
    specialAbilities: ['ranged_shot'],
    callForHelpChance: 50
  },

  nightgaunt: {
    aggressionLevel: 55,
    cowardiceThreshold: 25,
    packMentality: false,
    territorialRange: 12,
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
 */
export function selectRandomEnemy(
  category: TileCategory | undefined,
  currentDoom: number
): EnemyType | null {
  const table = SPAWN_TABLES[category || 'default'] || SPAWN_TABLES.default;

  // Filter by doom level
  const validSpawns = table.filter(
    config => currentDoom <= config.maxDoom && currentDoom >= config.minDoom
  );

  if (validSpawns.length === 0) return null;

  // Weighted random selection
  const totalWeight = validSpawns.reduce((sum, config) => sum + config.weight, 0);
  let random = Math.random() * totalWeight;

  for (const config of validSpawns) {
    random -= config.weight;
    if (random <= 0) {
      return config.type;
    }
  }

  return validSpawns[0].type;
}
