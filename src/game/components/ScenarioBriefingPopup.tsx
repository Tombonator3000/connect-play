import React, { useState, useEffect } from 'react';
import { Scroll, Target, AlertTriangle, Clock, ChevronRight, Skull, Eye, MapPin, Key, Search, Swords, Star, Shield, Circle } from 'lucide-react';
import { Scenario, ScenarioObjective } from '../types';
import { getVisibleObjectives } from '../utils/scenarioUtils';

// Helper function to get objective icon
const getObjectiveIcon = (type: ScenarioObjective['type']) => {
  switch (type) {
    case 'find_item': return Key;
    case 'collect': return Search;
    case 'find_tile': return MapPin;
    case 'escape': return MapPin;
    case 'kill_enemy':
    case 'kill_boss': return Swords;
    case 'survive': return Clock;
    case 'explore': return Eye;
    case 'interact': return Target;
    case 'ritual': return Star;
    case 'protect': return Shield;
    default: return Target;
  }
};

interface ScenarioBriefingPopupProps {
  scenario: Scenario;
  playerCount: number;
  onBegin: () => void;
}

const ScenarioBriefingPopup: React.FC<ScenarioBriefingPopupProps> = ({
  scenario,
  playerCount,
  onBegin,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // Animate reveal
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Normal': return 'text-emerald-400 border-emerald-500';
      case 'Hard': return 'text-amber-400 border-amber-500';
      case 'Nightmare': return 'text-red-400 border-red-500';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getVictoryTypeIcon = (victoryType: string) => {
    switch (victoryType) {
      case 'escape': return MapPin;
      case 'assassination': return Target;
      case 'collection': return Eye;
      case 'survival': return Clock;
      default: return Target;
    }
  };

  const VictoryIcon = getVictoryTypeIcon(scenario.victoryType);

  return (
    <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-gradient-to-b from-stone-900/98 via-background/99 to-stone-900/98 transition-opacity duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background atmospheric effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating dust particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-amber-200/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
      </div>

      {/* Main briefing document */}
      <div className={`relative bg-parchment/95 border-4 border-double border-stone-700 rounded-sm max-w-2xl w-full mx-4 shadow-2xl transform transition-all duration-700 ${isRevealed ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
        }}>

        {/* Header with wax seal effect */}
        <div className="relative border-b-2 border-stone-600/50 p-6 pb-8">
          {/* Decorative top corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-stone-700" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-stone-700" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-1">Case File No. {scenario.id.toUpperCase()}</p>
              <h1 className="text-3xl font-display text-stone-800 tracking-wide leading-tight">
                {scenario.title}
              </h1>
            </div>

            {/* Difficulty badge */}
            <div className={`px-3 py-1 rounded border-2 ${getDifficultyColor(scenario.difficulty)} bg-background/80 text-xs font-bold uppercase tracking-widest`}>
              {scenario.difficulty}
            </div>
          </div>

          {/* Wax seal decoration */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-red-800 border-4 border-red-900 flex items-center justify-center shadow-lg">
            <Skull size={20} className="text-red-200" />
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 pt-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

          {/* Briefing text */}
          <div className="bg-stone-100/50 rounded p-4 border border-stone-300">
            <div className="flex items-center gap-2 mb-3">
              <Scroll size={16} className="text-stone-600" />
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-widest">Briefing</h2>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed font-serif italic">
              "{scenario.description}"
            </p>
          </div>

          {/* Mission Objectives - Using new objectives system */}
          <div className="bg-stone-100/50 rounded p-4 border border-stone-300">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-stone-600" />
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-widest">Mission Objectives</h2>
            </div>
            <div className="space-y-2">
              {/* Required objectives */}
              {getVisibleObjectives(scenario)
                .filter(obj => !obj.isOptional)
                .map((objective, index) => {
                  const Icon = getObjectiveIcon(objective.type);
                  return (
                    <div key={objective.id} className="flex items-start gap-3 text-sm text-stone-700">
                      <Circle size={14} className="flex-shrink-0 mt-0.5 text-stone-400" />
                      <Icon size={14} className="flex-shrink-0 mt-0.5 text-stone-500" />
                      <span className="font-serif">
                        {objective.description || objective.shortDescription || `${objective.type}: ${objective.targetId}`}
                        {objective.targetAmount && objective.targetAmount > 1 && (
                          <span className="text-stone-500 text-xs ml-1">
                            (0/{objective.targetAmount})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

              {/* Bonus objectives preview */}
              {getVisibleObjectives(scenario).filter(obj => obj.isOptional).length > 0 && (
                <>
                  <div className="border-t border-stone-300 my-2 pt-2">
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-2">
                      <Star size={10} className="inline mr-1" />
                      Bonus Objectives
                    </p>
                    {getVisibleObjectives(scenario)
                      .filter(obj => obj.isOptional)
                      .map((objective) => {
                        const Icon = getObjectiveIcon(objective.type);
                        return (
                          <div key={objective.id} className="flex items-start gap-3 text-sm text-amber-700">
                            <Circle size={14} className="flex-shrink-0 mt-0.5 text-amber-400/50" />
                            <Icon size={14} className="flex-shrink-0 mt-0.5 text-amber-500/60" />
                            <span className="font-serif text-xs">
                              {objective.description || objective.shortDescription || `${objective.type}: ${objective.targetId}`}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Victory Condition */}
          <div className="bg-emerald-50/80 rounded p-4 border border-emerald-300">
            <div className="flex items-center gap-2 mb-2">
              <VictoryIcon size={16} className="text-emerald-700" />
              <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Victory Condition</h2>
            </div>
            <p className="text-sm text-emerald-900 font-serif">
              {scenario.goal}
            </p>
          </div>

          {/* Special Rules & Warnings */}
          {scenario.specialRule && (
            <div className="bg-amber-50/80 rounded p-4 border border-amber-300">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-700" />
                <h2 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Special Conditions</h2>
              </div>
              <p className="text-sm text-amber-900 font-serif">
                {scenario.specialRule}
              </p>
            </div>
          )}

          {/* Doom Events Preview */}
          <div className="bg-red-50/80 rounded p-4 border border-red-300">
            <div className="flex items-center gap-2 mb-3">
              <Skull size={16} className="text-red-700" />
              <h2 className="text-xs font-bold text-red-800 uppercase tracking-widest">Doom Prophecy</h2>
            </div>
            <p className="text-xs text-red-800 mb-3 font-serif italic">
              The doom counter begins at {scenario.startDoom}. As it falls, darkness grows...
            </p>
            <div className="flex flex-wrap gap-2">
              {scenario.doomEvents.map((event, index) => (
                <div key={index} className="px-2 py-1 bg-red-100 rounded text-[10px] text-red-700 border border-red-200">
                  Doom {event.threshold}: {event.type.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Team Info */}
          <div className="flex items-center justify-between py-3 border-t border-stone-300">
            <div className="text-xs text-stone-500 uppercase tracking-widest">
              Investigation Team: <span className="text-stone-700 font-bold">{playerCount} Investigators</span>
            </div>
            <div className="text-xs text-stone-500 uppercase tracking-widest">
              Location: <span className="text-stone-700 font-bold">{scenario.startLocation}</span>
            </div>
          </div>
        </div>

        {/* Footer with Begin button */}
        <div className="p-6 pt-4 border-t-2 border-stone-600/50 bg-stone-200/30">
          {/* Decorative bottom corners */}
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-stone-700" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-stone-700" />

          <button
            onClick={onBegin}
            className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-parchment font-display text-xl uppercase tracking-[0.3em] rounded transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl"
          >
            Begin Investigation
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-[10px] text-stone-500 mt-3 italic font-serif">
            "Once you begin, there is no turning back..."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioBriefingPopup;
