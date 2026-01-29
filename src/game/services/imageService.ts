/**
 * Image Generation Service for Mythos Quest
 *
 * Provides AI-generated images using Pollinations.ai (free, no API key required)
 *
 * Features:
 * - Dynamic location/room images
 * - Monster encounter portraits
 * - Event card illustrations
 * - localStorage caching to minimize requests
 * - Fallback to static images
 *
 * Pollinations.ai API:
 * URL: https://image.pollinations.ai/prompt/{encoded_prompt}
 * Optional params: width, height, model, seed, nologo
 */

import { Tile, Enemy } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API Configuration
  apiBaseUrl: 'https://image.pollinations.ai/prompt',

  // Default image dimensions
  defaultWidth: 512,
  defaultHeight: 384,
  thumbnailWidth: 256,
  thumbnailHeight: 192,

  // Model options: 'flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo'
  defaultModel: 'flux',

  // Feature flags
  enabled: import.meta.env.VITE_ENABLE_AI_IMAGES !== 'false', // Enabled by default

  // Cache settings
  cachePrefix: 'mythos_img_',
  cacheExpiryDays: 30, // Images can be cached longer than text
  maxCacheSize: 50, // Max number of cached images

  // Rate limiting
  minRequestInterval: 2000, // 2 seconds between requests
  maxConcurrentRequests: 2,
  requestTimeout: 30000, // 30 seconds
};

let lastRequestTime = 0;
let activeRequests = 0;

// ============================================================================
// TYPES
// ============================================================================

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  model?: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo';
  seed?: number;
  enhance?: boolean; // Add extra quality keywords
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  isGenerated: boolean;
  isCached: boolean;
  timestamp: number;
}

interface CacheEntry {
  url: string; // data URL or blob URL
  prompt: string;
  timestamp: number;
  version: string;
}

export type ImageCategory = 'location' | 'monster' | 'event' | 'item';

export interface ImageGenerationContext {
  category: ImageCategory;
  name: string;
  description?: string;
  atmosphere?: string;
  features?: string[];
}

// ============================================================================
// STYLE PROMPTS
// ============================================================================

/**
 * Lovecraftian art style modifiers for consistent atmosphere
 */
const STYLE_MODIFIERS = {
  base: 'dark atmospheric 1920s lovecraftian horror, muted colors, oil painting style, eldritch, cosmic horror',
  location: 'interior view, wide angle, dramatic lighting, shadows, vintage aesthetic',
  monster: 'portrait, menacing, otherworldly, tentacles, non-euclidean geometry, nightmare creature',
  event: 'dramatic scene, mysterious, occult symbolism, vintage illustration style',
  item: 'still life, artifact, antique, mysterious glow, detailed texture',
};

const NEGATIVE_PROMPT = 'bright colors, cartoon, anime, happy, modern, cheerful, cute, kawaii';

// ============================================================================
// CACHE UTILITIES
// ============================================================================

const CACHE_VERSION = '1.0.0';

