/**
 * Asset Generation Service using Pollinations.ai
 *
 * FREE image generation - no API key required!
 *
 * Handles AI-powered image generation for game assets including:
 * - Tiles/Locations (top-down perspective)
 * - Monsters (dramatic portraits)
 * - Characters (dramatic portraits)
 *
 * API: https://image.pollinations.ai/prompt/{encoded_prompt}
 */

import { CharacterType } from '../types';
import { INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, BESTIARY } from '../constants';

// ============================================================================
// TYPES
// ============================================================================

export type AssetCategory = 'tile' | 'monster' | 'character';

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  description?: string;
  lore?: string;
  promptHints?: string[];
}

export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  status: 'idle' | 'generating' | 'paused' | 'complete' | 'error';
  errors: Array<{ assetId: string; error: string }>;
}

export interface GenerationResult {
  success: boolean;
  assetId: string;
  base64Image?: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt';

// Image dimensions per category
const IMAGE_DIMENSIONS = {
  tile: { width: 512, height: 512 },
  monster: { width: 512, height: 512 },
  character: { width: 512, height: 640 },
};

// Model options: 'flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo'
const DEFAULT_MODEL = 'flux';

// Storage keys
export const ASSET_STORAGE_KEY = 'shadows_1920s_assets_v2'; // v2 for Pollinations migration

// ============================================================================
// STYLE CONSTANTS (Lovecraftian 1920s aesthetic)
// ============================================================================

const STYLE_BASE = 'dark atmospheric 1920s lovecraftian horror, muted colors, oil painting, eldritch cosmic horror';

const STYLE_TILE = 'top-down birds eye view, game tile, hexagonal composition, dark shadows, vintage board game art';

const STYLE_MONSTER = 'dramatic portrait, menacing creature, otherworldly, tentacles, nightmare horror, dark fantasy art';

const STYLE_CHARACTER = '1920s investigator portrait, noir style, dramatic lighting, call of cthulhu rpg art style';

// Character descriptions for generation
const CHARACTER_DESCRIPTIONS: Record<CharacterType, string> = {
  veteran: 'WWI soldier, scarred face, worn military jacket, battle-hardened eyes, grizzled',
  detective: 'private eye detective, fedora, trench coat, cigarette, analytical gaze, noir',
  professor: 'elderly professor, wire-rimmed spectacles, tweed jacket, ancient tomes, scholarly',
  occultist: 'mysterious occultist, dark robes, arcane symbols, pale complexion, glowing eye',
  journalist: 'young journalist, press badge, camera, notepad, determined expression',
  doctor: 'compassionate doctor, white coat, medical bag, kind but haunted eyes'
};

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build a concise prompt optimized for Pollinations
 */
function buildPrompt(asset: AssetDefinition): string {
  const parts: string[] = [];

  switch (asset.category) {
    case 'tile':
      parts.push(asset.name);
      parts.push('1920s Arkham location');
      if (asset.description) {
        parts.push(asset.description.substring(0, 50));
      }
      parts.push(STYLE_TILE);
      parts.push(STYLE_BASE);
      break;

    case 'monster':
      parts.push(asset.name);
      if (asset.description) {
        parts.push(asset.description.substring(0, 80));
      }
      if (asset.lore) {
        parts.push(asset.lore.substring(0, 50));
      }
      parts.push(STYLE_MONSTER);
      parts.push(STYLE_BASE);
      break;

    case 'character':
      const charDesc = CHARACTER_DESCRIPTIONS[asset.id as CharacterType];
      if (charDesc) {
        parts.push(charDesc);
      } else {
        parts.push(asset.name);
        parts.push(asset.description || '1920s investigator');
      }
      parts.push(STYLE_CHARACTER);
      parts.push(STYLE_BASE);
      break;

    default:
      parts.push(asset.name);
      parts.push(STYLE_BASE);
  }

  // Add quality modifiers
  parts.push('masterpiece, best quality, highly detailed');

  return parts.join(', ');
}

/**
 * Generate a consistent seed from asset ID for reproducible images
 */
function generateSeed(assetId: string): number {
  let hash = 0;
  for (let i = 0; i < assetId.length; i++) {
    const char = assetId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Build the Pollinations URL for an asset
 */
function buildPollinationsUrl(asset: AssetDefinition): string {
  const prompt = buildPrompt(asset);
  const encodedPrompt = encodeURIComponent(prompt);
  const dimensions = IMAGE_DIMENSIONS[asset.category];
  const seed = generateSeed(asset.id);

  return `${POLLINATIONS_BASE_URL}/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&model=${DEFAULT_MODEL}&seed=${seed}&nologo=true`;
}

// ============================================================================
// ASSET REGISTRY
// ============================================================================

/**
 * Get all asset definitions from the game constants
 */
export function getAllAssetDefinitions(): AssetDefinition[] {
  const assets: AssetDefinition[] = [];

  // Add all tile locations
  [...INDOOR_LOCATIONS, ...OUTDOOR_LOCATIONS].forEach(name => {
    assets.push({
      id: nameToId(name),
      name,
      category: 'tile',
      description: `A ${name.toLowerCase()} location in 1920s Arkham`
    });
  });

  // Add all monsters from bestiary
  Object.entries(BESTIARY).forEach(([type, entry]) => {
    assets.push({
      id: type,
      name: entry.name,
      category: 'monster',
      description: entry.description,
      lore: entry.lore
    });
  });

  // Add all characters
  const characterTypes: CharacterType[] = ['veteran', 'detective', 'professor', 'occultist', 'journalist', 'doctor'];
  characterTypes.forEach(type => {
    assets.push({
      id: type,
      name: `The ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      category: 'character',
      description: CHARACTER_DESCRIPTIONS[type]
    });
  });

  return assets;
}

/**
 * Convert a display name to an ID
 */
export function nameToId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// ============================================================================
// API FUNCTIONS (No API key needed!)
// ============================================================================

/**
 * These functions are kept for backwards compatibility but do nothing
 * since Pollinations doesn't require an API key
 */
export function getStoredApiKey(): string | null {
  return 'pollinations-free'; // Return a dummy value for UI compatibility
}

export function setStoredApiKey(_key: string): void {
  // No-op: Pollinations doesn't need an API key
}

export function removeStoredApiKey(): void {
  // No-op: Pollinations doesn't need an API key
}

/**
 * Fetch image from URL and convert to base64 data URL
 */
async function fetchImageAsBase64(url: string, timeout: number = 60000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - image generation took too long');
    }
    throw error;
  }
}

/**
 * Generate a single asset using Pollinations API
 * No API key required!
 */
export async function generateAssetImage(
  asset: AssetDefinition,
  _apiKey?: string // Kept for backwards compatibility, but ignored
): Promise<GenerationResult> {
  const imageUrl = buildPollinationsUrl(asset);

  console.log(`[AssetGen] Generating ${asset.category}: ${asset.name}`);
  console.log(`[AssetGen] URL: ${imageUrl.substring(0, 100)}...`);

  try {
    const base64Image = await fetchImageAsBase64(imageUrl);

    console.log(`[AssetGen] Success: ${asset.name} (${Math.round(base64Image.length / 1024)}KB)`);

    return {
      success: true,
      assetId: asset.id,
      base64Image
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[AssetGen] Failed: ${asset.name} - ${errorMessage}`);
    return {
      success: false,
      assetId: asset.id,
      error: errorMessage
    };
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export type ProgressCallback = (progress: GenerationProgress) => void;
export type AbortSignal = { aborted: boolean };

/**
 * Generate multiple assets in batch with progress tracking
 * No API key required!
 */
export async function generateAssetBatch(
  assets: AssetDefinition[],
  _apiKey: string, // Kept for backwards compatibility, but ignored
  onProgress: ProgressCallback,
  abortSignal?: AbortSignal,
  delayMs: number = 2000 // Delay between requests to be nice to the API
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const progress: GenerationProgress = {
    total: assets.length,
    completed: 0,
    failed: 0,
    current: null,
    status: 'generating',
    errors: []
  };

  onProgress({ ...progress });

  for (const asset of assets) {
    // Check for abort
    if (abortSignal?.aborted) {
      progress.status = 'paused';
      onProgress({ ...progress });
      break;
    }

    progress.current = asset.name;
    onProgress({ ...progress });

    const result = await generateAssetImage(asset);

    if (result.success && result.base64Image) {
      results.set(asset.id, result.base64Image);
      progress.completed++;
    } else {
      progress.failed++;
      progress.errors.push({
        assetId: asset.id,
        error: result.error || 'Unknown error'
      });
    }

    onProgress({ ...progress });

    // Rate limiting delay (skip for last item)
    if (assets.indexOf(asset) < assets.length - 1 && !abortSignal?.aborted) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  progress.current = null;
  progress.status = abortSignal?.aborted ? 'paused' : 'complete';
  onProgress({ ...progress });

  return results;
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

export interface StoredAssetLibrary {
  version: number;
  assets: Record<string, string>; // assetId -> base64 data URL
  lastUpdated: string;
}

/**
 * Load asset library from localStorage
 */
export function loadAssetLibrary(): StoredAssetLibrary {
  try {
    const saved = localStorage.getItem(ASSET_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load asset library:', e);
  }

  return {
    version: 2,
    assets: {},
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Save asset library to localStorage
 */
export function saveAssetLibrary(library: StoredAssetLibrary): boolean {
  try {
    library.lastUpdated = new Date().toISOString();
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(library));
    return true;
  } catch (e) {
    console.warn('Failed to save asset library (likely quota exceeded):', e);
    return false;
  }
}

/**
 * Add assets to the library
 */
export function addAssetsToLibrary(newAssets: Map<string, string>): boolean {
  const library = loadAssetLibrary();
  newAssets.forEach((value, key) => {
    library.assets[key] = value;
  });
  return saveAssetLibrary(library);
}

/**
 * Get a single asset from library
 */
export function getAssetFromLibrary(assetId: string): string | null {
  const library = loadAssetLibrary();
  return library.assets[assetId] || null;
}

/**
 * Check which assets are missing from the library
 */
export function getMissingAssets(allAssets: AssetDefinition[]): AssetDefinition[] {
  const library = loadAssetLibrary();
  return allAssets.filter(asset => !library.assets[asset.id]);
}

/**
 * Get asset counts by category
 */
export function getAssetCounts(): {
  tiles: { total: number; generated: number };
  monsters: { total: number; generated: number };
  characters: { total: number; generated: number };
  total: { total: number; generated: number };
} {
  const allAssets = getAllAssetDefinitions();
  const library = loadAssetLibrary();

  const tiles = allAssets.filter(a => a.category === 'tile');
  const monsters = allAssets.filter(a => a.category === 'monster');
  const characters = allAssets.filter(a => a.category === 'character');

  return {
    tiles: {
      total: tiles.length,
      generated: tiles.filter(a => library.assets[a.id]).length
    },
    monsters: {
      total: monsters.length,
      generated: monsters.filter(a => library.assets[a.id]).length
    },
    characters: {
      total: characters.length,
      generated: characters.filter(a => library.assets[a.id]).length
    },
    total: {
      total: allAssets.length,
      generated: Object.keys(library.assets).length
    }
  };
}

/**
 * Export library as downloadable JSON
 */
export function exportLibraryAsJson(): void {
  const library = loadAssetLibrary();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(library, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `mythos_assets_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * Import library from JSON file
 */
export async function importLibraryFromJson(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const text = await file.text();
    const imported = JSON.parse(text) as StoredAssetLibrary;

    if (!imported.assets || typeof imported.assets !== 'object') {
      throw new Error('Invalid library format');
    }

    const library = loadAssetLibrary();
    let count = 0;

    Object.entries(imported.assets).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        library.assets[key] = value;
        count++;
      }
    });

    saveAssetLibrary(library);

    return { success: true, count };
  } catch (e) {
    return {
      success: false,
      count: 0,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }
}

/**
 * Clear all generated assets from library
 */
export function clearAssetLibrary(): void {
  const library: StoredAssetLibrary = {
    version: 2,
    assets: {},
    lastUpdated: new Date().toISOString()
  };
  saveAssetLibrary(library);
}
