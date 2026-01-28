/**
 * Tile Animation System - "The Living Board"
 * 
 * Provides CSS animation classes for tiles based on their type,
 * creating atmospheric visual effects that enhance the Lovecraftian horror aesthetic.
 */

// ============================================================================
// TILE CATEGORY DETECTION
// ============================================================================

type TileCategory = 
  | 'supernatural'    // Portals, ritual chambers, occult sites
  | 'outdoor'         // Streets, parks, forests, docks
  | 'water'           // Harbors, docks, sewers, cisterns
  | 'underground'     // Crypts, tunnels, basements, caves
  | 'church'          // Churches, chapels, shrines
  | 'laboratory'      // Labs, morgues, experiments
  | 'interior'        // Standard indoor rooms
  | 'nature';         // Forests, swamps, natural areas

const TILE_CATEGORY_PATTERNS: Record<TileCategory, string[]> = {
  supernatural: [
    'portal', 'ritual', 'altar', 'occult', 'sanctum', 'pentagram',
    'summoning', 'eldritch', 'dimension', 'void', 'cosmic', 'dreamlands'
  ],
  outdoor: [
    'street', 'alley', 'square', 'market', 'crossroads', 'deadend',
    'park', 'cemetery', 'graveyard', 'courtyard', 'garden', 'roof',
    'balcony', 'terrace', 'path', 'bridge', 'gate'
  ],
  water: [
    'harbor', 'dock', 'pier', 'wharf', 'waterfront', 'riverfront',
    'sewer', 'cistern', 'lake', 'pond', 'fountain', 'well',
    'innsmouth', 'marsh', 'swamp', 'flooded'
  ],
  underground: [
    'crypt', 'tomb', 'mausoleum', 'ossuary', 'grave', 'catacomb',
    'tunnel', 'mine', 'cave', 'cavern', 'pit', 'basement', 'cellar',
    'boiler', 'coal', 'vault', 'bunker'
  ],
  church: [
    'church', 'chapel', 'cathedral', 'shrine', 'sanctuary', 'nave',
    'vestry', 'bell', 'confessional', 'cloister'
  ],
  laboratory: [
    'lab', 'laboratory', 'morgue', 'dissection', 'autopsy', 'experiment',
    'operating', 'surgery', 'chemical', 'specimen'
  ],
  nature: [
    'forest', 'clearing', 'grove', 'woods', 'moor', 'cliff',
    'hilltop', 'orchard', 'field', 'meadow', 'shore', 'beach'
  ],
  interior: [
    'study', 'library', 'bedroom', 'parlor', 'drawing', 'smoking',
    'billiard', 'music', 'foyer', 'lobby', 'hallway', 'corridor'
  ]
};

/**
 * Determine the category of a tile based on its name and type
 */
export function getTileCategory(tileName: string, tileType?: string): TileCategory | null {
  const searchText = `${tileName} ${tileType || ''}`.toLowerCase();
  
  // Check each category in priority order
  const priorityOrder: TileCategory[] = [
    'supernatural', 'water', 'underground', 'church', 
    'laboratory', 'outdoor', 'nature', 'interior'
  ];
  
  for (const category of priorityOrder) {
    const patterns = TILE_CATEGORY_PATTERNS[category];
    if (patterns.some(pattern => searchText.includes(pattern))) {
      return category;
    }
  }
  
  return null;
}

// ============================================================================
// ANIMATION CLASS MAPPING
// ============================================================================

interface TileAnimationConfig {
  containerClass: string;    // Applied to the tile container
  overlayClass?: string;     // Optional overlay element class
  imageClass?: string;       // Applied to the tile image
  glowClass?: string;        // Additional glow effect
}

const CATEGORY_ANIMATIONS: Record<TileCategory, TileAnimationConfig> = {
  supernatural: {
    containerClass: 'tile-animate-eldritch',
    overlayClass: 'tile-overlay-eldritch',
    imageClass: 'tile-image-eldritch',
    glowClass: 'tile-glow-eldritch'
  },
  outdoor: {
    containerClass: 'tile-animate-outdoor',
    overlayClass: 'tile-overlay-wind',
    imageClass: 'tile-image-outdoor',
    glowClass: ''
  },
  water: {
    containerClass: 'tile-animate-water',
    overlayClass: 'tile-overlay-water',
    imageClass: 'tile-image-water',
    glowClass: 'tile-glow-water'
  },
  underground: {
    containerClass: 'tile-animate-underground',
    overlayClass: 'tile-overlay-mist',
    imageClass: 'tile-image-underground',
    glowClass: ''
  },
  church: {
    containerClass: 'tile-animate-church',
    overlayClass: 'tile-overlay-divine',
    imageClass: 'tile-image-church',
    glowClass: 'tile-glow-divine'
  },
  laboratory: {
    containerClass: 'tile-animate-laboratory',
    overlayClass: 'tile-overlay-electric',
    imageClass: 'tile-image-laboratory',
    glowClass: 'tile-glow-electric'
  },
  nature: {
    containerClass: 'tile-animate-nature',
    overlayClass: 'tile-overlay-wind',
    imageClass: 'tile-image-nature',
    glowClass: ''
  },
  interior: {
    containerClass: 'tile-animate-interior',
    overlayClass: 'tile-overlay-candle',
    imageClass: 'tile-image-interior',
    glowClass: 'tile-glow-candle'
  }
};

/**
 * Get animation classes for a tile based on its name/type
 */
export function getTileAnimationClasses(
  tileName: string, 
  tileType?: string
): TileAnimationConfig {
  const category = getTileCategory(tileName, tileType);
  
  if (!category) {
    return {
      containerClass: '',
      overlayClass: '',
      imageClass: '',
      glowClass: ''
    };
  }
  
  return CATEGORY_ANIMATIONS[category];
}

/**
 * Get combined animation class string for a tile container
 */
export function getTileContainerAnimationClass(
  tileName: string,
  tileType?: string
): string {
  const config = getTileAnimationClasses(tileName, tileType);
  return [config.containerClass, config.glowClass].filter(Boolean).join(' ');
}

/**
 * Get animation class for tile image
 */
export function getTileImageAnimationClass(
  tileName: string,
  tileType?: string
): string {
  const config = getTileAnimationClasses(tileName, tileType);
  return config.imageClass || '';
}

/**
 * Get overlay animation class for tile
 */
export function getTileOverlayClass(
  tileName: string,
  tileType?: string
): string {
  const config = getTileAnimationClasses(tileName, tileType);
  return config.overlayClass || '';
}
