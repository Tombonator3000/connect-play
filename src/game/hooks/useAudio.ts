/**
 * USE AUDIO HOOK
 * React hook for integrating audio system with game components
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  initializeAudio,
  updateAudioSettings,
  playSound,
  setMuted,
  getAudioState,
  disposeAudio,
  SoundEffect
} from '../utils/audioManager';

interface UseAudioOptions {
  autoInitialize?: boolean;
}

interface UseAudioReturn {
  isInitialized: boolean;
  play: (effect: SoundEffect) => void;
  initialize: () => Promise<boolean>;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

/**
 * Hook for using game audio system
 */
export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { autoInitialize = false } = options;
  const initializedRef = useRef(false);

  // Initialize audio on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize && !initializedRef.current) {
      initializeAudio().then(success => {
        initializedRef.current = success;
      });
    }

    // Cleanup on unmount
    return () => {
      // Don't dispose on unmount - audio should persist across component changes
    };
  }, [autoInitialize]);

  // Initialize audio (call after user interaction)
  const initialize = useCallback(async (): Promise<boolean> => {
    const success = await initializeAudio();
    initializedRef.current = success;
    return success;
  }, []);

  // Play a sound effect
  const play = useCallback((effect: SoundEffect): void => {
    playSound(effect);
  }, []);

  // Set master volume
  const setVolume = useCallback((volume: number): void => {
    updateAudioSettings({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }, []);

  // Set muted state
  const setMutedState = useCallback((muted: boolean): void => {
    setMuted(muted);
  }, []);

  return {
    isInitialized: getAudioState().initialized,
    play,
    initialize,
    setVolume,
    setMuted: setMutedState,
    isMuted: getAudioState().settings.muted
  };
}

/**
 * Simple hook for playing sounds without full control
 */
export function useSoundEffect(): (effect: SoundEffect) => void {
  return useCallback((effect: SoundEffect) => {
    playSound(effect);
  }, []);
}

/**
 * Hook for audio initialization on first user interaction
 */
export function useAudioInitializer(): {
  needsInit: boolean;
  initOnInteraction: () => Promise<void>;
} {
  const needsInit = !getAudioState().initialized;

  const initOnInteraction = useCallback(async (): Promise<void> => {
    if (!getAudioState().initialized) {
      await initializeAudio();
    }
  }, []);

  return { needsInit, initOnInteraction };
}

export default useAudio;
