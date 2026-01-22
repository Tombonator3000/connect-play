/**
 * DeathPerkModal - Hero Death Perk Selection
 *
 * When a hero dies, the player can choose one death perk that provides
 * bonuses to future heroes. This implements the "Siste Ord" (Last Words)
 * system from the RPG-lite design.
 *
 * Death Perks:
 * - Hevn (Revenge): +1 damage against the enemy type that killed the hero
 * - Arv (Inheritance): Keep 1 item from the dead hero
 * - Visdom (Wisdom): +15 XP starting bonus
 * - Advarsler (Warnings): Start scenario with Doom +1
 */

import React, { useState } from 'react';
import {
  Skull, Sword, Gift, BookOpen, AlertTriangle,
  Check, X, Sparkles
} from 'lucide-react';
import { DeathPerk, DeathPerkType, Item, ActiveDeathPerk } from '../types';
import { DEATH_PERKS } from '../constants';

interface DeathPerkModalProps {
  deadHeroName: string;
  deadHeroId: string;
  killerEnemyType?: string;  // For revenge perk
  heroItems: Item[];         // For inheritance perk selection
  onConfirm: (perk: ActiveDeathPerk) => void;
  onSkip?: () => void;
}

// Get icon for perk type
const getPerkIcon = (perkId: DeathPerkType) => {
  switch (perkId) {
    case 'revenge': return Sword;
    case 'inheritance': return Gift;
    case 'wisdom': return BookOpen;
    case 'warnings': return AlertTriangle;
    default: return Sparkles;
  }
};

// Get color for perk type
const getPerkColor = (perkId: DeathPerkType) => {
  switch (perkId) {
    case 'revenge': return 'text-red-400 border-red-600 bg-red-900/30';
    case 'inheritance': return 'text-amber-400 border-amber-600 bg-amber-900/30';
    case 'wisdom': return 'text-blue-400 border-blue-600 bg-blue-900/30';
    case 'warnings': return 'text-purple-400 border-purple-600 bg-purple-900/30';
    default: return 'text-gray-400 border-gray-600 bg-gray-900/30';
  }
};

const DeathPerkModal: React.FC<DeathPerkModalProps> = ({
  deadHeroName,
  deadHeroId,
  killerEnemyType,
  heroItems,
  onConfirm,
  onSkip
}) => {
  const [selectedPerk, setSelectedPerk] = useState<DeathPerk | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemSelection, setShowItemSelection] = useState(false);

  // Filter items for inheritance (exclude quest items and special items)
  const inheritableItems = heroItems.filter(item =>
    !item.isQuestItem &&
    item.type !== 'quest_item' &&
    item.type !== 'clue'
  );

  const handlePerkSelect = (perk: DeathPerk) => {
    setSelectedPerk(perk);

    // If inheritance selected, show item selection
    if (perk.id === 'inheritance' && inheritableItems.length > 0) {
      setShowItemSelection(true);
      setSelectedItem(null);
    } else {
      setShowItemSelection(false);
      setSelectedItem(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedPerk) return;

    // Build the active death perk
    const activePerk: ActiveDeathPerk = {
      perkId: selectedPerk.id,
      sourceHeroName: deadHeroName,
      sourceHeroId: deadHeroId
    };

    // Add specific perk data
    if (selectedPerk.id === 'revenge' && killerEnemyType) {
      activePerk.targetEnemyType = killerEnemyType;
    }

    if (selectedPerk.id === 'inheritance' && selectedItem) {
      activePerk.inheritedItemId = selectedItem.id;
    }

    onConfirm(activePerk);
  };

  const canConfirm = () => {
    if (!selectedPerk) return false;
    if (selectedPerk.id === 'inheritance' && inheritableItems.length > 0 && !selectedItem) {
      return false;
    }
    return true;
  };

  const renderPerkCard = (perk: DeathPerk) => {
    const Icon = getPerkIcon(perk.id);
    const colorClass = getPerkColor(perk.id);
    const isSelected = selectedPerk?.id === perk.id;
    const isDisabled = perk.id === 'revenge' && !killerEnemyType;
    const isInheritanceDisabled = perk.id === 'inheritance' && inheritableItems.length === 0;

    return (
      <button
        key={perk.id}
        onClick={() => !isDisabled && !isInheritanceDisabled && handlePerkSelect(perk)}
        disabled={isDisabled || isInheritanceDisabled}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200
          ${colorClass}
          ${isSelected
            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105'
            : isDisabled || isInheritanceDisabled
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:scale-102 hover:brightness-110 cursor-pointer'
          }
        `}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
            <Check size={12} className="text-gray-900" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{perk.icon}</div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-lg">{perk.name}</h3>
            <p className="text-xs opacity-75">{perk.description}</p>
          </div>
          <Icon size={24} className="opacity-50" />
        </div>

        {/* Special info for specific perks */}
        {perk.id === 'revenge' && killerEnemyType && (
          <div className="text-xs mt-2 pt-2 border-t border-current/20 text-left">
            Fiende: <span className="font-bold capitalize">{killerEnemyType}</span>
          </div>
        )}
        {perk.id === 'revenge' && !killerEnemyType && (
          <div className="text-xs mt-2 pt-2 border-t border-current/20 text-left opacity-60">
            (Ingen fiende registrert)
          </div>
        )}
        {perk.id === 'inheritance' && (
          <div className="text-xs mt-2 pt-2 border-t border-current/20 text-left">
            {inheritableItems.length > 0
              ? `${inheritableItems.length} items tilgjengelig`
              : '(Ingen items å arve)'}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-red-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/70 to-gray-900 p-6 border-b border-red-800">
          <div className="flex items-center justify-center gap-4">
            <Skull size={40} className="text-red-500" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-400">SISTE ORD</h2>
              <p className="text-gray-300">{deadHeroName} har falt...</p>
            </div>
            <Skull size={40} className="text-red-500" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-400 mb-6">
            Velg hvilken arv {deadHeroName} etterlater til fremtidige helter:
          </p>

          {/* Perk Selection */}
          {!showItemSelection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEATH_PERKS.map(perk => renderPerkCard(perk))}
            </div>
          ) : (
            /* Item Selection for Inheritance */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setShowItemSelection(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-semibold text-amber-400">
                  Velg item å arve fra {deadHeroName}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {inheritableItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    onClick={() => setSelectedItem(item)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${selectedItem?.id === item.id
                        ? 'border-yellow-400 bg-yellow-900/30 ring-2 ring-yellow-400/50'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="font-semibold text-sm truncate">{item.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{item.type}</div>
                    {item.effect && (
                      <div className="text-xs text-green-400 mt-1 truncate">{item.effect}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              Hopp over (ingen bonus)
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleConfirm}
            disabled={!canConfirm()}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
              ${canConfirm()
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Sparkles size={18} />
            {canConfirm() ? 'Bekreft Arv' : 'Velg en perk'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeathPerkModal;
