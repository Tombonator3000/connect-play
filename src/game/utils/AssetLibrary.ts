/**
 * Asset Library - Manages game assets with caching and fallback
 *
 * Provides a unified interface for retrieving game graphics:
 * 1. First checks localStorage cache for AI-generated images
 * 2. Falls back to static assets in /assets/ folders
 * 3. Returns null if no asset is available
 */

import { INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, BESTIARY } from '../constants';
import { Enemy, Player, CharacterType, EnemyType } from '../types';
import {
  loadAssetLibrary as loadGeneratedLibrary,
  nameToId,
  getAssetFromLibrary
} from './AssetGenerationService';

// Import static assets for fallback
import veteranImg from '@/assets/characters/veteran.png';
import privateEyeImg from '@/assets/characters/private-eye.png';
import professorImg from '@/assets/characters/professor.png';
import occultistImg from '@/assets/characters/occultist.png';
import journalistImg from '@/assets/characters/journalist.png';
import doctorImg from '@/assets/characters/doctor.png';

import cultistImg from '@/assets/monsters/cultist.png';
import deeponeImg from '@/assets/monsters/deepone.png';
import ghoulImg from '@/assets/monsters/ghoul.png';
import shoggothImg from '@/assets/monsters/shoggoth.png';
import bossImg from '@/assets/monsters/boss.png';
import sniperImg from '@/assets/monsters/sniper.png';
import priestImg from '@/assets/monsters/priest.png';
import miGoImg from '@/assets/monsters/mi-go.png';
import nightgauntImg from '@/assets/monsters/nightgaunt.png';
import houndImg from '@/assets/monsters/hound.png';
import darkYoungImg from '@/assets/monsters/dark_young.png';
import byakheeImg from '@/assets/monsters/byakhee.png';
import starSpawnImg from '@/assets/monsters/star_spawn.png';
import formlessSpawnImg from '@/assets/monsters/formless_spawn.png';
import huntingHorrorImg from '@/assets/monsters/hunting_horror.png';
import moonBeastImg from '@/assets/monsters/moon_beast.png';

// ============================================================================
// STATIC FALLBACK ASSETS
// ============================================================================

const CHARACTER_FALLBACKS: Record<CharacterType, string> = {
  veteran: veteranImg,
  detective: privateEyeImg,
  professor: professorImg,
  occultist: occultistImg,
  journalist: journalistImg,
  doctor: doctorImg
};

