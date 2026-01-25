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

// Types for expanded GM system
export type GMNarrationType =
  | 'combat_start'
  | 'combat_victory'
  | 'combat_defeat'
  | 'player_hurt'
  | 'sanity_low'
  | 'sanity_lost'
  | 'doom_warning'
  | 'doom_critical'
  | 'discovery'
  | 'exploration'
  | 'enemy_spawn'
  | 'item_found'
  | 'objective_complete'
  | 'phase_change'
  | 'boss_encounter'
  | 'ambient';

export interface GMNarrationContext {
  type: GMNarrationType;
  player?: Player;
  enemy?: Enemy;
  tile?: Tile;
  item?: string;
  damage?: number;
  doomLevel?: number;
  sanityLevel?: number;
  objectiveText?: string;
  weather?: WeatherType;
  additionalContext?: string;
}

export interface GMNarrationResult {
  text: string;
  type: GMNarrationType;
  isAIGenerated: boolean;
  timestamp: number;
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

  // Expanded GM prompts for different situations
  gmNarration: {
    system: `You are the sinister Game Master for "Mythos Quest", a 1920s Lovecraftian horror board game.
Your role is to provide atmospheric, foreboding narration that enhances the cosmic horror experience.
Guidelines:
- Keep responses to 1-2 short sentences
- Use evocative, period-appropriate language (1920s)
- Build dread without explicit gore
- Reference Lovecraftian themes: cosmic insignificance, forbidden knowledge, ancient evils
- Use second person ("you") to address the player
- Never break character or mention game mechanics directly`,

    templates: {
      combat_start: (ctx: GMNarrationContext) =>
        `The investigator ${ctx.player?.name || 'you'} faces ${ctx.enemy?.name || 'an abomination'}. Generate a brief, tense combat opening narration.`,

      combat_victory: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} has defeated ${ctx.enemy?.name || 'the creature'}. Generate a brief victory narration that hints the horror is far from over.`,

      combat_defeat: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} took ${ctx.damage || 'significant'} damage from ${ctx.enemy?.name || 'the creature'}. Generate a brief narration about the painful blow.`,

      player_hurt: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} (${ctx.player?.hp || 0}/${ctx.player?.maxHp || 6} HP) has been wounded. Generate brief ominous commentary.`,

      sanity_low: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} has ${ctx.sanityLevel || 2} sanity remaining. Generate a brief narration about their fragmenting grip on reality.`,

      sanity_lost: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} just lost sanity. Current: ${ctx.sanityLevel || 0}. Generate a brief narration about witnessing something terrible.`,

      doom_warning: (ctx: GMNarrationContext) =>
        `Doom level: ${ctx.doomLevel || 6}/12. Generate a brief warning about the approaching cosmic catastrophe.`,

      doom_critical: (ctx: GMNarrationContext) =>
        `Doom level: ${ctx.doomLevel || 3}/12 - CRITICAL! Generate urgent, terrifying narration about imminent apocalypse.`,

      discovery: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} discovered: ${ctx.item || ctx.additionalContext || 'something important'}. Generate brief narration about the discovery.`,

      exploration: (ctx: GMNarrationContext) => {
        const tileDesc = ctx.tile?.description ? `Location atmosphere: "${ctx.tile.description}"` : '';
        return `${ctx.player?.name || 'The investigator'} enters ${ctx.tile?.name || 'a new area'}. ${ctx.tile?.category || 'Unknown type'}. ${tileDesc} Generate atmospheric entry narration that builds on the location's established mood.`;
      },

      enemy_spawn: (ctx: GMNarrationContext) =>
        `A ${ctx.enemy?.name || 'creature'} has appeared! Generate a terrifying introduction for this monster.`,

      item_found: (ctx: GMNarrationContext) =>
        `${ctx.player?.name || 'The investigator'} found ${ctx.item || 'an item'}. Generate brief narration about the discovery.`,

      objective_complete: (ctx: GMNarrationContext) =>
        `Objective completed: ${ctx.objectiveText || 'A task'}. Generate brief narration acknowledging progress while hinting at greater horrors ahead.`,

      phase_change: (ctx: GMNarrationContext) =>
        `The Mythos phase begins. Doom: ${ctx.doomLevel || 12}/12. Generate ominous narration about the darkness stirring.`,

      boss_encounter: (ctx: GMNarrationContext) =>
        `A powerful entity appears: ${ctx.enemy?.name || 'Unknown Horror'}. Generate an epic, terrifying boss introduction.`,

      ambient: (ctx: GMNarrationContext) => {
        const tileDesc = ctx.tile?.description ? `Location atmosphere: "${ctx.tile.description}"` : '';
        return `Location: ${ctx.tile?.name || 'Unknown'}. Weather: ${ctx.weather || 'still'}. Doom: ${ctx.doomLevel || 12}/12. ${tileDesc} Generate ambient atmospheric narration.`;
      },
    },
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
 * Generate contextual Game Master narration based on game events
 * This is the main entry point for the expanded GM system
 */
