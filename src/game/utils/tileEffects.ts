/**
 * Tile Effects Configuration - "The Atmosphere of Dread"
 *
 * This file defines all tile-based atmospheric effects, ambient lighting,
 * and visual overlays for different tile types in Mythos Quest.
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type ParticleType =
  | 'dust'
  | 'spark'
  | 'bubble'
  | 'ghost'
  | 'mist'
  | 'water-ripple'
  | 'divine-dust'
  | 'rune-glow';

export type LightType =
  | 'gaslight'
  | 'moonlight'
  | 'candle'
  | 'torch'
  | 'divine'
  | 'ritual'
  | 'eldritch';

export interface ParticleConfig {
  type: ParticleType;
  count: number;
  color: string;
  sizeRange: [number, number]; // [min, max] in pixels
  duration: number; // in ms
  delay?: number; // delay between particles in ms
  spread: { x: number; y: number };
  className: string;
}

export interface LightConfig {
  type: LightType;
  color: string;
  intensity: number; // 0-1
  radius: number; // in pixels
  flicker?: {
    enabled: boolean;
    speed: number; // in ms
    variance: number; // 0-1
  };
  className: string;
}

export interface TileAtmosphereConfig {
  tileTypes: string[]; // Tile type patterns to match
  particles?: ParticleConfig[];
  lights?: LightConfig[];
  overlayClass?: string;
  ambientClass?: string;
  priority: number; // Higher = applied first
}

// ============================================================================
// TILE ATMOSPHERE CONFIGURATIONS
// ============================================================================

export const TILE_ATMOSPHERE_CONFIGS: TileAtmosphereConfig[] = [
  // CHURCH - Divine light rays with dust particles
  {
    tileTypes: ['church', 'chapel', 'cathedral', 'shrine'],
    particles: [
      {
        type: 'divine-dust',
        count: 8,
        color: 'rgba(255, 230, 150, 0.8)',
        sizeRange: [2, 4],
        duration: 8000,
        delay: 500,
        spread: { x: 60, y: 80 },
        className: 'divine-dust-particle'
      }
    ],
    lights: [
      {
        type: 'divine',
        color: 'rgba(255, 215, 100, 0.15)',
        intensity: 0.3,
        radius: 100,
        className: 'tile-church-light'
      }
    ],
    overlayClass: 'tile-church-overlay',
    priority: 10
  },

  // RITUAL CHAMBER - Pulsating occult symbols
  {
    tileTypes: ['ritual', 'altar', 'sanctum', 'occult', 'portal'],
    particles: [
      {
        type: 'rune-glow',
        count: 5,
        color: 'rgba(150, 50, 255, 0.6)',
        sizeRange: [10, 20],
        duration: 4000,
        delay: 800,
        spread: { x: 40, y: 40 },
        className: 'ritual-rune-glow'
      }
    ],
    lights: [
      {
        type: 'ritual',
        color: 'rgba(128, 0, 128, 0.2)',
        intensity: 0.4,
        radius: 80,
        flicker: {
          enabled: true,
          speed: 4000,
          variance: 0.3
        },
        className: 'ritual-rune-flicker'
      }
    ],
    overlayClass: 'tile-ritual-overlay',
    priority: 15
  },

  // CRYPT / TOMB - Ghost mist and spirit glimpses
  {
    tileTypes: ['crypt', 'tomb', 'mausoleum', 'ossuary', 'massgrave', 'grave'],
    particles: [
      {
        type: 'mist',
        count: 3,
        color: 'rgba(150, 160, 180, 0.4)',
        sizeRange: [40, 80],
        duration: 15000,
        delay: 2000,
        spread: { x: 100, y: 30 },
        className: 'crypt-floor-mist'
      },
      {
        type: 'ghost',
        count: 1,
        color: 'rgba(200, 210, 230, 0.3)',
        sizeRange: [20, 30],
        duration: 12000,
        delay: 8000,
        spread: { x: 50, y: 50 },
        className: 'ghost-face-glimpse'
      }
    ],
    overlayClass: 'tile-crypt-overlay',
    priority: 12
  },

  // LABORATORY - Electric sparks and bubbling liquids
  {
    tileTypes: ['lab', 'laboratory', 'morgue', 'experiment'],
    particles: [
      {
        type: 'spark',
        count: 4,
        color: 'rgba(136, 204, 255, 0.9)',
        sizeRange: [4, 8],
        duration: 300,
        delay: 3000,
        spread: { x: 30, y: 30 },
        className: 'lab-spark'
      },
      {
        type: 'bubble',
        count: 6,
        color: 'rgba(100, 255, 150, 0.7)',
        sizeRange: [4, 8],
        duration: 2000,
        delay: 400,
        spread: { x: 20, y: 40 },
        className: 'lab-bubble'
      }
    ],
    overlayClass: 'tile-lab-overlay',
    priority: 8
  },

  // HARBOR / WATER - Wave reflections and deep shadows
  {
    tileTypes: ['harbor', 'dock', 'pier', 'waterfront', 'riverfront', 'sewer', 'cistern', 'underground_lake'],
    particles: [
      {
        type: 'water-ripple',
        count: 4,
        color: 'rgba(100, 150, 200, 0.3)',
        sizeRange: [30, 60],
        duration: 4000,
        delay: 1000,
        spread: { x: 80, y: 40 },
        className: 'water-light-dance'
      }
    ],
    lights: [
      {
        type: 'moonlight',
        color: 'rgba(100, 150, 200, 0.15)',
        intensity: 0.2,
        radius: 90,
        className: 'tile-water-overlay'
      }
    ],
    overlayClass: 'tile-water-overlay',
    priority: 7
  },

  // EXTERIOR - Moonlight shimmer
  {
    tileTypes: ['street', 'alley', 'square', 'market', 'crossroads', 'deadend', 'park', 'cemetery', 'graveyard'],
    lights: [
      {
        type: 'moonlight',
        color: 'rgba(180, 200, 255, 0.12)',
        intensity: 0.3,
        radius: 100,
        className: 'moonlight-overlay'
      },
      {
        type: 'gaslight',
        color: 'hsla(35, 80%, 50%, 0.15)',
        intensity: 0.2,
        radius: 60,
        flicker: {
          enabled: true,
          speed: 4000,
          variance: 0.2
        },
        className: 'gaslight-ambience'
      }
    ],
    ambientClass: 'gaslight-ambience',
    priority: 3
  },

  // INTERIOR - Candle/torch light
  {
    tileTypes: ['study', 'library', 'bedroom', 'parlor', 'drawing', 'smoking', 'music', 'billiard'],
    lights: [
      {
        type: 'candle',
        color: 'rgba(255, 200, 100, 0.2)',
        intensity: 0.25,
        radius: 50,
        flicker: {
          enabled: true,
          speed: 2000,
          variance: 0.15
        },
        className: 'candle-glow'
      }
    ],
    ambientClass: 'candle-glow',
    priority: 4
  },

  // BASEMENT / CELLAR - Torch ambience
  {
    tileTypes: ['cellar', 'basement', 'tunnel', 'mine', 'boiler', 'coal', 'storage'],
    lights: [
      {
        type: 'torch',
        color: 'rgba(255, 150, 50, 0.18)',
        intensity: 0.3,
        radius: 70,
        flicker: {
          enabled: true,
          speed: 3000,
          variance: 0.25
        },
        className: 'torch-ambience'
      }
    ],
    ambientClass: 'torch-ambience',
    priority: 5
  },

  // NATURE - Ambient outdoor
  {
    tileTypes: ['forest', 'clearing', 'swamp', 'marsh', 'shore', 'cliff', 'hilltop', 'orchard', 'path'],
    lights: [
      {
        type: 'moonlight',
        color: 'rgba(150, 180, 230, 0.1)',
        intensity: 0.2,
        radius: 100,
        className: 'moonlight-overlay'
      }
    ],
    ambientClass: 'moonlight-overlay',
    priority: 2
  },

  // FOYER / LOBBY - Mixed lighting
  {
    tileTypes: ['foyer', 'lobby', 'reception', 'vestibule', 'entrance', 'hallway', 'corridor'],
    lights: [
      {
        type: 'gaslight',
        color: 'hsla(35, 80%, 50%, 0.12)',
        intensity: 0.2,
        radius: 60,
        flicker: {
          enabled: true,
          speed: 4000,
          variance: 0.15
        },
        className: 'gaslight-ambience'
      }
    ],
    ambientClass: 'gaslight-ambience',
    priority: 4
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get atmosphere configuration for a specific tile
 */
