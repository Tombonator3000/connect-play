/**
 * AUDIO MANAGER
 * Handles all game audio using Tone.js
 * Includes SFX, ambient sounds, and atmospheric music
 *
 * SUPPORTS: OGG (preferred) and MP3 (fallback) audio formats
 */

import * as Tone from 'tone';

// ============================================================================
// AUDIO FORMAT DETECTION
// ============================================================================

/**
 * Detect which audio formats the browser supports
 */
function detectAudioSupport(): { ogg: boolean; mp3: boolean } {
  const audio = document.createElement('audio');
  return {
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"') !== '',
    mp3: audio.canPlayType('audio/mpeg') !== ''
  };
}

// Cache the format support detection
const AUDIO_SUPPORT = detectAudioSupport();

/**
 * Get the preferred audio format based on browser support
 * OGG is preferred (smaller files, better quality), with MP3 as fallback
 */
export function getPreferredAudioFormat(): 'ogg' | 'mp3' {
  if (AUDIO_SUPPORT.ogg) return 'ogg';
  if (AUDIO_SUPPORT.mp3) return 'mp3';
  return 'mp3'; // Default fallback
}

/**
 * Get the audio file path with appropriate format
 * Will try OGG first, then MP3, based on browser support
 */
export function getAudioFilePath(basePath: string): string {
  const format = getPreferredAudioFormat();
  return `${basePath}.${format}`;
}

// ============================================================================
// AUDIO SYSTEM STATE
// ============================================================================

interface AudioSettings {
  masterVolume: number;  // 0-1
  musicVolume: number;   // 0-1
  sfxVolume: number;     // 0-1
  muted: boolean;
  useFileSFX: boolean;   // Whether to use file-based SFX (true) or synth (false)
}

interface AudioState {
  initialized: boolean;
  settings: AudioSettings;
  currentAmbience: string | null;
  ambienceLoop: Tone.Player | null;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
  useFileSFX: true  // Use file-based SFX by default when available
};

let audioState: AudioState = {
  initialized: false,
  settings: DEFAULT_SETTINGS,
  currentAmbience: null,
  ambienceLoop: null
};

// ============================================================================
// SYNTHESIZERS FOR GENERATED SOUNDS
// ============================================================================

// Main synthesizer for UI and action sounds
let mainSynth: Tone.PolySynth | null = null;

// Noise generator for atmospheric effects
let noiseSynth: Tone.NoiseSynth | null = null;

// Membrane synth for deep bass/impact sounds
let membraneSynth: Tone.MembraneSynth | null = null;

// Metal synth for eerie metallic sounds
let metalSynth: Tone.MetalSynth | null = null;

// FM Synth for horror effects
let fmSynth: Tone.FMSynth | null = null;

// Effects chain
let reverb: Tone.Reverb | null = null;
let delay: Tone.FeedbackDelay | null = null;
let filter: Tone.Filter | null = null;

// ============================================================================
// SOUND EFFECT TYPES
// ============================================================================

export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'damage'
  | 'death'
  | 'footstep'
  | 'doorOpen'
  | 'diceRoll'
  | 'attack'
  | 'spellCast'
  | 'pickup'
  | 'sanityLoss'
  | 'horrorCheck'
  | 'enemySpawn'
  | 'doomTick'
  | 'eventCard'
  | 'victory'
  | 'defeat'
  | 'whispers'
  | 'heartbeat'
  | 'cosmicStatic';

// ============================================================================
// FILE-BASED SFX SYSTEM (OGG/MP3)
// ============================================================================

/**
 * SFX file paths mapping (without extension - format is added dynamically)
 * Base path is relative to public folder
 */
