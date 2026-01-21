import { Character, CharacterType, Item, EventCard, Tile, Scenario, Madness, Spell, BestiaryEntry, EnemyType, Obstacle, ObstacleType, EdgeData, TileCategory, SkillType, OccultistSpell, HQWeapon, HQArmor, WeatherEffect, WeatherType, WeatherCondition, WeatherIntensity, DarkRoomDiscoveryType, DarkRoomContent, createDarkRoomContent, Player, hasLightSource } from './types';

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
  { id: 'tommy_gun', name: 'Tommy Gun', attackDice: 5, weaponType: 'ranged', range: 1, ammo: 20, goldCost: 800, requiredLevel: 2, notes: 'Rare, devastating at close range only (neighbor tiles)' }
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
  { id: 'armored_vest', name: 'Armored Vest', defenseDice: 2, goldCost: 500, requiredLevel: 2, notes: 'Military grade' }
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
  { id: 'book', name: 'Necronomicon', type: 'relic', effect: '+3 Insight, -1 Sanity per read', bonus: 3, goldCost: 400, slotType: 'bag' }
];

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
  }
];

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
