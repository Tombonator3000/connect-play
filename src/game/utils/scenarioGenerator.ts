/**
 * DYNAMIC SCENARIO GENERATOR
 *
 * Generates random scenarios from element pools:
 * - Mission Types (escape, assassination, survival, collection, ritual, investigation, rescue, purge, seal_portal)
 * - Locations (start locations based on tileset)
 * - Enemies and Bosses
 * - Briefing narratives
 * - Objectives
 * - Doom Events
 *
 * This creates 100+ unique scenario combinations from the element pools.
 */

import {
  Scenario,
  VictoryType,
  ScenarioObjective,
  DoomEvent,
  VictoryCondition,
  DefeatCondition,
  EnemyType,
  ScenarioTheme
} from '../types';

import {
  randomElement,
  randomRange,
  generateId,
  buildTemplateContext,
  selectLocation,
  generateObjectivesFromTemplates,
  generateBonusObjectives,
  generateDoomEvents,
  generateTitle,
  generateBriefing,
  buildVictoryConditions,
  buildDefeatConditions,
  selectCollectible,
  interpolateTemplate,
  TemplateContext
} from './scenarioGeneratorHelpers';

// ============================================================================
// THEME MAPPING
// ============================================================================

/**
 * Maps location atmosphere to scenario theme.
 * The theme determines which tile visuals and descriptions are used.
 */
function getThemeFromLocation(locationName: string, atmosphere: string): ScenarioTheme {
  const nameLower = locationName.toLowerCase();

  // Name-based mapping takes priority
  if (nameLower.includes('manor') || nameLower.includes('mansion') || nameLower.includes('house') || nameLower.includes('hotel')) {
    return 'manor';
  }
  if (nameLower.includes('church') || nameLower.includes('chapel')) {
    return 'church';
  }
  if (nameLower.includes('asylum') || nameLower.includes('hospital')) {
    return 'asylum';
  }
  if (nameLower.includes('warehouse') || nameLower.includes('factory') || nameLower.includes('industrial')) {
    return 'warehouse';
  }
  if (nameLower.includes('forest') || nameLower.includes('woods') || nameLower.includes('marsh')) {
    return 'forest';
  }
  if (nameLower.includes('library') || nameLower.includes('university') || nameLower.includes('campus')) {
    return 'academic';
  }
  if (nameLower.includes('harbor') || nameLower.includes('coast') || nameLower.includes('cliff') || nameLower.includes('dock')) {
    return 'coastal';
  }
  if (nameLower.includes('crypt') || nameLower.includes('cave') || nameLower.includes('catacomb') || nameLower.includes('sewer')) {
    return 'underground';
  }

  // Fall back to atmosphere-based mapping
  switch (atmosphere) {
    case 'creepy': return 'manor';
    case 'urban': return 'urban';
    case 'wilderness': return 'forest';
    case 'academic': return 'academic';
    case 'industrial': return 'warehouse';
    default: return 'manor';
  }
}

/**
 * Theme tile preferences configuration.
 * Defines preferred/avoided tile names and floor types for each theme.
 *
 * REFACTORED: Previously a 65-line switch statement with 9 cases.
 * Now a simple data-driven lookup table that's easier to:
 * - Read and understand at a glance
 * - Extend with new themes (just add an entry)
 * - Test (can iterate over entries)
 * - Maintain (changes are localized to this object)
 */
export const THEME_TILE_PREFERENCES: Record<ScenarioTheme, {
  preferredNames: string[];
  avoidNames: string[];
  floorPreference: string;
}> = {
  manor: {
    preferredNames: ['manor', 'mansion', 'study', 'library', 'bedroom', 'dining', 'gallery', 'parlor', 'foyer', 'cellar', 'wine'],
    avoidNames: ['sewer', 'harbor', 'industrial', 'factory', 'asylum', 'cell'],
    floorPreference: 'wood'
  },
  church: {
    preferredNames: ['church', 'chapel', 'altar', 'crypt', 'vestibule', 'bell', 'sanctum', 'tomb'],
    avoidNames: ['kitchen', 'bedroom', 'factory', 'harbor', 'sewer'],
    floorPreference: 'stone'
  },
  asylum: {
    preferredNames: ['asylum', 'hospital', 'cell', 'ward', 'corridor', 'reception', 'padded', 'dissection', 'records'],
    avoidNames: ['manor', 'mansion', 'forest', 'harbor', 'wine'],
    floorPreference: 'tile'
  },
  warehouse: {
    preferredNames: ['warehouse', 'storage', 'factory', 'industrial', 'boiler', 'loading', 'crate', 'dock'],
    avoidNames: ['manor', 'mansion', 'church', 'bedroom', 'parlor', 'forest'],
    floorPreference: 'stone'
  },
  forest: {
    preferredNames: ['forest', 'clearing', 'marsh', 'path', 'grove', 'stones', 'ruins', 'cabin', 'hollow'],
    avoidNames: ['asylum', 'factory', 'warehouse', 'hospital', 'cell'],
    floorPreference: 'dirt'
  },
  urban: {
    preferredNames: ['street', 'alley', 'square', 'market', 'station', 'bridge', 'plaza', 'precinct'],
    avoidNames: ['forest', 'marsh', 'cave', 'crypt', 'manor'],
    floorPreference: 'cobblestone'
  },
  coastal: {
    preferredNames: ['harbor', 'dock', 'wharf', 'lighthouse', 'coastal', 'cliff', 'boat', 'pier', 'fishmarket'],
    avoidNames: ['forest', 'manor', 'asylum', 'church'],
    floorPreference: 'cobblestone'
  },
  underground: {
    preferredNames: ['crypt', 'catacomb', 'cave', 'tunnel', 'sewer', 'cellar', 'tomb', 'pit', 'altar', 'portal'],
    avoidNames: ['street', 'square', 'market', 'forest', 'harbor'],
    floorPreference: 'stone'
  },
  academic: {
    preferredNames: ['library', 'university', 'campus', 'study', 'laboratory', 'lecture', 'museum', 'archive', 'office'],
    avoidNames: ['sewer', 'marsh', 'harbor', 'factory', 'asylum'],
    floorPreference: 'wood'
  }
};

