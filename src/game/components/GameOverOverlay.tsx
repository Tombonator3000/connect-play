import React from 'react';
import { Skull, Trophy, RotateCcw, Home } from 'lucide-react';

export type GameOverType = 'victory' | 'defeat_death' | 'defeat_doom';

interface GameOverOverlayProps {
  type: GameOverType;
  scenarioTitle?: string;
  round: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

const GAME_OVER_CONTENT = {
  victory: {
    title: 'VICTORIA',
    subtitle: 'The darkness recedes... for now.',
    icon: Trophy,
    bgClass: 'from-emerald-900/95 via-background/98 to-emerald-900/95',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
  },
  defeat_death: {
    title: 'FINIS',
    subtitle: 'Your light has been extinguished...',
    icon: Skull,
    bgClass: 'from-red-900/95 via-background/98 to-red-900/95',
    accentClass: 'text-primary',
    borderClass: 'border-primary',
  },
  defeat_doom: {
    title: 'FINIS',
    subtitle: 'The stars have aligned. The Old Ones awaken.',
    icon: Skull,
    bgClass: 'from-purple-900/95 via-background/98 to-purple-900/95',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500',
  },
};

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  type,
  scenarioTitle,
  round,
  onRestart,
  onMainMenu,
}) => {
  const content = GAME_OVER_CONTENT[type];
  const Icon = content.icon;
  const isVictory = type === 'victory';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b ${content.bgClass} animate-fadeIn`}>
      {/* Background particles/effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${content.accentClass} opacity-30 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative bg-card/90 border-2 ${content.borderClass} rounded-3xl p-12 max-w-lg w-full mx-4 shadow-2xl backdrop-blur-md text-center`}>
        {/* Icon */}
        <div className={`mx-auto mb-8 w-24 h-24 rounded-full border-4 ${content.borderClass} flex items-center justify-center bg-background/50 ${isVictory ? 'animate-pulse' : 'animate-bounce'}`}>
          <Icon size={48} className={content.accentClass} />
        </div>

        {/* Title */}
        <h1 className={`text-6xl font-display tracking-[0.3em] uppercase mb-4 ${content.accentClass}`}>
          {content.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground italic mb-8 font-serif">
          {content.subtitle}
        </p>

        {/* Stats */}
        <div className="bg-background/50 rounded-xl p-6 mb-8 border border-border">
          {scenarioTitle && (
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              {scenarioTitle}
            </p>
          )}
          <p className="text-lg text-foreground">
            {isVictory ? 'Completed in' : 'Survived'} <span className={content.accentClass}>{round}</span> rounds
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className={`px-8 py-4 rounded-xl border-2 ${content.borderClass} ${content.accentClass} bg-background/50 hover:bg-background/80 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm hover:scale-105`}
          >
            <RotateCcw size={18} />
            Try Again
          </button>
          <button
            onClick={onMainMenu}
            className="px-8 py-4 rounded-xl border-2 border-border text-muted-foreground bg-background/50 hover:bg-background/80 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm hover:scale-105"
          >
            <Home size={18} />
            Main Menu
          </button>
        </div>
      </div>

      {/* Decorative quote */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground/50 italic font-serif max-w-md">
          {isVictory
            ? '"In the end, it is not the darkness we fear, but what we become in the light."'
            : '"That is not dead which can eternal lie, and with strange aeons even death may die."'}
        </p>
      </div>
    </div>
  );
};

export default GameOverOverlay;