export function getTileAtmosphere(tileName: string, tileType?: string): TileAtmosphereConfig | null {
  const lowerName = tileName.toLowerCase();
  const lowerType = tileType?.toLowerCase() || '';

  // Sort by priority (higher first)
  const sortedConfigs = [...TILE_ATMOSPHERE_CONFIGS].sort((a, b) => b.priority - a.priority);

  for (const config of sortedConfigs) {
    const matches = config.tileTypes.some(pattern =>
      lowerName.includes(pattern) || lowerType.includes(pattern)
    );
    if (matches) {
      return config;
    }
  }

  return null;
}

/**
 * Get all CSS classes for a tile's atmospheric effects
 */
export function getTileAtmosphereClasses(tileName: string, tileType?: string): string {
  const config = getTileAtmosphere(tileName, tileType);
  if (!config) return '';

  const classes: string[] = [];

  if (config.overlayClass) classes.push(config.overlayClass);
  if (config.ambientClass) classes.push(config.ambientClass);
  if (config.lights) {
    config.lights.forEach(light => {
      if (light.className) classes.push(light.className);
    });
  }

  return classes.join(' ');
}

/**
 * Check if a tile should have particle effects
 */
export function tileHasParticles(tileName: string, tileType?: string): boolean {
  const config = getTileAtmosphere(tileName, tileType);
  return config?.particles !== undefined && config.particles.length > 0;
}

