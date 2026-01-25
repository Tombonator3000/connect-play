/**
 * Claude AI Service for Mythos Quest
 *
 * Provides AI-generated content for the game including:
 * - Dynamic room descriptions
 * - Game Master narration (future)
 * - Adaptive hints (future)
 *
 * Uses localStorage for caching to minimize API calls.
 */

import { Tile, WeatherType, GameState, Player, Enemy } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API Configuration - Use environment variables or fallback
  apiUrl: import.meta.env.VITE_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',

  // Feature flags
  enableAI: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',

  // Model settings - Haiku is fast and cheap for short generations
  model: 'claude-3-haiku-20240307',
  maxTokens: 150,

  // Cache settings
  cachePrefix: 'mythos_ai_',
  cacheExpiryDays: 7,

  // Rate limiting
  minRequestInterval: 1000, // Minimum ms between requests
};

let lastRequestTime = 0;

// ============================================================================
// TYPES
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface GenerationContext {
  tileName: string;
  tileCategory?: string;
  tileType: string;
  floorType: string;
  features: string[];
  weather?: WeatherType;
  isDarkRoom?: boolean;
  hasEnemies?: boolean;
}

interface DMContext {
  lastAction: string;
  currentTile: Tile;
  player: Player;
  nearbyEnemies: Enemy[];
  doomLevel: number;
  weather?: WeatherType;
  recentEvents: string[];
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

const CACHE_VERSION = '1.0.0';

function getCacheKey(type: string, identifier: string): string {
  return `${CONFIG.cachePrefix}${type}_${identifier}`;
}

function hashContext(context: GenerationContext): string {
  const str = JSON.stringify({
    name: context.tileName,
    cat: context.tileCategory,
    floor: context.floorType,
    features: context.features.sort(),
    dark: context.isDarkRoom,
  });
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function getFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

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

    return entry.data;
  } catch {
    return null;
  }
}

function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // localStorage might be full - try clearing old entries
    clearOldCacheEntries();
  }
}

