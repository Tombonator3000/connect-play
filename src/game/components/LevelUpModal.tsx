/**
 * LevelUpModal - Hero Level Up Selection
 *
 * Shows available level-up bonuses based on hero level:
 * - Always: +1 Attribute, +2 HP, +1 Sanity
 * - Level 2+: Skill Masteries
 * - Level 4+: Attack/Defense dice
 *
 * Also shows milestone bonuses earned at this level.
 */

import React, { useState } from 'react';
import {
  Sparkles, Sword, Shield, Heart, Brain,
  Zap, Eye, Target, Footprints, BookOpen,
  Star, Award, Check, ChevronUp
} from 'lucide-react';
import { LevelUpBonus, LegacyHero, SkillMasteryType, MilestoneBonus } from '../types';
import { getLevelUpOptions } from '../utils/legacyManager';
import { getMilestoneForLevel } from '../constants';

interface LevelUpModalProps {
  hero: LegacyHero;
  newLevel: number;
  onConfirm: (bonus: LevelUpBonus) => void;
  onCancel?: () => void;
}

// Get icon for bonus type
const getBonusIcon = (bonus: LevelUpBonus) => {
  switch (bonus.type) {
    case 'attribute':
      switch (bonus.attribute) {
        case 'strength': return Sword;
        case 'agility': return Footprints;
        case 'intellect': return BookOpen;
        case 'willpower': return Brain;
      }
      break;
    case 'maxHp': return Heart;
    case 'maxSanity': return Brain;
    case 'actionPoint': return Zap;
    case 'attackDie': return Target;
    case 'defenseDie': return Shield;
    case 'skillMastery':
      switch (bonus.skill) {
        case 'investigation': return Eye;
        case 'combat': return Sword;
        case 'occult': return Sparkles;
        case 'athletics': return Footprints;
      }
      break;
  }
  return Star;
};

// Get color for bonus type
const getBonusColor = (bonus: LevelUpBonus) => {
  switch (bonus.type) {
    case 'attribute':
      switch (bonus.attribute) {
        case 'strength': return 'text-red-400 border-red-600 bg-red-900/20';
        case 'agility': return 'text-green-400 border-green-600 bg-green-900/20';
        case 'intellect': return 'text-blue-400 border-blue-600 bg-blue-900/20';
        case 'willpower': return 'text-purple-400 border-purple-600 bg-purple-900/20';
      }
      break;
    case 'maxHp': return 'text-red-400 border-red-600 bg-red-900/20';
    case 'maxSanity': return 'text-purple-400 border-purple-600 bg-purple-900/20';
    case 'actionPoint': return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
    case 'attackDie': return 'text-orange-400 border-orange-600 bg-orange-900/20';
    case 'defenseDie': return 'text-cyan-400 border-cyan-600 bg-cyan-900/20';
    case 'skillMastery': return 'text-amber-400 border-amber-600 bg-amber-900/20';
  }
  return 'text-gray-400 border-gray-600 bg-gray-900/20';
};

// Get label for bonus
const getBonusLabel = (bonus: LevelUpBonus): string => {
  switch (bonus.type) {
    case 'attribute':
      const attrNames: Record<string, string> = {
        strength: 'Strength',
        agility: 'Agility',
        intellect: 'Intellect',
        willpower: 'Willpower'
      };
      return `+1 ${attrNames[bonus.attribute]}`;
    case 'maxHp': return '+2 Max HP';
    case 'maxSanity': return '+1 Max Sanity';
    case 'actionPoint': return '+1 Action Point';
    case 'attackDie': return '+1 Attack Die';
    case 'defenseDie': return '+1 Defense Die';
    case 'skillMastery':
      const skillNames: Record<SkillMasteryType, string> = {
        investigation: 'Investigation Mastery',
        combat: 'Combat Mastery',
        occult: 'Occult Mastery',
        athletics: 'Athletics Mastery'
      };
      return skillNames[bonus.skill];
  }
};

// Get description for bonus
const getBonusDescription = (bonus: LevelUpBonus): string => {
  switch (bonus.type) {
    case 'attribute':
      const attrDesc: Record<string, string> = {
        strength: 'Increases melee damage and carrying capacity',
        agility: 'Improves dodging, movement, and stealth',
        intellect: 'Better investigation and puzzle solving',
        willpower: 'Stronger horror resistance and spellcasting'
      };
      return attrDesc[bonus.attribute];
    case 'maxHp': return 'Increases your maximum health points';
    case 'maxSanity': return 'Increases your maximum sanity';
    case 'actionPoint': return 'Permanently gain +1 action per turn';
    case 'attackDie': return 'Roll an additional die when attacking';
    case 'defenseDie': return 'Roll an additional die when defending';
    case 'skillMastery':
      const skillDesc: Record<SkillMasteryType, string> = {
        investigation: '+1 die on all Investigation checks',
        combat: '+1 die on all attack rolls',
        occult: '+1 die on Willpower checks (horror, rituals)',
        athletics: '+1 die on Agility checks (traps, escape)'
      };
      return skillDesc[bonus.skill];
  }
};

