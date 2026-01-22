/**
 * CritChoiceModal - Critical Hit Bonus Selection
 *
 * When a player rolls a critical hit (all attack dice succeed AND more than defense),
 * they get to choose a bonus effect. This modal presents the available options.
 *
 * Critical Hit Bonuses:
 * - Ekstra Angrep: Get a free extra attack
 * - Helbredelse: Restore 1 HP
 * - Innsikt: Gain +1 Insight
 * - Mental Styrke: Restore 1 Sanity
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Sword, Heart, Lightbulb, Brain,
  Check, Zap, Trophy
} from 'lucide-react';
import { CriticalBonus, CriticalBonusType } from '../types';

interface CritChoiceModalProps {
  playerName: string;
  enemyName: string;
  damageDealt: number;
  availableBonuses: CriticalBonus[];
  onChoose: (bonusId: CriticalBonusType) => void;
}

// Get icon for bonus type
const getBonusIcon = (bonusId: CriticalBonusType) => {
  switch (bonusId) {
    case 'extra_attack': return Sword;
    case 'heal_hp': return Heart;
    case 'gain_insight': return Lightbulb;
    case 'recover_sanity': return Brain;
    default: return Sparkles;
  }
};

// Get color for bonus type
const getBonusColor = (bonusId: CriticalBonusType) => {
  switch (bonusId) {
    case 'extra_attack': return 'text-orange-400 border-orange-500 bg-orange-900/30 hover:bg-orange-800/40';
    case 'heal_hp': return 'text-red-400 border-red-500 bg-red-900/30 hover:bg-red-800/40';
    case 'gain_insight': return 'text-yellow-400 border-yellow-500 bg-yellow-900/30 hover:bg-yellow-800/40';
    case 'recover_sanity': return 'text-purple-400 border-purple-500 bg-purple-900/30 hover:bg-purple-800/40';
    default: return 'text-gray-400 border-gray-500 bg-gray-900/30';
  }
};

const CritChoiceModal: React.FC<CritChoiceModalProps> = ({
  playerName,
  enemyName,
  damageDealt,
  availableBonuses,
  onChoose
}) => {
  const [selectedBonus, setSelectedBonus] = useState<CriticalBonusType | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial animation effect
  useEffect(() => {
    timeoutRef.current = setTimeout(() => setIsAnimating(false), 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = (bonusId: CriticalBonusType) => {
    setSelectedBonus(bonusId);
  };

  const handleConfirm = () => {
    if (selectedBonus) {
      onChoose(selectedBonus);
    }
  };

  const renderBonusCard = (bonus: CriticalBonus) => {
    const Icon = getBonusIcon(bonus.id);
    const colorClass = getBonusColor(bonus.id);
    const isSelected = selectedBonus === bonus.id;

    return (
      <button
        key={bonus.id}
        onClick={() => handleSelect(bonus.id)}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200
          ${colorClass}
          ${isSelected
            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
            : 'hover:scale-102'
          }
        `}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 z-10">
            <Check size={12} className="text-gray-900" />
          </div>
        )}

        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-3xl">{bonus.icon}</div>
          <Icon size={28} className="opacity-80" />
          <h3 className="font-bold text-base">{bonus.name}</h3>
          <p className="text-xs opacity-75">{bonus.description}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div
        className={`
          bg-gradient-to-b from-amber-950 to-gray-900 border-2 border-yellow-600
          rounded-xl max-w-xl w-full shadow-[0_0_80px_rgba(251,191,36,0.4)]
          transition-all duration-500
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        {/* Header with animation */}
        <div className="bg-gradient-to-r from-yellow-900/80 via-amber-800/80 to-yellow-900/80 p-4 border-b border-yellow-700 relative overflow-hidden">
          {/* Sparkle effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60" />
            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-50 animation-delay-200" />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-200 rounded-full animate-ping opacity-40 animation-delay-400" />
          </div>

          <div className="flex items-center justify-center gap-3 relative z-10">
            <Trophy size={32} className="text-yellow-400 animate-bounce" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-yellow-300 tracking-wide">
                KRITISK TREFF!
              </h2>
              <p className="text-amber-200 text-sm">
                {playerName} knuste {enemyName} for {damageDealt} skade!
              </p>
            </div>
            <Trophy size={32} className="text-yellow-400 animate-bounce" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-300 mb-4">
            Velg din bonus:
          </p>

          {/* Bonus Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableBonuses.map(bonus => renderBonusCard(bonus))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedBonus}
            className={`
              px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2
              ${selectedBonus
                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white shadow-lg shadow-yellow-900/50'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Zap size={20} />
            {selectedBonus ? 'Claim Bonus!' : 'Velg en bonus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CritChoiceModal;
