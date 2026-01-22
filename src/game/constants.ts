import {
  Character, CharacterType, Item, EventCard, Tile, Scenario, Madness, Spell,
  BestiaryEntry, EnemyType, Obstacle, ObstacleType, EdgeData, TileCategory,
  SkillType, OccultistSpell, HQWeapon, HQArmor, WeatherEffect, WeatherType,
  WeatherCondition, WeatherIntensity, DarkRoomDiscoveryType, DarkRoomContent,
  createDarkRoomContent, Player, hasLightSource, MilestoneBonus, SurvivorTrait,
  ClassLevelBonus,
  // Quick Wins types
  DeathPerk, DeathPerkType, ActiveDeathPerk,
  AchievementBadge, EarnedBadge,
  DesperateMeasure,
  CriticalBonus, CriticalPenalty, CriticalBonusType, CriticalPenaltyType,
  CraftingRecipe
} from './types';

// ============================================================================
// 1.1 TILE CONNECTION SYSTEM
// ============================================================================

/**
 * Defines which tile categories can connect to each other.
 * This ensures logical world building - you can't have a crypt next to a street.
 */
export const CATEGORY_CONNECTIONS: Record<TileCategory, TileCategory[]> = {
  nature: ['nature', 'street', 'urban'],
  urban: ['urban', 'street', 'nature', 'facade'],
  street: ['street', 'nature', 'urban', 'facade'],
  facade: ['street', 'urban', 'foyer'],  // FACADE -> FOYER requires DOOR
  foyer: ['facade', 'corridor', 'room', 'stairs'],
  corridor: ['foyer', 'corridor', 'room', 'stairs'],
  room: ['corridor', 'room', 'stairs'],
  stairs: ['foyer', 'corridor', 'room', 'basement', 'crypt'],
  basement: ['stairs', 'basement', 'crypt'],
  crypt: ['basement', 'crypt', 'stairs']
};

/**
 * Defines which tile transitions require a door edge.
 * Without a door, these transitions should be blocked by walls.
 */
export const DOOR_REQUIRED_TRANSITIONS: [TileCategory, TileCategory][] = [
  ['facade', 'foyer'],
  ['corridor', 'room'],
  ['foyer', 'room']
];

/**
 * Zone levels for each category - used for vertical navigation
 */
export const CATEGORY_ZONE_LEVELS: Record<TileCategory, number> = {
  nature: 0,
  urban: 0,
  street: 0,
  facade: 0,
  foyer: 1,
  corridor: 1,
  room: 1,
  stairs: 1,  // Stairs span multiple levels
  basement: -1,
  crypt: -2
};

/**
 * Validates if two tile categories can be connected
 * @param fromCategory - The source tile category
 * @param toCategory - The target tile category
 * @returns boolean indicating if connection is valid
 */
export function canCategoriesConnect(fromCategory: TileCategory, toCategory: TileCategory): boolean {
  const allowedConnections = CATEGORY_CONNECTIONS[fromCategory];
  return allowedConnections?.includes(toCategory) ?? false;
}

/**
 * Checks if a door is required for a transition between two categories
 * @param fromCategory - The source tile category
 * @param toCategory - The target tile category
 * @returns boolean indicating if door is required
 */
export function isDoorRequired(fromCategory: TileCategory, toCategory: TileCategory): boolean {
  return DOOR_REQUIRED_TRANSITIONS.some(
    ([from, to]) =>
      (from === fromCategory && to === toCategory) ||
      (from === toCategory && to === fromCategory)
  );
}

export interface TileConnectionValidation {
  isValid: boolean;
  requiresDoor: boolean;
  suggestedEdgeType: 'open' | 'door' | 'wall';
  reason?: string;
}

/**
 * Validates a tile connection and returns detailed information
 * @param fromCategory - The source tile category
 * @param toCategory - The target tile category
 * @param hasExistingDoor - Whether there's already a door on this edge
 * @returns Validation result with suggested edge type
 */
export function validateTileConnection(
  fromCategory: TileCategory,
  toCategory: TileCategory,
  hasExistingDoor: boolean = false
): TileConnectionValidation {
  // Check if categories can connect at all
  if (!canCategoriesConnect(fromCategory, toCategory)) {
    return {
      isValid: false,
      requiresDoor: false,
      suggestedEdgeType: 'wall',
      reason: `${fromCategory} cannot connect to ${toCategory}`
    };
  }

  // Check if door is required
  const requiresDoor = isDoorRequired(fromCategory, toCategory);

  if (requiresDoor && !hasExistingDoor) {
    return {
      isValid: true,
      requiresDoor: true,
      suggestedEdgeType: 'door',
      reason: `Transition from ${fromCategory} to ${toCategory} requires a door`
    };
  }

  return {
    isValid: true,
    requiresDoor: false,
    suggestedEdgeType: 'open'
  };
}

/**
 * Gets valid neighbor categories for a given tile category
 * @param category - The tile category to get neighbors for
 * @returns Array of valid neighboring categories
 */
export function getValidNeighborCategories(category: TileCategory): TileCategory[] {
  return CATEGORY_CONNECTIONS[category] || [];
}

/**
 * Selects an appropriate category for a new tile based on the source tile
 * @param fromCategory - The category of the tile we're expanding from
 * @param preferIndoor - Whether to prefer indoor categories
 * @returns A randomly selected valid category
 */
export function selectRandomConnectableCategory(
  fromCategory: TileCategory,
  preferIndoor: boolean = false
): TileCategory {
  const validCategories = getValidNeighborCategories(fromCategory);

  if (validCategories.length === 0) {
    return fromCategory; // Fallback to same category
  }

  // Filter by indoor/outdoor preference
  const indoorCategories: TileCategory[] = ['facade', 'foyer', 'corridor', 'room', 'stairs', 'basement', 'crypt'];
  const outdoorCategories: TileCategory[] = ['nature', 'urban', 'street'];

  let filteredCategories = validCategories;
  if (preferIndoor) {
    const indoorOnly = validCategories.filter(c => indoorCategories.includes(c));
    if (indoorOnly.length > 0) filteredCategories = indoorOnly;
  } else {
    const outdoorOnly = validCategories.filter(c => outdoorCategories.includes(c));
    if (outdoorOnly.length > 0) filteredCategories = outdoorOnly;
  }

  return filteredCategories[Math.floor(Math.random() * filteredCategories.length)];
}

// ============================================================================
// SPELLS AND CHARACTERS
// ============================================================================

export const SPELLS: Spell[] = [
  { id: 'wither', name: 'Wither', cost: 2, description: 'Drains life force from a target.', effectType: 'damage', value: 2, range: 3 },
  { id: 'mend', name: 'Mend Flesh', cost: 2, description: 'Knits wounds together with arcane energy.', effectType: 'heal', value: 2, range: 1 },
  { id: 'reveal', name: 'True Sight', cost: 1, description: 'Reveals hidden clues in the area.', effectType: 'reveal', value: 1, range: 0 },
  { id: 'banish', name: 'Banish', cost: 4, description: 'A powerful rite to weaken the connection to the void.', effectType: 'banish', value: 5, range: 2 }
];

// ============================================================================
// HERO QUEST STYLE WEAPONS
// ============================================================================
// In Hero Quest, the weapon DETERMINES your attack dice (not a bonus)
// Weapon = Total attack dice. Higher tier weapons = more dice.

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
// Defense dice = base defense + armor defense dice
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
// OCCULTIST SPELLS (Hero Quest Elf-style)
// ============================================================================
// Occultist uses SPELLS instead of heavy weapons
// Spells have limited uses per scenario
// Attack spells use Willpower dice OR fixed dice

export const OCCULTIST_SPELLS: OccultistSpell[] = [
  // ATTACK SPELLS
  {
    id: 'eldritch_bolt',
    name: 'Eldritch Bolt',
    description: 'A crackling bolt of otherworldly energy strikes the target.',
    attackDice: 3,
    useWillpower: false, // Fixed 3 dice
    usesPerScenario: -1, // Unlimited (1/round)
    effect: 'attack',
    range: 3
  },
  {
    id: 'mind_blast',
    name: 'Mind Blast',
    description: 'Psychic assault that damages both body and mind.',
    attackDice: 2,
    useWillpower: false,
    usesPerScenario: 2,
    effect: 'attack_horror',
    horrorDamage: 1, // Also causes 1 horror to enemy
    range: 2
  },

  // BANISH SPELL
  {
    id: 'banish_spell',
    name: 'Banish',
    description: 'Send a weak enemy back to the void.',
    attackDice: 0, // Uses WIL check vs DC 5
    useWillpower: true,
    usesPerScenario: 2,
    effect: 'banish', // Instantly destroys weak enemy (HP <= 3)
    range: 2
  },

  // DEFENSIVE SPELL
  {
    id: 'dark_shield',
    name: 'Dark Shield',
    description: 'Shadows coalesce into a protective barrier.',
    attackDice: 0,
    useWillpower: false,
    usesPerScenario: 3,
    effect: 'defense',
    defenseBonus: 2, // +2 defense dice this round
    range: 0
  },

  // UTILITY SPELL
  {
    id: 'glimpse_beyond',
    name: 'Glimpse Beyond',
    description: 'See through walls and into adjacent rooms.',
    attackDice: 0,
    useWillpower: false,
    usesPerScenario: 1,
    effect: 'utility', // Reveal all tiles within 3 range
    range: 3
  }
];

// ============================================================================
// HERO QUEST STYLE CHARACTERS
// ============================================================================
// Combat uses WEAPON dice for attack (not attribute + bonus)
// Defense uses BASE + ARMOR dice
// Mapped from Hero Quest classes:
// - Veteran = Barbarian (Fighter, high attack/HP)
// - Detective = Dwarf (Investigator, balanced with defense)
// - Professor = Wizard (Scholar, low combat, high sanity)
// - Occultist = Elf (Hybrid, uses SPELLS instead of heavy weapons)
// - Journalist = Rogue (Scout, +1 movement)
// - Doctor = Healer (Support, heals 2 HP)

export const CHARACTERS: Record<CharacterType, Character> = {
  // VETERAN (Barbarian) - Fighter class
  // Can use ALL weapons, +1 Attack die with melee
  // Special: "Fearless" - Immune to first Horror check
  veteran: {
    id: 'veteran', name: 'The Veteran',
    hp: 6, maxHp: 6, sanity: 3, maxSanity: 3, insight: 0,
    attributes: { strength: 5, agility: 3, intellect: 2, willpower: 3 },
    special: 'Can use ALL weapons. +1 melee attack die. Fearless (immune to first Horror check)',
    specialAbility: 'combat_bonus',
    baseAttackDice: 3,    // Highest base attack (like Barbarian)
    baseDefenseDice: 2,   // Standard defense
    weaponRestrictions: [] // Can use everything
  },

  // DETECTIVE (Dwarf) - Investigator class
  // Can use all weapons except Tommy Gun
  // +1 die on Investigation, Sharp Eye (finds hidden doors automatically)
  detective: {
    id: 'detective', name: 'The Private Eye',
    hp: 5, maxHp: 5, sanity: 4, maxSanity: 4, insight: 1,
    attributes: { strength: 3, agility: 3, intellect: 4, willpower: 3 },
    special: '+1 Investigation die. Sharp Eye (auto-find hidden doors)',
    specialAbility: 'investigate_bonus',
    baseAttackDice: 2,    // Standard attack
    baseDefenseDice: 3,   // Higher defense (like Dwarf)
    weaponRestrictions: ['tommy_gun']
  },

  // PROFESSOR (Wizard) - Scholar class with LIMITED SPELLS
  // Can ONLY use Derringer, Knife
  // Can read occult texts without Sanity loss
  // Special: "Knowledge" - +2 dice on puzzles
  // Has 2 scholarly spells: True Sight, Mend Flesh (Hero Quest Wizard style)
  professor: {
    id: 'professor', name: 'The Professor',
    hp: 3, maxHp: 3, sanity: 6, maxSanity: 6, insight: 3,
    attributes: { strength: 2, agility: 2, intellect: 5, willpower: 4 },
    special: 'Read occult safely. Knowledge (+2 puzzle dice). 2 scholarly spells',
    specialAbility: 'occult_immunity',
    baseAttackDice: 1,    // Lowest attack (like Wizard)
    baseDefenseDice: 2,   // Standard defense
    weaponRestrictions: ['revolver', 'shotgun', 'tommy_gun', 'rifle', 'machete'], // Can only use derringer, knife
    canCastSpells: true   // Has limited spells (True Sight, Mend Flesh)
  },

  // OCCULTIST (Elf) - Hybrid class with SPELLS
  // Can use Knife, Revolver only
  // Has SPELLS instead of heavy weapons
  // Special: "Ritual Master" - Can cast 3 spells per scenario
  occultist: {
    id: 'occultist', name: 'The Occultist',
    hp: 3, maxHp: 3, sanity: 5, maxSanity: 5, insight: 4,
    attributes: { strength: 2, agility: 3, intellect: 3, willpower: 5 },
    special: 'Ritual Master: Uses SPELLS instead of heavy weapons. Picks 3 spells per scenario',
    specialAbility: 'ritual_master',
    baseAttackDice: 2,    // Standard attack (like Elf)
    baseDefenseDice: 2,   // Standard defense
    weaponRestrictions: ['shotgun', 'tommy_gun', 'rifle', 'machete'], // Can only use knife, revolver
    canCastSpells: true
  },

  // JOURNALIST (Rogue) - Scout class
  // Can use all except Shotgun, Tommy Gun
  // +1 Movement
  // Special: "Escape Artist" - Can flee without Horror check
  journalist: {
    id: 'journalist', name: 'The Journalist',
    hp: 4, maxHp: 4, sanity: 4, maxSanity: 4, insight: 1,
    attributes: { strength: 2, agility: 4, intellect: 4, willpower: 3 },
    special: '+1 Movement. Escape Artist (flee without Horror check)',
    specialAbility: 'escape_bonus',
    baseAttackDice: 2,    // Standard attack
    baseDefenseDice: 2,   // Standard defense
    weaponRestrictions: ['shotgun', 'tommy_gun']
  },

  // DOCTOR (Healer) - Support class
  // Can use Derringer, Knife only
  // Heals 2 HP instead of 1
  // Special: "Medical Kit" - Starts with free heal item
  doctor: {
    id: 'doctor', name: 'The Doctor',
    hp: 4, maxHp: 4, sanity: 5, maxSanity: 5, insight: 2,
    attributes: { strength: 2, agility: 3, intellect: 4, willpower: 4 },
    special: 'Heals 2 HP instead of 1. Medical Kit (starts with free heal)',
    specialAbility: 'heal_bonus',
    baseAttackDice: 1,    // Low attack
    baseDefenseDice: 2,   // Standard defense
    weaponRestrictions: ['revolver', 'shotgun', 'tommy_gun', 'rifle', 'machete'] // Can only use derringer, knife
  }
};

export const INDOOR_LOCATIONS = [
  // FACADE - Building entrances
  'Abandoned Manor', 'Blackwood Mansion', 'Crumbling Church', 'Arkham Asylum', 'Derelict Warehouse',
  'The Gilded Hotel', 'Dusty Antique Shop', 'Boarded-Up Townhouse', 'The Witch House', 'Funeral Parlor',
  'The Silver Key Inn', 'Condemned Tenement', 'Faculty Building', 'Orne Library Entrance',

  // FOYER - Entry areas
  'Grand Foyer', 'Marble Lobby', 'Dim Reception', 'Cobwebbed Vestibule', 'Servants Entrance',
  'Hotel Lobby', 'Library Atrium', 'Church Narthex', 'Asylum Reception', 'Museum Entrance Hall',

  // CORRIDOR - Connecting passages
  'Dusty Corridor', 'Servants Passage', 'Darkened Hallway', 'Collapsed Wing', 'Hospital Ward',
  'Cell Block Corridor', 'Narrow Service Hall', 'Portrait Gallery', 'Windowless Passage', 'Creaking Floorboards',

  // ROOM - Individual chambers
  'Private Study', 'Master Bedroom', 'Abandoned Kitchen', 'Ritual Chamber', 'Hidden Laboratory',
  'Trophy Room', 'Séance Parlor', 'Dusty Nursery', 'Wine Tasting Room', 'Music Room',
  'Conservatory', 'Billiard Room', 'Drawing Room', 'Guest Quarters', 'Locked Office',
  'Forgotten Pantry', 'Linen Closet', 'Servants Quarters', 'Sun Room', 'Smoking Lounge',
  'Map Room', 'Artifact Storage', 'Dissection Theater', 'Padded Cell', 'Records Room',

  // STAIRS - Vertical connections
  'Grand Staircase', 'Spiral Stairs', 'Rickety Ladder', 'Servants Stair', 'Bell Tower Steps',
  'Cellar Stairs', 'Emergency Exit', 'Hidden Stairwell', 'Crumbling Steps', 'Fire Escape',

  // BASEMENT - Underground level 1
  'Dark Cellar', 'Wine Cellar', 'Cold Storage', 'Flooded Basement', 'Boiler Room',
  'Coal Chute', 'Root Cellar', 'Maintenance Tunnel', 'Smugglers Cache', 'Underground Vault',
  'Sewer Access', 'Storm Drain', 'Foundation Ruins', 'Catacombs Entrance', 'Rats Nest',

  // CRYPT - Deep underground
  'Secret Crypt', 'Sacrificial Altar', 'Eldritch Portal', 'Bone Ossuary', 'Forgotten Tomb',
  'Underground Lake', 'Cultist Sanctum', 'Ancient Cavern', 'Star Chamber', 'The Pit',
  'Idol Chamber', 'Mass Grave', 'Petrified Garden', 'Echo Chamber', 'The Black Pool'
];

export const OUTDOOR_LOCATIONS = [
  // NATURE - Wilderness areas
  'Blackwood Forest', 'Moonlit Clearing', 'Coastal Cliffs', 'Treacherous Marsh', 'Ancient Stone Circle',
  'Whispering Woods', 'Dead Mans Hollow', 'Blighted Orchard', 'Overgrown Ruins', 'The Standing Stones',
  'Fog-Shrouded Moor', 'Witch Tree Grove', 'Stagnant Pond', 'Collapsed Mine Entrance', 'The Devils Acre',

  // URBAN - City locations
  'Town Square', 'Arkham Harbor', 'Merchant District', 'Train Station', 'Old Cemetery',
  'University Campus', 'Industrial Quarter', 'Fish Market', 'City Park', 'Courthouse Steps',
  'Town Hall Plaza', 'Newspaper Row', 'Charity Hospital Grounds', 'Police Precinct Yard', 'Gallows Hill',
  'Founders Plaza', 'The Gasworks', 'Cannery Row', 'The Shipyard', 'Immigrant Quarter',

  // STREET - Connecting paths
  'Main Street', 'Shadowy Alley', 'Foggy Back Lane', 'Sewer Grate', 'Narrow Passage',
  'Tram Tracks', 'Cobblestone Road', 'Lamplit Avenue', 'Dead End', 'The Crossroads',
  'Waterfront Walk', 'Tenement Row', 'Church Street', 'Riverfront Path', 'Factory Gate',
  'Iron Bridge', 'Stone Overpass', 'Winding Lane', 'Brick Tunnel', 'The Narrows',

  // Special outdoor locations
  'Old Lighthouse', 'Misty Docks', 'Hanging Tree', 'Ruined Farmhouse', 'Lonely Crossroads',
  'Cemetery Gate', 'Miskatonic Bridge', 'Innsmouth Wharf', 'Suicide Cliff', 'The Gibbet',
  'Forgotten Well', 'Flooded Quarry', 'Hermits Shack', 'Abandoned Campsite', 'The Execution Ground'
];

export const INDOOR_CONNECTORS = [
  'Narrow Hallway', 'Dark Corridor', 'Grand Staircase', 'Servant Passage', 'Dusty Landing', 'Maintenance Shaft', 'Basement Tunnel', 'Service Elevator',
  'Spiral Stairs', 'Crawlspace'
];

export const OUTDOOR_CONNECTORS = [
  'Narrow Alley', 'Cobblestone Path', 'Foggy Bridge', 'Tram Track', 'Dark Tunnel', 'Stone Steps', 'River Crossing', 'Overpass', 'Dirt Trail',
  'Winding Lane'
];