// Filter out already chosen skill masteries
const filterAvailableOptions = (options: LevelUpBonus[], hero: LegacyHero): LevelUpBonus[] => {
  const heroMasteries = hero.skillMasteries || [];
  return options.filter(bonus => {
    if (bonus.type === 'skillMastery') {
      return !heroMasteries.includes(bonus.skill);
    }
    return true;
  });
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  hero,
  newLevel,
  onConfirm,
  onCancel
}) => {
  const [selectedBonus, setSelectedBonus] = useState<LevelUpBonus | null>(null);

  // Get available options for this level
  const allOptions = getLevelUpOptions(newLevel);
  const availableOptions = filterAvailableOptions(allOptions, hero);

  // Get milestone for this level (if any)
  const milestone = getMilestoneForLevel(newLevel);

  const handleConfirm = () => {
    if (selectedBonus) {
      onConfirm(selectedBonus);
    }
  };

  // Group options by category
  const attributeOptions = availableOptions.filter(b => b.type === 'attribute');
  const statOptions = availableOptions.filter(b => b.type === 'maxHp' || b.type === 'maxSanity');
  const combatOptions = availableOptions.filter(b => b.type === 'attackDie' || b.type === 'defenseDie');
  const masteryOptions = availableOptions.filter(b => b.type === 'skillMastery');

  const renderBonusCard = (bonus: LevelUpBonus, index: number) => {
    const Icon = getBonusIcon(bonus);
    const colorClass = getBonusColor(bonus);
    const isSelected = selectedBonus && JSON.stringify(selectedBonus) === JSON.stringify(bonus);
    const key = `${bonus.type}-${bonus.type === 'attribute' ? bonus.attribute : bonus.type === 'skillMastery' ? bonus.skill : index}`;

    return (
      <button
        key={key}
        onClick={() => setSelectedBonus(bonus)}
        className={`
          relative p-3 rounded-lg border-2 transition-all duration-200
          ${colorClass}
          ${isSelected
            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105'
            : 'hover:scale-102 hover:brightness-110'
          }
        `}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
            <Check size={12} className="text-gray-900" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-1">
          <Icon size={18} />
          <span className="font-semibold text-sm">{getBonusLabel(bonus)}</span>
        </div>
        <p className="text-xs opacity-75 text-left">{getBonusDescription(bonus)}</p>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-yellow-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-4 border-b border-yellow-700">
          <div className="flex items-center justify-center gap-3">
            <ChevronUp size={32} className="text-yellow-400" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-yellow-400">LEVEL UP!</h2>
              <p className="text-amber-300">{hero.name} reached Level {newLevel}</p>
            </div>
            <ChevronUp size={32} className="text-yellow-400" />
          </div>
        </div>

        {/* Milestone Bonus (if any) */}
        {milestone && (
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-b border-purple-700">
            <div className="flex items-center gap-3">
              <Award size={24} className="text-purple-400" />
              <div>
                <h3 className="text-purple-300 font-semibold">Milestone Unlocked: {milestone.name}</h3>
                <p className="text-purple-200 text-sm">{milestone.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-center text-gray-300 mb-4">
            Choose one bonus to enhance your hero:
          </p>

          {/* Attributes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              Attributes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {attributeOptions.map((bonus, i) => renderBonusCard(bonus, i))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              Vitality
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {statOptions.map((bonus, i) => renderBonusCard(bonus, i))}
            </div>
          </div>

          {/* Skill Masteries (level 2+) */}
          {masteryOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Skill Masteries <span className="text-amber-400">(Level 2+)</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {masteryOptions.map((bonus, i) => renderBonusCard(bonus, i))}
              </div>
            </div>
          )}

          {/* Combat Dice (level 4+) */}
          {combatOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Combat Mastery <span className="text-orange-400">(Level 4+)</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {combatOptions.map((bonus, i) => renderBonusCard(bonus, i))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleConfirm}
            disabled={!selectedBonus}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all
              ${selectedBonus
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedBonus ? 'Confirm Selection' : 'Select a Bonus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
