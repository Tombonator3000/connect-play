/**
 * SpellSelectionModal - Occultist Spell Selection for Scenarios
 *
 * Based on REGELBOK.MD:
 * "Ritual Master: Velger 3 spells for hvert scenario"
 *
 * Occultist selects 3 spells from the 5 available before each scenario.
 */

import React, { useState } from 'react';
import {
  Sparkles, Zap, Shield, Eye, Skull,
  Brain, Check, X, AlertCircle
} from 'lucide-react';
import { OccultistSpell } from '../types';

interface SpellSelectionModalProps {
  availableSpells: OccultistSpell[];
  maxSelections: number;
  onConfirm: (selectedSpells: OccultistSpell[]) => void;
  onCancel?: () => void;
  heroName?: string;
}

// Get icon based on spell effect type
const getSpellIcon = (spell: OccultistSpell) => {
  switch (spell.effect) {
    case 'attack':
      return Zap;
    case 'attack_horror':
      return Skull;
    case 'banish':
      return Sparkles;
    case 'defense':
      return Shield;
    case 'utility':
      return Eye;
    default:
      return Sparkles;
  }
};

// Get effect type color
const getEffectColor = (effect: OccultistSpell['effect']) => {
  switch (effect) {
    case 'attack':
      return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
    case 'attack_horror':
      return 'text-purple-400 border-purple-600 bg-purple-900/20';
    case 'banish':
      return 'text-red-400 border-red-600 bg-red-900/20';
    case 'defense':
      return 'text-blue-400 border-blue-600 bg-blue-900/20';
    case 'utility':
      return 'text-cyan-400 border-cyan-600 bg-cyan-900/20';
    default:
      return 'text-gray-400 border-gray-600 bg-gray-900/20';
  }
};

// Get effect label
const getEffectLabel = (effect: OccultistSpell['effect']) => {
  switch (effect) {
    case 'attack':
      return 'Attack';
    case 'attack_horror':
      return 'Psy Attack';
    case 'banish':
      return 'Banish';
    case 'defense':
      return 'Defense';
    case 'utility':
      return 'Utility';
    default:
      return 'Unknown';
  }
};

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  availableSpells,
  maxSelections,
  onConfirm,
  onCancel,
  heroName = 'The Occultist'
}) => {
  const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());

  const toggleSpell = (spellId: string) => {
    setSelectedSpellIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spellId)) {
        newSet.delete(spellId);
      } else if (newSet.size < maxSelections) {
        newSet.add(spellId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedSpells = availableSpells
      .filter(spell => selectedSpellIds.has(spell.id))
      .map(spell => ({
        ...spell,
        currentUses: spell.usesPerScenario // Initialize current uses
      }));
    onConfirm(selectedSpells);
  };

  const canConfirm = selectedSpellIds.size === maxSelections;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#16213e] border-2 border-purple-500 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.4)] max-w-2xl w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#0a0a1a] p-4 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-400" size={28} />
              <div>
                <h2 className="text-xl font-display text-purple-100 uppercase tracking-widest">
                  Select Spells
                </h2>
                <p className="text-purple-400/70 text-xs">
                  {heroName} prepares for the ritual
                </p>
              </div>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-sm font-bold
              ${canConfirm ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'}
            `}>
              {selectedSpellIds.size} / {maxSelections}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-purple-900/20 border-b border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-300/80 text-sm">
            <AlertCircle size={16} className="text-purple-400" />
            <span>Choose {maxSelections} spells to prepare for this scenario. Choose wisely - these are your only magical tools.</span>
          </div>
        </div>

        {/* Spell Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-3">
            {availableSpells.map(spell => {
              const isSelected = selectedSpellIds.has(spell.id);
              const Icon = getSpellIcon(spell);
              const effectColor = getEffectColor(spell.effect);

              return (
                <button
                  key={spell.id}
                  onClick={() => toggleSpell(spell.id)}
                  disabled={!isSelected && selectedSpellIds.size >= maxSelections}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${isSelected
                      ? 'border-purple-400 bg-purple-900/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'border-purple-900/50 bg-[#0a0a1a] hover:border-purple-700'
                    }
                    ${!isSelected && selectedSpellIds.size >= maxSelections ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  {/* Selection indicator */}
                  <div className={`
                    absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isSelected
                      ? 'bg-purple-500 border-purple-300'
                      : 'border-purple-700 bg-[#0a0a1a]'
                    }
                  `}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-14 h-14 rounded-lg border-2 flex items-center justify-center
                      ${effectColor}
                    `}>
                      <Icon size={28} />
                    </div>

                    {/* Content */}
                    <div className="flex-grow pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{spell.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${effectColor}`}>
                          {getEffectLabel(spell.effect)}
                        </span>
                      </div>
                      <p className="text-purple-300/70 text-sm mb-2">{spell.description}</p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {spell.attackDice > 0 && (
                          <span className="text-yellow-400">
                            <Zap size={12} className="inline mr-1" />
                            {spell.attackDice} Attack Dice
                          </span>
                        )}
                        {spell.useWillpower && (
                          <span className="text-purple-400">
                            <Brain size={12} className="inline mr-1" />
                            Uses Willpower
                          </span>
                        )}
                        {spell.defenseBonus && (
                          <span className="text-blue-400">
                            <Shield size={12} className="inline mr-1" />
                            +{spell.defenseBonus} Defense
                          </span>
                        )}
                        {spell.horrorDamage && (
                          <span className="text-purple-400">
                            <Skull size={12} className="inline mr-1" />
                            +{spell.horrorDamage} Horror
                          </span>
                        )}
                        <span className="text-gray-400">
                          Range: {spell.range === 0 ? 'Self' : spell.range}
                        </span>
                        <span className={spell.usesPerScenario === -1 ? 'text-green-400' : 'text-amber-400'}>
                          Uses: {spell.usesPerScenario === -1 ? '∞ (1/round)' : spell.usesPerScenario}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0a1a] border-t border-purple-500/30 flex justify-between items-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`
              px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2
              ${canConfirm
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Sparkles size={18} />
            {canConfirm ? 'Prepare Spells' : `Select ${maxSelections - selectedSpellIds.size} more`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellSelectionModal;
