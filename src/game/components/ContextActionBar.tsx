/**
 * Context Action Bar Component
 *
 * Displays available actions when player clicks on an obstacle, door, or object.
 * Shows skill check requirements and action costs.
 */

import React from 'react';
import {
  Sword, Search, Zap, ShieldCheck, Key, Lock, Hammer, X, Eye,
  BookOpen, Sparkles, Lightbulb, Package, CircleDot
} from 'lucide-react';
import { ContextAction, ContextActionIconType } from '../types';

interface ContextActionBarProps {
  actions: ContextAction[];
  onActionSelect: (action: ContextAction) => void;
  targetName: string;
  playerActions: number;
}

const ContextActionBar: React.FC<ContextActionBarProps> = ({
  actions,
  onActionSelect,
  targetName,
  playerActions
}) => {
  if (actions.length === 0) return null;

  const getIcon = (iconType: ContextActionIconType) => {
    switch (iconType) {
      case 'strength':
        return <Sword size={18} />;
      case 'agility':
        return <Zap size={18} />;
      case 'intellect':
        return <Eye size={18} />;
      case 'willpower':
        return <Sparkles size={18} />;
      case 'key':
        return <Key size={18} />;
      case 'lockpick':
        return <Lock size={18} />;
      case 'force':
        return <Hammer size={18} />;
      case 'search':
        return <Search size={18} />;
      case 'interact':
        return <CircleDot size={18} />;
      case 'read':
        return <BookOpen size={18} />;
      case 'ritual':
        return <Sparkles size={18} />;
      case 'cancel':
        return <X size={18} />;
      case 'light':
        return <Lightbulb size={18} />;
      case 'item':
        return <Package size={18} />;
      default:
        return <CircleDot size={18} />;
    }
  };

  const getSkillColor = (iconType: ContextActionIconType) => {
    switch (iconType) {
      case 'strength':
        return 'text-red-400 border-red-400/50';
      case 'agility':
        return 'text-green-400 border-green-400/50';
      case 'intellect':
        return 'text-blue-400 border-blue-400/50';
      case 'willpower':
        return 'text-purple-400 border-purple-400/50';
      case 'key':
      case 'item':
        return 'text-yellow-400 border-yellow-400/50';
      case 'cancel':
        return 'text-gray-400 border-gray-400/50';
      default:
        return 'text-parchment border-parchment/50';
    }
  };

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
      <div className="bg-leather/95 border-2 border-primary rounded-2xl p-4 shadow-[var(--shadow-doom)] backdrop-blur-md min-w-[400px] max-w-[600px]">
        {/* Header */}
        <div className="text-center mb-3 pb-2 border-b border-border">
          <h3 className="text-xs font-bold text-parchment uppercase tracking-[0.2em]">
            {targetName}
          </h3>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const canAfford = playerActions >= action.apCost;
            const isEnabled = action.enabled && canAfford;
            const isCancel = action.id === 'cancel';

            return (
              <button
                key={action.id}
                onClick={() => isEnabled && onActionSelect(action)}
                disabled={!isEnabled}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                  ${isCancel
                    ? 'col-span-2 bg-background/40 border-border hover:border-muted-foreground'
                    : isEnabled
                      ? `bg-background/60 ${getSkillColor(action.icon)} hover:bg-background hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]`
                      : 'bg-background/20 border-border/30 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg bg-card ${getSkillColor(action.icon)}`}>
                  {getIcon(action.icon)}
                </div>

                {/* Label and Info */}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-parchment">
                    {action.label}
                  </div>
                  {action.reason && !isEnabled && (
                    <div className="text-[10px] text-muted-foreground italic">
                      {action.reason}
                    </div>
                  )}
                  {action.skillCheck && (
                    <div className="text-[10px] text-muted-foreground">
                      Skill Check: DC {action.skillCheck.dc}
                    </div>
                  )}
                </div>

                {/* AP Cost */}
                {!isCancel && action.apCost > 0 && (
                  <div className={`text-xs font-bold px-2 py-1 rounded ${canAfford ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'}`}>
                    {action.apCost} AP
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContextActionBar;
