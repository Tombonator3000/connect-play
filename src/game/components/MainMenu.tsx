import React from 'react';
import { Play, Skull, Settings, Users, Package, HardDrive } from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onOptions: () => void;
  canContinue: boolean;
  version: string;
  // Legacy system props
  onHeroArchive?: () => void;
  onStash?: () => void;
  onSaveLoad?: () => void;
  heroCount?: number;
  stashCount?: number;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onContinue,
  onOptions,
  canContinue,
  version,
  onHeroArchive,
  onStash,
  onSaveLoad,
  heroCount = 0,
  stashCount = 0
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden font-serif">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>

      <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000 w-full px-4">
        <div className="mb-8 md:mb-12">
          <h1 className="text-5xl md:text-9xl font-display italic tracking-tighter text-primary drop-shadow-[0_0_15px_hsla(348,75%,50%,0.4)] mb-2 md:mb-4 text-stroke-sm">
            Mythos
          </h1>
          <h2 className="text-xl md:text-5xl font-display text-muted-foreground tracking-widest uppercase">
            Quest
          </h2>
          <div className="w-24 md:w-32 h-1 bg-primary mx-auto mt-4 md:mt-6 shadow-[var(--shadow-doom)]"></div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-xs md:max-w-md">
          {canContinue && (
            <button
              onClick={onContinue}
              className="group relative px-4 py-3 md:px-8 md:py-4 bg-card/80 border-2 border-border hover:border-green-500 hover:bg-green-900/20 text-muted-foreground hover:text-green-400 transition-all uppercase tracking-[0.2em] font-bold text-sm md:text-lg rounded backdrop-blur-sm"
            >
              <span className="flex items-center justify-center gap-3">
                <Play size={20} className="group-hover:fill-current" /> Continue
              </span>
            </button>
          )}

          <button
            onClick={onNewGame}
            className="group relative px-4 py-3 md:px-8 md:py-4 bg-card/80 border-2 border-primary/60 hover:border-primary hover:bg-primary/10 text-foreground hover:text-foreground transition-all uppercase tracking-[0.2em] font-bold text-sm md:text-lg rounded backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[var(--shadow-doom)]"
          >
            <span className="flex items-center justify-center gap-3">
              <Skull size={20} className="group-hover:animate-wiggle" /> New Case
            </span>
          </button>

          {/* Legacy System Buttons */}
          {(onHeroArchive || onStash || onSaveLoad) && (
            <div className="flex gap-3 mt-2">
              {onHeroArchive && (
                <button
                  onClick={onHeroArchive}
                  className="group flex-1 relative px-4 py-3 bg-amber-900/20 border border-amber-700 hover:border-amber-500 text-amber-400 hover:text-amber-300 transition-all uppercase tracking-wider font-bold text-xs rounded backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Users size={16} />
                    <span className="hidden md:inline">Heroes</span>
                    {heroCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-600 text-amber-100 rounded-full text-[10px]">
                        {heroCount}
                      </span>
                    )}
                  </span>
                </button>
              )}
              {onStash && (
                <button
                  onClick={onStash}
                  className="group flex-1 relative px-4 py-3 bg-blue-900/20 border border-blue-700 hover:border-blue-500 text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider font-bold text-xs rounded backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Package size={16} />
                    <span className="hidden md:inline">Stash</span>
                    {stashCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-blue-100 rounded-full text-[10px]">
                        {stashCount}
                      </span>
                    )}
                  </span>
                </button>
              )}
              {onSaveLoad && (
                <button
                  onClick={onSaveLoad}
                  className="group flex-1 relative px-4 py-3 bg-green-900/20 border border-green-700 hover:border-green-500 text-green-400 hover:text-green-300 transition-all uppercase tracking-wider font-bold text-xs rounded backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <HardDrive size={16} />
                    <span className="hidden md:inline">Save/Load</span>
                  </span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onOptions}
            className="group relative px-4 py-3 bg-transparent border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all uppercase tracking-[0.2em] font-bold text-xs md:text-sm rounded hover:bg-accent/10"
          >
            <span className="flex items-center justify-center gap-3">
              <Settings size={16} className="group-hover:rotate-90 transition-transform duration-700" /> Options
            </span>
          </button>
        </div>

        <div className="mt-8 md:mt-16 text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest font-sans">
          <p>Version {version} • A Cosmic Horror Experience</p>
          {heroCount > 0 && (
            <p className="mt-2 text-amber-500/60">
              Legacy Mode: {heroCount} hero{heroCount !== 1 ? 'es' : ''} in archive
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
