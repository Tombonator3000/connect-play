import { Character, CharacterType, Item, EventCard, Tile, Scenario, Madness, Spell, BestiaryEntry, EnemyType, Obstacle, ObstacleType, EdgeData, TileCategory, SkillType } from './types';

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

export const CHARACTERS: Record<CharacterType, Character> = {
  detective: { 
    id: 'detective', name: 'The Private Eye', hp: 5, maxHp: 5, sanity: 4, maxSanity: 4, insight: 1, 
    attributes: { strength: 3, agility: 3, intellect: 4, willpower: 3 },
    special: '+1 die on Investigation', specialAbility: 'investigate_bonus'
  },
  professor: { 
    id: 'professor', name: 'The Professor', hp: 3, maxHp: 3, sanity: 6, maxSanity: 6, insight: 3, 
    attributes: { strength: 2, agility: 2, intellect: 5, willpower: 4 },
    special: 'Can read occult texts safely', specialAbility: 'occult_immunity'
  },
  journalist: { 
    id: 'journalist', name: 'The Journalist', hp: 4, maxHp: 4, sanity: 4, maxSanity: 4, insight: 1, 
    attributes: { strength: 2, agility: 4, intellect: 4, willpower: 3 },
    special: '+1 Movement, escape bonus', specialAbility: 'escape_bonus'
  },
  veteran: { 
    id: 'veteran', name: 'The Veteran', hp: 6, maxHp: 6, sanity: 3, maxSanity: 3, insight: 0, 
    attributes: { strength: 5, agility: 3, intellect: 2, willpower: 3 },
    special: '+1 die on Combat and Str checks', specialAbility: 'combat_bonus'
  },
  occultist: { 
    id: 'occultist', name: 'The Occultist', hp: 3, maxHp: 3, sanity: 5, maxSanity: 5, insight: 4, 
    attributes: { strength: 2, agility: 3, intellect: 3, willpower: 5 },
    special: 'Can perform rituals', specialAbility: 'ritual_master'
  },
  doctor: { 
    id: 'doctor', name: 'The Doctor', hp: 4, maxHp: 4, sanity: 5, maxSanity: 5, insight: 2, 
    attributes: { strength: 2, agility: 3, intellect: 4, willpower: 4 },
    special: 'Heals 2 instead of 1', specialAbility: 'heal_bonus'
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
    startDoom: 12,
    startLocation: 'Grand Hall',
    goal: 'Find the Iron Key, locate the Exit Door, and Escape.',
    specialRule: 'Indoors only. Exit Door spawns after Key is found.',
    difficulty: 'Normal',
    tileSet: 'indoor',
    victoryType: 'escape',
    steps: [
      { id: 'step1', description: 'Find the Iron Key (Investigate locations)', type: 'find_item', targetId: 'quest_key', completed: false },
      { id: 'step2', description: 'Locate the Exit Door', type: 'find_tile', targetId: 'Exit Door', completed: false },
      { id: 'step3', description: 'Unlock the Door and Escape', type: 'interact', targetId: 'Exit Door', completed: false }
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
    startDoom: 10,
    startLocation: 'Town Square',
    goal: 'Find and kill the Dark Priest.',
    specialRule: 'Enemies are stronger. Time is short.',
    difficulty: 'Hard',
    tileSet: 'mixed',
    victoryType: 'assassination',
    steps: [
      { id: 'step1', description: 'Find the Dark Priest', type: 'find_item', targetId: 'location_intel', completed: false },
      { id: 'step2', description: 'Kill the Dark Priest', type: 'kill_enemy', targetId: 'priest', amount: 1, completed: false }
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
    startDoom: 15,
    startLocation: 'Police Station',
    goal: 'Survive for 10 rounds.',
    specialRule: 'Doom decreases every round automatically.',
    difficulty: 'Nightmare',
    tileSet: 'mixed',
    victoryType: 'survival',
    steps: [
      { id: 'step1', description: 'Survive until help arrives', type: 'survive', amount: 10, completed: false }
    ],
    doomEvents: [
      { threshold: 12, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 3, message: 'Wave 1: Cultists attack!' },
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 3, message: 'Wave 2: Ghouls swarm the barricades!' },
      { threshold: 4, triggered: false, type: 'spawn_boss', targetId: 'dark_young', amount: 1, message: 'Wave 3: A Dark Young appears!' }
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

export const BESTIARY: Record<EnemyType, BestiaryEntry> = {
  cultist: {
    name: 'Cultist', type: 'cultist', hp: 2, damage: 1, horror: 1,
    description: 'A brainwashed servant of the Outer Gods.',
    lore: 'Recruited from the desperate and the mad.',
    defeatFlavor: 'The cultist collapses, a dark amulet shattering.',
    traits: []
  },
  ghoul: {
    name: 'Ghoul', type: 'ghoul', hp: 3, damage: 2, horror: 2,
    description: 'A flesh-eating subterranean dweller.',
    lore: 'Subterranean dwellers that feast on the dead.',
    defeatFlavor: 'It collapses into grave dirt.',
    traits: ['scavenger']
  },
  deepone: {
    name: 'Deep One', type: 'deepone', hp: 3, damage: 2, horror: 2,
    description: 'An immortal amphibious humanoid.',
    lore: 'Immortal servants of Father Dagon.',
    defeatFlavor: 'The creature dissolves into brine.',
    traits: ['aquatic']
  },
  shoggoth: {
    name: 'Shoggoth', type: 'shoggoth', hp: 6, damage: 3, horror: 4,
    description: 'A protoplasmic mass of eyes and mouths.',
    lore: 'A nightmarish slave race created by the Elder Things.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The massive form loses cohesion.'
  },
  sniper: {
    name: 'Cultist Sniper', type: 'sniper', hp: 2, damage: 2, horror: 1,
    description: 'A cultist armed with a long-range rifle.',
    lore: 'Chosen for their steady hands and lack of remorse.',
    traits: ['ranged'],
    defeatFlavor: 'The sniper falls from their perch.'
  },
  priest: {
    name: 'Dark Priest', type: 'priest', hp: 5, damage: 2, horror: 3,
    description: 'A high-ranking member of the cult, channeling dark energies.',
    lore: 'They have traded their humanity for forbidden power.',
    traits: ['elite'],
    defeatFlavor: 'The priest screams as the darkness consumes them.'
  },
  'mi-go': {
    name: 'Mi-Go', type: 'mi-go', hp: 3, damage: 1, horror: 1,
    description: 'A fungoid crustacean from Yuggoth.',
    lore: 'Fungi from Yuggoth who fly through space.',
    traits: ['flying'],
    defeatFlavor: 'The body disintegrates.'
  },
  nightgaunt: {
    name: 'Nightgaunt', type: 'nightgaunt', hp: 3, damage: 1, horror: 1,
    description: 'A faceless, horned flyer.',
    lore: 'Faceless servants of Nodens.',
    traits: ['flying'],
    defeatFlavor: 'It vanishes into the night sky.'
  },
  hound: {
    name: 'Hound of Tindalos', type: 'hound', hp: 4, damage: 2, horror: 3,
    description: 'A predator from the angles of time.',
    lore: 'Predators that inhabit the angles of time.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The beast recedes into the angles.'
  },
  dark_young: {
    name: 'Dark Young', type: 'dark_young', hp: 6, damage: 2, horror: 3,
    description: 'Offspring of Shub-Niggurath.',
    lore: 'The Black Goat of the Woods.',
    traits: ['massive'],
    defeatFlavor: 'The monstrosity withers.'
  },
  byakhee: {
    name: 'Byakhee', type: 'byakhee', hp: 3, damage: 2, horror: 1,
    description: 'An interstellar steed.',
    lore: 'Interstellar steeds serving Hastur.',
    traits: ['flying', 'fast'],
    defeatFlavor: 'It dissolves into cosmic dust.'
  },
  star_spawn: {
    name: 'Star Spawn', type: 'star_spawn', hp: 8, damage: 3, horror: 5,
    description: 'A colossal kin of Cthulhu.',
    lore: 'Smaller versions of the Great Dreamer.',
    traits: ['massive'],
    defeatFlavor: 'The entity liquefies into green ooze.'
  },
  formless_spawn: {
    name: 'Formless Spawn', type: 'formless_spawn', hp: 5, damage: 2, horror: 2,
    description: 'Black ooze of Tsathoggua.',
    lore: 'Living puddles of black ichor.',
    traits: ['regenerate'],
    defeatFlavor: 'The ooze evaporates into foul steam.'
  },
  hunting_horror: {
    name: 'Hunting Horror', type: 'hunting_horror', hp: 4, damage: 3, horror: 3,
    description: 'A viper of the void.',
    lore: 'A serpentine entity that serves Nyarlathotep.',
    traits: ['fast', 'flying'],
    defeatFlavor: 'It coils in and vanishes.'
  },
  moon_beast: {
    name: 'Moon-Beast', type: 'moon_beast', hp: 4, damage: 1, horror: 2,
    description: 'Sadistic torturers from the moon.',
    lore: 'Sadistic beings from the Dreamlands.',
    traits: ['ranged'],
    defeatFlavor: 'The abomination falls silent.'
  },
  boss: {
    name: 'Ancient One', type: 'boss', hp: 10, damage: 4, horror: 6,
    description: 'An avatar of cosmic destruction.',
    lore: 'An intrusion from outside the ordered universe.',
    traits: ['massive'],
    defeatFlavor: 'The avatar is pulled back into the void.'
  }
};

export const ITEMS: Item[] = [
  { id: 'rev', name: 'Revolver', type: 'weapon', effect: '+1 Combat Die', bonus: 1, cost: 3, statModifier: 'combat' },
  { id: 'shot', name: 'Shotgun', type: 'weapon', effect: '+2 Combat Dice', bonus: 2, cost: 5, statModifier: 'combat' },
  { id: 'tommy', name: 'Tommy Gun', type: 'weapon', effect: '+3 Combat Dice', bonus: 3, cost: 10, statModifier: 'combat' },
  { id: 'med', name: 'Medical Kit', type: 'consumable', effect: 'Heal 2 HP', bonus: 2, cost: 3 },
  { id: 'whiskey', name: 'Old Whiskey', type: 'consumable', effect: 'Heal 2 Sanity', bonus: 2, cost: 2 },
  { id: 'flash', name: 'Flashlight', type: 'tool', effect: '+1 Investigation Die', bonus: 1, cost: 2, statModifier: 'investigation' },
  { id: 'book', name: 'Necronomicon', type: 'relic', effect: '+3 Insight, -1 Sanity', bonus: 3, cost: 8 }
];

export const EVENTS: EventCard[] = [
  { id: 'e1', title: 'Shadows in the Dark', description: 'You feel watched. Lose 1 Sanity.', effectType: 'sanity', value: -1 },
  { id: 'e2', title: 'Hidden Diary', description: 'Found important notes! +1 Insight.', effectType: 'insight', value: 1 },
  { id: 'e3', title: 'Dark Ritual', description: 'You stumble upon a ceremony!', effectType: 'spawn', value: 1 }
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