const SFX_FILE_PATHS: Partial<Record<SoundEffect, string>> = {
  // UI sounds
  click: '/audio/sfx/ui/click',
  success: '/audio/sfx/ui/success',
  error: '/audio/sfx/ui/error',

  // Combat sounds
  attack: '/audio/sfx/combat/hit-flesh',
  damage: '/audio/sfx/combat/player-hurt',
  death: '/audio/sfx/combat/player-death',
  diceRoll: '/audio/sfx/combat/dice-roll',

  // Movement sounds
  footstep: '/audio/sfx/movement/step-wood',

  // Door sounds
  doorOpen: '/audio/sfx/doors/door-open',

  // Item sounds
  pickup: '/audio/sfx/items/pickup-generic',

  // Magic sounds
  spellCast: '/audio/sfx/magic/spell-cast',

  // Atmosphere sounds
  sanityLoss: '/audio/sfx/atmosphere/sanity-loss',
  horrorCheck: '/audio/sfx/atmosphere/horror-sting',
  whispers: '/audio/sfx/atmosphere/whispers',
  heartbeat: '/audio/sfx/atmosphere/heartbeat',
  cosmicStatic: '/audio/sfx/atmosphere/static-cosmic',

  // Monster sounds
  enemySpawn: '/audio/sfx/monsters/cultist-spawn',

  // Event sounds
  doomTick: '/audio/sfx/events/doom-tick',
  eventCard: '/audio/sfx/events/event-card-draw',
  victory: '/audio/sfx/events/scenario-victory',
  defeat: '/audio/sfx/events/scenario-defeat',
};

// Cache for loaded SFX players
const sfxPlayerCache: Map<string, Tone.Player> = new Map();

// Track which files failed to load (to avoid repeated attempts)
const failedSfxPaths: Set<string> = new Set();

/**
 * Load an SFX file and cache it
 * Tries OGG first, falls back to MP3
 */
async function loadSfxFile(basePath: string): Promise<Tone.Player | null> {
  // Check if already cached
  const cachedPlayer = sfxPlayerCache.get(basePath);
  if (cachedPlayer) {
    return cachedPlayer;
  }

  // Check if we already tried and failed
  if (failedSfxPaths.has(basePath)) {
    return null;
  }

  // Build the base URL with Vite base path
  const baseUrl = import.meta.env.BASE_URL || '/';
  const formats: ('ogg' | 'mp3')[] = AUDIO_SUPPORT.ogg
    ? ['ogg', 'mp3']
    : ['mp3', 'ogg'];

  for (const format of formats) {
    const fullPath = `${baseUrl}${basePath.startsWith('/') ? basePath.slice(1) : basePath}.${format}`;

    try {
      const player = new Tone.Player(fullPath).toDestination();
      await player.load(fullPath);

      // Cache successful load
      sfxPlayerCache.set(basePath, player);
      console.log(`Loaded SFX: ${fullPath}`);
      return player;
    } catch (e) {
      // Try next format
      console.debug(`SFX not found: ${fullPath}, trying next format...`);
    }
  }

  // All formats failed
  failedSfxPaths.add(basePath);
  console.warn(`Failed to load SFX: ${basePath} (tried both OGG and MP3)`);
  return null;
}

/**
 * Play an SFX from file if available
 * Returns true if file was played, false if not (fallback to synth)
 */
async function playFileSfx(effect: SoundEffect): Promise<boolean> {
  if (!audioState.settings.useFileSFX) {
    return false;
  }

  const basePath = SFX_FILE_PATHS[effect];
  if (!basePath) {
    return false;
  }

  const player = await loadSfxFile(basePath);
  if (!player) {
    return false;
  }

  try {
    // Apply volume
    const { masterVolume, sfxVolume, muted } = audioState.settings;
    if (muted) return true; // Muted but file exists

    const effectiveVolume = masterVolume * sfxVolume;
    player.volume.value = Tone.gainToDb(effectiveVolume);

    // Play from start
    player.start(undefined, 0);
    return true;
  } catch (e) {
    console.warn(`Error playing SFX ${effect}:`, e);
    return false;
  }
}

/**
 * Pre-load common SFX files for faster playback
 */
