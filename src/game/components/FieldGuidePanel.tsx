/**
 * FieldGuidePanel - Bestiary / Monster Encyclopedia
 *
 * Displays all monsters in the game. Players can only see details
 * of monsters they have encountered during gameplay.
 *
 * "Notes on the horrors I have witnessed..."
 */

import React, { useState, useMemo } from 'react';
import { X, HelpCircle, BookOpen, Skull, Heart, Swords, Shield, Eye, AlertTriangle } from 'lucide-react';
import { EnemyType, BestiaryEntry } from '../types';
import { BESTIARY } from '../constants';

interface FieldGuidePanelProps {
  encounteredEnemies: string[];  // Array of EnemyType strings that player has encountered
  onClose: () => void;
}

// Monster categories for organization
const MONSTER_CATEGORIES: { name: string; types: EnemyType[] }[] = [
  {
    name: 'Minions',
    types: ['cultist', 'mi-go', 'nightgaunt', 'moon_beast']
  },
  {
    name: 'Warriors',
    types: ['ghoul', 'deepone', 'sniper', 'byakhee', 'formless_spawn', 'hound']
  },
  {
    name: 'Elites',
    types: ['priest', 'hunting_horror', 'dark_young']
  },
  {
    name: 'Bosses',
    types: ['shoggoth', 'star_spawn', 'boss']
  }
];

// All enemy types in order for display
const ALL_ENEMY_TYPES: EnemyType[] = MONSTER_CATEGORIES.flatMap(cat => cat.types);

// Get category color based on threat level
const getCategoryColor = (type: EnemyType): string => {
  if (MONSTER_CATEGORIES[0].types.includes(type)) return 'border-stone-500 bg-stone-800/30';
  if (MONSTER_CATEGORIES[1].types.includes(type)) return 'border-amber-700 bg-amber-900/20';
  if (MONSTER_CATEGORIES[2].types.includes(type)) return 'border-red-700 bg-red-900/20';
  if (MONSTER_CATEGORIES[3].types.includes(type)) return 'border-purple-700 bg-purple-900/20';
  return 'border-stone-600 bg-stone-800/30';
};

// Get threat level text
const getThreatLevel = (type: EnemyType): { text: string; color: string } => {
  if (MONSTER_CATEGORIES[0].types.includes(type)) return { text: 'MINION', color: 'text-stone-400' };
  if (MONSTER_CATEGORIES[1].types.includes(type)) return { text: 'WARRIOR', color: 'text-amber-400' };
  if (MONSTER_CATEGORIES[2].types.includes(type)) return { text: 'ELITE', color: 'text-red-400' };
  if (MONSTER_CATEGORIES[3].types.includes(type)) return { text: 'BOSS', color: 'text-purple-400' };
  return { text: 'UNKNOWN', color: 'text-stone-500' };
};

