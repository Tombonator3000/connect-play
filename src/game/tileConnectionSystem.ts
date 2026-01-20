/**
 * LOGICAL TILE CONNECTION SYSTEM
 * Shadows of the 1920s - Procedural Generation
 *
 * This system treats tiles like puzzle pieces - each tile has 6 edges,
 * and edges must MATCH with neighboring tiles. A DOOR must connect to
 * a DOOR or OPEN edge, a WALL to a WALL, etc.
 *
 * Inspired by Wave Function Collapse algorithm.
 */

import { TileCategory, FloorType, EdgeData, Tile, ZoneLevel, DarkRoomContent } from './types';
import { shouldBeDarkRoom, generateDarkRoomContent, DARK_ROOM_CANDIDATE_TILES } from './constants';

// ============================================================================
// 1. EDGE TYPES
// ============================================================================

/**
 * Connection edge types for hex tiles.
 * Each edge type defines what can connect to it.
 */
export type ConnectionEdgeType =
  | 'WALL'        // Solid wall - can ONLY connect to WALL
  | 'OPEN'        // Open passage - can connect to OPEN or DOOR
  | 'DOOR'        // Door - can connect to DOOR or OPEN
  | 'WINDOW'      // Window - can connect to WALL (see through, can't pass)
  | 'STREET'      // Street/road - can connect to STREET, OPEN, FACADE
  | 'NATURE'      // Nature edge - can connect to NATURE, STREET, WATER
  | 'WATER'       // Water edge - can connect to WATER, NATURE
  | 'FACADE'      // Building facade - connects STREET (outside) to DOOR (inside)
  | 'STAIRS_UP'   // Stairs going up - connects to corresponding level
  | 'STAIRS_DOWN'; // Stairs going down - connects to corresponding level

/**
 * Edge compatibility matrix - defines what each edge type can connect to
 */
export const EDGE_COMPATIBILITY: Record<ConnectionEdgeType, ConnectionEdgeType[]> = {
  WALL: ['WALL', 'WINDOW'],
  OPEN: ['OPEN', 'DOOR'],
  DOOR: ['DOOR', 'OPEN', 'FACADE'],
  WINDOW: ['WALL', 'WINDOW'],
  STREET: ['STREET', 'OPEN', 'FACADE', 'NATURE'],
  NATURE: ['NATURE', 'STREET', 'WATER', 'OPEN'],
  WATER: ['WATER', 'NATURE'],
  FACADE: ['STREET', 'DOOR', 'OPEN'],
  STAIRS_UP: ['STAIRS_UP', 'OPEN'],
  STAIRS_DOWN: ['STAIRS_DOWN', 'OPEN']
};

/**
 * Check if two edge types can connect
 * @param edge1 First edge type
 * @param edge2 Second edge type (the neighbor's edge pointing towards us)
 * @returns true if edges are compatible
 */
export function canEdgesConnect(edge1: ConnectionEdgeType, edge2: ConnectionEdgeType): boolean {
  return EDGE_COMPATIBILITY[edge1]?.includes(edge2) ?? false;
}

// ============================================================================
// 2. HEX DIRECTIONS
// ============================================================================

/**
 * Flat-top hex has 6 edges, numbered 0-5:
 *         0 (NORTH)
 *          _____
 *         /     \
 *     5  /       \  1
 *       |         |
 *     4  \       /  2
 *         \_____/
 *         3 (SOUTH)
 */
export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;

export const DIRECTION_NAMES: Record<HexDirection, string> = {
  0: 'North',
  1: 'North-East',
  2: 'South-East',
  3: 'South',
  4: 'South-West',
  5: 'North-West'
};

/**
 * Get the opposite direction (the edge a neighbor would have pointing back)
 * Dir 0 (N) <-> Dir 3 (S)
 * Dir 1 (NE) <-> Dir 4 (SW)
 * Dir 2 (SE) <-> Dir 5 (NW)
 */
export function oppositeDirection(dir: HexDirection): HexDirection {
  return ((dir + 3) % 6) as HexDirection;
}

/**
 * Rotate a direction by a number of 60-degree steps
 */
export function rotateDirection(dir: HexDirection, rotation: number): HexDirection {
  return ((dir + rotation) % 6 + 6) % 6 as HexDirection;
}

// ============================================================================
// 3. TILE TEMPLATES
// ============================================================================

/**
 * Template defining a tile type with predefined edges
 */
export interface TileTemplate {
  id: string;
  name: string;
  category: TileCategory;
  subType: string;
  /**
   * Edges array: [N, NE, SE, S, SW, NW]
   * Each position defines what type of edge is on that side
   */
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
  floorType: FloorType;
  zoneLevel: ZoneLevel;
  watermarkIcon?: string;
  spawnWeight: number;       // How often this spawns (higher = more common)
  canRotate: boolean;        // Can this tile be rotated to fit?
  description?: string;      // Atmospheric description
  /** Objects that might spawn in this tile */
  possibleObjects?: string[];
  /** Chance to spawn an enemy (0-100) */
  enemySpawnChance?: number;
  /** Enemy types that can spawn here */
  possibleEnemies?: string[];
}

/**
 * Rotate template edges by a number of 60-degree steps
 * @param edges Original edges array
 * @param rotation Number of 60-degree clockwise rotations (0-5)
 * @returns Rotated edges array
 */