export async function preloadCommonSfx(): Promise<void> {
  if (!audioState.initialized) return;

  const commonEffects: SoundEffect[] = [
    'click', 'success', 'error', 'footstep', 'doorOpen',
    'attack', 'damage', 'pickup', 'diceRoll'
  ];

  await Promise.all(
    commonEffects
      .filter(effect => SFX_FILE_PATHS[effect])
      .map(effect => loadSfxFile(SFX_FILE_PATHS[effect]!))
  );
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the audio system
 * Must be called after user interaction due to browser autoplay policies
 */
export async function initializeAudio(): Promise<boolean> {
  if (audioState.initialized) return true;

  try {
    // Start Tone.js context
    await Tone.start();

    // Create effects chain
    reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.3
    }).toDestination();

    delay = new Tone.FeedbackDelay({
      delayTime: 0.25,
      feedback: 0.3,
      wet: 0.2
    }).connect(reverb);

    filter = new Tone.Filter({
      frequency: 2000,
      type: 'lowpass'
    }).connect(delay);

    // Create synthesizers
    mainSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.4
      }
    }).connect(filter);

    noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: {
        attack: 0.5,
        decay: 1,
        sustain: 0.5,
        release: 2
      }
    }).connect(reverb);

    membraneSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      }
    }).connect(reverb);

    metalSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.2
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(filter);

    fmSynth = new Tone.FMSynth({
      harmonicity: 8,
      modulationIndex: 50,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 1
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5
      }
    }).connect(reverb);

    audioState.initialized = true;
    applyVolumeSettings();

    console.log('Audio system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
}

// ============================================================================
// VOLUME CONTROL
// ============================================================================

/**
 * Update audio settings
 */
export function updateAudioSettings(settings: Partial<AudioSettings>): void {
  audioState.settings = { ...audioState.settings, ...settings };
  applyVolumeSettings();
}

/**
 * Apply current volume settings to all audio sources
 */
function applyVolumeSettings(): void {
  const { masterVolume, sfxVolume, musicVolume, muted } = audioState.settings;
  const effectiveVolume = muted ? 0 : masterVolume * sfxVolume;
  const effectiveMusicVolume = muted ? 0 : masterVolume * musicVolume;

  if (mainSynth) {
    mainSynth.volume.value = Tone.gainToDb(effectiveVolume);
  }
  if (noiseSynth) {
    noiseSynth.volume.value = Tone.gainToDb(effectiveVolume * 0.5);
  }
  if (membraneSynth) {
    membraneSynth.volume.value = Tone.gainToDb(effectiveVolume * 0.8);
  }
  if (metalSynth) {
    metalSynth.volume.value = Tone.gainToDb(effectiveVolume * 0.3);
  }
  if (fmSynth) {
    fmSynth.volume.value = Tone.gainToDb(effectiveVolume * 0.4);
  }

  // Update background music volume
  if (backgroundMusicPlayer) {
    backgroundMusicPlayer.volume.value = Tone.gainToDb(effectiveMusicVolume);

    // Handle mute/unmute for background music
    if (muted && backgroundMusicPlayer.state === 'started') {
      backgroundMusicPlayer.stop();
    } else if (!muted && backgroundMusicLoaded && backgroundMusicPlayer.state !== 'started' && audioState.currentAmbience) {
      backgroundMusicPlayer.start();
    }
  }
}

/**
 * Mute/unmute all audio
 */
export function setMuted(muted: boolean): void {
  updateAudioSettings({ muted });
}

/**
 * Get current audio state
 */
export function getAudioState(): AudioState {
  return { ...audioState };
}

// ============================================================================
// SOUND EFFECT PLAYERS
// ============================================================================

/**
 * Play a UI click sound
 */
export function playClick(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    mainSynth?.triggerAttackRelease('C5', '32n', undefined, 0.3);
  } catch (e) {
    console.warn('Audio playClick failed:', e);
  }
}

/**
 * Play a success/positive sound
 */
export function playSuccess(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    mainSynth?.triggerAttackRelease('C4', '16n', now, 0.4);
    mainSynth?.triggerAttackRelease('E4', '16n', now + 0.05, 0.4);
    mainSynth?.triggerAttackRelease('G4', '16n', now + 0.1, 0.4);
    mainSynth?.triggerAttackRelease('C5', '8n', now + 0.15, 0.5);
  } catch (e) {
    console.warn('Audio playSuccess failed:', e);
  }
}

/**
 * Play an error/failure sound
 */