/**
 * Get particle configurations for a tile
 */
export function getTileParticles(tileName: string, tileType?: string): ParticleConfig[] {
  const config = getTileAtmosphere(tileName, tileType);
  return config?.particles || [];
}

// ============================================================================
// ACTION EFFECT CONFIGURATIONS
// ============================================================================

export interface ActionEffectConfig {
  action: string;
  cssClass: string;
  duration: number;
  screenEffect?: string;
}

export const ACTION_EFFECTS: Record<string, ActionEffectConfig> = {
  // Movement
  move: {
    action: 'move',
    cssClass: 'animate-footstep-dust',
    duration: 600
  },

  // Door interactions
  door_open: {
    action: 'door_open',
    cssClass: 'animate-door-opening',
    duration: 1000
  },

  // Skill checks
  skill_success: {
    action: 'skill_success',
    cssClass: 'dice-success',
    duration: 600
  },
  skill_fail: {
    action: 'skill_fail',
    cssClass: 'dice-fail',
    duration: 400
  },

  // Combat
  melee_attack: {
    action: 'melee_attack',
    cssClass: 'animate-melee-slash',
    duration: 300
  },
  ranged_attack: {
    action: 'ranged_attack',
    cssClass: 'animate-ranged-tracer',
    duration: 200
  },
  attack_hit: {
    action: 'attack_hit',
    cssClass: 'animate-impact-star',
    duration: 400
  },

  // Enemy effects
  enemy_spawn: {
    action: 'enemy_spawn',
    cssClass: 'animate-enemy-spawn',
    duration: 1000
  },
  enemy_death: {
    action: 'enemy_death',
    cssClass: 'animate-enemy-death-ghoul', // default, can be overridden
    duration: 1200
  },
  enemy_move: {
    action: 'enemy_move',
    cssClass: 'animate-enemy-move',
    duration: 500
  },

  // Doom and Sanity
  doom_tick: {
    action: 'doom_tick',
    cssClass: 'animate-doom-tick',
    duration: 1000,
    screenEffect: 'doom-screen-effect'
  },
  doom_critical: {
    action: 'doom_critical',
    cssClass: 'animate-doom-critical',
    duration: 4000
  },
  sanity_loss: {
    action: 'sanity_loss',
    cssClass: 'animate-sanity-loss',
    duration: 600,
    screenEffect: 'sanity-loss-overlay'
  },
  sanity_restore: {
    action: 'sanity_restore',
    cssClass: 'animate-sanity-restore',
    duration: 1000
  },

  // Item effects
  item_pickup: {
    action: 'item_pickup',
    cssClass: 'animate-item-pickup',
    duration: 600
  },
  flashlight_reveal: {
    action: 'flashlight_reveal',
    cssClass: 'animate-flashlight-reveal',
    duration: 800
  },
  occult_activate: {
    action: 'occult_activate',
    cssClass: 'animate-occult-activate',
    duration: 1000
  },

  // Special situations
  horror_check: {
    action: 'horror_check',
    cssClass: 'animate-horror-check',
    duration: 500,
    screenEffect: 'horror-screen-effect'
  },
  madness_onset: {
    action: 'madness_onset',
    cssClass: 'animate-madness-onset',
    duration: 1500,
    screenEffect: 'reality-cracking'
  },
  victory: {
    action: 'victory',
    cssClass: 'animate-victory',
    duration: 2000,
    screenEffect: 'victory-screen'
  },
  game_over: {
    action: 'game_over',
    cssClass: 'animate-game-over',
    duration: 3000,
    screenEffect: 'game-over-darkness'
  },
  clue_reveal: {
    action: 'clue_reveal',
    cssClass: 'animate-clue-reveal',
    duration: 800
  },
  level_up: {
    action: 'level_up',
    cssClass: 'animate-level-up',
    duration: 1000
  },
  turn_transition: {
    action: 'turn_transition',
    cssClass: 'animate-turn-transition',
    duration: 800
  },
  notification: {
    action: 'notification',
    cssClass: 'animate-notification',
    duration: 500
  }
};

/**
 * Get enemy death animation class based on enemy type
 */
export function getEnemyDeathClass(enemyType: string): string {
  const type = enemyType.toLowerCase();

  if (type.includes('ghoul')) return 'animate-enemy-death-ghoul';
  if (type.includes('deep_one') || type.includes('deepone')) return 'animate-enemy-death-deep-one';
  if (type.includes('cultist')) return 'animate-enemy-death-cultist';
  if (type.includes('shoggoth')) return 'animate-enemy-death-shoggoth';

  // Default to ghoul animation
  return 'animate-enemy-death-ghoul';
}

/**
 * Get action effect configuration
 */
export function getActionEffect(action: string): ActionEffectConfig | null {
  return ACTION_EFFECTS[action] || null;
}
