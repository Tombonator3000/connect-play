/**
 * React hook for Text-to-Speech functionality
 *
 * Provides easy integration with the TTS service for game components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ttsService,
  TTSConfig,
  TTSStatus,
  TTSVoice,
  DEFAULT_TTS_CONFIG,
} from '../services/ttsService';

// ============================================================================
// TYPES
// ============================================================================

export interface UseTTSResult {
  // Status
  status: TTSStatus;
  config: TTSConfig;
  isSpeaking: boolean;

  // Actions
  speak: (text: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;

  // Configuration
  updateConfig: (config: Partial<TTSConfig>) => void;
  reconnectServer: () => Promise<boolean>;

  // Voice management
  voices: TTSVoice[];
  refreshVoices: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useTTS(): UseTTSResult {
  const [status, setStatus] = useState<TTSStatus>(ttsService.getStatus());
  const [config, setConfig] = useState<TTSConfig>(ttsService.getConfig());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);

  const speakingCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = ttsService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  // Load voices on mount
  useEffect(() => {
    refreshVoices();
  }, [status.isAvailable]);

  // Check speaking status periodically
  useEffect(() => {
    speakingCheckInterval.current = setInterval(() => {
      setIsSpeaking(ttsService.isSpeaking());
    }, 100);

    return () => {
      if (speakingCheckInterval.current) {
        clearInterval(speakingCheckInterval.current);
      }
    };
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!config.enabled) return;
    setIsSpeaking(true);
    try {
      await ttsService.speak(text);
    } finally {
      setIsSpeaking(false);
    }
  }, [config.enabled]);

  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    ttsService.pause();
  }, []);

  const resume = useCallback(() => {
    ttsService.resume();
  }, []);

  const updateConfig = useCallback((newConfig: Partial<TTSConfig>) => {
    ttsService.updateConfig(newConfig);
    setConfig(ttsService.getConfig());
  }, []);

  const reconnectServer = useCallback(async (): Promise<boolean> => {
    return ttsService.reconnectQwenServer();
  }, []);

  const refreshVoices = useCallback(async () => {
    const availableVoices = await ttsService.getAvailableVoices();
    setVoices(availableVoices);
  }, []);

  return {
    status,
    config,
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    updateConfig,
    reconnectServer,
    voices,
    refreshVoices,
  };
}

export default useTTS;