export function playError(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    mainSynth?.triggerAttackRelease('C3', '8n', now, 0.5);
    mainSynth?.triggerAttackRelease('B2', '8n', now + 0.15, 0.5);
  } catch (e) {
    console.warn('Audio playError failed:', e);
  }
}

/**
 * Play a damage/hit sound
 */
export function playDamage(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    membraneSynth?.triggerAttackRelease('C1', '8n', undefined, 0.7);
    noiseSynth?.triggerAttackRelease('16n', undefined, 0.3);
  } catch (e) {
    console.warn('Audio playDamage failed:', e);
  }
}

/**
 * Play a death/defeat sound
 */
export function playDeath(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    membraneSynth?.triggerAttackRelease('G1', '2n', now, 0.8);
    fmSynth?.triggerAttackRelease('C2', '2n', now + 0.5, 0.4);
  } catch (e) {
    console.warn('Audio playDeath failed:', e);
  }
}

/**
 * Play a footstep sound
 */
export function playFootstep(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const pitch = Math.random() > 0.5 ? 'E2' : 'F2';
    membraneSynth?.triggerAttackRelease(pitch, '32n', undefined, 0.2);
  } catch (e) {
    console.warn('Audio playFootstep failed:', e);
  }
}

/**
 * Play a door opening sound
 */
export function playDoorOpen(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    noiseSynth?.triggerAttackRelease('4n', now, 0.2);
    metalSynth?.triggerAttackRelease('C3', '8n', now + 0.1, 0.3);
  } catch (e) {
    console.warn('Audio playDoorOpen failed:', e);
  }
}

/**
 * Play a dice roll sound
 */
export function playDiceRoll(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    for (let i = 0; i < 5; i++) {
      const pitch = ['C4', 'D4', 'E4', 'F4', 'G4'][Math.floor(Math.random() * 5)];
      mainSynth?.triggerAttackRelease(pitch, '64n', now + i * 0.05, 0.2);
    }
  } catch (e) {
    console.warn('Audio playDiceRoll failed:', e);
  }
}

/**
 * Play an attack/combat sound
 */
export function playAttack(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    noiseSynth?.triggerAttackRelease('16n', now, 0.4);
    membraneSynth?.triggerAttackRelease('G2', '16n', now, 0.5);
  } catch (e) {
    console.warn('Audio playAttack failed:', e);
  }
}

/**
 * Play a spell cast sound
 */
export function playSpellCast(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    fmSynth?.triggerAttackRelease('C3', '4n', now, 0.5);
    mainSynth?.triggerAttackRelease(['E4', 'G4', 'B4'], '8n', now + 0.2, 0.3);
  } catch (e) {
    console.warn('Audio playSpellCast failed:', e);
  }
}

/**
 * Play a pickup item sound
 */
export function playPickup(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    mainSynth?.triggerAttackRelease('G4', '16n', now, 0.4);
    mainSynth?.triggerAttackRelease('C5', '8n', now + 0.08, 0.4);
  } catch (e) {
    console.warn('Audio playPickup failed:', e);
  }
}

// ============================================================================
// HORROR / ATMOSPHERE SOUNDS
// ============================================================================

/**
 * Play a sanity loss sound
 */
export function playSanityLoss(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    fmSynth?.triggerAttackRelease('C2', '2n', now, 0.4);
    // Add whisper-like noise
    if (noiseSynth) {
      const originalType = noiseSynth.noise.type;
      noiseSynth.noise.type = 'white';
      noiseSynth.triggerAttackRelease('1n', now + 0.3, 0.15);
      setTimeout(() => {
        if (noiseSynth) noiseSynth.noise.type = originalType;
      }, 2000);
    }
  } catch (e) {
    console.warn('Audio playSanityLoss failed:', e);
  }
}

/**
 * Play a horror check sound
 */
export function playHorrorCheck(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    // Dissonant chord for horror
    mainSynth?.triggerAttackRelease(['C3', 'Db3', 'Gb3'], '2n', now, 0.5);
    membraneSynth?.triggerAttackRelease('C1', '4n', now + 0.5, 0.6);
  } catch (e) {
    console.warn('Audio playHorrorCheck failed:', e);
  }
}