function clearOldCacheEntries(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONFIG.cachePrefix)) {
      keysToRemove.push(key);
    }
  }

  // Remove oldest entries (keep newest 100)
  if (keysToRemove.length > 100) {
    keysToRemove.slice(0, keysToRemove.length - 100).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// ============================================================================
// API UTILITIES
// ============================================================================

async function callClaudeAPI(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!CONFIG.enableAI || !CONFIG.apiKey) {
    console.log('[ClaudeService] AI features disabled or no API key');
    return null;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < CONFIG.minRequestInterval) {
    await new Promise(resolve => setTimeout(resolve, CONFIG.minRequestInterval - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('[ClaudeService] API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('[ClaudeService] Request failed:', error);
    return null;
  }
}

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const PROMPTS = {
  roomDescription: {
    system: `You are a narrator for a 1920s Lovecraftian horror board game called "Mythos Quest".
Write atmospheric, evocative descriptions that create dread and mystery without explicit gore or violence.
Your descriptions should feel like they belong in H.P. Lovecraft's world - hint at cosmic horrors, ancient secrets, and the fragility of human sanity.
Keep descriptions to 1-2 sentences. Use sensory details. Never break character.`,

    user: (ctx: GenerationContext) => {
      const features = ctx.features.length > 0 ? `Notable features: ${ctx.features.join(', ')}.` : '';
      const weather = ctx.weather ? `Current weather: ${ctx.weather}.` : '';
      const dark = ctx.isDarkRoom ? 'The room is shrouded in unnatural darkness.' : '';

      return `Write a brief atmospheric description for entering this location:
Location: ${ctx.tileName}
Type: ${ctx.tileCategory || ctx.tileType}
Floor: ${ctx.floorType}
${features}
${weather}
${dark}

Respond with ONLY the description, no labels or formatting.`;
    },
  },

  dmNarration: {
    system: `You are the Game Master for a 1920s Lovecraftian horror board game.
Provide brief, atmospheric commentary on game events. Build tension, hint at dangers, acknowledge player actions.
Keep responses to 1 sentence. Be ominous but not overwhelming. Use second person ("you").`,

    user: (ctx: DMContext) => `Current situation:
- Location: ${ctx.currentTile.name}
- Player: ${ctx.player.name} (HP: ${ctx.player.hp}/${ctx.player.maxHp}, Sanity: ${ctx.player.sanity}/${ctx.player.maxSanity})
- Nearby enemies: ${ctx.nearbyEnemies.length > 0 ? ctx.nearbyEnemies.map(e => e.name).join(', ') : 'None visible'}
- Doom level: ${ctx.doomLevel}/12
- Last action: ${ctx.lastAction}
${ctx.weather ? `- Weather: ${ctx.weather}` : ''}

Provide a brief Game Master comment on this situation.`,
  },
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate a dynamic room description for a tile
 * Returns cached version if available, otherwise generates new
 */
export async function generateRoomDescription(
  tile: Tile,
  weather?: WeatherType,
  hasEnemies?: boolean
): Promise<string | null> {
  // Build context
  const context: GenerationContext = {
    tileName: tile.name,
    tileCategory: tile.category,
    tileType: tile.type,
    floorType: tile.floorType,
    features: extractTileFeatures(tile),
    weather,
    isDarkRoom: tile.isDarkRoom && !tile.darkRoomIlluminated,
    hasEnemies,
  };

  // Check cache
  const cacheKey = getCacheKey('room', hashContext(context));
  const cached = getFromCache<string>(cacheKey);
  if (cached) {
    console.log('[ClaudeService] Room description from cache:', tile.name);
    return cached;
  }

  // Generate new
  console.log('[ClaudeService] Generating room description for:', tile.name);
  const description = await callClaudeAPI(
    PROMPTS.roomDescription.user(context),
    PROMPTS.roomDescription.system
  );

  if (description) {
    saveToCache(cacheKey, description);
  }

  return description;
}

/**
 * Generate Game Master narration for current game state
 * Used sparingly for important moments
 */
export async function generateDMNarration(
  state: GameState,
  lastAction: string,
  recentEvents: string[] = []
): Promise<string | null> {
  const activePlayer = state.players.find(p => !p.isDead);
  if (!activePlayer) return null;

  const currentTile = state.board.find(
    t => t.q === activePlayer.position.q && t.r === activePlayer.position.r
  );
  if (!currentTile) return null;

  const nearbyEnemies = state.enemies.filter(e => {
    const dist = Math.abs(e.position.q - activePlayer.position.q) +
                 Math.abs(e.position.r - activePlayer.position.r);
    return dist <= 2;
  });

  const context: DMContext = {
    lastAction,
    currentTile,
    player: activePlayer,
    nearbyEnemies,
    doomLevel: state.doom,
    weather: state.weatherState?.global?.type,
    recentEvents,
  };

  // DM narration is not cached (context-dependent)
  return callClaudeAPI(
    PROMPTS.dmNarration.user(context),
    PROMPTS.dmNarration.system
  );
}

/**
 * Check if AI features are enabled and configured
 */
export function isAIEnabled(): boolean {
  return CONFIG.enableAI && !!CONFIG.apiKey;
}

/**
 * Clear all cached AI content
 */
export function clearAICache(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CONFIG.cachePrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`[ClaudeService] Cleared ${keysToRemove.length} cached entries`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; sizeKB: number } {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractTileFeatures(tile: Tile): string[] {
  const features: string[] = [];

  if (tile.searchable && !tile.searched) {
    features.push('searchable area');
  }
  if (tile.object) {
    features.push(tile.object.type.replace('_', ' '));
  }
  if (tile.isDarkRoom && !tile.darkRoomIlluminated) {
    features.push('shrouded in darkness');
  }
  if (tile.hasWater) {
    features.push('water present');
  }
  if (tile.bloodstains && tile.bloodstains.count > 0) {
    features.push('signs of violence');
  }
  if (tile.localWeather) {
    features.push(`local ${tile.localWeather.type}`);
  }

  return features;
}

// ============================================================================
// MOCK MODE (for development without API key)
// ============================================================================

const MOCK_DESCRIPTIONS: Record<string, string[]> = {
  room: [
    "The air hangs heavy here, thick with the scent of mold and something older, fouler.",
    "Shadows seem to move of their own accord in the corners of this forsaken place.",
    "Something unseen watches from the darkness. You feel its ancient gaze upon your back.",
    "The silence here is oppressive, broken only by the faint drip of water from somewhere unseen.",
    "Dust motes dance in what little light filters through, each one a tiny ghost of the past.",
  ],
  corridor: [
    "The corridor stretches before you like the gullet of some vast, sleeping beast.",
    "Your footsteps echo strangely, as if the walls themselves are swallowing the sound.",
    "The passage narrows ahead, and the darkness grows thicker with each step.",
  ],
  basement: [
    "The cellar reeks of decay and damp earth. Something scuttles away from your light.",
    "Ancient stone walls press close, bearing the weight of generations of secrets.",
    "The temperature drops noticeably. Your breath mists before you in the stale air.",
  ],
  crypt: [
    "The dead do not rest easy here. You can feel them stirring in their ancient slumber.",
    "Symbols of protection line the walls, worn smooth by countless desperate hands.",
    "An altar stands at the center, its surface stained with the residue of unspeakable rites.",
  ],
};

/**
 * Get a mock description for development
 */
export function getMockDescription(category?: string): string {
  const cat = category?.toLowerCase() || 'room';
  const descriptions = MOCK_DESCRIPTIONS[cat] || MOCK_DESCRIPTIONS.room;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
