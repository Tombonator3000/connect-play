/**
 * HeroArchivePanel - UI for managing persistent heroes
 *
 * Features:
 * - View all living heroes
 * - Create new heroes
 * - Select heroes for scenarios
 * - View hero details (stats, level, equipment)
 * - Memorial for dead heroes
 */

import React, { useState, useMemo } from 'react';
import {
  LegacyData,
  LegacyHero,
  CharacterType,
  CharacterAttributes,
  LevelUpBonus,
  getEffectiveAttributes,
  canLevelUp,
  XP_THRESHOLDS
} from '../types';
import {
  createLegacyHero,
  getLivingHeroes,
  getDeadHeroes,
  getXPProgress,
  getLevelUpOptions,
  applyLevelUpBonus,
  getAllEquippedItems
} from '../utils/legacyManager';
import { CHARACTERS } from '../constants';

interface HeroArchivePanelProps {
  legacyData: LegacyData;
  onSelectHero: (hero: LegacyHero) => void;
  onCreateHero: (hero: LegacyHero) => void;
  onUpdateHero: (hero: LegacyHero) => void;
  onBack: () => void;
  onStartNewGame?: () => void;
  maxHeroesSelectable: number;
  selectedHeroIds: string[];
}

type ViewMode = 'list' | 'create' | 'detail' | 'memorial' | 'levelup';

