import React from 'react';
import { X, Scroll, Target, AlertTriangle, Clock, Skull, Eye, MapPin, Shield } from 'lucide-react';
import { Scenario } from '../types';

interface ScenarioInfoModalProps {
  scenario: Scenario;
  currentDoom: number;
  currentRound: number;
  onClose: () => void;
}

const ScenarioInfoModal: React.FC<ScenarioInfoModalProps> = ({
  scenario,
  currentDoom,
  currentRound,
  onClose,
}) => {
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card border-2 border-primary rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-[var(--shadow-doom)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-border p-4 bg-background/50">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
            Case File No. {scenario.id.toUpperCase()}
          </p>
          <h2 className="text-xl font-display text-primary tracking-wide pr-8">
            {scenario.title}
          </h2>

          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2 py-0.5 rounded border ${getDifficultyColor(scenario.difficulty)} text-[10px] font-bold uppercase tracking-widest`}>
              {scenario.difficulty}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Round {currentRound} | Doom {currentDoom}/{scenario.startDoom}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 max-h-[calc(80vh-120px)] overflow-y-auto custom-scrollbar">

          {/* Briefing */}
          <div className="bg-background/30 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Scroll size={14} className="text-muted-foreground" />
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Briefing</h3>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed italic">
              "{scenario.description}"
            </p>
          </div>

          {/* Mission Objectives */}
          <div className="bg-background/30 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-muted-foreground" />
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mission Objectives</h3>
            </div>
            <div className="space-y-1.5">
              {scenario.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center text-[9px] text-muted-foreground">
                    {index + 1}
                  </span>
                  <span>{step.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Victory Condition */}
          <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-800/50">
            <div className="flex items-center gap-2 mb-2">
              <VictoryIcon size={14} className="text-emerald-400" />
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Victory Condition</h3>
            </div>
            <p className="text-xs text-emerald-200/90">
              {scenario.goal}
            </p>
          </div>

          {/* Special Rules */}
          {scenario.specialRule && (
            <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Special Conditions</h3>
              </div>
              <p className="text-xs text-amber-200/90">
                {scenario.specialRule}
              </p>
            </div>
          )}

          {/* Doom Events */}
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Skull size={14} className="text-red-400" />
              <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Doom Prophecy</h3>
            </div>
            <p className="text-[10px] text-red-300/80 mb-2 italic">
              The doom counter begins at {scenario.startDoom}. As it falls, darkness grows...
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scenario.doomEvents.map((event, index) => (
                <div
                  key={index}
                  className={`px-2 py-0.5 rounded text-[9px] border ${
                    currentDoom <= event.threshold
                      ? 'bg-red-900/50 text-red-300 border-red-700 line-through opacity-60'
                      : 'bg-red-950/50 text-red-400 border-red-800/50'
                  }`}
                >
                  Doom {event.threshold}: {event.type.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between py-2 border-t border-border text-[10px] text-muted-foreground">
            <span className="uppercase tracking-widest">
              Location: <span className="text-foreground">{scenario.startLocation}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioInfoModal;