export const LOCATION_DESCRIPTIONS: Record<string, string> = {
  // ========== INDOOR - FACADE ==========
  'Abandoned Manor': 'Dust motes dance in the stale air. Portraits seem to watch you pass. The floorboards groan beneath your feet.',
  'Blackwood Mansion': 'The infamous Blackwood estate looms before you. Ivy chokes the stonework, and every window is dark.',
  'Crumbling Church': 'The steeple leans at an impossible angle. The bells have not rung in decades, yet sometimes they toll at midnight.',
  'Arkham Asylum': 'Iron gates screech as you pass. Behind barred windows, pale faces press against the glass, whispering warnings.',
  'Derelict Warehouse': 'Broken crates and rusted chains litter the floor. The smell of fish and something fouler permeates everything.',
  'The Gilded Hotel': 'Faded grandeur drips from every surface. The chandelier sways though there is no breeze. The concierge desk is unmanned.',
  'Dusty Antique Shop': 'Curiosities from every era crowd the shelves. A music box plays a tune you almost remember from childhood nightmares.',
  'Boarded-Up Townhouse': 'Boards cover every window, nailed from the inside. Someone wanted very badly to keep something out—or in.',
  'The Witch House': 'The angles are wrong here. Corners that should be square are not. Your compass spins uselessly.',
  'Funeral Parlor': 'Embalming fluid and lilies. The caskets on display are sized for bodies taller than any human.',
  'The Silver Key Inn': 'A faded sign creaks overhead. The innkeeper\'s smile is too wide, and he knows your name without asking.',
  'Condemned Tenement': 'Water stains map the walls like alien continents. Somewhere above, footsteps pace endlessly.',
  'Faculty Building': 'Miskatonic University. Lecture halls echo with forbidden knowledge. The trophy cases hold things that were never animals.',
  'Orne Library Entrance': 'Leather and dust. The restricted section calls to you. The librarian watches with knowing eyes.',

  // ========== INDOOR - FOYER ==========
  'Grand Foyer': 'A magnificent entrance hall. The chandelier\'s crystals catch light that has no source. Twin staircases spiral upward into shadow.',
  'Marble Lobby': 'Your footsteps echo off veined marble. The elevator indicator points to a floor that should not exist.',
  'Dim Reception': 'A single lamp flickers on the reception desk. The guest book lies open to a page filled with the same name repeated.',
  'Cobwebbed Vestibule': 'Thick webs veil the coat hooks. Something large made these webs. Something that has not left.',
  'Servants Entrance': 'A narrow passage for those who were meant to be unseen. Bell wires hang slack, yet occasionally one rings.',
  'Hotel Lobby': 'Velvet ropes guide invisible queues. Keys dangle on the board behind the desk—room 13 is always occupied.',
  'Library Atrium': 'Light filters through stained glass depicting scholars performing rites that no book describes.',
  'Church Narthex': 'Holy water fonts stand dry. The donation box is stuffed with strange coins from no known nation.',
  'Asylum Reception': 'Check-in forms yellow with age. The clock runs backwards. The admitting nurse has been dead for thirty years.',
  'Museum Entrance Hall': 'Ancient artifacts line the walls. The dinosaur skeleton seems to turn its head as you pass.',

  // ========== INDOOR - CORRIDOR ==========
  'Dusty Corridor': 'No one has walked here in years—except for the fresh footprints in the dust that are not your own.',
  'Servants Passage': 'Hidden arteries of the house. You hear whispered conversations through the walls—planning, plotting, praying.',
  'Darkened Hallway': 'Your flashlight barely penetrates the gloom. The darkness here feels thick, almost liquid.',
  'Collapsed Wing': 'Rubble blocks most paths. Through gaps in the debris, you glimpse rooms that were never in any floor plan.',
  'Hospital Ward': 'Empty beds with restraints. Medical charts describe treatments that would kill, not cure.',
  'Cell Block Corridor': 'Iron doors line both walls. Scratching sounds come from behind each one. Feeding time was hours ago.',
  'Narrow Service Hall': 'Pipes run overhead, sweating moisture. The walls press close. Something breathes in rhythm with the building.',
  'Portrait Gallery': 'Generations of the family watch you. The oldest portrait shows a face that appears in every painting after.',
  'Windowless Passage': 'No natural light has ever touched these stones. The air tastes of centuries and secrets.',
  'Creaking Floorboards': 'Every step announces your presence. The boards creak in response, as if something below is answering.',

  // ========== INDOOR - ROOM ==========
  'Private Study': 'Books in languages you cannot name. A half-finished letter warns of something coming. The ink is still wet.',
  'Master Bedroom': 'The bed is made with military precision. A journal on the nightstand describes dreams that are not dreams.',
  'Abandoned Kitchen': 'Pots on the stove contain meals decades old, still bubbling. The pantry door bulges outward.',
  'Ritual Chamber': 'Symbols painted in substances best not examined. The air thrums with wrongness. Something was summoned here.',
  'Hidden Laboratory': 'Glass tubes and copper coils. Specimens float in jars—some human, some almost human, some neither.',
  'Trophy Room': 'Mounted heads of creatures from no bestiary. One of them blinks.',
  'Séance Parlor': 'A round table with many chairs. The planchette moves on its own, spelling out "HELP US LEAVE."',
  'Dusty Nursery': 'A rocking horse moves gently. The crib contains something wrapped in swaddling clothes. It is not a baby.',
  'Wine Tasting Room': 'Vintages older than the nation. The sommelier\'s notes describe flavors no grape could produce.',
  'Music Room': 'A grand piano plays itself. The melody is beautiful and terrible. You feel compelled to dance.',
  'Conservatory': 'Plants that should not grow together thrive here. Some reach toward you as you pass.',
  'Billiard Room': 'The balls roll on their own, always forming the same pattern—a constellation from no earthly sky.',
  'Drawing Room': 'Elegant furniture arranged for conversation. The previous occupants still sit here, though they no longer breathe.',
  'Guest Quarters': 'The bed is turned down for you. There is a chocolate on the pillow. It is not chocolate.',
  'Locked Office': 'Filing cabinets full of records on people who never existed, with photographs of places that cannot be.',
  'Forgotten Pantry': 'Preserves from years with impossible dates. Some jars contain things that move when you look away.',
  'Linen Closet': 'Towels folded perfectly. Behind them, a passage leads somewhere the blueprints don\'t show.',
  'Servants Quarters': 'Narrow beds, personal effects left mid-life. Everyone left at once. No one knows why.',
  'Sun Room': 'Windows face every direction, yet no light enters. Houseplants grow toward the darkness.',
  'Smoking Lounge': 'Cigar smoke hangs eternally. Leather chairs bear the impressions of those who still occupy them.',
  'Map Room': 'Charts of coastlines that have changed, and some that were never real. One map shows your exact location.',
  'Artifact Storage': 'Crates stenciled in dead languages. Something inside one of them is breathing.',
  'Dissection Theater': 'Observation seats circle the operating table. The stains predate modern medicine. The tools are still sharp.',
  'Padded Cell': 'The walls absorb sound. Words are scratched into every surface—the same phrase, in every language.',
  'Records Room': 'Filing cabinets from floor to ceiling. Every record describes your life. They continue past today\'s date.',

  // ========== INDOOR - STAIRS ==========
  'Grand Staircase': 'Sweeping steps that have witnessed elegance and horror. The banister is worn smooth by countless hands—or tentacles.',
  'Spiral Stairs': 'You climb but never seem to arrive. The view from the window shows the same scene at every landing.',
  'Rickety Ladder': 'Rungs worn smooth by use. Looking down, you see no bottom. Looking up, you see no top.',
  'Servants Stair': 'Hidden behind the walls. Generations of servants trod these steps. Their footsteps echo still.',
  'Bell Tower Steps': 'The bells hang motionless above. Yet you hear tolling, always approaching, never arriving.',
  'Cellar Stairs': 'Each step takes you deeper than the last should. The temperature drops with every descent.',
  'Emergency Exit': 'Metal stairs leading down into darkness. The door at the bottom has been welded shut—from this side.',
  'Hidden Stairwell': 'Not on any blueprint. The steps are worn in the middle, as if by a single shuffling foot.',
  'Crumbling Steps': 'Stone stairs eaten by time. Each step might be your last. Something waits at the bottom.',
  'Fire Escape': 'Rusted metal clinging to the building. The ladder leads to a window that shows a different city.',

  // ========== INDOOR - BASEMENT ==========
  'Dark Cellar': 'It smells of rot and old earth. Something scuttles in the corner. The darkness here is hungry.',
  'Wine Cellar': 'Dusty bottles from vintages that predate the manor. Some contain things other than wine.',
  'Cold Storage': 'Meat hooks hang empty. The cold comes from no mechanical source. Frost patterns spell words.',
  'Flooded Basement': 'Black water reaches your knees. Things move beneath the surface. They know you\'re here.',
  'Boiler Room': 'The boiler breathes like a living thing. Pressure gauges show impossible readings. It\'s getting hotter.',
  'Coal Chute': 'A passage to the outside world—but the darkness within reaches out, reluctant to let you leave.',
  'Root Cellar': 'Potatoes with too many eyes. Carrots that twist into screaming faces. Nothing here should be eaten.',
  'Maintenance Tunnel': 'Pipes and wires run overhead. The tunnel extends further than the building above. Much further.',
  'Smugglers Cache': 'Hidden compartments in the walls. Whatever was smuggled through here was never meant to be found.',
  'Underground Vault': 'Steel doors and combination locks. What\'s inside is worth protecting. Worth killing for.',
  'Sewer Access': 'The smell is overwhelming. Things live down here that have never seen the sun—and they\'re curious about you.',
  'Storm Drain': 'Rainwater echoes through concrete tunnels. Something else echoes back, mimicking but not quite right.',
  'Foundation Ruins': 'Older structures beneath the current building. Someone was here before. Someone is here still.',
  'Catacombs Entrance': 'Bones stacked with care. The skulls are arranged to face the entrance. They\'re watching.',
  'Rats Nest': 'Thousands of rodents. They part as you approach, forming a path. They want you to follow.',

  // ========== INDOOR - CRYPT ==========
  'Secret Crypt': 'The air is cold enough to see your breath. Ancient names are carved into stone. Some are still legible.',
  'Sacrificial Altar': 'Black stone stained with centuries of offering. The grooves channel fluids toward a central basin.',
  'Eldritch Portal': 'A doorway to somewhere else. Through it, you glimpse geometries that hurt to perceive.',
  'Bone Ossuary': 'Walls built of human remains. The arrangement is deliberate—a message in an architectural language.',
  'Forgotten Tomb': 'Sealed for millennia. The seal is broken now. Whatever was within has gone to find its descendants.',
  'Underground Lake': 'Still black water that reflects no light. Something massive moves in the depths. It knows you\'re watching.',
  'Cultist Sanctum': 'Robes hang on hooks. A schedule on the wall shows the next meeting. It\'s tonight.',
  'Ancient Cavern': 'Stalactites and stalagmites older than humanity. Cave paintings show creatures that still exist down here.',
  'Star Chamber': 'The ceiling is open to a sky full of stars—but you are deep underground, and those are not our stars.',
  'The Pit': 'A hole descending into absolute darkness. Sounds rise from below—chanting, weeping, something feeding.',
  'Idol Chamber': 'A statue of something that should not be worshipped. Your reflection in its eyes is kneeling.',
  'Mass Grave': 'Hundreds buried hastily. Disease, they said. But the bones are gnawed, and the teeth marks are human.',
  'Petrified Garden': 'Stone flowers and frozen fountains. People turned to stone mid-stride, faces locked in terror.',
  'Echo Chamber': 'Your words return wrong, twisted into warnings and prophecies. The chamber speaks with borrowed voices.',
  'The Black Pool': 'Ink-dark water that doesn\'t ripple. Your reflection shows you older, changed, not entirely you anymore.',

  // ========== OUTDOOR - NATURE ==========
  'Blackwood Forest': 'The trees crowd close, their branches like grasping skeletal fingers. No birds sing here.',
  'Moonlit Clearing': 'A perfect circle where nothing grows except pale mushrooms. The moon seems closer here.',
  'Coastal Cliffs': 'Waves crash far below. The drop calls to you. Something in the spray whispers promises.',
  'Treacherous Marsh': 'The ground sucks at your boots. Will-o-wisps dance just out of reach. They want you to follow.',
  'Ancient Stone Circle': 'Monoliths older than memory. The carvings shift when you\'re not looking directly at them.',
  'Whispering Woods': 'The leaves rustle with voices almost understood. They speak your name. They know your secrets.',
  'Dead Mans Hollow': 'Nothing lives here. Trees are blackened, grass is ash. The silence is complete and terrible.',
  'Blighted Orchard': 'Twisted apple trees bear fruit that looks healthy until you bite. The taste is indescribable.',
  'Overgrown Ruins': 'Foundations of something ancient. Vines have not reclaimed it—they\'re growing away from it.',
  'The Standing Stones': 'Arranged by hands that were not quite human. At certain times, they cast shadows that don\'t match their shapes.',
  'Fog-Shrouded Moor': 'Visibility drops to feet. Shapes move in the mist. They could be human. They probably aren\'t.',
  'Witch Tree Grove': 'Branches twisted into symbols. Ropes still hang from some. Not all the executions were legal.',
  'Stagnant Pond': 'Green scum covers the surface. Bubbles rise from the bottom—air escaping from something below.',
  'Collapsed Mine Entrance': 'Timbers rotted through. The darkness beyond breathes cold air. The miners never left.',
  'The Devils Acre': 'Crops won\'t grow. Animals won\'t graze. The soil itself is wrong—black, oily, warm to the touch.',

  // ========== OUTDOOR - URBAN ==========
  'Town Square': 'Deserted. The statue in the center looks different than you remember. Its hand has moved.',
  'Arkham Harbor': 'Salt and decay. Ships creak at their moorings. Sailors watch with eyes that reflect no light.',
  'Merchant District': 'Shops shuttered at midday. A sale sign promises "EVERYTHING MUST GO." The owner went first.',
  'Train Station': 'The last train left hours ago. The clock on the wall is shattered. The schedule shows arrivals from places that don\'t exist.',
  'Old Cemetery': 'The soil looks disturbed in front of several headstones. Fresh flowers on graves decades old.',
  'University Campus': 'Gothic spires against grey sky. Students hurry past, not meeting your eyes. Some of them aren\'t students anymore.',
  'Industrial Quarter': 'Smokestacks belch into the sky. The factory never stops. No one knows what it produces.',
  'Fish Market': 'The stench is overpowering. The fish have too many eyes. The fishmongers have too few.',
  'City Park': 'Manicured lawns and ancient trees. The benches face inward, toward a gazebo that wasn\'t there yesterday.',
  'Courthouse Steps': 'Justice is blind, they say. The statue here has had its eyes chiseled out. Recently.',
  'Town Hall Plaza': 'Official buildings ring the square. All the clocks show different times. All are correct.',
  'Newspaper Row': 'Printing presses run day and night. Tomorrow\'s headlines describe today\'s horrors.',
  'Charity Hospital Grounds': 'Where the indigent go to die. Some don\'t stay dead. The night shift is always busy.',
  'Police Precinct Yard': 'Patrol cars sit idle. The officers are all inside. They\'ve been inside for three days.',
  'Gallows Hill': 'The scaffold still stands, preserved as history. The rope sways though there\'s no wind.',
  'Founders Plaza': 'A monument to the town\'s founders. Their descendants still live here. They still look the same.',
  'The Gasworks': 'Pipes and valves and the smell of sulfur. Flames burn blue-green. Workers move mechanically, never speaking.',
  'Cannery Row': 'Processing fish that come from nowhere any fishing boat goes. The labels are in no known language.',
  'The Shipyard': 'Vessels being built for purposes unclear. The designs are wrong—too many decks, going down.',
  'Immigrant Quarter': 'People from the old countries, keeping old ways. Some of those ways should have been forgotten.',

  // ========== OUTDOOR - STREET ==========
  'Main Street': 'Gaslights flicker overhead. Store windows display mannequins that turn to watch you pass.',
  'Shadowy Alley': 'A narrow passage between buildings. Eyes watch from doorways. The shortcut may cost more than time.',
  'Foggy Back Lane': 'Mist curls around your ankles. Footsteps follow yours, always stopping a moment after you do.',
  'Sewer Grate': 'Iron bars over darkness. Something below reaches up. Fingers—too many fingers—grasp at the air.',
  'Narrow Passage': 'Walls close in on either side. You can touch both at once. They\'re warm, and they pulse.',
  'Tram Tracks': 'The trolley hasn\'t run in years. Yet you hear it coming. The driver has no face.',
  'Cobblestone Road': 'Ancient stones worn smooth. Some bear carvings—warnings from those who walked here before.',
  'Lamplit Avenue': 'Gas lamps cast yellow pools of light. Between them, darkness moves with purpose.',
  'Dead End': 'A wall where no wall should be. Fresh mortar. Something is bricked up behind it.',
  'The Crossroads': 'Four paths meet here. A marker stone lists distances to places you\'ve never heard of.',
  'Waterfront Walk': 'The harbor laps at the seawall. Things surface briefly—pale, bloated, watching.',
  'Tenement Row': 'Cramped buildings lean against each other. Faces at every window. None of them blink.',
  'Church Street': 'Steeples of different faiths line the road. The bells toll in sequence, spelling a message.',
  'Riverfront Path': 'The water flows thick and slow. It\'s not water. You hope it\'s not water.',
  'Factory Gate': 'Workers shuffle in as the whistle blows. The day shift started hours ago. The night shift never ends.',
  'Iron Bridge': 'Rusted spans over dark water. The bridge sways in rhythm—something underneath is scratching.',
  'Stone Overpass': 'Carvings of gargoyles that seem to have moved since you last looked.',
  'Winding Lane': 'Twists back on itself. You pass the same house three times. A different face watches each time.',
  'Brick Tunnel': 'Victorian engineering, but the proportions are wrong—built for something larger than human.',
  'The Narrows': 'Buildings so close their upper floors touch. Sunlight hasn\'t reached here in a century.',

  // ========== OUTDOOR - SPECIAL ==========
  'Old Lighthouse': 'The beam still sweeps the fog, though no one tends it. Ships that follow it don\'t return.',
  'Misty Docks': 'The waves lap against rotting wood. The fog is thick here. Shapes move on the water.',
  'Hanging Tree': 'A massive oak with a single thick branch. Rope marks scar the bark. It was very busy once.',
  'Ruined Farmhouse': 'Fields gone to seed. The family is still at dinner—what remains of them.',
  'Lonely Crossroads': 'Miles from anywhere. A gibbet stands empty. Nearby, fresh digging.',
  'Cemetery Gate': 'Iron gates that swing open at dusk, regardless of locks. The path beyond welcomes visitors.',
  'Miskatonic Bridge': 'Spanning the river between Arkham\'s halves. Some say what flows beneath isn\'t entirely water.',
  'Innsmouth Wharf': 'Decaying piers and the smell of the deep. The locals watch with bulging eyes. They\'re not unfriendly—just hungry.',
  'Suicide Cliff': 'The edge calls to the desperate. The rocks below are stained. Sometimes the bodies wave back.',
  'The Gibbet': 'A rusted cage for the condemned. The last occupant gnawed through the bars to escape. Or to feed.',
  'Forgotten Well': 'Stone walls dropping into darkness. Coins at the bottom—and coins on the way up, climbing.',
  'Flooded Quarry': 'Abandoned when they dug too deep. The water is the wrong color. It doesn\'t freeze in winter.',
  'Hermits Shack': 'A hermit lived here once. His journals describe visitors from beyond. His last entry is incomplete.',
  'Abandoned Campsite': 'Tents still stand. Food half-eaten. The campfire is cold. Drag marks lead toward the trees.',
  'The Execution Ground': 'Where justice was served, after a fashion. The ground is salted. Nothing grows. Nothing should.',

  // ========== CONNECTORS ==========
  'Narrow Hallway': 'Portraits line both walls. The faces are all the same. They follow you with dead eyes.',
  'Dark Corridor': 'Your footsteps echo strangely, as if something walks alongside you, just out of sync.',
  'Servant Passage': 'A hidden way through the walls. You hear conversations from rooms on either side—all the same voice.',
  'Dusty Landing': 'A platform between floors. A window shows a view that can\'t exist—the building isn\'t tall enough.',
  'Maintenance Shaft': 'Pipes and cables. The service hatch leads somewhere the blueprints don\'t show.',
  'Basement Tunnel': 'Damp stone walls. The tunnel goes further than the building above. Much further.',
  'Service Elevator': 'A small lift for staff. The buttons include floors that don\'t exist. Or shouldn\'t.',
  'Crawlspace': 'Barely room to move. Evidence others have been through here. Some didn\'t make it.',
  'Narrow Alley': 'Shadows pool between buildings. Eyes watch from fire escapes. The shortcut may cost more than time.',
  'Cobblestone Path': 'Uneven stones twist ankles. Carved symbols worn almost smooth. Almost.',
  'Foggy Bridge': 'The river whispers below. Halfway across, you can\'t see either end.',
  'Tram Track': 'The trolley doesn\'t run anymore. You hear it anyway.',
  'Dark Tunnel': 'Absolute blackness. Your light barely penetrates. Something in the dark is afraid of it. For now.',
  'Stone Steps': 'Worn by countless feet descending. The carvings suggest what lies below isn\'t meant to be visited.',
  'River Crossing': 'Stepping stones barely break the surface. The water is thick and slow.',
  'Overpass': 'A bridge over roads below. The traffic sounds wrong—engines that shouldn\'t exist.',
  'Dirt Trail': 'Winding through overgrowth. The path knows where it\'s going. Trust it or don\'t.'
};

