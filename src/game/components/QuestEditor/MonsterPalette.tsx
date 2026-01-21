/**
 * MONSTER PALETTE
 *
 * Panel for placing monsters on tiles.
 * Shows all available monster types with their stats.
 */

import React, { useState } from 'react';
import { Skull, Heart, Swords, Shield, Plus, Minus, X, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { EnemyType } from '../../types';

// ============================================================================
// MONSTER DATA
// ============================================================================

export interface MonsterInfo {
  type: EnemyType;
  name: string;
  hp: number;
  attackDice: number;
  defenseDice: number;
  horror: number;
  category: 'minion' | 'warrior' | 'elite' | 'boss';
  traits: string[];
  description: string;
}

export const MONSTER_LIST: MonsterInfo[] = [
  // Minions
  { type: 'cultist', name: 'Cultist', hp: 2, attackDice: 1, defenseDice: 1, horror: 1, category: 'minion', traits: [], description: 'A brainwashed servant' },
  { type: 'mi-go', name: 'Mi-Go', hp: 3, attackDice: 1, defenseDice: 2, horror: 1, category: 'minion', traits: ['flying'], description: 'Fungoid crustacean' },
  { type: 'nightgaunt', name: 'Nightgaunt', hp: 3, attackDice: 1, defenseDice: 2, horror: 1, category: 'minion', traits: ['flying'], description: 'Faceless flyer' },
  { type: 'moon_beast', name: 'Moon-Beast', hp: 4, attackDice: 1, defenseDice: 2, horror: 2, category: 'minion', traits: ['ranged'], description: 'Sadistic torturer' },

  // Warriors
  { type: 'ghoul', name: 'Ghoul', hp: 3, attackDice: 2, defenseDice: 2, horror: 2, category: 'warrior', traits: ['scavenger'], description: 'Flesh-eating dweller' },
  { type: 'deepone', name: 'Deep One', hp: 3, attackDice: 2, defenseDice: 2, horror: 2, category: 'warrior', traits: ['aquatic'], description: 'Amphibious humanoid' },
  { type: 'sniper', name: 'Cultist Sniper', hp: 2, attackDice: 2, defenseDice: 1, horror: 1, category: 'warrior', traits: ['ranged'], description: 'Long-range threat' },
  { type: 'byakhee', name: 'Byakhee', hp: 3, attackDice: 2, defenseDice: 2, horror: 1, category: 'warrior', traits: ['flying', 'fast'], description: 'Interstellar steed' },
  { type: 'formless_spawn', name: 'Formless Spawn', hp: 5, attackDice: 2, defenseDice: 3, horror: 2, category: 'warrior', traits: ['regenerate'], description: 'Black ooze' },
  { type: 'hound', name: 'Hound of Tindalos', hp: 4, attackDice: 2, defenseDice: 2, horror: 3, category: 'warrior', traits: ['fast', 'ambusher'], description: 'Angle predator' },

  // Elites
  { type: 'priest', name: 'Dark Priest', hp: 5, attackDice: 2, defenseDice: 3, horror: 3, category: 'elite', traits: ['elite'], description: 'High-ranking cultist' },
  { type: 'hunting_horror', name: 'Hunting Horror', hp: 4, attackDice: 3, defenseDice: 2, horror: 3, category: 'elite', traits: ['fast', 'flying'], description: 'Viper of the void' },
  { type: 'dark_young', name: 'Dark Young', hp: 6, attackDice: 3, defenseDice: 3, horror: 3, category: 'elite', traits: ['massive'], description: 'Spawn of Shub-Niggurath' },

  // Bosses
  { type: 'shoggoth', name: 'Shoggoth', hp: 6, attackDice: 3, defenseDice: 4, horror: 4, category: 'boss', traits: ['massive', 'slow'], description: 'Protoplasmic nightmare' },
  { type: 'star_spawn', name: 'Star Spawn', hp: 8, attackDice: 4, defenseDice: 4, horror: 5, category: 'boss', traits: ['massive'], description: 'Kin of Cthulhu' },
];

const CATEGORY_COLORS = {
  minion: '#6b7280',
  warrior: '#f59e0b',
  elite: '#ef4444',
  boss: '#7c3aed',
};

const CATEGORY_LABELS = {
  minion: 'Minions',
  warrior: 'Warriors',
  elite: 'Elites',
  boss: 'Bosses',
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface MonsterPlacement {
  type: EnemyType;
  count: number;
}

interface MonsterPaletteProps {
  monsters: MonsterPlacement[];
  onMonstersChange: (monsters: MonsterPlacement[]) => void;
}

const MonsterPalette: React.FC<MonsterPaletteProps> = ({ monsters, onMonstersChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['minion', 'warrior'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const addMonster = (type: EnemyType) => {
    const existing = monsters.find(m => m.type === type);
    if (existing) {
      onMonstersChange(
        monsters.map(m => m.type === type ? { ...m, count: m.count + 1 } : m)
      );
    } else {
      onMonstersChange([...monsters, { type, count: 1 }]);
    }
  };

  const removeMonster = (type: EnemyType) => {
    const existing = monsters.find(m => m.type === type);
    if (existing && existing.count > 1) {
      onMonstersChange(
        monsters.map(m => m.type === type ? { ...m, count: m.count - 1 } : m)
      );
    } else {
      onMonstersChange(monsters.filter(m => m.type !== type));
    }
  };

  const clearAllMonsters = () => {
    onMonstersChange([]);
  };

  const getMonsterCount = (type: EnemyType): number => {
    return monsters.find(m => m.type === type)?.count || 0;
  };

  const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);

  const groupedMonsters = MONSTER_LIST.reduce((acc, monster) => {
    if (!acc[monster.category]) {
      acc[monster.category] = [];
    }
    acc[monster.category].push(monster);
    return acc;
  }, {} as Record<string, MonsterInfo[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <Skull className="w-4 h-4" />
          Monsters
        </h4>
        {totalMonsters > 0 && (
          <span className="text-amber-400 text-xs bg-amber-400/20 px-2 py-0.5 rounded">
            {totalMonsters} placed
          </span>
        )}
      </div>

      {/* Current monsters on tile */}
      {monsters.length > 0 && (
        <div className="bg-slate-700/50 rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">On this tile:</span>
            <button
              onClick={clearAllMonsters}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Clear
            </button>
          </div>
          {monsters.map(m => {
            const info = MONSTER_LIST.find(monster => monster.type === m.type);
            if (!info) return null;
            return (
              <div
                key={m.type}
                className="flex items-center justify-between bg-slate-600/50 rounded px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[info.category] }}
                  />
                  <span className="text-white text-xs">{info.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => removeMonster(m.type)}
                    className="w-5 h-5 bg-slate-500 hover:bg-red-600 rounded flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-white text-xs w-4 text-center">{m.count}</span>
                  <button
                    onClick={() => addMonster(m.type)}
                    className="w-5 h-5 bg-slate-500 hover:bg-green-600 rounded flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monster list by category */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {(['minion', 'warrior', 'elite', 'boss'] as const).map(category => {
          const categoryMonsters = groupedMonsters[category] || [];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="rounded overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-xs font-medium text-white flex-1">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-slate-400">{categoryMonsters.length}</span>
              </button>

              {isExpanded && (
                <div className="bg-slate-800/50 p-1 space-y-0.5">
                  {categoryMonsters.map(monster => {
                    const count = getMonsterCount(monster.type);
                    return (
                      <div
                        key={monster.type}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
                          ${count > 0 ? 'bg-amber-600/20 border border-amber-600/50' : 'hover:bg-slate-700/50'}
                        `}
                        onClick={() => addMonster(monster.type)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">
                            {monster.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5" />{monster.hp}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Swords className="w-2.5 h-2.5" />{monster.attackDice}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" />{monster.defenseDice}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Brain className="w-2.5 h-2.5" />{monster.horror}
                            </span>
                          </div>
                        </div>
                        {count > 0 && (
                          <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-600">
        Click monster to add to tile. Use +/- to adjust count.
      </div>
    </div>
  );
};

export default MonsterPalette;
