
import { INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, BESTIARY, CHARACTERS } from '../constants';
import { Enemy, Player, CharacterType, EnemyType } from '../types';

const ASSET_KEY = 'shadows_1920s_assets_v1';

export interface AssetLibrary {
    [locationName: string]: string; // Maps location name to Base64 image string or URL path
}

// Try to load static assets
let STATIC_ASSETS: AssetLibrary = {};

// Helper to check if a local file exists (Head request)
const checkLocalAsset = async (path: string): Promise<boolean> => {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        return false;
    }
};

// Helper to sanitize names for filenames (e.g. "Dark Altar" -> "dark_altar")
const toFileName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
};

// Load library from local storage OR static file
export const loadAssetLibrary = (): AssetLibrary => {
    try {
        const saved = localStorage.getItem(ASSET_KEY);
        const localLib = saved ? JSON.parse(saved) : {};
        return { ...STATIC_ASSETS, ...localLib };
    } catch (e) {
        console.error("Failed to load asset library", e);
        return {};
    }
};

export const saveAssetLibrary = (library: AssetLibrary) => {
    try {
        localStorage.setItem(ASSET_KEY, JSON.stringify(library));
    } catch (e) {
        console.warn("Failed to save asset library (likely quota exceeded). Assets will persist per session only.", e);
    }
};

// --- TILES ---

export const generateLocationAsset = async (locationName: string, type: 'room' | 'street' | 'building'): Promise<string | null> => {
    // 1. Check Manual File
    const fileName = toFileName(locationName);
    const localPath = `/assets/graphics/tiles/${fileName}.png`;

    if (await checkLocalAsset(localPath)) {
        return localPath;
    }

    // 2. No AI generation without API key - return null
    return null;
};

// --- CHARACTERS ---

export const getCharacterVisual = async (player: Player): Promise<string | null> => {
    // 1. Check Manual File
    const fileName = player.id; // e.g. 'detective'
    const localPath = `/assets/graphics/characters/${fileName}.png`;

    if (await checkLocalAsset(localPath)) {
        return localPath;
    }

    // 2. No AI generation without API key - return null
    return null;
};

// --- ENEMIES ---

export const getEnemyVisual = async (enemy: Enemy): Promise<string | null> => {
    // 1. Check Manual File
    const fileName = enemy.type;
    const localPath = `/assets/graphics/monsters/${fileName}.png`;

    if (await checkLocalAsset(localPath)) {
        return localPath;
    }

    // 2. No AI generation without API key - return null
    return null;
};

// Helper to get list of all missing assets
export const getMissingAssets = (currentLib: AssetLibrary, allLocations: string[]): string[] => {
    return allLocations.filter(loc => !currentLib[loc]);
};

// DOWNLOAD FUNCTION
export const downloadAssetsAsJSON = () => {
    const lib = loadAssetLibrary();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lib));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "game_assets.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