/**
 * SCENARIOS - All playable scenarios
 *
 * DOOM SYSTEM (Pressure-Based):
 * The new doom system removes automatic doom decrease per round by default.
 * Instead, doom is affected by game events:
 *
 * - doomTickPerRound: 0 (default) = no auto-tick, 1+ = classic mode
 * - doomTickEveryNRounds: N = doom ticks every N rounds (alternative)
 * - doomOnMonsterSpawn: -1 (default) = doom decreases when monsters spawn
 * - doomOnEliteKill: +1 (default) = doom increases when elite/boss killed
 * - doomOnObjectiveComplete: +1 (default) = doom increases on objective complete
 * - doomOnSurvivorRescue: +1 (default) = doom increases when survivor rescued
 * - doomOnPlayerDeath: -2 (default) = doom decreases when player dies
 * - doomOnPortalOpen: -2 (default) = doom decreases when portal opens
 *
 * This creates a more dynamic, player-agency driven experience where
 * the doom clock responds to actions rather than just ticking down.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Escape from Blackwood Manor',
    description: 'You are trapped in the haunted Blackwood estate. The doors are sealed by dark magic. You must find the key and escape before the entity claims you.',
    briefing: `The invitation arrived three days ago, written in an ink that seemed to shift in the candlelight.

"Come to Blackwood Manor," it read. "All will be revealed."

Now you understand the true meaning of those words. The doors have sealed themselves. The windows show only darkness, regardless of the hour. And something moves in the walls - something that knows you are here.

You found the old caretaker's journal in the foyer. His final entry speaks of an Iron Key, hidden somewhere in the manor. "It is the only way out," he wrote. "Find it before HE finds you."

The clock strikes midnight. The hunt begins.`,
    startDoom: 12,
    startLocation: 'Grand Hall',
    goal: 'Find the Iron Key, locate the Exit Door, and Escape.',
    specialRule: 'Indoors only. Exit Door spawns after Key is found.',
    difficulty: 'Normal',
    tileSet: 'indoor',
    victoryType: 'escape',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    // Pressure-based doom configuration (new system - no automatic doom tick)
    doomTickPerRound: 0,           // No automatic doom decrease per round
    doomOnMonsterSpawn: -1,        // Doom decreases when monsters spawn
    doomOnEliteKill: 1,            // Doom increases when elite/boss killed
    doomOnObjectiveComplete: 1,    // Doom increases when objective completed
    steps: [
      { id: 'step1', description: 'Find the Iron Key (Investigate locations)', type: 'find_item', targetId: 'quest_key', completed: false },
      { id: 'step2', description: 'Locate the Exit Door', type: 'find_tile', targetId: 'Exit Door', completed: false },
      { id: 'step3', description: 'Unlock the Door and Escape', type: 'interact', targetId: 'Exit Door', completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_key',
        description: 'Search the manor rooms to find the Iron Key that unlocks the sealed exit.',
        shortDescription: 'Find the Iron Key',
        type: 'find_item',
        targetId: 'quest_key',
        targetAmount: 1,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_find_exit',
        description: 'Locate the Exit Door. It will only reveal itself once you possess the key.',
        shortDescription: 'Find the Exit',
        type: 'find_tile',
        targetId: 'exit_door',
        targetAmount: 1,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_key',
        completed: false
      },
      {
        id: 'obj_escape',
        description: 'Use the Iron Key to unlock the exit and escape the manor.',
        shortDescription: 'Escape the Manor',
        type: 'escape',
        targetId: 'exit_door',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_exit',
        completed: false
      },
      {
        id: 'obj_bonus_journal',
        description: 'Find the caretaker\'s hidden journal pages scattered throughout the manor.',
        shortDescription: 'Find Journal Pages (0/3)',
        type: 'collect',
        targetId: 'journal_page',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 2,
        rewardItem: 'elder_sign'
      }
    ],
    victoryConditions: [
      {
        type: 'escape',
        description: 'Escape through the Exit Door with the Iron Key',
        checkFunction: 'checkEscapeVictory',
        requiredObjectives: ['obj_find_key', 'obj_find_exit', 'obj_escape']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The doom counter reaches zero' }
    ],
    doomEvents: [
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'The cultists have found you!' },
      { threshold: 5, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'Hungry ghouls emerge from the shadows.' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'A Shoggoth blocks the way!' }
    ]
  },
  {
    id: 's2',
    title: 'Assassination of the High Priest',
    description: 'The Order of the Black Sun is performing a ritual to summon a Great Old One. You must silence their leader before the ritual completes.',
    briefing: `The telegram from Agent Morrison was brief: "HIGH PRIEST LOCATED. RITUAL TONIGHT. STOP HIM OR ALL IS LOST."

The Order of the Black Sun has been a shadow on the edges of your investigations for months. Their leader, the one they call the Dark Priest, has evaded capture at every turn. But tonight, he makes his move.

In the abandoned cathedral at the edge of town, they will attempt to complete the Rite of Y'golonac. If they succeed, something ancient and terrible will walk the earth once more.

You must infiltrate their gathering, locate the Dark Priest, and end his threat permanently. There will be no trial, no justice system that can handle what he has become. Only cold steel and righteous fury.

The ritual begins at midnight. You have until then.`,
    startDoom: 10,
    startLocation: 'Town Square',
    goal: 'Find and kill the Dark Priest.',
    specialRule: 'Enemies are stronger. Time is short.',
    difficulty: 'Hard',
    tileSet: 'mixed',
    victoryType: 'assassination',
    estimatedTime: '45-60 min',
    recommendedPlayers: '2-3',
    // Pressure-based doom (Hard scenario - still has some time pressure)
    doomTickPerRound: 0,
    doomOnMonsterSpawn: -1,
    doomOnEliteKill: 2,            // Extra doom for killing the boss
    doomOnObjectiveComplete: 1,
    steps: [
      { id: 'step1', description: 'Find the Dark Priest', type: 'find_item', targetId: 'location_intel', completed: false },
      { id: 'step2', description: 'Kill the Dark Priest', type: 'kill_enemy', targetId: 'priest', amount: 1, completed: false }
    ],
    objectives: [
      {
        id: 'obj_gather_intel',
        description: 'Search for clues about the Dark Priest\'s location. Question cultists or search their hideouts.',
        shortDescription: 'Gather Intelligence',
        type: 'collect',
        targetId: 'intel_clue',
        targetAmount: 2,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_find_priest',
        description: 'Locate the Dark Priest in the ritual chamber.',
        shortDescription: 'Find the Dark Priest',
        type: 'find_tile',
        targetId: 'ritual_chamber',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_gather_intel',
        completed: false
      },
      {
        id: 'obj_kill_priest',
        description: 'Kill the Dark Priest before he completes the summoning ritual.',
        shortDescription: 'Kill the Dark Priest',
        type: 'kill_boss',
        targetId: 'priest',
        targetAmount: 1,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_priest',
        completed: false
      },
      {
        id: 'obj_bonus_acolytes',
        description: 'Eliminate the priest\'s inner circle of acolytes to weaken his power.',
        shortDescription: 'Kill Acolytes (0/3)',
        type: 'kill_enemy',
        targetId: 'cultist',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_bonus_artifact',
        description: 'Recover the Black Sun Medallion before it can be used in the ritual.',
        shortDescription: 'Recover the Medallion',
        type: 'find_item',
        targetId: 'black_sun_medallion',
        isOptional: true,
        isHidden: true,
        completed: false,
        rewardItem: 'occult_tome'
      }
    ],
    victoryConditions: [
      {
        type: 'assassination',
        description: 'Kill the Dark Priest',
        checkFunction: 'checkAssassinationVictory',
        requiredObjectives: ['obj_kill_priest']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The ritual is completed' }
    ],
    doomEvents: [
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'Deep Ones rise from the sewers.' },
      { threshold: 4, triggered: false, type: 'buff_enemies', message: 'The ritual empowers all enemies! (+1 HP)' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', message: 'The Priest summons a guardian!' }
    ]
  },
  {
    id: 's3',
    title: 'The Siege of Arkham',
    description: 'They are coming. Wave after wave of horrors. You cannot run. You can only survive.',
    briefing: `The stars are right. You knew this night would come.

For weeks, the signs have been mounting. Missing persons. Strange lights over the harbor. The dreams that made you wake screaming. And now, as the clock strikes midnight, the barriers between worlds grow thin.

Sheriff Douglas has barricaded himself and the remaining townsfolk in the police station. "Hold the line," he says, loading his shotgun. "Help is coming." But you've seen the darkness gathering at the edge of town. You know what's coming.

Wave after wave of horrors from beyond the veil. Things that should not exist. Things that hunger.

There is no escape. The roads are blocked. The telegraph lines are down. You must hold this position until dawn - if dawn ever comes.

Ten rounds. Ten waves. Survive, and you might just live to see another sunrise.`,
    startDoom: 15,
    startLocation: 'Police Station',
    // Survival scenario - doom ticks every 2 rounds instead of every round
    doomTickEveryNRounds: 2,       // Doom only ticks every 2nd round
    doomOnMonsterSpawn: -1,
    doomOnEliteKill: 1,
    doomOnObjectiveComplete: 2,    // Big bonus for surviving milestones
    goal: 'Survive for 10 rounds.',
    specialRule: 'Doom decreases every round automatically. Enemies spawn in waves.',
    difficulty: 'Nightmare',
    tileSet: 'mixed',
    victoryType: 'survival',
    estimatedTime: '60-90 min',
    recommendedPlayers: '2-4',
    steps: [
      { id: 'step1', description: 'Survive until help arrives', type: 'survive', amount: 10, completed: false }
    ],
    objectives: [
      {
        id: 'obj_survive_5',
        description: 'Hold the line for the first 5 rounds as the initial waves attack.',
        shortDescription: 'Survive 5 Rounds',
        type: 'survive',
        targetAmount: 5,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_survive_10',
        description: 'Endure the full assault until help arrives at dawn.',
        shortDescription: 'Survive 10 Rounds',
        type: 'survive',
        targetAmount: 10,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_survive_5',
        completed: false
      },
      {
        id: 'obj_protect_civilians',
        description: 'Keep at least one investigator alive at all times.',
        shortDescription: 'Protect the Team',
        type: 'protect',
        isOptional: false,
        isHidden: false,
        completed: false,
        failedCondition: 'all_dead'
      },
      {
        id: 'obj_bonus_barricade',
        description: 'Fortify the police station by searching for supplies.',
        shortDescription: 'Find Supplies (0/3)',
        type: 'collect',
        targetId: 'barricade_supply',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'shotgun'
      },
      {
        id: 'obj_bonus_radio',
        description: 'Repair the radio to call for reinforcements earlier.',
        shortDescription: 'Repair the Radio',
        type: 'interact',
        targetId: 'broken_radio',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 2
      }
    ],
    victoryConditions: [
      {
        type: 'survival',
        description: 'Survive for 10 rounds',
        checkFunction: 'checkSurvivalVictory',
        requiredObjectives: ['obj_survive_10']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The darkness consumes Arkham' }
    ],
    doomEvents: [
      { threshold: 12, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 3, message: 'Wave 1: Cultists attack!' },
      { threshold: 10, triggered: false, type: 'narrative', message: 'The howling grows louder. Something approaches from the north.' },
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 3, message: 'Wave 2: Ghouls swarm the barricades!' },
      { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'Wave 3: Deep Ones emerge from the sewers!' },
      { threshold: 4, triggered: false, type: 'spawn_boss', targetId: 'dark_young', amount: 1, message: 'Wave 4: A Dark Young crashes through the wall!' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'FINAL WAVE: The Shoggoth has arrived!' }
    ]
  },
  // ============================================================================
  // SCENARIO 4: Forbidden Knowledge (Normal - Collection)
  // ============================================================================
  {
    id: 's4',
    title: 'Forbidden Knowledge',
    description: 'The Necronomicon has been scattered across Arkham. You must collect all 5 pages before the cultists reassemble the cursed tome.',
    briefing: `Professor Armitage burst into your office, his hands trembling.

"They've done it," he gasped. "They've torn apart the library's Necronomicon. The pages... they scattered them across the city to prevent us from destroying it."

But the cultists didn't account for one thing: each page calls to the others. You can feel them, can't you? That low hum at the edge of hearing, pulling you toward forbidden knowledge.

Five pages. Five fragments of madness. Collect them all before the Order of the Silver Twilight finds them first. But be warned—each page you read chips away at your sanity. Some knowledge is not meant for mortal minds.

The race for forbidden knowledge begins.`,
    startDoom: 12,
    startLocation: 'Miskatonic Library',
    goal: 'Collect all 5 Necronomicon pages.',
    specialRule: 'Each page collected causes -1 Sanity. Pages spawn at random explored locations.',
    difficulty: 'Normal',
    tileSet: 'mixed',
    victoryType: 'collection',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Find Necronomicon Page 1', type: 'find_item', targetId: 'necro_page', completed: false },
      { id: 'step2', description: 'Collect all 5 pages', type: 'find_item', targetId: 'necro_page', amount: 5, completed: false }
    ],
    objectives: [
      {
        id: 'obj_collect_pages',
        description: 'Search Arkham for the 5 scattered Necronomicon pages.',
        shortDescription: 'Collect Pages (0/5)',
        type: 'collect',
        targetId: 'necro_page',
        targetAmount: 5,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 3
      },
      {
        id: 'obj_bonus_tome',
        description: 'Find the original binding to safely contain the pages.',
        shortDescription: 'Find the Binding',
        type: 'find_item',
        targetId: 'tome_binding',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'elder_sign'
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Collect all 5 Necronomicon pages',
        checkFunction: 'checkCollectionVictory',
        requiredObjectives: ['obj_collect_pages']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The cultists have reassembled the Necronomicon' }
    ],
    doomEvents: [
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'Cultists search for the pages!' },
      { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'Ghouls guard a hidden page!' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'A Shoggoth awakens from the forbidden words!' }
    ]
  },
  // ============================================================================
  // SCENARIO 5: The Missing Professor (Normal - Rescue)
  // ============================================================================
  {
    id: 's5',
    title: 'The Missing Professor',
    description: 'Professor Warren has vanished in the catacombs beneath Arkham. Find him before the creatures that dwell below claim another victim.',
    briefing: `The note arrived three days after Professor Warren disappeared.

"Gone to prove my theory. The tunnels connect. They ALL connect. If I'm not back by Thursday, send help to the Old Cemetery. Look for the angel with broken wings."

That was a week ago.

The catacombs beneath Arkham are older than the city itself. They say bootleggers used them during Prohibition. They say other things use them now. The search parties found nothing—but they didn't go deep enough.

Professor Warren is down there. You're certain of it. Whether he's still alive... that's another question.

Find the Professor. Bring him home. And try not to disturb whatever else calls those tunnels home.`,
    startDoom: 12,
    startLocation: 'Old Cemetery',
    goal: 'Find Professor Warren and escort him to safety.',
    specialRule: 'Underground tiles only after entering catacombs. Professor has 3 HP and must survive.',
    difficulty: 'Normal',
    tileSet: 'indoor',
    victoryType: 'escape',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Find the catacomb entrance', type: 'find_tile', targetId: 'catacomb_entrance', completed: false },
      { id: 'step2', description: 'Locate Professor Warren', type: 'find_item', targetId: 'professor_warren', completed: false },
      { id: 'step3', description: 'Escort the Professor to safety', type: 'interact', targetId: 'exit', completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_entrance',
        description: 'Search the cemetery for the entrance to the catacombs.',
        shortDescription: 'Find Catacomb Entrance',
        type: 'find_tile',
        targetId: 'catacomb_entrance',
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_find_professor',
        description: 'Locate Professor Warren deep in the catacombs.',
        shortDescription: 'Find Professor Warren',
        type: 'find_tile',
        targetId: 'professor_warren',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_entrance',
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_escort',
        description: 'Lead the Professor safely back to the surface.',
        shortDescription: 'Escort to Safety',
        type: 'escape',
        targetId: 'exit',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_professor',
        completed: false
      },
      {
        id: 'obj_bonus_notes',
        description: 'Recover the Professor\'s research notes from the tunnels.',
        shortDescription: 'Find Research Notes',
        type: 'find_item',
        targetId: 'research_notes',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 2
      }
    ],
    victoryConditions: [
      {
        type: 'escape',
        description: 'Escort Professor Warren to safety',
        checkFunction: 'checkEscortVictory',
        requiredObjectives: ['obj_find_entrance', 'obj_find_professor', 'obj_escort']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The Professor has been consumed by the darkness' },
      { type: 'objective_failed', description: 'Professor Warren has been killed', objectiveId: 'obj_escort' }
    ],
    doomEvents: [
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'Ghouls emerge from the crypts!' },
      { threshold: 6, triggered: false, type: 'narrative', message: 'The Professor screams in the distance. Hurry!' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'ghoul', amount: 3, message: 'A ghoul pack blocks the exit!' }
    ]
  },
  // ============================================================================
  // SCENARIO 6: Seal the Gate (Hard - Seal Portal)
  // ============================================================================
  {
    id: 's6',
    title: 'Seal the Gate',
    description: 'A portal to another dimension has opened in the old warehouse district. Use 3 Elder Signs to seal it before the Great Old Ones notice.',
    briefing: `The rift opened at midnight. You felt it before you saw it—a tearing sensation in your mind, like reality itself was screaming.

The warehouse on Pier 7 is no longer a warehouse. It's a doorway. Through it, you glimpse impossible geometries and hear the piping of mad flutes. Something vast and hungry has noticed the opening.

You have three Elder Signs, recovered from the Miskatonic vault. Each must be placed at a specific point around the portal to seal it. But the rift is defended. Things have already come through—and they don't want the door closed.

Work fast. Each moment the portal remains open, something worse might slip through. And some of those things make Shoggoths look like house pets.

Seal the gate. Save reality. No pressure.`,
    startDoom: 10,
    startLocation: 'Harbor District',
    goal: 'Place 3 Elder Signs at ritual points to seal the portal.',
    specialRule: 'Elder Signs must be placed at 3 specific locations. Each placement triggers enemy spawn.',
    difficulty: 'Hard',
    tileSet: 'mixed',
    victoryType: 'collection',
    estimatedTime: '45-60 min',
    recommendedPlayers: '2-3',
    steps: [
      { id: 'step1', description: 'Find the ritual locations', type: 'find_tile', targetId: 'ritual_point', completed: false },
      { id: 'step2', description: 'Place all 3 Elder Signs', type: 'interact', targetId: 'elder_sign_placement', amount: 3, completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_signs',
        description: 'Recover 3 Elder Signs from various locations around Arkham.',
        shortDescription: 'Find Elder Signs (0/3)',
        type: 'collect',
        targetId: 'elder_sign',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_place_signs',
        description: 'Place Elder Signs at the three ritual points surrounding the portal.',
        shortDescription: 'Place Signs (0/3)',
        type: 'interact',
        targetId: 'ritual_point',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_signs',
        completed: false
      },
      {
        id: 'obj_bonus_close',
        description: 'Seal the portal before any Great Old One notices.',
        shortDescription: 'Seal Before Doom 3',
        type: 'survive',
        targetAmount: 1,
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 3
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Place all 3 Elder Signs to seal the portal',
        checkFunction: 'checkSealVictory',
        requiredObjectives: ['obj_find_signs', 'obj_place_signs']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'Something has come through the portal' }
    ],
    doomEvents: [
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 3, message: 'Deep Ones guard the ritual points!' },
      { threshold: 4, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'A Shoggoth emerges from the portal!' },
      { threshold: 2, triggered: false, type: 'buff_enemies', message: 'Reality warps! All enemies gain +1 damage!' }
    ]
  },
  // ============================================================================
  // SCENARIO 7: The Innsmouth Conspiracy (Normal - Investigation)
  // ============================================================================
  {
    id: 's7',
    title: 'The Innsmouth Conspiracy',
    description: 'Strange disappearances plague the coastal town. Uncover 4 clues about the cult before they complete their dark ritual.',
    briefing: `The telegram from Innsmouth was brief: "HELP. THEY WATCH. TRUST NO ONE."

The coastal town has always had a reputation. Inbred, they said. Isolated. Strange. But the recent disappearances have drawn federal attention. Twenty-three people, gone without a trace.

You've been sent to investigate, but the moment you stepped off the bus, you felt the eyes. The locals watch with a peculiar intensity. Their movements are too fluid, their features too... uniform.

There's a conspiracy here. The Esoteric Order of Dagon runs this town, and they're planning something. Find the clues, piece together their plot, and expose them before the next tide brings more than just fish.

But be careful. In Innsmouth, the walls have ears. And the ears have gills.`,
    startDoom: 12,
    startLocation: 'Innsmouth Square',
    goal: 'Find 4 clues about the cult\'s activities.',
    specialRule: 'Coastal tiles only. Deep Ones spawn more frequently near water.',
    difficulty: 'Normal',
    tileSet: 'outdoor',
    victoryType: 'collection',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Investigate the town', type: 'find_item', targetId: 'investigation_clue', completed: false },
      { id: 'step2', description: 'Find all 4 clues', type: 'find_item', targetId: 'investigation_clue', amount: 4, completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_clues',
        description: 'Investigate Innsmouth to uncover clues about the cult\'s conspiracy.',
        shortDescription: 'Find Clues (0/4)',
        type: 'collect',
        targetId: 'investigation_clue',
        targetAmount: 4,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_bonus_leader',
        description: 'Identify the leader of the Esoteric Order of Dagon.',
        shortDescription: 'Find the Leader',
        type: 'find_item',
        targetId: 'cult_leader_id',
        isOptional: true,
        isHidden: true,
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_bonus_survivors',
        description: 'Find any survivors from the disappearances.',
        shortDescription: 'Find Survivors',
        type: 'find_tile',
        targetId: 'survivor_location',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'medical_kit'
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Uncover 4 clues about the conspiracy',
        checkFunction: 'checkInvestigationVictory',
        requiredObjectives: ['obj_find_clues']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The cult has completed their ritual' }
    ],
    doomEvents: [
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'Cult members are following you!' },
      { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'Deep Ones rise from the harbor!' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'deepone', amount: 3, message: 'The tide brings more horrors!' }
    ]
  },
  // ============================================================================
  // SCENARIO 8: Cleanse the Crypt (Hard - Purge)
  // ============================================================================
  {
    id: 's8',
    title: 'Cleanse the Crypt',
    description: 'The ancient crypt has been overrun by ghouls. Kill every last one to restore the sanctity of the burial grounds.',
    briefing: `Father Michael's hands trembled as he showed you the photographs.

"The crypt beneath St. Mary's... it's been defiled. They've made it their nest."

The ghouls came three nights ago. They killed the gravedigger first, then the groundskeeper. When Father Michael went to investigate, he barely escaped with his life—and his sanity.

Now the creatures breed in the crypts below, feeding on centuries of Arkham's dead. Left unchecked, they'll spread through the tunnel network to every cemetery in the city.

There is only one solution: extermination. Every ghoul in that crypt must die. It won't be quick. It won't be clean. But it must be done.

May God have mercy on your souls. The ghouls certainly won't.`,
    startDoom: 10,
    startLocation: 'St. Mary\'s Church',
    goal: 'Kill all Ghouls in the crypt (at least 8).',
    specialRule: 'Crypt tiles only. Ghouls regenerate 1 HP per round if not engaged.',
    difficulty: 'Hard',
    tileSet: 'indoor',
    victoryType: 'assassination',
    estimatedTime: '45-60 min',
    recommendedPlayers: '2-3',
    steps: [
      { id: 'step1', description: 'Enter the crypt', type: 'find_tile', targetId: 'crypt_entrance', completed: false },
      { id: 'step2', description: 'Kill all Ghouls', type: 'kill_enemy', targetId: 'ghoul', amount: 8, completed: false }
    ],
    objectives: [
      {
        id: 'obj_enter_crypt',
        description: 'Find the entrance to the crypt beneath the church.',
        shortDescription: 'Enter the Crypt',
        type: 'find_tile',
        targetId: 'crypt_entrance',
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_kill_ghouls',
        description: 'Exterminate every ghoul infesting the crypt.',
        shortDescription: 'Kill Ghouls (0/8)',
        type: 'kill_enemy',
        targetId: 'ghoul',
        targetAmount: 8,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_bonus_nest',
        description: 'Destroy the ghoul breeding nest to prevent them from returning.',
        shortDescription: 'Destroy the Nest',
        type: 'interact',
        targetId: 'ghoul_nest',
        isOptional: true,
        isHidden: true,
        completed: false,
        rewardItem: 'relic_cross'
      }
    ],
    victoryConditions: [
      {
        type: 'assassination',
        description: 'Kill all Ghouls in the crypt',
        checkFunction: 'checkPurgeVictory',
        requiredObjectives: ['obj_kill_ghouls']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The ghouls have spread beyond the crypt' }
    ],
    doomEvents: [
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 3, message: 'More ghouls emerge from the darkness!' },
      { threshold: 5, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 3, message: 'The pack grows larger!' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'ghoul', amount: 2, message: 'Alpha ghouls defend their nest!' }
    ]
  },
  // ============================================================================
  // SCENARIO 9: The Ritual of Binding (Nightmare - Ritual)
  // ============================================================================
  {
    id: 's9',
    title: 'The Ritual of Binding',
    description: 'A Great Old One stirs. You must complete binding rituals at 3 locations before it fully awakens.',
    briefing: `The stars are almost right.

Deep beneath the earth, something vast and ancient shifts in its sleep. Cthulhu. Yog-Sothoth. Names whispered in forbidden texts, entities so powerful that their mere dreams drive men mad.

But there is hope. The Ritual of Binding, passed down through generations of occultists, can reinforce the barriers that keep these beings dormant. Three ritual sites across Arkham must be activated in precise sequence.

You have the knowledge. You have the components. What you don't have is time.

Each moment you delay, the sleeper stirs closer to waking. And if it wakes... if it truly wakes... Arkham will be the first to fall. But not the last.

Begin the ritual. Bind the dreamer. Save the world.`,
    startDoom: 15,
    startLocation: 'Witch House',
    goal: 'Complete binding rituals at 3 sacred locations.',
    specialRule: 'Rituals require 2 rounds to complete. Interrupted rituals must restart. -2 Sanity per ritual.',
    difficulty: 'Nightmare',
    tileSet: 'mixed',
    victoryType: 'collection',
    estimatedTime: '60-90 min',
    recommendedPlayers: '2-4',
    steps: [
      { id: 'step1', description: 'Find the ritual sites', type: 'find_tile', targetId: 'ritual_site', completed: false },
      { id: 'step2', description: 'Complete all 3 rituals', type: 'interact', targetId: 'ritual_binding', amount: 3, completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_sites',
        description: 'Locate the three sacred sites where the binding must be performed.',
        shortDescription: 'Find Ritual Sites (0/3)',
        type: 'find_tile',
        targetId: 'ritual_site',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_complete_rituals',
        description: 'Perform the binding ritual at each sacred site.',
        shortDescription: 'Complete Rituals (0/3)',
        type: 'interact',
        targetId: 'ritual_binding',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_sites',
        completed: false
      },
      {
        id: 'obj_bonus_artifact',
        description: 'Recover the Seal of Binding to strengthen the ritual.',
        shortDescription: 'Find the Seal',
        type: 'find_item',
        targetId: 'seal_of_binding',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 3
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Complete all 3 binding rituals',
        checkFunction: 'checkRitualVictory',
        requiredObjectives: ['obj_find_sites', 'obj_complete_rituals']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The Great Old One has awakened' }
    ],
    doomEvents: [
      { threshold: 12, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 3, message: 'Cultists try to stop the ritual!' },
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'The sleeper\'s dreams manifest!' },
      { threshold: 6, triggered: false, type: 'sanity_hit', amount: 1, message: 'The dreams grow stronger. All investigators -1 Sanity.' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 2, message: 'Nightmare guardians materialize!' }
    ]
  },
  // ============================================================================
  // SCENARIO 10: Mansion of Madness (Hard - Multi-Objective)
  // ============================================================================
  {
    id: 's10',
    title: 'Mansion of Madness',
    description: 'The old Henderson estate holds many secrets. Find the key, kill the guardian, and escape with your sanity intact.',
    briefing: `The Henderson Mansion has stood empty for thirty years. Empty of the living, at least.

Old Marcus Henderson was a collector of the occult. When he died—or disappeared, depending on who you ask—his collection remained. Now someone has awakened the guardian he left to protect it.

The mansion is a maze of locked doors and hidden passages. Somewhere inside is the Master Key that opens all doors. Somewhere inside is the guardian—a thing that was once human. And somewhere inside is the exit you'll need to escape.

Three objectives. One mansion. Countless horrors.

You'll need to find the key to progress. You'll need to kill the guardian to survive. And you'll need to find the exit before the house itself claims you.

Good luck. You'll need it.`,
    startDoom: 10,
    startLocation: 'Henderson Estate',
    goal: 'Find the key, kill the guardian, and escape the mansion.',
    specialRule: 'Three objectives must be completed in any order. Guardian spawns after key is found.',
    difficulty: 'Hard',
    tileSet: 'indoor',
    victoryType: 'escape',
    estimatedTime: '45-60 min',
    recommendedPlayers: '2-3',
    steps: [
      { id: 'step1', description: 'Find the Master Key', type: 'find_item', targetId: 'master_key', completed: false },
      { id: 'step2', description: 'Kill the Guardian', type: 'kill_enemy', targetId: 'guardian', amount: 1, completed: false },
      { id: 'step3', description: 'Find and use the Exit', type: 'interact', targetId: 'mansion_exit', completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_key',
        description: 'Search the mansion for the Master Key that unlocks all doors.',
        shortDescription: 'Find Master Key',
        type: 'find_item',
        targetId: 'master_key',
        isOptional: false,
        isHidden: false,
        completed: false,
        rewardInsight: 1
      },
      {
        id: 'obj_kill_guardian',
        description: 'Defeat the guardian that protects the mansion\'s secrets.',
        shortDescription: 'Kill the Guardian',
        type: 'kill_boss',
        targetId: 'guardian',
        targetAmount: 1,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_key',
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_escape',
        description: 'Find the exit and escape the mansion.',
        shortDescription: 'Escape the Mansion',
        type: 'escape',
        targetId: 'mansion_exit',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_kill_guardian',
        completed: false
      },
      {
        id: 'obj_bonus_collection',
        description: 'Recover Henderson\'s occult collection.',
        shortDescription: 'Find Occult Items (0/3)',
        type: 'collect',
        targetId: 'occult_item',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'occult_tome'
      }
    ],
    victoryConditions: [
      {
        type: 'escape',
        description: 'Complete all objectives and escape',
        checkFunction: 'checkMultiObjectiveVictory',
        requiredObjectives: ['obj_find_key', 'obj_kill_guardian', 'obj_escape']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The mansion has claimed you' }
    ],
    doomEvents: [
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'The mansion\'s servants awaken!' },
      { threshold: 4, triggered: false, type: 'spawn_boss', targetId: 'guardian', amount: 1, message: 'The Guardian emerges!' },
      { threshold: 2, triggered: false, type: 'narrative', message: 'The walls close in. Find the exit!' }
    ]
  },
  // ============================================================================
  // SCENARIO 11: The Deep One Raid (Normal - Survival)
  // ============================================================================
  {
    id: 's11',
    title: 'The Deep One Raid',
    description: 'Deep Ones are attacking the harbor! Survive 5 rounds while protecting the fishing village.',
    briefing: `The fog rolled in at sunset. By midnight, they came with it.

The fishing village of Kingsport has always had an uneasy relationship with the sea. The fishermen know not to cast their nets in certain waters. They know not to be out after dark during the new moon. They know the old pacts.

But someone broke a pact. And now the Deep Ones want blood.

They rise from the waves in endless numbers, their fish-eyes gleaming with ancient hatred. The village militia is outmatched. The coast guard won't arrive until dawn. You're all that stands between the creatures and the villagers.

Five rounds. Five waves. Hold the line until help arrives.

The sea giveth, and the sea taketh away. Tonight, the sea wants to take everything.`,
    startDoom: 10,
    startLocation: 'Kingsport Harbor',
    goal: 'Survive 5 rounds of Deep One attacks.',
    specialRule: 'Deep Ones spawn every round. Bonus objective: protect all villagers.',
    difficulty: 'Normal',
    tileSet: 'outdoor',
    victoryType: 'survival',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Survive the Deep One raid', type: 'survive', amount: 5, completed: false }
    ],
    objectives: [
      {
        id: 'obj_survive_3',
        description: 'Hold the harbor for the first 3 rounds.',
        shortDescription: 'Survive 3 Rounds',
        type: 'survive',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_survive_5',
        description: 'Survive until dawn arrives.',
        shortDescription: 'Survive 5 Rounds',
        type: 'survive',
        targetAmount: 5,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_survive_3',
        completed: false
      },
      {
        id: 'obj_bonus_villagers',
        description: 'Ensure no villager NPCs are killed during the attack.',
        shortDescription: 'Protect Villagers',
        type: 'protect',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 2,
        failedCondition: 'villager_death'
      }
    ],
    victoryConditions: [
      {
        type: 'survival',
        description: 'Survive 5 rounds',
        checkFunction: 'checkSurvivalVictory',
        requiredObjectives: ['obj_survive_5']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The village has been overrun' }
    ],
    doomEvents: [
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'Wave 1: Deep Ones emerge from the waves!' },
      { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 3, message: 'Wave 2: More Deep Ones attack!' },
      { threshold: 4, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 3, message: 'Wave 3: The assault intensifies!' },
      { threshold: 2, triggered: false, type: 'narrative', message: 'Dawn approaches! Hold the line!' }
    ]
  },
  // ============================================================================
  // SCENARIO 12: The Lost Artifact (Normal - Collection)
  // ============================================================================
  {
    id: 's12',
    title: 'The Lost Artifact',
    description: 'An ancient relic of power has been hidden in the ruins. Find it before the cult does.',
    briefing: `The Silver Key. A relic spoken of in whispered legends, said to open doors to places that shouldn't exist.

Professor Wilmarth believed it was myth. Then he found the map—hidden in a tome so old the pages crumbled at his touch. The Key is real. And it's hidden somewhere in the ruins of Old Arkham.

But you're not the only ones looking. The Silver Twilight Lodge has been searching for the Key for decades. They'll use it to open doorways that should remain forever closed.

The ruins are dangerous. Collapsed tunnels, unstable floors, and things that never see sunlight. But somewhere in that darkness, the Silver Key waits.

Find it first. The fate of multiple dimensions depends on it.`,
    startDoom: 12,
    startLocation: 'Old Arkham Ruins',
    goal: 'Find the ancient Silver Key artifact.',
    specialRule: 'Ruins have many hidden passages. Investigate bonus: +1 die.',
    difficulty: 'Normal',
    tileSet: 'mixed',
    victoryType: 'collection',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Search the ruins for clues', type: 'find_item', targetId: 'artifact_clue', completed: false },
      { id: 'step2', description: 'Find the Silver Key', type: 'find_item', targetId: 'silver_key', completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_clues',
        description: 'Search the ruins for clues about the Silver Key\'s location.',
        shortDescription: 'Find Clues (0/2)',
        type: 'collect',
        targetId: 'artifact_clue',
        targetAmount: 2,
        currentAmount: 0,
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_find_artifact',
        description: 'Locate and recover the Silver Key.',
        shortDescription: 'Find the Silver Key',
        type: 'find_item',
        targetId: 'silver_key',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_clues',
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_bonus_tome',
        description: 'Find the ancient tome that explains the Key\'s power.',
        shortDescription: 'Find the Tome',
        type: 'find_item',
        targetId: 'key_tome',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'occult_tome'
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Find the Silver Key',
        checkFunction: 'checkArtifactVictory',
        requiredObjectives: ['obj_find_clues', 'obj_find_artifact']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The cult has found the artifact first' }
    ],
    doomEvents: [
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'Cult searchers enter the ruins!' },
      { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'Ghouls inhabit these tunnels!' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'cultist', amount: 3, message: 'The cult\'s elite arrive!' }
    ]
  },
  // ============================================================================
  // SCENARIO 13: Arkham Asylum Breakout (Hard - Rescue)
  // ============================================================================
  {
    id: 's13',
    title: 'Arkham Asylum Breakout',
    description: 'Two witnesses are trapped in Arkham Asylum. Break them out before the cult silences them forever.',
    briefing: `Dr. Hardstrom's voice was barely a whisper on the phone.

"They've committed them. Both of them. Said they were raving about fish-men and underwater cities. But I saw the orderlies—I saw their eyes. They're not here to treat them. They're here to silence them."

Sarah Mitchell and Thomas Reid. The only surviving witnesses to the Innsmouth incident. The cult has infiltrated Arkham Asylum to eliminate them, but they need to make it look like natural causes. That gives you time.

The asylum is a fortress. Locked wards, security checkpoints, and staff who may or may not be human. But somewhere inside, two innocent people are counting on you.

Get in. Find them. Get out. And try not to become a patient yourself.`,
    startDoom: 10,
    startLocation: 'Asylum Gates',
    goal: 'Rescue both patients from Arkham Asylum.',
    specialRule: 'Stealth bonus: avoid combat to keep alarm low. Alarm at max = instant Nightmare spawn.',
    difficulty: 'Hard',
    tileSet: 'indoor',
    victoryType: 'escape',
    estimatedTime: '45-60 min',
    recommendedPlayers: '2-3',
    steps: [
      { id: 'step1', description: 'Infiltrate the asylum', type: 'find_tile', targetId: 'asylum_interior', completed: false },
      { id: 'step2', description: 'Find Patient 1 (Sarah)', type: 'find_item', targetId: 'patient_sarah', completed: false },
      { id: 'step3', description: 'Find Patient 2 (Thomas)', type: 'find_item', targetId: 'patient_thomas', completed: false },
      { id: 'step4', description: 'Escape with both patients', type: 'interact', targetId: 'asylum_exit', completed: false }
    ],
    objectives: [
      {
        id: 'obj_infiltrate',
        description: 'Find a way into the asylum without raising the alarm.',
        shortDescription: 'Infiltrate Asylum',
        type: 'find_tile',
        targetId: 'asylum_interior',
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_find_sarah',
        description: 'Locate Sarah Mitchell in the asylum wards.',
        shortDescription: 'Find Sarah',
        type: 'find_tile',
        targetId: 'patient_sarah',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_infiltrate',
        completed: false
      },
      {
        id: 'obj_find_thomas',
        description: 'Locate Thomas Reid in the asylum wards.',
        shortDescription: 'Find Thomas',
        type: 'find_tile',
        targetId: 'patient_thomas',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_infiltrate',
        completed: false
      },
      {
        id: 'obj_escape',
        description: 'Escort both patients safely out of the asylum.',
        shortDescription: 'Escape with Patients',
        type: 'escape',
        targetId: 'asylum_exit',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_sarah',
        completed: false
      },
      {
        id: 'obj_bonus_records',
        description: 'Steal the cult\'s patient records as evidence.',
        shortDescription: 'Steal Records',
        type: 'find_item',
        targetId: 'cult_records',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardInsight: 3
      }
    ],
    victoryConditions: [
      {
        type: 'escape',
        description: 'Rescue both patients and escape',
        checkFunction: 'checkRescueVictory',
        requiredObjectives: ['obj_find_sarah', 'obj_find_thomas', 'obj_escape']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The patients have been eliminated' },
      { type: 'objective_failed', description: 'A patient has been killed', objectiveId: 'obj_escape' }
    ],
    doomEvents: [
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'Cult orderlies patrol the halls!' },
      { threshold: 4, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'They\'ve revealed their true forms!' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'Something is loose in the basement!' }
    ]
  },
  // ============================================================================
  // SCENARIO 14: The Witch's Curse (Normal - Ritual)
  // ============================================================================
  {
    id: 's14',
    title: "The Witch's Curse",
    description: 'A centuries-old curse plagues the cemetery. Break the curse by performing the counter-ritual.',
    briefing: `Keziah Mason was hanged for witchcraft in 1692. She cursed the town with her dying breath.

For three centuries, the curse has festered. Children who wander too close to her unmarked grave fall ill. Shadows move between the headstones on moonless nights. And every generation, someone goes missing from the cemetery—never to be found.

But Professor Rice has discovered Keziah's grimoire. In it, a counter-ritual that can break the curse forever. It must be performed at her grave, under the light of the full moon.

That's tonight.

The cemetery will fight you. The curse will try to stop you. But if you can complete the ritual, you can end three hundred years of suffering.

Break the curse. Free the dead. Save the living.`,
    startDoom: 12,
    startLocation: 'Arkham Cemetery',
    goal: 'Complete the counter-ritual at the witch\'s grave.',
    specialRule: 'Cemetery tiles only. Ghosts cannot be killed, only banished temporarily.',
    difficulty: 'Normal',
    tileSet: 'outdoor',
    victoryType: 'collection',
    estimatedTime: '30-45 min',
    recommendedPlayers: '1-2',
    steps: [
      { id: 'step1', description: 'Find the witch\'s grave', type: 'find_tile', targetId: 'witch_grave', completed: false },
      { id: 'step2', description: 'Gather ritual components', type: 'find_item', targetId: 'ritual_component', amount: 3, completed: false },
      { id: 'step3', description: 'Complete the counter-ritual', type: 'interact', targetId: 'counter_ritual', completed: false }
    ],
    objectives: [
      {
        id: 'obj_find_grave',
        description: 'Locate Keziah Mason\'s unmarked grave in the old section.',
        shortDescription: 'Find the Grave',
        type: 'find_tile',
        targetId: 'witch_grave',
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_gather_components',
        description: 'Collect the 3 ritual components needed for the counter-curse.',
        shortDescription: 'Gather Components (0/3)',
        type: 'collect',
        targetId: 'ritual_component',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_find_grave',
        completed: false
      },
      {
        id: 'obj_complete_ritual',
        description: 'Perform the counter-ritual at the witch\'s grave.',
        shortDescription: 'Complete Ritual',
        type: 'interact',
        targetId: 'counter_ritual',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_gather_components',
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_bonus_grimoire',
        description: 'Recover Keziah\'s grimoire for further study.',
        shortDescription: 'Find Grimoire',
        type: 'find_item',
        targetId: 'keziah_grimoire',
        isOptional: true,
        isHidden: false,
        completed: false,
        rewardItem: 'occult_tome'
      }
    ],
    victoryConditions: [
      {
        type: 'collection',
        description: 'Complete the counter-ritual',
        checkFunction: 'checkRitualVictory',
        requiredObjectives: ['obj_find_grave', 'obj_gather_components', 'obj_complete_ritual']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'The curse has grown too strong' }
    ],
    doomEvents: [
      { threshold: 9, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'The dead rise from their graves!' },
      { threshold: 6, triggered: false, type: 'narrative', message: 'Keziah\'s spirit wails in rage. The curse strengthens.' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'cultist', amount: 3, message: 'Keziah\'s coven manifests!' }
    ]
  },
  // ============================================================================
  // SCENARIO 15: The Final Gate (Nightmare - Seal Portal / Boss)
  // ============================================================================
  {
    id: 's15',
    title: 'The Final Gate',
    description: 'Yog-Sothoth\'s portal is opening. This is humanity\'s last stand. Close the gate or face extinction.',
    briefing: `This is it. The moment the prophecies warned of. The stars are right.

The portal to Yog-Sothoth's realm has begun to open on Sentinel Hill. Through the growing rift, you can see... nothing. Not darkness—absence. The complete void where Yog-Sothoth waits, patient and eternal.

The Order of the Silver Twilight has sacrificed hundreds to reach this moment. Their high priests channel power into the gate, widening it with each passing minute. Soon, Yog-Sothoth itself will pass through.

Everything you've fought for comes down to this. Every horror you've survived, every friend you've lost, every nightmare that haunts your sleep—it all led here.

Close the gate. Kill the priests. Save humanity.

There is no Plan B. There is no retreat. Victory or extinction.

May whatever gods remain have mercy on us all.`,
    startDoom: 15,
    startLocation: 'Sentinel Hill',
    goal: 'Kill the High Priests and seal Yog-Sothoth\'s portal.',
    specialRule: 'Boss scenario. Three High Priests must die. Gate strengthens all enemies. Time pressure: Doom decreases by 2 per round.',
    difficulty: 'Nightmare',
    tileSet: 'outdoor',
    victoryType: 'assassination',
    estimatedTime: '60-90 min',
    recommendedPlayers: '3-4',
    steps: [
      { id: 'step1', description: 'Reach the summit', type: 'find_tile', targetId: 'sentinel_summit', completed: false },
      { id: 'step2', description: 'Kill the three High Priests', type: 'kill_enemy', targetId: 'high_priest', amount: 3, completed: false },
      { id: 'step3', description: 'Seal the portal', type: 'interact', targetId: 'yog_portal', completed: false }
    ],
    objectives: [
      {
        id: 'obj_reach_summit',
        description: 'Fight your way to the summit of Sentinel Hill.',
        shortDescription: 'Reach the Summit',
        type: 'find_tile',
        targetId: 'sentinel_summit',
        isOptional: false,
        isHidden: false,
        completed: false
      },
      {
        id: 'obj_kill_priests',
        description: 'Slay the three High Priests maintaining the portal.',
        shortDescription: 'Kill High Priests (0/3)',
        type: 'kill_boss',
        targetId: 'high_priest',
        targetAmount: 3,
        currentAmount: 0,
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_reach_summit',
        completed: false,
        rewardInsight: 2
      },
      {
        id: 'obj_seal_portal',
        description: 'Use the Elder Signs to seal Yog-Sothoth\'s portal.',
        shortDescription: 'Seal the Portal',
        type: 'interact',
        targetId: 'yog_portal',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_kill_priests',
        completed: false
      },
      {
        id: 'obj_bonus_artifact',
        description: 'Recover the Shining Trapezohedron before the portal closes.',
        shortDescription: 'Get Trapezohedron',
        type: 'find_item',
        targetId: 'shining_trapezohedron',
        isOptional: true,
        isHidden: true,
        completed: false,
        rewardInsight: 5
      }
    ],
    victoryConditions: [
      {
        type: 'assassination',
        description: 'Kill the High Priests and seal the portal',
        checkFunction: 'checkFinalVictory',
        requiredObjectives: ['obj_reach_summit', 'obj_kill_priests', 'obj_seal_portal']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have been killed' },
      { type: 'doom_zero', description: 'Yog-Sothoth has entered our reality' }
    ],
    doomEvents: [
      { threshold: 12, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 4, message: 'The cult defends the hill!' },
      { threshold: 9, triggered: false, type: 'spawn_boss', targetId: 'high_priest', amount: 1, message: 'The First Priest channels the portal!' },
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 3, message: 'Deep Ones answer the call!' },
      { threshold: 5, triggered: false, type: 'spawn_boss', targetId: 'high_priest', amount: 1, message: 'The Second Priest strengthens the gate!' },
      { threshold: 3, triggered: false, type: 'spawn_boss', targetId: 'high_priest', amount: 1, message: 'The Third Priest completes the ritual!' },
      { threshold: 1, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 2, message: 'Things from beyond pour through!' }
    ]
  }
];

const DEFAULT_EDGES: [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] = [
  { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }
];

export const START_TILE: Tile = {
  id: 'start', q: 0, r: 0, name: 'Train Station', type: 'street', 
  category: 'urban', zoneLevel: 0, floorType: 'cobblestone', visibility: 'visible',
  edges: DEFAULT_EDGES, explored: true, searchable: true, searched: false,
  watermarkIcon: 'Train'
};

// ============================================================================
// BESTIARY - Hero Quest Style Dice System
// ============================================================================
// attackDice: Number of dice the monster rolls when attacking
// defenseDice: Number of dice the monster rolls when defending (blocking hits)
// Each die that shows skull (4+) is a hit/block
// ============================================================================
export const BESTIARY: Record<EnemyType, BestiaryEntry> = {
  // --- MINIONS (1 attack die, 1 defense die) ---
  cultist: {
    name: 'Cultist', type: 'cultist', hp: 2, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 1,
    description: 'A brainwashed servant of the Outer Gods.',
    lore: 'Recruited from the desperate and the mad.',
    defeatFlavor: 'The cultist collapses, a dark amulet shattering.',
    traits: []
  },
  'mi-go': {
    name: 'Mi-Go', type: 'mi-go', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 1,
    description: 'A fungoid crustacean from Yuggoth.',
    lore: 'Fungi from Yuggoth who fly through space.',
    traits: ['flying'],
    defeatFlavor: 'The body disintegrates.'
  },
  nightgaunt: {
    name: 'Nightgaunt', type: 'nightgaunt', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 1,
    description: 'A faceless, horned flyer.',
    lore: 'Faceless servants of Nodens.',
    traits: ['flying'],
    defeatFlavor: 'It vanishes into the night sky.'
  },
  moon_beast: {
    name: 'Moon-Beast', type: 'moon_beast', hp: 4, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 2,
    description: 'Sadistic torturers from the moon.',
    lore: 'Sadistic beings from the Dreamlands.',
    traits: ['ranged'],
    defeatFlavor: 'The abomination falls silent.'
  },

  // --- WARRIORS (2 attack dice, 2 defense dice) ---
  ghoul: {
    name: 'Ghoul', type: 'ghoul', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'A flesh-eating subterranean dweller.',
    lore: 'Subterranean dwellers that feast on the dead.',
    defeatFlavor: 'It collapses into grave dirt.',
    traits: ['scavenger']
  },
  deepone: {
    name: 'Deep One', type: 'deepone', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'An immortal amphibious humanoid.',
    lore: 'Immortal servants of Father Dagon.',
    defeatFlavor: 'The creature dissolves into brine.',
    traits: ['aquatic']
  },
  sniper: {
    name: 'Cultist Sniper', type: 'sniper', hp: 2, damage: 2,
    attackDice: 2, defenseDice: 1, horror: 1,
    description: 'A cultist armed with a long-range rifle.',
    lore: 'Chosen for their steady hands and lack of remorse.',
    traits: ['ranged'],
    defeatFlavor: 'The sniper falls from their perch.'
  },
  byakhee: {
    name: 'Byakhee', type: 'byakhee', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 1,
    description: 'An interstellar steed.',
    lore: 'Interstellar steeds serving Hastur.',
    traits: ['flying', 'fast'],
    defeatFlavor: 'It dissolves into cosmic dust.'
  },
  formless_spawn: {
    name: 'Formless Spawn', type: 'formless_spawn', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 2,
    description: 'Black ooze of Tsathoggua.',
    lore: 'Living puddles of black ichor.',
    traits: ['regenerate'],
    defeatFlavor: 'The ooze evaporates into foul steam.'
  },
  hound: {
    name: 'Hound of Tindalos', type: 'hound', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 3,
    description: 'A predator from the angles of time.',
    lore: 'Predators that inhabit the angles of time.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The beast recedes into the angles.'
  },

  // --- ELITES (2-3 attack dice, 2-3 defense dice) ---
  priest: {
    name: 'Dark Priest', type: 'priest', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A high-ranking member of the cult, channeling dark energies.',
    lore: 'They have traded their humanity for forbidden power.',
    traits: ['elite'],
    defeatFlavor: 'The priest screams as the darkness consumes them.'
  },
  hunting_horror: {
    name: 'Hunting Horror', type: 'hunting_horror', hp: 4, damage: 3,
    attackDice: 3, defenseDice: 2, horror: 3,
    description: 'A viper of the void.',
    lore: 'A serpentine entity that serves Nyarlathotep.',
    traits: ['fast', 'flying'],
    defeatFlavor: 'It coils in and vanishes.'
  },
  dark_young: {
    name: 'Dark Young', type: 'dark_young', hp: 6, damage: 2,
    attackDice: 3, defenseDice: 3, horror: 3,
    description: 'Offspring of Shub-Niggurath.',
    lore: 'The Black Goat of the Woods.',
    traits: ['massive'],
    defeatFlavor: 'The monstrosity withers.'
  },

  // --- BOSSES (3-4 attack dice, 3-4 defense dice) ---
  shoggoth: {
    name: 'Shoggoth', type: 'shoggoth', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 4,
    description: 'A protoplasmic mass of eyes and mouths.',
    lore: 'A nightmarish slave race created by the Elder Things.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The massive form loses cohesion.'
  },
  star_spawn: {
    name: 'Star Spawn', type: 'star_spawn', hp: 8, damage: 3,
    attackDice: 4, defenseDice: 4, horror: 5,
    description: 'A colossal kin of Cthulhu.',
    lore: 'Smaller versions of the Great Dreamer.',
    traits: ['massive'],
    defeatFlavor: 'The entity liquefies into green ooze.'
  },
  boss: {
    name: 'Ancient One', type: 'boss', hp: 10, damage: 4,
    attackDice: 4, defenseDice: 5, horror: 6,
    description: 'An avatar of cosmic destruction.',
    lore: 'An intrusion from outside the ordered universe.',
    traits: ['massive'],
    defeatFlavor: 'The avatar is pulled back into the void.'
  },

  // ============================================================================
  // NEW MONSTERS FROM CTHULHU MYTHOS (2026-01-22)
  // ============================================================================

  // --- NEW MINIONS ---
  ghast: {
    name: 'Ghast', type: 'ghast', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 2,
    description: 'A blind, hooved humanoid from the underworld.',
    lore: 'Ghasts dwell in the vaults of Zin where sunlight never reaches. They hunt by sound and smell.',
    traits: ['scavenger', 'light_sensitive'],
    defeatFlavor: 'The ghast collapses, its eyeless face frozen in a snarl.'
  },
  zoog: {
    name: 'Zoog', type: 'zoog', hp: 1, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 1,
    description: 'A small, brown rodent-like creature with tentacles.',
    lore: 'Intelligent and cunning, zoogs inhabit the Enchanted Wood. They speak in high-pitched voices.',
    traits: ['swarm', 'fast'],
    defeatFlavor: 'The zoog squeals and vanishes into the shadows.'
  },
  rat_thing: {
    name: 'Rat-Thing', type: 'rat_thing', hp: 2, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 2,
    description: 'A hybrid of rat and something disturbingly human.',
    lore: 'Brown Jenkin and its kin - witch familiars with human-like faces and tiny hands.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The abomination twitches and goes still, its human-like eyes glazing over.'
  },
  fire_vampire: {
    name: 'Fire Vampire', type: 'fire_vampire', hp: 3, damage: 2,
    attackDice: 1, defenseDice: 2, horror: 2,
    description: 'A living flame from beyond the stars.',
    lore: 'Servants of Cthugha, these beings of living fire descend from the cosmos to consume.',
    traits: ['flying', 'fire'],
    defeatFlavor: 'The flame sputters and extinguishes with an unearthly shriek.'
  },

  // --- NEW WARRIORS ---
  dimensional_shambler: {
    name: 'Dimensional Shambler', type: 'dimensional_shambler', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 3,
    description: 'A gaunt, ape-like being that walks between dimensions.',
    lore: 'These creatures can step through the fabric of reality, appearing and disappearing at will.',
    traits: ['teleport', 'ambusher'],
    defeatFlavor: 'The shambler folds in on itself and vanishes into another dimension.'
  },
  serpent_man: {
    name: 'Serpent Man', type: 'serpent_man', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'An ancient reptilian humanoid with hypnotic powers.',
    lore: 'Remnants of a pre-human civilization, serpent men can disguise themselves as humans.',
    traits: ['elite', 'ranged'],
    defeatFlavor: 'The serpent man hisses and collapses, its disguise failing.'
  },
  gug: {
    name: 'Gug', type: 'gug', hp: 6, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A towering giant with a vertical mouth and four arms.',
    lore: 'Banished to the underworld by the Great Ones, gugs hunt in the lightless depths.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The gug crashes to the ground, its vertical maw gaping in death.'
  },
  cthonian: {
    name: 'Cthonian', type: 'cthonian', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A massive burrowing worm with tentacles.',
    lore: 'These subterranean horrors communicate telepathically and can cause earthquakes.',
    traits: ['burrow', 'massive'],
    defeatFlavor: 'The worm-thing convulses and sinks back into the earth.'
  },
  tcho_tcho: {
    name: 'Tcho-Tcho', type: 'tcho_tcho', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 1, horror: 1,
    description: 'A degenerate human who worships the Great Old Ones.',
    lore: 'The Tcho-Tcho people practice dark rituals and cannibalism in service to alien gods.',
    traits: ['ranged'],
    defeatFlavor: 'The Tcho-Tcho falls, clutching a profane idol.'
  },

  // --- NEW ELITES ---
  flying_polyp: {
    name: 'Flying Polyp', type: 'flying_polyp', hp: 7, damage: 3,
    attackDice: 3, defenseDice: 3, horror: 4,
    description: 'A partially invisible entity that controls the wind.',
    lore: 'Ancient enemies of the Great Race, polyps dwell in cyclopean ruins beneath the earth.',
    traits: ['flying', 'invisible', 'massive'],
    defeatFlavor: 'The polyp shrieks with an alien wind and dissipates.'
  },
  lloigor: {
    name: 'Lloigor', type: 'lloigor', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 2, horror: 4,
    description: 'A being of pure malevolent energy.',
    lore: 'The Many-Angled Ones can manifest as invisible vortexes or serpentine forms.',
    traits: ['invisible', 'telekinesis'],
    defeatFlavor: 'The lloigor howls and retreats to its angular dimension.'
  },
  gnoph_keh: {
    name: 'Gnoph-Keh', type: 'gnoph_keh', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 3, horror: 3,
    description: 'A six-limbed arctic horror with sharp horns.',
    lore: 'These territorial beasts can summon blizzards and serve Ithaqua, the Wind-Walker.',
    traits: ['fast', 'cold'],
    defeatFlavor: 'The gnoph-keh lets out a final howl and the temperature rises.'
  },

  // --- NEW BOSSES ---
  colour_out_of_space: {
    name: 'Colour Out of Space', type: 'colour_out_of_space', hp: 8, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 5,
    description: 'An alien entity of incomprehensible color that drains life.',
    lore: 'This parasitic being arrived on a meteorite and slowly consumes all life around it.',
    traits: ['drain', 'invisible', 'massive'],
    defeatFlavor: 'The colour shrieks silently and shoots back toward the stars.'
  },
  elder_thing: {
    name: 'Elder Thing', type: 'elder_thing', hp: 7, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 4,
    description: 'A barrel-shaped being with starfish-like appendages.',
    lore: 'The Old Ones created the shoggoths and built cities across primordial Earth.',
    traits: ['aquatic', 'elite'],
    defeatFlavor: 'The elder thing falls, its alien mind finally silenced.'
  }
};

// ============================================================================
// ITEMS (Updated with Hero Quest style combat values)
// ============================================================================
// Weapons now use attackDice (total dice, not bonus)
// Armor now uses defenseDice (total dice from armor)

export const ITEMS: Item[] = [
  // ===== MELEE WEAPONS =====
  {
    id: 'knife', name: 'Knife', type: 'weapon',
    effect: '2 Attack Dice, Silent',
    attackDice: 2, weaponType: 'melee', ammo: -1,
    goldCost: 50, silent: true, slotType: 'hand'
  },
  {
    id: 'club', name: 'Club', type: 'weapon',
    effect: '2 Attack Dice',
    attackDice: 2, weaponType: 'melee', ammo: -1,
    goldCost: 30, slotType: 'hand'
  },
  {
    id: 'machete', name: 'Machete', type: 'weapon',
    effect: '3 Attack Dice, Heavy',
    attackDice: 3, weaponType: 'melee', ammo: -1,
    goldCost: 150, slotType: 'hand'
  },

  // ===== RANGED WEAPONS =====
  {
    id: 'derringer', name: 'Derringer', type: 'weapon',
    effect: '2 Attack Dice, Hidden, 2 shots',
    attackDice: 2, weaponType: 'ranged', range: 2, ammo: 2,
    goldCost: 100, slotType: 'hand'
  },
  {
    id: 'rev', name: 'Revolver', type: 'weapon',
    effect: '3 Attack Dice, 6 shots',
    attackDice: 3, weaponType: 'ranged', range: 3, ammo: 6,
    goldCost: 200, slotType: 'hand',
    // Legacy compatibility
    bonus: 1, cost: 3, statModifier: 'combat'
  },
  {
    id: 'shot', name: 'Shotgun', type: 'weapon',
    effect: '4 Attack Dice, 2 shots, close range',
    attackDice: 4, weaponType: 'ranged', range: 2, ammo: 2,
    goldCost: 400, slotType: 'hand',
    // Legacy compatibility
    bonus: 2, cost: 5, statModifier: 'combat'
  },
  {
    id: 'rifle', name: 'Rifle', type: 'weapon',
    effect: '3 Attack Dice, Long range',
    attackDice: 3, weaponType: 'ranged', range: 5, ammo: 5,
    goldCost: 350, slotType: 'hand'
  },
  {
    id: 'tommy', name: 'Tommy Gun', type: 'weapon',
    effect: '5 Attack Dice, 20 shots, Close range only (neighbor tiles)',
    attackDice: 5, weaponType: 'ranged', range: 1, ammo: 20,
    goldCost: 800, slotType: 'hand',
    // Legacy compatibility
    bonus: 3, cost: 10, statModifier: 'combat'
  },

  // ===== ARMOR =====
  {
    id: 'leather_jacket', name: 'Leather Jacket', type: 'armor',
    effect: '+1 Defense Die',
    defenseDice: 1, goldCost: 100, slotType: 'body'
  },
  {
    id: 'trench_coat', name: 'Trench Coat', type: 'armor',
    effect: '+1 Defense Die, Conceals weapons',
    defenseDice: 1, goldCost: 150, slotType: 'body'
  },
  {
    id: 'armored_vest', name: 'Armored Vest', type: 'armor',
    effect: '+2 Defense Dice, Military grade',
    defenseDice: 2, goldCost: 500, slotType: 'body'
  },

  // ===== CONSUMABLES =====
  { id: 'med', name: 'Medical Kit', type: 'consumable', effect: 'Heal 2 HP', bonus: 2, goldCost: 100, uses: 3, maxUses: 3, slotType: 'bag' },
  { id: 'whiskey', name: 'Old Whiskey', type: 'consumable', effect: 'Heal 2 Sanity', bonus: 2, goldCost: 50, uses: 1, maxUses: 1, slotType: 'bag' },
  { id: 'bandages', name: 'Bandages', type: 'consumable', effect: 'Heal 1 HP', bonus: 1, goldCost: 25, uses: 2, maxUses: 2, slotType: 'bag' },
  { id: 'sedatives', name: 'Sedatives', type: 'consumable', effect: 'Heal 1 Sanity', bonus: 1, goldCost: 75, uses: 2, maxUses: 2, slotType: 'bag' },

  // ===== TOOLS =====
  { id: 'flash', name: 'Flashlight', type: 'tool', effect: 'Removes Darkness penalty', bonus: 1, goldCost: 50, isLightSource: true, slotType: 'hand', statModifier: 'investigation' },
  { id: 'lantern', name: 'Oil Lantern', type: 'tool', effect: 'Light source, can ignite', bonus: 1, goldCost: 75, isLightSource: true, slotType: 'hand' },
  { id: 'lockpick', name: 'Lockpick Set', type: 'tool', effect: '+1 die on lockpicking', bonus: 1, goldCost: 100, slotType: 'bag' },
  { id: 'crowbar', name: 'Crowbar', type: 'tool', effect: '+1 die on forcing doors', bonus: 1, goldCost: 75, slotType: 'hand' },

  // ===== RELICS =====
  { id: 'elder_sign', name: 'Elder Sign', type: 'relic', effect: 'Opens sealed doors, banishes spirits', goldCost: 750, slotType: 'bag' },
  { id: 'protective_ward', name: 'Protective Ward', type: 'relic', effect: '+1 die on Horror checks', bonus: 1, goldCost: 300, slotType: 'bag' },
  { id: 'book', name: 'Necronomicon', type: 'relic', effect: '+3 Insight, -1 Sanity per read', bonus: 3, goldCost: 400, slotType: 'bag' },

  // === NEW RELICS ===
  { id: 'silver_key', name: 'Silver Key', type: 'relic', effect: 'Opens any locked door once', goldCost: 500, slotType: 'bag' },
  { id: 'dream_crystal', name: 'Dream Crystal', type: 'relic', effect: 'Restores 2 Sanity once per scenario', goldCost: 400, slotType: 'bag', uses: 1, maxUses: 1 },
  { id: 'mi_go_brain_cylinder', name: 'Mi-Go Brain Cylinder', type: 'relic', effect: '+2 Intellect checks, -1 Sanity per use', bonus: 2, goldCost: 600, slotType: 'bag' },
  { id: 'powder_of_ibn_ghazi', name: 'Powder of Ibn-Ghazi', type: 'relic', effect: 'Reveals invisible enemies', goldCost: 350, slotType: 'bag', uses: 3, maxUses: 3 },
  { id: 'lucky_charm', name: 'Lucky Rabbit Foot', type: 'relic', effect: 'Reroll one failed check per scenario', goldCost: 200, slotType: 'bag', uses: 1, maxUses: 1 },
  { id: 'ancient_medallion', name: 'Ancient Medallion', type: 'relic', effect: 'Reduces Horror damage by 1', bonus: 1, goldCost: 450, slotType: 'bag' },
  { id: 'eye_of_light', name: 'Eye of Light and Darkness', type: 'relic', effect: 'See through walls in adjacent tiles', goldCost: 550, slotType: 'bag' },
  { id: 'shrivelling_scroll', name: 'Shrivelling Scroll', type: 'relic', effect: 'Deals 3 damage to one enemy, destroyed after use', goldCost: 300, slotType: 'bag', uses: 1, maxUses: 1 },
  { id: 'warding_statue', name: 'Warding Statue', type: 'relic', effect: 'Enemies avoid this tile', goldCost: 400, slotType: 'bag' },
  { id: 'black_book', name: 'Black Book of the Skull', type: 'relic', effect: '+4 Insight, -2 Sanity per read', bonus: 4, goldCost: 650, slotType: 'bag' },
  { id: 'ritual_candles', name: 'Ritual Candles', type: 'relic', effect: 'Required for performing rituals', goldCost: 100, slotType: 'bag', uses: 5, maxUses: 5 },
  { id: 'holy_water', name: 'Holy Water', type: 'relic', effect: '+2 damage vs undead, 3 uses', goldCost: 150, slotType: 'bag', uses: 3, maxUses: 3 },
  { id: 'ghost_lantern', name: 'Ghost Lantern', type: 'relic', effect: 'Reveals spirit barriers and hidden doors', goldCost: 475, slotType: 'hand', isLightSource: true },

  // ===== NEW WEAPONS (matching HQ_WEAPONS) =====
  {
    id: 'brass_knuckles', name: 'Brass Knuckles', type: 'weapon',
    effect: '2 Attack Dice, Silent, Concealable',
    attackDice: 2, weaponType: 'melee', ammo: -1,
    goldCost: 40, silent: true, slotType: 'hand'
  },
  {
    id: 'fire_axe', name: 'Fire Axe', type: 'weapon',
    effect: '3 Attack Dice, Good vs barricades',
    attackDice: 3, weaponType: 'melee', ammo: -1,
    goldCost: 120, slotType: 'hand'
  },
  {
    id: 'cavalry_saber', name: 'Cavalry Saber', type: 'weapon',
    effect: '3 Attack Dice, Elegant',
    attackDice: 3, weaponType: 'melee', ammo: -1,
    goldCost: 180, slotType: 'hand'
  },
  {
    id: 'sledgehammer', name: 'Sledgehammer', type: 'weapon',
    effect: '4 Attack Dice, Slow but devastating',
    attackDice: 4, weaponType: 'melee', ammo: -1,
    goldCost: 200, slotType: 'hand'
  },
  {
    id: 'ceremonial_dagger', name: 'Ceremonial Dagger', type: 'weapon',
    effect: '2 Attack Dice, +1 vs cultists',
    attackDice: 2, weaponType: 'melee', ammo: -1,
    goldCost: 250, silent: true, slotType: 'hand'
  },
  {
    id: 'flare_gun', name: 'Flare Gun', type: 'weapon',
    effect: '2 Attack Dice, Illuminates area',
    attackDice: 2, weaponType: 'ranged', range: 3, ammo: 3,
    goldCost: 75, slotType: 'hand'
  },
  {
    id: 'crossbow', name: 'Crossbow', type: 'weapon',
    effect: '3 Attack Dice, Silent, Slow reload',
    attackDice: 3, weaponType: 'ranged', range: 4, ammo: 1,
    goldCost: 250, silent: true, slotType: 'hand'
  },
  {
    id: 'hunting_rifle', name: 'Hunting Rifle', type: 'weapon',
    effect: '4 Attack Dice, Extreme range',
    attackDice: 4, weaponType: 'ranged', range: 6, ammo: 3,
    goldCost: 450, slotType: 'hand'
  },
  {
    id: 'sawed_off', name: 'Sawed-Off Shotgun', type: 'weapon',
    effect: '5 Attack Dice, Point-blank only',
    attackDice: 5, weaponType: 'ranged', range: 1, ammo: 2,
    goldCost: 350, slotType: 'hand'
  },

  // ===== NEW ARMOR (matching HQ_ARMOR) =====
  {
    id: 'wool_overcoat', name: 'Wool Overcoat', type: 'armor',
    effect: '+1 Defense Die, Warm',
    defenseDice: 1, goldCost: 80, slotType: 'body'
  },
  {
    id: 'police_vest', name: 'Police Vest', type: 'armor',
    effect: '+2 Defense Dice, Standard issue',
    defenseDice: 2, goldCost: 400, slotType: 'body'
  },
  {
    id: 'cultist_robes', name: 'Cultist Robes', type: 'armor',
    effect: '+1 Defense Die, Blends with enemies',
    defenseDice: 1, goldCost: 200, slotType: 'body'
  },
  {
    id: 'ritual_vestments', name: 'Ritual Vestments', type: 'armor',
    effect: '+1 Defense Die, +1 occult checks',
    defenseDice: 1, goldCost: 350, slotType: 'body'
  },
  {
    id: 'elder_mantle', name: 'Elder Mantle', type: 'armor',
    effect: '+2 Defense Dice, Ward against sanity loss',
    defenseDice: 2, goldCost: 800, slotType: 'body'
  },

  // ===== NEW TOOLS =====
  { id: 'rope', name: 'Rope & Grapple', type: 'tool', effect: '+1 on climbing, can cross chasms', bonus: 1, goldCost: 50, slotType: 'bag' },
  { id: 'camera', name: 'Camera', type: 'tool', effect: 'Document evidence, +1 Insight from clues', bonus: 1, goldCost: 150, slotType: 'bag' },
  { id: 'binoculars', name: 'Binoculars', type: 'tool', effect: 'See 2 extra tiles ahead', bonus: 1, goldCost: 100, slotType: 'bag' },
  { id: 'magnifying_glass', name: 'Magnifying Glass', type: 'tool', effect: '+1 on Investigation checks', bonus: 1, goldCost: 75, slotType: 'bag' },
  { id: 'compass', name: 'Compass', type: 'tool', effect: 'Always know direction to exit', goldCost: 50, slotType: 'bag' },

  // ===== NEW CONSUMABLES =====
  { id: 'morphine', name: 'Morphine Syringe', type: 'consumable', effect: 'Heal 3 HP, -1 Agility next round', bonus: 3, goldCost: 150, uses: 1, maxUses: 1, slotType: 'bag' },
  { id: 'smelling_salts', name: 'Smelling Salts', type: 'consumable', effect: 'Restore 1 Sanity instantly', bonus: 1, goldCost: 50, uses: 2, maxUses: 2, slotType: 'bag' },
  { id: 'adrenaline', name: 'Adrenaline Shot', type: 'consumable', effect: '+1 AP this turn', goldCost: 200, uses: 1, maxUses: 1, slotType: 'bag' },
  { id: 'antidote', name: 'Antidote', type: 'consumable', effect: 'Cures poison effects', goldCost: 100, uses: 1, maxUses: 1, slotType: 'bag' },
  { id: 'rations', name: 'Field Rations', type: 'consumable', effect: 'Heal 1 HP', bonus: 1, goldCost: 15, uses: 3, maxUses: 3, slotType: 'bag' }
];

// ============================================================================
// LORE ITEMS - Journals, Diaries, Torn Pages (Lovecraftian Fluff)
// ============================================================================
// These items provide atmosphere and can give small insight bonuses
// They are discoverable objects that add immersion to the game

export interface LoreItem {
  id: string;
  name: string;
  type: 'journal' | 'diary' | 'letter' | 'torn_page' | 'newspaper' | 'photograph' | 'recording';
  title: string;
  content: string;
  insightBonus?: number;    // Insight gained from reading
  sanityEffect?: number;    // Sanity change from reading (-1 for disturbing content)
  condition: 'pristine' | 'worn' | 'damaged' | 'barely_legible';
  author?: string;
  date?: string;
}

export const LORE_ITEMS: LoreItem[] = [
  // ===== JOURNALS =====
  {
    id: 'lore_journal_01',
    name: 'Research Journal',
    type: 'journal',
    title: "Dr. Armitage's Research Notes",
    content: `March 15th - The Whateley case has opened my eyes to horrors I had only read about in forbidden texts. The calculations in the Necronomicon are not mere superstition - they describe geometric principles that exist beyond our three dimensions.

March 22nd - I have begun to suspect that the walls between worlds are thinner than we believed. In certain configurations of stone and star, the barrier weakens.

April 3rd - God help me. I have seen what waits on the other side. It is patient. It is hungry. And it KNOWS we are here.`,
    insightBonus: 2,
    sanityEffect: -1,
    condition: 'worn',
    author: 'Dr. Henry Armitage',
    date: '1928'
  },
  {
    id: 'lore_journal_02',
    name: 'Explorer\'s Journal',
    type: 'journal',
    title: 'Antarctic Expedition Notes',
    content: `Day 47 - We found the city today. It should not exist. No human hands built these cyclopean structures. The angles hurt to look at.

Day 48 - Danforth won't stop screaming about what he saw beyond the mountains. I did not look. I was afraid to look.

Day 49 - Something followed us back. We can hear it at night, mimicking our voices. It knows our names.

Day 50 - [THE REST OF THE PAGES ARE STAINED WITH SOMETHING DARK]`,
    insightBonus: 2,
    sanityEffect: -1,
    condition: 'damaged',
    author: 'Unknown Expedition Member',
    date: '1931'
  },
  {
    id: 'lore_journal_03',
    name: 'Occultist\'s Grimoire',
    type: 'journal',
    title: 'Notes on the Outer Gods',
    content: `They are not evil. They are not good. They simply ARE, in ways that our minds cannot comprehend. To call them gods is to anthropomorphize the void itself.

Azathoth dreams at the center of all things. When It wakes, reality ends.

Nyarlathotep walks among us in a thousand forms. It finds our suffering amusing.

Yog-Sothoth is the gate, the key, and the guardian. Time and space mean nothing to It.

To attract their attention is death. To understand them is madness. To worship them is both.`,
    insightBonus: 3,
    sanityEffect: -2,
    condition: 'pristine',
    author: 'A. Blackwood',
    date: '1925'
  },

  // ===== DIARIES =====
  {
    id: 'lore_diary_01',
    name: 'Weathered Diary',
    type: 'diary',
    title: 'Personal Diary of [Name Scratched Out]',
    content: `October 12th - The dreams have started again. I see a vast city beneath the waves. Towers of impossible architecture. Something sleeps there.

October 15th - I can hear the ocean in my head now. Even here, hundreds of miles from any coast. The call is getting stronger.

October 20th - I know what I must do. The water calls. The depths welcome me. I will join them in the deep.

October 21st - IA! IA! THE STARS ARE RIGHT! HE WAITS DREAMING! I COME, GREAT DAGON! I COME!`,
    insightBonus: 1,
    sanityEffect: -1,
    condition: 'worn',
    date: '1927'
  },
  {
    id: 'lore_diary_02',
    name: 'Child\'s Diary',
    type: 'diary',
    title: 'Emily\'s Secret Diary',
    content: `Dear Diary,
The night friend came again. He says he lives in the walls and watches me sleep. He has too many eyes but he says that's normal where he comes from.

He taught me a song today. When I sing it, the shadows move. Mommy got scared when she heard me singing. She called the priest.

The priest tried to make my friend go away. The priest is gone now. My friend says he "went somewhere else." I don't know what that means.

My friend says soon I can come visit his home. He says I'll like it there. He says I'll never have to sleep again.`,
    insightBonus: 1,
    sanityEffect: -2,
    condition: 'pristine',
    author: 'Emily, Age 9',
    date: '1924'
  },
  {
    id: 'lore_diary_03',
    name: 'Asylum Patient Diary',
    type: 'diary',
    title: 'Ward B, Patient #447',
    content: `They say I'm mad. They say the things I see aren't real. But I know the truth.

The walls breathe at night. The doctors have too many joints in their fingers. The other patients whisper in languages that predate humanity.

I tried to tell them about the thing in the basement. They increased my medication.

It's coming up the stairs now. I can hear its wet footsteps. They'll know I was right. They'll know when they find what's left of me.

Tell my wife I'm sorry I couldn't protect her from what's coming.`,
    insightBonus: 2,
    sanityEffect: -1,
    condition: 'damaged',
    author: 'Patient #447',
    date: '1929'
  },

  // ===== TORN PAGES =====
  {
    id: 'lore_page_01',
    name: 'Torn Page',
    type: 'torn_page',
    title: 'Fragment from Unknown Text',
    content: `...and when the alignment occurs, the barrier shall weaken. Those who know the words may call through, and those who dwell beyond may answer.

Speak not these words lightly, for once spoken, they cannot be unheard by Those Who Listen:

Ph'nglui mglw'nafh [TEXT TORN]
...fhtagn.

The price of knowledge is sanity. The price of power is soul. Choose wisely what you seek, for once found, it cannot be unfound...`,
    insightBonus: 1,
    sanityEffect: -1,
    condition: 'damaged'
  },
  {
    id: 'lore_page_02',
    name: 'Bloodstained Page',
    type: 'torn_page',
    title: 'Final Entry',
    content: `If you're reading this, RUN.

Don't investigate. Don't try to understand. Don't look for the source of the sounds.

There is no stopping them. There is no reasoning with them. There is only fleeing or dying.

I was curious once. I had to know. Now I know, and the knowing has killed me.

The walls have eyes. The floor has mouths. The ceiling breathes.

Run. Run. Run. Run. Run. [THE WORD CONTINUES TO THE EDGE OF THE PAGE, WRITTEN IN INCREASINGLY FRANTIC STROKES]`,
    sanityEffect: -1,
    condition: 'damaged',
    author: 'Unknown'
  },
  {
    id: 'lore_page_03',
    name: 'Ancient Parchment',
    type: 'torn_page',
    title: 'The Oath of the Esoteric Order',
    content: `I, [NAME], do solemnly swear to serve the Deep Ones, now and forever.

I accept the Gift of Dagon, that my children may bear the blessed Mark.

I shall keep the faith in secret, until the day of Rising.

I shall bring sacrifices to the reef when the moon is dark.

When the stars align, I shall open the Gate and welcome our masters home.

This I swear by my blood, by my seed, by my eternal soul which I forfeit to the Deep.

IA! IA! CTHULHU FHTAGN!`,
    insightBonus: 2,
    sanityEffect: -1,
    condition: 'worn',
    date: '1846'
  },
  {
    id: 'lore_page_04',
    name: 'Charred Page Fragment',
    type: 'torn_page',
    title: 'Warning',
    content: `...the ritual must NEVER be completed. If the circle is closed and the words spoken while the stars are right, nothing can stop what comes through.

I have hidden the components in three locations:
- The silver key beneath the [BURNED]
- The star-stone in the [BURNED]
- The blood of [BURNED] in the [BURNED]

May God forgive me for what I have learned. May He protect us from what I have almost done.

DESTROY THIS PAGE WHEN YOU HAVE [REST BURNED AWAY]`,
    insightBonus: 2,
    condition: 'barely_legible'
  },

  // ===== LETTERS =====
  {
    id: 'lore_letter_01',
    name: 'Unsent Letter',
    type: 'letter',
    title: 'Letter to Wife',
    content: `My Dearest Margaret,

By the time you read this, I will be gone. Not dead - worse than dead.

The things I have seen in this place have changed me. I can feel myself becoming something else. Something that was once human but will not be for much longer.

Do not search for me. Do not mourn me. The man you loved died the moment he opened that accursed book.

Forget me. Take the children and leave Arkham. Go somewhere far from any coast. Never speak of the sea.

What wears my face now is not your husband.

Forever yours (what remains of me),
Jonathan`,
    insightBonus: 1,
    sanityEffect: -1,
    condition: 'pristine',
    author: 'Jonathan W.',
    date: '1926'
  },
  {
    id: 'lore_letter_02',
    name: 'Threatening Letter',
    type: 'letter',
    title: 'Anonymous Warning',
    content: `WE KNOW WHAT YOU SEEK.

THE ORDER HAS EYES EVERYWHERE. YOUR INVESTIGATION ENDS NOW.

LEAVE ARKHAM. LEAVE MASSACHUSETTS. FORGET WHAT YOU HAVE LEARNED.

THIS IS YOUR ONLY WARNING.

THE NEXT MESSAGE WILL NOT BE WRITTEN IN INK.

[A STRANGE SYMBOL IS DRAWN AT THE BOTTOM - LOOKING AT IT MAKES YOUR HEAD ACHE]`,
    sanityEffect: -1,
    condition: 'pristine'
  },
  {
    id: 'lore_letter_03',
    name: 'Desperate Plea',
    type: 'letter',
    title: 'Letter to Miskatonic University',
    content: `To Whom It May Concern,

I write to you in desperation. The faculty of your institution are the only ones who might believe me.

Something has taken residence in my cellar. It speaks to me through the walls. It knows things about my family - things it should not know.

My wife has begun to change. She no longer eats regular food. She spends hours staring at the sea.

Please send someone. Anyone. Before it's too late.

I can hear it coming up the stairs as I write this.

Please hur`,
    insightBonus: 1,
    condition: 'damaged',
    author: 'Unknown Resident',
    date: '1928'
  },

  // ===== NEWSPAPERS =====
  {
    id: 'lore_news_01',
    name: 'Old Newspaper',
    type: 'newspaper',
    title: 'Arkham Advertiser - February 13, 1924',
    content: `MASS DISAPPEARANCE BAFFLES AUTHORITIES

Seventeen residents of the Merchant District vanished last night without a trace. Police report no signs of struggle in any of the homes.

"It's like they simply walked out into the night and never came back," said Chief of Police Morrison.

Witnesses report strange lights over the harbor and unusual sounds "like flutes played by someone who had never heard music."

The investigation is ongoing. Citizens are advised to remain indoors after dark.

[CONTINUED ON PAGE 7 - BUT PAGE 7 IS MISSING]`,
    insightBonus: 1,
    condition: 'worn',
    date: '1924'
  },
  {
    id: 'lore_news_02',
    name: 'Newspaper Clipping',
    type: 'newspaper',
    title: 'Innsmouth Scandal Continues',
    content: `FEDERAL RAID ON INNSMOUTH - HUNDREDS ARRESTED

In what officials are calling "the largest bootlegging operation in Massachusetts history," federal agents descended on the coastal town of Innsmouth last Tuesday.

However, sources close to the investigation hint at darker discoveries. "The bootlegging was a cover," whispered one agent. "What we found in those tunnels... God help us all."

Naval vessels were seen off the coast conducting "depth charge exercises." The Navy has declined to comment on what they were targeting.

Innsmouth remains under quarantine indefinitely.`,
    insightBonus: 2,
    condition: 'worn',
    date: '1928'
  },

  // ===== PHOTOGRAPHS =====
  {
    id: 'lore_photo_01',
    name: 'Disturbing Photograph',
    type: 'photograph',
    title: 'Group Portrait - Esoteric Order of Dagon',
    content: `A formal photograph showing approximately thirty individuals in ceremonial robes, standing before an altar carved with oceanic motifs.

Upon closer inspection, something is wrong with their faces. Their eyes are too large, too far apart. Their necks show the faint lines of... gills?

In the center stands a figure that might once have been human but is now something else entirely. It smiles for the camera with too many teeth.

On the back is written: "The faithful await the Rising. 1919."`,
    sanityEffect: -1,
    condition: 'worn',
    date: '1919'
  },
  {
    id: 'lore_photo_02',
    name: 'Faded Photograph',
    type: 'photograph',
    title: 'Antarctic Expedition',
    content: `A photograph of a research camp against an icy backdrop. The expedition members pose proudly before their tents.

In the background, barely visible, are what appear to be structures - massive, geometric shapes that dwarf the tiny human figures.

The architecture is wrong. Alien. The angles suggest dimensions that shouldn't exist.

Someone has circled this section of the photograph and written: "THEY WERE ALREADY THERE. WAITING."`,
    insightBonus: 1,
    sanityEffect: -1,
    condition: 'damaged',
    date: '1930'
  },

  // ===== RECORDINGS (Phonograph Cylinders) =====
  {
    id: 'lore_recording_01',
    name: 'Wax Cylinder',
    type: 'recording',
    title: 'Final Recording of Dr. West',
    content: `[TRANSCRIPT OF RECORDING]

"This is Dr. Herbert West, recording my final observations. The reanimation process has been... more successful than anticipated. Perhaps too successful.

The subjects have begun to remember. Not just motor functions - they remember who they were. What was done to them.

They communicate now. In whispers. Planning something.

I can hear them gathering outside my laboratory door. They've learned to use tools.

If anyone finds this recording, know that death is not the end. It is merely a door. And I have propped that door open.

[SOUNDS OF SPLINTERING WOOD]

God forgive me. They're com-"

[RECORDING ENDS]`,
    insightBonus: 2,
    sanityEffect: -1,
    condition: 'pristine',
    author: 'Dr. Herbert West',
    date: '1921'
  }
];

// ============================================================================
// LORE ITEM DISCOVERY POOL
// Categories for random discovery during exploration
// ============================================================================

export const LORE_DISCOVERY_WEIGHTS: Record<LoreItem['type'], number> = {
  torn_page: 30,      // Most common - fragments everywhere
  letter: 20,         // Common - correspondence found
  diary: 15,          // Uncommon - personal writings
  journal: 15,        // Uncommon - research notes
  newspaper: 10,      // Rare - preserved news
  photograph: 7,      // Very rare - disturbing images
  recording: 3        // Extremely rare - audio evidence
};

/**
 * Get a random lore item based on weights
 */
