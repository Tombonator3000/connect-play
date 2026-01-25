/**
 * React hook for AI Game Master narration
 *
 * Provides intelligent game master commentary based on game events.
 * Manages a narration queue with priorities and cooldowns to avoid
 * overwhelming the player with messages.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Player, Enemy, Tile, WeatherType, GamePhase } from '../types';
import {
  generateGMNarration,
  GMNarrationType,
  GMNarrationContext,
  GMNarrationResult,
  isAIEnabled,
  getMockGMNarration,
} from '../services/claudeService';

// ============================================================================
// TYPES
// ============================================================================

export interface GMSettings {
  enabled: boolean;
  narrateExploration: boolean;
  narrateCombat: boolean;
  narrateSanity: boolean;
  narrateDoom: boolean;
  narrateDiscovery: boolean;
  narrateAmbient: boolean;
  cooldownMs: number; // Minimum time between narrations
  maxQueueSize: number;
}

export const DEFAULT_GM_SETTINGS: GMSettings = {
  enabled: true,
  narrateExploration: true,
  narrateCombat: true,
  narrateSanity: true,
  narrateDoom: true,
  narrateDiscovery: true,
  narrateAmbient: false, // Ambient is opt-in
  cooldownMs: 3000, // 3 seconds between narrations
  maxQueueSize: 5,
};

interface QueuedNarration {
  context: GMNarrationContext;
  priority: number; // Higher = more important
  timestamp: number;
}

export interface UseAIGameMasterResult {
  // Current narration state
  currentNarration: GMNarrationResult | null;
  isLoading: boolean;
  queueLength: number;

  // Trigger methods for different events
  triggerCombatStart: (player: Player, enemy: Enemy) => void;
  triggerCombatVictory: (player: Player, enemy: Enemy) => void;
  triggerCombatDamage: (player: Player, enemy: Enemy, damage: number) => void;
  triggerSanityLoss: (player: Player, sanityLost: number) => void;
  triggerDoomChange: (doomLevel: number) => void;
  triggerDiscovery: (player: Player, item: string) => void;
  triggerExploration: (player: Player, tile: Tile) => void;
  triggerEnemySpawn: (enemy: Enemy) => void;
  triggerObjectiveComplete: (objectiveText: string) => void;
  triggerPhaseChange: (phase: GamePhase, doomLevel: number) => void;
  triggerBossEncounter: (enemy: Enemy) => void;
  triggerAmbient: (tile: Tile, weather?: WeatherType, doomLevel?: number) => void;

  // Control methods
  dismissNarration: () => void;
  clearQueue: () => void;
  updateSettings: (settings: Partial<GMSettings>) => void;
  settings: GMSettings;
}

// Priority levels for different narration types
const NARRATION_PRIORITIES: Record<GMNarrationType, number> = {
  boss_encounter: 100,
  doom_critical: 95,
  combat_defeat: 90,
  sanity_lost: 85,
  combat_start: 80,
  combat_victory: 75,
  doom_warning: 70,
  sanity_low: 65,
  objective_complete: 60,
  discovery: 55,
  player_hurt: 50,
  enemy_spawn: 45,
  exploration: 40,
  item_found: 35,
  phase_change: 30,
  ambient: 10,
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAIGameMaster(): UseAIGameMasterResult {
  const [settings, setSettings] = useState<GMSettings>(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('mythos_gm_settings');
      if (saved) {
        return { ...DEFAULT_GM_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore errors
    }
    return DEFAULT_GM_SETTINGS;
  });

  const [currentNarration, setCurrentNarration] = useState<GMNarrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<QueuedNarration[]>([]);

  const lastNarrationTime = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  // Save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('mythos_gm_settings', JSON.stringify(settings));
    } catch {
      // Ignore errors
    }
  }, [settings]);

  // Process queue when it changes
  useEffect(() => {
    if (!settings.enabled || processingRef.current || queue.length === 0) {
      return;
    }

    const now = Date.now();
    const timeSinceLastNarration = now - lastNarrationTime.current;

    if (timeSinceLastNarration < settings.cooldownMs) {
      // Wait for cooldown
      const timeout = setTimeout(() => {
        processNextNarration();
      }, settings.cooldownMs - timeSinceLastNarration);
      return () => clearTimeout(timeout);
    }

    processNextNarration();
  }, [queue, settings.enabled, settings.cooldownMs]);

  const processNextNarration = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;

    processingRef.current = true;
    setIsLoading(true);

    // Get highest priority item
    const sortedQueue = [...queue].sort((a, b) => b.priority - a.priority);
    const nextItem = sortedQueue[0];

    // Remove from queue
    setQueue(prev => prev.filter(item => item !== nextItem));

    try {
      const result = await generateGMNarration(nextItem.context);
      setCurrentNarration(result);
      lastNarrationTime.current = Date.now();
    } catch (error) {
      console.error('[AIGameMaster] Narration generation failed:', error);
      // Use mock narration as fallback
      const mockText = getMockGMNarration(nextItem.context);
      setCurrentNarration({
        text: mockText,
        type: nextItem.context.type,
        isAIGenerated: false,
        timestamp: Date.now(),
      });
    }

    setIsLoading(false);
    processingRef.current = false;
  }, [queue]);

  const queueNarration = useCallback((context: GMNarrationContext) => {
    if (!settings.enabled) return;

    // Check if this type is enabled in settings
    const typeEnabled = isTypeEnabled(context.type, settings);
    if (!typeEnabled) return;

    const priority = NARRATION_PRIORITIES[context.type] || 0;

    setQueue(prev => {
      // Limit queue size
      if (prev.length >= settings.maxQueueSize) {
        // Remove lowest priority item
        const sorted = [...prev].sort((a, b) => a.priority - b.priority);
        return [...sorted.slice(1), { context, priority, timestamp: Date.now() }];
      }
      return [...prev, { context, priority, timestamp: Date.now() }];
    });
  }, [settings]);

  // ============================================================================
  // TRIGGER METHODS
  // ============================================================================

  const triggerCombatStart = useCallback((player: Player, enemy: Enemy) => {
    queueNarration({
      type: 'combat_start',
      player,
      enemy,
    });
  }, [queueNarration]);

  const triggerCombatVictory = useCallback((player: Player, enemy: Enemy) => {
    queueNarration({
      type: 'combat_victory',
      player,
      enemy,
    });
  }, [queueNarration]);

  const triggerCombatDamage = useCallback((player: Player, enemy: Enemy, damage: number) => {
    queueNarration({
      type: 'combat_defeat',
      player,
      enemy,
      damage,
    });
  }, [queueNarration]);

  const triggerSanityLoss = useCallback((player: Player, sanityLost: number) => {
    const sanityLevel = player.sanity;
    const type: GMNarrationType = sanityLevel <= 2 ? 'sanity_low' : 'sanity_lost';
    queueNarration({
      type,
      player,
      sanityLevel,
      additionalContext: `Lost ${sanityLost} sanity`,
    });
  }, [queueNarration]);

  const triggerDoomChange = useCallback((doomLevel: number) => {
    const type: GMNarrationType = doomLevel <= 3 ? 'doom_critical' : 'doom_warning';
    queueNarration({
      type,
      doomLevel,
    });
  }, [queueNarration]);

  const triggerDiscovery = useCallback((player: Player, item: string) => {
    queueNarration({
      type: 'discovery',
      player,
      item,
    });
  }, [queueNarration]);

  const triggerExploration = useCallback((player: Player, tile: Tile) => {
    queueNarration({
      type: 'exploration',
      player,
      tile,
    });
  }, [queueNarration]);

  const triggerEnemySpawn = useCallback((enemy: Enemy) => {
    queueNarration({
      type: 'enemy_spawn',
      enemy,
    });
  }, [queueNarration]);

  const triggerObjectiveComplete = useCallback((objectiveText: string) => {
    queueNarration({
      type: 'objective_complete',
      objectiveText,
    });
  }, [queueNarration]);

  const triggerPhaseChange = useCallback((phase: GamePhase, doomLevel: number) => {
    if (phase === 'mythos') {
      queueNarration({
        type: 'phase_change',
        doomLevel,
      });
    }
  }, [queueNarration]);

  const triggerBossEncounter = useCallback((enemy: Enemy) => {
    queueNarration({
      type: 'boss_encounter',
      enemy,
    });
  }, [queueNarration]);

  const triggerAmbient = useCallback((tile: Tile, weather?: WeatherType, doomLevel?: number) => {
    queueNarration({
      type: 'ambient',
      tile,
      weather,
      doomLevel,
    });
  }, [queueNarration]);

  // ============================================================================
  // CONTROL METHODS
  // ============================================================================

  const dismissNarration = useCallback(() => {
    setCurrentNarration(null);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GMSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    currentNarration,
    isLoading,
    queueLength: queue.length,
    triggerCombatStart,
    triggerCombatVictory,
    triggerCombatDamage,
    triggerSanityLoss,
    triggerDoomChange,
    triggerDiscovery,
    triggerExploration,
    triggerEnemySpawn,
    triggerObjectiveComplete,
    triggerPhaseChange,
    triggerBossEncounter,
    triggerAmbient,
    dismissNarration,
    clearQueue,
    updateSettings,
    settings,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isTypeEnabled(type: GMNarrationType, settings: GMSettings): boolean {
  switch (type) {
    case 'exploration':
      return settings.narrateExploration;
    case 'combat_start':
    case 'combat_victory':
    case 'combat_defeat':
    case 'player_hurt':
      return settings.narrateCombat;
    case 'sanity_low':
    case 'sanity_lost':
      return settings.narrateSanity;
    case 'doom_warning':
    case 'doom_critical':
    case 'phase_change':
      return settings.narrateDoom;
    case 'discovery':
    case 'item_found':
    case 'objective_complete':
      return settings.narrateDiscovery;
    case 'ambient':
      return settings.narrateAmbient;
    case 'enemy_spawn':
    case 'boss_encounter':
      return settings.narrateCombat;
    default:
      return true;
  }
}

export default useAIGameMaster;