/** Default tile preferences for unknown themes */
const DEFAULT_TILE_PREFERENCES = {
  preferredNames: [] as string[],
  avoidNames: [] as string[],
  floorPreference: 'wood'
};

/**
 * Gets preferred tile names for a given theme.
 * Used by tile generation to select thematically appropriate tiles.
 */
export function getThemedTilePreferences(theme: ScenarioTheme): {
  preferredNames: string[];
  avoidNames: string[];
  floorPreference: string;
} {
  return THEME_TILE_PREFERENCES[theme] ?? DEFAULT_TILE_PREFERENCES;
}

// ============================================================================
// ELEMENT POOLS
// ============================================================================

/**
 * Mission type pool with configuration for each type
 */
export interface MissionType {
  id: string;
  victoryType: VictoryType;
  name: string;
  goalTemplate: string;
  specialRuleTemplate: string;
  tileSet: 'indoor' | 'outdoor' | 'mixed';
  baseDoom: { Normal: number; Hard: number; Nightmare: number };
  objectiveTemplates: ObjectiveTemplate[];
  victoryConditionTemplate: Omit<VictoryCondition, 'requiredObjectives'>;
}

export interface ObjectiveTemplate {
  id: string;
  descriptionTemplate: string;
  shortDescriptionTemplate: string;
  type: ScenarioObjective['type'];
  targetIdOptions?: string[];
  targetAmount?: { min: number; max: number };
  isOptional: boolean;
  isHidden: boolean;
  revealedByIndex?: number; // Index of objective that reveals this
  rewardInsight?: number;
  rewardItemOptions?: string[];
}

/**
 * Location pool for start locations
 */
export interface LocationOption {
  name: string;
  tileSet: 'indoor' | 'outdoor' | 'mixed';
  atmosphere: 'creepy' | 'urban' | 'wilderness' | 'academic' | 'industrial';
}

/**
 * Enemy spawn configuration
 */
export interface EnemySpawnConfig {
  type: EnemyType;
  amount: { min: number; max: number };
  doomThreshold: { early: number; mid: number; late: number };
  message: string;
}

/**
 * Boss configuration
 */
export interface BossConfig {
  type: EnemyType;
  name: string;
  spawnMessage: string;
  difficulty: 'Normal' | 'Hard' | 'Nightmare';
}

/**
 * Briefing narrative fragments
 */
export interface BriefingFragment {
  opening: string[];
  middleByType: Record<string, string[]>;
  closingByDifficulty: Record<string, string[]>;
}

// ============================================================================
// MISSION TYPE POOL
// ============================================================================