export function getRandomLoreItem(): LoreItem {
  const totalWeight = Object.values(LORE_DISCOVERY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [type, weight] of Object.entries(LORE_DISCOVERY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      const itemsOfType = LORE_ITEMS.filter(item => item.type === type as LoreItem['type']);
      return itemsOfType[Math.floor(Math.random() * itemsOfType.length)];
    }
  }

  // Fallback
  return LORE_ITEMS[Math.floor(Math.random() * LORE_ITEMS.length)];
}

/**
 * EVENT CARD DECK - Drawn during MYTHOS phase
 * Inspired by Mansions of Madness and Arkham Horror
 * Balance: ~40% negative, ~30% mixed, ~30% neutral/positive
 */
export const EVENTS: EventCard[] = [
  // === SANITY EVENTS (negative) ===
  {
    id: 'e01',
    title: 'Shadows in the Dark',
    description: 'You feel watched. Something moves just beyond the edge of your vision.',
    effectType: 'sanity',
    value: -1,
    flavorText: 'The shadows have eyes...'
  },
  {
    id: 'e02',
    title: 'Whispers from Beyond',
    description: 'Voices speak secrets no mortal should know. Your mind reels.',
    effectType: 'sanity',
    value: -2,
    skillCheck: {
      attribute: 'willpower',
      dc: 4,
      successDescription: 'You steel your mind and block out the voices.',
      failureDescription: 'The whispers burrow into your thoughts...'
    }
  },
  {
    id: 'e03',
    title: 'Nightmare Visions',
    description: 'Terrible images flood your mind. Horrors that cannot be unseen.',
    effectType: 'all_sanity',
    value: -1,
    flavorText: 'In sleep, the truth is revealed...'
  },
  {
    id: 'e04',
    title: 'The Watcher',
    description: 'An eye. Vast. Ancient. It sees you. It KNOWS you.',
    effectType: 'sanity',
    value: -2,
    doomThreshold: 6,
    flavorText: 'Ph\'nglui mglw\'nafh...'
  },
  {
    id: 'e05',
    title: 'Creeping Dread',
    description: 'A sense of wrongness pervades everything. Reality feels thin.',
    effectType: 'sanity',
    value: -1,
    secondaryEffect: { type: 'doom', value: -1 }
  },

  // === HEALTH EVENTS (negative) ===
  {
    id: 'e06',
    title: 'Toxic Fumes',
    description: 'A cloud of noxious gas seeps from the walls.',
    effectType: 'health',
    value: -1,
    skillCheck: {
      attribute: 'agility',
      dc: 4,
      successDescription: 'You cover your face and escape the fumes.',
      failureDescription: 'You inhale the poisonous vapors...'
    }
  },
  {
    id: 'e07',
    title: 'Unstable Ground',
    description: 'The floor gives way beneath your feet!',
    effectType: 'health',
    value: -2,
    skillCheck: {
      attribute: 'agility',
      dc: 5,
      successDescription: 'You leap clear of the collapsing floor.',
      failureDescription: 'You fall, hitting the debris hard...'
    }
  },
  {
    id: 'e08',
    title: 'Hidden Blade',
    description: 'A trap springs from the wall! A rusty blade swings toward you.',
    effectType: 'health',
    value: -1,
    skillCheck: {
      attribute: 'agility',
      dc: 3,
      successDescription: 'You dodge the blade with ease.',
      failureDescription: 'The blade cuts deep...'
    }
  },

  // === SPAWN EVENTS ===
  {
    id: 'e09',
    title: 'They Come',
    description: 'A cultist patrol has found your trail!',
    effectType: 'spawn',
    value: 2,
    spawnType: 'cultist',
    flavorText: 'Ia! Ia!'
  },
  {
    id: 'e10',
    title: 'From the Depths',
    description: 'Something claws its way up from below. The smell of the grave fills the air.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'ghoul'
  },
  {
    id: 'e11',
    title: 'The Deep Ones Stir',
    description: 'Wet footsteps echo through the halls. The creatures of Innsmouth have come.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'deep_one',
    doomThreshold: 8
  },
  {
    id: 'e12',
    title: 'Ambush!',
    description: 'You walked right into their trap!',
    effectType: 'spawn',
    value: 3,
    spawnType: 'cultist',
    skillCheck: {
      attribute: 'intellect',
      dc: 4,
      successDescription: 'You noticed the trap and prepared for the ambush.',
      failureDescription: 'They surround you before you can react...'
    }
  },

  // === DOOM EVENTS ===
  {
    id: 'e13',
    title: 'The Stars Align',
    description: 'A cosmic conjunction accelerates the ritual. Time grows short.',
    effectType: 'doom',
    value: -2,
    flavorText: 'When the stars are right...'
  },
  {
    id: 'e14',
    title: 'Ritual Progress',
    description: 'Somewhere in the darkness, cultists chant. The summoning continues.',
    effectType: 'doom',
    value: -1
  },
  {
    id: 'e15',
    title: 'Blood Sacrifice',
    description: 'A scream in the distance. Another victim for the Old Ones.',
    effectType: 'doom',
    value: -1,
    secondaryEffect: { type: 'all_sanity', value: -1 }
  },

  // === POSITIVE EVENTS ===
  {
    id: 'e16',
    title: 'Hidden Cache',
    description: 'You discover a hidden supply cache! Medical supplies and ammunition.',
    effectType: 'health',
    value: 2,
    flavorText: 'Someone else tried to fight back...'
  },
  {
    id: 'e17',
    title: 'Moment of Clarity',
    description: 'Your mind clears. The horror recedes, if only for a moment.',
    effectType: 'sanity',
    value: 2
  },
  {
    id: 'e18',
    title: 'Hidden Diary',
    description: 'You find a researcher\'s journal. The notes are invaluable!',
    effectType: 'insight',
    value: 2
  },
  {
    id: 'e19',
    title: 'Disrupted Ritual',
    description: 'Your presence has delayed their plans. You\'ve bought precious time.',
    effectType: 'doom',
    value: 1,
    flavorText: 'Every second counts...'
  },
  {
    id: 'e20',
    title: 'Lucky Find',
    description: 'You stumble upon useful supplies in the debris.',
    effectType: 'item',
    value: 1,
    itemId: 'bandage'
  },

  // === WEATHER EVENTS ===
  {
    id: 'e21',
    title: 'Unnatural Fog',
    description: 'A thick, cloying fog rolls in. Visibility drops to nearly nothing.',
    effectType: 'weather',
    value: 3,
    weatherType: 'fog'
  },
  {
    id: 'e22',
    title: 'Cosmic Storm',
    description: 'Reality shimmers and cracks. Static fills the air.',
    effectType: 'weather',
    value: 2,
    weatherType: 'cosmic_static',
    doomThreshold: 5
  },
  {
    id: 'e23',
    title: 'Eldritch Glow',
    description: 'An sickly light illuminates the area. It seems to come from everywhere and nowhere.',
    effectType: 'weather',
    value: 3,
    weatherType: 'unnatural_glow'
  },

  // === MIXED/COMPLEX EVENTS ===
  {
    id: 'e24',
    title: 'The Price of Knowledge',
    description: 'Ancient texts reveal secrets, but reading them takes its toll.',
    effectType: 'insight',
    value: 3,
    secondaryEffect: { type: 'sanity', value: -1 },
    flavorText: 'Some knowledge is not meant for mortal minds...'
  },
  {
    id: 'e25',
    title: 'Dark Bargain',
    description: 'A voice offers power... for a price.',
    effectType: 'health',
    value: 3,
    secondaryEffect: { type: 'sanity', value: -2 },
    skillCheck: {
      attribute: 'willpower',
      dc: 5,
      successDescription: 'You reject the bargain. Your soul remains your own.',
      failureDescription: 'The deal is struck...'
    }
  },
  {
    id: 'e26',
    title: 'Fleeting Hope',
    description: 'For a moment, you believe you can win. Then the darkness returns.',
    effectType: 'sanity',
    value: 1,
    secondaryEffect: { type: 'doom', value: -1 }
  },
  {
    id: 'e27',
    title: 'The Hunted',
    description: 'Something is tracking you. You can feel its hunger.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'hound_of_tindalos',
    doomThreshold: 4
  },
  {
    id: 'e28',
    title: 'Echoes of the Past',
    description: 'Ghostly images show what happened here. The truth is horrifying.',
    effectType: 'insight',
    value: 2,
    secondaryEffect: { type: 'sanity', value: -1 }
  },
  {
    id: 'e29',
    title: 'Respite',
    description: 'A moment of peace in the chaos. But it will not last.',
    effectType: 'health',
    value: 1,
    secondaryEffect: { type: 'sanity', value: 1 }
  },
  {
    id: 'e30',
    title: 'The Gathering Storm',
    description: 'Dark clouds gather. Thunder rolls in the distance.',
    effectType: 'weather',
    value: 4,
    weatherType: 'rain',
    secondaryEffect: { type: 'doom', value: -1 }
  },

  // === LATE GAME EVENTS (doom threshold) ===
  {
    id: 'e31',
    title: 'The Veil Thins',
    description: 'Reality tears. For a moment, you glimpse what lies beyond.',
    effectType: 'all_sanity',
    value: -2,
    doomThreshold: 4,
    flavorText: 'The Old Ones wait...'
  },
  {
    id: 'e32',
    title: 'Herald of Doom',
    description: 'A terrible creature announces the coming apocalypse.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'byakhee',
    doomThreshold: 5,
    secondaryEffect: { type: 'all_sanity', value: -1 }
  },
  {
    id: 'e33',
    title: 'Final Warning',
    description: 'The end approaches. You feel it in your bones.',
    effectType: 'doom',
    value: -2,
    doomThreshold: 3,
    secondaryEffect: { type: 'all_sanity', value: -1 }
  },

  // === BUFF/DEBUFF EVENTS ===
  {
    id: 'e34',
    title: 'Empowered Darkness',
    description: 'The creatures of the night grow stronger. Their eyes gleam with new malice.',
    effectType: 'buff_enemies',
    value: 1,
    doomThreshold: 6
  },
  {
    id: 'e35',
    title: 'Weakening Resolve',
    description: 'Exhaustion sets in. Your movements feel sluggish.',
    effectType: 'debuff_player',
    value: 1,
    skillCheck: {
      attribute: 'willpower',
      dc: 4,
      successDescription: 'You push through the fatigue.',
      failureDescription: 'Your body betrays you...'
    }
  },

  // ============================================================================
  // === NEW EVENT CARDS - MORE VARIETY AND EFFECTS ===
  // ============================================================================

  // === SANITY EVENTS ===
  {
    id: 'e36',
    title: 'The Mirror Lies',
    description: 'Your reflection moves independently. It grins with teeth that are not yours.',
    effectType: 'sanity',
    value: -2,
    skillCheck: {
      attribute: 'willpower',
      dc: 4,
      successDescription: 'You avert your eyes. It was just a trick of light.',
      failureDescription: 'You cannot unsee what you saw...'
    },
    flavorText: 'Who looks back when you look away?'
  },
  {
    id: 'e37',
    title: 'Childhood Memories',
    description: 'Visions of your past flood your mind. But the memories are wrong. Twisted.',
    effectType: 'sanity',
    value: -1,
    secondaryEffect: { type: 'insight', value: 1 },
    flavorText: 'Were those really your parents?'
  },
  {
    id: 'e38',
    title: 'The Geometry is Wrong',
    description: 'The walls meet at angles that should not exist. Your eyes water trying to understand.',
    effectType: 'sanity',
    value: -1,
    skillCheck: {
      attribute: 'intellect',
      dc: 5,
      successDescription: 'You realize the trick - forced perspective, nothing more.',
      failureDescription: 'Your mind cannot process what it sees...'
    }
  },
  {
    id: 'e39',
    title: 'Drowning in Air',
    description: 'For a terrible moment, you forget how to breathe. Panic sets in.',
    effectType: 'sanity',
    value: -1,
    secondaryEffect: { type: 'health', value: -1 },
    skillCheck: {
      attribute: 'willpower',
      dc: 3,
      successDescription: 'You calm yourself. In... out... in... out...',
      failureDescription: 'Your body refuses to obey...'
    }
  },
  {
    id: 'e40',
    title: 'They Know Your Name',
    description: 'From the darkness, voices call your name. They know things about you. Private things.',
    effectType: 'all_sanity',
    value: -1,
    flavorText: 'How do they know about your childhood pet?'
  },

  // === HEALTH EVENTS ===
  {
    id: 'e41',
    title: 'Ceiling Collapse',
    description: 'Rotten timbers give way above you!',
    effectType: 'health',
    value: -2,
    skillCheck: {
      attribute: 'agility',
      dc: 4,
      successDescription: 'You dive clear as debris crashes down.',
      failureDescription: 'Heavy beams strike your back...'
    }
  },
  {
    id: 'e42',
    title: 'Glass Shard Floor',
    description: 'Broken glass crunches underfoot. Too late - some has pierced your boots.',
    effectType: 'health',
    value: -1,
    flavorText: 'Every step leaves bloody footprints...'
  },
  {
    id: 'e43',
    title: 'Poisoned Air',
    description: 'A sickly sweet smell fills the room. Your vision blurs.',
    effectType: 'health',
    value: -1,
    secondaryEffect: { type: 'sanity', value: -1 },
    skillCheck: {
      attribute: 'strength',
      dc: 4,
      successDescription: 'You hold your breath and push through.',
      failureDescription: 'The toxins seep into your lungs...'
    }
  },
  {
    id: 'e44',
    title: 'Bitten',
    description: 'Something lurked in the shadows. Its teeth find your flesh.',
    effectType: 'health',
    value: -2,
    skillCheck: {
      attribute: 'agility',
      dc: 4,
      successDescription: 'You jerk away - only a scratch!',
      failureDescription: 'The bite is deep and burns...'
    }
  },
  {
    id: 'e45',
    title: 'Exhaustion',
    description: 'Your body screams for rest. Your legs tremble.',
    effectType: 'all_health',
    value: -1,
    flavorText: 'How long has it been since you slept?'
  },

  // === SPAWN EVENTS ===
  {
    id: 'e46',
    title: 'The Pack Arrives',
    description: 'Ghouls emerge from the shadows, drawn by the scent of the living.',
    effectType: 'spawn',
    value: 2,
    spawnType: 'ghoul',
    flavorText: 'Their hunger is eternal...'
  },
  {
    id: 'e47',
    title: 'Cultist Reinforcements',
    description: 'The alarm has been raised! More robed figures flood into the area.',
    effectType: 'spawn',
    value: 3,
    spawnType: 'cultist',
    skillCheck: {
      attribute: 'agility',
      dc: 4,
      successDescription: 'You hide before they spot you - only 1 cultist notices.',
      failureDescription: 'They see you!'
    }
  },
  {
    id: 'e48',
    title: 'From the Waters',
    description: 'Webbed hands grasp at the floor. The Deep Ones have found you.',
    effectType: 'spawn',
    value: 2,
    spawnType: 'deep_one',
    doomThreshold: 7,
    flavorText: 'Ia! Ia! Dagon!'
  },
  {
    id: 'e49',
    title: 'Night Terror',
    description: 'A Nightgaunt descends from above, silent as death.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'nightgaunt',
    secondaryEffect: { type: 'sanity', value: -1 }
  },
  {
    id: 'e50',
    title: 'The Priest Arrives',
    description: 'A dark-robed figure enters, ancient power crackling at their fingertips.',
    effectType: 'spawn',
    value: 1,
    spawnType: 'priest',
    doomThreshold: 5,
    flavorText: 'The true servants of the Old Ones...'
  },

  // === POSITIVE EVENTS ===
  {
    id: 'e51',
    title: 'Safe Room',
    description: 'You find a hidden room, sealed and untouched. A moment of peace.',
    effectType: 'health',
    value: 2,
    secondaryEffect: { type: 'sanity', value: 2 },
    flavorText: 'Rest now, while you can...'
  },
  {
    id: 'e52',
    title: 'Old Bandolier',
    description: 'An abandoned ammunition belt - still fully loaded!',
    effectType: 'item',
    value: 1,
    itemId: 'bandages',
    flavorText: 'Someone else was prepared...'
  },
  {
    id: 'e53',
    title: 'Professor\'s Notes',
    description: 'Scattered papers reveal crucial information about your enemies.',
    effectType: 'insight',
    value: 3,
    flavorText: 'Knowledge is power, even forbidden knowledge...'
  },
  {
    id: 'e54',
    title: 'Second Wind',
    description: 'Adrenaline surges through you. You can do this!',
    effectType: 'health',
    value: 1,
    secondaryEffect: { type: 'sanity', value: 1 },
    flavorText: 'Not today, darkness. Not today.'
  },
  {
    id: 'e55',
    title: 'Ritual Disrupted',
    description: 'You accidentally interrupt an enemy ritual! The dark energy dissipates.',
    effectType: 'doom',
    value: 2,
    flavorText: 'Their plans are delayed!'
  },

  // === WEATHER EVENTS ===
  {
    id: 'e56',
    title: 'Miasma Rises',
    description: 'A sickening purple mist seeps from the ground. It whispers as it moves.',
    effectType: 'weather',
    value: 4,
    weatherType: 'miasma',
    secondaryEffect: { type: 'all_sanity', value: -1 }
  },
  {
    id: 'e57',
    title: 'Oppressive Darkness',
    description: 'The darkness here is unnatural. It swallows light.',
    effectType: 'weather',
    value: 3,
    weatherType: 'darkness',
    flavorText: 'Even your flashlight seems dimmer...'
  },
  {
    id: 'e58',
    title: 'Torrential Rain',
    description: 'Rain hammers down, reducing visibility and making footing treacherous.',
    effectType: 'weather',
    value: 4,
    weatherType: 'rain'
  },
  {
    id: 'e59',
    title: 'The Fog Lifts',
    description: 'The oppressive atmosphere clears momentarily. A respite.',
    effectType: 'sanity',
    value: 1,
    flavorText: 'A brief glimpse of normality...'
  },

  // === DOOM EVENTS ===
  {
    id: 'e60',
    title: 'The Chanting Grows',
    description: 'Somewhere, cultists raise their voices in terrible harmony.',
    effectType: 'doom',
    value: -1,
    secondaryEffect: { type: 'all_sanity', value: -1 },
    flavorText: 'Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn!'
  },
  {
    id: 'e61',
    title: 'Cosmic Alignment',
    description: 'The stars shift. Time itself seems to accelerate.',
    effectType: 'doom',
    value: -2,
    doomThreshold: 6,
    flavorText: 'When the stars are right...'
  },
  {
    id: 'e62',
    title: 'Blood Moon',
    description: 'The moon turns red. Ancient seals weaken.',
    effectType: 'doom',
    value: -1,
    secondaryEffect: { type: 'spawn', value: 1 },
    spawnType: 'cultist'
  },
  {
    id: 'e63',
    title: 'Seal Weakens',
    description: 'You feel a tremor. Something vast stirs in its prison.',
    effectType: 'doom',
    value: -1,
    doomThreshold: 4,
    flavorText: 'It is almost free...'
  },

  // === COMPLEX/MIXED EVENTS ===
  {
    id: 'e64',
    title: 'Forbidden Reading',
    description: 'You find arcane text. The knowledge calls to you.',
    effectType: 'insight',
    value: 4,
    secondaryEffect: { type: 'sanity', value: -2 },
    skillCheck: {
      attribute: 'intellect',
      dc: 4,
      successDescription: 'You parse the text carefully, minimizing the mental strain.',
      failureDescription: 'The words sear themselves into your mind...'
    },
    flavorText: 'Some books were never meant to be opened...'
  },
  {
    id: 'e65',
    title: 'Dark Pact',
    description: 'A shadowy presence offers aid... for a price.',
    effectType: 'health',
    value: 4,
    secondaryEffect: { type: 'doom', value: -2 },
    skillCheck: {
      attribute: 'willpower',
      dc: 5,
      successDescription: 'You reject the offer. Your soul remains your own.',
      failureDescription: 'The bargain is struck...'
    }
  },
  {
    id: 'e66',
    title: 'Memory Fragment',
    description: 'A vision of the past shows you a hidden truth.',
    effectType: 'insight',
    value: 2,
    secondaryEffect: { type: 'sanity', value: -1 },
    flavorText: 'The dead have stories to tell...'
  },
  {
    id: 'e67',
    title: 'Ally in Darkness',
    description: 'A mysterious figure aids you, then vanishes.',
    effectType: 'health',
    value: 2,
    secondaryEffect: { type: 'insight', value: 1 },
    flavorText: 'You are not alone in this fight...'
  },
  {
    id: 'e68',
    title: 'Sacrificial Energy',
    description: 'The residue of a dark ritual can be turned to your advantage.',
    effectType: 'insight',
    value: 3,
    secondaryEffect: { type: 'sanity', value: -1 },
    flavorText: 'Power has no morality...'
  },
  {
    id: 'e69',
    title: 'Desperate Measures',
    description: 'You push yourself beyond your limits.',
    effectType: 'health',
    value: -1,
    secondaryEffect: { type: 'doom', value: 1 },
    flavorText: 'Pain is temporary. Victory is eternal.'
  },
  {
    id: 'e70',
    title: 'Ancient Guardian',
    description: 'An old ward activates, driving back the darkness briefly.',
    effectType: 'doom',
    value: 1,
    secondaryEffect: { type: 'sanity', value: 1 },
    flavorText: 'The old defenses still hold...'
  }
];

