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
// PRIORITY 1 - ESSENTIAL NEW TILES (12)
// ============================================================================

// ----- NEW FACADE TEMPLATES -----

export const FACADE_ASYLUM: TileTemplate = {
  id: 'facade_asylum',
  name: 'Arkham Asylum',
  category: 'facade',
  subType: 'asylum',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Brain',
  spawnWeight: 5,
  canRotate: true,
  description: 'Iron gates guard Arkham\'s infamous asylum. The screams from within are not always human.',
  enemySpawnChance: 15,
  possibleEnemies: ['cultist']
};

export const FACADE_HOSPITAL: TileTemplate = {
  id: 'facade_hospital',
  name: 'St. Mary\'s Hospital',
  category: 'facade',
  subType: 'hospital',
  edges: ['DOOR', 'WALL', 'DOOR', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Cross',
  spawnWeight: 7,
  canRotate: true,
  description: 'The hospital stands quiet. Too quiet. The emergency ward light flickers in a pattern.'
};

export const FACADE_MUSEUM: TileTemplate = {
  id: 'facade_museum',
  name: 'Arkham Historical Museum',
  category: 'facade',
  subType: 'museum',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Landmark',
  spawnWeight: 6,
  canRotate: true,
  description: 'Exhibits from civilizations that predate known history. The new Egyptian wing is closed indefinitely.'
};

export const FACADE_POLICE: TileTemplate = {
  id: 'facade_police',
  name: 'Arkham Police Station',
  category: 'facade',
  subType: 'police',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Shield',
  spawnWeight: 7,
  canRotate: true,
  description: 'The station is undermanned tonight. Case files on the desk describe things the police cannot fight.'
};

export const FACADE_WITCHHOUSE: TileTemplate = {
  id: 'facade_witchhouse',
  name: 'The Witch House',
  category: 'facade',
  subType: 'witchhouse',
  edges: ['DOOR', 'WALL', 'WALL', 'NATURE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Sparkles',
  spawnWeight: 3,
  canRotate: true,
  description: 'Keziah Mason\'s house. The angles are wrong—geometry that hurts to comprehend.',
  enemySpawnChance: 40,
  possibleEnemies: ['cultist', 'nightgaunt']
};

// ----- NEW ROOM TEMPLATES -----

export const ROOM_PARLOR: TileTemplate = {
  id: 'room_parlor',
  name: 'Victorian Parlor',
  category: 'room',
  subType: 'parlor',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Armchair',
  spawnWeight: 10,
  canRotate: true,
  description: 'Velvet curtains and a spirit board on the table. The planchette moves without touch.',
  possibleObjects: ['altar', 'cabinet']
};

export const ROOM_OFFICE: TileTemplate = {
  id: 'room_office',
  name: 'Administrator\'s Office',
  category: 'room',
  subType: 'office',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'FileText',
  spawnWeight: 12,
  canRotate: true,
  description: 'Filing cabinets overflow with documents. One drawer is labeled "DO NOT OPEN".',
  possibleObjects: ['cabinet', 'chest']
};

export const ROOM_GALLERY: TileTemplate = {
  id: 'room_gallery',
  name: 'Art Gallery',
  category: 'room',
  subType: 'gallery',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Frame',
  spawnWeight: 8,
  canRotate: true,
  description: 'Portraits of people who never existed. One canvas shows a place that will exist tomorrow.',
  possibleObjects: ['statue', 'painting']
};

export const ROOM_CONSERVATORY: TileTemplate = {
  id: 'room_conservatory',
  name: 'Overgrown Conservatory',
  category: 'room',
  subType: 'conservatory',
  edges: ['DOOR', 'WINDOW', 'WINDOW', 'WALL', 'WINDOW', 'WALL'],
  floorType: 'grass',
  zoneLevel: 1,
  watermarkIcon: 'Flower',
  spawnWeight: 6,
  canRotate: true,
  description: 'Plants have burst their pots, reclaiming the glass house. Some species are unknown to botany.'
};

// ----- NEW BASEMENT/CRYPT TEMPLATES -----

export const BASEMENT_MINE: TileTemplate = {
  id: 'basement_mine',
  name: 'Abandoned Mine Shaft',
  category: 'basement',
  subType: 'mine',
  edges: ['STAIRS_UP', 'WALL', 'OPEN', 'OPEN', 'WALL', 'WALL'],
  floorType: 'dirt',
  zoneLevel: -1,
  watermarkIcon: 'Pickaxe',
  spawnWeight: 6,
  canRotate: true,
  description: 'Timber supports groan under tons of earth. The miners dug too deep.',
  enemySpawnChance: 35,
  possibleEnemies: ['ghoul', 'formless_spawn']
};

export const CRYPT_SANCTUM: TileTemplate = {
  id: 'crypt_sanctum',
  name: 'Inner Sanctum',
  category: 'crypt',
  subType: 'sanctum',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'ritual',
  zoneLevel: -2,
  watermarkIcon: 'Eye',
  spawnWeight: 2,
  canRotate: true,
  description: 'The innermost chamber. Here the veil between worlds is thinnest.',
  possibleObjects: ['altar'],
  enemySpawnChance: 70,
  possibleEnemies: ['priest', 'dark_young']
};

export const CRYPT_MASSGRAVE: TileTemplate = {
  id: 'crypt_massgrave',
  name: 'Mass Grave',
  category: 'crypt',
  subType: 'massgrave',
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'dirt',
  zoneLevel: -2,
  watermarkIcon: 'Skull',
  spawnWeight: 4,
  canRotate: true,
  description: 'Bones upon bones. The plague dead were dumped here. Something stirs beneath.',
  enemySpawnChance: 60,
  possibleEnemies: ['ghoul', 'ghoul']
};

// ============================================================================
// PRIORITY 2 - GOOD VARIETY TILES (10)
// ============================================================================

// ----- NEW URBAN TEMPLATES -----

export const URBAN_STATION: TileTemplate = {
  id: 'urban_station',
  name: 'Arkham Train Station',
  category: 'urban',
  subType: 'station',
  edges: ['STREET', 'FACADE', 'STREET', 'STREET', 'WALL', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Train',
  spawnWeight: 5,
  canRotate: true,
  description: 'The last train to Boston left hours ago. The next arrival is not on any schedule.'
};

export const URBAN_MARKET: TileTemplate = {
  id: 'urban_market',
  name: 'Night Market',
  category: 'urban',
  subType: 'market',
  edges: ['STREET', 'STREET', 'STREET', 'STREET', 'FACADE', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'ShoppingBag',
  spawnWeight: 6,
  canRotate: true,
  description: 'Stalls selling curiosities. One merchant offers items that grant wishes—for a price.'
};

export const URBAN_PARK: TileTemplate = {
  id: 'urban_park',
  name: 'Independence Square Park',
  category: 'urban',
  subType: 'park',
  edges: ['STREET', 'NATURE', 'NATURE', 'STREET', 'NATURE', 'NATURE'],
  floorType: 'grass',
  zoneLevel: 0,
  watermarkIcon: 'TreePine',
  spawnWeight: 8,
  canRotate: true,
  description: 'The park bench faces a statue of the town founder. His stone eyes follow passersby.'
};

export const URBAN_DOCK: TileTemplate = {
  id: 'urban_dock',
  name: 'Fishing Dock',
  category: 'urban',
  subType: 'dock',
  edges: ['STREET', 'WATER', 'WATER', 'WATER', 'WATER', 'STREET'],
  floorType: 'wood',
  zoneLevel: 0,
  watermarkIcon: 'Ship',
  spawnWeight: 6,
  canRotate: true,
  description: 'Empty nets hang from hooks. The fishermen refuse to say what they saw in the deep.',
  enemySpawnChance: 40,
  possibleEnemies: ['deepone']
};

// ----- NEW STREET TEMPLATES -----

export const STREET_BRIDGE: TileTemplate = {
  id: 'street_bridge',
  name: 'Miskatonic Bridge',
  category: 'street',
  subType: 'bridge',
  edges: ['STREET', 'WATER', 'WATER', 'STREET', 'WATER', 'WATER'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'ArrowRight',
  spawnWeight: 5,
  canRotate: true,
  description: 'The old stone bridge over the Miskatonic. Something large moves in the water below.'
};

export const STREET_DEADEND: TileTemplate = {
  id: 'street_deadend',
  name: 'Dead End Alley',
  category: 'street',
  subType: 'deadend',
  edges: ['STREET', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  spawnWeight: 8,
  canRotate: true,
  description: 'A brick wall blocks the way. Fresh mortar seals something behind it.',
  possibleObjects: ['crate']
};

// ----- NEW NATURE TEMPLATES -----

export const NATURE_RUINS: TileTemplate = {
  id: 'nature_ruins',
  name: 'Ancient Ruins',
  category: 'nature',
  subType: 'ruins',
  edges: ['NATURE', 'NATURE', 'OPEN', 'NATURE', 'NATURE', 'OPEN'],
  floorType: 'stone',
  zoneLevel: 0,
  watermarkIcon: 'Columns',
  spawnWeight: 5,
  canRotate: true,
  description: 'Stone columns older than Rome. The architecture matches no known civilization.',
  possibleObjects: ['altar', 'statue'],
  enemySpawnChance: 30,
  possibleEnemies: ['cultist']
};

export const NATURE_SWAMP: TileTemplate = {
  id: 'nature_swamp',
  name: 'Fetid Swamp',
  category: 'nature',
  subType: 'swamp',
  edges: ['WATER', 'NATURE', 'WATER', 'WATER', 'NATURE', 'WATER'],
  floorType: 'water',
  zoneLevel: 0,
  watermarkIcon: 'Droplets',
  spawnWeight: 7,
  canRotate: true,
  description: 'Thick mist and treacherous footing. Things that were once human lurk here.',
  enemySpawnChance: 35,
  possibleEnemies: ['ghoul', 'deepone']
};

export const NATURE_CAVE: TileTemplate = {
  id: 'nature_cave',
  name: 'Cave Entrance',
  category: 'nature',
  subType: 'cave',
  edges: ['NATURE', 'WALL', 'WALL', 'STAIRS_DOWN', 'WALL', 'NATURE'],
  floorType: 'stone',
  zoneLevel: 0,
  watermarkIcon: 'Mountain',
  spawnWeight: 4,
  canRotate: true,
  description: 'A dark maw in the hillside. Cold air breathes from within, carrying whispers.'
};

export const NATURE_BLACKPOOL: TileTemplate = {
  id: 'nature_blackpool',
  name: 'The Black Pool',
  category: 'nature',
  subType: 'blackpool',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'water',
  zoneLevel: 0,
  watermarkIcon: 'Circle',
  spawnWeight: 3,
  canRotate: false,
  description: 'Water black as ink, perfectly still. Your reflection smiles when you do not.',
  enemySpawnChance: 25,
  possibleEnemies: ['deepone', 'formless_spawn']
};

// ============================================================================
// PRIORITY 3 - ATMOSPHERE TILES (8)
// ============================================================================

export const FACADE_HOTEL: TileTemplate = {
  id: 'facade_hotel',
  name: 'Grand Arkham Hotel',
  category: 'facade',
  subType: 'hotel',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Building',
  spawnWeight: 7,
  canRotate: true,
  description: 'Room 217 is always booked. The guests never check out.'
};

export const FACADE_LIGHTHOUSE: TileTemplate = {
  id: 'facade_lighthouse',
  name: 'Kingsport Lighthouse',
  category: 'facade',
  subType: 'lighthouse',
  edges: ['DOOR', 'WATER', 'WATER', 'NATURE', 'WATER', 'WATER'],
  floorType: 'stone',
  zoneLevel: 0,
  watermarkIcon: 'Lightbulb',
  spawnWeight: 3,
  canRotate: true,
  description: 'The light sweeps the waves. On foggy nights, it illuminates things in the sky.',
  enemySpawnChance: 20,
  possibleEnemies: ['byakhee']
};

export const FACADE_FUNERAL: TileTemplate = {
  id: 'facade_funeral',
  name: 'Christchurch Funeral Home',
  category: 'facade',
  subType: 'funeral',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Cross',
  spawnWeight: 5,
  canRotate: true,
  description: 'The mortician works late. His clients occasionally walk out on their own.',
  enemySpawnChance: 30,
  possibleEnemies: ['ghoul']
};

export const FACADE_FARMHOUSE: TileTemplate = {
  id: 'facade_farmhouse',
  name: 'Isolated Farmhouse',
  category: 'facade',
  subType: 'farmhouse',
  edges: ['DOOR', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'Home',
  spawnWeight: 5,
  canRotate: true,
  description: 'Miles from anywhere. The Whateleys lived here once. The barn still moves at night.'
};

export const ROOM_NURSERY: TileTemplate = {
  id: 'room_nursery',
  name: 'Abandoned Nursery',
  category: 'room',
  subType: 'nursery',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Baby',
  spawnWeight: 6,
  canRotate: true,
  description: 'A mobile spins without wind. The rocking chair moves to a rhythm only it hears.'
};

export const ROOM_MAPROOM: TileTemplate = {
  id: 'room_maproom',
  name: 'Cartographer\'s Study',
  category: 'room',
  subType: 'maproom',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Map',
  spawnWeight: 5,
  canRotate: true,
  description: 'Maps of places that don\'t exist. Or perhaps they exist elsewhere.',
  possibleObjects: ['bookshelf', 'cabinet']
};

export const BASEMENT_BOILER: TileTemplate = {
  id: 'basement_boiler',
  name: 'Boiler Room',
  category: 'basement',
  subType: 'boiler',
  edges: ['STAIRS_UP', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -1,
  watermarkIcon: 'Flame',
  spawnWeight: 8,
  canRotate: true,
  description: 'The furnace burns without fuel. Faces form in the flames.'
};

export const CRYPT_STARCHAMBER: TileTemplate = {
  id: 'crypt_starchamber',
  name: 'Star Chamber',
  category: 'crypt',
  subType: 'starchamber',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'ritual',
  zoneLevel: -2,
  watermarkIcon: 'Star',
  spawnWeight: 2,
  canRotate: true,
  description: 'The domed ceiling shows stars in wrong positions. This is the sky of another world.',
  possibleObjects: ['altar'],
  enemySpawnChance: 50,
  possibleEnemies: ['star_spawn', 'mi-go']
};

// ============================================================================
// PRIORITY 4 - NEW VARIETY TILES (20+)
// ============================================================================

// ----- NEW WATER/HARBOR TILES -----

export const URBAN_PIER: TileTemplate = {
  id: 'urban_pier',
  name: 'Rotting Pier',
  category: 'urban',
  subType: 'pier',
  edges: ['STREET', 'WATER', 'WATER', 'WATER', 'WATER', 'WATER'],
  floorType: 'wood',
  zoneLevel: 0,
  watermarkIcon: 'Anchor',
  spawnWeight: 5,
  canRotate: true,
  description: 'Wooden planks creak under your weight. Some are missing, revealing black water below.',
  enemySpawnChance: 35,
  possibleEnemies: ['deepone']
};

export const URBAN_BOATHOUSE: TileTemplate = {
  id: 'urban_boathouse',
  name: 'Abandoned Boathouse',
  category: 'urban',
  subType: 'boathouse',
  edges: ['STREET', 'WATER', 'WALL', 'WATER', 'WALL', 'WATER'],
  floorType: 'wood',
  zoneLevel: 0,
  watermarkIcon: 'Ship',
  spawnWeight: 4,
  canRotate: true,
  description: 'A ramshackle structure over the water. The boat inside has claw marks on the hull.',
  possibleObjects: ['crate', 'chest'],
  enemySpawnChance: 30,
  possibleEnemies: ['deepone', 'ghoul']
};

export const NATURE_SHORE: TileTemplate = {
  id: 'nature_shore',
  name: 'Rocky Shore',
  category: 'nature',
  subType: 'shore',
  edges: ['NATURE', 'WATER', 'WATER', 'WATER', 'NATURE', 'NATURE'],
  floorType: 'stone',
  zoneLevel: 0,
  watermarkIcon: 'Waves',
  spawnWeight: 8,
  canRotate: true,
  description: 'Waves crash against barnacle-covered rocks. Something glistens in the tide pools.'
};

export const NATURE_TIDEPOOLS: TileTemplate = {
  id: 'nature_tidepools',
  name: 'Eldritch Tide Pools',
  category: 'nature',
  subType: 'tidepools',
  edges: ['WATER', 'WATER', 'NATURE', 'WATER', 'WATER', 'NATURE'],
  floorType: 'water',
  zoneLevel: 0,
  watermarkIcon: 'Fish',
  spawnWeight: 4,
  canRotate: true,
  description: 'Strange creatures move in the shallow pools. Some have too many eyes.',
  enemySpawnChance: 20,
  possibleEnemies: ['deepone']
};

// ----- NEW STREET/URBAN TILES -----

export const STREET_FOGGY: TileTemplate = {
  id: 'street_foggy',
  name: 'Fog-Shrouded Lane',
  category: 'street',
  subType: 'foggy',
  edges: ['STREET', 'WALL', 'WALL', 'STREET', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Cloud',
  spawnWeight: 10,
  canRotate: true,
  description: 'Thick fog swallows all sound. Shapes move just beyond visibility.'
};

export const STREET_MARKET: TileTemplate = {
  id: 'street_market',
  name: 'Deserted Market Stalls',
  category: 'street',
  subType: 'marketstalls',
  edges: ['STREET', 'FACADE', 'STREET', 'STREET', 'FACADE', 'STREET'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'ShoppingBag',
  spawnWeight: 6,
  canRotate: true,
  description: 'Empty stalls with goods still displayed. The vendors vanished mid-transaction.',
  possibleObjects: ['crate']
};

export const URBAN_FOUNTAIN: TileTemplate = {
  id: 'urban_fountain',
  name: 'Dry Fountain',
  category: 'urban',
  subType: 'fountain',
  edges: ['STREET', 'STREET', 'STREET', 'STREET', 'STREET', 'STREET'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Droplets',
  spawnWeight: 4,
  canRotate: false,
  description: 'A fountain depicting nameless sea creatures. It runs with brackish water at midnight.'
};

export const URBAN_ALMSHOUSE: TileTemplate = {
  id: 'urban_almshouse',
  name: 'Derelict Almshouse',
  category: 'urban',
  subType: 'almshouse',
  edges: ['STREET', 'FACADE', 'WALL', 'STREET', 'WALL', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Users',
  spawnWeight: 5,
  canRotate: true,
  description: 'Shelter for the poor. The residents speak of things that visit at night.',
  enemySpawnChance: 15,
  possibleEnemies: ['cultist']
};

// ----- NEW NATURE TILES -----

export const NATURE_HILLTOP: TileTemplate = {
  id: 'nature_hilltop',
  name: 'Sentinel Hill',
  category: 'nature',
  subType: 'hilltop',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'grass',
  zoneLevel: 0,
  watermarkIcon: 'Mountain',
  spawnWeight: 5,
  canRotate: false,
  description: 'The highest point for miles. On certain nights, lights dance on its crown.',
  possibleObjects: ['altar'],
  enemySpawnChance: 20,
  possibleEnemies: ['cultist']
};

export const NATURE_DEADTREES: TileTemplate = {
  id: 'nature_deadtrees',
  name: 'Blighted Grove',
  category: 'nature',
  subType: 'deadtrees',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'TreePine',
  spawnWeight: 7,
  canRotate: false,
  description: 'Nothing grows here. The trees died standing and refuse to fall.'
};

export const NATURE_FARMFIELD: TileTemplate = {
  id: 'nature_farmfield',
  name: 'Abandoned Farm Field',
  category: 'nature',
  subType: 'farmfield',
  edges: ['NATURE', 'NATURE', 'OPEN', 'NATURE', 'NATURE', 'OPEN'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'Wheat',
  spawnWeight: 6,
  canRotate: true,
  description: 'Crops grow in impossible patterns. The scarecrows have moved since morning.'
};

// ----- NEW FOREST VARIANTS -----

export const NATURE_FOREST_DENSE: TileTemplate = {
  id: 'nature_forest_dense',
  name: 'Dense Thicket',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'TreeDeciduous',
  spawnWeight: 18,
  canRotate: false,
  description: 'Branches interlock overhead like grasping fingers. Thorns tear at your clothes.'
};

export const NATURE_FOREST_BIRCH: TileTemplate = {
  id: 'nature_forest_birch',
  name: 'Birch Grove',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'grass',
  zoneLevel: 0,
  watermarkIcon: 'TreeDeciduous',
  spawnWeight: 12,
  canRotate: false,
  description: 'White bark gleams in the darkness. The trees seem to sway without wind.'
};

export const NATURE_FOREST_PINE: TileTemplate = {
  id: 'nature_forest_pine',
  name: 'Pine Woods',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'TreePine',
  spawnWeight: 15,
  canRotate: false,
  description: 'Needle-covered ground muffles all sound. The resin smells faintly of decay.'
};

export const NATURE_FOREST_FALLEN: TileTemplate = {
  id: 'nature_forest_fallen',
  name: 'Fallen Giants',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'TreePine',
  spawnWeight: 10,
  canRotate: false,
  description: 'Ancient trees lie where they fell. Fungi grow in shapes that suggest faces.',
  possibleObjects: ['crate']
};

export const NATURE_FOREST_HAUNTED: TileTemplate = {
  id: 'nature_forest_haunted',
  name: 'Haunted Woods',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'Ghost',
  spawnWeight: 5,
  canRotate: false,
  description: 'Translucent shapes drift between the trees. The temperature drops suddenly.',
  enemySpawnChance: 30,
  possibleEnemies: ['nightgaunt', 'cultist']
};

// ----- FOREST TRAILS AND CROSSINGS -----

export const NATURE_TRAIL_CORNER: TileTemplate = {
  id: 'nature_trail_corner',
  name: 'Winding Trail',
  category: 'nature',
  subType: 'path',
  edges: ['OPEN', 'NATURE', 'OPEN', 'NATURE', 'NATURE', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  spawnWeight: 12,
  canRotate: true,
  description: 'The path turns sharply. Claw marks score the trees at the bend.'
};

export const NATURE_TRAIL_CROSSING: TileTemplate = {
  id: 'nature_trail_crossing',
  name: 'Forest Crossroads',
  category: 'nature',
  subType: 'path',
  edges: ['OPEN', 'NATURE', 'OPEN', 'OPEN', 'NATURE', 'OPEN'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'Signpost',
  spawnWeight: 6,
  canRotate: false,
  description: 'Four paths meet. A weathered signpost points in directions that make no sense.',
  possibleObjects: ['statue']
};

export const NATURE_TRAIL_T: TileTemplate = {
  id: 'nature_trail_t',
  name: 'Trail Fork',
  category: 'nature',
  subType: 'path',
  edges: ['OPEN', 'NATURE', 'OPEN', 'NATURE', 'OPEN', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  spawnWeight: 10,
  canRotate: true,
  description: 'The trail splits in three directions. Fresh footprints lead down each path.'
};

export const NATURE_FOREST_STREAM: TileTemplate = {
  id: 'nature_forest_stream',
  name: 'Forest Stream',
  category: 'nature',
  subType: 'forest',
  edges: ['NATURE', 'WATER', 'NATURE', 'NATURE', 'WATER', 'NATURE'],
  floorType: 'dirt',
  zoneLevel: 0,
  watermarkIcon: 'Droplets',
  spawnWeight: 8,
  canRotate: true,
  description: 'A stream cuts through the forest. The water runs too dark to see the bottom.'
};

// ----- NEW STREET VARIANTS -----

export const STREET_T_JUNCTION: TileTemplate = {
  id: 'street_t_junction',
  name: 'T-Junction',
  category: 'street',
  subType: 'junction',
  edges: ['STREET', 'FACADE', 'STREET', 'WALL', 'STREET', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Lamp',
  spawnWeight: 10,
  canRotate: true,
  description: 'Three streets meet. The streetlamp flickers in a rhythm like Morse code.'
};

export const STREET_WIDE: TileTemplate = {
  id: 'street_wide',
  name: 'Grand Boulevard',
  category: 'street',
  subType: 'boulevard',
  edges: ['STREET', 'FACADE', 'FACADE', 'STREET', 'FACADE', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Building2',
  spawnWeight: 8,
  canRotate: true,
  description: 'A wide avenue lined with gas lamps. The shadows between them are too deep.'
};

export const STREET_COBBLED: TileTemplate = {
  id: 'street_cobbled',
  name: 'Old Quarter Lane',
  category: 'street',
  subType: 'lane',
  edges: ['STREET', 'WALL', 'FACADE', 'STREET', 'WALL', 'FACADE'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  spawnWeight: 12,
  canRotate: true,
  description: 'Worn cobblestones from colonial times. Carriage tracks lead to doors that should not exist.'
};

export const STREET_NARROW: TileTemplate = {
  id: 'street_narrow',
  name: 'Cramped Passage',
  category: 'street',
  subType: 'passage',
  edges: ['STREET', 'WALL', 'WALL', 'STREET', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  spawnWeight: 10,
  canRotate: true,
  description: 'Walls close in on both sides. You can almost touch them with outstretched arms.'
};

export const STREET_RAILWAY: TileTemplate = {
  id: 'street_railway',
  name: 'Railway Crossing',
  category: 'street',
  subType: 'crossing',
  edges: ['STREET', 'WALL', 'WALL', 'STREET', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Train',
  spawnWeight: 5,
  canRotate: true,
  description: 'Rails cross the street. No train has run here in years, but you hear a distant whistle.'
};

// ----- HOSPITAL INTERIOR TILES -----

export const ROOM_HOSPITAL_WARD: TileTemplate = {
  id: 'room_hospital_ward',
  name: 'Hospital Ward',
  category: 'room',
  subType: 'hospital_ward',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'BedDouble',
  spawnWeight: 8,
  canRotate: true,
  description: 'Empty beds with restraints. Charts describe symptoms no medical text recognizes.',
  possibleObjects: ['cabinet']
};

export const ROOM_HOSPITAL_MORGUE: TileTemplate = {
  id: 'room_hospital_morgue',
  name: 'Hospital Morgue',
  category: 'room',
  subType: 'morgue',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Skull',
  spawnWeight: 4,
  canRotate: true,
  description: 'Cold storage for the deceased. One drawer is labeled with tomorrow\'s date.',
  enemySpawnChance: 20,
  possibleEnemies: ['ghoul']
};

export const ROOM_HOSPITAL_OPERATING: TileTemplate = {
  id: 'room_hospital_operating',
  name: 'Operating Theater',
  category: 'room',
  subType: 'operating',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Syringe',
  spawnWeight: 5,
  canRotate: true,
  description: 'Surgical tools laid out with precision. The drain is clogged with something organic.',
  possibleObjects: ['cabinet', 'chest']
};

export const ROOM_HOSPITAL_RECEPTION: TileTemplate = {
  id: 'room_hospital_reception',
  name: 'Hospital Reception',
  category: 'foyer',
  subType: 'hospital_foyer',
  edges: ['DOOR', 'WALL', 'DOOR', 'OPEN', 'DOOR', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'ClipboardList',
  spawnWeight: 6,
  canRotate: false,
  description: 'A reception desk with patient files. The waiting area chairs face the wrong direction.'
};

export const CORRIDOR_HOSPITAL: TileTemplate = {
  id: 'corridor_hospital',
  name: 'Hospital Corridor',
  category: 'corridor',
  subType: 'hospital',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'DOOR'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Stethoscope',
  spawnWeight: 10,
  canRotate: true,
  description: 'Fluorescent lights hum overhead. Some doors have been welded shut.'
};

export const ROOM_HOSPITAL_PHARMACY: TileTemplate = {
  id: 'room_hospital_pharmacy',
  name: 'Hospital Pharmacy',
  category: 'room',
  subType: 'pharmacy',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Pill',
  spawnWeight: 5,
  canRotate: true,
  description: 'Shelves of medication. Some bottles contain liquids of impossible colors.',
  possibleObjects: ['cabinet', 'chest']
};

// ----- POLICE STATION INTERIOR TILES -----

export const ROOM_POLICE_CELLS: TileTemplate = {
  id: 'room_police_cells',
  name: 'Holding Cells',
  category: 'room',
  subType: 'cells',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Lock',
  spawnWeight: 5,
  canRotate: true,
  description: 'Iron bars and concrete walls. Scratches on the ceiling spell out warnings.',
  enemySpawnChance: 15,
  possibleEnemies: ['cultist']
};

export const ROOM_POLICE_OFFICE: TileTemplate = {
  id: 'room_police_office',
  name: 'Detective\'s Office',
  category: 'room',
  subType: 'office',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Search',
  spawnWeight: 8,
  canRotate: true,
  description: 'Case files cover every surface. The evidence board connects to things that cannot be.',
  possibleObjects: ['cabinet', 'bookshelf']
};

export const ROOM_POLICE_EVIDENCE: TileTemplate = {
  id: 'room_police_evidence',
  name: 'Evidence Room',
  category: 'room',
  subType: 'evidence',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Package',
  spawnWeight: 4,
  canRotate: true,
  description: 'Tagged evidence from unsolved cases. Some items seem to move when unobserved.',
  possibleObjects: ['crate', 'chest', 'cabinet']
};

export const ROOM_POLICE_LOBBY: TileTemplate = {
  id: 'room_police_lobby',
  name: 'Police Station Lobby',
  category: 'foyer',
  subType: 'police_foyer',
  edges: ['DOOR', 'WALL', 'DOOR', 'OPEN', 'DOOR', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Badge',
  spawnWeight: 6,
  canRotate: false,
  description: 'A duty desk behind reinforced glass. Wanted posters show faces that seem familiar.'
};

export const CORRIDOR_POLICE: TileTemplate = {
  id: 'corridor_police',
  name: 'Station Corridor',
  category: 'corridor',
  subType: 'police',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Shield',
  spawnWeight: 10,
  canRotate: true,
  description: 'Bulletin boards with missing person reports. Too many match descriptions of you.'
};

export const ROOM_POLICE_ARMORY: TileTemplate = {
  id: 'room_police_armory',
  name: 'Police Armory',
  category: 'room',
  subType: 'armory',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Target',
  spawnWeight: 3,
  canRotate: true,
  description: 'Weapons rack with standard issue firearms. Some guns have been modified in unusual ways.',
  possibleObjects: ['crate', 'cabinet']
};

export const ROOM_POLICE_INTERROGATION: TileTemplate = {
  id: 'room_police_interrogation',
  name: 'Interrogation Room',
  category: 'room',
  subType: 'interrogation',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'MessageSquare',
  spawnWeight: 5,
  canRotate: true,
  description: 'A bare table and two chairs. The one-way mirror reflects something that isn\'t there.'
};

// ----- NEW ROOM TILES -----

export const ROOM_ATTIC: TileTemplate = {
  id: 'room_attic',
  name: 'Dusty Attic',
  category: 'room',
  subType: 'attic',
  edges: ['STAIRS_UP', 'WALL', 'WALL', 'WALL', 'WALL', 'WINDOW'],
  floorType: 'wood',
  zoneLevel: 2,
  watermarkIcon: 'Archive',
  spawnWeight: 8,
  canRotate: true,
  description: 'Generations of forgotten possessions. A trunk shakes though nothing disturbs it.',
  possibleObjects: ['chest', 'crate']
};

export const ROOM_BATHROOM: TileTemplate = {
  id: 'room_bathroom',
  name: 'Decrepit Bathroom',
  category: 'room',
  subType: 'bathroom',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: 1,
  watermarkIcon: 'Droplets',
  spawnWeight: 8,
  canRotate: true,
  description: 'Rust-stained fixtures. The mirror shows someone standing behind you.'
};

export const ROOM_CELLARWINE: TileTemplate = {
  id: 'room_cellarwine',
  name: 'Hidden Wine Vault',
  category: 'room',
  subType: 'cellarwine',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Wine',
  spawnWeight: 5,
  canRotate: true,
  description: 'Rare vintages line the walls. One bottle contains something that moves.',
  possibleObjects: ['cabinet']
};

export const ROOM_TROPHY: TileTemplate = {
  id: 'room_trophy',
  name: 'Trophy Room',
  category: 'room',
  subType: 'trophy',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Trophy',
  spawnWeight: 5,
  canRotate: true,
  description: 'Hunting trophies from three continents. Some species are unrecognizable.',
  possibleObjects: ['statue']
};

export const ROOM_MUSIC: TileTemplate = {
  id: 'room_music',
  name: 'Music Room',
  category: 'room',
  subType: 'music',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Music',
  spawnWeight: 6,
  canRotate: true,
  description: 'A grand piano plays by itself. The tune is not from any known composition.'
};

// ----- NEW BASEMENT TILES -----

export const BASEMENT_ICEHOUSE: TileTemplate = {
  id: 'basement_icehouse',
  name: 'Ice Storage',
  category: 'basement',
  subType: 'icehouse',
  edges: ['STAIRS_UP', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -1,
  watermarkIcon: 'Snowflake',
  spawnWeight: 6,
  canRotate: true,
  description: 'Blocks of ice preserve things that should have rotted long ago.'
};

export const BASEMENT_WORKSHOP: TileTemplate = {
  id: 'basement_workshop',
  name: 'Underground Workshop',
  category: 'basement',
  subType: 'workshop',
  edges: ['STAIRS_UP', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -1,
  watermarkIcon: 'Wrench',
  spawnWeight: 7,
  canRotate: true,
  description: 'Tools for crafts that have no name. The workbench shows signs of recent use.',
  possibleObjects: ['chest', 'crate']
};

export const BASEMENT_CISTERN: TileTemplate = {
  id: 'basement_cistern',
  name: 'Flooded Cistern',
  category: 'basement',
  subType: 'cistern',
  edges: ['OPEN', 'WATER', 'WATER', 'OPEN', 'WATER', 'WATER'],
  floorType: 'water',
  zoneLevel: -1,
  watermarkIcon: 'Waves',
  spawnWeight: 5,
  canRotate: true,
  description: 'Black water fills the ancient cistern. Ripples appear without wind.',
  enemySpawnChance: 35,
  possibleEnemies: ['deepone', 'formless_spawn']
};

// ----- NEW CRYPT TILES -----

export const CRYPT_OSSUARY: TileTemplate = {
  id: 'crypt_ossuary',
  name: 'Bone Ossuary',
  category: 'crypt',
  subType: 'ossuary',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: -2,
  watermarkIcon: 'Skull',
  spawnWeight: 6,
  canRotate: true,
  description: 'Walls decorated with human bones in artistic patterns. Some arrangements form symbols.',
  enemySpawnChance: 40,
  possibleEnemies: ['ghoul']
};

export const CRYPT_LABORATORY: TileTemplate = {
  id: 'crypt_laboratory',
  name: 'Forbidden Laboratory',
  category: 'crypt',
  subType: 'laboratory',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'tile',
  zoneLevel: -2,
  watermarkIcon: 'FlaskConical',
  spawnWeight: 3,
  canRotate: true,
  description: 'Reanimation equipment. The operating table has fresh stains.',
  possibleObjects: ['cabinet', 'chest'],
  enemySpawnChance: 50,
  possibleEnemies: ['formless_spawn', 'ghoul']
};

export const CRYPT_PRISON: TileTemplate = {
  id: 'crypt_prison',
  name: 'Ancient Prison',
  category: 'crypt',
  subType: 'prison',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'DOOR', 'WALL'],
  floorType: 'stone',
  zoneLevel: -2,
  watermarkIcon: 'Lock',
  spawnWeight: 4,
  canRotate: true,
  description: 'Cells designed to hold things that walls cannot contain.',
  enemySpawnChance: 60,
  possibleEnemies: ['formless_spawn', 'shoggoth']
};

// ----- NEW FACADE TILES -----

export const FACADE_TAVERN: TileTemplate = {
  id: 'facade_tavern',
  name: 'The Miskatonic Arms',
  category: 'facade',
  subType: 'tavern',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'Beer',
  spawnWeight: 8,
  canRotate: true,
  description: 'A tavern for sailors and worse. They speak of things seen at sea.'
};

export const FACADE_BOOKSHOP: TileTemplate = {
  id: 'facade_bookshop',
  name: 'Curious Book Shop',
  category: 'facade',
  subType: 'bookshop',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'BookOpen',
  spawnWeight: 6,
  canRotate: true,
  description: 'Rare texts from around the world. The proprietor never shows his face in daylight.'
};

export const FACADE_PAWNSHOP: TileTemplate = {
  id: 'facade_pawnshop',
  name: 'Midnight Pawn Shop',
  category: 'facade',
  subType: 'pawnshop',
  edges: ['DOOR', 'WALL', 'WALL', 'FACADE', 'WALL', 'WALL'],
  floorType: 'cobblestone',
  zoneLevel: 0,
  watermarkIcon: 'DollarSign',
  spawnWeight: 7,
  canRotate: true,
  description: 'Items of questionable origin. Some previous owners came to bad ends.'
};

export const FACADE_OBSERVATORY: TileTemplate = {
  id: 'facade_observatory',
  name: 'Abandoned Observatory',
  category: 'facade',
  subType: 'observatory',
  edges: ['DOOR', 'NATURE', 'WALL', 'NATURE', 'WALL', 'NATURE'],
  floorType: 'stone',
  zoneLevel: 0,
  watermarkIcon: 'Star',
  spawnWeight: 3,
  canRotate: true,
  description: 'The telescope points at empty sky. But the astronomers saw something there.',
  enemySpawnChance: 25,
  possibleEnemies: ['mi-go', 'byakhee']
};

// ----- ASYLUM INTERIOR TEMPLATES -----

export const FOYER_ASYLUM: TileTemplate = {
  id: 'foyer_asylum',
  name: 'Asylum Reception',
  category: 'foyer',
  subType: 'asylum',
  edges: ['DOOR', 'WALL', 'DOOR', 'OPEN', 'DOOR', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'ClipboardList',
  spawnWeight: 8,
  canRotate: false,
  description: 'Iron bars separate visitors from patients. The reception desk is stained with old coffee and tears.',
  possibleObjects: ['desk', 'cabinet']
};

export const CORRIDOR_ASYLUM: TileTemplate = {
  id: 'corridor_asylum',
  name: 'Asylum Corridor',
  category: 'corridor',
  subType: 'asylum',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'DOOR'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Lock',
  spawnWeight: 12,
  canRotate: true,
  description: 'Whitewashed walls. Numbered doors with small windows. Someone is always watching.',
  enemySpawnChance: 20,
  possibleEnemies: ['cultist']
};

export const ROOM_ASYLUM_CELL: TileTemplate = {
  id: 'room_asylum_cell',
  name: 'Padded Cell',
  category: 'room',
  subType: 'asylum_cell',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'Square',
  spawnWeight: 10,
  canRotate: true,
  description: 'Soft walls absorb screams. Scratched into the padding: "IT SEES THROUGH YOUR EYES".',
  enemySpawnChance: 30,
  possibleEnemies: ['cultist']
};

export const ROOM_ASYLUM_WARD: TileTemplate = {
  id: 'room_asylum_ward',
  name: 'Disturbed Ward',
  category: 'room',
  subType: 'asylum_ward',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'Users',
  spawnWeight: 8,
  canRotate: true,
  description: 'Iron beds in rows. Some patients rock silently. Others describe the same nightmare.',
  possibleObjects: ['bed', 'cabinet'],
  enemySpawnChance: 25,
  possibleEnemies: ['cultist', 'formless_spawn']
};

export const ROOM_ASYLUM_OFFICE: TileTemplate = {
  id: 'room_asylum_office',
  name: "Director's Office",
  category: 'room',
  subType: 'asylum_office',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WINDOW', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'FileText',
  spawnWeight: 6,
  canRotate: true,
  description: 'Patient files fill the cabinets. One drawer is marked "SPECIAL CASES" and sealed with wax.',
  possibleObjects: ['desk', 'bookshelf', 'cabinet']
};

export const ROOM_ASYLUM_THERAPY: TileTemplate = {
  id: 'room_asylum_therapy',
  name: 'Hydrotherapy Room',
  category: 'room',
  subType: 'asylum_therapy',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'Droplets',
  spawnWeight: 5,
  canRotate: true,
  description: 'Rusted tubs and restraints. The drains are clogged with something that moves.',
  enemySpawnChance: 35,
  possibleEnemies: ['formless_spawn', 'deep_one']
};

export const BASEMENT_ASYLUM: TileTemplate = {
  id: 'basement_asylum',
  name: 'Asylum Basement',
  category: 'basement',
  subType: 'asylum',
  edges: ['OPEN', 'WALL', 'WALL', 'WALL', 'OPEN', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'FlaskConical',
  spawnWeight: 5,
  canRotate: true,
  description: 'Discontinued treatments. Jars of preserved specimens. Some jars are empty but still sealed.',
  possibleObjects: ['crate', 'barrel'],
  enemySpawnChance: 40,
  possibleEnemies: ['ghoul', 'formless_spawn']
};

// ----- MUSEUM INTERIOR TEMPLATES -----

export const FOYER_MUSEUM: TileTemplate = {
  id: 'foyer_museum',
  name: 'Museum Lobby',
  category: 'foyer',
  subType: 'museum',
  edges: ['DOOR', 'WALL', 'OPEN', 'OPEN', 'OPEN', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Landmark',
  spawnWeight: 8,
  canRotate: false,
  description: 'Marble floors reflect gas lamps. The donation box overflows with foreign coins.',
  possibleObjects: ['statue', 'bench']
};

export const CORRIDOR_MUSEUM: TileTemplate = {
  id: 'corridor_museum',
  name: 'Exhibition Hall',
  category: 'corridor',
  subType: 'museum',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'DOOR'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'Frame',
  spawnWeight: 10,
  canRotate: true,
  description: 'Glass cases line the walls. The exhibits seem to rearrange when no one watches.',
  possibleObjects: ['display_case', 'statue']
};

export const ROOM_MUSEUM_EGYPTIAN: TileTemplate = {
  id: 'room_museum_egyptian',
  name: 'Egyptian Wing',
  category: 'room',
  subType: 'museum_egyptian',
  edges: ['DOOR', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'Pyramid',
  spawnWeight: 7,
  canRotate: true,
  description: 'Sarcophagi stand sentinel. The mummy\'s wrappings twitch in drafts that don\'t exist.',
  possibleObjects: ['sarcophagus', 'statue', 'display_case'],
  enemySpawnChance: 30,
  possibleEnemies: ['cultist', 'nightgaunt']
};

export const ROOM_MUSEUM_NATURAL: TileTemplate = {
  id: 'room_museum_natural',
  name: 'Natural History Hall',
  category: 'room',
  subType: 'museum_natural',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Bone',
  spawnWeight: 8,
  canRotate: true,
  description: 'Dinosaur bones tower overhead. Taxidermied eyes follow your movement.',
  possibleObjects: ['display_case', 'skeleton']
};

export const ROOM_MUSEUM_OCCULT: TileTemplate = {
  id: 'room_museum_occult',
  name: 'Restricted Collection',
  category: 'room',
  subType: 'museum_occult',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  floorType: 'wood',
  zoneLevel: 2,
  watermarkIcon: 'Ban',
  spawnWeight: 4,
  canRotate: true,
  description: 'Items too dangerous for public display. The warning signs are written in dead languages.',
  possibleObjects: ['display_case', 'bookshelf', 'artifact'],
  enemySpawnChance: 40,
  possibleEnemies: ['cultist', 'dark_priest', 'mi-go']
};

export const ROOM_MUSEUM_ARCHIVE: TileTemplate = {
  id: 'room_museum_archive',
  name: "Curator's Archive",
  category: 'room',
  subType: 'museum_archive',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WINDOW', 'WALL'],
  floorType: 'wood',
  zoneLevel: 2,
  watermarkIcon: 'Archive',
  spawnWeight: 6,
  canRotate: true,
  description: 'Acquisition records and provenance documents. Some artifacts have no origin listed.',
  possibleObjects: ['desk', 'bookshelf', 'cabinet']
};

// ----- HOTEL INTERIOR TEMPLATES -----

export const FOYER_HOTEL: TileTemplate = {
  id: 'foyer_hotel',
  name: 'Hotel Lobby',
  category: 'foyer',
  subType: 'hotel',
  edges: ['DOOR', 'WALL', 'OPEN', 'OPEN', 'OPEN', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'ConciergeBell',
  spawnWeight: 8,
  canRotate: false,
  description: 'Faded elegance. The guest register shows the same handwriting for decades of entries.',
  possibleObjects: ['desk', 'couch', 'luggage']
};

export const CORRIDOR_HOTEL: TileTemplate = {
  id: 'corridor_hotel',
  name: 'Hotel Hallway',
  category: 'corridor',
  subType: 'hotel',
  edges: ['OPEN', 'DOOR', 'DOOR', 'OPEN', 'DOOR', 'DOOR'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'DoorClosed',
  spawnWeight: 12,
  canRotate: true,
  description: 'Numbered doors line the corridor. Room 313 has no number plate.',
  enemySpawnChance: 15,
  possibleEnemies: ['cultist']
};

export const ROOM_HOTEL_GUEST: TileTemplate = {
  id: 'room_hotel_guest',
  name: 'Guest Room',
  category: 'room',
  subType: 'hotel_guest',
  edges: ['DOOR', 'WALL', 'WALL', 'WALL', 'WINDOW', 'WALL'],
  floorType: 'wood',
  zoneLevel: 1,
  watermarkIcon: 'Bed',
  spawnWeight: 15,
  canRotate: true,
  description: 'A modest room. Previous guests left behind more than just belongings.',
  possibleObjects: ['bed', 'wardrobe', 'desk']
};

export const ROOM_HOTEL_SUITE: TileTemplate = {
  id: 'room_hotel_suite',
  name: 'Penthouse Suite',
  category: 'room',
  subType: 'hotel_suite',
  edges: ['DOOR', 'WINDOW', 'WALL', 'DOOR', 'WINDOW', 'WALL'],
  floorType: 'wood',
  zoneLevel: 2,
  watermarkIcon: 'Crown',
  spawnWeight: 5,
  canRotate: true,
  description: 'Luxurious and spacious. The permanent resident checked in forty years ago.',
  possibleObjects: ['bed', 'couch', 'desk', 'safe'],
  enemySpawnChance: 25,
  possibleEnemies: ['cultist', 'ghoul']
};

export const ROOM_HOTEL_KITCHEN: TileTemplate = {
  id: 'room_hotel_kitchen',
  name: 'Hotel Kitchen',
  category: 'room',
  subType: 'hotel_kitchen',
  edges: ['DOOR', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 1,
  watermarkIcon: 'ChefHat',
  spawnWeight: 6,
  canRotate: true,
  description: 'Industrial stoves and meat lockers. The menu never changes, but the ingredients do.',
  possibleObjects: ['stove', 'cabinet', 'crate']
};

export const BASEMENT_HOTEL: TileTemplate = {
  id: 'basement_hotel',
  name: 'Hotel Basement',
  category: 'basement',
  subType: 'hotel',
  edges: ['OPEN', 'WALL', 'WALL', 'OPEN', 'WALL', 'WALL'],
  floorType: 'stone',
  zoneLevel: 2,
  watermarkIcon: 'Wine',
  spawnWeight: 6,
  canRotate: true,
  description: 'Wine cellar and storage. The oldest bottles predate the hotel itself.',
  possibleObjects: ['barrel', 'crate', 'wine_rack'],
  enemySpawnChance: 30,
  possibleEnemies: ['ghoul', 'cultist']
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
  foyer_asylum: FOYER_ASYLUM,
  foyer_museum: FOYER_MUSEUM,
  foyer_hotel: FOYER_HOTEL,

  // Corridor
  corridor_straight: CORRIDOR_STRAIGHT,
  corridor_t: CORRIDOR_T,
  corridor_corner: CORRIDOR_CORNER,
  corridor_cross: CORRIDOR_CROSS,
  corridor_wide: CORRIDOR_WIDE,
  corridor_asylum: CORRIDOR_ASYLUM,
  corridor_museum: CORRIDOR_MUSEUM,
  corridor_hotel: CORRIDOR_HOTEL,

  // Room (original)
  room_study: ROOM_STUDY,
  room_bedroom: ROOM_BEDROOM,
  room_kitchen: ROOM_KITCHEN,
  room_ritual: ROOM_RITUAL,
  room_library: ROOM_LIBRARY,
  room_lab: ROOM_LAB,
  room_dining: ROOM_DINING,
  room_living: ROOM_LIVING,
  // Room (priority 1)
  room_parlor: ROOM_PARLOR,
  room_office: ROOM_OFFICE,
  room_gallery: ROOM_GALLERY,
  room_conservatory: ROOM_CONSERVATORY,
  // Room (priority 3)
  room_nursery: ROOM_NURSERY,
  room_maproom: ROOM_MAPROOM,
  // Room (priority 4)
  room_attic: ROOM_ATTIC,
  room_bathroom: ROOM_BATHROOM,
  room_cellarwine: ROOM_CELLARWINE,
  room_trophy: ROOM_TROPHY,
  room_music: ROOM_MUSIC,
  // Asylum interior rooms
  room_asylum_cell: ROOM_ASYLUM_CELL,
  room_asylum_ward: ROOM_ASYLUM_WARD,
  room_asylum_office: ROOM_ASYLUM_OFFICE,
  room_asylum_therapy: ROOM_ASYLUM_THERAPY,
  // Museum interior rooms
  room_museum_egyptian: ROOM_MUSEUM_EGYPTIAN,
  room_museum_natural: ROOM_MUSEUM_NATURAL,
  room_museum_occult: ROOM_MUSEUM_OCCULT,
  room_museum_archive: ROOM_MUSEUM_ARCHIVE,
  // Hotel interior rooms
  room_hotel_guest: ROOM_HOTEL_GUEST,
  room_hotel_suite: ROOM_HOTEL_SUITE,
  room_hotel_kitchen: ROOM_HOTEL_KITCHEN,

  // Stairs
  stairs_down: STAIRS_DOWN,
  stairs_up: STAIRS_UP,
  stairs_spiral: STAIRS_SPIRAL,

  // Basement (original)
  basement_cellar: BASEMENT_CELLAR,
  basement_wine: BASEMENT_WINE,
  basement_tunnel: BASEMENT_TUNNEL,
  basement_sewer: BASEMENT_SEWER,
  // Basement (priority 2)
  basement_mine: BASEMENT_MINE,
  basement_boiler: BASEMENT_BOILER,
  // Basement (priority 4)
  basement_icehouse: BASEMENT_ICEHOUSE,
  basement_workshop: BASEMENT_WORKSHOP,
  basement_cistern: BASEMENT_CISTERN,
  // Asylum and Hotel basements
  basement_asylum: BASEMENT_ASYLUM,
  basement_hotel: BASEMENT_HOTEL,

  // Crypt (original)
  crypt_tomb: CRYPT_TOMB,
  crypt_altar: CRYPT_ALTAR,
  crypt_tunnel: CRYPT_TUNNEL,
  crypt_portal: CRYPT_PORTAL,
  // Crypt (priority 1)
  crypt_sanctum: CRYPT_SANCTUM,
  crypt_massgrave: CRYPT_MASSGRAVE,
  crypt_starchamber: CRYPT_STARCHAMBER,
  // Crypt (priority 4)
  crypt_ossuary: CRYPT_OSSUARY,
  crypt_laboratory: CRYPT_LABORATORY,
  crypt_prison: CRYPT_PRISON,

  // Facade (original)
  facade_manor: FACADE_MANOR,
  facade_shop: FACADE_SHOP,
  facade_church: FACADE_CHURCH,
  facade_warehouse: FACADE_WAREHOUSE,
  // Facade (priority 1)
  facade_asylum: FACADE_ASYLUM,
  facade_hospital: FACADE_HOSPITAL,
  facade_museum: FACADE_MUSEUM,
  facade_police: FACADE_POLICE,
  facade_witchhouse: FACADE_WITCHHOUSE,
  // Facade (priority 3)
  facade_hotel: FACADE_HOTEL,
  facade_lighthouse: FACADE_LIGHTHOUSE,
  facade_funeral: FACADE_FUNERAL,
  facade_farmhouse: FACADE_FARMHOUSE,
  // Facade (priority 4)
  facade_tavern: FACADE_TAVERN,
  facade_bookshop: FACADE_BOOKSHOP,
  facade_pawnshop: FACADE_PAWNSHOP,
  facade_observatory: FACADE_OBSERVATORY,

  // Street (original)
  street_main: STREET_MAIN,
  street_alley: STREET_ALLEY,
  street_crossing: STREET_CROSSING,
  street_corner: STREET_CORNER,
  // Street (priority 2)
  street_bridge: STREET_BRIDGE,
  street_deadend: STREET_DEADEND,
  // Street (priority 4)
  street_foggy: STREET_FOGGY,
  street_market: STREET_MARKET,

  // Urban (original)
  urban_square: URBAN_SQUARE,
  urban_harbor: URBAN_HARBOR,
  urban_cemetery: URBAN_CEMETERY,
  // Urban (priority 2)
  urban_station: URBAN_STATION,
  urban_market: URBAN_MARKET,
  urban_park: URBAN_PARK,
  urban_dock: URBAN_DOCK,
  // Urban (priority 4)
  urban_pier: URBAN_PIER,
  urban_boathouse: URBAN_BOATHOUSE,
  urban_fountain: URBAN_FOUNTAIN,
  urban_almshouse: URBAN_ALMSHOUSE,

  // Nature (original)
  nature_forest: NATURE_FOREST,
  nature_clearing: NATURE_CLEARING,
  nature_path: NATURE_PATH,
  nature_marsh: NATURE_MARSH,
  nature_stones: NATURE_STONES,
  // Nature (priority 2)
  nature_ruins: NATURE_RUINS,
  nature_swamp: NATURE_SWAMP,
  nature_cave: NATURE_CAVE,
  nature_blackpool: NATURE_BLACKPOOL,
  // Nature (priority 4)
  nature_shore: NATURE_SHORE,
  nature_tidepools: NATURE_TIDEPOOLS,
  nature_hilltop: NATURE_HILLTOP,
  nature_deadtrees: NATURE_DEADTREES,
  nature_farmfield: NATURE_FARMFIELD,
  // New forest variants
  nature_forest_dense: NATURE_FOREST_DENSE,
  nature_forest_birch: NATURE_FOREST_BIRCH,
  nature_forest_pine: NATURE_FOREST_PINE,
  nature_forest_fallen: NATURE_FOREST_FALLEN,
  nature_forest_haunted: NATURE_FOREST_HAUNTED,
  // Forest trails and crossings
  nature_trail_corner: NATURE_TRAIL_CORNER,
  nature_trail_crossing: NATURE_TRAIL_CROSSING,
  nature_trail_t: NATURE_TRAIL_T,
  nature_forest_stream: NATURE_FOREST_STREAM,
  // New street variants
  street_t_junction: STREET_T_JUNCTION,
  street_wide: STREET_WIDE,
  street_cobbled: STREET_COBBLED,
  street_narrow: STREET_NARROW,
  street_railway: STREET_RAILWAY,
  // Hospital interior tiles
  room_hospital_ward: ROOM_HOSPITAL_WARD,
  room_hospital_morgue: ROOM_HOSPITAL_MORGUE,
  room_hospital_operating: ROOM_HOSPITAL_OPERATING,
  room_hospital_reception: ROOM_HOSPITAL_RECEPTION,
  corridor_hospital: CORRIDOR_HOSPITAL,
  room_hospital_pharmacy: ROOM_HOSPITAL_PHARMACY,
  // Police station interior tiles
  room_police_cells: ROOM_POLICE_CELLS,
  room_police_office: ROOM_POLICE_OFFICE,
  room_police_evidence: ROOM_POLICE_EVIDENCE,
  room_police_lobby: ROOM_POLICE_LOBBY,
  corridor_police: CORRIDOR_POLICE,
  room_police_armory: ROOM_POLICE_ARMORY,
  room_police_interrogation: ROOM_POLICE_INTERROGATION
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
// 5.5 TILE AFFINITY SYSTEM
// ============================================================================

/**
 * Tile Affinity System
 *
 * Tiles can "attract" other tiles based on thematic connections.
 * When a tile with affinities is nearby, templates that match those affinities
 * get bonus spawn weight.
 *
 * Example: A "Fishing Dock" attracts water tiles, more docks, harbor-related tiles
 */

/**
 * Affinity definition - what tiles/features a template attracts
 */
export interface TileAffinity {
  /** Template IDs that this tile attracts */
  attractsTemplates?: string[];
  /** Categories that get bonus weight when adjacent to this tile */
  attractsCategories?: TileCategory[];
  /** Floor types that get bonus weight */
  attractsFloorTypes?: FloorType[];
  /** SubTypes that get bonus weight */
  attractsSubTypes?: string[];
  /** Edge types - tiles with these edges get bonus */
  attractsEdgeTypes?: ConnectionEdgeType[];
  /** Bonus weight multiplier (default 1.5 = 50% bonus) */
  bonusMultiplier?: number;
}

/**
 * Map of template IDs to their affinities
 * Templates with affinities "pull" similar tiles towards them
 */
export const TILE_AFFINITIES: Record<string, TileAffinity> = {
  // Water/Harbor tiles attract water and aquatic themes
  urban_dock: {
    attractsTemplates: ['urban_dock', 'urban_harbor', 'street_bridge', 'nature_swamp', 'nature_marsh', 'basement_sewer'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    attractsSubTypes: ['dock', 'harbor', 'bridge', 'sewer', 'marsh', 'swamp'],
    bonusMultiplier: 2.0
  },
  urban_harbor: {
    attractsTemplates: ['urban_dock', 'urban_harbor', 'street_bridge', 'facade_lighthouse', 'facade_warehouse'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    attractsSubTypes: ['dock', 'harbor', 'warehouse', 'lighthouse'],
    bonusMultiplier: 1.8
  },
  street_bridge: {
    attractsTemplates: ['urban_dock', 'urban_harbor', 'nature_marsh', 'nature_swamp'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    bonusMultiplier: 1.5
  },
  facade_lighthouse: {
    attractsTemplates: ['urban_harbor', 'urban_dock', 'street_bridge'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    bonusMultiplier: 1.8
  },

  // Cemetery/death tiles attract crypts, ghouls, undead themes
  urban_cemetery: {
    attractsTemplates: ['crypt_tomb', 'crypt_massgrave', 'crypt_altar', 'facade_funeral', 'facade_church'],
    attractsCategories: ['crypt'],
    attractsSubTypes: ['tomb', 'massgrave', 'funeral', 'church', 'altar'],
    bonusMultiplier: 2.0
  },
  facade_funeral: {
    attractsTemplates: ['urban_cemetery', 'crypt_tomb', 'crypt_massgrave'],
    attractsCategories: ['crypt'],
    attractsSubTypes: ['cemetery', 'tomb'],
    bonusMultiplier: 1.8
  },

  // Church/religious tiles attract ritual and occult themes
  facade_church: {
    attractsTemplates: ['foyer_church', 'room_ritual', 'crypt_altar', 'urban_cemetery'],
    attractsCategories: ['crypt'],
    attractsSubTypes: ['church', 'ritual', 'altar', 'cemetery'],
    bonusMultiplier: 1.6
  },
  room_ritual: {
    attractsTemplates: ['crypt_altar', 'crypt_sanctum', 'crypt_portal', 'nature_stones'],
    attractsFloorTypes: ['ritual'],
    attractsSubTypes: ['altar', 'sanctum', 'portal', 'stones'],
    bonusMultiplier: 2.0
  },
  crypt_altar: {
    attractsTemplates: ['crypt_sanctum', 'crypt_portal', 'room_ritual', 'crypt_starchamber'],
    attractsFloorTypes: ['ritual'],
    attractsCategories: ['crypt'],
    bonusMultiplier: 1.8
  },

  // Forest/nature tiles attract more nature
  nature_forest: {
    attractsTemplates: ['nature_forest', 'nature_clearing', 'nature_path', 'nature_ruins', 'nature_stones'],
    attractsCategories: ['nature'],
    attractsFloorTypes: ['dirt', 'grass'],
    bonusMultiplier: 1.5
  },
  nature_marsh: {
    attractsTemplates: ['nature_swamp', 'nature_blackpool', 'nature_marsh', 'basement_sewer'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER', 'NATURE'],
    bonusMultiplier: 1.8
  },
  nature_swamp: {
    attractsTemplates: ['nature_marsh', 'nature_blackpool', 'nature_swamp'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    bonusMultiplier: 1.8
  },

  // Cave/underground attracts basement and crypt
  nature_cave: {
    attractsTemplates: ['basement_mine', 'basement_tunnel', 'crypt_tunnel'],
    attractsCategories: ['basement', 'crypt'],
    attractsSubTypes: ['mine', 'tunnel'],
    bonusMultiplier: 2.0
  },
  basement_mine: {
    attractsTemplates: ['basement_mine', 'basement_tunnel', 'nature_cave', 'crypt_tunnel'],
    attractsSubTypes: ['mine', 'tunnel', 'cave'],
    bonusMultiplier: 1.6
  },

  // Asylum/hospital medical theme
  facade_asylum: {
    attractsTemplates: ['facade_hospital', 'room_lab'],
    attractsSubTypes: ['hospital', 'lab', 'asylum'],
    bonusMultiplier: 1.5
  },
  facade_hospital: {
    attractsTemplates: ['facade_asylum', 'room_lab'],
    attractsSubTypes: ['asylum', 'lab'],
    bonusMultiplier: 1.5
  },

  // Academic/scholarly theme
  facade_museum: {
    attractsTemplates: ['room_library', 'room_gallery', 'room_maproom', 'room_study'],
    attractsSubTypes: ['library', 'gallery', 'study', 'maproom'],
    bonusMultiplier: 1.6
  },
  room_library: {
    attractsTemplates: ['room_study', 'room_maproom', 'facade_museum'],
    attractsSubTypes: ['study', 'maproom', 'museum'],
    bonusMultiplier: 1.4
  },

  // Occult theme clustering
  facade_witchhouse: {
    attractsTemplates: ['room_ritual', 'crypt_altar', 'crypt_portal', 'nature_stones'],
    attractsFloorTypes: ['ritual'],
    attractsCategories: ['crypt'],
    bonusMultiplier: 2.0
  },
  nature_stones: {
    attractsTemplates: ['nature_clearing', 'room_ritual', 'crypt_altar', 'facade_witchhouse'],
    attractsFloorTypes: ['ritual'],
    attractsSubTypes: ['clearing', 'ritual', 'witchhouse'],
    bonusMultiplier: 1.8
  },

  // Warehouse/industrial theme
  facade_warehouse: {
    attractsTemplates: ['urban_dock', 'urban_harbor', 'basement_cellar', 'basement_boiler'],
    attractsSubTypes: ['dock', 'harbor', 'cellar', 'boiler'],
    bonusMultiplier: 1.5
  },

  // Street connectivity
  street_main: {
    attractsTemplates: ['street_main', 'street_corner', 'street_crossing', 'facade_shop'],
    attractsCategories: ['street', 'facade'],
    bonusMultiplier: 1.3
  },
  street_alley: {
    attractsTemplates: ['street_alley', 'street_deadend', 'facade_warehouse'],
    attractsSubTypes: ['alley', 'deadend', 'warehouse'],
    bonusMultiplier: 1.4
  },

  // Park attracts nature
  urban_park: {
    attractsTemplates: ['nature_forest', 'nature_clearing', 'nature_path', 'urban_cemetery'],
    attractsCategories: ['nature'],
    attractsFloorTypes: ['grass'],
    bonusMultiplier: 1.6
  },

  // Train station attracts urban
  urban_station: {
    attractsTemplates: ['street_main', 'urban_square', 'facade_hotel'],
    attractsCategories: ['urban', 'street'],
    bonusMultiplier: 1.4
  },

  // Hotel attracts rooms
  facade_hotel: {
    attractsTemplates: ['room_bedroom', 'corridor_wide', 'room_dining'],
    attractsSubTypes: ['bedroom', 'dining', 'gallery'],
    bonusMultiplier: 1.5
  },

  // Sewer attracts water and underground
  basement_sewer: {
    attractsTemplates: ['basement_sewer', 'basement_tunnel', 'crypt_tunnel', 'basement_cistern'],
    attractsFloorTypes: ['water'],
    attractsSubTypes: ['sewer', 'tunnel', 'cistern'],
    bonusMultiplier: 1.8
  },

  // ----- NEW AFFINITIES FOR PRIORITY 4 TILES -----

  // Pier and boathouse attract water tiles
  urban_pier: {
    attractsTemplates: ['urban_dock', 'urban_harbor', 'urban_boathouse', 'nature_shore', 'nature_tidepools'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    attractsSubTypes: ['dock', 'harbor', 'boathouse', 'shore'],
    bonusMultiplier: 2.0
  },
  urban_boathouse: {
    attractsTemplates: ['urban_pier', 'urban_dock', 'urban_harbor', 'nature_shore'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    bonusMultiplier: 1.8
  },

  // Shore and tidepools attract aquatic themes
  nature_shore: {
    attractsTemplates: ['nature_tidepools', 'urban_pier', 'urban_dock', 'nature_marsh'],
    attractsFloorTypes: ['water', 'stone'],
    attractsEdgeTypes: ['WATER', 'NATURE'],
    bonusMultiplier: 1.6
  },
  nature_tidepools: {
    attractsTemplates: ['nature_shore', 'nature_marsh', 'nature_swamp', 'urban_pier'],
    attractsFloorTypes: ['water'],
    attractsEdgeTypes: ['WATER'],
    bonusMultiplier: 1.8
  },

  // Foggy street attracts atmosphere
  street_foggy: {
    attractsTemplates: ['street_alley', 'street_foggy', 'nature_marsh', 'urban_cemetery'],
    attractsSubTypes: ['alley', 'foggy', 'marsh', 'cemetery'],
    bonusMultiplier: 1.5
  },

  // Market attracts shops
  street_market: {
    attractsTemplates: ['facade_shop', 'facade_pawnshop', 'urban_market', 'facade_tavern'],
    attractsSubTypes: ['shop', 'pawnshop', 'market', 'tavern'],
    bonusMultiplier: 1.6
  },

  // Fountain attracts urban center
  urban_fountain: {
    attractsTemplates: ['urban_square', 'street_main', 'facade_hotel', 'urban_station'],
    attractsCategories: ['urban', 'street'],
    bonusMultiplier: 1.4
  },

  // Almshouse attracts poverty/desperation themes
  urban_almshouse: {
    attractsTemplates: ['facade_funeral', 'urban_cemetery', 'street_alley', 'facade_church'],
    attractsSubTypes: ['funeral', 'cemetery', 'alley', 'church'],
    bonusMultiplier: 1.5
  },

  // Hilltop attracts nature and ritual
  nature_hilltop: {
    attractsTemplates: ['nature_stones', 'nature_clearing', 'facade_observatory', 'nature_deadtrees'],
    attractsFloorTypes: ['grass', 'ritual'],
    attractsCategories: ['nature'],
    bonusMultiplier: 1.6
  },

  // Dead trees attract dark nature
  nature_deadtrees: {
    attractsTemplates: ['nature_blackpool', 'nature_marsh', 'nature_hilltop', 'nature_swamp'],
    attractsFloorTypes: ['dirt'],
    attractsSubTypes: ['blackpool', 'marsh', 'swamp'],
    bonusMultiplier: 1.5
  },

  // Farm field attracts farmhouse
  nature_farmfield: {
    attractsTemplates: ['facade_farmhouse', 'nature_path', 'nature_deadtrees'],
    attractsSubTypes: ['farmhouse', 'path'],
    bonusMultiplier: 1.8
  },

  // New forest variants - attract other forest and path tiles
  nature_forest_dense: {
    attractsTemplates: ['nature_forest', 'nature_forest_pine', 'nature_forest_birch', 'nature_path', 'nature_trail_corner'],
    attractsSubTypes: ['forest', 'path'],
    attractsEdgeTypes: ['NATURE'],
    bonusMultiplier: 1.6
  },
  nature_forest_birch: {
    attractsTemplates: ['nature_clearing', 'nature_forest_birch', 'nature_trail_corner', 'nature_path'],
    attractsSubTypes: ['clearing', 'path', 'forest'],
    bonusMultiplier: 1.5
  },
  nature_forest_pine: {
    attractsTemplates: ['nature_forest', 'nature_forest_pine', 'nature_forest_dense', 'nature_cave'],
    attractsSubTypes: ['forest', 'cave'],
    bonusMultiplier: 1.6
  },
  nature_forest_haunted: {
    attractsTemplates: ['nature_stones', 'nature_clearing', 'crypt_tomb', 'nature_blackpool'],
    attractsSubTypes: ['stones', 'ritual', 'tomb'],
    attractsFloorTypes: ['ritual'],
    bonusMultiplier: 1.8
  },
  nature_trail_crossing: {
    attractsTemplates: ['nature_path', 'nature_trail_corner', 'nature_trail_t', 'nature_clearing'],
    attractsSubTypes: ['path', 'clearing'],
    bonusMultiplier: 1.5
  },

  // Hospital tiles attract medical/clinical themes
  room_hospital_ward: {
    attractsTemplates: ['corridor_hospital', 'room_hospital_morgue', 'room_hospital_operating', 'room_hospital_pharmacy'],
    attractsSubTypes: ['hospital_ward', 'morgue', 'operating', 'pharmacy', 'hospital'],
    attractsFloorTypes: ['tile'],
    bonusMultiplier: 2.0
  },
  corridor_hospital: {
    attractsTemplates: ['room_hospital_ward', 'room_hospital_morgue', 'room_hospital_operating', 'room_hospital_pharmacy', 'room_hospital_reception'],
    attractsSubTypes: ['hospital_ward', 'morgue', 'operating', 'pharmacy', 'hospital_foyer'],
    bonusMultiplier: 1.8
  },
  room_hospital_morgue: {
    attractsTemplates: ['corridor_hospital', 'room_hospital_ward', 'basement_icehouse'],
    attractsSubTypes: ['hospital', 'icehouse'],
    bonusMultiplier: 1.6
  },

  // Police station tiles attract law enforcement themes
  room_police_cells: {
    attractsTemplates: ['corridor_police', 'room_police_office', 'room_police_evidence', 'room_police_interrogation'],
    attractsSubTypes: ['cells', 'office', 'evidence', 'interrogation', 'police'],
    bonusMultiplier: 2.0
  },
  corridor_police: {
    attractsTemplates: ['room_police_cells', 'room_police_office', 'room_police_evidence', 'room_police_lobby', 'room_police_armory'],
    attractsSubTypes: ['cells', 'office', 'evidence', 'police_foyer', 'armory'],
    bonusMultiplier: 1.8
  },
  room_police_evidence: {
    attractsTemplates: ['room_police_office', 'corridor_police', 'room_police_armory'],
    attractsSubTypes: ['office', 'armory', 'police'],
    bonusMultiplier: 1.5
  },

  // Attic connects upper floors
  room_attic: {
    attractsTemplates: ['room_bedroom', 'room_nursery', 'stairs_up'],
    attractsSubTypes: ['bedroom', 'nursery'],
    bonusMultiplier: 1.4
  },

  // Music room attracts entertainment
  room_music: {
    attractsTemplates: ['room_parlor', 'room_living', 'room_gallery'],
    attractsSubTypes: ['parlor', 'living', 'gallery'],
    bonusMultiplier: 1.4
  },

  // Trophy room attracts study
  room_trophy: {
    attractsTemplates: ['room_study', 'room_library', 'room_gallery'],
    attractsSubTypes: ['study', 'library', 'gallery'],
    bonusMultiplier: 1.4
  },

  // Ice house attracts cold storage
  basement_icehouse: {
    attractsTemplates: ['basement_cellar', 'basement_workshop', 'room_kitchen'],
    attractsSubTypes: ['cellar', 'workshop', 'kitchen'],
    bonusMultiplier: 1.4
  },

  // Workshop attracts practical spaces
  basement_workshop: {
    attractsTemplates: ['basement_boiler', 'basement_icehouse', 'basement_mine'],
    attractsSubTypes: ['boiler', 'icehouse', 'mine'],
    bonusMultiplier: 1.5
  },

  // Cistern attracts water underground
  basement_cistern: {
    attractsTemplates: ['basement_sewer', 'basement_tunnel', 'crypt_tunnel'],
    attractsFloorTypes: ['water'],
    attractsSubTypes: ['sewer', 'tunnel'],
    bonusMultiplier: 1.8
  },

  // Ossuary attracts death
  crypt_ossuary: {
    attractsTemplates: ['crypt_tomb', 'crypt_massgrave', 'crypt_altar'],
    attractsCategories: ['crypt'],
    attractsSubTypes: ['tomb', 'massgrave'],
    bonusMultiplier: 1.6
  },

  // Forbidden laboratory attracts science horror
  crypt_laboratory: {
    attractsTemplates: ['room_lab', 'crypt_prison', 'basement_icehouse'],
    attractsFloorTypes: ['tile'],
    attractsSubTypes: ['lab', 'prison', 'icehouse'],
    bonusMultiplier: 1.8
  },

  // Prison attracts containment
  crypt_prison: {
    attractsTemplates: ['crypt_laboratory', 'crypt_tunnel', 'basement_tunnel'],
    attractsSubTypes: ['laboratory', 'tunnel'],
    bonusMultiplier: 1.6
  },

  // Tavern attracts social spaces
  facade_tavern: {
    attractsTemplates: ['street_main', 'facade_hotel', 'street_market', 'urban_dock'],
    attractsSubTypes: ['main', 'hotel', 'market', 'dock'],
    bonusMultiplier: 1.5
  },

  // Bookshop attracts academic
  facade_bookshop: {
    attractsTemplates: ['facade_museum', 'room_library', 'room_study'],
    attractsSubTypes: ['museum', 'library', 'study'],
    bonusMultiplier: 1.6
  },

  // Pawnshop attracts seedy areas
  facade_pawnshop: {
    attractsTemplates: ['street_alley', 'street_market', 'facade_tavern'],
    attractsSubTypes: ['alley', 'market', 'tavern'],
    bonusMultiplier: 1.5
  },

  // Observatory attracts cosmic horror
  facade_observatory: {
    attractsTemplates: ['nature_hilltop', 'crypt_starchamber', 'room_maproom'],
    attractsFloorTypes: ['ritual'],
    attractsSubTypes: ['hilltop', 'starchamber', 'maproom'],
    bonusMultiplier: 2.0
  },

  // ============================================================================
  // BUILDING-SPECIFIC AFFINITIES - Mansion/Manor themed rooms
  // ============================================================================

  // Manor facade strongly attracts grand mansion rooms
  facade_manor: {
    attractsTemplates: [
      'foyer_grand', 'corridor_wide', 'room_study', 'room_library',
      'room_dining', 'room_parlor', 'room_gallery', 'room_bedroom',
      'room_conservatory', 'room_trophy', 'room_music', 'room_living'
    ],
    attractsCategories: ['corridor', 'room'],
    attractsSubTypes: ['grand', 'study', 'library', 'dining', 'parlor', 'gallery',
                       'bedroom', 'conservatory', 'trophy', 'music', 'living'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 2.5
  },

  // Grand foyer (mansion entrance) attracts mansion-style rooms
  foyer_grand: {
    attractsTemplates: [
      'corridor_wide', 'stairs_grand', 'room_study', 'room_library',
      'room_dining', 'room_parlor', 'room_gallery', 'room_living'
    ],
    attractsSubTypes: ['wide', 'grand', 'study', 'library', 'dining', 'parlor', 'gallery', 'living'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 2.0
  },

  // Parlor attracts other mansion social rooms
  room_parlor: {
    attractsTemplates: ['room_living', 'room_music', 'room_dining', 'room_gallery', 'corridor_wide'],
    attractsSubTypes: ['living', 'music', 'dining', 'gallery', 'wide'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 1.8
  },

  // Conservatory attracts elegant spaces
  room_conservatory: {
    attractsTemplates: ['room_gallery', 'room_music', 'room_parlor', 'room_dining'],
    attractsSubTypes: ['gallery', 'music', 'parlor', 'dining'],
    attractsFloorTypes: ['wood', 'tile'],
    bonusMultiplier: 1.7
  },

  // Dining room attracts kitchen and service areas
  room_dining: {
    attractsTemplates: ['room_kitchen', 'room_parlor', 'room_living', 'corridor_straight'],
    attractsSubTypes: ['kitchen', 'parlor', 'living'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 1.6
  },

  // Living room attracts other mansion rooms
  room_living: {
    attractsTemplates: ['room_parlor', 'room_dining', 'room_music', 'corridor_straight'],
    attractsSubTypes: ['parlor', 'dining', 'music'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 1.5
  },

  // ============================================================================
  // BUILDING-SPECIFIC AFFINITIES - Church themed rooms
  // ============================================================================

  // Church foyer strongly attracts church-themed rooms
  foyer_church: {
    attractsTemplates: [
      'room_ritual', 'crypt_altar', 'crypt_tomb', 'stairs_spiral',
      'corridor_dark', 'basement_cellar', 'crypt_sanctum'
    ],
    attractsCategories: ['crypt'],
    attractsSubTypes: ['ritual', 'altar', 'tomb', 'spiral', 'dark', 'sanctum'],
    attractsFloorTypes: ['stone', 'ritual'],
    bonusMultiplier: 2.5
  },

  // ============================================================================
  // BUILDING-SPECIFIC AFFINITIES - Asylum themed rooms
  // ============================================================================

  // Asylum foyer attracts asylum-specific rooms
  foyer_asylum: {
    attractsTemplates: [
      'corridor_asylum', 'room_asylum_cell', 'room_asylum_common',
      'room_asylum_office', 'room_asylum_treatment', 'room_lab'
    ],
    attractsSubTypes: ['asylum', 'cell', 'common', 'treatment'],
    attractsFloorTypes: ['tile'],
    bonusMultiplier: 2.5
  },

  // Asylum corridor strongly attracts asylum rooms
  corridor_asylum: {
    attractsTemplates: [
      'room_asylum_cell', 'room_asylum_common', 'room_asylum_office',
      'room_asylum_treatment', 'corridor_asylum'
    ],
    attractsSubTypes: ['asylum_cell', 'common', 'treatment', 'asylum'],
    attractsFloorTypes: ['tile'],
    bonusMultiplier: 2.0
  },

  // ============================================================================
  // BUILDING-SPECIFIC AFFINITIES - Hotel themed rooms
  // ============================================================================

  // Hotel foyer attracts hotel-specific rooms
  foyer_hotel: {
    attractsTemplates: [
      'corridor_hotel', 'room_bedroom', 'room_dining', 'stairs_grand', 'basement_cellar'
    ],
    attractsSubTypes: ['hotel', 'bedroom', 'dining', 'grand'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 2.0
  },

  // Hotel corridor attracts hotel rooms
  corridor_hotel: {
    attractsTemplates: ['room_bedroom', 'room_bathroom', 'corridor_hotel'],
    attractsSubTypes: ['bedroom', 'bathroom', 'hotel'],
    attractsFloorTypes: ['wood'],
    bonusMultiplier: 1.8
  },

  // ============================================================================
  // BUILDING-SPECIFIC AFFINITIES - Museum themed rooms
  // ============================================================================

  // Museum foyer attracts museum-specific rooms
  foyer_museum: {
    attractsTemplates: [
      'corridor_museum', 'room_gallery', 'room_library', 'room_maproom',
      'room_study', 'crypt_altar'
    ],
    attractsSubTypes: ['museum', 'gallery', 'library', 'maproom', 'study'],
    attractsFloorTypes: ['tile', 'stone'],
    bonusMultiplier: 2.0
  },

  // Museum corridor attracts exhibit rooms
  corridor_museum: {
    attractsTemplates: ['room_gallery', 'room_maproom', 'corridor_museum'],
    attractsSubTypes: ['gallery', 'maproom', 'museum'],
    attractsFloorTypes: ['tile', 'stone'],
    bonusMultiplier: 1.8
  },

  // ============================================================================
  // NATURE AREA AFFINITIES - Stronger forest clustering
  // ============================================================================

  // Generic forest attracts more forest and nature tiles
  nature_path: {
    attractsTemplates: [
      'nature_forest', 'nature_clearing', 'nature_trail_corner',
      'nature_trail_crossing', 'nature_trail_t', 'nature_stones'
    ],
    attractsCategories: ['nature'],
    attractsSubTypes: ['forest', 'clearing', 'trail', 'stones'],
    attractsFloorTypes: ['dirt', 'grass'],
    bonusMultiplier: 1.8
  },

  // Clearing attracts ritual and forest tiles
  nature_clearing: {
    attractsTemplates: [
      'nature_forest', 'nature_path', 'nature_stones', 'nature_ruins',
      'nature_trail_corner', 'room_ritual'
    ],
    attractsSubTypes: ['forest', 'path', 'stones', 'ruins'],
    attractsFloorTypes: ['grass', 'ritual'],
    bonusMultiplier: 1.7
  },

  // Ruins attract mysterious tiles
  nature_ruins: {
    attractsTemplates: [
      'nature_clearing', 'nature_stones', 'crypt_tomb', 'crypt_altar',
      'basement_tunnel', 'nature_forest_haunted'
    ],
    attractsSubTypes: ['clearing', 'stones', 'tomb', 'tunnel', 'haunted'],
    attractsFloorTypes: ['stone', 'ritual'],
    bonusMultiplier: 1.8
  },

  // Blackpool attracts dark nature and horror
  nature_blackpool: {
    attractsTemplates: [
      'nature_swamp', 'nature_marsh', 'nature_deadtrees',
      'nature_forest_haunted', 'crypt_altar'
    ],
    attractsSubTypes: ['swamp', 'marsh', 'deadtrees', 'haunted'],
    attractsFloorTypes: ['water', 'ritual'],
    bonusMultiplier: 2.0
  }
};

/**
 * Calculate affinity bonus for a template based on neighboring tiles
 * @param template The template to calculate bonus for
 * @param neighbors Array of neighboring tiles (null for empty positions)
 * @returns Bonus multiplier (1.0 = no bonus)
 */
export function calculateAffinityBonus(
  template: TileTemplate,
  neighbors: (Tile | null)[]
): number {
  let totalBonus = 1.0;
  let bonusCount = 0;

  for (const neighbor of neighbors) {
    if (!neighbor) continue;

    // Find the template ID for this neighbor
    // The template ID is based on category_subtype pattern
    const neighborTemplateId = findNeighborTemplateId(neighbor);
    const affinity = TILE_AFFINITIES[neighborTemplateId];

    if (!affinity) continue;

    const multiplier = affinity.bonusMultiplier ?? 1.5;
    let matchFound = false;

    // Check if template ID is in attractsTemplates
    if (affinity.attractsTemplates?.includes(template.id)) {
      totalBonus += (multiplier - 1.0);
      matchFound = true;
      bonusCount++;
    }

    // Check category match
    if (!matchFound && affinity.attractsCategories?.includes(template.category)) {
      totalBonus += (multiplier - 1.0) * 0.8; // Slightly less bonus for category match
      matchFound = true;
      bonusCount++;
    }

    // Check floor type match
    if (!matchFound && affinity.attractsFloorTypes?.includes(template.floorType)) {
      totalBonus += (multiplier - 1.0) * 0.6;
      matchFound = true;
      bonusCount++;
    }

    // Check subtype match
    if (!matchFound && affinity.attractsSubTypes?.includes(template.subType)) {
      totalBonus += (multiplier - 1.0) * 0.7;
      matchFound = true;
      bonusCount++;
    }

    // Check edge types
    if (!matchFound && affinity.attractsEdgeTypes) {
      const hasMatchingEdge = template.edges.some(edge =>
        affinity.attractsEdgeTypes!.includes(edge)
      );
      if (hasMatchingEdge) {
        totalBonus += (multiplier - 1.0) * 0.5;
        bonusCount++;
      }
    }
  }

  // Diminishing returns: cap bonus at 3x
  return Math.min(totalBonus, 3.0);
}

/**
 * Find the template ID for a tile based on its properties
 */
function findNeighborTemplateId(tile: Tile): string {
  // First try to find by name match
  for (const [id, template] of Object.entries(TILE_TEMPLATES)) {
    if (template.name === tile.name) {
      return id;
    }
  }

  // Fallback: construct ID from category and subType
  if (tile.category) {
    // Get subType from the tile if available, or derive from name
    const subType = tile.name?.toLowerCase().split(' ').pop() || 'unknown';
    const possibleId = `${tile.category}_${subType}`;
    if (TILE_TEMPLATES[possibleId]) {
      return possibleId;
    }
  }

  return '';
}

/**
 * Get neighboring tiles for a position
 */
export function getNeighborTiles(
  board: Map<string, Tile>,
  q: number,
  r: number
): (Tile | null)[] {
  const neighborOffsets: [number, number][] = [
    [0, -1],  // 0: North
    [1, -1],  // 1: North-East
    [1, 0],   // 2: South-East
    [0, 1],   // 3: South
    [-1, 1],  // 4: South-West
    [-1, 0]   // 5: North-West
  ];

  return neighborOffsets.map(([dq, dr]) => {
    const neighborPos = `${q + dq},${r + dr}`;
    return board.get(neighborPos) || null;
  });
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
 * @param neighborTiles Optional array of neighboring tiles for affinity calculations
 * @returns Array of valid template matches with rotations
 */
export function findValidTemplates(
  constraints: (EdgeConstraint | null)[],
  preferredCategory?: TileCategory,
  neighborTiles?: (Tile | null)[]
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

        // Apply affinity bonus from neighboring tiles
        if (neighborTiles && neighborTiles.length > 0) {
          const affinityBonus = calculateAffinityBonus(template, neighborTiles);
          score = Math.round(score * affinityBonus);
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

  // Get neighboring tiles for affinity calculations
  const neighborTiles = getNeighborTiles(board, q, r);

  // Find valid templates (now with affinity support)
  const validTemplates = findValidTemplates(constraints, fromTile.category, neighborTiles);

  if (validTemplates.length === 0) {
    console.warn(`No valid templates found for position (${q},${r})`);
    return null;
  }

  // Select template (weighted selection considers affinity bonuses)
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

// ============================================================================
// 9.5 EDGE SYNCHRONIZATION
// ============================================================================

/**
 * Hex neighbor offsets for flat-top hex (axial coordinates)
 * Direction index -> offset
 */
const SYNC_NEIGHBOR_OFFSETS: [number, number][] = [
  [0, -1],  // 0: North
  [1, -1],  // 1: North-East
  [1, 0],   // 2: South-East
  [0, 1],   // 3: South
  [-1, 1],  // 4: South-West
  [-1, 0]   // 5: North-West
];

/**
 * Synchronize edges between a newly placed tile and its neighbors.
 * This ensures that:
 * 1. Windows on one tile have matching windows on the adjacent tile (not walls)
 * 2. Doors on one tile have matching doors on the adjacent tile with the same state
 * 3. Stairs connect properly
 *
 * @param newTile The newly placed tile
 * @param board Current board state (Map<string, Tile>)
 * @returns Updated board with synchronized edges
 */
export function synchronizeEdgesWithNeighbors(
  newTile: Tile,
  board: Map<string, Tile>
): Map<string, Tile> {
  const updatedBoard = new Map(board);

  // Update the new tile in the board first
  const newTileKey = `${newTile.q},${newTile.r}`;
  updatedBoard.set(newTileKey, newTile);

  // Check each direction for neighbors
  for (let dir = 0; dir < 6; dir++) {
    const [dq, dr] = SYNC_NEIGHBOR_OFFSETS[dir];
    const neighborKey = `${newTile.q + dq},${newTile.r + dr}`;
    const neighbor = updatedBoard.get(neighborKey);

    if (!neighbor) continue;

    const oppositeDir = (dir + 3) % 6;
    const newTileEdge = newTile.edges[dir];
    const neighborEdge = neighbor.edges[oppositeDir];

    // Synchronize windows: if neighbor has window, new tile should also have window
    if (neighborEdge.type === 'window' && newTileEdge.type === 'wall') {
      // Convert wall to window to allow passage back
      const updatedNewTile = updatedBoard.get(newTileKey)!;
      const newEdges = [...updatedNewTile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      newEdges[dir] = { type: 'window' };
      updatedBoard.set(newTileKey, { ...updatedNewTile, edges: newEdges });
    }

    // Also check the reverse: if new tile has window but neighbor has wall
    if (newTileEdge.type === 'window' && neighborEdge.type === 'wall') {
      // Convert neighbor's wall to window
      const neighborEdges = [...neighbor.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      neighborEdges[oppositeDir] = { type: 'window' };
      updatedBoard.set(neighborKey, { ...neighbor, edges: neighborEdges });
    }

    // Synchronize doors: if neighbor has door, new tile should also have door with matching state
    if (neighborEdge.type === 'door' && newTileEdge.type !== 'door') {
      // Convert edge to door with same state as neighbor
      const updatedNewTile = updatedBoard.get(newTileKey)!;
      const newEdges = [...updatedNewTile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      newEdges[dir] = {
        type: 'door',
        doorState: neighborEdge.doorState || 'closed',
        lockType: neighborEdge.lockType,
        keyId: neighborEdge.keyId
      };
      updatedBoard.set(newTileKey, { ...updatedNewTile, edges: newEdges });
    }

    // Also check the reverse: if new tile has door but neighbor doesn't
    if (newTileEdge.type === 'door' && neighborEdge.type !== 'door' && neighborEdge.type !== 'wall') {
      // Convert neighbor's edge to door with same state
      const neighborEdges = [...neighbor.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      neighborEdges[oppositeDir] = {
        type: 'door',
        doorState: newTileEdge.doorState || 'closed',
        lockType: newTileEdge.lockType,
        keyId: newTileEdge.keyId
      };
      updatedBoard.set(neighborKey, { ...neighbor, edges: neighborEdges });
    }

    // Synchronize door states: if both are doors but states differ, use the existing neighbor's state
    if (newTileEdge.type === 'door' && neighborEdge.type === 'door') {
      if (newTileEdge.doorState !== neighborEdge.doorState) {
        // Use neighbor's state (the existing tile) for consistency
        const updatedNewTile = updatedBoard.get(newTileKey)!;
        const newEdges = [...updatedNewTile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
        newEdges[dir] = {
          ...newEdges[dir],
          doorState: neighborEdge.doorState,
          lockType: neighborEdge.lockType,
          keyId: neighborEdge.keyId
        };
        updatedBoard.set(newTileKey, { ...updatedNewTile, edges: newEdges });
      }
    }

    // Synchronize stairs: stairs_up should connect to stairs_down and vice versa
    if (neighborEdge.type === 'stairs_up' && newTileEdge.type !== 'stairs_down') {
      const updatedNewTile = updatedBoard.get(newTileKey)!;
      const newEdges = [...updatedNewTile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      newEdges[dir] = { type: 'stairs_down' };
      updatedBoard.set(newTileKey, { ...updatedNewTile, edges: newEdges });
    }
    if (neighborEdge.type === 'stairs_down' && newTileEdge.type !== 'stairs_up') {
      const updatedNewTile = updatedBoard.get(newTileKey)!;
      const newEdges = [...updatedNewTile.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
      newEdges[dir] = { type: 'stairs_up' };
      updatedBoard.set(newTileKey, { ...updatedNewTile, edges: newEdges });
    }
  }

  return updatedBoard;
}

/**
 * Convert a board array to a Map for efficient lookups
 */
export function boardArrayToMap(board: Tile[]): Map<string, Tile> {
  const map = new Map<string, Tile>();
  for (const tile of board) {
    map.set(`${tile.q},${tile.r}`, tile);
  }
  return map;
}

/**
 * Convert a board Map back to an array
 */
export function boardMapToArray(board: Map<string, Tile>): Tile[] {
  return Array.from(board.values());
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
  const neighborTiles = getNeighborTiles(board, q, r);
  const validTemplates = findValidTemplates(constraints, undefined, neighborTiles);

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
