import React, { useState } from 'react';
import { 
  X, Volume2, Monitor, Gamepad2, Palette, HardDrive,
  Contrast, Sparkles, Grid3X3, Zap, Download, RefreshCw
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export interface GameSettings {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  // Display
  highContrast: boolean;
  reduceMotion: boolean;
  particles: boolean;
  // Gameplay
  showGrid: boolean;
  fastMode: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 100,
  highContrast: false,
  reduceMotion: false,
  particles: true,
  showGrid: true,
  fastMode: false,
};

type TabType = 'audio' | 'display' | 'gameplay' | 'assets' | 'system';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onResetData: () => void;
  assetCount?: { generated: number; total: number };
  onGenerateAssets?: () => void;
  onExportAssets?: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onResetData,
  assetCount = { generated: 0, total: 152 },
  onGenerateAssets,
  onExportAssets,
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
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-display text-foreground">Display & Visuals</h2>

      <div className="space-y-4">
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
      </div>
    </div>
  );

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-gold uppercase tracking-wider">
          Generative Art Pipeline
        </h2>
        <span className="text-muted-foreground text-sm">
          {assetCount.generated} / {assetCount.total} Assets
        </span>
      </div>

      <div className="bg-card/50 p-6 rounded-xl border border-border space-y-4">
        <p className="text-muted-foreground text-sm italic text-center">
          Indexing Lokasjoner, Monstre og Karakterer. Assets lagres i nettleserens cache.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onGenerateAssets}
            className="px-6 py-3 bg-accent hover:bg-accent/80 text-accent-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} />
            Generate {assetCount.total - assetCount.generated} Missing
          </button>
          <button
            onClick={onExportAssets}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors border border-border"
          >
            <Download size={18} />
            Export JSON
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