// ============================================================================
// NPC SYSTEM - Random Encounters with Non-Player Characters
// ============================================================================
// NPCs can be friendly, neutral, or suspicious
// They provide dialogue, items, services, or plot hints

export type NPCType =
  | 'civilian'           // Regular person - scared but helpful
  | 'child'              // Vulnerable - bonus sanity if helped
  | 'elderly'            // Old person - may have wisdom/items
  | 'merchant'           // Sells items for gold
  | 'wounded'            // Needs medical attention
  | 'scholar'            // Provides insight/clues
  | 'cultist_defector'   // Former cultist - valuable info
  | 'police_officer'     // May help or hinder
  | 'journalist'         // Seeking the same truth
  | 'priest'             // Holy person - helps with sanity
  | 'mad_prophet'        // Crazy but speaks truth
  | 'mysterious_stranger'; // Cryptic help

export type NPCDisposition = 'friendly' | 'neutral' | 'suspicious' | 'hostile' | 'terrified';

export interface NPCDialogue {
  greeting: string;
  farewell: string;
  help?: string;        // When offering help
  refuse?: string;      // When declining help
  trade?: string;       // When trading
  hint?: string;        // Gives plot hint
  scared?: string;      // When frightened
}

export interface NPC {
  id: string;
  name: string;
  type: NPCType;
  disposition: NPCDisposition;
  description: string;
  portrait?: string;    // Visual identifier

