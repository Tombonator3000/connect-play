/**
 * DMNarrationPanel - Game Master Narration Display
 *
 * Displays AI-generated or mock Game Master narration with atmospheric styling.
 * Features fade-in animations and typewriter effect for text.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Skull, Brain, Swords, Eye, AlertTriangle, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { GMNarrationResult, GMNarrationType } from '../services/claudeService';
import { GMSettings } from '../hooks/useAIGameMaster';

// ============================================================================
// TYPES
// ============================================================================

interface DMNarrationPanelProps {
  narration: GMNarrationResult | null;
  isLoading: boolean;
  queueLength: number;
  onDismiss: () => void;
  settings: GMSettings;
  onSettingsChange?: (settings: Partial<GMSettings>) => void;
  showSettings?: boolean;
  // TTS status
  ttsAvailable?: boolean;
  ttsProvider?: 'qwen-local' | 'web-speech' | 'none';
}

// Icon mapping for different narration types
const NARRATION_ICONS: Record<GMNarrationType, React.ReactNode> = {
  combat_start: <Swords className="w-4 h-4" />,
  combat_victory: <Swords className="w-4 h-4 text-green-400" />,
  combat_defeat: <Swords className="w-4 h-4 text-red-400" />,
  player_hurt: <AlertTriangle className="w-4 h-4 text-red-400" />,
  sanity_low: <Brain className="w-4 h-4 text-purple-400" />,
  sanity_lost: <Brain className="w-4 h-4 text-purple-400" />,
  doom_warning: <Skull className="w-4 h-4 text-amber-400" />,
  doom_critical: <Skull className="w-4 h-4 text-red-500 animate-pulse" />,
  discovery: <BookOpen className="w-4 h-4 text-blue-400" />,
  exploration: <Eye className="w-4 h-4 text-cyan-400" />,
  enemy_spawn: <Skull className="w-4 h-4 text-red-400" />,
  item_found: <Sparkles className="w-4 h-4 text-yellow-400" />,
  objective_complete: <Sparkles className="w-4 h-4 text-green-400" />,
  phase_change: <Eye className="w-4 h-4 text-purple-500" />,
  boss_encounter: <Skull className="w-4 h-4 text-red-600 animate-pulse" />,
  ambient: <Eye className="w-4 h-4 text-gray-400" />,
};

// Color schemes for different narration types
const NARRATION_COLORS: Record<GMNarrationType, string> = {
  combat_start: 'border-red-800/50 bg-gradient-to-b from-red-950/90 to-stone-950/95',
  combat_victory: 'border-green-800/50 bg-gradient-to-b from-green-950/90 to-stone-950/95',
  combat_defeat: 'border-red-900/50 bg-gradient-to-b from-red-950/90 to-stone-950/95',
  player_hurt: 'border-red-800/50 bg-gradient-to-b from-red-950/90 to-stone-950/95',
  sanity_low: 'border-purple-800/50 bg-gradient-to-b from-purple-950/90 to-stone-950/95',
  sanity_lost: 'border-purple-900/50 bg-gradient-to-b from-purple-950/90 to-stone-950/95',
  doom_warning: 'border-amber-800/50 bg-gradient-to-b from-amber-950/90 to-stone-950/95',
  doom_critical: 'border-red-700/70 bg-gradient-to-b from-red-950/95 to-stone-950/95 animate-pulse',
  discovery: 'border-blue-800/50 bg-gradient-to-b from-blue-950/90 to-stone-950/95',
  exploration: 'border-cyan-800/50 bg-gradient-to-b from-cyan-950/90 to-stone-950/95',
  enemy_spawn: 'border-red-800/50 bg-gradient-to-b from-red-950/90 to-stone-950/95',
  item_found: 'border-yellow-800/50 bg-gradient-to-b from-yellow-950/90 to-stone-950/95',
  objective_complete: 'border-green-800/50 bg-gradient-to-b from-green-950/90 to-stone-950/95',
  phase_change: 'border-purple-700/50 bg-gradient-to-b from-purple-950/90 to-stone-950/95',
  boss_encounter: 'border-red-600/70 bg-gradient-to-b from-red-900/95 to-stone-950/95',
  ambient: 'border-stone-700/50 bg-gradient-to-b from-stone-900/90 to-stone-950/95',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DMNarrationPanel: React.FC<DMNarrationPanelProps> = ({
  narration,
  isLoading,
  queueLength,
  onDismiss,
  settings,
  onSettingsChange,
  showSettings = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Typewriter effect for narration text
  useEffect(() => {
    if (!narration?.text) {
      setDisplayedText('');
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setIsAnimating(true);
    setDisplayedText('');

    const text = narration.text;
    let currentIndex = 0;
    const charDelay = 25; // ms per character

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, charDelay);

    return () => clearInterval(interval);
  }, [narration?.text, narration?.timestamp]);

  // Auto-dismiss after animation completes (if not critical)
  useEffect(() => {
    if (!narration || isAnimating) return;

    // Critical messages stay longer
    const isCritical = narration.type === 'doom_critical' || narration.type === 'boss_encounter';
    const displayTime = isCritical ? 8000 : 5000;

    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out
    }, displayTime);

    return () => clearTimeout(timeout);
  }, [narration, isAnimating, onDismiss]);

  // Handle dismiss click
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  // Don't render if no narration and not loading
  if (!narration && !isLoading) {
    return null;
  }

  const colorScheme = narration ? NARRATION_COLORS[narration.type] : NARRATION_COLORS.ambient;
  const icon = narration ? NARRATION_ICONS[narration.type] : null;

  return createPortal(
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[90]
        max-w-md w-[90vw] md:w-full
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div
        className={`
          relative rounded-lg border-2 shadow-2xl
          ${colorScheme}
          backdrop-blur-sm
          overflow-hidden
        `}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-amber-600/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-amber-600/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-amber-600/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-amber-600/30" />

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-amber-900/30">
          <div className="flex items-center gap-2">
            <span className="text-amber-500/80">{icon}</span>
            <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Game Master
            </span>
            {narration?.isAIGenerated && (
              <span className="text-[10px] text-purple-400/60 font-medium">✧ AI</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {queueLength > 0 && (
              <span className="text-[10px] text-amber-500/60">
                +{queueLength} more
              </span>
            )}
            <button
              onClick={handleDismiss}
              className="text-amber-600/50 hover:text-amber-400 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {isLoading && !narration ? (
            <div className="flex items-center gap-2 text-amber-400/60 italic">
              <span className="animate-pulse">The shadows whisper...</span>
            </div>
          ) : (
            <p className="text-amber-100/90 text-sm leading-relaxed font-serif italic">
              "{displayedText}"
              {isAnimating && (
                <span className="inline-block w-1 h-4 ml-1 bg-amber-400/70 animate-pulse" />
              )}
            </p>
          )}
        </div>

        {/* Ambient effect for critical narrations */}
        {narration?.type === 'doom_critical' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          </div>
        )}
        {narration?.type === 'boss_encounter' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent" />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// SETTINGS PANEL (Optional)
// ============================================================================

interface DMSettingsPanelProps {
  settings: GMSettings;
  onSettingsChange: (settings: Partial<GMSettings>) => void;
  onClose: () => void;
  ttsAvailable?: boolean;
  ttsProvider?: 'qwen-local' | 'web-speech' | 'none';
}

export const DMSettingsPanel: React.FC<DMSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
  ttsAvailable = false,
  ttsProvider = 'none',
}) => {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-stone-900 border-2 border-amber-800/50 rounded-lg shadow-2xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/30">
          <h3 className="text-amber-400 font-semibold">Game Master Settings</h3>
          <button
            onClick={onClose}
            className="text-amber-600/50 hover:text-amber-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-4 space-y-4">
          {/* Master toggle */}
          <SettingToggle
            label="Enable AI Game Master"
            checked={settings.enabled}
            onChange={(enabled) => onSettingsChange({ enabled })}
          />

          {/* Voice Narration Section */}
          <div className="border-t border-amber-900/20 pt-4">
            <div className="flex items-center gap-2 mb-3">
              {settings.voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-500/60" />
              ) : (
                <VolumeX className="w-4 h-4 text-amber-500/60" />
              )}
              <p className="text-xs text-amber-500/60">Voice Narration</p>
              {ttsAvailable && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                  {ttsProvider === 'qwen-local' ? 'Qwen3-TTS' : 'Web Speech'}
                </span>
              )}
              {!ttsAvailable && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-400">
                  Unavailable
                </span>
              )}
            </div>

            <SettingToggle
              label="Enable Voice"
              checked={settings.voiceEnabled}
              onChange={(voiceEnabled) => onSettingsChange({ voiceEnabled })}
              disabled={!settings.enabled || !ttsAvailable}
            />

            {/* Volume slider */}
            <div className={`py-2 ${(!settings.enabled || !settings.voiceEnabled) ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-amber-200/80">Volume</span>
                <span className="text-xs text-amber-500/60">{Math.round(settings.voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.voiceVolume * 100}
                onChange={(e) => onSettingsChange({ voiceVolume: Number(e.target.value) / 100 })}
                disabled={!settings.enabled || !settings.voiceEnabled}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Rate slider */}
            <div className={`py-2 ${(!settings.enabled || !settings.voiceEnabled) ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-amber-200/80">Speed</span>
                <span className="text-xs text-amber-500/60">{settings.voiceRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.voiceRate * 100}
                onChange={(e) => onSettingsChange({ voiceRate: Number(e.target.value) / 100 })}
                disabled={!settings.enabled || !settings.voiceEnabled}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {ttsProvider === 'web-speech' && settings.voiceEnabled && (
              <p className="text-[10px] text-amber-500/40 mt-2">
                Using browser voice. For custom GM voice, run the local TTS server.
              </p>
            )}
          </div>

          <div className="border-t border-amber-900/20 pt-4">
            <p className="text-xs text-amber-500/60 mb-3">Narration Types</p>

            <SettingToggle
              label="Exploration"
              checked={settings.narrateExploration}
              onChange={(narrateExploration) => onSettingsChange({ narrateExploration })}
              disabled={!settings.enabled}
            />
            <SettingToggle
              label="Combat"
              checked={settings.narrateCombat}
              onChange={(narrateCombat) => onSettingsChange({ narrateCombat })}
              disabled={!settings.enabled}
            />
            <SettingToggle
              label="Sanity Events"
              checked={settings.narrateSanity}
              onChange={(narrateSanity) => onSettingsChange({ narrateSanity })}
              disabled={!settings.enabled}
            />
            <SettingToggle
              label="Doom & Phases"
              checked={settings.narrateDoom}
              onChange={(narrateDoom) => onSettingsChange({ narrateDoom })}
              disabled={!settings.enabled}
            />
            <SettingToggle
              label="Discoveries"
              checked={settings.narrateDiscovery}
              onChange={(narrateDiscovery) => onSettingsChange({ narrateDiscovery })}
              disabled={!settings.enabled}
            />
            <SettingToggle
              label="Ambient (Frequent)"
              checked={settings.narrateAmbient}
              onChange={(narrateAmbient) => onSettingsChange({ narrateAmbient })}
              disabled={!settings.enabled}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// SETTING TOGGLE COMPONENT
// ============================================================================

interface SettingToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      className={`
        flex items-center justify-between py-2 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="text-sm text-amber-200/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-colors
          ${checked ? 'bg-amber-600' : 'bg-stone-700'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}
          `}
        />
      </button>
    </label>
  );
};

export default DMNarrationPanel;