export async function generateGMNarration(
  context: GMNarrationContext
): Promise<GMNarrationResult> {
  const { type } = context;

  // Try AI generation first
  if (isAIEnabled()) {
    const templateFn = PROMPTS.gmNarration.templates[type];
    if (templateFn) {
      const prompt = templateFn(context);
      const text = await callClaudeAPI(prompt, PROMPTS.gmNarration.system);

      if (text) {
        return {
          text,
          type,
          isAIGenerated: true,
          timestamp: Date.now(),
        };
      }
    }
  }

  // Fallback to mock narration
  const mockText = getMockGMNarration(context);
  return {
    text: mockText,
    type,
    isAIGenerated: false,
    timestamp: Date.now(),
  };
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

// ============================================================================
// MOCK GM NARRATION (for development without API key)
// ============================================================================

const MOCK_GM_NARRATIONS: Record<GMNarrationType, string[]> = {
  combat_start: [
    "Steel yourself. The horror before you defies mortal comprehension.",
    "The creature turns its gaze upon you. This will not end quickly.",
    "Your weapon feels inadequate against such aberrant flesh.",
    "The air grows thick with malice as battle is joined.",
  ],
  combat_victory: [
    "The abomination falls, but victory feels hollow in this accursed place.",
    "It is done, yet the shadows seem to mock your triumph.",
    "One horror vanquished. How many more lurk in the darkness?",
    "The creature expires with a sound no earthly being should make.",
  ],
  combat_defeat: [
    "Pain lances through you. The creature's touch leaves more than wounds.",
    "You stagger back, blood mixing with something fouler.",
    "The blow connects, and for a moment, you glimpse the void.",
    "Agony. Pure and absolute. The thing knows where to strike.",
  ],
  player_hurt: [
    "Your wounds weep crimson. How much longer can you endure?",
    "The pain is a constant companion now, gnawing at your resolve.",
    "Blood loss clouds your vision. The shadows seem closer.",
    "Each breath brings fresh agony. The investigation exacts its toll.",
  ],
  sanity_low: [
    "Reality frays at the edges. What was that movement in your peripheral vision?",
    "The whispers grow louder. Are they coming from outside, or within?",
    "You catch yourself muttering in a language you don't recognize.",
    "The line between nightmare and waking blurs dangerously thin.",
  ],
  sanity_lost: [
    "Something cracks behind your eyes. A piece of your mind, perhaps.",
    "You understand now, just a little. The knowledge burns.",
    "The veil thins, and what lies beyond makes you wish for blindness.",
    "Your grip on reality loosens, finger by trembling finger.",
  ],
  doom_warning: [
    "The stars align wrongly. Time grows short.",
    "Can you feel it? The cosmic machinery grinding toward culmination.",
    "The ritual nears completion. The Old Ones stir in their slumber.",
    "Doom approaches on silent wings. Make haste, investigator.",
  ],
  doom_critical: [
    "The threshold approaches! The barriers between worlds grow thin as paper!",
    "It is almost too late! The Great Old Ones sense weakness!",
    "Reality itself screams in protest! Moments remain!",
    "The end is nigh! Æons of imprisonment end this night!",
  ],
  discovery: [
    "Knowledge has a price. You have begun to pay it.",
    "Another piece of the puzzle. Another step toward understanding... or madness.",
    "The clue reveals more questions than answers.",
    "What you've found may save you. Or damn you utterly.",
  ],
  exploration: [
    "You step into the unknown. The darkness welcomes you.",
    "A new chamber reveals itself. Its secrets are not freely given.",
    "The air here is different. Older. Hungrier.",
    "Another room in this labyrinth of horrors. Press on.",
  ],
  enemy_spawn: [
    "Something emerges from the shadows. It should not exist, yet here it writhes.",
    "A presence manifests. Your mind recoils from its wrongness.",
    "The darkness births another horror. Steel yourself.",
    "It arrives without sound, without warning. Only malice precedes it.",
  ],
  item_found: [
    "Your fingers close around something. Useful, perhaps. Or cursed.",
    "An artifact of questionable providence. Handle it carefully.",
    "Discovery amid the decay. May it serve you better than its last owner.",
    "You pocket the find. Every advantage matters in this nightmare.",
  ],
  objective_complete: [
    "Progress. Small victories in an ocean of cosmic indifference.",
    "One task complete. The greater horror remains.",
    "A step forward. But the destination may be worse than the journey.",
    "Well done, investigator. Now face what comes next.",
  ],
  phase_change: [
    "The Mythos phase begins. The cosmos turns its attention to this wretched corner of reality.",
    "Night deepens. In the spaces between stars, something ancient awakens.",
    "The ritual hour approaches. Even time itself seems to hesitate.",
    "Darkness stirs. The Old Ones dream of freedom.",
  ],
  boss_encounter: [
    "It rises before you - a monument to humanity's insignificance in the cosmic order.",
    "The master of this domain reveals itself. Pray your death is swift.",
    "Behold the avatar of entities beyond comprehension. Witness, and despair.",
    "The true horror emerges. All you've faced before was merely prelude.",
  ],
  ambient: [
    "The silence here is oppressive, broken only by sounds that have no source.",
    "Shadows dance at the edge of your lamplight, mocking your mortality.",
    "Something watches from the dark. It has always been watching.",
    "The building groans, as if bearing the weight of terrible secrets.",
  ],
};

/**
 * Get a mock GM narration for development
 */
export function getMockGMNarration(context: GMNarrationContext): string {
  const narrations = MOCK_GM_NARRATIONS[context.type] || MOCK_GM_NARRATIONS.ambient;
  return narrations[Math.floor(Math.random() * narrations.length)];
}
