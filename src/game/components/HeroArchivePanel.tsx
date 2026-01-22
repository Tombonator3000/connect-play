/**
 * HeroArchivePanel - UI for managing persistent heroes
 *
 * Features:
 * - View all living heroes with atmospheric Lovecraftian design
 * - Create new heroes
 * - Select heroes for scenarios
 * - View hero details (stats, level, equipment)
 * - Memorial for dead heroes
 * - Custom portrait upload
 */

import React, { useState, useMemo, useRef } from 'react';
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
import { Skull, BookOpen, Eye, Shield, Swords, Heart, Brain, Upload, Camera, X, Sparkles, Moon, Star, ChevronLeft, Plus, Archive, Crown } from 'lucide-react';

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

// Character class icons and colors
const CLASS_CONFIG: Record<CharacterType, { icon: React.ReactNode; color: string; bgGlow: string }> = {
  detective: {
    icon: <Eye className="w-6 h-6" />,
    color: 'text-blue-400',
    bgGlow: 'from-blue-900/30 to-blue-950/50'
  },
  professor: {
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-amber-400',
    bgGlow: 'from-amber-900/30 to-amber-950/50'
  },
  veteran: {
    icon: <Swords className="w-6 h-6" />,
    color: 'text-red-400',
    bgGlow: 'from-red-900/30 to-red-950/50'
  },
  occultist: {
    icon: <Moon className="w-6 h-6" />,
    color: 'text-purple-400',
    bgGlow: 'from-purple-900/30 to-purple-950/50'
  },
  journalist: {
    icon: <Sparkles className="w-6 h-6" />,
    color: 'text-cyan-400',
    bgGlow: 'from-cyan-900/30 to-cyan-950/50'
  },
  doctor: {
    icon: <Heart className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgGlow: 'from-emerald-900/30 to-emerald-950/50'
  },
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create hero form state
  const [newHeroName, setNewHeroName] = useState('');
  const [newHeroClass, setNewHeroClass] = useState<CharacterType>('detective');
  const [newHeroPortrait, setNewHeroPortrait] = useState(0);
  const [newHeroPermadeath, setNewHeroPermadeath] = useState(false);
  const [newHeroCustomPortrait, setNewHeroCustomPortrait] = useState<string | undefined>(undefined);

  const livingHeroes = useMemo(() => getLivingHeroes(legacyData), [legacyData]);
  const deadHeroes = useMemo(() => getDeadHeroes(legacyData), [legacyData]);

  const handleCreateHero = () => {
    if (!newHeroName.trim()) return;

    const hero = createLegacyHero(newHeroName.trim(), newHeroClass, newHeroPortrait, newHeroPermadeath);
    // Add custom portrait if uploaded
    if (newHeroCustomPortrait) {
      hero.customPortraitUrl = newHeroCustomPortrait;
    }
    onCreateHero(hero);
    setNewHeroName('');
    setNewHeroPermadeath(false);
    setNewHeroCustomPortrait(undefined);
    setViewMode('list');
  };

  const handleSelectHero = (hero: LegacyHero) => {
    if (selectedHeroIds.includes(hero.id)) {
      onSelectHero(hero);
      return;
    }
    if (selectedHeroIds.length >= maxHeroesSelectable) return;
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

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, forCreate: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (forCreate) {
        setNewHeroCustomPortrait(dataUrl);
      } else if (selectedHero) {
        const updatedHero = { ...selectedHero, customPortraitUrl: dataUrl };
        onUpdateHero(updatedHero);
        setSelectedHero(updatedHero);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveCustomPortrait = () => {
    if (selectedHero) {
      const updatedHero = { ...selectedHero, customPortraitUrl: undefined };
      onUpdateHero(updatedHero);
      setSelectedHero(updatedHero);
    }
  };

  const renderAttributeBar = (value: number, max: number = 5, color: string) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < value
              ? `${color} shadow-lg shadow-current/50`
              : 'bg-stone-800 border border-stone-700'
          }`}
        />
      ))}
    </div>
  );

  // Render hero portrait with fallback
  const renderHeroPortrait = (hero: LegacyHero, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-24 h-24'
    };

    const config = CLASS_CONFIG[hero.characterClass];

    if (hero.customPortraitUrl) {
      return (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-amber-700/50 shadow-lg`}>
          <img
            src={hero.customPortraitUrl}
            alt={hero.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${config.bgGlow} border-2 border-amber-700/30 flex items-center justify-center shadow-lg`}>
        <span className={config.color}>
          {React.cloneElement(config.icon as React.ReactElement, {
            className: size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6'
          })}
        </span>
      </div>
    );
  };

  const renderHeroCard = (hero: LegacyHero, isSelected: boolean) => {
    const effectiveAttrs = getEffectiveAttributes(hero);
    const xpProgress = getXPProgress(hero);
    const equipment = getAllEquippedItems(hero.equipment);
    const needsLevelUp = canLevelUp(hero);
    const config = CLASS_CONFIG[hero.characterClass];

    return (
      <div
        key={hero.id}
        className={`
          relative group cursor-pointer transition-all duration-300
          ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
        `}
        onClick={() => handleViewDetail(hero)}
      >
        {/* Outer glow effect */}
        <div className={`
          absolute -inset-1 rounded-xl opacity-0 transition-opacity duration-300
          ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}
          bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30
          blur-md
        `} />

        {/* Card container */}
        <div className={`
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950
          border transition-all duration-300
          ${isSelected
            ? 'border-amber-500/70 shadow-lg shadow-amber-900/30'
            : 'border-stone-700/50 hover:border-amber-700/50'
          }
          ${needsLevelUp ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-stone-950' : ''}
        `}>
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

          {/* Level badge */}
          <div className="absolute -top-3 -right-3 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-full" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 border-2 border-amber-400/50 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-amber-100 font-display">{hero.level}</span>
              </div>
            </div>
          </div>

          {/* Level up indicator */}
          {needsLevelUp && (
            <div className="absolute -top-1 left-4 z-10">
              <div className="px-2 py-1 bg-gradient-to-r from-yellow-600 to-amber-600 text-yellow-100 text-xs font-bold rounded-b-lg shadow-lg animate-pulse flex items-center gap-1">
                <Crown className="w-3 h-3" />
                LEVEL UP
              </div>
            </div>
          )}

          {/* Permadeath indicator */}
          {hero.hasPermadeath && (
            <div className="absolute top-3 right-14 z-10">
              <div className="px-2 py-0.5 bg-red-950/90 border border-red-700/50 text-red-400 text-xs font-bold rounded flex items-center gap-1" title="Permadeath enabled">
                <Skull className="w-3 h-3" />
                PERMADEATH
              </div>
            </div>
          )}

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              {renderHeroPortrait(hero, 'md')}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-amber-200 truncate">{hero.name}</h3>
                <p className={`text-sm ${config.color} capitalize flex items-center gap-1.5`}>
                  {config.icon}
                  {hero.characterClass}
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 bg-stone-800/30 rounded-lg px-3 py-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-red-400 font-medium">HP:</span>
                <span className="text-stone-300 ml-auto">{hero.maxHp}</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/30 rounded-lg px-3 py-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-purple-400 font-medium">SAN:</span>
                <span className="text-stone-300 ml-auto">{hero.maxSanity}</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/30 rounded-lg px-3 py-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400 font-medium">Gold:</span>
                <span className="text-stone-300 ml-auto">{hero.gold}</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/30 rounded-lg px-3 py-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-blue-400 font-medium">Items:</span>
                <span className="text-stone-300 ml-auto">{equipment.length}/7</span>
              </div>
            </div>

            {/* XP bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                <span className="uppercase tracking-wider">Experience</span>
                <span>{hero.level < 5 ? `${xpProgress.current}/${xpProgress.needed}` : 'MAX'}</span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${xpProgress.percent}%` }}
                />
              </div>
            </div>

            {/* Attributes mini */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-stone-800/20 rounded">
                <span className="text-red-400 font-medium uppercase tracking-wide">Str</span>
                {renderAttributeBar(effectiveAttrs.strength, 5, 'bg-red-500')}
              </div>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-stone-800/20 rounded">
                <span className="text-green-400 font-medium uppercase tracking-wide">Agi</span>
                {renderAttributeBar(effectiveAttrs.agility, 5, 'bg-green-500')}
              </div>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-stone-800/20 rounded">
                <span className="text-blue-400 font-medium uppercase tracking-wide">Int</span>
                {renderAttributeBar(effectiveAttrs.intellect, 5, 'bg-blue-500')}
              </div>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-stone-800/20 rounded">
                <span className="text-purple-400 font-medium uppercase tracking-wide">Wil</span>
                {renderAttributeBar(effectiveAttrs.willpower, 5, 'bg-purple-500')}
              </div>
            </div>

            {/* Selection button */}
            <div className="mt-4">
              {!isSelected && selectedHeroIds.length < maxHeroesSelectable && (
                <button
                  className="w-full py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-amber-100 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-amber-900/30"
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
                  className="w-full py-2.5 text-amber-400 border-2 border-amber-500/50 rounded-lg hover:bg-amber-900/30 hover:border-amber-400 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHero(hero);
                  }}
                >
                  <span className="text-green-400">✓</span> Selected (click to remove)
                </button>
              )}
            </div>
          </div>

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
        </div>
      </div>
    );
  };

  const renderDeadHeroCard = (hero: LegacyHero) => {
    return (
      <div
        key={hero.id}
        className={`relative overflow-hidden rounded-xl ${hero.hasPermadeath ? 'bg-gradient-to-br from-red-950/50 via-stone-900/90 to-stone-950' : 'bg-gradient-to-br from-stone-900/50 via-stone-900/90 to-stone-950'} border ${hero.hasPermadeath ? 'border-red-900/50' : 'border-stone-700/30'} opacity-80`}
      >
        {/* Deceased overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-stone-800/80 border-2 border-stone-600/50 flex items-center justify-center grayscale">
              <Skull className="w-6 h-6 text-stone-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-stone-400 line-through truncate">{hero.name}</h3>
              <p className="text-sm text-stone-500 capitalize">{hero.characterClass}</p>
            </div>
            {hero.hasPermadeath && (
              <div className="px-2 py-0.5 bg-red-900/60 border border-red-700/50 text-red-400 text-xs font-bold rounded">
                PERMADEATH
              </div>
            )}
          </div>
          <div className="text-xs text-stone-500 space-y-1">
            <p>Level {hero.level} - {hero.totalKills} kills</p>
            <p className="italic text-stone-600">"{hero.deathCause || 'Lost to the darkness'}"</p>
            {hero.deathScenario && (
              <p className="text-stone-600">Scenario: {hero.deathScenario}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHeroList = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400">
            Hero Archive
          </h2>
          <p className="text-stone-500 text-sm mt-1">Manage your investigators and prepare for the darkness</p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 hover:border-stone-500 rounded-lg transition-all duration-300 flex items-center gap-2 text-stone-300"
            onClick={() => setViewMode('memorial')}
          >
            <Archive className="w-4 h-4" />
            Memorial ({deadHeroes.length})
          </button>
          <button
            className="px-4 py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-amber-100 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium shadow-lg shadow-amber-900/20"
            onClick={() => setViewMode('create')}
          >
            <Plus className="w-4 h-4" />
            New Hero
          </button>
        </div>
      </div>

      {/* Living heroes grid */}
      {livingHeroes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {livingHeroes.map(hero => renderHeroCard(hero, selectedHeroIds.includes(hero.id)))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-amber-700/30 flex items-center justify-center">
              <Eye className="w-10 h-10 text-amber-600/60" />
            </div>
          </div>
          <div>
            <p className="text-lg text-stone-400 mb-2">No heroes yet.</p>
            <p className="text-stone-500 text-sm">Create your first investigator to begin.</p>
          </div>
          <button
            className="px-8 py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-amber-100 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-amber-900/30"
            onClick={() => setViewMode('create')}
          >
            Create Your First Hero
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-6 border-t border-stone-800">
        <button
          className="px-6 py-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 rounded-lg transition-all duration-300 text-stone-300 flex items-center gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Menu
        </button>
        {selectedHeroIds.length > 0 && onStartNewGame && (
          <button
            className="px-8 py-2.5 bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 hover:from-green-600 hover:via-emerald-500 hover:to-green-600 text-green-100 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-green-900/30 flex items-center gap-2"
            onClick={onStartNewGame}
          >
            <Swords className="w-5 h-5" />
            Start Mission ({selectedHeroIds.length} hero{selectedHeroIds.length > 1 ? 'es' : ''})
          </button>
        )}
      </div>
    </div>
  );

  const renderCreateHero = () => (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400">
          Create New Hero
        </h2>
        <p className="text-stone-500 text-sm mt-1">A new soul enters the investigation</p>
      </div>

      <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-6 space-y-6">
        {/* Portrait preview and upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            {newHeroCustomPortrait ? (
              <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-600/50 shadow-lg shadow-amber-900/20">
                <img
                  src={newHeroCustomPortrait}
                  alt="Hero portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-28 h-28 rounded-xl bg-gradient-to-br ${CLASS_CONFIG[newHeroClass].bgGlow} border-2 border-amber-700/30 flex items-center justify-center shadow-lg`}>
                <span className={CLASS_CONFIG[newHeroClass].color}>
                  {React.cloneElement(CLASS_CONFIG[newHeroClass].icon as React.ReactElement, {
                    className: 'w-12 h-12'
                  })}
                </span>
              </div>
            )}

            {/* Upload overlay */}
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-xs text-white">Upload Photo</span>
            </div>

            {/* Remove button */}
            {newHeroCustomPortrait && (
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewHeroCustomPortrait(undefined);
                }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, true)}
          />

          <button
            className="px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-700/50 hover:border-amber-600 rounded-lg transition-all flex items-center gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3" />
            {newHeroCustomPortrait ? 'Change Portrait' : 'Upload Custom Portrait'}
          </button>
        </div>

        {/* Name input */}
        <div>
          <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Hero Name</label>
          <input
            type="text"
            value={newHeroName}
            onChange={(e) => setNewHeroName(e.target.value)}
            placeholder="Enter name..."
            className="w-full px-4 py-3 bg-stone-800/50 border border-stone-600/50 rounded-lg text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all"
            maxLength={20}
          />
        </div>

        {/* Class selection */}
        <div>
          <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Character Class</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(CHARACTERS).map(char => {
              const config = CLASS_CONFIG[char.id];
              return (
                <button
                  key={char.id}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden ${
                    newHeroClass === char.id
                      ? 'border-amber-500/70 bg-gradient-to-br from-amber-900/30 to-stone-900'
                      : 'border-stone-600/50 bg-stone-800/30 hover:border-stone-500'
                  }`}
                  onClick={() => setNewHeroClass(char.id)}
                >
                  {newHeroClass === char.id && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={config.color}>{config.icon}</span>
                    <span className="font-display font-bold text-amber-200">{char.name}</span>
                  </div>
                  <div className="text-xs text-stone-400 mb-2">{char.special}</div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-red-400">S:{char.attributes.strength}</span>
                    <span className="text-green-400">A:{char.attributes.agility}</span>
                    <span className="text-blue-400">I:{char.attributes.intellect}</span>
                    <span className="text-purple-400">W:{char.attributes.willpower}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permadeath option */}
        <div className="p-4 bg-gradient-to-br from-red-950/30 to-stone-900/50 rounded-xl border border-red-900/30">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newHeroPermadeath}
              onChange={(e) => setNewHeroPermadeath(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-red-700 bg-stone-800 text-red-600 focus:ring-red-500 focus:ring-offset-stone-900"
            />
            <div>
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-500" />
                <span className="font-bold text-red-400">PERMADEATH MODE</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                When this hero dies, they are permanently lost and will be moved to the Memorial.
                Their equipment will be returned to the stash. This cannot be undone.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 py-3 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 rounded-lg transition-all duration-300 text-stone-300"
          onClick={() => {
            setViewMode('list');
            setNewHeroCustomPortrait(undefined);
          }}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-amber-100 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-700"
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
    const config = CLASS_CONFIG[selectedHero.characterClass];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            className="p-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 rounded-lg transition-all duration-300"
            onClick={() => setViewMode('list')}
          >
            <ChevronLeft className="w-5 h-5 text-stone-300" />
          </button>

          {/* Portrait with upload */}
          <div className="relative group">
            {renderHeroPortrait(selectedHero, 'lg')}
            <input
              type="file"
              id="heroDetailPortrait"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, false)}
            />
            <label
              htmlFor="heroDetailPortrait"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col items-center justify-center cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-xs text-white">{selectedHero.customPortraitUrl ? 'Change' : 'Upload'}</span>
            </label>
            {selectedHero.customPortraitUrl && (
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemoveCustomPortrait}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-amber-200">{selectedHero.name}</h2>
            <p className={`${config.color} capitalize flex items-center gap-2`}>
              {config.icon}
              Level {selectedHero.level} {selectedHero.characterClass}
            </p>
          </div>

          {selectedHero.hasPermadeath && (
            <div className="px-3 py-1.5 bg-red-950/80 border border-red-700/50 text-red-400 text-sm font-bold rounded-lg flex items-center gap-2">
              <Skull className="w-4 h-4" />
              PERMADEATH
            </div>
          )}
          {needsLevelUp && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-yellow-100 rounded-lg animate-pulse font-medium flex items-center gap-2"
              onClick={() => setViewMode('levelup')}
            >
              <Crown className="w-4 h-4" />
              Level Up!
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attributes */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-5">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
            <h3 className="font-display text-amber-300 font-bold mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Attributes
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-red-400">Strength</span>
                <div className="flex items-center gap-3">
                  {renderAttributeBar(effectiveAttrs.strength, 6, 'bg-red-500')}
                  <span className="text-stone-300 w-4 text-right">{effectiveAttrs.strength}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400">Agility</span>
                <div className="flex items-center gap-3">
                  {renderAttributeBar(effectiveAttrs.agility, 6, 'bg-green-500')}
                  <span className="text-stone-300 w-4 text-right">{effectiveAttrs.agility}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Intellect</span>
                <div className="flex items-center gap-3">
                  {renderAttributeBar(effectiveAttrs.intellect, 6, 'bg-blue-500')}
                  <span className="text-stone-300 w-4 text-right">{effectiveAttrs.intellect}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400">Willpower</span>
                <div className="flex items-center gap-3">
                  {renderAttributeBar(effectiveAttrs.willpower, 6, 'bg-purple-500')}
                  <span className="text-stone-300 w-4 text-right">{effectiveAttrs.willpower}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals & Resources */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-5">
            <h3 className="font-display text-amber-300 font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Vitals & Resources
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-red-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    Max HP
                  </span>
                  <span className="text-stone-300">{selectedHero.maxHp}</span>
                </div>
                <div className="h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
                  <div className="h-full bg-gradient-to-r from-red-700 via-red-600 to-red-500" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    Max Sanity
                  </span>
                  <span className="text-stone-300">{selectedHero.maxSanity}</span>
                </div>
                <div className="h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
                  <div className="h-full bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-700/50">
                <span className="text-yellow-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4" />
                  Gold
                </span>
                <span className="text-yellow-200 font-bold text-lg">{selectedHero.gold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-amber-300 font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Experience
            </h3>
            <span className="text-stone-400 text-sm">
              {selectedHero.level < 5
                ? `${xpProgress.current} / ${xpProgress.needed} to Level ${selectedHero.level + 1}`
                : 'MAX LEVEL'}
            </span>
          </div>
          <div className="h-4 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 transition-all duration-500"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Total XP: {selectedHero.currentXP}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-5">
          <h3 className="font-display text-amber-300 font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Equipment ({equipment.length}/7)
          </h3>
          {equipment.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {equipment.map((item, index) => (
                <div key={index} className="p-3 bg-stone-800/50 rounded-lg border border-stone-700/30">
                  <div className="text-amber-200 font-medium">{item.name}</div>
                  <div className="text-xs text-stone-400 mt-1">{item.effect}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-sm italic">No equipment</p>
          )}
        </div>

        {/* Career Stats */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 rounded-xl border border-stone-700/50 p-5">
          <h3 className="font-display text-amber-300 font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Career Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-stone-800/30 rounded-lg">
              <span className="text-stone-400">Scenarios Completed</span>
              <span className="text-stone-200 font-medium">{selectedHero.scenariosCompleted.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-stone-800/30 rounded-lg">
              <span className="text-stone-400">Scenarios Failed</span>
              <span className="text-stone-200 font-medium">{selectedHero.scenariosFailed.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-stone-800/30 rounded-lg">
              <span className="text-stone-400">Total Kills</span>
              <span className="text-stone-200 font-medium">{selectedHero.totalKills}</span>
            </div>
            <div className="flex justify-between p-3 bg-stone-800/30 rounded-lg">
              <span className="text-stone-400">Lifetime Insight</span>
              <span className="text-stone-200 font-medium">{selectedHero.totalInsightEarned}</span>
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
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-amber-700 border-2 border-yellow-400/50 flex items-center justify-center">
              <Crown className="w-10 h-10 text-yellow-200" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400">
            Level Up!
          </h2>
          <p className="text-stone-400 mt-1">
            {selectedHero.name} has reached Level {selectedHero.level + 1}
          </p>
          <p className="text-sm text-stone-500 mt-2">Choose your reward:</p>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => {
            let label = '';
            let description = '';
            let icon = <Sparkles className="w-5 h-5" />;
            let color = 'text-amber-400';

            if (option.type === 'attribute') {
              const attrName = option.attribute.charAt(0).toUpperCase() + option.attribute.slice(1);
              label = `+1 ${attrName}`;
              description = `Increase ${attrName} attribute by 1`;
              if (option.attribute === 'strength') { icon = <Swords className="w-5 h-5" />; color = 'text-red-400'; }
              if (option.attribute === 'agility') { icon = <Sparkles className="w-5 h-5" />; color = 'text-green-400'; }
              if (option.attribute === 'intellect') { icon = <BookOpen className="w-5 h-5" />; color = 'text-blue-400'; }
              if (option.attribute === 'willpower') { icon = <Brain className="w-5 h-5" />; color = 'text-purple-400'; }
            } else if (option.type === 'maxHp') {
              label = '+2 Max HP';
              description = 'Increase maximum health by 2';
              icon = <Heart className="w-5 h-5" />;
              color = 'text-red-400';
            } else if (option.type === 'maxSanity') {
              label = '+1 Max Sanity';
              description = 'Increase maximum sanity by 1';
              icon = <Brain className="w-5 h-5" />;
              color = 'text-purple-400';
            }

            return (
              <button
                key={index}
                className="w-full p-4 bg-gradient-to-br from-stone-900 to-stone-950 hover:from-stone-800 hover:to-stone-900 border border-stone-600/50 hover:border-yellow-500/50 rounded-xl text-left transition-all duration-300 group"
                onClick={() => handleLevelUp(selectedHero, option)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-yellow-300">{label}</div>
                    <div className="text-sm text-stone-400">{description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          className="w-full py-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 rounded-lg transition-all duration-300 text-stone-400"
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
          className="p-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 rounded-lg transition-all duration-300"
          onClick={() => setViewMode('list')}
        >
          <ChevronLeft className="w-5 h-5 text-stone-300" />
        </button>
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-400 flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Memorial - Fallen Heroes
          </h2>
          <p className="text-stone-500 text-sm mt-1">Those who gave all in the fight against darkness</p>
        </div>
      </div>

      {deadHeroes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deadHeroes.map(hero => renderDeadHeroCard(hero))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-stone-800/50 border border-stone-700/50 flex items-center justify-center">
            <Skull className="w-10 h-10 text-stone-600" />
          </div>
          <p className="text-lg text-stone-500">No fallen heroes yet.</p>
          <p className="text-sm text-stone-600">May they continue to survive the darkness.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-stone-200 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
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
