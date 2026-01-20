/**
 * Asset Generation Service using Google Gemini API
 *
 * Handles AI-powered image generation for game assets including:
 * - Tiles/Locations (top-down perspective)
 * - Monsters (dramatic portraits)
 * - Characters (dramatic portraits)
 */

import { EnemyType, CharacterType } from '../types';
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

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Storage keys
export const ASSET_STORAGE_KEY = 'shadows_1920s_assets_v1';
export const API_KEY_STORAGE_KEY = 'shadows_1920s_gemini_api_key';

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const TILE_PROMPT_TEMPLATE = `Generate a game tile illustration with the following requirements:

SUBJECT: "{name}" - A location in a 1920s Lovecraftian horror board game
DESCRIPTION: {description}

STYLE REQUIREMENTS:
- Top-down 90-degree bird's-eye view perspective (looking straight down)
- Dark, atmospheric, Lovecraftian horror aesthetic
- 1920s era setting (Art Deco, Victorian decay)
- Muted color palette with deep shadows (dark browns, grays, greens, occasional eldritch purple/green glow)
- Hand-painted illustration style, similar to board game tiles
- Hexagonal tile format composition

TECHNICAL REQUIREMENTS:
- No UI elements
- No text or labels
- No grid lines
- Single cohesive scene
- Clear hexagonal boundary consideration

ATMOSPHERE: Eerie, unsettling, mysterious, decaying grandeur`;

const MONSTER_PROMPT_TEMPLATE = `Generate a monster portrait illustration with the following requirements:

SUBJECT: "{name}" - A creature from a 1920s Lovecraftian horror board game
DESCRIPTION: {description}
LORE: {lore}

STYLE REQUIREMENTS:
- Dramatic portrait view (front-facing or 3/4 view)
- Dark, atmospheric, cosmic horror aesthetic
- Eldritch, otherworldly appearance
- Muted color palette with deep shadows and occasional unnatural color highlights
- Hand-painted illustration style, similar to trading card game art
- Focus on the creature with minimal background

TECHNICAL REQUIREMENTS:
- No UI elements
- No text or labels
- No borders or frames
- Single creature focus
- Portrait composition

ATMOSPHERE: Terrifying, alien, ancient evil, wrong geometry`;

const CHARACTER_PROMPT_TEMPLATE = `Generate a character portrait illustration with the following requirements:

SUBJECT: "{name}" - A 1920s investigator in a Lovecraftian horror board game
DESCRIPTION: {description}

STYLE REQUIREMENTS:
- Dramatic portrait view (front-facing or 3/4 view)
- 1920s period-accurate clothing and accessories
- Determined, weary, or haunted expression
- Dark, atmospheric lighting with single dramatic light source
- Hand-painted illustration style, similar to Call of Cthulhu RPG art
- Focus on character with minimal background

TECHNICAL REQUIREMENTS:
- No UI elements
- No text or labels
- No borders or frames
- Single character focus
- Portrait composition (head and shoulders, possibly upper torso)

ATMOSPHERE: Noir, mysterious, brave against cosmic horror`;

// Character descriptions for generation
const CHARACTER_DESCRIPTIONS: Record<CharacterType, string> = {
  veteran: 'The Veteran - A hardened World War I soldier, scarred by the trenches. Strong and fearless, wearing a worn military jacket. Battle-hardened eyes that have seen horrors both human and inhuman.',
  detective: 'The Private Eye - A sharp-eyed detective in a fedora and trench coat. Carries a notepad and revolver. Analytical gaze, cigarette smoke curling around weathered features.',
  professor: 'The Professor - An elderly academic from Miskatonic University. Wire-rimmed spectacles, tweed jacket, surrounded by ancient tomes. Eyes gleaming with dangerous knowledge.',
  occultist: 'The Occultist - A mysterious practitioner of forbidden arts. Dark robes with arcane symbols, pale complexion. One eye seems to glow with otherworldly light.',
  journalist: 'The Journalist - An intrepid reporter seeking the truth. Press badge, camera, notepad. Young and determined, but shadows under the eyes hint at disturbing discoveries.',
  doctor: 'The Doctor - A compassionate physician burdened by impossible cases. White coat stained, medical bag in hand. Kind eyes haunted by patients lost to things medicine cannot cure.'
};

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
      name: CHARACTER_DESCRIPTIONS[type].split(' - ')[0],
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

/**
 * Build the prompt for a specific asset
 */
function buildPrompt(asset: AssetDefinition): string {
  let template: string;
  let description = asset.description || asset.name;

  switch (asset.category) {
    case 'tile':
      template = TILE_PROMPT_TEMPLATE;
      break;
    case 'monster':
      template = MONSTER_PROMPT_TEMPLATE
        .replace('{lore}', asset.lore || 'An eldritch horror from beyond the stars.');
      break;
    case 'character':
      template = CHARACTER_PROMPT_TEMPLATE;
      description = CHARACTER_DESCRIPTIONS[asset.id as CharacterType] || description;
      break;
    default:
      template = TILE_PROMPT_TEMPLATE;
  }

  return template
    .replace('{name}', asset.name)
    .replace('{description}', description);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get stored API key
 */
export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store API key
 */
export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (e) {
    console.warn('Failed to store API key:', e);
  }
}

/**
 * Remove stored API key
 */
export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to remove API key:', e);
  }
}

/**
 * Generate a single asset using Gemini API
 */
export async function generateAssetImage(
  asset: AssetDefinition,
  apiKey: string
): Promise<GenerationResult> {
  const prompt = buildPrompt(asset);

  try {
    const response = await fetch(
      `${API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png'
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract image data from response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error('Invalid response structure');
    }

    // Find the image part
    const imagePart = content.parts.find((part: { inlineData?: { data: string; mimeType: string } }) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }

    const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return {
      success: true,
      assetId: asset.id,
      base64Image
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate ${asset.name}:`, errorMessage);
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
 */
export async function generateAssetBatch(
  assets: AssetDefinition[],
  apiKey: string,
  onProgress: ProgressCallback,
  abortSignal?: AbortSignal,
  delayMs: number = 1500 // Rate limiting delay between requests
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

    const result = await generateAssetImage(asset, apiKey);

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
  assets: Record<string, string>; // assetId -> base64 or URL
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
    version: 1,
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
    version: 1,
    assets: {},
    lastUpdated: new Date().toISOString()
  };
  saveAssetLibrary(library);
}