export const MISSION_TYPES: MissionType[] = [
  // ESCAPE MISSIONS
  {
    id: 'escape_manor',
    victoryType: 'escape',
    name: 'Escape',
    goalTemplate: 'Find the {item} and escape from {location}.',
    specialRuleTemplate: 'Exit spawns after key is found.',
    tileSet: 'indoor',
    baseDoom: { Normal: 16, Hard: 14, Nightmare: 12 },  // Increased for realistic exploration time
    objectiveTemplates: [
      {
        id: 'find_key',
        descriptionTemplate: 'Search the {location} to find the {item} that unlocks the exit.',
        shortDescriptionTemplate: 'Find the {item}',
        type: 'find_item',
        targetIdOptions: ['iron_key', 'silver_key', 'cursed_key', 'skeleton_key'],
        isOptional: false,
        isHidden: false,
        rewardInsight: 1
      },
      {
        id: 'find_exit',
        descriptionTemplate: 'Locate the sealed exit door.',
        shortDescriptionTemplate: 'Find the Exit',
        type: 'find_tile',
        targetIdOptions: ['exit_door'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      },
      {
        id: 'escape',
        descriptionTemplate: 'Use the key to unlock the exit and escape.',
        shortDescriptionTemplate: 'Escape',
        type: 'escape',
        targetIdOptions: ['exit_door'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 1
      }
    ],
    victoryConditionTemplate: {
      type: 'escape',
      description: 'Escape through the exit with the key',
      checkFunction: 'checkEscapeVictory'
    }
  },

  // ASSASSINATION MISSIONS
  {
    id: 'assassination',
    victoryType: 'assassination',
    name: 'Assassination',
    goalTemplate: 'Find and kill the {target} before the ritual is complete.',
    specialRuleTemplate: 'Boss spawns when found. Enemies are alerted.',
    tileSet: 'mixed',
    baseDoom: { Normal: 14, Hard: 12, Nightmare: 10 },  // Increased for intel gathering + combat
    objectiveTemplates: [
      {
        id: 'gather_intel',
        descriptionTemplate: 'Gather intelligence about the {target}\'s location.',
        shortDescriptionTemplate: 'Gather Intel (0/2)',
        type: 'collect',
        targetIdOptions: ['intel_clue'],
        targetAmount: { min: 2, max: 3 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 1
      },
      {
        id: 'find_target',
        descriptionTemplate: 'Locate the {target} in their sanctum.',
        shortDescriptionTemplate: 'Find {target}',
        type: 'find_tile',
        targetIdOptions: ['ritual_chamber', 'sanctum', 'throne_room'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      },
      {
        id: 'kill_target',
        descriptionTemplate: 'Kill the {target} before they complete their dark work.',
        shortDescriptionTemplate: 'Kill {target}',
        type: 'kill_boss',
        targetIdOptions: ['priest', 'boss'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 1
      }
    ],
    victoryConditionTemplate: {
      type: 'assassination',
      description: 'Kill the target',
      checkFunction: 'checkAssassinationVictory'
    }
  },

  // SURVIVAL MISSIONS
  {
    id: 'survival',
    victoryType: 'survival',
    name: 'Siege',
    goalTemplate: 'Survive for {rounds} rounds against waves of enemies.',
    specialRuleTemplate: 'Enemies spawn in waves. Barricades available.',
    tileSet: 'mixed',
    baseDoom: { Normal: 14, Hard: 18, Nightmare: 22 },  // Higher doom for survival = more rounds to survive
    objectiveTemplates: [
      {
        id: 'survive_half',
        descriptionTemplate: 'Hold the line for the first {half} rounds.',
        shortDescriptionTemplate: 'Survive {half} Rounds',
        type: 'survive',
        targetAmount: { min: 5, max: 5 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 1
      },
      {
        id: 'survive_full',
        descriptionTemplate: 'Endure the full assault for {total} rounds.',
        shortDescriptionTemplate: 'Survive {total} Rounds',
        type: 'survive',
        targetAmount: { min: 8, max: 10 },
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      }
    ],
    victoryConditionTemplate: {
      type: 'survival',
      description: 'Survive the required number of rounds',
      checkFunction: 'checkSurvivalVictory'
    }
  },

  // COLLECTION MISSIONS
  {
    id: 'collection',
    victoryType: 'collection',
    name: 'Relic Hunt',
    goalTemplate: 'Collect {count} {items} before the enemy.',
    specialRuleTemplate: 'Items spawn at random explored locations.',
    tileSet: 'mixed',
    baseDoom: { Normal: 16, Hard: 14, Nightmare: 12 },  // Increased for exploration + collecting
    objectiveTemplates: [
      {
        id: 'collect_items',
        descriptionTemplate: 'Search for the {count} scattered {items}.',
        shortDescriptionTemplate: 'Collect {items} (0/{count})',
        type: 'collect',
        targetIdOptions: ['necro_page', 'artifact_fragment', 'seal_piece', 'ritual_component'],
        targetAmount: { min: 3, max: 5 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 3
      }
    ],
    victoryConditionTemplate: {
      type: 'collection',
      description: 'Collect all required items',
      checkFunction: 'checkCollectionVictory'
    }
  },

  // RESCUE MISSIONS
  {
    id: 'rescue',
    victoryType: 'escape',
    name: 'Rescue',
    goalTemplate: 'Find {victim} and escort them to safety.',
    specialRuleTemplate: 'Victim has limited HP and must survive.',
    tileSet: 'indoor',
    baseDoom: { Normal: 16, Hard: 14, Nightmare: 12 },  // Increased for find + escort
    objectiveTemplates: [
      {
        id: 'find_entrance',
        descriptionTemplate: 'Find the entrance to where {victim} is held.',
        shortDescriptionTemplate: 'Find Entrance',
        type: 'find_tile',
        targetIdOptions: ['catacomb_entrance', 'dungeon_entrance', 'basement_entrance'],
        isOptional: false,
        isHidden: false
      },
      {
        id: 'find_victim',
        descriptionTemplate: 'Locate {victim} in the depths.',
        shortDescriptionTemplate: 'Find {victim}',
        type: 'find_tile',
        targetIdOptions: ['prison_cell', 'ritual_chamber', 'holding_area'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0,
        rewardInsight: 1
      },
      {
        id: 'escort',
        descriptionTemplate: 'Lead {victim} safely back to the exit.',
        shortDescriptionTemplate: 'Escort to Safety',
        type: 'escape',
        targetIdOptions: ['exit'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 1
      }
    ],
    victoryConditionTemplate: {
      type: 'escape',
      description: 'Escort the victim to safety',
      checkFunction: 'checkEscortVictory'
    }
  },

  // INVESTIGATION MISSIONS
  {
    id: 'investigation',
    victoryType: 'investigation',
    name: 'Investigation',
    goalTemplate: 'Uncover the truth about {mystery}.',
    specialRuleTemplate: 'Clues reveal the final confrontation.',
    tileSet: 'mixed',
    baseDoom: { Normal: 18, Hard: 16, Nightmare: 14 },  // More time for thorough investigation
    objectiveTemplates: [
      {
        id: 'gather_clues',
        descriptionTemplate: 'Investigate locations to gather clues about {mystery}.',
        shortDescriptionTemplate: 'Gather Clues (0/4)',
        type: 'collect',
        targetIdOptions: ['evidence_clue'],
        targetAmount: { min: 3, max: 5 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 2
      },
      {
        id: 'confront_truth',
        descriptionTemplate: 'Confront what you have discovered.',
        shortDescriptionTemplate: 'Face the Truth',
        type: 'interact',
        targetIdOptions: ['final_confrontation'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      }
    ],
    victoryConditionTemplate: {
      type: 'investigation',
      description: 'Uncover and confront the truth',
      checkFunction: 'checkInvestigationVictory'
    }
  },

  // RITUAL MISSIONS
  {
    id: 'ritual',
    victoryType: 'ritual',
    name: 'Counter-Ritual',
    goalTemplate: 'Perform the banishment ritual at {location}.',
    specialRuleTemplate: 'Ritual requires 3 components. Each component attracts enemies.',
    tileSet: 'indoor',
    baseDoom: { Normal: 14, Hard: 12, Nightmare: 10 },  // Time for components + ritual
    objectiveTemplates: [
      {
        id: 'gather_components',
        descriptionTemplate: 'Gather the 3 ritual components needed for the banishment.',
        shortDescriptionTemplate: 'Find Components (0/3)',
        type: 'collect',
        targetIdOptions: ['ritual_component'],
        targetAmount: { min: 3, max: 3 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 1
      },
      {
        id: 'find_altar',
        descriptionTemplate: 'Locate the ritual altar where the banishment must be performed.',
        shortDescriptionTemplate: 'Find the Altar',
        type: 'find_tile',
        targetIdOptions: ['sacrificial_altar', 'ritual_altar', 'altar_room'],
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      },
      {
        id: 'perform_ritual',
        descriptionTemplate: 'Perform the banishment ritual.',
        shortDescriptionTemplate: 'Complete Ritual',
        type: 'ritual',
        isOptional: false,
        isHidden: true,
        revealedByIndex: 1
      }
    ],
    victoryConditionTemplate: {
      type: 'ritual',
      description: 'Complete the banishment ritual',
      checkFunction: 'checkRitualVictory'
    }
  },

  // SEAL PORTAL MISSIONS
  {
    id: 'seal_portal',
    victoryType: 'ritual',
    name: 'Seal the Gate',
    goalTemplate: 'Place Elder Signs at {count} ritual points to seal the portal.',
    specialRuleTemplate: 'Each placement triggers enemy spawn.',
    tileSet: 'mixed',
    baseDoom: { Normal: 14, Hard: 12, Nightmare: 10 },  // Time to find and place signs
    objectiveTemplates: [
      {
        id: 'find_points',
        descriptionTemplate: 'Locate the {count} ritual binding points around the portal.',
        shortDescriptionTemplate: 'Find Points (0/{count})',
        type: 'explore',
        targetIdOptions: ['ritual_point'],
        targetAmount: { min: 3, max: 4 },
        isOptional: false,
        isHidden: false,
        rewardInsight: 1
      },
      {
        id: 'place_signs',
        descriptionTemplate: 'Place Elder Signs at all ritual points.',
        shortDescriptionTemplate: 'Place Signs (0/{count})',
        type: 'interact',
        targetIdOptions: ['elder_sign_placement'],
        targetAmount: { min: 3, max: 4 },
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      }
    ],
    victoryConditionTemplate: {
      type: 'ritual',
      description: 'Seal the portal with Elder Signs',
      checkFunction: 'checkSealVictory'
    }
  },

  // PURGE MISSIONS
  {
    id: 'purge',
    victoryType: 'assassination',
    name: 'Purge',
    goalTemplate: 'Cleanse {location} by destroying all {enemies}.',
    specialRuleTemplate: 'All enemies must be eliminated. No reinforcements.',
    tileSet: 'indoor',
    baseDoom: { Normal: 16, Hard: 14, Nightmare: 12 },  // Time to find and kill all enemies
    objectiveTemplates: [
      {
        id: 'kill_enemies',
        descriptionTemplate: 'Destroy all {enemies} infesting {location}.',
        shortDescriptionTemplate: 'Kill {enemies} (0/{count})',
        type: 'kill_enemy',
        targetIdOptions: ['ghoul', 'cultist', 'deepone'],
        targetAmount: { min: 5, max: 8 },
        isOptional: false,
        isHidden: false
      },
      {
        id: 'cleanse_area',
        descriptionTemplate: 'Ensure the area is fully cleansed.',
        shortDescriptionTemplate: 'Cleanse Complete',
        type: 'kill_enemy',
        targetIdOptions: ['any'],
        targetAmount: { min: 0, max: 0 },
        isOptional: false,
        isHidden: true,
        revealedByIndex: 0
      }
    ],
    victoryConditionTemplate: {
      type: 'assassination',
      description: 'Eliminate all enemies',
      checkFunction: 'checkPurgeVictory'
    }
  }
];

// ============================================================================
// LOCATION POOL
// ============================================================================

export const INDOOR_START_LOCATIONS: LocationOption[] = [
  { name: 'Blackwood Manor', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'Arkham Asylum', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'Miskatonic Library', tileSet: 'indoor', atmosphere: 'academic' },
  { name: 'Abandoned Church', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'The Gilded Hotel', tileSet: 'indoor', atmosphere: 'urban' },
  { name: 'Derelict Warehouse', tileSet: 'indoor', atmosphere: 'industrial' },
  { name: 'The Witch House', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'Funeral Parlor', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'Old Hospital', tileSet: 'indoor', atmosphere: 'creepy' },
  { name: 'Secret Crypt', tileSet: 'indoor', atmosphere: 'creepy' }
];

export const OUTDOOR_START_LOCATIONS: LocationOption[] = [
  { name: 'Town Square', tileSet: 'outdoor', atmosphere: 'urban' },
  { name: 'Old Cemetery', tileSet: 'outdoor', atmosphere: 'creepy' },
  { name: 'Arkham Harbor', tileSet: 'outdoor', atmosphere: 'industrial' },
  { name: 'University Campus', tileSet: 'outdoor', atmosphere: 'academic' },
  { name: 'Industrial Quarter', tileSet: 'outdoor', atmosphere: 'industrial' },
  { name: 'Blackwood Forest', tileSet: 'outdoor', atmosphere: 'wilderness' },
  { name: 'Coastal Cliffs', tileSet: 'outdoor', atmosphere: 'wilderness' },
  { name: 'Train Station', tileSet: 'outdoor', atmosphere: 'urban' }
];

export const MIXED_START_LOCATIONS: LocationOption[] = [
  { name: 'Police Station', tileSet: 'mixed', atmosphere: 'urban' },
  { name: 'Merchant District', tileSet: 'mixed', atmosphere: 'urban' },
  { name: 'Factory Gate', tileSet: 'mixed', atmosphere: 'industrial' },
  { name: 'Cemetery Gate', tileSet: 'mixed', atmosphere: 'creepy' },
  { name: 'Miskatonic Bridge', tileSet: 'mixed', atmosphere: 'urban' }
];

// ============================================================================
// ENEMY CONFIGURATION
// ============================================================================

export const ENEMY_POOLS: Record<string, EnemySpawnConfig[]> = {
  Normal: [
    { type: 'cultist', amount: { min: 2, max: 3 }, doomThreshold: { early: 9, mid: 6, late: 3 }, message: 'Cultists emerge from the shadows!' },
    { type: 'ghoul', amount: { min: 1, max: 2 }, doomThreshold: { early: 7, mid: 4, late: 2 }, message: 'Hungry ghouls crawl from the darkness!' }
  ],
  Hard: [
    { type: 'cultist', amount: { min: 2, max: 3 }, doomThreshold: { early: 8, mid: 5, late: 3 }, message: 'Cultists have found you!' },
    { type: 'ghoul', amount: { min: 2, max: 3 }, doomThreshold: { early: 6, mid: 4, late: 2 }, message: 'A ghoul pack attacks!' },
    { type: 'deepone', amount: { min: 1, max: 2 }, doomThreshold: { early: 5, mid: 3, late: 1 }, message: 'Deep Ones rise from the depths!' }
  ],
  Nightmare: [
    { type: 'cultist', amount: { min: 3, max: 4 }, doomThreshold: { early: 7, mid: 5, late: 3 }, message: 'Cultists swarm your position!' },
    { type: 'ghoul', amount: { min: 2, max: 3 }, doomThreshold: { early: 6, mid: 4, late: 2 }, message: 'A ghoul horde descends!' },
    { type: 'deepone', amount: { min: 2, max: 3 }, doomThreshold: { early: 5, mid: 3, late: 2 }, message: 'Deep Ones breach the surface!' },
    { type: 'mi-go', amount: { min: 1, max: 2 }, doomThreshold: { early: 4, mid: 2, late: 1 }, message: 'Mi-Go swoop from the darkness!' }
  ]
};

export const BOSS_POOL: BossConfig[] = [
  { type: 'shoggoth', name: 'Shoggoth', spawnMessage: 'A Shoggoth emerges! Tekeli-li!', difficulty: 'Normal' },
  { type: 'dark_young', name: 'Dark Young of Shub-Niggurath', spawnMessage: 'A Dark Young crashes through!', difficulty: 'Hard' },
  { type: 'star_spawn', name: 'Star Spawn of Cthulhu', spawnMessage: 'A Star Spawn descends!', difficulty: 'Nightmare' },
  { type: 'hunting_horror', name: 'Hunting Horror', spawnMessage: 'A Hunting Horror blocks the sky!', difficulty: 'Nightmare' }
];

// ============================================================================
// TARGET/VICTIM NAMES
// ============================================================================

export const TARGET_NAMES = [
  'Dark Priest',
  'High Cultist',
  'Warlock Theron',
  'The Hooded One',
  'Sister of the Sign',
  'Prophet of Y\'golonac',
  'Keeper of the Gate'
];

export const VICTIM_NAMES = [
  'Professor Warren',
  'Dr. Armitage',
  'Agent Morrison',
  'Father Iwanicki',
  'Miss Tillinghast',
  'Young Thomas',
  'The Journalist'
];

export const MYSTERY_NAMES = [
  'the Blackwood disappearances',
  'the Harbor murders',
  'the missing students',
  'the cult\'s true purpose',
  'the source of the nightmares',
  'the Innsmouth connection'
];

// ============================================================================
// COLLECTIBLE ITEM NAMES
// ============================================================================

export const COLLECTIBLE_ITEMS: Record<string, { singular: string; plural: string }> = {
  necro_page: { singular: 'Necronomicon Page', plural: 'Necronomicon Pages' },
  artifact_fragment: { singular: 'Artifact Fragment', plural: 'Artifact Fragments' },
  seal_piece: { singular: 'Seal Piece', plural: 'Seal Pieces' },
  ritual_component: { singular: 'Ritual Component', plural: 'Ritual Components' },
  elder_sign: { singular: 'Elder Sign', plural: 'Elder Signs' },
  evidence_clue: { singular: 'Evidence', plural: 'Pieces of Evidence' }
};

// ============================================================================
// BRIEFING NARRATIVE FRAGMENTS
// ============================================================================

export const BRIEFING_OPENINGS = [
  'The telegram arrived at midnight, its words trembling in the candlelight.',
  'You knew this day would come. The signs have been mounting for weeks.',
  'Professor Armitage burst through your door, pale as death itself.',
  'The dream woke you again—the same vision of impossible geometry.',
  'The newspaper headline confirms your worst fears.',
  'A knock at the door. A stranger with hollow eyes hands you an envelope.',
  'The stars aligned three nights ago. Since then, nothing has been the same.',
  'You found the journal in the old bookshop. Its final entry is today\'s date.'
];

export const BRIEFING_MIDDLES: Record<string, string[]> = {
  escape: [
    'The doors have sealed themselves. The windows show only darkness. Something knows you are here.',
    'You are trapped. Whatever force brought you here doesn\'t intend to let you leave.',
    'Every exit is blocked by forces beyond understanding. Only one key can open the way out.'
  ],
  assassination: [
    'The cult\'s leader must be stopped before the ritual is complete. There will be no trial—only cold steel.',
    'They call him the Chosen One. Tonight, you will prove the stars chose wrong.',
    'The high priest has evaded justice for too long. Tonight, justice finds him.'
  ],
  survival: [
    'Wave after wave of horrors from beyond the veil. There is no escape—only survival.',
    'Hold the line until dawn. If dawn ever comes.',
    'They are coming. They will not stop. You must not fall.'
  ],
  collection: [
    'The fragments are scattered across the city. Collect them before the enemy.',
    'Each piece calls to the others. You can feel them pulling at your mind.',
    'Five pieces of a puzzle that should never have been separated.'
  ],
  ritual: [
    'The banishment must be performed before the alignment completes.',
    'Three components. One ritual. The fate of reality hangs in the balance.',
    'The old rites can seal what has been opened. But at what cost?'
  ],
  rescue: [
    'They took someone important. The catacombs don\'t give up their prisoners easily.',
    'Time is running out. Every moment in the darkness costs them more of their sanity.',
    'Find them. Save them. Try not to join them in eternal imprisonment.'
  ],
  investigation: [
    'The truth is buried beneath layers of lies and madness. Dig deep enough, and you might survive what you find.',
    'Every clue leads deeper into the conspiracy. Some truths are better left unknown.',
    'Connect the threads before you become another loose end.'
  ]
};

export const BRIEFING_CLOSINGS: Record<string, string[]> = {
  Normal: [
    'The investigation begins. May fortune favor the brave.',
    'Steel your nerves. The night is young.',
    'Time is short, but not yet critical. Move carefully.'
  ],
  Hard: [
    'The clock is ticking. There will be no second chances.',
    'Whatever awaits you down there isn\'t expecting company. Keep it that way.',
    'Failure is not an option. The cost is too high.'
  ],
  Nightmare: [
    'Some who enter will not return. Make your peace with that.',
    'The stars themselves conspire against you. Prove them wrong.',
    'This may be a one-way trip. Make it count.'
  ]
};

// ============================================================================
// SCENARIO TITLE GENERATION
// ============================================================================

export const TITLE_TEMPLATES: Record<string, string[]> = {
  escape: [
    'Escape from {location}',
    'The {location} Trap',
    'No Exit at {location}',
    'Prisoner of {location}'
  ],
  assassination: [
    'The {target} Must Die',
    'Death to the {target}',
    'Hunt for the {target}',
    'Silencing the {target}'
  ],
  survival: [
    'The Siege of {location}',
    'Last Stand at {location}',
    'Night of Terror',
    'Hold the Line'
  ],
  collection: [
    'The {item} Hunt',
    'Scattered {items}',
    'Race for the {items}',
    'Gathering the {items}'
  ],
  rescue: [
    'Save {victim}',
    'The {victim} Rescue',
    'Into the Dark for {victim}',
    'No One Left Behind'
  ],
  ritual: [
    'The Banishment Rite',
    'Counter-Ritual',
    'Breaking the Seal',
    'The Final Incantation'
  ],
  investigation: [
    'The {mystery} Case',
    'Uncovering {mystery}',
    'The Truth About {mystery}',
    'Investigating {mystery}'
  ],
  seal_portal: [
    'Seal the Gate',
    'Closing the Rift',
    'The Elder Seal',
    'Binding the Portal'
  ],
  purge: [
    'Cleanse {location}',
    'Purge of {location}',
    'Extermination at {location}',
    'The {location} Purge'
  ]
};

// ============================================================================
// BONUS OBJECTIVES
// ============================================================================

export const BONUS_OBJECTIVES: ObjectiveTemplate[] = [
  {
    id: 'bonus_journal',
    descriptionTemplate: 'Find hidden journal pages scattered throughout.',
    shortDescriptionTemplate: 'Find Journals (0/3)',
    type: 'collect',
    targetIdOptions: ['journal_page'],
    targetAmount: { min: 2, max: 4 },
    isOptional: true,
    isHidden: false,
    rewardInsight: 2,
    rewardItemOptions: ['elder_sign', 'occult_tome']
  },
  {
    id: 'bonus_kill',
    descriptionTemplate: 'Eliminate the elite guards.',
    shortDescriptionTemplate: 'Kill Elites (0/3)',
    type: 'kill_enemy',
    targetIdOptions: ['cultist', 'ghoul'],
    targetAmount: { min: 3, max: 5 },
    isOptional: true,
    isHidden: false,
    rewardInsight: 1
  },
  {
    id: 'bonus_artifact',
    descriptionTemplate: 'Recover the lost artifact.',
    shortDescriptionTemplate: 'Find Artifact',
    type: 'find_item',
    targetIdOptions: ['lost_artifact', 'cursed_idol', 'ancient_relic'],
    isOptional: true,
    isHidden: true,
    rewardItemOptions: ['elder_sign', 'ritual_candles', 'protective_ward']
  },
  {
    id: 'bonus_explore',
    descriptionTemplate: 'Fully explore the area.',
    shortDescriptionTemplate: 'Explore All (0/8)',
    type: 'explore',
    targetAmount: { min: 6, max: 10 },
    isOptional: true,
    isHidden: false,
    rewardInsight: 2
  }
];

// ============================================================================
// UTILITY FUNCTIONS (moved to scenarioGeneratorHelpers.ts)
// ============================================================================
// randomElement, randomRange, generateId are now imported from helpers

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate a random scenario with the specified difficulty.
 *
 * REFACTORED: Previously 242 lines with repeated string replacements.
 * Now ~60 lines using extracted helper functions for:
 * - Template interpolation (eliminates 9x duplicate .replace() chains)
 * - Objective generation
 * - Doom event generation
 * - Victory/defeat conditions
 *
 * @param difficulty - Game difficulty level
 * @returns Complete Scenario object ready for gameplay
 */
export function generateRandomScenario(difficulty: 'Normal' | 'Hard' | 'Nightmare'): Scenario {
  // 1. Select mission type and location
  const missionType = randomElement(MISSION_TYPES);
  const location = selectLocation(
    missionType,
    INDOOR_START_LOCATIONS,
    OUTDOOR_START_LOCATIONS,
    MIXED_START_LOCATIONS
  );

  // 2. Generate contextual elements
  const target = randomElement(TARGET_NAMES);
  const victim = randomElement(VICTIM_NAMES);
  const mystery = randomElement(MYSTERY_NAMES);
  const collectible = selectCollectible();

  // 3. Build template context for string interpolation
  const ctx = buildTemplateContext(location, target, victim, mystery, collectible);

  // 4. Generate objectives (main + bonus)
  const mainObjectives = generateObjectivesFromTemplates(missionType, ctx);
  const bonusObjectives = generateBonusObjectives(randomRange(1, 2));
  const objectives = [...mainObjectives, ...bonusObjectives];

  // 5. Update context with objective-specific values for goal interpolation
  const goalCtx: TemplateContext = {
    ...ctx,
    count: objectives[0]?.targetAmount ?? 3,
    rounds: objectives.find(o => o.type === 'survive')?.targetAmount ?? 10
  };

  // 6. Generate scenario elements using helpers
  const baseDoom = missionType.baseDoom[difficulty];
  const title = generateTitle(missionType, ctx);
  const goal = interpolateTemplate(missionType.goalTemplate, goalCtx);
  const briefing = generateBriefing(missionType, difficulty, location.name, goal);
  const doomEvents = generateDoomEvents(difficulty, baseDoom);
  const victoryConditions = buildVictoryConditions(missionType, objectives);
  const defeatConditions = buildDefeatConditions(missionType, victim, objectives);
  const theme = getThemeFromLocation(location.name, location.atmosphere);

  // 7. Assemble and return scenario
  return {
    id: generateId(),
    title,
    description: `${missionType.name} mission at ${location.name}. ${goal}`,
    briefing,
    startDoom: baseDoom,
    startLocation: location.name,
    specialRule: missionType.specialRuleTemplate,
    difficulty,
    tileSet: missionType.tileSet,
    theme,
    goal,
    victoryType: missionType.victoryType,
    steps: [], // Legacy field
    objectives,
    victoryConditions,
    defeatConditions,
    doomEvents,
    estimatedTime: difficulty === 'Nightmare' ? '60-90 min' : difficulty === 'Hard' ? '45-60 min' : '30-45 min',
    recommendedPlayers: difficulty === 'Nightmare' ? '3-4' : difficulty === 'Hard' ? '2-3' : '1-2'
  };
}

/**
 * Generate multiple scenarios for preview/selection
 */
export function generateScenarioPool(difficulty: 'Normal' | 'Hard' | 'Nightmare', count: number = 3): Scenario[] {
  const scenarios: Scenario[] = [];
  const usedMissionTypes = new Set<string>();

  for (let i = 0; i < count; i++) {
    let scenario: Scenario;
    let attempts = 0;

    // Try to get unique mission types
    do {
      scenario = generateRandomScenario(difficulty);
      attempts++;
    } while (usedMissionTypes.has(scenario.victoryType) && attempts < 10);

    usedMissionTypes.add(scenario.victoryType);
    scenarios.push(scenario);
  }

  return scenarios;
}

// ============================================================================
// VALIDATED SCENARIO GENERATION
// ============================================================================

import {
  validateScenarioWinnability,
  autoFixScenario,
  ValidationResult,
  getValidationSummary
} from './scenarioValidator';

/**
 * Generates a scenario and validates it is winnable.
 * If the scenario has issues, it attempts to auto-fix them.
 * Returns the scenario along with validation results.
 */
export function generateValidatedScenario(
  difficulty: 'Normal' | 'Hard' | 'Nightmare',
  maxAttempts: number = 5
): {
  scenario: Scenario;
  validation: ValidationResult;
  wasFixed: boolean;
  fixChanges: string[];
  attempts: number;
} {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const scenario = generateRandomScenario(difficulty);
    const validation = validateScenarioWinnability(scenario);

    if (validation.isWinnable && validation.confidence >= 70) {
      return {
        scenario,
        validation,
        wasFixed: false,
        fixChanges: [],
        attempts: attempt
      };
    }

    // Try auto-fixing
    const { fixed, changes } = autoFixScenario(scenario);
    const revalidation = validateScenarioWinnability(fixed);

    if (revalidation.isWinnable) {
      return {
        scenario: fixed,
        validation: revalidation,
        wasFixed: true,
        fixChanges: changes,
        attempts: attempt
      };
    }
  }

  // Fallback: return the best attempt with fixes applied
  const lastScenario = generateRandomScenario(difficulty);
  const { fixed, changes } = autoFixScenario(lastScenario);
  const validation = validateScenarioWinnability(fixed);

  return {
    scenario: fixed,
    validation,
    wasFixed: changes.length > 0,
    fixChanges: changes,
    attempts: maxAttempts
  };
}

/**
 * Quick check if a scenario is valid without full validation
 * Useful for filtering in UI
 */
export function quickValidateScenario(scenario: Scenario): {
  isValid: boolean;
  reason?: string;
} {
  // Check survival missions
  const survivalObj = scenario.objectives.find(o => o.type === 'survive' && !o.isOptional);
  if (survivalObj && (survivalObj.targetAmount || 0) > scenario.startDoom) {
    return {
      isValid: false,
      reason: `Survival requires ${survivalObj.targetAmount} rounds but doom is only ${scenario.startDoom}`
    };
  }

  // Check assassination missions have boss
  if (scenario.victoryType === 'assassination') {
    const hasBossSpawn = scenario.doomEvents.some(e => e.type === 'spawn_boss');
    const hasBossObjective = scenario.objectives.some(o => o.type === 'kill_boss');
    if (hasBossObjective && !hasBossSpawn) {
      return {
        isValid: false,
        reason: 'Assassination target never spawns'
      };
    }
  }

  // Check kill objectives have enough enemies
  const killObj = scenario.objectives.find(o => o.type === 'kill_enemy' && !o.isOptional);
  if (killObj && (killObj.targetAmount || 0) > 0) {
    const totalEnemies = scenario.doomEvents
      .filter(e => e.type === 'spawn_enemy')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    if (totalEnemies < (killObj.targetAmount || 0)) {
      return {
        isValid: false,
        reason: `Need ${killObj.targetAmount} kills but only ${totalEnemies} enemies spawn`
      };
    }
  }

  // Check doom is reasonable for objective count
  const requiredObjectives = scenario.objectives.filter(o => !o.isOptional).length;
  if (scenario.startDoom < requiredObjectives * 2) {
    return {
      isValid: false,
      reason: 'Not enough time to complete all objectives'
    };
  }

  return { isValid: true };
}

/**
 * Get validation summary for display in UI
 */
export function getScenarioValidationInfo(scenario: Scenario): {
  isWinnable: boolean;
  confidence: number;
  summary: string;
  warnings: string[];
  errors: string[];
} {
  const validation = validateScenarioWinnability(scenario);

  return {
    isWinnable: validation.isWinnable,
    confidence: validation.confidence,
    summary: getValidationSummary(validation),
    warnings: validation.issues
      .filter(i => i.severity === 'warning')
      .map(i => i.message),
    errors: validation.issues
      .filter(i => i.severity === 'error')
      .map(i => i.message)
  };
}
