import React, { useState, useEffect } from 'react';
import {
  X, Volume2, Monitor, Gamepad2, Palette, HardDrive,
  Contrast, Sparkles, Grid3X3, Zap, Maximize, ZoomIn,
  Flame, Wand2, Cpu, Mic, MessageSquare, VolumeX
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import AssetStudioPanel from './AssetStudioPanel';

export interface GameSettings {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  // Voice GM (AI Game Master)
  voiceGMEnabled: boolean;
  voiceGMVolume: number; // 0-100
  voiceGMSpeed: number; // 50-150 (representing 0.5x - 1.5x)
  aiGMEnabled: boolean;
  narrateExploration: boolean;
  narrateCombat: boolean;
  narrateSanity: boolean;
  narrateDoom: boolean;
  narrateDiscovery: boolean;
  narrateAmbient: boolean;
  // Display
  highContrast: boolean;
  reduceMotion: boolean;
  particles: boolean;
  resolution: 'auto' | '720p' | '1080p' | '1440p' | '4k';
  uiScale: number; // 50-150 percent
  // Advanced Visual Effects
  advancedParticles: boolean; // Pixi.js GPU-accelerated particles
  shaderEffects: boolean; // Three.js WebGL shader effects
  effectsQuality: 'low' | 'medium' | 'high' | 'ultra';
  // Gameplay
  showGrid: boolean;
  fastMode: boolean;
  // Assets
  useGeneratedAssets: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 100,
  // Voice GM defaults
  voiceGMEnabled: true,
  voiceGMVolume: 80,
  voiceGMSpeed: 90, // 0.9x - slightly slower for dramatic effect
  aiGMEnabled: true,
  narrateExploration: true,
  narrateCombat: true,
  narrateSanity: true,
  narrateDoom: true,
  narrateDiscovery: true,
  narrateAmbient: false, // Ambient is opt-in (can be frequent)
  highContrast: false,
  reduceMotion: false,
  particles: true,
  resolution: 'auto',
  uiScale: 100,
  // Advanced effects off by default for performance
  advancedParticles: false,
  shaderEffects: false,
  effectsQuality: 'medium',
  showGrid: true,
  fastMode: false,
  useGeneratedAssets: false,
};

type TabType = 'audio' | 'display' | 'gameplay' | 'assets' | 'system';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onResetData: () => void;
  // TTS status (optional, passed from ShadowsGame)
  ttsAvailable?: boolean;
  ttsProvider?: 'qwen-local' | 'web-speech' | 'none';
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onResetData,
  ttsAvailable = true,
  ttsProvider = 'web-speech',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'audio', label: 'AUDIO', icon: <Volume2 size={18} /> },
    { id: 'display', label: 'DISPLAY', icon: <Monitor size={18} /> },
    { id: 'gameplay', label: 'GAMEPLAY', icon: <Gamepad2 size={18} /> },
    { id: 'assets', label: 'ASSET STUDIO', icon: <Palette size={18} /> },
    { id: 'system', label: 'SYSTEM', icon: <HardDrive size={18} /> },
  ];

  const renderAudioTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-foreground">Audio Settings</h2>
        <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
          <Volume2 className="text-accent" size={24} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Master Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Volume2 size={16} />
              <span className="uppercase tracking-wider text-sm font-bold">Master Volume</span>
            </div>
            <span className="text-primary font-bold">{settings.masterVolume}%</span>
          </div>
          <Slider
            value={[settings.masterVolume]}
            onValueChange={([val]) => updateSetting('masterVolume', val)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Music Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor size={16} />
              <span className="uppercase tracking-wider text-sm font-bold">Music Volume</span>
            </div>
            <span className="text-primary font-bold">{settings.musicVolume}%</span>
          </div>
          <Slider
            value={[settings.musicVolume]}
            onValueChange={([val]) => updateSetting('musicVolume', val)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive size={16} />
              <span className="uppercase tracking-wider text-sm font-bold">SFX Volume</span>
            </div>
            <span className="text-primary font-bold">{settings.sfxVolume}%</span>
          </div>
          <Slider
            value={[settings.sfxVolume]}
            onValueChange={([val]) => updateSetting('sfxVolume', val)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Voice GM Section */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="text-accent" size={18} />
            <span className="text-sm font-bold uppercase tracking-wider text-accent">
              Voice Game Master
            </span>
            {ttsAvailable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                {ttsProvider === 'qwen-local' ? 'Qwen3-TTS' : 'Web Speech'}
              </span>
            )}
            {!ttsAvailable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground italic mb-4">
            AI-powered narration with voice synthesis for immersive gameplay.
          </p>

          {/* Enable AI GM */}
          <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border mb-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageSquare className="text-primary" size={20} />
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-sm">AI Game Master</div>
                <div className="text-xs text-muted-foreground italic">
                  Enable AI-generated narration during gameplay.
                </div>
              </div>
            </div>
            <Switch
              checked={settings.aiGMEnabled}
              onCheckedChange={(checked) => updateSetting('aiGMEnabled', checked)}
            />
          </div>

          {/* Enable Voice */}
          <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border mb-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                {settings.voiceGMEnabled ? (
                  <Volume2 className="text-primary" size={20} />
                ) : (
                  <VolumeX className="text-primary" size={20} />
                )}
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-sm">Voice Narration</div>
                <div className="text-xs text-muted-foreground italic">
                  Speak narration aloud using text-to-speech.
                </div>
              </div>
            </div>
            <Switch
              checked={settings.voiceGMEnabled}
              onCheckedChange={(checked) => updateSetting('voiceGMEnabled', checked)}
              disabled={!settings.aiGMEnabled || !ttsAvailable}
            />
          </div>

          {/* Voice Volume */}
          <div className={`space-y-3 mb-3 ${(!settings.aiGMEnabled || !settings.voiceGMEnabled) ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Volume2 size={16} />
                <span className="uppercase tracking-wider text-sm font-bold">Voice Volume</span>
              </div>
              <span className="text-primary font-bold">{settings.voiceGMVolume}%</span>
            </div>
            <Slider
              value={[settings.voiceGMVolume]}
              onValueChange={([val]) => updateSetting('voiceGMVolume', val)}
              max={100}
              step={1}
              className="w-full"
              disabled={!settings.aiGMEnabled || !settings.voiceGMEnabled}
            />
          </div>

          {/* Voice Speed */}
          <div className={`space-y-3 mb-4 ${(!settings.aiGMEnabled || !settings.voiceGMEnabled) ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap size={16} />
                <span className="uppercase tracking-wider text-sm font-bold">Voice Speed</span>
              </div>
              <span className="text-primary font-bold">{(settings.voiceGMSpeed / 100).toFixed(1)}x</span>
            </div>
            <Slider
              value={[settings.voiceGMSpeed]}
              onValueChange={([val]) => updateSetting('voiceGMSpeed', val)}
              min={50}
              max={150}
              step={5}
              className="w-full"
              disabled={!settings.aiGMEnabled || !settings.voiceGMEnabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* Narration Types */}
          <div className={`pt-4 border-t border-border/30 ${!settings.aiGMEnabled ? 'opacity-50' : ''}`}>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-bold">
              Narration Types
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Exploration */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateExploration}
                  onCheckedChange={(checked) => updateSetting('narrateExploration', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Exploration</span>
              </label>

              {/* Combat */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateCombat}
                  onCheckedChange={(checked) => updateSetting('narrateCombat', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Combat</span>
              </label>

              {/* Sanity Events */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateSanity}
                  onCheckedChange={(checked) => updateSetting('narrateSanity', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Sanity</span>
              </label>

              {/* Doom & Phases */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateDoom}
                  onCheckedChange={(checked) => updateSetting('narrateDoom', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Doom & Phases</span>
              </label>

              {/* Discoveries */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateDiscovery}
                  onCheckedChange={(checked) => updateSetting('narrateDiscovery', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Discoveries</span>
              </label>

              {/* Ambient */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                <Switch
                  checked={settings.narrateAmbient}
                  onCheckedChange={(checked) => updateSetting('narrateAmbient', checked)}
                  disabled={!settings.aiGMEnabled}
                  className="scale-75"
                />
                <span className="text-xs">Ambient</span>
              </label>
            </div>

            {settings.narrateAmbient && settings.aiGMEnabled && (
              <p className="text-[10px] text-amber-500/60 mt-2 italic">
                Ambient narration can be frequent. Disable if overwhelming.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => {
    const resolutionOptions: { value: GameSettings['resolution']; label: string }[] = [
      { value: 'auto', label: 'Auto (Native)' },
      { value: '720p', label: '1280×720 (HD)' },
      { value: '1080p', label: '1920×1080 (Full HD)' },
      { value: '1440p', label: '2560×1440 (QHD)' },
      { value: '4k', label: '3840×2160 (4K)' },
    ];

    return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display text-foreground">Display & Visuals</h2>

      <div className="space-y-4">
        {/* Resolution */}
        <div className="bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Maximize className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">Resolution</div>
              <div className="text-xs text-muted-foreground italic">
                Set the game rendering resolution. Lower for better performance.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {resolutionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting('resolution', option.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  settings.resolution === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {option.value === 'auto' ? 'Auto' : option.value.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* UI Scale */}
        <div className="bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <ZoomIn className="text-primary" size={20} />
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-sm">UI Scale</div>
                <div className="text-xs text-muted-foreground italic">
                  Adjust the size of menus, buttons, and text.
                </div>
              </div>
            </div>
            <span className="text-primary font-bold">{settings.uiScale}%</span>
          </div>
          <Slider
            value={[settings.uiScale]}
            onValueChange={([val]) => updateSetting('uiScale', val)}
            min={50}
            max={150}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Contrast className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">High Contrast</div>
              <div className="text-xs text-muted-foreground italic">
                Enhances visibility of text and important UI elements.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting('highContrast', checked)}
          />
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">Reduce Motion</div>
              <div className="text-xs text-muted-foreground italic">
                Disables camera shake and complex UI animations.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
          />
        </div>

        {/* Particles */}
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">Particles</div>
              <div className="text-xs text-muted-foreground italic">
                Enables atmospheric fog and combat hit effects.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.particles}
            onCheckedChange={(checked) => updateSetting('particles', checked)}
          />
        </div>

        {/* Advanced Effects Section Header */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-accent" size={18} />
            <span className="text-sm font-bold uppercase tracking-wider text-accent">
              Advanced Visual Effects (GPU)
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic mb-4">
            These effects use your GPU for stunning visuals. May impact performance on older devices.
          </p>
        </div>

        {/* Advanced Particles (Pixi.js) */}
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-950/30 to-card/50 p-4 rounded-xl border border-orange-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="text-orange-400" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                Advanced Particles
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">PIXI.JS</span>
              </div>
              <div className="text-xs text-muted-foreground italic">
                GPU-accelerated blood splatter, magic effects, and thousands of simultaneous particles.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.advancedParticles}
            onCheckedChange={(checked) => updateSetting('advancedParticles', checked)}
          />
        </div>

        {/* Shader Effects (Three.js) */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-950/30 to-card/50 p-4 rounded-xl border border-purple-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Wand2 className="text-purple-400" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                Shader Effects
                <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">WEBGL</span>
              </div>
              <div className="text-xs text-muted-foreground italic">
                Reality distortion, chromatic aberration, portals, and post-processing effects.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.shaderEffects}
            onCheckedChange={(checked) => updateSetting('shaderEffects', checked)}
          />
        </div>

        {/* Effects Quality */}
        {(settings.advancedParticles || settings.shaderEffects) && (
          <div className="bg-card/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Cpu className="text-primary" size={20} />
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-sm">Effects Quality</div>
                <div className="text-xs text-muted-foreground italic">
                  Higher quality = more particles and shader passes. Lower for better performance.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => updateSetting('effectsQuality', quality)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    settings.effectsQuality === quality
                      ? quality === 'ultra'
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                        : 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );};

  const renderGameplayTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-display text-foreground">Gameplay Preferences</h2>

      <div className="space-y-4">
        {/* Show Grid */}
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Grid3X3 className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">Show Grid</div>
              <div className="text-xs text-muted-foreground italic">
                Draws visible borders around all discovered hex tiles.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.showGrid}
            onCheckedChange={(checked) => updateSetting('showGrid', checked)}
          />
        </div>

        {/* Fast Mode */}
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">Fast Mode</div>
              <div className="text-xs text-muted-foreground italic">
                Increases the speed of character movement and enemy turns.
              </div>
            </div>
          </div>
          <Switch
            checked={settings.fastMode}
            onCheckedChange={(checked) => updateSetting('fastMode', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderAssetsTab = () => (
    <AssetStudioPanel
      useGeneratedAssets={settings.useGeneratedAssets}
      onToggleGeneratedAssets={(enabled) => updateSetting('useGeneratedAssets', enabled)}
    />
  );

  const renderSystemTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-display text-foreground">Data Management</h2>

      <div className="bg-card/50 p-6 rounded-xl border border-border space-y-4">
        <p className="text-muted-foreground text-sm italic">
          This will wipe your current case progress and saved investigators. Assets (images) are preserved.
        </p>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full px-6 py-4 bg-destructive/20 hover:bg-destructive/30 text-primary font-bold uppercase tracking-wider rounded-lg border border-destructive/50 transition-colors"
          >
            Reset All Game Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-primary font-bold text-center">Are you sure?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setConfirmReset(false);
                }}
                className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'audio': return renderAudioTab();
      case 'display': return renderDisplayTab();
      case 'gameplay': return renderGameplayTab();
      case 'assets': return renderAssetsTab();
      case 'system': return renderSystemTab();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border-2 border-primary rounded-2xl shadow-[var(--shadow-doom)] w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-background/50 border-r border-border flex flex-col">
            <h1 className="text-xl font-display text-primary uppercase tracking-widest p-6 italic">
              Options
            </h1>

            <nav className="flex-1 space-y-1 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left uppercase tracking-wider text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Close Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg uppercase tracking-wider text-sm font-bold transition-colors"
              >
                <X size={16} />
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsMenu;
export { DEFAULT_SETTINGS };
