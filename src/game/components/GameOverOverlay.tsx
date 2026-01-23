import React, { useState, useMemo } from 'react';
import {
  Skull, Trophy, RotateCcw, Home, Swords, Map, Brain, Target,
  Heart, Sparkles, ChevronDown, ChevronUp, Coins, Star, AlertCircle,
  CheckCircle, XCircle, User
} from 'lucide-react';
import {
  GameStats, PerformanceRating, CharacterFate, EnhancedScenarioResult,
  Player, Scenario, VictoryType, Item
} from '../types';
import {
  calculatePerformanceRating,
  getRatingInfo,
  generateCharacterFates,
  generateConsequences,
  calculateLegacyRewards
} from '../utils/performanceRating';
import { generateEpilogue, getRandomQuote } from '../data/epilogues';

export type GameOverType = 'victory' | 'defeat_death' | 'defeat_doom';

interface GameOverOverlayProps {
  type: GameOverType;
  scenarioTitle?: string;
  round: number;
  onRestart: () => void;
  onMainMenu: () => void;
  // Enhanced props for full statistics
  stats?: GameStats;
  players?: Player[];
  scenario?: Scenario | null;
  isLegacyMode?: boolean;
}

// ============================================================================
// STYLING CONFIGURATION
// ============================================================================

const GAME_OVER_CONTENT = {
  victory: {
    title: 'VICTORIA',
    subtitle: 'The darkness recedes... for now.',
    icon: Trophy,
    bgClass: 'from-emerald-900/95 via-background/98 to-emerald-900/95',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    statBg: 'bg-emerald-950/50',
  },
  defeat_death: {
    title: 'FINIS',
    subtitle: 'Your light has been extinguished...',
    icon: Skull,
    bgClass: 'from-red-900/95 via-background/98 to-red-900/95',
    accentClass: 'text-primary',
    borderClass: 'border-primary',
    statBg: 'bg-red-950/50',
  },
  defeat_doom: {
    title: 'FINIS',
    subtitle: 'The stars have aligned. The Old Ones awaken.',
    icon: Skull,
    bgClass: 'from-purple-900/95 via-background/98 to-purple-900/95',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500',
    statBg: 'bg-purple-950/50',
  },
};

const RATING_COLORS: Record<PerformanceRating, string> = {
  S: 'text-yellow-400 border-yellow-500',
  A: 'text-emerald-400 border-emerald-500',
  B: 'text-blue-400 border-blue-500',
  C: 'text-orange-400 border-orange-500',
  F: 'text-red-400 border-red-500',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, className = '' }) => (
  <div className={`flex flex-col items-center p-3 rounded-lg bg-background/30 border border-border/50 ${className}`}>
    <div className="text-muted-foreground mb-1">{icon}</div>
    <div className="text-lg font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
  </div>
);

interface CharacterFateCardProps {
  fate: CharacterFate;
  accentClass: string;
}

