/**
 * Asset Library - Manages game assets with caching and fallback
 *
 * Provides a unified interface for retrieving game graphics:
 * - Default: Uses static assets from /assets/ folders (GitHub images)
 * - Optional: Can use AI-generated images from localStorage when enabled
 */

import { INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, BESTIARY } from '../constants';
import { Enemy, Player, CharacterType, EnemyType } from '../types';
import {
  loadAssetLibrary as loadGeneratedLibrary,
  nameToId,
  getAssetFromLibrary
} from './AssetGenerationService';

// Import static assets (these are the default)
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
// STATIC ASSETS (DEFAULT - from GitHub)
// ============================================================================

export const CHARACTER_PORTRAITS: Record<CharacterType, string> = {
  veteran: veteranImg,
  detective: privateEyeImg,
  professor: professorImg,
  occultist: occultistImg,
  journalist: journalistImg,
  doctor: doctorImg
};

export const MONSTER_PORTRAITS: Partial<Record<EnemyType, string>> = {
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
 * @param locationName - The name of the location
 * @param _type - The type of location (unused, for compatibility)
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const generateLocationAsset = async (
    locationName: string,
    _type: 'room' | 'street' | 'building' = 'room',
    useGenerated: boolean = false
): Promise<string | null> => {
    // 1. Check static file first (default)
    const fileName = toFileName(locationName);
    const localPath = `/assets/tiles/${fileName}.png`;

    if (await checkLocalAsset(localPath)) {
        return localPath;
    }

    // 2. If useGenerated is enabled, check generated assets
    if (useGenerated) {
        const assetId = nameToId(locationName);
        const generated = getAssetFromLibrary(assetId);
        if (generated) {
            return generated;
        }
    }

    // 3. No asset available
    return null;
};

/**
 * Get location asset synchronously
 * @param locationName - The name of the location
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const getLocationAssetSync = (locationName: string, useGenerated: boolean = false): string | null => {
    // Only return generated if explicitly enabled
    if (useGenerated) {
        const assetId = nameToId(locationName);
        const generated = getAssetFromLibrary(assetId);
        if (generated) {
            return generated;
        }
    }
    return null;
};

// ============================================================================
// CHARACTER ASSET FUNCTIONS
// ============================================================================

/**
 * Get visual asset for a player character
 * @param player - The player object
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const getCharacterVisual = async (
    player: Player,
    useGenerated: boolean = false
): Promise<string> => {
    // If useGenerated is enabled, check generated assets first
    if (useGenerated) {
        const generated = getAssetFromLibrary(player.id);
        if (generated) {
            return generated;
        }
    }

    // Return static asset (default)
    return CHARACTER_PORTRAITS[player.id as CharacterType] || privateEyeImg;
};

/**
 * Get character visual synchronously
 * @param characterType - The type of character
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const getCharacterVisualSync = (
    characterType: CharacterType,
    useGenerated: boolean = false
): string => {
    // If useGenerated is enabled, check generated assets first
    if (useGenerated) {
        const generated = getAssetFromLibrary(characterType);
        if (generated) {
            return generated;
        }
    }

    // Return static asset (default)
    return CHARACTER_PORTRAITS[characterType] || privateEyeImg;
};

// ============================================================================
// ENEMY/MONSTER ASSET FUNCTIONS
// ============================================================================

/**
 * Get visual asset for an enemy
 * @param enemy - The enemy object
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const getEnemyVisual = async (
    enemy: Enemy,
    useGenerated: boolean = false
): Promise<string> => {
    // If useGenerated is enabled, check generated assets first
    if (useGenerated) {
        const generated = getAssetFromLibrary(enemy.type);
        if (generated) {
            return generated;
        }
    }

    // Return static asset (default)
    return MONSTER_PORTRAITS[enemy.type] || cultistImg;
};

/**
 * Get enemy visual synchronously
 * @param enemyType - The type of enemy
 * @param useGenerated - Whether to use generated assets (default: false)
 */
export const getEnemyVisualSync = (
    enemyType: EnemyType,
    useGenerated: boolean = false
): string => {
    // If useGenerated is enabled, check generated assets first
    if (useGenerated) {
        const generated = getAssetFromLibrary(enemyType);
        if (generated) {
            return generated;
        }
    }

    // Return static asset (default)
    return MONSTER_PORTRAITS[enemyType] || cultistImg;
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
 * Check if asset has static image available
 */
export const hasStaticAsset = (assetId: string, category: 'tile' | 'monster' | 'character'): boolean => {
    switch (category) {
        case 'character':
            return assetId in CHARACTER_PORTRAITS;
        case 'monster':
            return assetId in MONSTER_PORTRAITS;
        case 'tile':
            // Would need to check file system - return false for now
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
