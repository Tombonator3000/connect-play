/**
 * React hook for fetching AI-generated descriptions
 *
 * Provides a simple interface for components to get AI descriptions
 * with automatic caching, loading states, and fallbacks.
 */

import { useState, useEffect, useCallback } from 'react';
import { Tile, WeatherType } from '../types';
import {
  generateRoomDescription,
  isAIEnabled,
  getMockDescription,
} from '../services/claudeService';
import { LOCATION_DESCRIPTIONS } from '../constants';

interface UseAIDescriptionResult {
  description: string | null;
  isLoading: boolean;
  isAIGenerated: boolean;
  refresh: () => void;
}

/**
 * Hook to get an AI-generated description for a tile
 *
 * Priorities:
 * 1. Tile's own description (if set)
 * 2. Hardcoded LOCATION_DESCRIPTIONS
 * 3. AI-generated description (if enabled)
 * 4. Mock description (if AI disabled)
 *
 * @param tile - The tile to describe
 * @param weather - Current weather condition
 * @param enabled - Whether to enable AI generation (default: true)
 */
export function useAIDescription(
  tile: Tile | null | undefined,
  weather?: WeatherType,
  enabled: boolean = true
): UseAIDescriptionResult {
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Check for existing description first
  const existingDescription = tile
    ? tile.description || LOCATION_DESCRIPTIONS[tile.name]
    : null;

  useEffect(() => {
    // Reset when tile changes
    setAiDescription(null);
    setIsLoading(false);
  }, [tile?.id]);

  useEffect(() => {
    if (!tile || !enabled) return;

    // If there's already a description, don't generate
    if (existingDescription) {
      return;
    }

    // Check if AI is enabled
    if (!isAIEnabled()) {
      // Use mock description in dev mode
      setAiDescription(getMockDescription(tile.category));
      return;
    }

    // Generate AI description
    let cancelled = false;
    setIsLoading(true);

    generateRoomDescription(tile, weather)
      .then(description => {
        if (!cancelled) {
          setAiDescription(description);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to mock on error
          setAiDescription(getMockDescription(tile.category));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tile?.id, weather, enabled, existingDescription, refreshCounter]);

  const refresh = useCallback(() => {
    setRefreshCounter(c => c + 1);
  }, []);

  // Determine final description and source
  const finalDescription = existingDescription || aiDescription;
  const isAIGenerated = !existingDescription && !!aiDescription;

  return {
    description: finalDescription,
    isLoading: isLoading && !finalDescription,
    isAIGenerated,
    refresh,
  };
}

/**
 * Simpler hook that just returns the description string
 * Good for components that don't need loading state
 */
export function useTileDescription(
  tile: Tile | null | undefined,
  weather?: WeatherType
): string | null {
  const { description } = useAIDescription(tile, weather);
  return description;
}

export default useAIDescription;