/**
 * Play an enemy spawn sound
 */
export function playEnemySpawn(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    membraneSynth?.triggerAttackRelease('E1', '4n', now, 0.7);
    metalSynth?.triggerAttackRelease('C2', '8n', now + 0.2, 0.4);
    fmSynth?.triggerAttackRelease('G1', '4n', now + 0.1, 0.3);
  } catch (e) {
    console.warn('Audio playEnemySpawn failed:', e);
  }
}

/**
 * Play a doom tick sound
 */
export function playDoomTick(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    membraneSynth?.triggerAttackRelease('A1', '8n', now, 0.5);
    metalSynth?.triggerAttackRelease('E1', '16n', now + 0.1, 0.2);
  } catch (e) {
    console.warn('Audio playDoomTick failed:', e);
  }
}

/**
 * Play an event card draw sound
 */
export function playEventCard(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    // Mysterious chord
    mainSynth?.triggerAttackRelease(['E3', 'G#3', 'B3'], '4n', now, 0.4);
    noiseSynth?.triggerAttackRelease('8n', now + 0.2, 0.1);
  } catch (e) {
    console.warn('Audio playEventCard failed:', e);
  }
}

/**
 * Play a victory fanfare
 */
export function playVictory(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    mainSynth?.triggerAttackRelease('C4', '8n', now, 0.5);
    mainSynth?.triggerAttackRelease('E4', '8n', now + 0.15, 0.5);
    mainSynth?.triggerAttackRelease('G4', '8n', now + 0.3, 0.5);
    mainSynth?.triggerAttackRelease('C5', '4n', now + 0.45, 0.6);
    mainSynth?.triggerAttackRelease(['E5', 'G5'], '4n', now + 0.6, 0.5);
  } catch (e) {
    console.warn('Audio playVictory failed:', e);
  }
}

/**
 * Play a defeat sound
 */
export function playDefeat(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    membraneSynth?.triggerAttackRelease('C1', '2n', now, 0.8);
    fmSynth?.triggerAttackRelease('C2', '2n', now + 0.3, 0.5);
    mainSynth?.triggerAttackRelease(['C3', 'Eb3', 'Gb3'], '1n', now + 0.6, 0.4);
  } catch (e) {
    console.warn('Audio playDefeat failed:', e);
  }
}

// ============================================================================
// AMBIENT SOUNDS (Based on madness/weather)
// ============================================================================

/**
 * Play whisper sounds for hallucination madness
 */
export function playWhispers(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    if (noiseSynth) {
      const originalType = noiseSynth.noise.type;
      noiseSynth.noise.type = 'white';
      noiseSynth.triggerAttackRelease('2n', now, 0.08);
      setTimeout(() => {
        if (noiseSynth) noiseSynth.noise.type = originalType;
      }, 3000);
    }
    // Add subtle eerie tones
    mainSynth?.triggerAttackRelease('B5', '4n', now + 0.5, 0.05);
    mainSynth?.triggerAttackRelease('F5', '4n', now + 1, 0.05);
  } catch (e) {
    console.warn('Audio playWhispers failed:', e);
  }
}

/**
 * Play heartbeat for paranoia madness
 */
export function playHeartbeat(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    membraneSynth?.triggerAttackRelease('G1', '8n', now, 0.4);
    membraneSynth?.triggerAttackRelease('G1', '16n', now + 0.15, 0.3);
  } catch (e) {
    console.warn('Audio playHeartbeat failed:', e);
  }
}

/**
 * Play cosmic static for cosmic_static weather
 */
export function playCosmicStatic(): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  try {
    const now = Tone.now();
    if (noiseSynth) {
      const originalType = noiseSynth.noise.type;
      noiseSynth.noise.type = 'pink';
      noiseSynth.triggerAttackRelease('4n', now, 0.1);
      setTimeout(() => {
        if (noiseSynth) noiseSynth.noise.type = originalType;
      }, 1500);
    }
    fmSynth?.triggerAttackRelease('C1', '4n', now + 0.2, 0.2);
  } catch (e) {
    console.warn('Audio playCosmicStatic failed:', e);
  }
}

