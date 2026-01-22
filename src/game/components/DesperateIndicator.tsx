/**
 * DesperateIndicator - Visual Display for Desperate Measures
 *
 * Shows active desperate bonuses when player's HP or Sanity is critically low.
 * These bonuses represent the "fight or flight" response of characters near death.
 *
 * Desperate Measures:
 * - Adrenalin (HP <= 2): +1 AP
 * - Siste Kamp (HP <= 1): +1 damage
 * - Overlevelsesinstinkt (HP <= 2): +1 defense die
 * - Galskaps Styrke (Sanity <= 1): +1 attack die, but auto-fail Willpower
 * - Desperat Fokus (HP = 1 AND Sanity = 1): +2 attack dice
 */

import React, { useMemo } from 'react';
import {
  Flame, Shield, Zap, Skull, Brain, Swords,
  AlertTriangle
} from 'lucide-react';
import { DesperateMeasure } from '../types';
import { getActiveDesperateMeasures, calculateDesperateBonuses } from '../constants';

interface DesperateIndicatorProps {
  hp: number;
  sanity: number;
  compact?: boolean;  // Compact mode for inline display
  className?: string;
}

// Get icon for measure type
const getMeasureIcon = (measureId: string) => {
  switch (measureId) {
    case 'adrenaline': return Zap;
    case 'last_stand': return Flame;
    case 'survival_instinct': return Shield;
    case 'madness_strength': return Skull;
    case 'desperate_focus': return Swords;
    default: return AlertTriangle;
  }
};

// Get color for measure type
const getMeasureColor = (measureId: string) => {
  switch (measureId) {
    case 'adrenaline': return 'text-yellow-400 bg-yellow-900/50 border-yellow-600';
    case 'last_stand': return 'text-orange-400 bg-orange-900/50 border-orange-600';
    case 'survival_instinct': return 'text-blue-400 bg-blue-900/50 border-blue-600';
    case 'madness_strength': return 'text-purple-400 bg-purple-900/50 border-purple-600';
    case 'desperate_focus': return 'text-red-400 bg-red-900/50 border-red-600';
    default: return 'text-gray-400 bg-gray-900/50 border-gray-600';
  }
};

const DesperateIndicator: React.FC<DesperateIndicatorProps> = ({
  hp,
  sanity,
  compact = false,
  className = ''
}) => {
  // Get active measures and bonuses
  const activeMeasures = useMemo(() => getActiveDesperateMeasures(hp, sanity), [hp, sanity]);
  const bonuses = useMemo(() => calculateDesperateBonuses(hp, sanity), [hp, sanity]);

  // If no measures active, don't render anything
  if (activeMeasures.length === 0) return null;

  // Check if any meaningful bonuses are active
  const hasActiveBonuses = bonuses.bonusAP > 0 ||
    bonuses.bonusAttackDice > 0 ||
    bonuses.bonusDefenseDice > 0 ||
    bonuses.bonusDamage > 0;

  if (!hasActiveBonuses && bonuses.autoFailSkills.length === 0) return null;

  // Compact mode - single line with icons
  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <AlertTriangle size={12} className="text-red-500 animate-pulse" />
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
          Desperat
        </span>
        <div className="flex items-center gap-0.5">
          {bonuses.bonusAP > 0 && (
            <span className="text-[9px] px-1 py-0.5 bg-yellow-900/50 rounded text-yellow-400 font-bold">
              +{bonuses.bonusAP} AP
            </span>
          )}
          {bonuses.bonusAttackDice > 0 && (
            <span className="text-[9px] px-1 py-0.5 bg-orange-900/50 rounded text-orange-400 font-bold">
              +{bonuses.bonusAttackDice} Angrep
            </span>
          )}
          {bonuses.bonusDefenseDice > 0 && (
            <span className="text-[9px] px-1 py-0.5 bg-blue-900/50 rounded text-blue-400 font-bold">
              +{bonuses.bonusDefenseDice} Forsvar
            </span>
          )}
          {bonuses.bonusDamage > 0 && (
            <span className="text-[9px] px-1 py-0.5 bg-red-900/50 rounded text-red-400 font-bold">
              +{bonuses.bonusDamage} Skade
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full mode - detailed display
  return (
    <div className={`bg-gradient-to-r from-red-950/80 to-gray-900/80 rounded-lg border border-red-800 p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-800/50">
        <AlertTriangle size={16} className="text-red-500 animate-pulse" />
        <span className="text-sm font-bold text-red-400 uppercase tracking-wide">
          Desperasjon Aktiv
        </span>
      </div>

      {/* Active Measures */}
      <div className="space-y-2">
        {activeMeasures.map(measure => {
          const Icon = getMeasureIcon(measure.id);
          const colorClass = getMeasureColor(measure.id);

          return (
            <div
              key={measure.id}
              className={`flex items-center gap-2 p-2 rounded border ${colorClass}`}
            >
              <Icon size={16} />
              <div className="flex-1">
                <div className="text-xs font-semibold">{measure.name}</div>
                <div className="text-[10px] opacity-75">{measure.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {bonuses.autoFailSkills.length > 0 && (
        <div className="mt-2 pt-2 border-t border-red-800/50">
          <div className="flex items-center gap-1 text-xs text-red-400">
            <Brain size={12} />
            <span>Auto-fail: {bonuses.autoFailSkills.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-red-800/50 flex flex-wrap gap-2">
        {bonuses.bonusAP > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <Zap size={12} />
            <span>+{bonuses.bonusAP} AP</span>
          </div>
        )}
        {bonuses.bonusAttackDice > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-400">
            <Flame size={12} />
            <span>+{bonuses.bonusAttackDice} Angrep</span>
          </div>
        )}
        {bonuses.bonusDefenseDice > 0 && (
          <div className="flex items-center gap-1 text-xs text-blue-400">
            <Shield size={12} />
            <span>+{bonuses.bonusDefenseDice} Forsvar</span>
          </div>
        )}
        {bonuses.bonusDamage > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <Swords size={12} />
            <span>+{bonuses.bonusDamage} Skade</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesperateIndicator;