export const HeroArchivePanel: React.FC<HeroArchivePanelProps> = ({
  legacyData,
  onSelectHero,
  onCreateHero,
  onUpdateHero,
  onBack,
  onStartNewGame,
  maxHeroesSelectable,
  selectedHeroIds
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedHero, setSelectedHero] = useState<LegacyHero | null>(null);

  // Create hero form state
  const [newHeroName, setNewHeroName] = useState('');
  const [newHeroClass, setNewHeroClass] = useState<CharacterType>('detective');
  const [newHeroPortrait, setNewHeroPortrait] = useState(0);
  const [newHeroPermadeath, setNewHeroPermadeath] = useState(false);

  const livingHeroes = useMemo(() => getLivingHeroes(legacyData), [legacyData]);
  const deadHeroes = useMemo(() => getDeadHeroes(legacyData), [legacyData]);

  const handleCreateHero = () => {
    if (!newHeroName.trim()) return;

    const hero = createLegacyHero(newHeroName.trim(), newHeroClass, newHeroPortrait, newHeroPermadeath);
    onCreateHero(hero);
    setNewHeroName('');
    setNewHeroPermadeath(false);
    setViewMode('list');
  };

  const handleSelectHero = (hero: LegacyHero) => {
    // Allow toggling selection - onSelectHero handles both select and deselect
    if (selectedHeroIds.includes(hero.id)) {
      // Deselect - call onSelectHero which toggles in ShadowsGame
      onSelectHero(hero);
      return;
    }
    if (selectedHeroIds.length >= maxHeroesSelectable) return; // Max reached
    onSelectHero(hero);
  };

  const handleViewDetail = (hero: LegacyHero) => {
    setSelectedHero(hero);
    setViewMode('detail');
  };

  const handleLevelUp = (hero: LegacyHero, bonus: LevelUpBonus) => {
    const updatedHero = applyLevelUpBonus(hero, bonus);
    onUpdateHero(updatedHero);
    setSelectedHero(updatedHero);
    setViewMode('detail');
  };

  const renderAttributeBar = (value: number, max: number = 5, color: string) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i < value ? color : 'bg-stone-700'}`}
        />
      ))}
    </div>
  );

  const renderHeroCard = (hero: LegacyHero, isSelected: boolean) => {
    const effectiveAttrs = getEffectiveAttributes(hero);
    const xpProgress = getXPProgress(hero);
    const equipment = getAllEquippedItems(hero.equipment);
    const needsLevelUp = canLevelUp(hero);

    return (
      <div
        key={hero.id}
        className={`
          relative p-4 rounded-lg border-2 transition-all cursor-pointer
          ${isSelected
            ? 'border-amber-500 bg-amber-900/30'
            : 'border-stone-600 bg-stone-800/50 hover:border-stone-500'
          }
          ${needsLevelUp ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-stone-900' : ''}
        `}
        onClick={() => handleViewDetail(hero)}
      >
        {/* Level badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-700 border-2 border-amber-500 flex items-center justify-center">
          <span className="text-sm font-bold text-amber-100">{hero.level}</span>
        </div>

        {/* Level up indicator */}
        {needsLevelUp && (
          <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-bold rounded animate-pulse">
            LEVEL UP!
          </div>
        )}

        {/* Permadeath indicator */}
        {hero.hasPermadeath && (
          <div className="absolute top-2 right-10 px-1.5 py-0.5 bg-red-900/80 border border-red-600 text-red-300 text-xs font-bold rounded" title="This hero has permadeath enabled">
            PERMADEATH
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-stone-700 border-2 border-stone-500 flex items-center justify-center">
            <span className="text-2xl">
              {hero.characterClass === 'detective' && '🔍'}
              {hero.characterClass === 'professor' && '📚'}
              {hero.characterClass === 'veteran' && '⚔️'}
              {hero.characterClass === 'occultist' && '🔮'}
              {hero.characterClass === 'journalist' && '📰'}
              {hero.characterClass === 'doctor' && '💉'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-amber-200">{hero.name}</h3>
            <p className="text-sm text-stone-400 capitalize">{hero.characterClass}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-2">
            <span className="text-red-400">HP:</span>
            <span className="text-stone-300">{hero.maxHp}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">SAN:</span>
            <span className="text-stone-300">{hero.maxSanity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">Gold:</span>
            <span className="text-stone-300">{hero.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">Items:</span>
            <span className="text-stone-300">{equipment.length}/7</span>
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-400 mb-1">
            <span>XP</span>
            <span>{hero.level < 5 ? `${xpProgress.current}/${xpProgress.needed}` : 'MAX'}</span>
          </div>
          <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
        </div>

        {/* Attributes mini */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-red-400 w-8">STR</span>
            {renderAttributeBar(effectiveAttrs.strength, 5, 'bg-red-500')}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-400 w-8">AGI</span>
            {renderAttributeBar(effectiveAttrs.agility, 5, 'bg-green-500')}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400 w-8">INT</span>
            {renderAttributeBar(effectiveAttrs.intellect, 5, 'bg-blue-500')}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-400 w-8">WIL</span>
            {renderAttributeBar(effectiveAttrs.willpower, 5, 'bg-purple-500')}
          </div>
        </div>

        {/* Selection button */}
        {!isSelected && selectedHeroIds.length < maxHeroesSelectable && (
          <button
            className="mt-3 w-full py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectHero(hero);
            }}
          >
            Select for Mission
          </button>
        )}
        {isSelected && (
          <button
            className="mt-3 w-full py-2 text-center text-amber-400 border border-amber-500 rounded hover:bg-amber-900/50 hover:text-amber-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectHero(hero);
            }}
          >
            ✓ Selected (click to remove)
          </button>
        )}
      </div>
    );
  };

  const renderDeadHeroCard = (hero: LegacyHero) => {
    const effectiveAttrs = getEffectiveAttributes(hero);

    return (
      <div
        key={hero.id}
        className={`p-4 rounded-lg border-2 ${hero.hasPermadeath ? 'border-red-900/50 bg-red-950/30' : 'border-stone-700 bg-stone-900/50'} opacity-70`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center grayscale">
            <span className="text-xl">💀</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-400 line-through">{hero.name}</h3>
            <p className="text-sm text-stone-500 capitalize">{hero.characterClass}</p>
          </div>
          {hero.hasPermadeath && (
            <div className="px-2 py-0.5 bg-red-900/60 border border-red-700 text-red-400 text-xs font-bold rounded">
              PERMADEATH
            </div>
          )}
        </div>
        <div className="text-xs text-stone-500">
          <p>Level {hero.level} - {hero.totalKills} kills</p>
          <p className="italic mt-1">"{hero.deathCause || 'Lost to the darkness'}"</p>
          {hero.deathScenario && (
            <p className="text-stone-600">Scenario: {hero.deathScenario}</p>
          )}
        </div>
      </div>
    );
  };

  const renderHeroList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-200">Hero Archive</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded transition-colors"
            onClick={() => setViewMode('memorial')}
          >
            Memorial ({deadHeroes.length})
          </button>
          <button
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded transition-colors"
            onClick={() => setViewMode('create')}
          >
            + New Hero
          </button>
        </div>
      </div>

      {/* Living heroes grid */}
      {livingHeroes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {livingHeroes.map(hero => renderHeroCard(hero, selectedHeroIds.includes(hero.id)))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-500">
          <p className="text-lg mb-4">No heroes yet. Create your first investigator!</p>
          <button
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors"
            onClick={() => setViewMode('create')}
          >
            Create Hero
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          className="px-6 py-2 bg-stone-700 hover:bg-stone-600 rounded transition-colors"
          onClick={onBack}
        >
          Back to Menu
        </button>
        {selectedHeroIds.length > 0 && onStartNewGame && (
          <button
            className="px-8 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded transition-colors font-bold"
            onClick={onStartNewGame}
          >
            Start New Game ({selectedHeroIds.length} hero{selectedHeroIds.length > 1 ? 'es' : ''})
          </button>
        )}
      </div>
    </div>
  );

  const renderCreateHero = () => (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-amber-200 text-center">Create New Hero</h2>

      {/* Name input */}
      <div>
        <label className="block text-sm text-stone-400 mb-2">Hero Name</label>
        <input
          type="text"
          value={newHeroName}
          onChange={(e) => setNewHeroName(e.target.value)}
          placeholder="Enter name..."
          className="w-full px-4 py-3 bg-stone-800 border border-stone-600 rounded-lg text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          maxLength={20}
        />
      </div>

      {/* Class selection */}
      <div>
        <label className="block text-sm text-stone-400 mb-2">Character Class</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(CHARACTERS).map(char => (
            <button
              key={char.id}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                newHeroClass === char.id
                  ? 'border-amber-500 bg-amber-900/30'
                  : 'border-stone-600 bg-stone-800/50 hover:border-stone-500'
              }`}
              onClick={() => setNewHeroClass(char.id)}
            >
              <div className="font-bold text-amber-200">{char.name}</div>
              <div className="text-xs text-stone-400">{char.special}</div>
              <div className="flex gap-1 mt-1 text-xs">
                <span className="text-red-400">S:{char.attributes.strength}</span>
                <span className="text-green-400">A:{char.attributes.agility}</span>
                <span className="text-blue-400">I:{char.attributes.intellect}</span>
                <span className="text-purple-400">W:{char.attributes.willpower}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Permadeath option */}
      <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-600">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newHeroPermadeath}
            onChange={(e) => setNewHeroPermadeath(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-stone-500 bg-stone-700 text-red-600 focus:ring-red-500 focus:ring-offset-stone-900"
          />
          <div>
            <span className="font-bold text-red-400">PERMADEATH</span>
            <p className="text-xs text-stone-400 mt-1">
              When this hero dies, they are permanently lost and will be moved to the Memorial.
              Their equipment will be returned to the stash. This cannot be undone.
            </p>
          </div>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
          onClick={() => setViewMode('list')}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-3 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateHero}
          disabled={!newHeroName.trim()}
        >
          Create Hero
        </button>
      </div>
    </div>
  );

  const renderHeroDetail = () => {
    if (!selectedHero) return null;

    const effectiveAttrs = getEffectiveAttributes(selectedHero);
    const xpProgress = getXPProgress(selectedHero);
    const equipment = getAllEquippedItems(selectedHero.equipment);
    const needsLevelUp = canLevelUp(selectedHero);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-stone-700 hover:bg-stone-600 rounded transition-colors"
            onClick={() => setViewMode('list')}
          >
            Back
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-200">{selectedHero.name}</h2>
            <p className="text-stone-400 capitalize">Level {selectedHero.level} {selectedHero.characterClass}</p>
          </div>
          {selectedHero.hasPermadeath && (
            <div className="px-3 py-1.5 bg-red-900/60 border border-red-600 text-red-300 text-sm font-bold rounded">
              PERMADEATH
            </div>
          )}
          {needsLevelUp && (
            <button
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-yellow-100 rounded-lg animate-pulse"
              onClick={() => setViewMode('levelup')}
            >
              Level Up!
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
            <h3 className="text-amber-300 font-bold mb-3">Attributes</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-400">Strength</span>
                <div className="flex items-center gap-2">
                  {renderAttributeBar(effectiveAttrs.strength, 6, 'bg-red-500')}
                  <span className="text-stone-300 w-4">{effectiveAttrs.strength}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400">Agility</span>
                <div className="flex items-center gap-2">
                  {renderAttributeBar(effectiveAttrs.agility, 6, 'bg-green-500')}
                  <span className="text-stone-300 w-4">{effectiveAttrs.agility}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Intellect</span>
                <div className="flex items-center gap-2">
                  {renderAttributeBar(effectiveAttrs.intellect, 6, 'bg-blue-500')}
                  <span className="text-stone-300 w-4">{effectiveAttrs.intellect}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400">Willpower</span>
                <div className="flex items-center gap-2">
                  {renderAttributeBar(effectiveAttrs.willpower, 6, 'bg-purple-500')}
                  <span className="text-stone-300 w-4">{effectiveAttrs.willpower}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
            <h3 className="text-amber-300 font-bold mb-3">Vitals & Resources</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">Max HP</span>
                  <span className="text-stone-300">{selectedHero.maxHp}</span>
                </div>
                <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-400">Max Sanity</span>
                  <span className="text-stone-300">{selectedHero.maxSanity}</span>
                </div>
                <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-700">
                <span className="text-yellow-400">Gold</span>
                <span className="text-yellow-200 font-bold">{selectedHero.gold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-amber-300 font-bold">Experience</h3>
            <span className="text-stone-400">
              {selectedHero.level < 5
                ? `${xpProgress.current} / ${xpProgress.needed} to Level ${selectedHero.level + 1}`
                : 'MAX LEVEL'}
            </span>
          </div>
          <div className="h-4 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Total XP: {selectedHero.currentXP}
          </div>
        </div>

        {/* Equipment */}
        <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
          <h3 className="text-amber-300 font-bold mb-3">Equipment ({equipment.length}/7)</h3>
          {equipment.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {equipment.map((item, index) => (
                <div key={index} className="p-2 bg-stone-700/50 rounded text-sm">
                  <div className="text-amber-200">{item.name}</div>
                  <div className="text-xs text-stone-400">{item.effect}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-sm">No equipment</p>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
          <h3 className="text-amber-300 font-bold mb-3">Career Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-400">Scenarios Completed</span>
              <span className="text-stone-200">{selectedHero.scenariosCompleted.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Scenarios Failed</span>
              <span className="text-stone-200">{selectedHero.scenariosFailed.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Total Kills</span>
              <span className="text-stone-200">{selectedHero.totalKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Lifetime Insight</span>
              <span className="text-stone-200">{selectedHero.totalInsightEarned}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLevelUp = () => {
    if (!selectedHero) return null;

    const options = getLevelUpOptions();

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400">Level Up!</h2>
          <p className="text-stone-400">
            {selectedHero.name} has reached Level {selectedHero.level + 1}
          </p>
          <p className="text-sm text-stone-500 mt-2">Choose a bonus:</p>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => {
            let label = '';
            let description = '';

            if (option.type === 'attribute') {
              const attrName = option.attribute.charAt(0).toUpperCase() + option.attribute.slice(1);
              label = `+1 ${attrName}`;
              description = `Increase ${attrName} attribute by 1`;
            } else if (option.type === 'maxHp') {
              label = '+2 Max HP';
              description = 'Increase maximum health by 2';
            } else if (option.type === 'maxSanity') {
              label = '+1 Max Sanity';
              description = 'Increase maximum sanity by 1';
            }

            return (
              <button
                key={index}
                className="w-full p-4 bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-yellow-500 rounded-lg text-left transition-all"
                onClick={() => handleLevelUp(selectedHero, option)}
              >
                <div className="font-bold text-yellow-300">{label}</div>
                <div className="text-sm text-stone-400">{description}</div>
              </button>
            );
          })}
        </div>

        <button
          className="w-full py-2 bg-stone-700 hover:bg-stone-600 rounded transition-colors"
          onClick={() => setViewMode('detail')}
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderMemorial = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          className="p-2 bg-stone-700 hover:bg-stone-600 rounded transition-colors"
          onClick={() => setViewMode('list')}
        >
          Back
        </button>
        <h2 className="text-2xl font-bold text-stone-400">Memorial - Fallen Heroes</h2>
      </div>

      {deadHeroes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deadHeroes.map(hero => renderDeadHeroCard(hero))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-500">
          <p className="text-lg">No fallen heroes yet.</p>
          <p className="text-sm mt-2">May they continue to survive the darkness.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-6">
      <div className="max-w-6xl mx-auto">
        {viewMode === 'list' && renderHeroList()}
        {viewMode === 'create' && renderCreateHero()}
        {viewMode === 'detail' && renderHeroDetail()}
        {viewMode === 'levelup' && renderLevelUp()}
        {viewMode === 'memorial' && renderMemorial()}
      </div>
    </div>
  );
};

export default HeroArchivePanel;