export function rotateEdges(
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType],
  rotation: number
): [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType] {
  const normalizedRotation = ((rotation % 6) + 6) % 6;
  const rotated: ConnectionEdgeType[] = [];
  for (let i = 0; i < 6; i++) {
    // To rotate clockwise, we take from position (i - rotation)
    const sourceIndex = (i - normalizedRotation + 6) % 6;
    rotated[i] = edges[sourceIndex];
  }
  return rotated as [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
}

// ============================================================================
// 4. TILE TEMPLATES LIBRARY
// ============================================================================

// ----- FOYER TEMPLATES -----

export const FOYER_GRAND: TileTemplate = {
  id: 'foyer_grand',
  name: 'Grand Foyer',
  category: 'foyer',
  subType: 'grand',
  //        N       NE      SE      S       SW      NW
  edges: ['DOOR', 'WALL', 'DOOR', 'DOOR', 'DOOR', 'WALL'],
  //       ^ in    ^ wall  ^ room  ^ corridor ^ room ^ wall
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'DoorOpen',
  spawnWeight: 10,
  canRotate: false, // Foyer has fixed orientation (door towards facade)
  description: 'A magnificent entrance hall. Twin staircases spiral upward into shadow.'
};

export const FOYER_SMALL: TileTemplate = {
  id: 'foyer_small',
  name: 'Dim Reception',
  category: 'foyer',
  subType: 'reception',
  //        N       NE      SE      S       SW      NW
  edges: ['DOOR', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'DoorOpen',
  spawnWeight: 15,
  canRotate: false,
  description: 'A narrow entry hall. The guest book lies open to a page filled with the same name repeated.'
};

export const FOYER_CHURCH: TileTemplate = {
  id: 'foyer_church',
  name: 'Church Narthex',
  category: 'foyer',
  subType: 'church',
  edges: ['DOOR', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Church',
  spawnWeight: 8,
  canRotate: false,
  description: 'Holy water fonts stand dry. The donation box is stuffed with strange coins.'
};

// ----- CORRIDOR TEMPLATES -----

export const CORRIDOR_STRAIGHT: TileTemplate = {
  id: 'corridor_straight',
  name: 'Dusty Corridor',
  category: 'corridor',
  subType: 'hallway',
  //        N       NE      SE      S       SW      NW
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  //       ^ in    ^ wall  ^ wall  ^ out   ^ wall  ^ wall
  floorType: 'wood',
  zoneLevel: 1,
  spawnWeight: 25,
  canRotate: true,
  description: 'Fresh footprints in the dust that are not your own.'
};

export const CORRIDOR_T: TileTemplate = {
  id: 'corridor_t',
  name: 'T-Junction',
  category: 'corridor',
  subType: 'junction',
  //        N       NE      SE      S       SW      NW
  edges: ['OPEN', 'WALL', 'OPEN', 'WALL', 'OPEN', 'WALL'],
  //       ^ in          ^ right        ^ left
  floorType: 'wood',
  zoneLevel: 1,
  spawnWeight: 12,
  canRotate: true,
  description: 'Three paths diverge in the darkness. Choose wisely.'
};

export const CORRIDOR_CORNER: TileTemplate = {
  id: 'corridor_corner',
  name: 'Dark Corner',
  category: 'corridor',
  subType: 'corner',
  edges: ['OPEN', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  spawnWeight: 18,
  canRotate: true,
  description: 'The corner where shadows gather.'
};

export const CORRIDOR_CROSS: TileTemplate = {
  id: 'corridor_cross',
  name: 'Crossroads',
  category: 'corridor',
  subType: 'crossing',
  edges: ['OPEN', 'WALL', 'OPEN', 'OPEN', 'WALL', 'OPEN'],
  floorType: 'wood',
  zoneLevel: 1,
  spawnWeight: 6,
  canRotate: true,
  description: 'Four paths meet. Something watches from each direction.'
};

export const CORRIDOR_WIDE: TileTemplate = {
  id: 'corridor_wide',
  name: 'Portrait Gallery',
  category: 'corridor',
  subType: 'gallery',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'DOOR'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Frame',
  spawnWeight: 8,
  canRotate: true,
  description: 'Generations watch you. The oldest portrait appears in every painting after.',
  possibleObjects: ['painting', 'statue']
};

// ----- ROOM TEMPLATES -----

export const ROOM_STUDY: TileTemplate = {
  id: 'room_study',
  name: 'Private Study',
  category: 'room',
  subType: 'study',
  //        N       NE      SE      S       SW      NW
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  //       ^ door in, rest walls
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'BookOpen',
  spawnWeight: 15,
  canRotate: true,
  description: 'A half-finished letter warns of something coming. The ink is still wet.',
  possibleObjects: ['bookshelf', 'desk', 'cabinet']
};

export const ROOM_BEDROOM: TileTemplate = {
  id: 'room_bedroom',
  name: 'Master Bedroom',
  category: 'room',
  subType: 'bedroom',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  //       ^ door                              ^ window
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Bed',
  spawnWeight: 12,
  canRotate: true,
  description: 'A journal describes dreams that are not dreams. The mirror reflects wrong.'
};

export const ROOM_KITCHEN: TileTemplate = {
  id: 'room_kitchen',
  name: 'Abandoned Kitchen',
  category: 'room',
  subType: 'kitchen',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  //       ^ main    ^ wall  ^ wall  ^ back door
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Utensils',
  spawnWeight: 10,
  canRotate: true,
  description: 'Pots contain meals decades old, still bubbling. The pantry door bulges outward.',
  possibleObjects: ['cabinet', 'crate']
};

export const ROOM_RITUAL: TileTemplate = {
  id: 'room_ritual',
  name: 'Ritual Chamber',
  category: 'room',
  subType: 'ritual',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'ritual',
  zoneLevel: 1,
  watermarkIcon: 'Pentagram',
  spawnWeight: 3, // Rare
  canRotate: true,
  description: 'Symbols painted in substances best not examined. Something was summoned here.',
  possibleObjects: ['altar'],
  enemySpawnChance: 40,
  possibleEnemies: ['cultist', 'priest']
};

export const ROOM_LIBRARY: TileTemplate = {
  id: 'room_library',
  name: 'Library',
  category: 'room',
  subType: 'library',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Library',
  spawnWeight: 10,
  canRotate: true,
  description: 'Books in languages you cannot name. One lies open—the pages are blank, but wet.',
  possibleObjects: ['bookshelf', 'bookshelf', 'cabinet']
};

export const ROOM_LAB: TileTemplate = {
  id: 'room_lab',
  name: 'Hidden Laboratory',
  category: 'room',
  subType: 'lab',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'FlaskConical',
  spawnWeight: 5,
  canRotate: true,
  description: 'Specimens float in jars—some human, some almost human, some neither.',
  possibleObjects: ['cabinet', 'chest']
};

export const ROOM_DINING: TileTemplate = {
  id: 'room_dining',
  name: 'Dining Hall',
  category: 'room',
  subType: 'dining',
  edges: ['DOOR', 'WALL', 'DOOR', 'DOOR', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Utensils',
  spawnWeight: 8,
  canRotate: true,
  description: 'Places set for guests who will never arrive. The meat on the plates still bleeds.'
};

export const ROOM_LIVING: TileTemplate = {
  id: 'room_living',
  name: 'Drawing Room',
  category: 'room',
  subType: 'living',
  edges: ['DOOR', 'WINDOW', 'WALL', 'DOOR', 'WALL', 'WINDOW'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Sofa',
  spawnWeight: 12,
  canRotate: true,
  description: 'Comfortable chairs arranged for conversation. The fireplace crackles though no fire burns.'
};

// ----- STAIRS TEMPLATES -----

export const STAIRS_DOWN: TileTemplate = {
  id: 'stairs_down',
  name: 'Cellar Stairs',
  category: 'stairs',
  subType: 'cellar',
  edges: ['OPEN', 'WALL', 'WALL', 'STAIRS_DOWN', 'WALL', 'WALL'],
  //       ^ from corridor        ^ down to cellar
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'ArrowDown',
  spawnWeight: 8,
  canRotate: true,
  description: 'Stone steps descend into darkness. A cold breeze rises from below.'
};

export const STAIRS_UP: TileTemplate = {
  id: 'stairs_up',
  name: 'Grand Staircase',
  category: 'stairs',
  subType: 'grand',
  edges: ['OPEN', 'WALL', 'WALL', 'STAIRS_UP', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'ArrowUp',
  spawnWeight: 8,
  canRotate: true,
  description: 'Carved banisters wind upward. Footsteps echo from above, though the upper floor is empty.'
};

export const STAIRS_SPIRAL: TileTemplate = {
  id: 'stairs_spiral',
  name: 'Spiral Stairs',
  category: 'stairs',
  subType: 'spiral',
  edges: ['OPEN', 'WALL', 'WALL', 'STAIRS_DOWN', 'WALL', 'STAIRS_UP'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Spiral',
  spawnWeight: 5,
  canRotate: true,
  description: 'The spiral descends further than any building should allow.'
};

// ----- BASEMENT TEMPLATES -----

export const BASEMENT_CELLAR: TileTemplate = {
  id: 'basement_cellar',
  name: 'Dark Cellar',
  category: 'basement',
  subType: 'cellar',
  edges: ['STAIRS_UP', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -1,
  watermarkIcon: 'Wine',
  spawnWeight: 15,
  canRotate: true,
  description: 'Dusty bottles from years that should not exist. Something moves behind the shelves.',
  possibleObjects: ['crate', 'chest']
};

export const BASEMENT_WINE: TileTemplate = {
  id: 'basement_wine',
  name: 'Wine Cellar',
  category: 'basement',
  subType: 'wine',
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -1,
  watermarkIcon: 'Wine',
  spawnWeight: 12,
  canRotate: true,
  description: 'Vintage bottles line the walls. Some labels are written in no human language.'
};

export const BASEMENT_TUNNEL: TileTemplate = {
  id: 'basement_tunnel',
  name: 'Underground Tunnel',
  category: 'basement',
  subType: 'tunnel',
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'dirt',
  zoneLevel: -1,
  spawnWeight: 15,
  canRotate: true,
  description: 'Earthen walls press close. The tunnel breathes.',
  enemySpawnChance: 30,
  possibleEnemies: ['ghoul']
};

export const BASEMENT_SEWER: TileTemplate = {
  id: 'basement_sewer',
  name: 'Sewer Junction',
  category: 'basement',
  subType: 'sewer',
  edges: ['OPEN', 'WATER', 'OPEN', 'OPEN', 'WATER', 'OPEN'],
  floorType: 'water',
  zoneLevel: -1,
  spawnWeight: 8,
  canRotate: true,
  description: 'Fetid water swirls around your ankles. Something large moved in the darkness.',
  enemySpawnChance: 40,
  possibleEnemies: ['ghoul', 'deepone']
};

// ----- CRYPT TEMPLATES -----

export const CRYPT_TOMB: TileTemplate = {
  id: 'crypt_tomb',
  name: 'Forgotten Tomb',
  category: 'crypt',
  subType: 'tomb',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -2,
  watermarkIcon: 'Skull',
  spawnWeight: 10,
  canRotate: true,
  description: 'Stone coffins line the walls. Some lids are displaced from within.',
  enemySpawnChance: 50,
  possibleEnemies: ['ghoul']
};

export const CRYPT_ALTAR: TileTemplate = {
  id: 'crypt_altar',
  name: 'Sacrificial Altar',
  category: 'crypt',
  subType: 'altar',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  floorType: 'ritual',
  zoneLevel: -2,
  watermarkIcon: 'Pentagram',
  spawnWeight: 4,
  canRotate: true,
  description: 'The altar is stained with centuries of sacrifice. The air vibrates wrongly.',
  possibleObjects: ['altar'],
  enemySpawnChance: 60,
  possibleEnemies: ['cultist', 'priest']
};

export const CRYPT_TUNNEL: TileTemplate = {
  id: 'crypt_tunnel',
  name: 'Bone Passage',
  category: 'crypt',
  subType: 'passage',
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -2,
  spawnWeight: 12,
  canRotate: true,
  description: 'The walls are packed with bones. Skulls watch your passage.',
  enemySpawnChance: 35,
  possibleEnemies: ['ghoul']
};

export const CRYPT_PORTAL: TileTemplate = {
  id: 'crypt_portal',
  name: 'Eldritch Portal',
  category: 'crypt',
  subType: 'portal',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'ritual',
  zoneLevel: -2,
  watermarkIcon: 'Sparkles',
  spawnWeight: 1, // Very rare
  canRotate: false,
  description: 'A stone arch covered in symbols. Through it, stars that do not exist on our sky.',
  enemySpawnChance: 80,
  possibleEnemies: ['shoggoth', 'star_spawn']
};

// ----- FACADE TEMPLATES -----

export const FACADE_MANOR: TileTemplate = {
  id: 'facade_manor',
  name: 'Abandoned Manor',
  category: 'facade',
  subType: 'mansion',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  //       ^ in to foyer      ^ out to street
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Home',
  spawnWeight: 10,
  canRotate: true,
  description: 'The infamous estate looms before you. Every window is dark.'
};

export const FACADE_SHOP: TileTemplate = {
  id: 'facade_shop',
  name: 'Dusty Antique Shop',
  category: 'facade',
  subType: 'shop',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Store',
  spawnWeight: 12,
  canRotate: true,
  description: 'A music box plays a tune from childhood nightmares.'
};

export const FACADE_CHURCH: TileTemplate = {
  id: 'facade_church',
  name: 'Crumbling Church',
  category: 'facade',
  subType: 'church',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Church',
  spawnWeight: 6,
  canRotate: true,
  description: 'The steeple leans impossibly. The bells toll at midnight unbidden.'
};

export const FACADE_WAREHOUSE: TileTemplate = {
  id: 'facade_warehouse',
  name: 'Derelict Warehouse',
  category: 'facade',
  subType: 'warehouse',
  edges: ['DOOR', 'WALL', 'DOOR', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Warehouse',
  spawnWeight: 10,
  canRotate: true,
  description: 'The chains on the door are freshly cut.'
};

// ----- STREET TEMPLATES -----

export const STREET_MAIN: TileTemplate = {
  id: 'street_main',
  name: 'Main Street',
  category: 'street',
  subType: 'main',
  //        N        NE       SE       S        SW       NW
  edges: ['STREET', 'FACADE', 'FACADE', 'STREET', 'FACADE', 'FACADE'],
  //       ^ road    ^ shop    ^ shop    ^ road    ^ shop    ^ shop
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Lamp',
  spawnWeight: 20,
  canRotate: true,
  description: 'Gas lamps flicker. Butikkvinduene are dark, but you feel watched.'
};

export const STREET_ALLEY: TileTemplate = {
  id: 'street_alley',
  name: 'Shadowy Alley',
  category: 'street',
  subType: 'alley',
  edges: ['STREET', 'WALL', 'WALL', 'STREET', 'WALL', 'WALL'],
  //       ^ in            ^ out (narrow alley)
  floorType: 'cobblestone',
  zoneLevel: 0,
  spawnWeight: 15,
  canRotate: true,
  description: 'Symbols on the wall are written in chalk—or something worse.',
  enemySpawnChance: 20,
  possibleEnemies: ['cultist']
};

export const STREET_CROSSING: TileTemplate = {
  id: 'street_crossing',
  name: 'The Crossroads',
  category: 'street',
  subType: 'crossing',
  edges: ['STREET', 'STREET', 'STREET', 'STREET', 'STREET', 'STREET'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Signpost',
  spawnWeight: 5,
  canRotate: false,
  description: 'Six roads meet. Deals are made here that should not be made.'
};

export const STREET_CORNER: TileTemplate = {
  id: 'street_corner',
  name: 'Street Corner',
  category: 'street',
  subType: 'corner',
  edges: ['STREET', 'FACADE', 'STREET', 'WALL', 'WALL', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  spawnWeight: 12,
  canRotate: true,
  description: 'A corner where shadows linger even at noon.'
};

// ----- URBAN TEMPLATES -----

export const URBAN_SQUARE: TileTemplate = {
  id: 'urban_square',
  name: 'Town Square',
  category: 'urban',
  subType: 'square',
  edges: ['STREET', 'STREET', 'STREET', 'STREET', 'STREET', 'STREET'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Landmark',
  spawnWeight: 4,
  canRotate: false,
  description: 'The heart of Arkham. The clock tower counts down to something.'
};

export const URBAN_HARBOR: TileTemplate = {
  id: 'urban_harbor',
  name: 'Arkham Harbor',
  category: 'urban',
  subType: 'harbor',
  edges: ['STREET', 'WATER', 'WATER', 'STREET', 'WATER', 'WATER'],
  //       ^ landside        ^ seaside
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Anchor',
  spawnWeight: 5,
  canRotate: true,
  description: 'Salt and rot. The fishermen\'s eyes are too large.',
  enemySpawnChance: 30,
  possibleEnemies: ['deepone']
};

export const URBAN_CEMETERY: TileTemplate = {
  id: 'urban_cemetery',
  name: 'Old Cemetery',
  category: 'urban',
  subType: 'cemetery',
  edges: ['STREET', 'NATURE', 'NATURE', 'STREET', 'NATURE', 'NATURE'],
  floorType: 'grass',
  zoneLevel: 0,
  watermarkIcon: 'Cross',
  spawnWeight: 6,
  canRotate: true,
  description: 'Headstones lean at wrong angles. Some names are older than the town.',
  enemySpawnChance: 35,
  possibleEnemies: ['ghoul']
};

// ----- NATURE TEMPLATES -----

export const NATURE_FOREST: TileTemplate = {
  id: 'nature_forest',
  name: 'Blackwood Forest',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'TreePine',
  spawnWeight: 20,
  canRotate: false,
  description: 'Trees so thick daylight cannot penetrate. Absolute silence.'
};

export const NATURE_CLEARING: TileTemplate = {
  id: 'nature_clearing',
  name: 'Moonlit Clearing',
  category: 'nature',
  subType: 'clearing',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'grass',
  zoneLevel: 0,
  watermarkIcon: 'Moon',
  spawnWeight: 8,
  canRotate: false,
  description: 'A perfect circle where grass refuses to grow. Symbols are carved in the central stone.'
};

export const NATURE_PATH: TileTemplate = {
  id: 'nature_path',
  name: 'Forest Path',
  category: 'nature',
  subType: 'path',
  edges: ['OPEN', 'NATURE', 'NATURE', 'OPEN', 'NATURE', 'NATURE'],
  //       ^ path through forest
  floorType: 'dirt',
  zoneLevel: 0,
  spawnWeight: 15,
  canRotate: true,
  description: 'A narrow trail. Something follows at the edge of vision.'
};

export const NATURE_MARSH: TileTemplate = {
  id: 'nature_marsh',
  name: 'Treacherous Marsh',
  category: 'nature',
  subType: 'marsh',
  edges: ['WATER', 'NATURE', 'WATER', 'NATURE', 'WATER', 'NATURE'],
  floorType: 'water',
  zoneLevel: 0,
  watermarkIcon: 'Waves',
  spawnWeight: 10,
  canRotate: true,
  description: 'Will-o-wisps dance over the mire. They lead travelers to their doom.'
};

export const NATURE_STONES: TileTemplate = {
  id: 'nature_stones',
  name: 'Ancient Stone Circle',
  category: 'nature',
  subType: 'stones',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'ritual',
  zoneLevel: 0,
  watermarkIcon: 'Circle',
  spawnWeight: 3,
  canRotate: false,
  description: 'Monoliths older than humanity. The symbols shift when you look away.',
  possibleObjects: ['altar'],
  enemySpawnChance: 25,
  possibleEnemies: ['cultist']
};

// ============================================================================
// 5. TEMPLATES REGISTRY
// ============================================================================

/**
 * All tile templates indexed by ID
 */
export const TILE_TEMPLATES: Record<string, TileTemplate> = {
  // Foyer
  foyer_grand: FOYER_GRAND,
  foyer_small: FOYER_SMALL,
  foyer_church: FOYER_CHURCH,

  // Corridor
  corridor_straight: CORRIDOR_STRAIGHT,
  corridor_t: CORRIDOR_T,
  corridor_corner: CORRIDOR_CORNER,
  corridor_cross: CORRIDOR_CROSS,
  corridor_wide: CORRIDOR_WIDE,

  // Room
  room_study: ROOM_STUDY,
  room_bedroom: ROOM_BEDROOM,
  room_kitchen: ROOM_KITCHEN,
  room_ritual: ROOM_RITUAL,
  room_library: ROOM_LIBRARY,
  room_lab: ROOM_LAB,
  room_dining: ROOM_DINING,
  room_living: ROOM_LIVING,

  // Stairs
  stairs_down: STAIRS_DOWN,
  stairs_up: STAIRS_UP,
  stairs_spiral: STAIRS_SPIRAL,

  // Basement
  basement_cellar: BASEMENT_CELLAR,
  basement_wine: BASEMENT_WINE,
  basement_tunnel: BASEMENT_TUNNEL,
  basement_sewer: BASEMENT_SEWER,

  // Crypt
  crypt_tomb: CRYPT_TOMB,
  crypt_altar: CRYPT_ALTAR,
  crypt_tunnel: CRYPT_TUNNEL,
  crypt_portal: CRYPT_PORTAL,

  // Facade
  facade_manor: FACADE_MANOR,
  facade_shop: FACADE_SHOP,
  facade_church: FACADE_CHURCH,
  facade_warehouse: FACADE_WAREHOUSE,

  // Street
  street_main: STREET_MAIN,
  street_alley: STREET_ALLEY,
  street_crossing: STREET_CROSSING,
  street_corner: STREET_CORNER,

  // Urban
  urban_square: URBAN_SQUARE,
  urban_harbor: URBAN_HARBOR,
  urban_cemetery: URBAN_CEMETERY,

  // Nature
  nature_forest: NATURE_FOREST,
  nature_clearing: NATURE_CLEARING,
  nature_path: NATURE_PATH,
  nature_marsh: NATURE_MARSH,
  nature_stones: NATURE_STONES
};

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TileCategory): TileTemplate[] {
  return Object.values(TILE_TEMPLATES).filter(t => t.category === category);
}

/**
 * Get templates that can transition FROM a given category
 * Based on the category connection rules
 */
export function getTemplatesForTransition(fromCategory: TileCategory): TileTemplate[] {
  const CATEGORY_CONNECTIONS: Record<TileCategory, TileCategory[]> = {
    nature: ['nature', 'street', 'urban'],
    urban: ['urban', 'street', 'nature', 'facade'],
    street: ['street', 'nature', 'urban', 'facade'],
    facade: ['street', 'urban', 'foyer'],
    foyer: ['facade', 'corridor', 'room', 'stairs'],
    corridor: ['foyer', 'corridor', 'room', 'stairs'],
    room: ['corridor', 'room', 'stairs'],
    stairs: ['foyer', 'corridor', 'room', 'basement', 'crypt'],
    basement: ['stairs', 'basement', 'crypt'],
    crypt: ['basement', 'crypt', 'stairs']
  };

  const validCategories = CATEGORY_CONNECTIONS[fromCategory] || [];
  return Object.values(TILE_TEMPLATES).filter(t => validCategories.includes(t.category));
}

// ============================================================================
// 6. CONSTRAINT GATHERING
// ============================================================================

export interface EdgeConstraint {
  direction: HexDirection;
  requiredEdgeType: ConnectionEdgeType;
  neighborTileId?: string;
}

/**
 * Gather constraints from all neighbors of a potential tile position
 * @param board Map of tile positions to tiles
 * @param q Target q coordinate
 * @param r Target r coordinate
 * @returns Array of constraints from neighbors (null = no neighbor in that direction)
 */
export function gatherConstraints(
  board: Map<string, Tile>,
  q: number,
  r: number
): (EdgeConstraint | null)[] {
  const constraints: (EdgeConstraint | null)[] = [null, null, null, null, null, null];

  // Hex neighbor offsets for flat-top hex (axial coordinates)
  const neighborOffsets: [number, number][] = [
    [0, -1],  // 0: North
    [1, -1],  // 1: North-East
    [1, 0],   // 2: South-East
    [0, 1],   // 3: South
    [-1, 1],  // 4: South-West
    [-1, 0]   // 5: North-West
  ];

  for (let dir = 0; dir < 6; dir++) {
    const [dq, dr] = neighborOffsets[dir];
    const neighborPos = `${q + dq},${r + dr}`;
    const neighbor = board.get(neighborPos);

    if (neighbor) {
      // The neighbor has an edge pointing towards us (opposite direction)
      const oppositeDir = oppositeDirection(dir as HexDirection);
      const neighborEdge = neighbor.edges[oppositeDir];

      // Convert legacy EdgeType to ConnectionEdgeType
      const connectionType = convertToConnectionEdgeType(neighborEdge.type);

      constraints[dir] = {
        direction: dir as HexDirection,
        requiredEdgeType: connectionType,
        neighborTileId: neighbor.id
      };
    }
  }

  return constraints;
}

/**
 * Convert legacy EdgeData.type to ConnectionEdgeType
 */
function convertToConnectionEdgeType(edgeType: string): ConnectionEdgeType {
  const mapping: Record<string, ConnectionEdgeType> = {
    'open': 'OPEN',
    'wall': 'WALL',
    'door': 'DOOR',
    'secret': 'DOOR', // Treat secret as door for connection purposes
    'window': 'WINDOW',
    'stairs_up': 'STAIRS_UP',
    'stairs_down': 'STAIRS_DOWN',
    'blocked': 'WALL'
  };
  return mapping[edgeType] || 'WALL';
}

// ============================================================================
// 7. TEMPLATE MATCHING
// ============================================================================

export interface TemplateMatch {
  template: TileTemplate;
  rotation: number;
  matchScore: number; // Higher = better match
}

/**
 * Check if a template (with given rotation) matches all constraints
 * @param template The template to check
 * @param constraints Constraints from neighbors
 * @param rotation The rotation to apply (0-5)
 * @returns true if all constraints are satisfied
 */
export function templateMatchesConstraints(
  template: TileTemplate,
  constraints: (EdgeConstraint | null)[],
  rotation: number
): boolean {
  // Get rotated edges
  const rotatedEdges = rotateEdges(template.edges, rotation);

  for (let dir = 0; dir < 6; dir++) {
    const constraint = constraints[dir];
    if (!constraint) continue; // No neighbor, no constraint

    const templateEdge = rotatedEdges[dir];

    // Check if our edge can connect to the neighbor's edge
    if (!canEdgesConnect(templateEdge, constraint.requiredEdgeType)) {
      return false;
    }
  }

  return true;
}

/**
 * Find all templates that can fit at a position given constraints
 * @param constraints Constraints from neighbors
 * @param preferredCategory Optional category to prefer (from the tile we came from)
 * @returns Array of valid template matches with rotations
 */
export function findValidTemplates(
  constraints: (EdgeConstraint | null)[],
  preferredCategory?: TileCategory
): TemplateMatch[] {
  const results: TemplateMatch[] = [];

  // Get relevant templates based on context
  let templates = Object.values(TILE_TEMPLATES);
  if (preferredCategory) {
    templates = getTemplatesForTransition(preferredCategory);
  }

  for (const template of templates) {
    const maxRotations = template.canRotate ? 6 : 1;

    for (let rot = 0; rot < maxRotations; rot++) {
      if (templateMatchesConstraints(template, constraints, rot)) {
        // Calculate match score (more constraints satisfied = better)
        let score = template.spawnWeight;

        // Bonus for matching preferred category
        if (preferredCategory && template.category === preferredCategory) {
          score += 10;
        }

        results.push({
          template,
          rotation: rot,
          matchScore: score
        });
      }
    }
  }

  return results;
}

/**
 * Select a template using weighted random selection
 * @param matches Array of valid template matches
 * @returns Selected template match, or null if no valid templates
 */
export function selectWeightedTemplate(matches: TemplateMatch[]): TemplateMatch | null {
  if (matches.length === 0) return null;

  const totalWeight = matches.reduce((sum, m) => sum + m.matchScore, 0);
  let random = Math.random() * totalWeight;

  for (const match of matches) {
    random -= match.matchScore;
    if (random <= 0) {
      return match;
    }
  }

  return matches[matches.length - 1];
}

// ============================================================================
// 8. ROOM CLUSTER SYSTEM
// ============================================================================

/**
 * A cluster of tiles that form a logical room/building
 */
export interface RoomCluster {
  id: string;
  name: string;
  description: string;
  tiles: {
    template: TileTemplate;
    localQ: number;  // Relative position within cluster
    localR: number;
    rotation: number; // 0-5
  }[];
  entryPoints: {
    direction: HexDirection;
    localQ: number;
    localR: number;
  }[];
  category: 'apartment' | 'manor' | 'church' | 'warehouse' | 'cave';
  spawnWeight: number;
}

// ----- ROOM CLUSTERS -----

export const CLUSTER_SMALL_APARTMENT: RoomCluster = {
  id: 'apartment_small',
  name: 'Cramped Apartment',
  description: 'A small apartment with basic rooms.',
  tiles: [
    { template: FOYER_SMALL, localQ: 0, localR: 0, rotation: 0 },
    { template: ROOM_LIVING, localQ: 1, localR: 0, rotation: 0 },
    { template: ROOM_KITCHEN, localQ: 0, localR: 1, rotation: 3 },
    { template: ROOM_BEDROOM, localQ: -1, localR: 0, rotation: 0 }
  ],
  entryPoints: [
    { direction: 0, localQ: 0, localR: 0 }
  ],
  category: 'apartment',
  spawnWeight: 15
};

export const CLUSTER_MANOR_GROUND: RoomCluster = {
  id: 'manor_ground',
  name: 'Manor Ground Floor',
  description: 'The ground floor of a decrepit manor house.',
  tiles: [
    { template: FOYER_GRAND, localQ: 0, localR: 0, rotation: 0 },
    { template: CORRIDOR_STRAIGHT, localQ: 0, localR: -1, rotation: 0 },
    { template: ROOM_STUDY, localQ: 1, localR: -1, rotation: 4 },
    { template: ROOM_LIBRARY, localQ: -1, localR: -1, rotation: 2 },
    { template: ROOM_DINING, localQ: 0, localR: -2, rotation: 0 },
    { template: ROOM_KITCHEN, localQ: 1, localR: -2, rotation: 4 },
    { template: STAIRS_UP, localQ: -1, localR: -2, rotation: 2 }
  ],
  entryPoints: [
    { direction: 3, localQ: 0, localR: 0 }
  ],
  category: 'manor',
  spawnWeight: 8
};

export const CLUSTER_CHURCH: RoomCluster = {
  id: 'church',
  name: 'Crumbling Church',
  description: 'An abandoned church with a dark secret below.',
  tiles: [
    { template: FOYER_CHURCH, localQ: 0, localR: 0, rotation: 0 },
    { template: CORRIDOR_STRAIGHT, localQ: 0, localR: -1, rotation: 0 },
    { template: CORRIDOR_STRAIGHT, localQ: 0, localR: -2, rotation: 0 },
    { template: ROOM_RITUAL, localQ: 0, localR: -3, rotation: 0 },
    { template: ROOM_STUDY, localQ: 1, localR: -2, rotation: 4 },
    { template: STAIRS_DOWN, localQ: -1, localR: -2, rotation: 2 }
  ],
  entryPoints: [
    { direction: 3, localQ: 0, localR: 0 }
  ],
  category: 'church',
  spawnWeight: 5
};

export const CLUSTER_WAREHOUSE: RoomCluster = {
  id: 'warehouse',
  name: 'Waterfront Warehouse',
  description: 'A warehouse used for smuggling and worse.',
  tiles: [
    { template: FACADE_WAREHOUSE, localQ: 0, localR: 0, rotation: 0 },
    { template: CORRIDOR_WIDE, localQ: 0, localR: -1, rotation: 0 },
    { template: ROOM_STUDY, localQ: 1, localR: -1, rotation: 4 },
    { template: STAIRS_DOWN, localQ: -1, localR: -1, rotation: 2 },
    { template: BASEMENT_CELLAR, localQ: -1, localR: 0, rotation: 0 }
  ],
  entryPoints: [
    { direction: 3, localQ: 0, localR: 0 }
  ],
  category: 'warehouse',
  spawnWeight: 10
};

/**
 * All room clusters
 */
export const ROOM_CLUSTERS: RoomCluster[] = [
  CLUSTER_SMALL_APARTMENT,
  CLUSTER_MANOR_GROUND,
  CLUSTER_CHURCH,
  CLUSTER_WAREHOUSE
];

/**
 * Get clusters appropriate for a given category
 */
export function getClustersForCategory(category: TileCategory): RoomCluster[] {
  const categoryToClusters: Record<TileCategory, string[]> = {
    facade: ['apartment', 'manor', 'warehouse'],
    foyer: ['apartment', 'manor', 'church'],
    corridor: [],
    room: [],
    stairs: [],
    basement: [],
    crypt: [],
    street: ['warehouse'],
    urban: [],
    nature: []
  };

  const clusterTypes = categoryToClusters[category] || [];
  return ROOM_CLUSTERS.filter(c => clusterTypes.includes(c.category));
}

// ============================================================================
// 9. TILE GENERATION
// ============================================================================

/**
 * Generate a new tile at the given position based on constraints from neighbors
 * @param board Current board state
 * @param q Target q coordinate
 * @param r Target r coordinate
 * @param fromTile The tile we're coming from (for category context)
 * @param direction The direction we're going from fromTile
 * @returns New tile or null if generation failed
 */
export function generateAdjacentTile(
  board: Map<string, Tile>,
  q: number,
  r: number,
  fromTile: Tile,
  direction: HexDirection
): Tile | null {
  // Check if tile already exists
  const posKey = `${q},${r}`;
  if (board.has(posKey)) {
    return null;
  }

  // Gather constraints from all neighbors
  const constraints = gatherConstraints(board, q, r);

  // Find valid templates
  const validTemplates = findValidTemplates(constraints, fromTile.category);

  if (validTemplates.length === 0) {
    console.warn(`No valid templates found for position (${q},${r})`);
    return null;
  }

  // Select template
  const selected = selectWeightedTemplate(validTemplates);
  if (!selected) return null;

  // Create tile from template
  return createTileFromTemplate(selected.template, q, r, selected.rotation);
}

/**
 * Create a Tile from a TileTemplate
 */
export function createTileFromTemplate(
  template: TileTemplate,
  q: number,
  r: number,
  rotation: number
): Tile {
  const rotatedEdges = rotateEdges(template.edges, rotation);

  // Convert ConnectionEdgeType to EdgeData
  const edges: [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] = [
    connectionEdgeToEdgeData(rotatedEdges[0]),
    connectionEdgeToEdgeData(rotatedEdges[1]),
    connectionEdgeToEdgeData(rotatedEdges[2]),
    connectionEdgeToEdgeData(rotatedEdges[3]),
    connectionEdgeToEdgeData(rotatedEdges[4]),
    connectionEdgeToEdgeData(rotatedEdges[5])
  ];

  // Count non-wall exits to determine if dead end
  const exitCount = rotatedEdges.filter(e => e !== 'WALL' && e !== 'WINDOW').length;

  // Determine if this should be a dark room
  const baseTile: Tile = {
    id: `tile_${q}_${r}_${Date.now()}`,
    q,
    r,
    name: template.name,
    description: template.description,  // Include atmospheric description from template
    type: getCategoryType(template.category),
    category: template.category,
    zoneLevel: template.zoneLevel,
    floorType: template.floorType,
    visibility: 'adjacent',
    edges,
    explored: false,
    searchable: template.possibleObjects !== undefined,
    searched: false,
    watermarkIcon: template.watermarkIcon,
    isDeadEnd: exitCount <= 1
  };

  // Check if this tile should be dark
  // Named dark rooms are always dark, others have zone-based chance
  const isNamedDarkRoom = DARK_ROOM_CANDIDATE_TILES.includes(template.name);
  const shouldBeDark = isNamedDarkRoom || shouldBeDarkRoom(baseTile);

  if (shouldBeDark) {
    baseTile.isDarkRoom = true;
    baseTile.darkRoomIlluminated = false;
    baseTile.darkRoomContent = generateDarkRoomContent();
  }

  return baseTile;
}

/**
 * Convert ConnectionEdgeType to EdgeData
 */
function connectionEdgeToEdgeData(edgeType: ConnectionEdgeType): EdgeData {
  const typeMapping: Record<ConnectionEdgeType, string> = {
    WALL: 'wall',
    OPEN: 'open',
    DOOR: 'door',
    WINDOW: 'window',
    STREET: 'open',
    NATURE: 'open',
    WATER: 'open',
    FACADE: 'open',
    STAIRS_UP: 'stairs_up',
    STAIRS_DOWN: 'stairs_down'
  };

  const result: EdgeData = {
    type: typeMapping[edgeType] as EdgeData['type']
  };

  // Add door state for door edges
  if (edgeType === 'DOOR' || edgeType === 'FACADE') {
    result.doorState = Math.random() < 0.3 ? 'locked' : 'closed';
    if (result.doorState === 'locked') {
      result.lockType = Math.random() < 0.7 ? 'simple' : 'quality';
    }
  }

  return result;
}

/**
 * Get tile type from category
 */
function getCategoryType(category: TileCategory): 'building' | 'room' | 'street' {
  if (['nature', 'urban', 'street'].includes(category)) {
    return 'street';
  }
  if (['facade'].includes(category)) {
    return 'building';
  }
  return 'room';
}

// ============================================================================
// 10. ZONE TRANSITIONS
// ============================================================================

/**
 * Defines valid zone transitions (where you can go from each category)
 */
export const ZONE_TRANSITIONS: Record<TileCategory, TileCategory[]> = {
  // Outdoor
  nature: ['nature', 'street'],
  urban: ['urban', 'street', 'facade'],
  street: ['street', 'urban', 'nature', 'facade'],

  // Facade (bridge between outdoor and indoor)
  facade: ['street', 'foyer'],

  // Indoor
  foyer: ['facade', 'corridor', 'room', 'stairs'],
  corridor: ['foyer', 'corridor', 'room', 'stairs'],
  room: ['corridor', 'room'],
  stairs: ['corridor', 'foyer', 'basement', 'room'],

  // Underground
  basement: ['stairs', 'basement', 'crypt'],
  crypt: ['basement', 'crypt', 'stairs']
};

/**
 * Check if a transition between categories is valid
 */
export function canTransitionTo(from: TileCategory, to: TileCategory): boolean {
  return ZONE_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================================
// 11. PREVIEW SYSTEM
// ============================================================================

/**
 * Preview information for an unexplored adjacent tile
 */
export interface TilePreview {
  likelyCategory: TileCategory;
  possibleCategories: TileCategory[];
  isBuilding: boolean;
  isDangerous: boolean;
  previewIcon?: string;
}

/**
 * Get preview information for an adjacent tile position
 * @param board Current board state
 * @param q Target q coordinate
 * @param r Target r coordinate
 * @returns Preview information
 */
export function getPreviewForAdjacentTile(
  board: Map<string, Tile>,
  q: number,
  r: number
): TilePreview {
  const constraints = gatherConstraints(board, q, r);
  const validTemplates = findValidTemplates(constraints);

  // Count categories by weight
  const categoryCounts = new Map<TileCategory, number>();
  for (const match of validTemplates) {
    const cat = match.template.category;
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + match.matchScore);
  }

  // Find most likely category
  let maxWeight = 0;
  let likelyCategory: TileCategory = 'corridor';
  for (const [cat, weight] of categoryCounts) {
    if (weight > maxWeight) {
      maxWeight = weight;
      likelyCategory = cat;
    }
  }

  return {
    likelyCategory,
    possibleCategories: [...categoryCounts.keys()],
    isBuilding: validTemplates.some(m => m.template.category === 'facade'),
    isDangerous: validTemplates.some(m =>
      m.template.category === 'crypt' ||
      m.template.category === 'basement' ||
      (m.template.enemySpawnChance || 0) > 30
    ),
    previewIcon: getPreviewIcon(likelyCategory)
  };
}

/**
 * Get an icon for category preview
 */
function getPreviewIcon(category: TileCategory): string | undefined {
  const icons: Partial<Record<TileCategory, string>> = {
    facade: 'Home',
    foyer: 'DoorOpen',
    corridor: 'ArrowRight',
    room: 'Square',
    stairs: 'Stairs',
    basement: 'ArrowDown',
    crypt: 'Skull',
    street: 'Lamp',
    urban: 'Building',
    nature: 'TreePine'
  };
  return icons[category];
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Re-export for convenience
  TILE_TEMPLATES as templates
};
