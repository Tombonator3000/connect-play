/**
 * Monster Weather Behavior System
 * Extracted from monsterAI.ts for better modularity
 *
 * Handles weather effects on monster behavior including:
 * - Vision modifications
 * - Aggression changes
 * - Speed adjustments
 * - Stealth bonuses
 */

import { EnemyType, WeatherCondition } from '../types';
import { getWeatherEffect, getIntensityModifier, BESTIARY } from '../constants';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Weather modifiers for monster AI behavior
 * Different weather types affect monster aggression, vision, and tactics
 */
export interface WeatherMonsterModifiers {
  visionModifier: number;        // Multiplier for vision range (0.5 = half)
  aggressionModifier: number;    // Multiplier for aggression (1.5 = more aggressive)
  speedModifier: number;         // Multiplier for movement speed
  stealthBonus: boolean;         // Monsters get ambush advantage
  prefersDarkness: boolean;      // Certain monsters become more active
  prefersLight: boolean;         // Certain monsters become less active
  horrorBonus: number;           // Extra horror dice in this weather
}

// ============================================================================
// CREATURE CATEGORIES
// ============================================================================

/** Creatures that thrive in darkness */
export const DARKNESS_DWELLERS: EnemyType[] = [
  'ghoul', 'nightgaunt', 'hound', 'formless_spawn', 'hunting_horror'
];

/** Creatures attracted to supernatural light */
export const LIGHT_SEEKERS: EnemyType[] = [
  'mi-go', 'star_spawn', 'byakhee'
];

// ============================================================================
// WEATHER MODIFIER DEFAULTS
// ============================================================================

const DEFAULT_MODIFIERS: WeatherMonsterModifiers = {
  visionModifier: 1,
  aggressionModifier: 1,
  speedModifier: 1,
  stealthBonus: false,
  prefersDarkness: false,
  prefersLight: false,
  horrorBonus: 0
};

// ============================================================================
// WEATHER-SPECIFIC MODIFIERS
// ============================================================================

function getFogModifiers(intensity: number): WeatherMonsterModifiers {
  return {
    visionModifier: 0.6,
    aggressionModifier: 1.2 * intensity,
    speedModifier: 1,
    stealthBonus: true,
    prefersDarkness: false,
    prefersLight: false,
    horrorBonus: 1
  };
}

function getRainModifiers(): WeatherMonsterModifiers {
  return {
    visionModifier: 0.8,
    aggressionModifier: 0.9,
    speedModifier: 0.9,
    stealthBonus: false,
    prefersDarkness: false,
    prefersLight: false,
    horrorBonus: 0
  };
}

function getMiasmaModifiers(intensity: number): WeatherMonsterModifiers {
  return {
    visionModifier: 0.5,
    aggressionModifier: 1.5 * intensity,
    speedModifier: 1.1,
    stealthBonus: true,
    prefersDarkness: true,
    prefersLight: false,
    horrorBonus: 2
  };
}

function getCosmicStaticModifiers(intensity: number): WeatherMonsterModifiers {
  return {
    visionModifier: 0.7,
    aggressionModifier: 1.3 * intensity,
    speedModifier: 0.8,
    stealthBonus: false,
    prefersDarkness: true,
    prefersLight: false,
    horrorBonus: 2
  };
}

function getUnnaturalGlowModifiers(intensity: number): WeatherMonsterModifiers {
  return {
    visionModifier: 1.3,
    aggressionModifier: 1.4 * intensity,
    speedModifier: 1,
    stealthBonus: false,
    prefersDarkness: false,
    prefersLight: true,
    horrorBonus: 1
  };
}

function getDarknessModifiers(intensity: number): WeatherMonsterModifiers {
  return {
    visionModifier: 0.3,
    aggressionModifier: 1.6 * intensity,
    speedModifier: 1.2,
    stealthBonus: true,
    prefersDarkness: true,
    prefersLight: false,
    horrorBonus: 3
  };
}

// ============================================================================
// PUBLIC FUNCTIONS
// ============================================================================

/**
 * Get weather modifiers for monster behavior based on current weather conditions
 */
export function getWeatherMonsterModifiers(weather: WeatherCondition | null): WeatherMonsterModifiers {
  if (!weather || weather.type === 'clear') {
    return { ...DEFAULT_MODIFIERS };
  }

  const intensity = getIntensityModifier(weather.intensity);

  switch (weather.type) {
    case 'fog':
      return getFogModifiers(intensity);
    case 'rain':
      return getRainModifiers();
    case 'miasma':
      return getMiasmaModifiers(intensity);
    case 'cosmic_static':
      return getCosmicStaticModifiers(intensity);
    case 'unnatural_glow':
      return getUnnaturalGlowModifiers(intensity);
    case 'darkness':
      return getDarknessModifiers(intensity);
    default:
      return { ...DEFAULT_MODIFIERS };
  }
}

/**
 * Check if a monster type benefits from current weather conditions
 */
export function monsterBenefitsFromWeather(type: EnemyType, weather: WeatherCondition | null): boolean {
  if (!weather || weather.type === 'clear') {
    return false;
  }

  const modifiers = getWeatherMonsterModifiers(weather);

  // Darkness-dwelling creatures thrive in dark conditions
  if (modifiers.prefersDarkness && DARKNESS_DWELLERS.includes(type)) {
    return true;
  }

  // Light-attracted creatures (supernatural entities drawn to eldritch glow)
  if (modifiers.prefersLight && LIGHT_SEEKERS.includes(type)) {
    return true;
  }

  // Aquatic creatures benefit from rain
  if (weather.type === 'rain' && type === 'deepone') {
    return true;
  }

  return false;
}

/**
 * Apply weather modifiers to monster vision range
 * Some creatures see better in their preferred conditions
 */
export function applyWeatherToVision(
  baseVision: number,
  weather: WeatherCondition | null,
  type: EnemyType
): number {
  const modifiers = getWeatherMonsterModifiers(weather);
  let effectiveVision = Math.floor(baseVision * modifiers.visionModifier);

  // Some creatures see better in their preferred conditions
  if (monsterBenefitsFromWeather(type, weather)) {
    effectiveVision = Math.max(effectiveVision, baseVision);
  }

  // Flying creatures less affected by ground-level fog
  const bestiary = BESTIARY[type];
  if (bestiary?.traits?.includes('flying') && weather?.type === 'fog') {
    effectiveVision = Math.max(effectiveVision, baseVision - 1);
  }

  return Math.max(1, effectiveVision);
}

/**
 * Get weather description messages for monster turn
 */
export function getWeatherMonsterMessage(weather: WeatherCondition | null): string | null {
  if (!weather) return null;

  const modifiers = getWeatherMonsterModifiers(weather);
  if (modifiers.aggressionModifier <= 1.2) return null;

  const weatherDescriptions: Record<string, string> = {
    fog: 'Monstre rører seg i tåken...',
    miasma: 'Vesener næres av den mørke miasmaen!',
    darkness: 'Mørket vekker ting som burde sove...',
    unnatural_glow: 'Det unaturlige lyset tiltrekker seg ondsinnede øyne!',
    cosmic_static: 'Virkelighetsforvrengningen styrker vesenene!'
  };

  return weatherDescriptions[weather.type] || null;
}