function getCacheKey(category: string, identifier: string): string {
  // Create a simple hash of the identifier for shorter keys
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${CONFIG.cachePrefix}${category}_${hash.toString(36)}`;
}

function getFromCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry = JSON.parse(raw);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check expiry
    const expiryMs = CONFIG.cacheExpiryDays * 24 * 60 * 60 * 1000;
    if (Date.now() - entry.timestamp > expiryMs) {
      localStorage.removeItem(key);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

function saveToCache(key: string, entry: Omit<CacheEntry, 'version'>): void {
  try {
    const fullEntry: CacheEntry = {
      ...entry,
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(fullEntry));
  } catch (e) {
    // localStorage might be full - try clearing old entries
    clearOldCacheEntries();
    try {
      localStorage.setItem(key, JSON.stringify({ ...entry, version: CACHE_VERSION }));
    } catch {
      console.warn('[ImageService] Cache full, could not save image');
    }
  }
}

function clearOldCacheEntries(): void {
  const entries: { key: string; timestamp: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONFIG.cachePrefix)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          entries.push({ key, timestamp: parsed.timestamp || 0 });
        }
      } catch {
        // Remove corrupted entries
        if (key) localStorage.removeItem(key);
      }
    }
  }

  // Sort by timestamp (oldest first) and remove excess
  if (entries.length > CONFIG.maxCacheSize) {
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, entries.length - CONFIG.maxCacheSize + 10);
    toRemove.forEach(e => localStorage.removeItem(e.key));
    console.log(`[ImageService] Cleared ${toRemove.length} old cache entries`);
  }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build a prompt for location/room images
 */
function buildLocationPrompt(tile: Tile, atmosphere?: string): string {
  const parts: string[] = [];

  // Base description
  parts.push(tile.name);

  // Add tile-specific details
  if (tile.category) {
    const categoryDescriptions: Record<string, string> = {
      room: 'interior room',
      corridor: 'narrow hallway passage',
      foyer: 'entrance hall foyer',
      basement: 'underground cellar basement',
      crypt: 'ancient crypt burial chamber',
      stairs: 'staircase',
      street: 'foggy 1920s city street',
      urban: 'urban environment',
      nature: 'wilderness outdoor scene',
    };
    parts.push(categoryDescriptions[tile.category] || tile.category);
  }

  // Floor type atmosphere
  if (tile.floorType) {
    const floorAtmosphere: Record<string, string> = {
      wood: 'wooden floorboards creaking',
      stone: 'cold stone floor ancient',
      dirt: 'earthen dirt floor damp',
      water: 'flooded wet floor',
      carpet: 'worn carpet dusty',
      tile: 'tiled floor cracked',
      grass: 'overgrown grass weeds',
      cobblestone: 'cobblestone street wet',
    };
    if (floorAtmosphere[tile.floorType]) {
      parts.push(floorAtmosphere[tile.floorType]);
    }
  }

  // Dark room modifier
  if (tile.isDarkRoom && !tile.darkRoomIlluminated) {
    parts.push('shrouded in darkness, only candlelight, deep shadows');
  }

  // Custom atmosphere
  if (atmosphere) {
    parts.push(atmosphere);
  }

  // Add style modifiers
  parts.push(STYLE_MODIFIERS.base);
  parts.push(STYLE_MODIFIERS.location);

  return parts.join(', ');
}

/**
 * Build a prompt for monster images
 */
function buildMonsterPrompt(enemy: Enemy | string, additionalContext?: string): string {
  const parts: string[] = [];

  const name = typeof enemy === 'string' ? enemy : enemy.name;
  const type = typeof enemy === 'string' ? enemy : enemy.type;

  // Monster-specific descriptions
  const monsterDescriptions: Record<string, string> = {
    deep_one: 'fish-like humanoid creature, bulging eyes, gills, webbed hands, scaled skin, emerging from water',
    ghoul: 'hunched corpse-eating creature, long claws, canine features, graveyard dweller, decayed flesh',
    cultist: 'hooded robed figure, cult ritual, occult symbols, fanatical, shadowy face',
    shoggoth: 'amorphous blob of eyes and mouths, protoplasmic horror, constantly shifting mass',
    mi_go: 'fungoid crustacean alien, pink membranous wings, clawed limbs, bulbous head',
    byakhee: 'bat-winged interstellar creature, membranous wings, riding between stars',
    nightgaunt: 'faceless black humanoid, bat wings, horned, rubbery skin, silent predator',
    star_spawn: 'octopoid entity, tentacled horror, cosmic being, mountain-sized presence',
    dark_young: 'tree-like abomination, hooved, tentacled, shambling forest horror',
    ghast: 'underground humanoid predator, eyeless, elongated limbs, pale skin',
    zoog: 'small rodent-like creature, intelligent eyes, forest dweller, sharp teeth',
    rat_thing: 'human-faced rat, familiar creature, witch servant, disturbing hybrid',
    fire_vampire: 'living flame entity, star-spawned, burning light, cosmic fire being',
    dimensional_shambler: 'ape-like entity, phasing between dimensions, wrinkled hide, long arms',
    serpent_man: 'reptilian humanoid, ancient civilization, scaled, hooded, forked tongue',
    gug: 'giant subterranean creature, vertical mouth, four arms, massive clawed hands',
    cthonian: 'worm-like burrowing entity, tentacled maw, earth-dwelling horror',
    tcho_tcho: 'degenerate human tribal, cannibalistic, primitive weapons, wild eyes',
    flying_polyp: 'invisible whistling horror, partially visible, wind-based entity',
    lloigor: 'twin serpentine entities, psychic horror, vortex of malevolent energy',
    gnoph_keh: 'arctic horror, six-legged, polar predator, ice and snow',
    colour_out_of_space: 'indescribable color, alien spectrum, corrupting light, withering touch',
    elder_thing: 'barrel-shaped alien, starfish head, wings, ancient antarctic beings',
  };

  // Add monster name and description
  parts.push(name);
  if (monsterDescriptions[type]) {
    parts.push(monsterDescriptions[type]);
  } else {
    parts.push('eldritch abomination, otherworldly creature');
  }

  if (additionalContext) {
    parts.push(additionalContext);
  }

  // Add style modifiers
  parts.push(STYLE_MODIFIERS.base);
  parts.push(STYLE_MODIFIERS.monster);

  return parts.join(', ');
}

/**
 * Build a prompt for event card images
 */
function buildEventPrompt(eventName: string, eventDescription?: string): string {
  const parts: string[] = [];

  parts.push(eventName);

  if (eventDescription) {
    // Extract key visual elements from description
    parts.push(eventDescription.substring(0, 100));
  }

  // Add style modifiers
  parts.push(STYLE_MODIFIERS.base);
  parts.push(STYLE_MODIFIERS.event);

  return parts.join(', ');
}

/**
 * Build a prompt for item images
 */
function buildItemPrompt(itemName: string, itemType?: string): string {
  const parts: string[] = [];

  parts.push(itemName);

  if (itemType) {
    const itemTypeDescriptions: Record<string, string> = {
      weapon: 'vintage weapon, 1920s equipment',
      armor: 'protective gear, worn leather',
      tool: 'investigator tool, brass and leather',
      consumable: 'medicine bottle, vintage packaging',
      relic: 'ancient artifact, occult relic, mysterious glow',
      key: 'ornate key, antique metal',
    };
    if (itemTypeDescriptions[itemType]) {
      parts.push(itemTypeDescriptions[itemType]);
    }
  }

  // Add style modifiers
  parts.push(STYLE_MODIFIERS.base);
  parts.push(STYLE_MODIFIERS.item);

  return parts.join(', ');
}

// ============================================================================
// API UTILITIES
// ============================================================================

/**
 * Build the Pollinations.ai URL for image generation
 */
function buildImageUrl(prompt: string, options: ImageGenerationOptions = {}): string {
  const {
    width = CONFIG.defaultWidth,
    height = CONFIG.defaultHeight,
    model = CONFIG.defaultModel,
    seed,
    enhance = true,
  } = options;

  // Add enhancement keywords if enabled
  let finalPrompt = prompt;
  if (enhance) {
    finalPrompt = `${prompt}, masterpiece, best quality, highly detailed`;
  }

  // Encode the prompt for URL
  const encodedPrompt = encodeURIComponent(finalPrompt);

  // Build URL with parameters
  let url = `${CONFIG.apiBaseUrl}/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true`;

  if (seed !== undefined) {
    url += `&seed=${seed}`;
  }

  return url;
}

/**
 * Rate-limited fetch with timeout
 */
async function fetchWithRateLimit(url: string): Promise<Response> {
  // Wait for rate limit
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < CONFIG.minRequestInterval) {
    await new Promise(resolve =>
      setTimeout(resolve, CONFIG.minRequestInterval - timeSinceLastRequest)
    );
  }

  // Wait for concurrent request slot
  while (activeRequests >= CONFIG.maxConcurrentRequests) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  activeRequests++;
  lastRequestTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } finally {
    activeRequests--;
  }
}

/**
 * Convert image URL to data URL for caching
 */
async function imageUrlToDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetchWithRateLimit(imageUrl);
    if (!response.ok) {
      console.error('[ImageService] Failed to fetch image:', response.status);
      return null;
    }

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[ImageService] Error converting image:', error);
    return null;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate an image for a location/tile
 */
export async function generateLocationImage(
  tile: Tile,
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
  const prompt = buildLocationPrompt(tile);
  const cacheKey = getCacheKey('loc', `${tile.name}_${tile.q}_${tile.r}`);

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[ImageService] Location image from cache:', tile.name);
    return {
      url: cached.url,
      prompt: cached.prompt,
      isGenerated: true,
      isCached: true,
      timestamp: cached.timestamp,
    };
  }

  // Check if generation is enabled
  if (!CONFIG.enabled) {
    return getFallbackLocationImage(tile);
  }

  console.log('[ImageService] Generating location image for:', tile.name);

  // Generate image URL
  const imageUrl = buildImageUrl(prompt, options);

  // For location images, we can use the URL directly (no caching as data URL)
  // This is faster and saves localStorage space
  return {
    url: imageUrl,
    prompt,
    isGenerated: true,
    isCached: false,
    timestamp: Date.now(),
  };
}

/**
 * Generate an image for a monster
 */
export async function generateMonsterImage(
  enemy: Enemy | string,
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
  const name = typeof enemy === 'string' ? enemy : enemy.name;
  const type = typeof enemy === 'string' ? enemy : enemy.type;
  const prompt = buildMonsterPrompt(enemy);
  const cacheKey = getCacheKey('mon', type);

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[ImageService] Monster image from cache:', name);
    return {
      url: cached.url,
      prompt: cached.prompt,
      isGenerated: true,
      isCached: true,
      timestamp: cached.timestamp,
    };
  }

  // Check if generation is enabled
  if (!CONFIG.enabled) {
    return getFallbackMonsterImage(type);
  }

  console.log('[ImageService] Generating monster image for:', name);

  // Generate and cache monster images (they're reused more often)
  const imageUrl = buildImageUrl(prompt, {
    ...options,
    width: options.width || 384,
    height: options.height || 384,
    seed: hashString(type), // Use consistent seed for same monster type
  });

  // Try to cache as data URL
  const dataUrl = await imageUrlToDataUrl(imageUrl);
  if (dataUrl) {
    saveToCache(cacheKey, {
      url: dataUrl,
      prompt,
      timestamp: Date.now(),
    });

    return {
      url: dataUrl,
      prompt,
      isGenerated: true,
      isCached: false,
      timestamp: Date.now(),
    };
  }

  // Fall back to direct URL if caching fails
  return {
    url: imageUrl,
    prompt,
    isGenerated: true,
    isCached: false,
    timestamp: Date.now(),
  };
}

/**
 * Generate an image for an event card
 */
export async function generateEventImage(
  eventName: string,
  eventDescription?: string,
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
  const prompt = buildEventPrompt(eventName, eventDescription);
  const cacheKey = getCacheKey('evt', eventName);

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[ImageService] Event image from cache:', eventName);
    return {
      url: cached.url,
      prompt: cached.prompt,
      isGenerated: true,
      isCached: true,
      timestamp: cached.timestamp,
    };
  }

  // Check if generation is enabled
  if (!CONFIG.enabled) {
    return getFallbackEventImage(eventName);
  }

  console.log('[ImageService] Generating event image for:', eventName);

  const imageUrl = buildImageUrl(prompt, {
    ...options,
    width: options.width || 384,
    height: options.height || 256,
    seed: hashString(eventName),
  });

  return {
    url: imageUrl,
    prompt,
    isGenerated: true,
    isCached: false,
    timestamp: Date.now(),
  };
}

/**
 * Generate an image for an item
 */
export async function generateItemImage(
  itemName: string,
  itemType?: string,
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
  const prompt = buildItemPrompt(itemName, itemType);
  const cacheKey = getCacheKey('itm', itemName);

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[ImageService] Item image from cache:', itemName);
    return {
      url: cached.url,
      prompt: cached.prompt,
      isGenerated: true,
      isCached: true,
      timestamp: cached.timestamp,
    };
  }

  // Check if generation is enabled
  if (!CONFIG.enabled) {
    return getFallbackItemImage(itemName);
  }

  console.log('[ImageService] Generating item image for:', itemName);

  const imageUrl = buildImageUrl(prompt, {
    ...options,
    width: options.width || 256,
    height: options.height || 256,
    seed: hashString(itemName),
  });

  return {
    url: imageUrl,
    prompt,
    isGenerated: true,
    isCached: false,
    timestamp: Date.now(),
  };
}

/**
 * Preload and cache images for a list of items
 * Useful for batch loading monster images at game start
 */
export async function preloadImages(
  items: Array<{ category: ImageCategory; identifier: string; data?: unknown }>,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  const total = items.length;

  for (const item of items) {
    try {
      switch (item.category) {
        case 'monster':
          await generateMonsterImage(item.identifier);
          break;
        case 'event':
          await generateEventImage(item.identifier);
          break;
        case 'item':
          await generateItemImage(item.identifier);
          break;
        // Location images are generated on-demand, skip preloading
      }
    } catch (error) {
      console.warn(`[ImageService] Failed to preload ${item.category}:`, item.identifier);
    }

    loaded++;
    onProgress?.(loaded, total);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if AI image generation is enabled
 */
export function isImageGenerationEnabled(): boolean {
  return CONFIG.enabled;
}

/**
 * Enable or disable AI image generation
 */
export function setImageGenerationEnabled(enabled: boolean): void {
  (CONFIG as { enabled: boolean }).enabled = enabled;
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONFIG.cachePrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`[ImageService] Cleared ${keysToRemove.length} cached images`);
}

/**
 * Get cache statistics
 */
export function getImageCacheStats(): { count: number; sizeKB: number } {
  let count = 0;
  let sizeBytes = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONFIG.cachePrefix)) {
      count++;
      const value = localStorage.getItem(key);
      if (value) {
        sizeBytes += value.length * 2; // UTF-16
      }
    }
  }

  return {
    count,
    sizeKB: Math.round(sizeBytes / 1024 * 100) / 100,
  };
}

/**
 * Get a direct Pollinations URL without caching (for debugging/preview)
 */
export function getDirectImageUrl(prompt: string, options?: ImageGenerationOptions): string {
  return buildImageUrl(prompt, options);
}

// ============================================================================
// FALLBACK IMAGES
// ============================================================================

function getFallbackLocationImage(tile: Tile): GeneratedImage {
  // Return a placeholder or static image based on tile category
  const placeholders: Record<string, string> = {
    room: '/placeholder.svg',
    corridor: '/placeholder.svg',
    foyer: '/placeholder.svg',
    basement: '/placeholder.svg',
    crypt: '/placeholder.svg',
    stairs: '/placeholder.svg',
    street: '/placeholder.svg',
    urban: '/placeholder.svg',
    nature: '/placeholder.svg',
  };

  return {
    url: placeholders[tile.category || 'room'] || '/placeholder.svg',
    prompt: '',
    isGenerated: false,
    isCached: false,
    timestamp: Date.now(),
  };
}

function getFallbackMonsterImage(monsterType: string): GeneratedImage {
  // Check if we have a static monster image
  const staticPath = `/src/assets/monsters/${monsterType}.png`;

  return {
    url: staticPath,
    prompt: '',
    isGenerated: false,
    isCached: false,
    timestamp: Date.now(),
  };
}

function getFallbackEventImage(_eventName: string): GeneratedImage {
  return {
    url: '/placeholder.svg',
    prompt: '',
    isGenerated: false,
    isCached: false,
    timestamp: Date.now(),
  };
}

function getFallbackItemImage(_itemName: string): GeneratedImage {
  return {
    url: '/placeholder.svg',
    prompt: '',
    isGenerated: false,
    isCached: false,
    timestamp: Date.now(),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============================================================================
// REACT HOOK SUPPORT
// ============================================================================

/**
 * State for tracking image loading
 */
export interface ImageLoadingState {
  isLoading: boolean;
  error: string | null;
  image: GeneratedImage | null;
}

/**
 * Create initial loading state
 */
export function createImageLoadingState(): ImageLoadingState {
  return {
    isLoading: false,
    error: null,
    image: null,
  };
}