export const FieldGuidePanel: React.FC<FieldGuidePanelProps> = ({
  encounteredEnemies,
  onClose
}) => {
  const [selectedMonster, setSelectedMonster] = useState<EnemyType | null>(null);

  // Check if a monster has been encountered
  const isDiscovered = (type: EnemyType): boolean => {
    return encounteredEnemies.includes(type);
  };

  // Get the selected monster's bestiary entry
  const selectedEntry = useMemo(() => {
    if (!selectedMonster) return null;
    return BESTIARY[selectedMonster];
  }, [selectedMonster]);

  // Count discovered monsters
  const discoveredCount = useMemo(() => {
    return ALL_ENEMY_TYPES.filter(type => isDiscovered(type)).length;
  }, [encounteredEnemies]);

  const renderMonsterCard = (type: EnemyType) => {
    const discovered = isDiscovered(type);
    const entry = BESTIARY[type];

    return (
      <button
        key={type}
        onClick={() => discovered && setSelectedMonster(type)}
        className={`
          relative aspect-square rounded-lg border-2 transition-all duration-200
          flex flex-col items-center justify-center p-2 text-center
          ${discovered
            ? `${getCategoryColor(type)} hover:scale-105 hover:shadow-lg cursor-pointer`
            : 'border-stone-700 bg-stone-900/50 cursor-not-allowed opacity-60'
          }
          ${selectedMonster === type ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-stone-900' : ''}
        `}
      >
        {discovered ? (
          <>
            {/* Monster icon/emoji placeholder */}
            <div className="text-2xl mb-1">
              {type === 'cultist' && '🗡️'}
              {type === 'mi-go' && '🦀'}
              {type === 'nightgaunt' && '🦇'}
              {type === 'moon_beast' && '🌙'}
              {type === 'ghoul' && '💀'}
              {type === 'deepone' && '🐟'}
              {type === 'sniper' && '🎯'}
              {type === 'byakhee' && '🦅'}
              {type === 'formless_spawn' && '🫧'}
              {type === 'hound' && '🐕'}
              {type === 'priest' && '📿'}
              {type === 'hunting_horror' && '🐍'}
              {type === 'dark_young' && '🌲'}
              {type === 'shoggoth' && '👁️'}
              {type === 'star_spawn' && '⭐'}
              {type === 'boss' && '👹'}
            </div>
            <span className="text-[10px] md:text-xs text-amber-200 font-bold uppercase tracking-wider line-clamp-1">
              {entry?.name || type}
            </span>
          </>
        ) : (
          <>
            <HelpCircle className="w-6 h-6 text-stone-600 mb-1" />
            <span className="text-[10px] md:text-xs text-stone-600 font-bold uppercase tracking-wider">
              Unknown
            </span>
          </>
        )}
      </button>
    );
  };

  const renderMonsterDetail = () => {
    if (!selectedMonster || !selectedEntry) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-stone-500">
          <BookOpen className="w-16 h-16 mb-4 opacity-50" />
          <span className="text-lg uppercase tracking-widest font-bold">Select an Entry</span>
        </div>
      );
    }

    const threat = getThreatLevel(selectedMonster);

    return (
      <div className="p-4 md:p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">
              {selectedMonster === 'cultist' && '🗡️'}
              {selectedMonster === 'mi-go' && '🦀'}
              {selectedMonster === 'nightgaunt' && '🦇'}
              {selectedMonster === 'moon_beast' && '🌙'}
              {selectedMonster === 'ghoul' && '💀'}
              {selectedMonster === 'deepone' && '🐟'}
              {selectedMonster === 'sniper' && '🎯'}
              {selectedMonster === 'byakhee' && '🦅'}
              {selectedMonster === 'formless_spawn' && '🫧'}
              {selectedMonster === 'hound' && '🐕'}
              {selectedMonster === 'priest' && '📿'}
              {selectedMonster === 'hunting_horror' && '🐍'}
              {selectedMonster === 'dark_young' && '🌲'}
              {selectedMonster === 'shoggoth' && '👁️'}
              {selectedMonster === 'star_spawn' && '⭐'}
              {selectedMonster === 'boss' && '👹'}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-amber-200">{selectedEntry.name}</h2>
              <span className={`text-xs font-bold uppercase tracking-widest ${threat.color}`}>
                {threat.text}
              </span>
            </div>
          </div>
          <p className="text-stone-300 italic text-sm border-l-2 border-amber-700 pl-3">
            "{selectedEntry.description}"
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">HP</span>
            </div>
            <span className="text-2xl font-bold text-stone-200">{selectedEntry.hp}</span>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Swords className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Attack</span>
            </div>
            <span className="text-2xl font-bold text-stone-200">{selectedEntry.attackDice}d6</span>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Defense</span>
            </div>
            <span className="text-2xl font-bold text-stone-200">{selectedEntry.defenseDice}d6</span>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Horror</span>
            </div>
            <span className="text-2xl font-bold text-stone-200">{selectedEntry.horror}</span>
          </div>
        </div>

        {/* Lore */}
        <div className="mb-6">
          <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Lore
          </h3>
          <p className="text-stone-400 text-sm leading-relaxed">
            {selectedEntry.lore}
          </p>
        </div>

        {/* Traits */}
        {selectedEntry.traits && selectedEntry.traits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedEntry.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-900/30 border border-amber-700 rounded-full text-xs text-amber-300 uppercase tracking-wider"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Defeat flavor */}
        {selectedEntry.defeatFlavor && (
          <div className="mt-6 pt-4 border-t border-stone-700">
            <h3 className="text-stone-500 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
              <Skull className="w-3 h-3" /> Upon Defeat
            </h3>
            <p className="text-stone-500 italic text-sm">
              "{selectedEntry.defeatFlavor}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="
          w-[95vw] max-w-4xl h-[85vh] max-h-[700px]
          bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950
          border-2 border-amber-800 rounded-xl shadow-2xl
          flex flex-col overflow-hidden
        "
      >
        {/* Header */}
        <div className="
          flex items-center justify-between px-4 py-3
          bg-gradient-to-r from-amber-900/50 via-stone-800/50 to-amber-900/50
          border-b border-amber-800
        ">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-amber-200 uppercase tracking-widest">
                Field Guide
              </h1>
              <p className="text-[10px] md:text-xs text-amber-600 italic">
                "Notes on the horrors I have witnessed..."
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-500 hidden md:block">
              Discovered: {discoveredCount}/{ALL_ENEMY_TYPES.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400 hover:text-stone-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Monster Grid (Left Panel) */}
          <div className="
            w-1/3 min-w-[180px] max-w-[280px]
            border-r border-amber-900/50
            overflow-y-auto p-3
            bg-stone-900/50
          ">
            <div className="grid grid-cols-2 gap-2">
              {ALL_ENEMY_TYPES.map(type => renderMonsterCard(type))}
            </div>
          </div>

          {/* Detail Panel (Right) */}
          <div className="flex-1 overflow-hidden bg-stone-950/50">
            {renderMonsterDetail()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-stone-900/80 border-t border-amber-900/50 flex justify-between items-center">
          <span className="text-[10px] text-stone-600 uppercase tracking-wider">
            Encounter monsters to unlock their entries
          </span>
          <span className="text-[10px] text-amber-700 font-bold md:hidden">
            {discoveredCount}/{ALL_ENEMY_TYPES.length} Discovered
          </span>
        </div>
      </div>
    </div>
  );
};

export default FieldGuidePanel;