  // Dialogue trees
  dialogues: NPCDialogue;

  // Services
  canHeal?: boolean;
  healAmount?: number;
  healCost?: number;    // Gold cost
  canTrade?: boolean;
  tradeItems?: string[]; // Item IDs for sale
  canProvideClue?: boolean;
  insightReward?: number;

  // Effects on players
  sanityEffect?: number;  // Positive if comforting, negative if disturbing
  goldReward?: number;
  itemReward?: string;    // Item ID given

  // Spawn conditions
  spawnWeight: number;    // Relative spawn chance
  minDoom?: number;       // Only spawn when doom >= this
  maxDoom?: number;       // Only spawn when doom <= this
  preferredTileTypes?: string[];  // Tile categories where likely to spawn
}

export const NPCS: NPC[] = [
  // ===== CIVILIANS =====
  {
    id: 'npc_civilian_01',
    name: 'Frightened Woman',
    type: 'civilian',
    disposition: 'terrified',
    description: 'A woman in a torn nightgown, eyes wide with terror. She clutches a kitchen knife.',
    dialogues: {
      greeting: '"Thank God! Another person! I thought I was the only one left alive!"',
      farewell: '"Please... be careful. They\'re everywhere."',
      help: '"I found this in the basement. Take it. I don\'t want to go back down there."',
      scared: '"Did you hear that?! Something\'s coming! We have to hide!"',
      hint: '"The cellar... there\'s something in the cellar. I heard them chanting down there."'
    },
    itemReward: 'bandages',
    sanityEffect: 1,
    spawnWeight: 20,
    preferredTileTypes: ['room', 'corridor']
  },
  {
    id: 'npc_civilian_02',
    name: 'Shell-Shocked Man',
    type: 'civilian',
    disposition: 'neutral',
    description: 'A middle-aged man staring at nothing. He barely acknowledges your presence.',
    dialogues: {
      greeting: '"Hm? Oh. You\'re real. I think. Are you real?"',
      farewell: '"It doesn\'t matter. Nothing matters anymore."',
      help: '"Here. Take these matches. The darkness... the darkness is the worst part."',
      scared: '"*quietly* They can\'t see you if you don\'t move. That\'s what I tell myself."',
      hint: '"I used to work here, you know. Before. The locked room on the third floor... that\'s where it started."'
    },
    itemReward: 'flash',
    spawnWeight: 15,
    preferredTileTypes: ['room', 'foyer']
  },

  // ===== CHILDREN =====
  {
    id: 'npc_child_01',
    name: 'Lost Child',
    type: 'child',
    disposition: 'terrified',
    description: 'A small boy, maybe seven years old, hiding under a table. Tear tracks stain his dirty face.',
    dialogues: {
      greeting: '"*sniff* Are you... are you a monster? The monsters took Mommy."',
      farewell: '"Please find Mommy. Please."',
      help: '"I found this in the garden. Mommy said it was special."',
      scared: '"*whimpering* I want to go home. I want my Mommy."',
      hint: '"The man in the black robe... he smiled when he took her. He had too many teeth."'
    },
    sanityEffect: 2, // Protecting a child gives hope
    insightReward: 1,
    spawnWeight: 10,
    preferredTileTypes: ['room', 'basement']
  },
  {
    id: 'npc_child_02',
    name: 'Strange Girl',
    type: 'child',
    disposition: 'neutral',
    description: 'A pale girl in an old-fashioned dress. She hums a tuneless melody.',
    dialogues: {
      greeting: '"Hello. The shadows told me you were coming."',
      farewell: '"Goodbye. I hope you don\'t scream too loud when they find you."',
      help: '"Here. My imaginary friend said to give you this. He\'s not imaginary, but Mommy doesn\'t believe me."',
      hint: '"The key is where the dead man sleeps. But don\'t wake him. He gets angry when he wakes up."'
    },
    sanityEffect: -1, // Disturbing child
    insightReward: 2,
    spawnWeight: 5,
    maxDoom: 5
  },

  // ===== ELDERLY =====
  {
    id: 'npc_elderly_01',
    name: 'Old Librarian',
    type: 'elderly',
    disposition: 'friendly',
    description: 'An ancient woman with thick spectacles, surrounded by stacks of books.',
    dialogues: {
      greeting: '"Ah, a seeker of knowledge! Be careful what you find, young one."',
      farewell: '"Remember: the answers you seek may destroy you."',
      help: '"Take this book. It contains... protection. Of a sort."',
      hint: '"I\'ve read things. Terrible things. The truth is in the restricted section. But the truth comes at a cost."'
    },
    insightReward: 2,
    itemReward: 'protective_ward',
    spawnWeight: 8,
    preferredTileTypes: ['room']
  },
  {
    id: 'npc_elderly_02',
    name: 'Grizzled Fisherman',
    type: 'elderly',
    disposition: 'suspicious',
    description: 'An old man who smells of salt and fish. His eyes are strangely large.',
    dialogues: {
      greeting: '"*stares* You ain\'t from \'round here. That\'s good. Don\'t stay long."',
      farewell: '"Stay away from the water, stranger. Trust me on that."',
      help: '"Take this. My father gave it to me. Said it keeps the Deep Ones away. Maybe it works, maybe it don\'t."',
      hint: '"The Marsh family... they made a deal, years back. Their blood ain\'t fully human no more."'
    },
    sanityEffect: -1,
    insightReward: 1,
    itemReward: 'lucky_charm',
    spawnWeight: 6,
    preferredTileTypes: ['urban', 'street']
  },

  // ===== MERCHANTS =====
  {
    id: 'npc_merchant_01',
    name: 'Black Market Dealer',
    type: 'merchant',
    disposition: 'neutral',
    description: 'A thin man in a long coat, his pockets bulging with mysterious items.',
    dialogues: {
      greeting: '"Psst. You look like someone who needs... special supplies. I can help. For a price."',
      farewell: '"Pleasure doing business. Don\'t tell anyone where you got that."',
      trade: '"I\'ve got weapons, medicine, and things the law don\'t want you to have. Interested?"',
      refuse: '"Suit yourself. But when you\'re dying in the dark, you\'ll wish you\'d bought that flashlight."'
    },
    canTrade: true,
    tradeItems: ['revolver', 'shotgun', 'med', 'flash', 'lockpick'],
    spawnWeight: 12,
    preferredTileTypes: ['street', 'urban']
  },
  {
    id: 'npc_merchant_02',
    name: 'Occult Shop Owner',
    type: 'merchant',
    disposition: 'friendly',
    description: 'A mysterious figure behind a counter covered in arcane symbols and strange artifacts.',
    dialogues: {
      greeting: '"Welcome, seeker. I sense darkness around you. Perhaps I can provide... illumination."',
      farewell: '"May the Elder Signs protect you. You\'re going to need it."',
      trade: '"My wares are not for the faint of heart. But I suspect you are beyond such concerns."',
      hint: '"The items I sell are old. Older than this town. They remember the time before, when THEY walked freely."'
    },
    canTrade: true,
    tradeItems: ['elder_sign', 'protective_ward', 'ritual_candles', 'holy_water', 'book'],
    spawnWeight: 8,
    preferredTileTypes: ['room', 'urban']
  },
  {
    id: 'npc_merchant_03',
    name: 'Traveling Medicine Man',
    type: 'merchant',
    disposition: 'friendly',
    description: 'An old man with a cart full of bottles, tinctures, and remedies.',
    dialogues: {
      greeting: '"Remedies! Cures! Tonics for what ails you! Step right up!"',
      farewell: '"Stay healthy out there. In body AND mind."',
      trade: '"I\'ve got medicine for wounds, medicine for the nerves, medicine for things you can\'t even name!"',
      help: '"You look rough. Here, first one\'s free. Can\'t have customers dying before they buy."'
    },
    canTrade: true,
    canHeal: true,
    healAmount: 2,
    healCost: 20,
    tradeItems: ['med', 'bandages', 'whiskey', 'sedatives', 'smelling_salts', 'morphine'],
    spawnWeight: 10,
    preferredTileTypes: ['street', 'urban', 'foyer']
  },

  // ===== SCHOLARS =====
  {
    id: 'npc_scholar_01',
    name: 'Miskatonic Professor',
    type: 'scholar',
    disposition: 'friendly',
    description: 'A disheveled academic clutching a leather satchel full of notes.',
    dialogues: {
      greeting: '"Finally! Someone rational! I\'ve been documenting everything. The scientific community must know!"',
      farewell: '"If I don\'t survive, get my notes to Miskatonic University. The world must be warned."',
      help: '"My research has led me to certain... conclusions. Take these notes. They may save your life."',
      hint: '"The geometry of this place is non-Euclidean. I\'ve calculated the dimensional weak points. There\'s one in the basement."'
    },
    insightReward: 3,
    canProvideClue: true,
    spawnWeight: 8,
    preferredTileTypes: ['room']
  },

  // ===== CULTIST DEFECTORS =====
  {
    id: 'npc_defector_01',
    name: 'Repentant Cultist',
    type: 'cultist_defector',
    disposition: 'friendly',
    description: 'A figure in torn robes, the symbols on their skin fresh and raw from scratching.',
    dialogues: {
      greeting: '"Please... I didn\'t know. They told me it was just a philosophy group. I didn\'t know what they really worshipped."',
      farewell: '"Kill them all if you can. Before they complete the ritual."',
      help: '"Take my robe. It will let you blend in... for a while. They\'ll smell your humanity eventually."',
      hint: '"The ritual requires three components: the blood of the innocent, the tears of the faithful, and the name of the Dreamer. They have two already."'
    },
    insightReward: 4,
    itemReward: 'cultist_robes',
    sanityEffect: -1,
    spawnWeight: 5,
    maxDoom: 6,
    preferredTileTypes: ['crypt', 'basement']
  },

  // ===== RELIGIOUS =====
  {
    id: 'npc_priest_01',
    name: 'Father O\'Malley',
    type: 'priest',
    disposition: 'friendly',
    description: 'A Catholic priest clutching a rosary, his knuckles white from gripping it so tight.',
    dialogues: {
      greeting: '"In nomine Patris... Oh thank God. A living soul. The Lord has not forsaken us entirely."',
      farewell: '"Go with God, my child. I fear He is all we have left."',
      help: '"Take this holy water. It won\'t stop them, but it will slow them. And pray. Pray like your soul depends on it."',
      hint: '"I performed last rites for a man who... came back. He spoke of cities under the sea. Gods older than Scripture. I think... I think our faith may be younger than the things we fight."'
    },
    sanityEffect: 2,
    itemReward: 'holy_water',
    canHeal: true,
    healAmount: 0, // Heals sanity, not HP
    spawnWeight: 7,
    preferredTileTypes: ['room', 'facade']
  },

  // ===== MAD PROPHETS =====
  {
    id: 'npc_prophet_01',
    name: 'The Rambling Man',
    type: 'mad_prophet',
    disposition: 'neutral',
    description: 'A wild-eyed man covered in symbols drawn in what might be blood. He mutters constantly.',
    dialogues: {
      greeting: '"They speak! Can you hear them? The stars SING and the void DANCES! *cackling laughter*"',
      farewell: '"Go go go run run run they see you NOW hahahaha!"',
      hint: '"The Black Goat has a thousand young! One thousand! And she knows your NAME! *whispers* The key is under the dead tree. The key opens the gate. But don\'t open the gate. Don\'t don\'t don\'t..."',
      scared: '"*screaming* THE ANGLES ARE WRONG THE ANGLES ARE WRONG THEY\'RE COMING THROUGH THE ANGLES!"'
    },
    insightReward: 3,
    sanityEffect: -2,
    spawnWeight: 4,
    maxDoom: 4,
    preferredTileTypes: ['crypt', 'basement', 'corridor']
  },

  // ===== MYSTERIOUS =====
  {
    id: 'npc_stranger_01',
    name: 'The Man in Black',
    type: 'mysterious_stranger',
    disposition: 'neutral',
    description: 'A tall figure in an impeccable black suit. His smile never quite reaches his eyes.',
    dialogues: {
      greeting: '"We meet at last. I\'ve been watching your progress with great interest."',
      farewell: '"Until next time. And there WILL be a next time. There always is."',
      help: '"A gift. No strings attached. Well... no strings you could see."',
      hint: '"The ones you fight are merely servants. The true enemy? You couldn\'t comprehend it. I can barely comprehend it, and I\'ve been doing this for... longer than you\'d believe."'
    },
    insightReward: 5,
    itemReward: 'elder_sign',
    sanityEffect: -1,
    spawnWeight: 2,
    maxDoom: 3,
    preferredTileTypes: ['crypt', 'corridor']
  }
];