// ============================================================================
// BACKGROUND MUSIC
// ============================================================================

// Background music player instance
let backgroundMusicPlayer: Tone.Player | null = null;
let backgroundMusicLoaded = false;

/**
 * Path to the background music file (without extension)
 * The system will try to load the available format
 */
const BACKGROUND_MUSIC_PATH = '/audio/music/horror-ambient';

/**
 * Start playing background music
 * Loops continuously until stopped
 */
export async function startBackgroundMusic(): Promise<boolean> {
  if (!audioState.initialized) {
    console.warn('Audio not initialized, cannot start background music');
    return false;
  }

  // If already playing, just ensure volume is correct
  if (backgroundMusicPlayer && backgroundMusicLoaded) {
    updateBackgroundMusicVolume();
    if (backgroundMusicPlayer.state !== 'started') {
      backgroundMusicPlayer.start();
    }
    return true;
  }

  // Build the base URL with Vite base path
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Try MP3 first (since we have horror-ambient.mp3), then OGG
  const formats: ('mp3' | 'ogg')[] = ['mp3', 'ogg'];

  for (const format of formats) {
    const fullPath = `${baseUrl}audio/music/horror-ambient.${format}`;

    try {
      console.log(`Trying to load background music: ${fullPath}`);

      // Create player with loop enabled
      backgroundMusicPlayer = new Tone.Player({
        url: fullPath,
        loop: true,
        autostart: false,
        fadeIn: 2, // 2 second fade in
        fadeOut: 2, // 2 second fade out
      }).toDestination();

      // Wait for the file to load
      await backgroundMusicPlayer.load(fullPath);
      backgroundMusicLoaded = true;

      // Apply volume settings
      updateBackgroundMusicVolume();

      // Start playback if not muted
      if (!audioState.settings.muted) {
        backgroundMusicPlayer.start();
      }

      console.log(`Background music loaded and started: ${fullPath}`);
      audioState.currentAmbience = 'horror-ambient';
      return true;
    } catch (e) {
      console.debug(`Background music not found: ${fullPath}, trying next format...`);
      if (backgroundMusicPlayer) {
        backgroundMusicPlayer.dispose();
        backgroundMusicPlayer = null;
      }
    }
  }

  console.warn('Failed to load background music (tried both MP3 and OGG)');
  return false;
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  if (backgroundMusicPlayer) {
    try {
      backgroundMusicPlayer.stop();
    } catch (e) {
      console.warn('Error stopping background music:', e);
    }
  }
  audioState.currentAmbience = null;
}

/**
 * Pause background music (can be resumed)
 */
export function pauseBackgroundMusic(): void {
  if (backgroundMusicPlayer && backgroundMusicPlayer.state === 'started') {
    try {
      backgroundMusicPlayer.stop();
    } catch (e) {
      console.warn('Error pausing background music:', e);
    }
  }
}

/**
 * Resume background music
 */
export function resumeBackgroundMusic(): void {
  if (backgroundMusicPlayer && backgroundMusicLoaded && !audioState.settings.muted) {
    try {
      if (backgroundMusicPlayer.state !== 'started') {
        backgroundMusicPlayer.start();
      }
    } catch (e) {
      console.warn('Error resuming background music:', e);
    }
  }
}

/**
 * Update background music volume based on current settings
 */
function updateBackgroundMusicVolume(): void {
  if (!backgroundMusicPlayer) return;

  const { masterVolume, musicVolume, muted } = audioState.settings;
  const effectiveVolume = muted ? 0 : masterVolume * musicVolume;

  // Convert to dB (Tone.js uses dB for volume)
  backgroundMusicPlayer.volume.value = Tone.gainToDb(effectiveVolume);
}

/**
 * Set the music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  updateAudioSettings({ musicVolume: clampedVolume });
  updateBackgroundMusicVolume();
}

/**
 * Check if background music is currently playing
 */
