/**
 * SurvivorTraitModal - Permadeath Hero Survivor Trait Selection
 *
 * Shown when a permadeath hero survives enough scenarios to unlock traits:
 * - Tier 1 (3 scenarios): Scarred Survivor, Paranoid Vigilance, Death's Defiance
 * - Tier 2 (6 scenarios): Hardened Mind, Battle-Tested, Sixth Sense
 */

import React, { useState } from 'react';
import {
  Skull, Shield, Eye, Brain, Sword, Sparkles,
  Heart, AlertTriangle, Check, Trophy, Star
} from 'lucide-react';
import { SurvivorTrait, LegacyHero } from '../types';
import { SURVIVOR_TRAITS_TIER1, SURVIVOR_TRAITS_TIER2, getSurvivorStreakBonus } from '../constants';

interface SurvivorTraitModalProps {
  hero: LegacyHero;
  availableTraits: SurvivorTrait[];
  onConfirm: (trait: SurvivorTrait) => void;
  onSkip?: () => void;
}

// Get icon for trait
const getTraitIcon = (traitId: string) => {
  switch (traitId) {
    case 'scarred_survivor': return Heart;
    case 'paranoid_vigilance': return Eye;
    case 'deaths_defiance': return Skull;
    case 'hardened_mind': return Brain;
    case 'battle_tested': return Sword;
    case 'sixth_sense': return Sparkles;
    default: return Star;
  }
};

// Get color for trait
const getTraitColor = (traitId: string) => {
  switch (traitId) {
    case 'scarred_survivor': return 'text-red-400 border-red-600 bg-red-900/20';
    case 'paranoid_vigilance': return 'text-cyan-400 border-cyan-600 bg-cyan-900/20';
    case 'deaths_defiance': return 'text-purple-400 border-purple-600 bg-purple-900/20';
    case 'hardened_mind': return 'text-blue-400 border-blue-600 bg-blue-900/20';
    case 'battle_tested': return 'text-orange-400 border-orange-600 bg-orange-900/20';
    case 'sixth_sense': return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
    default: return 'text-gray-400 border-gray-600 bg-gray-900/20';
  }
};

// Get tier for trait
const getTraitTier = (traitId: string): number => {
  if (SURVIVOR_TRAITS_TIER1.some(t => t.id === traitId)) return 1;
  if (SURVIVOR_TRAITS_TIER2.some(t => t.id === traitId)) return 2;
  return 0;
};

const SurvivorTraitModal: React.FC<SurvivorTraitModalProps> = ({
  hero,
  availableTraits,
  onConfirm,
  onSkip
}) => {
  const [selectedTrait, setSelectedTrait] = useState<SurvivorTrait | null>(null);

  const scenariosSurvived = hero.scenariosSurvivedStreak || 0;
  const streakBonus = getSurvivorStreakBonus(scenariosSurvived);
  const chosenTraits = hero.survivorTraits || [];

  const handleConfirm = () => {
    if (selectedTrait) {
      onConfirm(selectedTrait);
    }
  };

  // Split traits by tier
  const tier1Traits = availableTraits.filter(t => getTraitTier(t.id) === 1);
  const tier2Traits = availableTraits.filter(t => getTraitTier(t.id) === 2);

  const renderTraitCard = (trait: SurvivorTrait) => {
    const Icon = getTraitIcon(trait.id);
    const colorClass = getTraitColor(trait.id);
    const isSelected = selectedTrait?.id === trait.id;
    const alreadyChosen = chosenTraits.includes(trait.id);
    const tier = getTraitTier(trait.id);

    if (alreadyChosen) return null;

    return (
      <button
        key={trait.id}
        onClick={() => setSelectedTrait(trait)}
        disabled={alreadyChosen}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200 text-left
          ${colorClass}
          ${isSelected
            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105'
            : 'hover:scale-102 hover:brightness-110'
          }
          ${alreadyChosen ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
            <Check size={12} className="text-gray-900" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-black/30">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold">{trait.name}</h3>
            <span className="text-xs opacity-60">Tier {tier} • {trait.requirement} scenarios</span>
          </div>
        </div>

        <p className="text-sm opacity-80">{trait.description}</p>

        {alreadyChosen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <span className="text-green-400 font-semibold flex items-center gap-2">
              <Check size={16} /> Already Chosen
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-purple-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 border-b border-purple-700">
          <div className="flex items-center justify-center gap-3">
            <Trophy size={32} className="text-purple-400" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-400">SURVIVOR TRAIT</h2>
              <p className="text-purple-300">{hero.name} has survived {scenariosSurvived} scenarios!</p>
            </div>
            <Trophy size={32} className="text-purple-400" />
          </div>
        </div>

        {/* Streak Bonus Info */}
        <div className="p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-b border-amber-700">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              <span className="text-yellow-300">
                XP Bonus: +{Math.round((streakBonus.xpMultiplier - 1) * 100)}%
              </span>
            </div>
            {streakBonus.goldMultiplier > 1 && (
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-400" />
                <span className="text-amber-300">
                  Gold Bonus: +{Math.round((streakBonus.goldMultiplier - 1) * 100)}%
                </span>
              </div>
            )}
            {streakBonus.title && (
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-purple-400" />
                <span className="text-purple-300">Title: {streakBonus.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Already Chosen Traits */}
        {chosenTraits.length > 0 && (
          <div className="p-3 bg-gray-800/50 border-b border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Previously chosen traits:</p>
            <div className="flex flex-wrap gap-2">
              {chosenTraits.map(traitId => {
                const trait = [...SURVIVOR_TRAITS_TIER1, ...SURVIVOR_TRAITS_TIER2].find(t => t.id === traitId);
                if (!trait) return null;
                const Icon = getTraitIcon(traitId);
                return (
                  <div key={traitId} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-sm">
                    <Icon size={14} className="text-green-400" />
                    <span className="text-gray-300">{trait.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning for Permadeath */}
        <div className="p-3 bg-red-900/20 border-b border-red-800 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400" />
          <p className="text-red-300 text-sm">
            Permadeath hero - these traits are permanent rewards for survival!
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-center text-gray-300 mb-4">
            Choose one trait to reward your survival:
          </p>

          {/* Tier 1 Traits */}
          {tier1Traits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Shield size={14} />
                Tier 1 Traits <span className="text-purple-400">(3+ scenarios)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tier1Traits.map(trait => renderTraitCard(trait))}
              </div>
            </div>
          )}

          {/* Tier 2 Traits */}
          {tier2Traits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Skull size={14} />
                Tier 2 Traits <span className="text-orange-400">(6+ scenarios)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tier2Traits.map(trait => renderTraitCard(trait))}
              </div>
            </div>
          )}

          {availableTraits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No new traits available yet.</p>
              <p className="text-sm mt-2">Survive more scenarios to unlock traits!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Skip for Now
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleConfirm}
            disabled={!selectedTrait}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all
              ${selectedTrait
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedTrait ? 'Claim Trait' : 'Select a Trait'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurvivorTraitModal;