// ============================================================================
// NPC SPAWN SYSTEM
// ============================================================================

/**
 * Get weighted random NPC for spawning
 * Considers doom level and tile type
 */
export function getRandomNPC(currentDoom: number, tileType?: string): NPC | null {
  const eligibleNPCs = NPCS.filter(npc => {
    // Check doom constraints
    if (npc.minDoom !== undefined && currentDoom < npc.minDoom) return false;
    if (npc.maxDoom !== undefined && currentDoom > npc.maxDoom) return false;

    // Check tile type preference (optional)
    if (tileType && npc.preferredTileTypes) {
      // NPCs with matching tile type get priority, but can still spawn elsewhere
    }

    return true;
  });

  if (eligibleNPCs.length === 0) return null;

  // Calculate total weight
  let totalWeight = eligibleNPCs.reduce((sum, npc) => {
    let weight = npc.spawnWeight;
    // Bonus weight if tile type matches preference
    if (tileType && npc.preferredTileTypes?.includes(tileType)) {
      weight *= 2;
    }
    return sum + weight;
  }, 0);

  // Random selection
  let random = Math.random() * totalWeight;
  for (const npc of eligibleNPCs) {
    let weight = npc.spawnWeight;
    if (tileType && npc.preferredTileTypes?.includes(tileType)) {
      weight *= 2;
    }
    random -= weight;
    if (random <= 0) {
      return npc;
    }
  }

  return eligibleNPCs[0];
}

/**
 * Get NPCs that can provide services (healing, trading)
 */
export function getServiceNPCs(): NPC[] {
  return NPCS.filter(npc => npc.canHeal || npc.canTrade);
}

/**
 * Get NPCs by type
 */
export function getNPCsByType(type: NPCType): NPC[] {
  return NPCS.filter(npc => npc.type === type);
}

export const MADNESS_CONDITIONS: Madness[] = [
  { 
    id: 'm1', type: 'hallucination', name: 'Hallucinations', 
    description: 'You see things that are not there.',
    mechanicalEffect: '25% chance to see false enemies. Must use action to "attack" them.',
    visualClass: 'madness-hallucination', audioEffect: 'whispers'
  },
  { 
    id: 'm2', type: 'paranoia', name: 'Paranoia', 
    description: 'Trust no one. They are all watching.',
    mechanicalEffect: 'Cannot share tile with allies. -1 on all rolls when others are near.',
    visualClass: 'madness-paranoia', audioEffect: 'heartbeat'
  },
  { 
    id: 'm3', type: 'hysteria', name: 'Hysteria', 
    description: 'Your mind fractures into chaos.',
    mechanicalEffect: '50% chance to lose 1 AP to uncontrolled action each round.',
    visualClass: 'madness-hysteria', audioEffect: 'laughter'
  },
  { 
    id: 'm4', type: 'catatonia', name: 'Catatonia', 
    description: 'You freeze, unable to move.',
    mechanicalEffect: '-1 AP per turn. Cannot use Flee action.',
    visualClass: 'madness-catatonia', audioEffect: 'silence'
  },
  { 
    id: 'm5', type: 'obsession', name: 'Obsession', 
    description: 'You must know everything about this place.',
    mechanicalEffect: 'Cannot leave room until all elements are investigated.',
    visualClass: 'madness-obsession', audioEffect: 'ticking'
  },
  { 
    id: 'm6', type: 'amnesia', name: 'Amnesia', 
    description: 'Where am I? What is this place?',
    mechanicalEffect: 'Fog of War resets each round. Cannot see previously explored tiles.',
    visualClass: 'madness-amnesia', audioEffect: 'static'
  },
  { 
    id: 'm7', type: 'night_terrors', name: 'Night Terrors', 
    description: 'Sleep brings only horrors.',
    mechanicalEffect: 'Cannot use Rest action. Sleep events cause -1 Sanity.',
    visualClass: 'madness-night-terrors', audioEffect: 'screams'
  },
  { 
    id: 'm8', type: 'dark_insight', name: 'Dark Insight', 
    description: 'You see the truth behind the veil.',
    mechanicalEffect: '+2 Insight permanent. But Doom decreases 1 extra per round.',
    visualClass: 'madness-dark-insight', audioEffect: 'cosmic'
  }
];

// Obstacles from the Game Design Bible
export const OBSTACLES: Record<ObstacleType, Obstacle> = {
  rubble_light: { type: 'rubble_light', blocking: false, removable: true, apCost: 1, effect: '+1 AP to cross' },
  rubble_heavy: { type: 'rubble_heavy', blocking: true, removable: true, skillRequired: 'strength', dc: 4, apCost: 2 },
  collapsed: { type: 'collapsed', blocking: true, removable: false, effect: 'Permanently blocked' },
  fire: { type: 'fire', blocking: false, removable: true, damage: 1, itemRequired: 'extinguisher', effect: '1 HP damage on pass' },
  water_shallow: { type: 'water_shallow', blocking: false, removable: false, apCost: 1, effect: 'May hide items' },
  water_deep: { type: 'water_deep', blocking: false, removable: false, skillRequired: 'agility', dc: 4, effect: 'Must swim' },
  unstable_floor: { type: 'unstable_floor', blocking: false, removable: false, effect: '1d6: 1-2 = fall (2 HP damage)' },
  gas_poison: { type: 'gas_poison', blocking: false, removable: true, itemRequired: 'gas_mask', damage: 1, effect: '-1 HP per round in area' },
  darkness: { type: 'darkness', blocking: false, removable: true, skillRequired: 'willpower', dc: 4, itemRequired: 'light_source', effect: '-2 all rolls' },
  ward_circle: { type: 'ward_circle', blocking: false, removable: true, skillRequired: 'willpower', dc: 5, damage: 1, effect: 'Sanity -1 to cross without removing' },
  spirit_barrier: { type: 'spirit_barrier', blocking: true, removable: true, itemRequired: 'banish_ritual', damage: 1, effect: 'Sanity -1 per attempt to pass' },
  spatial_warp: { type: 'spatial_warp', blocking: false, removable: true, effect: 'Doors lead to wrong places. Solve puzzle to fix.' },
  time_loop: { type: 'time_loop', blocking: false, removable: true, effect: 'Tile resets when you leave. Must break sequence.' }
};

// Monster spawn configuration
export interface SpawnConfig {
  type: EnemyType;
  weight: number;
  minDoom: number;
  maxDoom: number;
}

// Base spawn chances by tile category
export const SPAWN_CHANCES: Record<string, number> = {
  nature: 0.25,
  urban: 0.15,
  street: 0.20,
  facade: 0.10,
  foyer: 0.15,
  corridor: 0.30,
  room: 0.25,
  stairs: 0.20,
  basement: 0.35,
  crypt: 0.45,
  default: 0.20
};

// Monster movement speeds
export const MONSTER_SPEEDS: Partial<Record<EnemyType, number>> = {
  hound: 2,
  byakhee: 2,
  hunting_horror: 2,
  shoggoth: 1, // Actually slow, but massive
  formless_spawn: 1,
  cultist: 1,
  ghoul: 1,
  deepone: 1
};

// Combat difficulty modifiers by doom level
export const DOOM_COMBAT_MODIFIERS = {
  high: { doomMin: 10, enemyDamageBonus: 0, playerDiceBonus: 0 },
  medium: { doomMin: 5, enemyDamageBonus: 1, playerDiceBonus: 0 },
  low: { doomMin: 0, enemyDamageBonus: 2, playerDiceBonus: -1 }
};

// Get combat modifier based on current doom
export function getCombatModifier(doom: number) {
  if (doom >= 10) return DOOM_COMBAT_MODIFIERS.high;
  if (doom >= 5) return DOOM_COMBAT_MODIFIERS.medium;
  return DOOM_COMBAT_MODIFIERS.low;
}

// ============================================================================
// WEATHER SYSTEM - "The Whispering Elements"
// ============================================================================

/**
 * Weather effects definition
 * Each weather type has visual and gameplay impact
 */
export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect> = {
  // Clear weather - no effects
  clear: {
    type: 'clear',
    name: 'Clear',
    description: 'The night is still. Stars glimmer coldly overhead.',
    visualClass: 'weather-clear',
    visionReduction: 0,
    agilityPenalty: 0,
    movementCost: 0,
    horrorChance: 0,
    sanityDrain: 0,
    hidesEnemies: false,
    blocksRanged: false,
    opacity: 0,
    particleCount: 0,
    animationSpeed: 'slow'
  },

  // Fog - reduces vision and hides enemies
  fog: {
    type: 'fog',
    name: 'Arkham Fog',
    description: 'A thick, unnatural fog rolls in from the harbor. Shapes move within it that should not exist.',
    visualClass: 'weather-fog',
    visionReduction: 1,       // Reduce vision range by 1
    agilityPenalty: 0,
    movementCost: 0,
    horrorChance: 10,         // 10% chance of minor horror when moving
    sanityDrain: 0,
    hidesEnemies: true,       // Enemies at range 2+ are hidden
    blocksRanged: true,       // Cannot use ranged weapons at range 3+
    opacity: 0.4,
    particleCount: 30,
    animationSpeed: 'slow'
  },

  // Rain - makes Agility checks harder
  rain: {
    type: 'rain',
    name: 'Cold Rain',
    description: 'Icy rain lashes down from a sky the color of old bruises. The cobblestones become treacherous.',
    visualClass: 'weather-rain',
    visionReduction: 0,
    agilityPenalty: 1,        // -1 die on Agility checks
    movementCost: 0,
    horrorChance: 0,
    sanityDrain: 0,
    hidesEnemies: false,
    blocksRanged: false,
    opacity: 0.3,
    particleCount: 100,
    animationSpeed: 'fast'
  },

  // Miasma - supernatural fog that drains sanity
  miasma: {
    type: 'miasma',
    name: 'Eldritch Miasma',
    description: 'A sickly green-purple haze seeps from the ground. It whispers secrets that erode the mind.',
    visualClass: 'weather-miasma',
    visionReduction: 1,
    agilityPenalty: 0,
    movementCost: 0,
    horrorChance: 25,         // 25% chance of horror when moving through
    sanityDrain: 1,           // Lose 1 sanity per round in miasma
    hidesEnemies: true,
    blocksRanged: true,
    opacity: 0.5,
    particleCount: 50,
    animationSpeed: 'medium'
  },

  // Cosmic Static - reality distortion
  cosmic_static: {
    type: 'cosmic_static',
    name: 'Cosmic Static',
    description: 'Reality tears at the seams. Stars that should not exist flicker through gaps in the sky.',
    visualClass: 'weather-cosmic-static',
    visionReduction: 0,
    agilityPenalty: 1,        // -1 die on Agility (reality warps)
    movementCost: 1,          // +1 AP to move (space distorts)
    horrorChance: 15,
    sanityDrain: 1,
    hidesEnemies: false,
    blocksRanged: false,      // But ranged attacks may miss
    opacity: 0.35,
    particleCount: 80,
    animationSpeed: 'medium'
  },

  // Unnatural Glow - eldritch illumination that affects enemy behavior
  unnatural_glow: {
    type: 'unnatural_glow',
    name: 'Unnatural Glow',
    description: 'A sickly phosphorescence emanates from unseen sources. Colors shift wrong. Shadows move against the light.',
    visualClass: 'weather-unnatural-glow',
    visionReduction: -1,      // Actually increases vision (things glow)
    agilityPenalty: 0,
    movementCost: 0,
    horrorChance: 20,         // 20% horror chance - the light reveals too much
    sanityDrain: 0,
    hidesEnemies: false,      // Enemies are MORE visible
    blocksRanged: false,
    opacity: 0.4,
    particleCount: 40,
    animationSpeed: 'slow'
  },

  // Darkness - oppressive, unnatural darkness
  darkness: {
    type: 'darkness',
    name: 'Consuming Darkness',
    description: 'A darkness that devours light itself. Your lantern flickers weakly, revealing only shadows within shadows.',
    visualClass: 'weather-darkness',
    visionReduction: 2,       // Severely reduced vision
    agilityPenalty: 1,        // Hard to move in darkness
    movementCost: 0,
    horrorChance: 15,
    sanityDrain: 0,
    hidesEnemies: true,       // Enemies hidden until adjacent
    blocksRanged: true,       // Cannot see targets at range
    opacity: 0.7,
    particleCount: 20,
    animationSpeed: 'slow'
  }
};

/**
 * Get weather effect by type
 */
export function getWeatherEffect(type: WeatherType): WeatherEffect {
  return WEATHER_EFFECTS[type] || WEATHER_EFFECTS.clear;
}

/**
 * Get weather intensity modifier
 * Multiplies effects based on intensity
 */
export function getIntensityModifier(intensity: WeatherIntensity): number {
  switch (intensity) {
    case 'light': return 0.5;
    case 'moderate': return 1.0;
    case 'heavy': return 1.5;
    default: return 1.0;
  }
}

/**
 * Calculate effective vision range with weather
 */
export function calculateWeatherVision(baseVision: number, weather: WeatherCondition | null): number {
  if (!weather || weather.type === 'clear') return baseVision;

  const effect = getWeatherEffect(weather.type);
  const modifier = getIntensityModifier(weather.intensity);
  const reduction = Math.floor(effect.visionReduction * modifier);

  return Math.max(1, baseVision - reduction);
}

/**
 * Calculate Agility penalty from weather
 */
export function calculateWeatherAgilityPenalty(weather: WeatherCondition | null): number {
  if (!weather || weather.type === 'clear') return 0;

  const effect = getWeatherEffect(weather.type);
  const modifier = getIntensityModifier(weather.intensity);

  return Math.floor(effect.agilityPenalty * modifier);
}

/**
 * Check if weather blocks ranged attacks
 */
export function weatherBlocksRanged(weather: WeatherCondition | null, distance: number): boolean {
  if (!weather || weather.type === 'clear') return false;

  const effect = getWeatherEffect(weather.type);
  // Ranged attacks blocked at distance 3+ in bad weather
  return effect.blocksRanged && distance >= 3;
}

/**
 * Check if weather hides enemies at distance
 */
export function weatherHidesEnemy(weather: WeatherCondition | null, distance: number): boolean {
  if (!weather || weather.type === 'clear') return false;

  const effect = getWeatherEffect(weather.type);
  // Enemies hidden at distance 2+ in obscuring weather
  return effect.hidesEnemies && distance >= 2;
}

/**
 * Roll for weather-induced horror check
 * @returns true if horror check should be triggered
 */
export function rollWeatherHorror(weather: WeatherCondition | null): boolean {
  if (!weather || weather.type === 'clear') return false;

  const effect = getWeatherEffect(weather.type);
  const modifier = getIntensityModifier(weather.intensity);
  const chance = effect.horrorChance * modifier;

  return Math.random() * 100 < chance;
}

/**
 * Weather doom events - weather can change based on doom
 * As doom decreases (situation worsens), weather becomes more supernatural
 */
export const WEATHER_DOOM_EVENTS: Record<number, WeatherType> = {
  10: 'fog',             // At doom 10, fog may roll in
  8: 'rain',             // At doom 8, cold rain begins
  6: 'darkness',         // At doom 6, unnatural darkness spreads
  4: 'miasma',           // At doom 4, miasma seeps through
  3: 'unnatural_glow',   // At doom 3, eldritch light appears
  2: 'cosmic_static'     // At doom 2, reality begins to tear
};

/**
 * Check if weather should change based on doom
 */
export function getWeatherForDoom(doom: number): WeatherType | null {
  // 25% chance to trigger weather at threshold
  const thresholds = Object.keys(WEATHER_DOOM_EVENTS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (doom <= threshold && Math.random() < 0.25) {
      return WEATHER_DOOM_EVENTS[threshold];
    }
  }

  return null;
}

// ============================================================================
// DARK ROOM SYSTEM - "What Lurks in the Shadows"
// ============================================================================

/**
 * Weighted discovery chances for dark rooms
 * Higher weight = more common
 */
export const DARK_ROOM_DISCOVERY_WEIGHTS: Record<DarkRoomDiscoveryType, number> = {
  nothing: 25,           // 25% - Most common, just darkness
  ambush: 15,            // 15% - Enemy waiting in darkness
  horror: 12,            // 12% - Something horrible
  cache: 10,             // 10% - Useful supplies
  corpse: 10,            // 10% - Body with items (and horror check)
  clue: 8,               // 8% - Investigation bonus
  treasure: 6,           // 6% - Valuable items
  trap: 5,               // 5% - Hidden trap
  nest: 4,               // 4% - Multiple weak enemies
  cultist_shrine: 3,     // 3% - Risky but rewarding
  survivor: 1,           // 1% - Rare helpful NPC
  ancient_secret: 1      // 1% - Very rare powerful discovery
};

/**
 * Tile names that are likely to be dark rooms
 * These are tiles that would naturally have no light
 */
export const DARK_ROOM_CANDIDATE_TILES: string[] = [
  // Basements and underground
  'Dark Cellar', 'Wine Cellar', 'Cold Storage', 'Flooded Basement',
  'Coal Chute', 'Root Cellar', 'Underground Vault', 'Sewer Access',
  'Maintenance Tunnel', 'Smugglers Cache',
  // Crypts and deep areas
  'Ancient Tomb', 'Ritual Chamber', 'Bone Pit', 'Forgotten Tomb',
  'Cultist Sanctum', 'Ancient Cavern', 'Star Chamber', 'The Pit',
  'Idol Chamber', 'The Black Pool', 'Sacrificial Chamber',
  // Dark corridors
  'Darkened Hallway', 'Servants Passage', 'Cell Block Corridor',
  // Other dark locations
  'Sealed Vault', 'Hidden Passage', 'Abandoned Mine', 'Storm Drain',
  'Collapsed Mine Entrance', 'Emergency Exit', 'Hidden Stairwell'
];

/**
 * Zone levels that have higher chance of dark rooms
 */
export const DARK_ROOM_ZONE_CHANCE: Record<number, number> = {
  2: 0.1,    // Upper floors: 10%
  1: 0.15,   // Ground floor: 15%
  0: 0.05,   // Exterior: 5%
  [-1]: 0.4, // Basement: 40%
  [-2]: 0.6  // Deep underground: 60%
};

/**
 * Items that can be found in dark room discoveries
 */
export const DARK_ROOM_LOOT_TABLES = {
  random_valuable: [
    { id: 'gold_coins', name: 'Gold Coins', type: 'relic' as const, effect: '+50 gold value', goldCost: 50, slotType: 'bag' as const },
    { id: 'silver_pendant', name: 'Silver Pendant', type: 'relic' as const, effect: '+1 Willpower checks', bonus: 1, goldCost: 75, slotType: 'bag' as const },
    { id: 'antique_watch', name: 'Antique Watch', type: 'relic' as const, effect: 'Valuable collector item', goldCost: 100, slotType: 'bag' as const }
  ],
  random_supplies: [
    { id: 'bandage', name: 'Bandage', type: 'consumable' as const, effect: 'Heal 1 HP', bonus: 1, goldCost: 25, uses: 1, maxUses: 1, slotType: 'bag' as const },
    { id: 'flash', name: 'Flashlight', type: 'tool' as const, effect: 'Removes Darkness penalty', bonus: 1, goldCost: 50, isLightSource: true, slotType: 'hand' as const },
    { id: 'matches', name: 'Matches', type: 'consumable' as const, effect: 'Light source for 3 rounds', uses: 3, maxUses: 3, goldCost: 10, slotType: 'bag' as const },
    { id: 'first_aid', name: 'First Aid Kit', type: 'consumable' as const, effect: 'Heal 2 HP', bonus: 2, goldCost: 100, uses: 3, maxUses: 3, slotType: 'bag' as const }
  ],
  random_from_corpse: [
    { id: 'common_key', name: 'Rusty Key', type: 'key' as const, effect: 'Opens a nearby lock', keyId: 'common', goldCost: 0, slotType: 'bag' as const },
    { id: 'journal_page', name: 'Journal Page', type: 'clue' as const, effect: '+1 Insight', bonus: 1, goldCost: 0, slotType: 'bag' as const },
    { id: 'derringer', name: 'Derringer', type: 'weapon' as const, effect: '2 attack dice, range 2', attackDice: 2, weaponType: 'ranged' as const, range: 2, ammo: 2, goldCost: 100, slotType: 'hand' as const },
    { id: 'knife', name: 'Knife', type: 'weapon' as const, effect: '2 attack dice, silent', attackDice: 2, weaponType: 'melee' as const, ammo: -1, silent: true, goldCost: 50, slotType: 'hand' as const }
  ],
  rare_relic: [
    { id: 'elder_sign', name: 'Elder Sign', type: 'relic' as const, effect: 'Opens sealed doors, banishes spirits', goldCost: 750, slotType: 'bag' as const },
    { id: 'protective_ward', name: 'Protective Ward', type: 'relic' as const, effect: '+1 die on Horror checks', bonus: 1, goldCost: 300, slotType: 'bag' as const },
    { id: 'ancient_tome', name: 'Ancient Tome', type: 'relic' as const, effect: '+3 Insight, -1 Sanity on read', bonus: 3, goldCost: 400, slotType: 'bag' as const }
  ]
};

/**
 * Enemy types that can be found in dark room ambushes
 */
export const DARK_ROOM_AMBUSH_ENEMIES: Record<string, { enemies: EnemyType[], count: [number, number] }> = {
  ambush: { enemies: ['ghoul', 'cultist', 'deepone'], count: [1, 1] },
  nest: { enemies: ['cultist', 'mi-go'], count: [2, 3] }
};

/**
 * Randomly selects a discovery type based on weights
 */
