import React from 'react';
import { X, Scroll, Target, AlertTriangle, Clock, Skull, Eye, MapPin, Shield, Key, FileText, CheckCircle2, Circle, Search, Swords, Star } from 'lucide-react';
import { Scenario, ScenarioObjective } from '../types';
import { getVisibleObjectives, getObjectiveProgressText } from '../utils/scenarioUtils';

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

// Objective row component
const ObjectiveRow: React.FC<{ objective: ScenarioObjective; isBonus?: boolean }> = ({
  objective,
  isBonus = false
}) => {
  const Icon = getObjectiveIcon(objective.type);
  const progressText = getObjectiveProgressText(objective);
  const isComplete = objective.completed;

  return (
    <div className={`flex items-start gap-2 text-xs ${isBonus ? 'text-amber-200/70' : 'text-foreground/80'}`}>
      {/* Status indicator */}
      <div className="flex-shrink-0 mt-0.5">
        {isComplete ? (
          <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
          <Circle size={14} className={isBonus ? 'text-amber-500/50' : 'text-muted-foreground/50'} />
        )}
      </div>

      {/* Icon for objective type */}
      <Icon size={12} className={`flex-shrink-0 mt-0.5 ${isComplete ? 'text-emerald-400/60' : isBonus ? 'text-amber-400/60' : 'text-muted-foreground/60'}`} />

      {/* Description and progress */}
      <div className="flex-1">
        <span className={isComplete ? 'line-through opacity-60' : ''}>
          {objective.description || objective.shortDescription || `${objective.type}: ${objective.targetId}`}
        </span>
        {objective.targetAmount && objective.targetAmount > 1 && (
          <span className={`ml-2 text-[10px] ${isComplete ? 'text-emerald-400' : 'text-muted-foreground'}`}>
            ({progressText})
          </span>
        )}
      </div>

      {/* Complete badge */}
      {isComplete && (
        <span className="text-[9px] font-bold text-emerald-400 uppercase">Done</span>
      )}
    </div>
  );
};

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

          {/* Mission Objectives - New system */}
          <div className="bg-background/30 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-muted-foreground" />
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mission Objectives</h3>
            </div>
            <div className="space-y-2">
              {/* Required Objectives */}
              {getVisibleObjectives(scenario)
                .filter(obj => !obj.isOptional)
                .map((objective) => (
                  <ObjectiveRow key={objective.id} objective={objective} />
                ))}

              {/* Optional Objectives */}
              {getVisibleObjectives(scenario)
                .filter(obj => obj.isOptional)
                .length > 0 && (
                <>
                  <div className="border-t border-border/50 my-2" />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">
                    <Star size={10} className="inline mr-1" />
                    Bonus Objectives
                  </p>
                  {getVisibleObjectives(scenario)
                    .filter(obj => obj.isOptional)
                    .map((objective) => (
                      <ObjectiveRow key={objective.id} objective={objective} isBonus />
                    ))}
                </>
              )}
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