const CharacterFateCard: React.FC<CharacterFateCardProps> = ({ fate, accentClass }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border ${fate.survived ? 'border-emerald-500/50' : 'border-red-500/50'} bg-background/40 p-3`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full border-2 ${fate.survived ? 'border-emerald-500' : 'border-red-500'} flex items-center justify-center`}>
            <User size={16} className={fate.survived ? 'text-emerald-400' : 'text-red-400'} />
          </div>
          <div>
            <div className="font-semibold text-foreground">{fate.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{fate.characterClass}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-sm font-bold ${fate.survived ? 'text-emerald-400' : 'text-red-400'}`}>
              {fate.survived ? 'Survived' : 'Lost'}
            </div>
            <div className="text-xs text-muted-foreground">
              HP: {fate.finalHp}/{fate.maxHp} | San: {fate.finalSanity}/{fate.maxSanity}
            </div>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-sm text-muted-foreground italic">"{fate.personalEpilogue}"</p>
          {fate.madnessAcquired.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {fate.madnessAcquired.map((madness, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 text-xs capitalize">
                  {madness.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
          {fate.killCount > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Swords size={12} className="inline mr-1" />
              {fate.killCount} enemies vanquished
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  type,
  scenarioTitle,
  round,
  onRestart,
  onMainMenu,
  stats,
  players,
  scenario,
  isLegacyMode = false,
}) => {
  const content = GAME_OVER_CONTENT[type];
  const Icon = content.icon;
  const isVictory = type === 'victory';

  // Calculate performance rating if stats are available
  const performanceData = useMemo(() => {
    if (!stats) return null;
    return calculatePerformanceRating(stats, isVictory);
  }, [stats, isVictory]);

  // Get rating info
  const ratingInfo = useMemo(() => {
    if (!performanceData) return null;
    return getRatingInfo(performanceData.rating, isVictory);
  }, [performanceData, isVictory]);

  // Generate character fates
  const characterFates = useMemo(() => {
    if (!players || !stats) return [];
    return generateCharacterFates(players, stats, isVictory);
  }, [players, stats, isVictory]);

  // Generate consequences
  const consequences = useMemo(() => {
    if (!stats) return { positive: [], negative: [] };
    return generateConsequences(stats, scenario || null, isVictory);
  }, [stats, scenario, isVictory]);

  // Generate epilogue
  const epilogue = useMemo(() => {
    if (!stats || !scenario) return null;
    return generateEpilogue({
      victoryType: scenario.victoryType,
      outcome: type,
      stats,
      rating: performanceData?.rating || 'C',
      theme: scenario.theme,
      deadPlayerNames: stats.playerDeaths
    });
  }, [stats, scenario, type, performanceData]);

  // Calculate legacy rewards
  const rewards = useMemo(() => {
    if (!stats || !isLegacyMode || !performanceData || !scenario) return null;
    return calculateLegacyRewards(stats, performanceData.rating, isVictory, scenario.difficulty);
  }, [stats, isLegacyMode, performanceData, isVictory, scenario]);

  const quote = useMemo(() => getRandomQuote(), []);

  // If no stats, show simple view
  if (!stats) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b ${content.bgClass} animate-fadeIn`}>
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

        <div className={`relative bg-card/90 border-2 ${content.borderClass} rounded-3xl p-12 max-w-lg w-full mx-4 shadow-2xl backdrop-blur-md text-center`}>
          <div className={`mx-auto mb-8 w-24 h-24 rounded-full border-4 ${content.borderClass} flex items-center justify-center bg-background/50 ${isVictory ? 'animate-pulse' : 'animate-bounce'}`}>
            <Icon size={48} className={content.accentClass} />
          </div>
          <h1 className={`text-6xl font-display tracking-[0.3em] uppercase mb-4 ${content.accentClass}`}>
            {content.title}
          </h1>
          <p className="text-xl text-muted-foreground italic mb-8 font-serif">
            {content.subtitle}
          </p>
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-muted-foreground/50 italic font-serif max-w-md">
            {quote}
          </p>
        </div>
      </div>
    );
  }

  // Enhanced view with statistics
  return (
    <div className={`fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b ${content.bgClass} animate-fadeIn`}>
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
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

      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className={`relative bg-card/95 border-2 ${content.borderClass} rounded-3xl max-w-3xl w-full shadow-2xl backdrop-blur-md`}>

          {/* Header with title and icon */}
          <div className="text-center pt-8 pb-4 px-6 border-b border-border/30">
            <div className={`mx-auto mb-4 w-20 h-20 rounded-full border-4 ${content.borderClass} flex items-center justify-center bg-background/50 ${isVictory ? 'animate-pulse' : ''}`}>
              <Icon size={40} className={content.accentClass} />
            </div>
            <h1 className={`text-5xl font-display tracking-[0.25em] uppercase mb-2 ${content.accentClass}`}>
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif">
              {content.subtitle}
            </p>
          </div>

          {/* Epilogue */}
          {epilogue && (
            <div className="px-6 py-4 border-b border-border/30">
              <p className="text-sm text-muted-foreground/90 italic font-serif leading-relaxed text-center">
                {epilogue.split('\n\n').map((para, i) => (
                  <span key={i} className="block mb-2 last:mb-0">{para}</span>
                ))}
              </p>
            </div>
          )}

          {/* Mission info and rating */}
          <div className="px-6 py-4 border-b border-border/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Mission</p>
                <p className="font-bold text-foreground">{scenarioTitle || 'Unknown Scenario'}</p>
              </div>

              {performanceData && ratingInfo && (
                <div className="text-center">
                  <div className={`text-4xl font-display font-bold ${RATING_COLORS[performanceData.rating].split(' ')[0]}`}>
                    {performanceData.rating}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ratingInfo.title}</p>
                </div>
              )}

              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Rounds</p>
                <p className={`font-bold text-2xl ${content.accentClass}`}>{round}</p>
              </div>
            </div>
          </div>

          {/* Statistics grid */}
          <div className="px-6 py-4 border-b border-border/30">
            <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Performance Summary</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <StatCard
                icon={<Swords size={16} />}
                label="Enemies"
                value={stats.enemiesKilled}
              />
              <StatCard
                icon={<Map size={16} />}
                label="Explored"
                value={stats.tilesExplored}
              />
              <StatCard
                icon={<Brain size={16} />}
                label="Sanity Lost"
                value={stats.totalSanityLost}
              />
              <StatCard
                icon={<Target size={16} />}
                label="Clues"
                value={stats.cluesFound}
              />
              <StatCard
                icon={<Heart size={16} />}
                label="Damage"
                value={stats.totalDamageTaken}
              />
              <StatCard
                icon={<Sparkles size={16} />}
                label="Secrets"
                value={stats.secretsFound}
              />
            </div>
          </div>

          {/* Consequences */}
          {(consequences.positive.length > 0 || consequences.negative.length > 0) && (
            <div className="px-6 py-4 border-b border-border/30">
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Consequences</h3>
              <div className="space-y-2">
                {consequences.positive.map((c, i) => (
                  <div key={`pos-${i}`} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-emerald-200">{c}</span>
                  </div>
                ))}
                {consequences.negative.map((c, i) => (
                  <div key={`neg-${i}`} className="flex items-start gap-2 text-sm">
                    <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-200">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Character fates */}
          {characterFates.length > 0 && (
            <div className="px-6 py-4 border-b border-border/30">
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Investigator Fates</h3>
              <div className="space-y-2">
                {characterFates.map(fate => (
                  <CharacterFateCard
                    key={fate.playerId}
                    fate={fate}
                    accentClass={content.accentClass}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Legacy rewards */}
          {rewards && isLegacyMode && (
            <div className="px-6 py-4 border-b border-border/30">
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Rewards Earned</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Coins size={20} />
                    <span className="text-2xl font-bold">
                      {rewards.goldEarned + rewards.bonusGold}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gold ({rewards.goldEarned} + {rewards.bonusGold} bonus)
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Star size={20} />
                    <span className="text-2xl font-bold">
                      {rewards.xpEarned + rewards.bonusXP}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    XP ({rewards.xpEarned} + {rewards.bonusXP} bonus)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 py-6">
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
          <div className="text-center pb-6 px-6">
            <p className="text-xs text-muted-foreground/50 italic font-serif max-w-md mx-auto">
              {quote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverOverlay;