export function rollDarkRoomDiscovery(): DarkRoomDiscoveryType {
  const totalWeight = Object.values(DARK_ROOM_DISCOVERY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  for (const [type, weight] of Object.entries(DARK_ROOM_DISCOVERY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) {
      return type as DarkRoomDiscoveryType;
    }
  }

  return 'nothing';
}

/**
 * Creates dark room content with randomized specifics
 */
export function generateDarkRoomContent(): DarkRoomContent {
  const discoveryType = rollDarkRoomDiscovery();
  const content = createDarkRoomContent(discoveryType);

  // Randomize specific items/enemies based on type
  if (content.items && content.items[0]?.startsWith('random_')) {
    const lootTable = content.items[0] as keyof typeof DARK_ROOM_LOOT_TABLES;
    const possibleItems = DARK_ROOM_LOOT_TABLES[lootTable];
    if (possibleItems) {
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      content.items = [randomItem.id];
    }
  }

  // Randomize enemy types for ambushes
  if (content.enemyTypes && (discoveryType === 'ambush' || discoveryType === 'nest')) {
    const config = DARK_ROOM_AMBUSH_ENEMIES[discoveryType];
    const randomEnemy = config.enemies[Math.floor(Math.random() * config.enemies.length)];
    content.enemyTypes = [randomEnemy];
    content.enemyCount = config.count[0] + Math.floor(Math.random() * (config.count[1] - config.count[0] + 1));
  }

  return content;
}

/**
 * Determines if a tile should be a dark room based on its properties
 */
export function shouldBeDarkRoom(tile: Tile): boolean {
  // Check if tile name is in candidate list
  if (DARK_ROOM_CANDIDATE_TILES.includes(tile.name)) {
    return true;
  }

  // Zone level based chance
  const zoneChance = DARK_ROOM_ZONE_CHANCE[tile.zoneLevel] || 0;
  if (Math.random() < zoneChance) {
    // Additional filters - some tiles shouldn't be dark
    const excludedCategories = ['facade', 'foyer', 'urban'];
    if (tile.category && excludedCategories.includes(tile.category)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Checks if a player can see the contents of a dark room
 * @param player - The player to check
 * @param tile - The tile to check
 * @returns boolean indicating if player can see dark room contents
 */
export function canSeeDarkRoomContents(player: Player, tile: Tile): boolean {
  // Not a dark room - always visible
  if (!tile.isDarkRoom) return true;

  // Already illuminated - always visible
  if (tile.darkRoomIlluminated) return true;

  // Player must be on the tile and have a light source
  const isOnTile = player.position.q === tile.q && player.position.r === tile.r;
  if (!isOnTile) return false;

  return hasLightSource(player.inventory);
}

/**
 * Gets the display state for a dark room tile
 */
export type DarkRoomDisplayState = 'hidden' | 'dark' | 'illuminated';

export function getDarkRoomDisplayState(tile: Tile, player: Player | null): DarkRoomDisplayState {
  if (!tile.isDarkRoom) return 'illuminated';
  if (tile.darkRoomIlluminated) return 'illuminated';

  if (player && canSeeDarkRoomContents(player, tile)) {
    return 'illuminated';
  }

  // Tile is visible but contents are dark
  if (tile.visibility === 'visible' || tile.visibility === 'revealed') {
    return 'dark';
  }

  return 'hidden';
}

/**
 * Gets the item object from a loot table by ID
 */
export function getDarkRoomItem(itemId: string): Item | null {
  for (const items of Object.values(DARK_ROOM_LOOT_TABLES)) {
    const found = items.find(item => item.id === itemId);
    if (found) return found as Item;
  }
  return null;
}

// ============================================================================
// LEVELING SYSTEM - MILESTONES, SURVIVOR TRAITS & CLASS BONUSES
// ============================================================================

/**
 * Automatic milestone bonuses granted at specific levels
 * These are given automatically - no player choice required
 */
export const MILESTONE_BONUSES: MilestoneBonus[] = [
  {
    level: 2,
    id: 'hardened',
    name: 'Hardened',
    description: '+1 die on first Horror Check each scenario',
    effect: { type: 'horror_die_bonus', value: 1 }
  },
  {
    level: 3,
    id: 'veterans_instinct',
    name: "Veteran's Instinct",
    description: '+1 Action Point on first round of each scenario',
    effect: { type: 'first_round_ap', value: 1 }
  },
  {
    level: 4,
    id: 'iron_will',
    name: 'Iron Will',
    description: 'May re-roll 1 die per round on skill checks',
    effect: { type: 'reroll_per_round', value: 1 }
  },
  {
    level: 5,
    id: 'legend',
    name: 'Legend',
    description: 'Start with +1 Insight, -1 to all DC requirements',
    effect: { type: 'insight_start', value: 1, dcReduction: 1 }
  }
];

/**
 * Survivor traits - rewards for permadeath heroes who survive multiple scenarios
 * Heroes choose ONE trait when they reach the requirement threshold
 */
export const SURVIVOR_TRAITS_TIER1: SurvivorTrait[] = [
  {
    id: 'scarred_survivor',
    name: 'Scarred Survivor',
    description: '+1 permanent Max HP, -1 Max Sanity',
    requirement: 3,
    effect: { type: 'bonus_hp', value: 1, sanityCost: 1 }
  },
  {
    id: 'paranoid_vigilance',
    name: 'Paranoid Vigilance',
    description: 'Cannot be surprised by enemies',
    requirement: 3,
    effect: { type: 'no_surprise' }
  },
  {
    id: 'deaths_defiance',
    name: "Death's Defiance",
    description: 'Once per scenario, survive lethal damage (set to 1 HP)',
    requirement: 3,
    effect: { type: 'death_defiance' }
  }
];

export const SURVIVOR_TRAITS_TIER2: SurvivorTrait[] = [
  {
    id: 'hardened_mind',
    name: 'Hardened Mind',
    description: 'Immune to one chosen Madness type',
    requirement: 6,
    effect: { type: 'madness_immunity', madnessType: 'choose' }
  },
  {
    id: 'battle_tested',
    name: 'Battle-Tested',
    description: '+1 permanent Attack Die',
    requirement: 6,
    effect: { type: 'bonus_attack_die', value: 1 }
  },
  {
    id: 'sixth_sense',
    name: 'Sixth Sense',
    description: 'Always detect secret doors in adjacent hexes',
    requirement: 6,
    effect: { type: 'detect_secret_doors' }
  }
];

/**
 * All survivor traits combined
 */
export const SURVIVOR_TRAITS: SurvivorTrait[] = [
  ...SURVIVOR_TRAITS_TIER1,
  ...SURVIVOR_TRAITS_TIER2
];

/**
 * Survivor streak multipliers for XP and Gold
 */
export const SURVIVOR_STREAK_BONUSES: Record<number, { xpMultiplier: number; goldMultiplier: number; title?: string }> = {
  3: { xpMultiplier: 1.05, goldMultiplier: 1.0 },
  5: { xpMultiplier: 1.10, goldMultiplier: 1.05 },
  7: { xpMultiplier: 1.15, goldMultiplier: 1.10 },
  10: { xpMultiplier: 1.25, goldMultiplier: 1.15, title: 'Immortal' }
};

/**
 * Get streak bonus for a given number of survived scenarios
 */
export function getSurvivorStreakBonus(scenariosSurvived: number): { xpMultiplier: number; goldMultiplier: number; title?: string } {
  if (scenariosSurvived >= 10) return SURVIVOR_STREAK_BONUSES[10];
  if (scenariosSurvived >= 7) return SURVIVOR_STREAK_BONUSES[7];
  if (scenariosSurvived >= 5) return SURVIVOR_STREAK_BONUSES[5];
  if (scenariosSurvived >= 3) return SURVIVOR_STREAK_BONUSES[3];
  return { xpMultiplier: 1.0, goldMultiplier: 1.0 };
}

/**
 * Class-specific level bonuses
 * Each class gets unique bonuses at levels 2, 3, and 5
 */
export const CLASS_LEVEL_BONUSES: ClassLevelBonus[] = [
  // DETECTIVE
  {
    characterClass: 'detective',
    level: 2,
    id: 'detective_sharp_eye',
    name: 'Sharp Eye',
    description: '+1 Insight when finding clues',
    effect: { type: 'extra_insight_per_clue', value: 1 }
  },
  {
    characterClass: 'detective',
    level: 3,
    id: 'detective_keen_intuition',
    name: 'Keen Intuition',
    description: 'Automatically detect traps in current hex',
    effect: { type: 'trap_detection' }
  },
  {
    characterClass: 'detective',
    level: 5,
    id: 'detective_master_investigator',
    name: 'Master Investigator',
    description: '+2 Insight when finding clues',
    effect: { type: 'extra_insight_per_clue', value: 2 }
  },

  // PROFESSOR
  {
    characterClass: 'professor',
    level: 2,
    id: 'professor_arcane_knowledge',
    name: 'Arcane Knowledge',
    description: '+1 to Horror resistance checks',
    effect: { type: 'horror_resistance', value: 1 }
  },
  {
    characterClass: 'professor',
    level: 3,
    id: 'professor_scholarly_mind',
    name: 'Scholarly Mind',
    description: '+2 to Horror resistance checks',
    effect: { type: 'horror_resistance', value: 2 }
  },
  {
    characterClass: 'professor',
    level: 5,
    id: 'professor_master_occultist',
    name: 'Master Occultist',
    description: 'Learn one additional spell',
    effect: { type: 'extra_spell_slot', value: 1 }
  },

  // OCCULTIST
  {
    characterClass: 'occultist',
    level: 2,
    id: 'occultist_dark_arts',
    name: 'Dark Arts',
    description: '+1 extra spell slot',
    effect: { type: 'extra_spell_slot', value: 1 }
  },
  {
    characterClass: 'occultist',
    level: 3,
    id: 'occultist_ritual_master',
    name: 'Ritual Master',
    description: '+1 Horror resistance from dark knowledge',
    effect: { type: 'horror_resistance', value: 1 }
  },
  {
    characterClass: 'occultist',
    level: 5,
    id: 'occultist_eldritch_power',
    name: 'Eldritch Power',
    description: '+2 extra spell slots',
    effect: { type: 'extra_spell_slot', value: 2 }
  },

  // VETERAN
  {
    characterClass: 'veteran',
    level: 2,
    id: 'veteran_combat_training',
    name: 'Combat Training',
    description: '+1 damage with melee weapons',
    effect: { type: 'bonus_melee_damage', value: 1 }
  },
  {
    characterClass: 'veteran',
    level: 3,
    id: 'veteran_marksman',
    name: 'Marksman',
    description: '+1 damage with ranged weapons',
    effect: { type: 'bonus_ranged_damage', value: 1 }
  },
  {
    characterClass: 'veteran',
    level: 5,
    id: 'veteran_war_hero',
    name: 'War Hero',
    description: '+2 damage with all weapons',
    effect: { type: 'bonus_melee_damage', value: 2 }
  },

  // JOURNALIST
  {
    characterClass: 'journalist',
    level: 2,
    id: 'journalist_street_smart',
    name: 'Street Smart',
    description: '+1 Insight when finding clues',
    effect: { type: 'extra_insight_per_clue', value: 1 }
  },
  {
    characterClass: 'journalist',
    level: 3,
    id: 'journalist_nimble',
    name: 'Nimble',
    description: '+1 stealth bonus (harder to detect)',
    effect: { type: 'stealth_bonus', value: 1 }
  },
  {
    characterClass: 'journalist',
    level: 5,
    id: 'journalist_scoop_master',
    name: 'Scoop Master',
    description: '+2 Insight when finding clues, +1 stealth',
    effect: { type: 'extra_insight_per_clue', value: 2 }
  },

  // NURSE
  {
    characterClass: 'doctor',
    level: 2,
    id: 'doctor_field_medic',
    name: 'Field Medic',
    description: '+1 HP when using healing items',
    effect: { type: 'healing_bonus', value: 1 }
  },
  {
    characterClass: 'doctor',
    level: 3,
    id: 'doctor_trauma_specialist',
    name: 'Trauma Specialist',
    description: '+2 HP when using healing items',
    effect: { type: 'healing_bonus', value: 2 }
  },
  {
    characterClass: 'doctor',
    level: 5,
    id: 'doctor_angel_of_mercy',
    name: 'Angel of Mercy',
    description: '+3 HP when healing, can restore 1 Sanity',
    effect: { type: 'healing_bonus', value: 3 }
  }
];

/**
 * Get class bonuses for a specific character class and level
 */
export function getClassBonusesForLevel(characterClass: CharacterType, level: number): ClassLevelBonus[] {
  return CLASS_LEVEL_BONUSES.filter(
    bonus => bonus.characterClass === characterClass && bonus.level <= level
  );
}

/**
 * Get milestone bonus for a specific level
 */
export function getMilestoneForLevel(level: number): MilestoneBonus | undefined {
  return MILESTONE_BONUSES.find(m => m.level === level);
}

/**
 * Get available survivor traits for a given streak count
 */
export function getAvailableSurvivorTraits(scenariosSurvived: number, alreadyChosen: string[]): SurvivorTrait[] {
  return SURVIVOR_TRAITS.filter(
    trait => trait.requirement <= scenariosSurvived && !alreadyChosen.includes(trait.id)
  );
}

/**
 * Automatic AP bonus based on level (level 3 = +1, level 5 = +2 total)
 */
export function getAutomaticAPBonus(level: number): number {
  if (level >= 5) return 2;
  if (level >= 3) return 1;
  return 0;
}

// ============================================================================
// QUICK WINS: RPG-LITE AND ROGUELITE SYSTEMS
// ============================================================================

// ============================================================================
// 1. SISTE ORD (DEATH PERKS)
// ============================================================================

export const DEATH_PERKS: DeathPerk[] = [
  {
    id: 'revenge',
    name: 'Hevn',
    description: '+1 skade mot fienden som drepte forrige helt',
    icon: '⚔️',
    effect: {
      type: 'damage_bonus',
      value: 1
    }
  },
  {
    id: 'inheritance',
    name: 'Arv',
    description: 'Behold 1 item fra forrige helt',
    icon: '🎁',
    effect: {
      type: 'item_inherit'
    }
  },
  {
    id: 'wisdom',
    name: 'Visdom',
    description: '+15 XP startbonus',
    icon: '📖',
    effect: {
      type: 'xp_bonus',
      value: 15
    }
  },
  {
    id: 'warnings',
    name: 'Advarsler',
    description: 'Start scenario med Doom +1',
    icon: '⚠️',
    effect: {
      type: 'doom_bonus',
      value: 1
    }
  }
];

/**
 * Get death perk by ID
 */
export function getDeathPerk(id: DeathPerkType): DeathPerk | undefined {
  return DEATH_PERKS.find(p => p.id === id);
}

// ============================================================================
// 2. VETERANMERKER (ACHIEVEMENT BADGES)
// ============================================================================

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  // SURVIVAL BADGES
  {
    id: 'survivor_bronze',
    name: 'Overlevende',
    description: 'Overlev 3 scenarios',
    icon: '🎖️',
    rarity: 'bronze',
    requirement: { type: 'scenarios_survived', count: 3, perHero: true },
    reward: { type: 'title', value: 'Overlevende' }
  },
  {
    id: 'survivor_silver',
    name: 'Hardhudet',
    description: 'Overlev 7 scenarios med samme helt',
    icon: '🛡️',
    rarity: 'silver',
    requirement: { type: 'scenarios_survived', count: 7, perHero: true },
    reward: { type: 'starting_bonus', value: 1 } // +1 starting HP
  },
  {
    id: 'survivor_gold',
    name: 'Udødelig',
    description: 'Overlev 15 scenarios med samme helt',
    icon: '👑',
    rarity: 'gold',
    requirement: { type: 'scenarios_survived', count: 15, perHero: true },
    reward: { type: 'title', value: 'Den Udødelige' }
  },

  // COMBAT BADGES
  {
    id: 'demonslayer_bronze',
    name: 'Monsterjeger',
    description: 'Drep 10 fiender totalt',
    icon: '💀',
    rarity: 'bronze',
    requirement: { type: 'enemies_killed', count: 10, perHero: false }
  },
  {
    id: 'demonslayer_silver',
    name: 'Demonslayer',
    description: 'Drep 5 bosser totalt',
    icon: '☠️',
    rarity: 'silver',
    requirement: { type: 'bosses_killed', count: 5, perHero: false },
    reward: { type: 'starting_bonus', value: 1 } // +1 damage vs bosses
  },
  {
    id: 'demonslayer_gold',
    name: 'Titanslayer',
    description: 'Drep 15 bosser totalt',
    icon: '🏆',
    rarity: 'gold',
    requirement: { type: 'bosses_killed', count: 15, perHero: false },
    reward: { type: 'title', value: 'Titanslayer' }
  },

  // SCHOLAR BADGES
  {
    id: 'scholar_bronze',
    name: 'Forsker',
    description: 'Finn 10 lore items totalt',
    icon: '📚',
    rarity: 'bronze',
    requirement: { type: 'lore_found', count: 10, perHero: false }
  },
  {
    id: 'scholar_silver',
    name: 'Arkivar',
    description: 'Finn 25 lore items totalt',
    icon: '🔮',
    rarity: 'silver',
    requirement: { type: 'lore_found', count: 25, perHero: false },
    reward: { type: 'starting_bonus', value: 2 } // +2 starting Insight
  },
  {
    id: 'scholar_gold',
    name: 'Vokter av Kunnskap',
    description: 'Finn 50 lore items totalt',
    icon: '✨',
    rarity: 'gold',
    requirement: { type: 'lore_found', count: 50, perHero: false },
    reward: { type: 'title', value: 'Vokter av Kunnskap' }
  },

  // DARING BADGES
  {
    id: 'escapist_bronze',
    name: 'Flyktning',
    description: 'Fullfør 3 scenarios med Doom under 3',
    icon: '🏃',
    rarity: 'bronze',
    requirement: { type: 'narrow_escapes', count: 3, perHero: false }
  },
  {
    id: 'wounded_bronze',
    name: 'Såret',
    description: 'Overlev et scenario med 1 HP',
    icon: '🩸',
    rarity: 'bronze',
    requirement: { type: 'low_hp_survival', count: 1, perHero: true }
  },
  {
    id: 'madness_survivor',
    name: 'Galskapsberørt',
    description: 'Overlev 3 scenarios mens du har en Madness',
    icon: '🌀',
    rarity: 'silver',
    requirement: { type: 'madness_survived', count: 3, perHero: true },
    reward: { type: 'starting_bonus', value: 1 } // +1 Willpower check vs Horror
  },

  // MASTERY BADGES
  {
    id: 'perfectionist',
    name: 'Perfeksjonist',
    description: 'Fullfør scenario uten at noen helter dør',
    icon: '⭐',
    rarity: 'silver',
    requirement: { type: 'perfect_scenario', count: 1, perHero: false }
  },
  {
    id: 'untouchable',
    name: 'Urørlig',
    description: 'Fullfør scenario uten å ta skade',
    icon: '💫',
    rarity: 'legendary',
    requirement: { type: 'no_damage_scenario', count: 1, perHero: true },
    reward: { type: 'title', value: 'Den Urørlige' }
  },

  // WEALTH BADGES
  {
    id: 'treasure_hunter',
    name: 'Skattejeger',
    description: 'Tjen 500 gold totalt',
    icon: '💰',
    rarity: 'bronze',
    requirement: { type: 'gold_earned', count: 500, perHero: false }
  },
  {
    id: 'millionaire',
    name: 'Rikmann',
    description: 'Tjen 2000 gold totalt',
    icon: '💎',
    rarity: 'gold',
    requirement: { type: 'gold_earned', count: 2000, perHero: false },
    reward: { type: 'starting_bonus', value: 50 } // +50 starting gold
  }
];

/**
 * Check if a badge requirement is met
 */
export function checkBadgeRequirement(
  badge: AchievementBadge,
  stats: {
    scenariosSurvived: number;
    bossesKilled: number;
    loreFound: number;
    narrowEscapes: number;
    lowHpSurvival: number;
    enemiesKilled: number;
    goldEarned: number;
    insightEarned: number;
    perfectScenarios: number;
    madnessSurvived: number;
    noDamageScenarios: number;
  }
): boolean {
  const { requirement } = badge;

  switch (requirement.type) {
    case 'scenarios_survived': return stats.scenariosSurvived >= requirement.count;
    case 'bosses_killed': return stats.bossesKilled >= requirement.count;
    case 'lore_found': return stats.loreFound >= requirement.count;
    case 'narrow_escapes': return stats.narrowEscapes >= requirement.count;
    case 'low_hp_survival': return stats.lowHpSurvival >= requirement.count;
    case 'enemies_killed': return stats.enemiesKilled >= requirement.count;
    case 'gold_earned': return stats.goldEarned >= requirement.count;
    case 'insight_earned': return stats.insightEarned >= requirement.count;
    case 'perfect_scenario': return stats.perfectScenarios >= requirement.count;
    case 'madness_survived': return stats.madnessSurvived >= requirement.count;
    case 'no_damage_scenario': return stats.noDamageScenarios >= requirement.count;
    default: return false;
  }
}

/**
 * Get all badges earned by a hero or globally
 */
export function getEarnedBadges(earnedBadgeIds: string[]): AchievementBadge[] {
  return ACHIEVEMENT_BADGES.filter(b => earnedBadgeIds.includes(b.id));
}

/**
 * Get badge progress as percentage
 */
export function getBadgeProgress(badge: AchievementBadge, currentCount: number): number {
  return Math.min(100, Math.round((currentCount / badge.requirement.count) * 100));
}

// ============================================================================
// 3. DESPERATE TILTAK (DESPERATE MEASURES)
// ============================================================================

export const DESPERATE_MEASURES: DesperateMeasure[] = [
  {
    id: 'adrenaline',
    name: 'Adrenalin',
    description: '+1 AP denne runden når HP = 1',
    triggerCondition: { type: 'low_hp', threshold: 1 },
    effect: { type: 'bonus_ap', value: 1, duration: 'round' }
  },
  {
    id: 'madness_strength',
    name: 'Galskaps Styrke',
    description: '+1 attack die når Sanity = 1, men auto-fail Willpower',
    triggerCondition: { type: 'low_sanity', threshold: 1 },
    effect: { type: 'bonus_attack', value: 1, duration: 'round' },
    drawback: { type: 'auto_fail_check', skillType: 'willpower' }
  },
  {
    id: 'survival_instinct',
    name: 'Overlevelsesinstinkt',
    description: '+1 defense die når HP <= 2',
    triggerCondition: { type: 'low_hp', threshold: 2 },
    effect: { type: 'bonus_defense', value: 1, duration: 'round' }
  },
  {
    id: 'desperate_focus',
    name: 'Desperat Fokus',
    description: '+2 attack dice når HP = 1 OG Sanity = 1',
    triggerCondition: { type: 'both', threshold: 1 },
    effect: { type: 'bonus_attack', value: 2, duration: 'round' }
  },
  {
    id: 'final_stand',
    name: 'Siste Kamp',
    description: '+1 damage på alle angrep når HP = 1',
    triggerCondition: { type: 'low_hp', threshold: 1 },
    effect: { type: 'bonus_damage', value: 1, duration: 'round' }
  }
];

/**
 * Check which desperate measures are active for a player
 */
export function getActiveDesperateMeasures(hp: number, sanity: number): DesperateMeasure[] {
  return DESPERATE_MEASURES.filter(measure => {
    const { triggerCondition } = measure;
    switch (triggerCondition.type) {
      case 'low_hp':
        return hp <= triggerCondition.threshold;
      case 'low_sanity':
        return sanity <= triggerCondition.threshold;
      case 'both':
        return hp <= triggerCondition.threshold && sanity <= triggerCondition.threshold;
      default:
        return false;
    }
  });
}

/**
 * Calculate total bonuses from desperate measures
 */
export function calculateDesperateBonuses(hp: number, sanity: number): {
  bonusAP: number;
  bonusAttackDice: number;
  bonusDefenseDice: number;
  bonusDamage: number;
  autoFailSkills: ('willpower' | 'strength' | 'agility' | 'intellect')[];
} {
  const activeMeasures = getActiveDesperateMeasures(hp, sanity);

  const result = {
    bonusAP: 0,
    bonusAttackDice: 0,
    bonusDefenseDice: 0,
    bonusDamage: 0,
    autoFailSkills: [] as ('willpower' | 'strength' | 'agility' | 'intellect')[]
  };

  for (const measure of activeMeasures) {
    switch (measure.effect.type) {
      case 'bonus_ap':
        result.bonusAP += measure.effect.value;
        break;
      case 'bonus_attack':
        result.bonusAttackDice += measure.effect.value;
        break;
      case 'bonus_defense':
        result.bonusDefenseDice += measure.effect.value;
        break;
      case 'bonus_damage':
        result.bonusDamage += measure.effect.value;
        break;
    }

    if (measure.drawback?.type === 'auto_fail_check') {
      result.autoFailSkills.push(measure.drawback.skillType as typeof result.autoFailSkills[0]);
    }
  }

  return result;
}

// ============================================================================
// 4. EXPANDED CRITS
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

/**
 * Get random critical bonus (player chooses from these)
 */
export function getRandomCriticalBonuses(count: number = 3): CriticalBonus[] {
  const shuffled = [...CRITICAL_BONUSES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CRITICAL_BONUSES.length));
}

/**
 * Get random critical penalty (auto-applied)
 */
export function getRandomCriticalPenalty(): CriticalPenalty {
  const index = Math.floor(Math.random() * CRITICAL_PENALTIES.length);
  return CRITICAL_PENALTIES[index];
}

// ============================================================================
// 5. ENKEL CRAFTING
// ============================================================================

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_first_aid',
    name: 'Førstehjelpsutstyr',
    description: 'Kombiner to bandasjer til et førstehjelpssett',
    ingredients: [
      { itemId: 'bandage', quantity: 2 }
    ],
    result: { itemId: 'first_aid_kit', quantity: 1 },
    apCost: 2
  },
  {
    id: 'craft_flaming_knife',
    name: 'Flammende Kniv',
    description: 'Kombiner kniv og fakkel for ekstra skade',
    ingredients: [
      { itemId: 'knife', quantity: 1 },
      { itemId: 'torch', quantity: 1 }
    ],
    result: { itemId: 'flaming_knife', quantity: 1 },
    apCost: 2
  },
  {
    id: 'craft_master_tools',
    name: 'Mestertyv-verktøy',
    description: 'Kombiner dirker og brekkjern for +2 på låsedirking',
    ingredients: [
      { itemId: 'lockpick_set', quantity: 1 },
      { itemId: 'crowbar', quantity: 1 }
    ],
    result: { itemId: 'master_thief_tools', quantity: 1 },
    apCost: 2
  },
  {
    id: 'craft_blessed_blade',
    name: 'Velsignet Blad',
    description: 'Kombiner hellig vann og kniv for +2 skade mot udøde',
    ingredients: [
      { itemId: 'holy_water', quantity: 1 },
      { itemId: 'knife', quantity: 1 }
    ],
    result: { itemId: 'blessed_blade', quantity: 1 },
    apCost: 2,
    skillCheck: { skill: 'willpower', dc: 4 }
  },
  {
    id: 'craft_spirit_lamp',
    name: 'Åndelanterne',
    description: 'Kombiner lommelykt og ritualslys for å se spøkelser',
    ingredients: [
      { itemId: 'flashlight', quantity: 1 },
      { itemId: 'ritual_candles', quantity: 1 }
    ],
    result: { itemId: 'spirit_lamp', quantity: 1 },
    apCost: 2,
    skillCheck: { skill: 'intellect', dc: 4 }
  },
  {
    id: 'craft_molotov',
    name: 'Molotov Cocktail',
    description: 'Kombiner whiskey og bandasje for brennende våpen',
    ingredients: [
      { itemId: 'old_whiskey', quantity: 1 },
      { itemId: 'bandage', quantity: 1 }
    ],
    result: { itemId: 'molotov', quantity: 1 },
    apCost: 1
  },
  {
    id: 'craft_reinforced_vest',
    name: 'Forsterket Vest',
    description: 'Forbedre lærjakke med ekstra beskyttelse',
    ingredients: [
      { itemId: 'leather_jacket', quantity: 1 },
      { itemId: 'chain_mail_vest', quantity: 1 }
    ],
    result: { itemId: 'reinforced_vest', quantity: 1 },
    apCost: 3
  },
  {
    id: 'craft_eldritch_torch',
    name: 'Eldgammel Fakkel',
    description: 'Kombiner fakkel og ritualslys for mystisk lys',
    ingredients: [
      { itemId: 'torch', quantity: 1 },
      { itemId: 'ritual_candles', quantity: 1 }
    ],
    result: { itemId: 'eldritch_torch', quantity: 1 },
    apCost: 2,
    skillCheck: { skill: 'willpower', dc: 3 }
  }
];

// Crafted items that need to be added to ITEMS array
export const CRAFTED_ITEMS: Item[] = [
  {
    id: 'flaming_knife',
    name: 'Flammende Kniv',
    type: 'weapon',
    effect: '3 Attack Dice, Light Source, +1 vs creatures',
    attackDice: 3,
    weaponType: 'melee',
    ammo: -1,
    isLightSource: true,
    goldCost: 0, // Cannot be bought
    description: 'En kniv med flammer langs bladet. Gir lys og ekstra skade.'
  },
  {
    id: 'master_thief_tools',
    name: 'Mestertyv-verktøy',
    type: 'tool',
    effect: '+2 dice on lockpicking',
    bonus: 2,
    statModifier: 'agility',
    slotType: 'hand',
    goldCost: 0,
    description: 'Avanserte verktøy for selv de vanskeligste låser.'
  },
  {
    id: 'blessed_blade',
    name: 'Velsignet Blad',
    type: 'weapon',
    effect: '2 Attack Dice, +2 vs undead',
    attackDice: 2,
    weaponType: 'melee',
    ammo: -1,
    silent: true,
    goldCost: 0,
    description: 'En kniv velsignet med hellig vann. Særlig effektiv mot udøde.'
  },
  {
    id: 'spirit_lamp',
    name: 'Åndelanterne',
    type: 'tool',
    effect: 'Light source, reveals spirits and hidden doors',
    isLightSource: true,
    slotType: 'hand',
    goldCost: 0,
    description: 'En lanterne som avslører det usynlige.'
  },
  {
    id: 'molotov',
    name: 'Molotov Cocktail',
    type: 'consumable',
    effect: '3 damage to target and adjacent tiles, 1 use',
    uses: 1,
    maxUses: 1,
    goldCost: 0,
    description: 'En improvisert brannbombe. Bruk med forsiktighet.'
  },
  {
    id: 'reinforced_vest',
    name: 'Forsterket Vest',
    type: 'armor',
    effect: '3 Defense Dice',
    defenseDice: 3,
    slotType: 'body',
    goldCost: 0,
    description: 'Tungt forsterket beskyttelse.'
  },
  {
    id: 'eldritch_torch',
    name: 'Eldgammel Fakkel',
    type: 'tool',
    effect: 'Light source, +1 die on Horror checks, reveals secrets',
    isLightSource: true,
    bonus: 1,
    statModifier: 'mental_defense',
    slotType: 'hand',
    goldCost: 0,
    description: 'Flammer som brenner med unaturlig lys.'
  }
];

/**
 * Check if player has ingredients for a recipe
 */
export function canCraftRecipe(recipe: CraftingRecipe, inventory: Item[]): {
  canCraft: boolean;
  missingItems: string[];
} {
  const missingItems: string[] = [];

  for (const ingredient of recipe.ingredients) {
    const count = inventory.filter(item => item.id === ingredient.itemId).length;
    if (count < ingredient.quantity) {
      for (let i = count; i < ingredient.quantity; i++) {
        missingItems.push(ingredient.itemId);
      }
    }
  }

  return {
    canCraft: missingItems.length === 0,
    missingItems
  };
}

/**
 * Get available recipes based on inventory
 */
export function getAvailableCraftingRecipes(inventory: Item[]): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter(recipe => {
    const { canCraft } = canCraftRecipe(recipe, inventory);
    return canCraft;
  });
}

/**
 * Get crafted item by ID
 */
export function getCraftedItem(itemId: string): Item | undefined {
  return CRAFTED_ITEMS.find(item => item.id === itemId);
}
