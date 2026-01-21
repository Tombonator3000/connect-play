/**
 * AUDIO MANAGER
 * Handles all game audio using Tone.js
 * Includes SFX, ambient sounds, and atmospheric music
 */

import * as Tone from 'tone';

// ============================================================================
// AUDIO SYSTEM STATE
// ============================================================================

interface AudioSettings {
  masterVolume: number;  // 0-1
  musicVolume: number;   // 0-1
  sfxVolume: number;     // 0-1
  muted: boolean;
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
  muted: false
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
      frequency: 200,
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
  const { masterVolume, sfxVolume, muted } = audioState.settings;
  const effectiveVolume = muted ? 0 : masterVolume * sfxVolume;

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
// CLEANUP
// ============================================================================

/**
 * Dispose of all audio resources
 */
export function disposeAudio(): void {
  try {
    mainSynth?.dispose();
    noiseSynth?.dispose();
    membraneSynth?.dispose();
    metalSynth?.dispose();
    fmSynth?.dispose();
    reverb?.dispose();
    delay?.dispose();
    filter?.dispose();
    audioState.ambienceLoop?.dispose();

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

// ============================================================================
// EXPORT TYPE FOR SOUND EFFECTS
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

/**
 * Play a sound effect by name
 */
export function playSound(effect: SoundEffect): void {
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