const MONSTER_FALLBACKS: Record<EnemyType, string> = {
  cultist: cultistImg,
  deepone: deeponeImg,
  ghoul: ghoulImg,
  shoggoth: shoggothImg,
  boss: bossImg,
  sniper: sniperImg,
  priest: priestImg,
  'mi-go': miGoImg,
  nightgaunt: nightgauntImg,
  hound: houndImg,
  dark_young: darkYoungImg,
  byakhee: byakheeImg,
  star_spawn: starSpawnImg,
  formless_spawn: formlessSpawnImg,
  hunting_horror: huntingHorrorImg,
  moon_beast: moonBeastImg
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

const ASSET_KEY = 'shadows_1920s_assets_v1';

export interface AssetLibrary {
    [locationName: string]: string;
}

/**
 * Load library from localStorage (legacy interface)
 */
export const loadAssetLibrary = (): AssetLibrary => {
    try {
        const saved = localStorage.getItem(ASSET_KEY);
        const localLib = saved ? JSON.parse(saved) : {};
        // Merge with generated library
        const generated = loadGeneratedLibrary();
        return { ...generated.assets, ...localLib };
    } catch (e) {
        console.error("Failed to load asset library", e);
        return {};
    }
};

/**
 * Save library to localStorage (legacy interface)
 */
export const saveAssetLibrary = (library: AssetLibrary) => {
    try {
        localStorage.setItem(ASSET_KEY, JSON.stringify(library));
    } catch (e) {
        console.warn("Failed to save asset library (likely quota exceeded).", e);
    }
};

// ============================================================================
// TILE ASSET FUNCTIONS
// ============================================================================

/**
 * Helper to check if a local file exists (HEAD request)
 */
const checkLocalAsset = async (path: string): Promise<boolean> => {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Convert display name to filename
 */
const toFileName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
};

/**
 * Get asset for a tile/location
 * Priority: Generated (localStorage) -> Static file -> null
 */
export const generateLocationAsset = async (
    locationName: string,
    _type: 'room' | 'street' | 'building' = 'room'
): Promise<string | null> => {
    // 1. Check generated assets in localStorage
    const assetId = nameToId(locationName);
    const generated = getAssetFromLibrary(assetId);
    if (generated) {
        return generated;
    }

    // 2. Check static file
    const fileName = toFileName(locationName);
    const localPath = `/assets/tiles/${fileName}.png`;

    if (await checkLocalAsset(localPath)) {
        return localPath;
    }

    // 3. No asset available
    return null;
};

/**
 * Get location asset synchronously (for immediate use, checks cache only)
 */
export const getLocationAssetSync = (locationName: string): string | null => {
    const assetId = nameToId(locationName);
    return getAssetFromLibrary(assetId);
};

// ============================================================================
// CHARACTER ASSET FUNCTIONS
// ============================================================================

/**
 * Get visual asset for a player character
 * Priority: Generated -> Static fallback
 */
export const getCharacterVisual = async (player: Player): Promise<string | null> => {
    // 1. Check generated assets
    const generated = getAssetFromLibrary(player.id);
    if (generated) {
        return generated;
    }

    // 2. Return static fallback
    const fallback = CHARACTER_FALLBACKS[player.id as CharacterType];
    return fallback || null;
};

/**
 * Get character visual synchronously
 */
export const getCharacterVisualSync = (characterType: CharacterType): string => {
    // Check generated first
    const generated = getAssetFromLibrary(characterType);
    if (generated) {
        return generated;
    }

    // Return fallback
    return CHARACTER_FALLBACKS[characterType] || privateEyeImg;
};

// ============================================================================
// ENEMY/MONSTER ASSET FUNCTIONS
// ============================================================================

/**
 * Get visual asset for an enemy
 * Priority: Generated -> Static fallback
 */
export const getEnemyVisual = async (enemy: Enemy): Promise<string | null> => {
    // 1. Check generated assets
    const generated = getAssetFromLibrary(enemy.type);
    if (generated) {
        return generated;
    }

    // 2. Return static fallback
    const fallback = MONSTER_FALLBACKS[enemy.type];
    return fallback || null;
};

/**
 * Get enemy visual synchronously
 */
export const getEnemyVisualSync = (enemyType: EnemyType): string => {
    // Check generated first
    const generated = getAssetFromLibrary(enemyType);
    if (generated) {
        return generated;
    }

    // Return fallback
    return MONSTER_FALLBACKS[enemyType] || cultistImg;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get list of all location names
 */
export const getAllLocationNames = (): string[] => {
    return [...INDOOR_LOCATIONS, ...OUTDOOR_LOCATIONS];
};

/**
 * Get list of all monster types
 */
export const getAllMonsterTypes = (): EnemyType[] => {
    return Object.keys(BESTIARY) as EnemyType[];
};

/**
 * Get list of all character types
 */
export const getAllCharacterTypes = (): CharacterType[] => {
    return ['veteran', 'detective', 'professor', 'occultist', 'journalist', 'doctor'];
};

/**
 * Get helper to check which assets are missing
 */
export const getMissingAssets = (currentLib: AssetLibrary, allLocations: string[]): string[] => {
    return allLocations.filter(loc => !currentLib[loc] && !currentLib[nameToId(loc)]);
};

/**
 * Check if an asset has been generated (in localStorage)
 */
export const hasGeneratedAsset = (assetId: string): boolean => {
    const asset = getAssetFromLibrary(assetId);
    return asset !== null && asset.startsWith('data:');
};

/**
 * Check if asset has static fallback available
 */
export const hasStaticFallback = (assetId: string, category: 'tile' | 'monster' | 'character'): boolean => {
    switch (category) {
        case 'character':
            return assetId in CHARACTER_FALLBACKS;
        case 'monster':
            return assetId in MONSTER_FALLBACKS;
        case 'tile':
            // Tiles don't have comprehensive static fallbacks
            return false;
        default:
            return false;
    }
};

// ============================================================================
// DOWNLOAD/EXPORT FUNCTIONS
// ============================================================================

/**
 * Download all assets as JSON
 */
export const downloadAssetsAsJSON = () => {
    const lib = loadAssetLibrary();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lib, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mythos_assets_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