export function isBackgroundMusicPlaying(): boolean {
  return backgroundMusicPlayer?.state === 'started';
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Dispose of all audio resources
 */
export function disposeAudio(): void {
  try {
    // Dispose synths
    mainSynth?.dispose();
    noiseSynth?.dispose();
    membraneSynth?.dispose();
    metalSynth?.dispose();
    fmSynth?.dispose();
    reverb?.dispose();
    delay?.dispose();
    filter?.dispose();
    audioState.ambienceLoop?.dispose();

    // Dispose background music player
    if (backgroundMusicPlayer) {
      try {
        backgroundMusicPlayer.stop();
        backgroundMusicPlayer.dispose();
      } catch (e) {
        // Ignore disposal errors
      }
      backgroundMusicPlayer = null;
      backgroundMusicLoaded = false;
    }

    // Dispose file-based SFX players
    sfxPlayerCache.forEach(player => {
      try {
        player.dispose();
      } catch (e) {
        // Ignore disposal errors
      }
    });
    sfxPlayerCache.clear();
    failedSfxPaths.clear();

    mainSynth = null;
    noiseSynth = null;
    membraneSynth = null;
    metalSynth = null;
    fmSynth = null;
    reverb = null;
    delay = null;
    filter = null;

    audioState = {
      initialized: false,
      settings: DEFAULT_SETTINGS,
      currentAmbience: null,
      ambienceLoop: null
    };

    console.log('Audio disposed');
  } catch (e) {
    console.warn('Error disposing audio:', e);
  }
}

/**
 * Play a sound effect by name
 * Tries file-based SFX first (OGG/MP3), falls back to synth if not available
 */
export function playSound(effect: SoundEffect): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  // Synth fallback functions
  const synthFallback: Record<SoundEffect, () => void> = {
    click: playClick,
    success: playSuccess,
    error: playError,
    damage: playDamage,
    death: playDeath,
    footstep: playFootstep,
    doorOpen: playDoorOpen,
    diceRoll: playDiceRoll,
    attack: playAttack,
    spellCast: playSpellCast,
    pickup: playPickup,
    sanityLoss: playSanityLoss,
    horrorCheck: playHorrorCheck,
    enemySpawn: playEnemySpawn,
    doomTick: playDoomTick,
    eventCard: playEventCard,
    victory: playVictory,
    defeat: playDefeat,
    whispers: playWhispers,
    heartbeat: playHeartbeat,
    cosmicStatic: playCosmicStatic
  };

  // Try file-based SFX first, fall back to synth
  playFileSfx(effect).then(played => {
    if (!played) {
      // No file available, use synth
      synthFallback[effect]?.();
    }
  });
}

/**
 * Play a sound effect synchronously using synth only (no file loading)
 * Use this when you need immediate playback without file lookup
 */
export function playSoundSynth(effect: SoundEffect): void {
  if (!audioState.initialized || audioState.settings.muted) return;

  const soundMap: Record<SoundEffect, () => void> = {
    click: playClick,
    success: playSuccess,
    error: playError,
    damage: playDamage,
    death: playDeath,
    footstep: playFootstep,
    doorOpen: playDoorOpen,
    diceRoll: playDiceRoll,
    attack: playAttack,
    spellCast: playSpellCast,
    pickup: playPickup,
    sanityLoss: playSanityLoss,
    horrorCheck: playHorrorCheck,
    enemySpawn: playEnemySpawn,
    doomTick: playDoomTick,
    eventCard: playEventCard,
    victory: playVictory,
    defeat: playDefeat,
    whispers: playWhispers,
    heartbeat: playHeartbeat,
    cosmicStatic: playCosmicStatic
  };

  soundMap[effect]?.();
}

/**
 * Toggle between file-based and synth SFX
 */
export function setUseFileSFX(useFiles: boolean): void {
  updateAudioSettings({ useFileSFX: useFiles });
}

/**
 * Check if file-based SFX is enabled
 */
export function isUsingFileSFX(): boolean {
  return audioState.settings.useFileSFX;
}

/**
 * Get audio format support info
 */
export function getAudioFormatSupport(): { ogg: boolean; mp3: boolean; preferred: string } {
  return {
    ...AUDIO_SUPPORT,
    preferred: getPreferredAudioFormat()
  };
}
